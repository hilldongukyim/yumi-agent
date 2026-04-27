/**
 * Anita — Lifestyle Image Generation System
 *
 * Flow:
 * 1. PDP URL → scrape product info (category, country, dimensions, images)
 * 2. User confirms product image (preview in chat)
 * 3. Detect category → load category-specific prompt (.md)
 * 4. Inject country style, people toggle, dimensions, resolution
 * 5. Call Gemini 2.5 Flash (nanobanana pro) to generate lifestyle image
 * 6. Return generated image for banner composition
 */

import fs from "fs";
import path from "path";

// ===== Category Mapping =====
export const CATEGORY_MAP: Record<
  string,
  { id: string; name: string; file: string; keywords: string[] }
> = {
  tv: { id: "tv", name: "TV", file: "01_TV.md", keywords: ["oled", "miniled", "qned", "nanocell", "uhd", "4k", "smart tv", "true wireless"] },
  lifestyle_screen: { id: "lifestyle_screen", name: "Lifestyle Screen", file: "02_Lifestyle_Screen.md", keywords: ["standbyme", "standby me", "objet easel", "objet pose", "flex"] },
  soundbar: { id: "soundbar", name: "Soundbar", file: "03_Soundbar.md", keywords: ["soundbar", "sound bar", "home cinema", "sound suite"] },
  bluetooth_speaker: { id: "bluetooth_speaker", name: "Bluetooth Speaker", file: "04_Bluetooth_Speaker.md", keywords: ["xboom", "bluetooth speaker", "party speaker", "portable speaker"] },
  wireless_earbuds: { id: "wireless_earbuds", name: "Wireless Earbuds", file: "05_Wireless_Earbuds.md", keywords: ["tone free", "earbuds", "xboom buds"] },
  hifi: { id: "hifi", name: "Hi-Fi System", file: "06_HiFi_System.md", keywords: ["hi-fi", "hifi", "audio system", "shelf stereo"] },
  projector: { id: "projector", name: "Projector", file: "07_Projector.md", keywords: ["projector", "cinebeam", "laser projector"] },
  refrigerator: { id: "refrigerator", name: "Refrigerator", file: "08_Refrigerator.md", keywords: ["fridge", "refrigerator", "freezer", "multi-door", "instaview", "side-by-side"] },
  washing_machine: { id: "washing_machine", name: "Washing Machine & Dryer", file: "09_Washing_Machine_Dryer.md", keywords: ["washing machine", "washer", "dryer", "tumble dryer", "front load", "top load"] },
  washtower: { id: "washtower", name: "WashTower", file: "10_WashTower.md", keywords: ["washtower", "wash tower"] },
  styler: { id: "styler", name: "Styler", file: "11_Styler.md", keywords: ["styler", "clothing care", "steam closet"] },
  dishwasher: { id: "dishwasher", name: "Dishwasher", file: "12_Dishwasher.md", keywords: ["dishwasher", "quadwash"] },
  microwave: { id: "microwave", name: "Microwave", file: "13_Microwave.md", keywords: ["microwave", "neochef"] },
  vacuum: { id: "vacuum", name: "Vacuum Cleaner", file: "14_Vacuum_Cleaner.md", keywords: ["vacuum", "cordzero", "handstick", "a9 kompressor"] },
  water_purifier: { id: "water_purifier", name: "Water Purifier", file: "15_Water_Purifier.md", keywords: ["water purifier", "puricare", "tankless"] },
  air_conditioner: { id: "air_conditioner", name: "Air Conditioner", file: "16_Air_Conditioner.md", keywords: ["air conditioner", "dualcool", "artcool", "single split"] },
  air_purifier: { id: "air_purifier", name: "Air Purifier", file: "17_Air_Purifier.md", keywords: ["air purifier", "puricare 360", "hepa"] },
  aerotower: { id: "aerotower", name: "AeroTower", file: "18_AeroTower.md", keywords: ["aerotower", "aero tower", "aero furniture"] },
  dehumidifier: { id: "dehumidifier", name: "Dehumidifier", file: "19_Dehumidifier.md", keywords: ["dehumidifier", "dual inverter dehumidifier"] },
  heat_pump: { id: "heat_pump", name: "Heat Pump", file: "20_Heat_Pump.md", keywords: ["heat pump", "therma v", "monobloc", "hydrosplit"] },
  monitor: { id: "monitor", name: "Monitor", file: "21_Monitor.md", keywords: ["monitor", "ultragear", "ultrawide", "ergo", "smart monitor"] },
  laptop: { id: "laptop", name: "Laptop", file: "22_Laptop.md", keywords: ["laptop", "gram", "gram pro", "ultrapc"] },
};

// ===== Country Styles =====
export const COUNTRY_STYLES: Record<string, { name: string; style: string }> = {
  uk: { name: "British", style: "Contemporary British living space. Warm neutral tones, natural oak flooring, understated elegance, curated artwork, quality textiles." },
  sg: { name: "Singaporean", style: "Modern tropical space. Clean lines, bright and airy, natural light flooding through, warm wood tones, indoor greenery." },
  kr: { name: "Korean", style: "Korean modern minimalism. Warm wood finishes, clean whites, subtle hanok-inspired curves, natural materials, zen simplicity." },
  us: { name: "American", style: "Open concept contemporary American home. Spacious layout, warm grays, statement lighting, comfortable yet stylish furnishings." },
  de: { name: "German", style: "Bauhaus-inspired functional elegance. Precise lines, quality materials, warm neutrals, thoughtful design, uncluttered sophistication." },
  fr: { name: "French", style: "Modern Parisian apartment. Herringbone floors, high ceilings, refined simplicity, warm whites, elegant restraint." },
  it: { name: "Italian", style: "Contemporary Italian living. Marble accents, warm terracotta, sculptural furniture, artisanal quality, sophisticated palette." },
  jp: { name: "Japanese", style: "Japanese modern interior. Zen simplicity, natural materials, warm minimalism, shoji-inspired light, clean spatial flow." },
  au: { name: "Australian", style: "Coastal modern Australian home. Natural light, organic textures, earthy palette, indoor-outdoor connection." },
  _default: { name: "International", style: "Modern international living space. Warm neutral palette, clean contemporary design, natural light, premium materials, lived-in sophistication." },
};

// ===== Detect country from PDP URL =====
export function detectCountry(url: string): string {
  const patterns: Record<string, RegExp> = {
    uk: /\.lg\.com\/uk\//i,
    sg: /\.lg\.com\/sg\//i,
    kr: /\.lg\.com\/kr\//i,
    us: /\.lg\.com\/us\//i,
    de: /\.lg\.com\/de\//i,
    fr: /\.lg\.com\/fr\//i,
    it: /\.lg\.com\/it\//i,
    jp: /\.lg\.com\/jp\//i,
    au: /\.lg\.com\/au\//i,
  };
  for (const [code, re] of Object.entries(patterns)) {
    if (re.test(url)) return code;
  }
  return "_default";
}

// ===== Detect category from page text =====
export function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  let bestMatch = "tv"; // default
  let bestScore = 0;

  for (const [id, cat] of Object.entries(CATEGORY_MAP)) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = id;
    }
  }
  return bestMatch;
}

// ===== Load category prompt =====
export function loadCategoryPrompt(categoryId: string): string {
  const cat = CATEGORY_MAP[categoryId];
  if (!cat) return "";

  const promptPath = path.join(process.cwd(), "src", "prompts", cat.file);
  try {
    const content = fs.readFileSync(promptPath, "utf-8");
    // Extract the base prompt from between ``` blocks after "## Base Prompt"
    const basePromptMatch = content.match(
      /## Base Prompt\s*\n\s*```\s*\n([\s\S]*?)```/
    );
    return basePromptMatch?.[1]?.trim() || content;
  } catch {
    return "";
  }
}

// ===== Compose final prompt =====
export function composeLifestylePrompt(opts: {
  categoryId: string;
  country: string;
  productDimensions?: string;
  includePeople?: boolean;
  width?: number;
  height?: number;
}): string {
  const {
    categoryId,
    country,
    productDimensions = "standard size",
    includePeople = false,
    width = 1920,
    height = 1080,
  } = opts;

  let prompt = loadCategoryPrompt(categoryId);

  // Inject resolution
  prompt = prompt.replace(/\{width\}/g, String(width));
  prompt = prompt.replace(/\{height\}/g, String(height));

  // Inject dimensions
  prompt = prompt.replace(/\{product_dimensions\}/g, productDimensions);

  // Inject country style
  const cs = COUNTRY_STYLES[country] || COUNTRY_STYLES._default;
  const countryBlock = `Interior style: ${cs.name} contemporary living space.\n${cs.style}\nKeep the style modern and premium — avoid overtly traditional or folksy elements.`;
  prompt = prompt.replace(/\{country_style\}/g, countryBlock);
  prompt = prompt.replace(/\{country_name\}/g, cs.name);

  // Inject people instruction
  const peopleBlock = includePeople
    ? `PEOPLE:\n- Include 1-2 people naturally enjoying the space\n- Diverse, modern appearance appropriate for ${cs.name}\n- Natural, candid poses — not looking at camera\n- People should NOT dominate the frame — the product remains the hero`
    : `PEOPLE:\n- Do NOT include any people in the scene\n- The space should feel inviting and lived-in through styling alone`;
  prompt = prompt.replace(/\{people_instruction\}/g, peopleBlock);

  // Clean up any remaining mount type instructions with defaults
  prompt = prompt.replace(
    /\{mount_type_instruction\}/g,
    "Place the product naturally in its typical setting"
  );

  return prompt;
}

// ===== Map width/height → fal.ai aspect_ratio =====
function toAspectRatio(width: number, height: number): string {
  const supported: Array<[string, number]> = [
    ["21:9", 21 / 9],
    ["16:9", 16 / 9],
    ["4:3", 4 / 3],
    ["3:2", 3 / 2],
    ["1:1", 1],
    ["2:3", 2 / 3],
    ["3:4", 3 / 4],
    ["9:16", 9 / 16],
    ["9:21", 9 / 21],
  ];
  const target = width / height;
  let best = supported[0];
  let bestDiff = Infinity;
  for (const entry of supported) {
    const diff = Math.abs(entry[1] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = entry;
    }
  }
  return best[0];
}

// ===== Generate lifestyle image via fal.ai nano-banana-pro =====
const ANITA_SYS_PROMPT = `You are a professional lifestyle photographer and product placement specialist.

CRITICAL SIZE ACCURACY INSTRUCTIONS:
- Use exact dimensions to determine the product's real-world scale
- Place the product in the scene with ACCURATE proportions relative to furniture and surroundings
- The product should look naturally sized - not too large or too small for the space
- Use reference objects in the scene to establish correct scale perception

INSTRUCTIONS:
1. First, analyze the product in the image - identify what type of product it is (electronics, appliance, furniture, etc.)
2. Based on the product type, determine the ideal target persona.
3. Create a highly detailed lifestyle scene description (prompt for an image generator) that:
   - Matches the target market and interior style requested
   - Places the product naturally as if in actual use or display
   - Uses appropriate lighting and includes contextual elements
   - MAINTAINS ACCURATE PRODUCT SIZE based on the provided dimensions
   
ONLY output the final image generation prompt in English, with NO extra conversational text. Focus entirely on visual descriptions: camera angle, lighting, room environment, furniture, and exact product placement.`;

export async function generateLifestyleImage(opts: {
  prompt: string;
  productImageUrl: string;
  width?: number;
  height?: number;
}): Promise<string | null> {
  const falKey = process.env.FAL_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  if (!falKey) {
    console.error("FAL_KEY not set");
    return null;
  }

  const width = opts.width || 1920;
  const height = opts.height || 1080;

  let optimalPrompt = opts.prompt;

  // Step 1: Gemini Anita Brain (Analyze image & Generate optimal scene prompt)
  if (googleKey && opts.productImageUrl) {
    try {
      console.log("Analyzing product with Gemini 1.5 Flash...");
      const imgRes = await fetch(opts.productImageUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`;
        const geminiReq = {
          contents: [
            {
              role: "user",
              parts: [
                { text: `${ANITA_SYS_PROMPT}\n\nUSER REQUEST (Follow these specific guidelines):\n${opts.prompt}` },
                { inline_data: { mime_type: mimeType, data: base64Image } }
              ]
            }
          ]
        };

        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiReq)
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const extractedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (extractedText && extractedText.trim().length > 0) {
            optimalPrompt = extractedText.trim();
            console.log("Gemini optimal prompt generated:", optimalPrompt.slice(0, 100) + "...");
          }
        } else {
          console.error("Gemini optimization failed:", await geminiRes.text());
        }
      }
    } catch (e) {
      console.error("Gemini optimization error:", e);
    }
  }

  // Step 2: Fal.ai Image Compositing
  console.log("Rendering composite via Fal.ai flux-subject...");
  try {
    const requestBody: Record<string, unknown> = {
      prompt: optimalPrompt,
      output_format: "jpeg",
      aspect_ratio: toAspectRatio(width, height),
      sync_mode: true,
    };

    let endpoint = "https://fal.run/fal-ai/nano-banana-pro";

    if (opts.productImageUrl) {
      // Use flux-subject to properly composite the product into the scene
      endpoint = "https://fal.run/fal-ai/flux-subject";
      requestBody.image_url = opts.productImageUrl;
    } else {
      requestBody.num_images = 1;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${falKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`fal.ai error (${endpoint}):`, res.status, errorText);
      return null;
    }

    const data = await res.json();
    const imageUrl = data?.images?.[0]?.url || data?.image?.url;
    if (typeof imageUrl === "string" && imageUrl.length > 0) {
      return imageUrl;
    }

    console.error("fal.ai response missing image url:", JSON.stringify(data).slice(0, 500));
    return null;
  } catch (error) {
    console.error("Lifestyle image generation error:", error);
    return null;
  }
}
