
import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, MetaData, ControlSettings } from '../types';
import { compressImage } from '../utils/fileUtils';

// Adobe Stock OFFICIAL Categories (Updated based on user screenshots)
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

    // Punctuation and Style Rules based on Marketplace
    const titleStyleRule = isAdobe
        ? "STYLE: Headline style (Concise). DO NOT end with a period/full stop."
        : "STYLE: Full descriptive sentence. MUST end with a period/full stop.";
    
    return `
Analyze this ${type} for stock photography metadata.
Target Marketplace Rules: ${settings.marketplace}
Content Mode: ${isTransparent ? "ISOLATED OBJECT ON TRANSPARENT BACKGROUND" : "STANDARD PHOTO"}

CRITICAL LEGAL RESTRICTIONS (To avoid IP Rejection):
1. NO TRADEMARKS/BRANDS: Do NOT include brand names, logos, or company names.
2. NO REAL NAMES: Do not include names of real people or celebrities.
3. GENERIC DESCRIPTIONS: Focus on the visual content, concept, emotions, and lighting.

MASTER TITLE STRUCTURE (SEO Optimized):
Write a natural, flowing English string.
${titleStyleRule}
1. [MAIN SUBJECT] + [ACTION] (First 70 chars - SEO Hot Zone)
2. [CONTEXT] + [TECHNICAL DETAILS] (Remaining chars)
Target Length: approx ${settings.titleLength} characters.

KEYWORD SORTING STRATEGY (THE "TOP 5" RULE - CRITICAL):
Adobe Stock and Freepik prioritize the first 5 keywords heavily. Order matters!
1. **Keywords 1-5 (THE MONEY ZONE)**: MUST be the Main Subject, The Literal Object, and The Main Action. (e.g., "Dog", "Running", "Beach", "Pet", "Animal"). NO abstract concepts here.
2. **Keywords 6-15**: Secondary objects, environment, and specific details (e.g., "Sand", "Sunny", "Blue Sky", "Collar").
3. **Keywords 16-30**: Concepts, emotions, and vibe (e.g., "Happiness", "Freedom", "Summer", "Vitality").
4. **Keywords 30+**: Technical terms (e.g., "Copy Space", "No People", "Horizontal").

CATEGORY SELECTION:
Select exactly ONE category from this list that best fits the image:
${ADOBE_CATEGORIES.join(", ")}

${isTransparent ? `
TRANSPARENT BACKGROUND SPECIFIC RULES:
1. Title MUST start with the object name and include "isolated on transparent background".
2. Keywords MUST include: "transparent", "background", "isolated", "cutout", "png", "no background", "clipart".
3. **MANDATORY**: "transparent", "isolated", "background" MUST be in the Top 5 keywords.
` : `
STANDARD PHOTO RULES:
1. Focus on composition, lighting, environment, and subject action.
2. Keywords should cover emotions, setting, and conceptual meanings.
`}

Requirements:
1. Title: Descriptive "Master Title" (~${settings.titleLength} chars).
2. Keywords: Exactly ${settings.keywordsCount} keywords, SORTED STRICTLY by importance.
3. Category: Choose from the list.

IMPORTANT: You must return ONLY a valid JSON object following this schema:
{ "title": "...", "keywords": ["...", "..."], "category": "..." }
`;
};

async function callGroq(file: UploadedFile, settings: ControlSettings): Promise<MetaData> {
  if (!settings.groqKey) throw new Error("Please provide a Groq API Key in settings.");

  // Resize/Compress image for Groq to prevent "Entity Too Large" errors
  // Groq/Llama Vision works best with images < 4MB and standard resolutions (e.g. 1024px)
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
  const modelToUse = settings.groqModel || "llama-3.2-11b-vision-preview";

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
    if (msg.toLowerCase().includes("decommissioned")) {
      throw new Error(`The selected model is no longer active. Please switch to "Llama 3.2 11B" in the header.`);
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

// Helper to enforce punctuation rules strictly after AI generation
const sanitizeMetadata = (metadata: MetaData, settings: ControlSettings): MetaData => {
    let title = metadata.title || "";
    
    if (title) {
        title = title.trim();
        if (settings.marketplace === 'adobe') {
            // Adobe: No period at the end (Headline style)
            if (title.endsWith('.')) {
                title = title.slice(0, -1);
            }
        } else {
            // Freepik: Must have period at the end (Sentence style)
            if (!title.endsWith('.')) {
                title = title + '.';
            }
        }
    }

    return {
        ...metadata,
        title
    };
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
  // Using the Flash model which is faster and more cost-effective for high volume
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
    const finalMetadata: MetaData = JSON.parse(response.text.trim());
    
    // Apply final sanitization (Punctuation fix)
    return sanitizeMetadata(finalMetadata, settings);

  } catch (error: any) {
    console.error("Error extracting metadata:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) {
        throw new Error("Content blocked due to safety policies.");
      }
      if (error.message.includes('429') || error.message.includes('exhausted')) {
          throw new Error("Rate Limit (Busy). Please try again or use a paid key.");
      }
      if (error.message.includes('API key') || error.message.includes('403')) {
          throw new Error("Invalid API Key. Please check the key in header.");
      }
      throw new Error(`Failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred.");
  }
};
