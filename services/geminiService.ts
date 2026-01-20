
import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, MetaData, ControlSettings } from '../types';
import { compressImage } from '../utils/fileUtils';

// Adobe Stock OFFICIAL Categories
export const ADOBE_CATEGORIES = [
  "Animals", 
  "Buildings and Architecture", 
  "Business", 
  "Drinks", 
  "The Environment", 
  "States of Mind", 
  "Food", 
  "Graphic Resources", 
  "Hobbies and Leisure", 
  "Industry", 
  "Landscapes", 
  "Lifestyle", 
  "People", 
  "Plants and Flowers", 
  "Culture and Religion", 
  "Science", 
  "Social Issues", 
  "Sports", 
  "Technology", 
  "Transport", 
  "Travel"
];

const metadataSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A concise and descriptive title for the file content.'
    },
    keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'A list of relevant keywords sorted by visual importance.'
    },
    category: {
      type: Type.STRING,
      description: 'The most suitable category from the provided list.',
      enum: ADOBE_CATEGORIES
    }
  },
  required: ['title', 'keywords', 'category']
};

const PROMPT_TEMPLATE = (settings: ControlSettings, type: string) => {
    const isTransparent = settings.contentType === 'transparent';
    const isAdobe = settings.marketplace === 'adobe';

    const titleStyleRule = isAdobe
        ? "STYLE: Headline style (Concise). DO NOT end with a period/full stop."
        : "STYLE: Full descriptive sentence. MUST end with a period/full stop.";
    
    return `
Analyze this ${type} for stock photography metadata.
Target Marketplace Rules: ${settings.marketplace}
Content Mode: ${isTransparent ? "ISOLATED OBJECT ON TRANSPARENT BACKGROUND" : "STANDARD PHOTO"}

CRITICAL LEGAL RESTRICTIONS:
1. NO TRADEMARKS/BRANDS.
2. NO REAL NAMES of people.
3. GENERIC DESCRIPTIONS focusing on visual content.

MASTER TITLE STRUCTURE (SEO Optimized):
${titleStyleRule}
1. [MAIN SUBJECT] + [ACTION] (First 70 chars)
2. [CONTEXT] + [TECHNICAL DETAILS]
Target Length: ~${settings.titleLength} characters.

KEYWORD SORTING STRATEGY:
1. **Keywords 1-5**: Main Subject, Object, Action. (MANDATORY).
2. **Keywords 6-15**: Secondary objects, environment.
3. **Keywords 16-30**: Concepts, emotions, vibe.
4. **Keywords 30+**: Technical terms.

CATEGORY SELECTION:
Select ONE from: ${ADOBE_CATEGORIES.join(", ")}

${isTransparent ? `
TRANSPARENT RULES:
1. Title must include "isolated on transparent background".
2. Keywords MUST include: "transparent", "background", "isolated".
` : `
STANDARD PHOTO RULES:
1. Focus on composition, lighting, and subject action.
`}

Requirements:
1. Title: ~${settings.titleLength} chars.
2. Keywords: Exactly ${settings.keywordsCount} keywords.
3. Category: Choose from list.
4. Output JSON ONLY.
`;
};

async function callGroq(file: UploadedFile, settings: ControlSettings): Promise<MetaData> {
  if (!settings.groqKey) throw new Error("Please provide a Groq API Key in settings.");

  let processedBase64 = file.base64;
  let processedMimeType = file.mimeType;

  if (file.mimeType.startsWith('image/')) {
      try {
          const compressed = await compressImage(file.file, 1024, 0.7);
          processedBase64 = compressed.base64;
          processedMimeType = compressed.mimeType;
      } catch (err) {
          console.warn("Image compression failed, falling back to original:", err);
      }
  }

  const prompt = PROMPT_TEMPLATE(settings, file.mimeType.startsWith('video') ? 'video frame' : 'image');
  
  // --- CRITICAL FIX: FORCE VALID MODEL ---
  // Even if settings has an old model, we override it here to prevent API errors.
  const validModels = ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'];
  let modelToUse = settings.groqModel;
  
  if (!validModels.includes(modelToUse)) {
      console.warn(`Invalid/Legacy model detected (${modelToUse}). Auto-switching to Llama 3.2 11B.`);
      modelToUse = "llama-3.2-11b-vision-preview";
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.groqKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${processedMimeType};base64,${processedBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    const msg = errData.error?.message || response.statusText;
    
    // Fallback logic if the specific model fails
    if (msg.toLowerCase().includes("decommissioned") || msg.toLowerCase().includes("not found")) {
      throw new Error(`Model Error: Please open Settings and re-select "Llama 3.2 11B".`);
    }
    throw new Error(`Groq API Error: ${msg}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  try {
    const parsed = JSON.parse(content);
    return sanitizeMetadata(parsed, settings);
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return sanitizeMetadata(JSON.parse(jsonMatch[0]), settings);
    throw new Error("Failed to parse AI response as JSON.");
  }
}

const sanitizeMetadata = (metadata: MetaData, settings: ControlSettings): MetaData => {
    let title = metadata.title || "";
    if (title) {
        title = title.trim();
        if (settings.marketplace === 'adobe') {
            if (title.endsWith('.')) title = title.slice(0, -1);
        } else {
            if (!title.endsWith('.')) title = title + '.';
        }
    }
    return { ...metadata, title };
};

export const extractMetadataStream = async (
  file: UploadedFile,
  settings: ControlSettings,
  onChunk: (partial: Partial<MetaData>) => void
): Promise<MetaData> => {
  if (settings.provider === 'groq') {
    return await callGroq(file, settings);
  }

  // --- GOOGLE GEMINI LOGIC ---
  if (!settings.googleKey) {
      throw new Error("Missing Gemini API Key. Please enter it in the header.");
  }

  const ai = new GoogleGenAI({ apiKey: settings.googleKey });
  
  // Use Gemini 2.0 Flash (Experimental) for best speed/vision performance currently
  const model = 'gemini-2.0-flash-exp'; 
  
  const imagePart = {
    inlineData: {
      data: file.base64,
      mimeType: file.mimeType,
    },
  };

  const textPart = {
    text: PROMPT_TEMPLATE(settings, file.mimeType.startsWith('video') ? 'video frame' : 'image'),
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: metadataSchema
      },
    });

    onChunk({ title: "Analyzing..." });
    
    const textResponse = response.text;
    if (!textResponse) {
        throw new Error("No response received from Gemini.");
    }
    
    const finalMetadata: MetaData = JSON.parse(textResponse.trim());
    return sanitizeMetadata(finalMetadata, settings);

  } catch (error: any) {
    console.error("Error extracting metadata:", error);
    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) throw new Error("Content blocked due to safety policies.");
      if (error.message.includes('429')) throw new Error("Rate Limit (Busy). Please try again.");
      if (error.message.includes('API key') || error.message.includes('403')) throw new Error("Invalid Gemini API Key.");
      throw new Error(`Failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred.");
  }
};
