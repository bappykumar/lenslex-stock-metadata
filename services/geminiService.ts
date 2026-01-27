
import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, MetaData, ControlSettings } from '../types';

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

// Comprehensive list of brands/trademarks to scrub
const FORBIDDEN_WORDS = [
    // Tech & Social
    'Apple', 'iPhone', 'iPad', 'MacBook', 'iMac', 'AirPods', 'Siri', 'iOS',
    'Samsung', 'Galaxy', 'Android', 'Google', 'Pixel', 'Microsoft', 'Windows', 
    'Facebook', 'Instagram', 'Twitter', 'X.com', 'TikTok', 'YouTube', 'WhatsApp', 'LinkedIn', 'Snapchat', 'Pinterest',
    'Amazon', 'Alexa', 'Netflix', 'Spotify', 'Uber', 'Tesla', 'Zoom', 'Skype',
    
    // Fashion & Luxury
    'Nike', 'Adidas', 'Puma', 'Reebok', 'Gucci', 'Prada', 'Chanel', 'Louis Vuitton', 'Hermes', 'Rolex', 'Ray-Ban',
    
    // Cars
    'BMW', 'Mercedes', 'Audi', 'Ferrari', 'Lamborghini', 'Porsche', 'Toyota', 'Honda', 'Ford', 'Jeep',
    
    // Food & Drink
    'Coca-Cola', 'Coke', 'Pepsi', 'McDonalds', 'Starbucks', 'Burger King', 'KFC', 'Nutella', 'Oreo',
    
    // Entertainment & Characters
    'Disney', 'Marvel', 'DC Comics', 'Spiderman', 'Batman', 'Superman', 'Joker', 'Harry Potter', 
    'Star Wars', 'Mickey Mouse', 'Barbie', 'Lego', 'Nintendo', 'PlayStation', 'Xbox', 'Pokemon',
    
    // Misc
    'Polaroid', 'GoPro', 'Drone', 'Bitcoin', 'Ethereum' // Crypto names are sometimes flagged depending on context, safer to genericize
];

const metadataSchema = {
  type: Type.OBJECT,
  properties: {
    adobe_title: {
      type: Type.STRING,
      description: 'Descriptive title for Adobe Stock.'
    },
    freepik_title: {
      type: Type.STRING,
      description: 'Concise title for Freepik.'
    },
    keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'List of keywords.'
    },
    category: {
      type: Type.STRING,
      description: 'Selected category.',
      enum: ADOBE_CATEGORIES
    }
  },
  required: ['adobe_title', 'freepik_title', 'keywords', 'category']
};

const PROMPT_TEMPLATE = (settings: ControlSettings, type: string) => {
    const isTransparent = settings.contentType === 'transparent';
    const suffixLen = isTransparent ? 35 : 0; // Length of " isolated on transparent background"
    
    // Calculate EXACT character limits for the AI to generate
    const adobeGenLimit = Math.max(10, settings.adobeTitleLength - suffixLen);
    const freepikGenLimit = Math.max(10, settings.freepikTitleLength - suffixLen);

    return `
You are a Senior Stock Photography Metadata Expert.
Analyze this ${type} and generate metadata optimized for high sales on Adobe Stock and Freepik.

---
### 1. INTELLECTUAL PROPERTY & BRAND SAFETY (CRITICAL)
**ZERO TOLERANCE FOR BRANDS.** If you see a logo or design, you MUST genericize it.
*   **Tech:** Use "Smartphone" (NOT iPhone), "Laptop" (NOT MacBook).
*   **Social:** Use "Social Media app" (NOT Instagram/Facebook).
*   **Shoes:** Use "Sneakers" (NOT Nike).
*   **Characters:** Use "Superhero" (NOT Spiderman).

---
### 2. IMAGE ANALYSIS & STRATEGY
**Detected Mode:** ${isTransparent ? 'TRANSPARENT BACKGROUND (PNG/Element)' : 'FULL PHOTOGRAPH (JPG/Background Included)'}

${isTransparent ? `
**STRATEGY FOR TRANSPARENT IMAGES:**
*   **Focus:** The Object itself, its material, pose, and utility as a design element.
*   **Forbidden in Title:** Do NOT describe a background (e.g., "in a room"). Do NOT use words like "PNG", "Cutout", "Clipart", "Sticker" in the title string.
*   **Required Keywords:** "Cutout", "Isolated", "Transparent", "PNG", "Element", "Object", "Clipart", "No background".
` : `
**STRATEGY FOR PHOTOS:**
*   **Focus:** Storytelling, Context, Lighting, and Environment.
*   **Required:** Describe WHERE the subject is (Indoors, Outdoors, Office, Park) and the MOOD (Happy, Serious, Sunny, Dark).
`}

---
### 3. TITLING RULES (STRICT CHARACTER LIMITS)
Do NOT start with "A photo of", "Image of", "3D render of". Start directly with the subject.

**A. ADOBE STOCK TITLE:**
*   **Max Length:** You must write exactly between ${adobeGenLimit - 10} and ${adobeGenLimit} characters.
*   **Suffix:** Do NOT add the suffix yourself, I will add it. Just write the description.
${isTransparent ? `*   **Structure:** [Main Subject] + [Pose/State] + [Angle/View]. (Example: "Red apple with green leaf fresh fruit")` : `*   **Structure:** [Main Subject] + [Action] + [Context/Environment] + [Mood/Lighting].`}

**B. FREEPIK TITLE:**
*   **Max Length:** You must write exactly between ${freepikGenLimit - 10} and ${freepikGenLimit} characters.
*   **Suffix:** Do NOT add the suffix yourself, I will add it.
*   **Style:** Concise, keyword-heavy.

---
### 4. KEYWORD HIERARCHY (STRICT COUNT: EXACTLY ${settings.keywordsCount})
Provide exactly ${settings.keywordsCount} keywords. No more, no less.
1.  **TIER 1 (Visuals):** The literal subject.
2.  **TIER 2 (Action/State):** What is happening?
3.  **TIER 3 (Context):** Environment (Photos only).
4.  **TIER 4 (Concepts):** Abstract meanings.
5.  **TIER 5 (Technical):** "Copy space" (if applicable). ${isTransparent ? 'Include "Cutout", "Isolated", "Transparent".' : ''}

**Events:** ONLY tag holidays (Christmas, Halloween) if visually obvious.
**Dates:** Do NOT use years (2024, 2025).

---
### 5. CATEGORY
Select best fit from: ${ADOBE_CATEGORIES.join(", ")}

---
### OUTPUT
Return ONLY the raw JSON object containing 'adobe_title', 'freepik_title', 'keywords', and 'category'.
`;
};

// Utility to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sanitizeMetadata = (metadata: any, settings: ControlSettings): MetaData => {
    let adobe_title = metadata.adobe_title || "";
    let freepik_title = metadata.freepik_title || "";
    let keywords = metadata.keywords || [];
    
    // --- SMART TITLE SANITIZATION ---
    // This logic ensures strict adherence to the length limit set in settings
    const cleanTitle = (t: string, maxLen: number) => {
        if (!t) return "";
        let clean = t.trim();
        
        // Remove Forbidden Words (Trademarks)
        FORBIDDEN_WORDS.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            clean = clean.replace(regex, 'Generic Object');
        });

        // Remove filler start words (SEO optimization)
        clean = clean.replace(/^(A |An |The )?((3d|3D) )?(render|illustration|image|photo|shot|view) of (a |an )?/i, "");
        
        if (settings.contentType === 'transparent') {
            const suffix = " isolated on transparent background";
            
            // CLEAN TECHNICAL WORDS FROM TITLE (They belong in keywords)
            // This prevents "Delivery Man PNG Cutout isolated on transparent..."
            clean = clean.replace(/\b(png|jpg|jpeg|cutout|clipart|sticker|transparent|isolated|background)\b/gi, " ");
            
            // Clean up double spaces created by removal
            clean = clean.replace(/\s+/g, ' ').trim();

            // Clean up if AI added the suffix despite instructions
            const bgRegex = /( isolated)? on (a )?(solid )?(black|white|dark|transparent) background/gi;
            clean = clean.replace(bgRegex, "");
            clean = clean.replace(/ isolated$/i, "");
            clean = clean.trim();
            
            // Capitalize first letter
            clean = clean.charAt(0).toUpperCase() + clean.slice(1);

            // Calculate strictly available space
            const availableSpace = maxLen - suffix.length;
            
            if (clean.length > availableSpace) {
                // Hard Cut to fit limit, but try to respect word boundaries
                let truncated = clean.substring(0, availableSpace);
                const lastSpace = truncated.lastIndexOf(' ');
                // If finding the last space removes too much (>20% of content), just cut hard
                if (lastSpace > availableSpace * 0.8) {
                    truncated = truncated.substring(0, lastSpace);
                }
                clean = truncated;
            }
            
            // Always append suffix
            clean = clean + suffix;
        } else {
            // Capitalize first letter
            clean = clean.charAt(0).toUpperCase() + clean.slice(1);

            // Standard truncation for non-transparent
            if (clean.length > maxLen) {
                let truncated = clean.substring(0, maxLen);
                const lastSpace = truncated.lastIndexOf(' ');
                if (lastSpace > maxLen * 0.8) {
                    truncated = truncated.substring(0, lastSpace);
                }
                clean = truncated;
            }
        }

        clean = clean.replace(/\.+$/, ''); // Remove trailing periods
        return clean;
    };

    // Apply the smart cleaning
    adobe_title = cleanTitle(adobe_title, settings.adobeTitleLength);
    freepik_title = cleanTitle(freepik_title, settings.freepikTitleLength);
    
    // --- KEYWORD SANITIZATION ---
    // 1. Filter Forbidden
    keywords = keywords.filter((k: string) => {
        const lowerK = k.toLowerCase();
        const isForbidden = FORBIDDEN_WORDS.some(badWord => lowerK.includes(badWord.toLowerCase()));
        return !isForbidden;
    });

    // 2. Enforce Mandatory Keywords for PNGs
    if (settings.contentType === 'transparent') {
         const requiredPngKeywords = ["cutout", "isolated", "transparent", "background", "element", "object"];
         requiredPngKeywords.forEach(req => {
             if (!keywords.map(k => k.toLowerCase()).includes(req)) {
                 keywords.push(req);
             }
         });
    }
    
    // 3. STRICT LIMIT ENFORCEMENT
    // Ensure we match the settings.keywordsCount EXACTLY (or as close as possible)
    if (keywords.length > settings.keywordsCount) {
        // Cut off excess keywords
        keywords = keywords.slice(0, settings.keywordsCount);
    } 
    
    // Fallback if too few (AI error)
    if (keywords.length < 5) {
        keywords.push("illustration", "graphic", "design", "vector", "element");
    }

    return { 
        ...metadata, 
        adobe_title, 
        freepik_title, 
        keywords 
    };
};

export const extractMetadataStream = async (
  file: UploadedFile,
  settings: ControlSettings,
  onChunk: (partial: Partial<MetaData>) => void
): Promise<MetaData> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview'; 
  
  const imagePart = {
    inlineData: {
      data: file.base64,
      mimeType: file.mimeType,
    },
  };

  const textPart = {
    text: PROMPT_TEMPLATE(settings, file.mimeType.startsWith('video') ? 'video frame' : 'image'),
  };

  let lastError: any;
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: metadataSchema
            },
        });

        // Use a generic status update instead of a specific title
        onChunk({ adobe_title: "Analyzing..." });
        
        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("No response received from Gemini.");
        }
        
        const rawMetadata = JSON.parse(textResponse.trim());
        return sanitizeMetadata(rawMetadata, settings);

    } catch (error: any) {
        console.error(`Gemini Attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        const isRateLimit = error.message?.includes('429') || error.message?.includes('exhausted');
        const isServerBusy = error.message?.includes('503') || error.message?.includes('overloaded');

        if ((isRateLimit || isServerBusy) && attempt < maxRetries) {
            const delayMs = Math.pow(2, attempt + 1) * 1000;
            // Inform UI of retry
            onChunk({ adobe_title: `Busy (Retrying in ${delayMs/1000}s)...` });
            await wait(delayMs);
            continue;
        }
        break;
    }
  }

  if (lastError) {
      if (lastError.message.includes('SAFETY')) throw new Error("Content blocked due to safety policies.");
      if (lastError.message.includes('429')) throw new Error("Rate Limit Exceeded. Please pause for a minute.");
      if (lastError.message.includes('API key') || lastError.message.includes('403')) throw new Error("Invalid API Key.");
      throw new Error(`Failed: ${lastError.message}`);
  }

  throw new Error("An unknown error occurred.");
};
