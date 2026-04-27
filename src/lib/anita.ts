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

// ===== Map width/height → fal.ai flux/schnell image_size =====
function toFalImageSize(width: number, height: number): string {
  const ratio = width / height;
  if (ratio >= 2.0) return "landscape_16_9";       // ultra-wide
  if (ratio >= 1.4) return "landscape_16_9";       // 16:9, 4:3 landscape
  if (ratio >= 0.9) return "square_hd";            // ~1:1
  if (ratio >= 0.6) return "portrait_4_3";         // 3:4
  return "portrait_16_9";                          // 9:16 tall
}

// ===== Generate lifestyle background via fal.ai flux/schnell =====
// Uses fast text-to-image (3-5s). The product image is overlaid separately by BannerRenderer.
export async function generateLifestyleImage(opts: {
  prompt: string;
  productImageUrl: string;
  width?: number;
  height?: number;
}): Promise<string | null> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    console.error("FAL_KEY not set");
    return null;
  }

  const width = opts.width || 1920;
  const height = opts.height || 1080;
  const imageSize = toFalImageSize(width, height);

  console.log(`[Anita] Generating lifestyle background via flux/schnell (${imageSize})...`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${falKey}`,
      },
      body: JSON.stringify({
        prompt: opts.prompt,
        image_size: imageSize,
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error("[Anita] fal.ai error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const imageUrl = data?.images?.[0]?.url;
    if (typeof imageUrl === "string" && imageUrl.length > 0) {
      console.log("[Anita] Lifestyle background generated:", imageUrl.slice(0, 80) + "...");
      return imageUrl;
    }

    console.error("[Anita] fal.ai response missing url:", JSON.stringify(data).slice(0, 300));
    return null;
  } catch (error) {
    clearTimeout(timer);
    console.error("[Anita] Generation error:", error);
    return null;
  }
}
