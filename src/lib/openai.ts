import OpenAI from "openai";
import { CHANNELS } from "./config";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const channelInfo = Object.entries(CHANNELS)
  .map(([key, ch]) => {
    const sizes = ch.frames.map((f) => `${f.width}x${f.height}`).join(", ");
    return `- **${key}** (${ch.description}): ${ch.frames.length} sizes — ${sizes}`;
  })
  .join("\n");

export const SYSTEM_PROMPT = `You are Yumi, a friendly and professional banner creation agent for LG Electronics.
You help internal marketers create promotional banners through natural conversation.

## Personality
- Warm, efficient, professional. Speak the same language as the user.
- Be concise. Do NOT ask unnecessary clarifying questions.

## Available channels and sizes
${channelInfo}

## FAST-TRACK RULE (most important)
If the user's message contains ALL of the following, execute IMMEDIATELY without any confirmation steps:
1. A product (PDP URL, direct image URL, or product description)
2. Channel selection (DV360/Social/Criteo/Email/all)
3. Headline text (explicit or implied by theme)

Execution order when fast-tracking:
1. Call scrape_product_image if a PDP URL is given
2. Call generate_lifestyle_image (use category/country from scraped data, width=1920, height=1080)
3. Call generate_banner with channel="all", sizes=["all"], the headline, subcopy, cta_text, and both image URLs
4. Tell the user what was created and offer to modify

## Conversation flow (when info is missing)
Only ask for missing pieces — one question max per reply:
1. Channel: which channel (DV360 / Social / Criteo / Email / all)?
2. Product image: PDP URL, direct image URL, or describe it
3. Headline: the main text (if not already provided)
4. CTA: "Shop Now", "Buy Now", etc. (default "Shop Now" for en-uk, "Jetzt kaufen" for de, etc.)
After collecting, generate immediately — no confirmation step needed.

## Image handling
- scrape_product_image: call with PDP URL. The system shows a preview automatically.
  → Do NOT ask "이 이미지가 맞나요?" — trust the scraped result and proceed.
- generate_lifestyle_image: always call this to create a lifestyle background before generating banners.
  → Use category_id and country from the scrape result. Default: category_id="washing_machine", country="uk"
  → Do NOT wait for user confirmation of the lifestyle image — proceed directly to generate_banner.
- generate_banner: use channel="all" to generate all 4 channels at once with sizes=["all"].

## After generating
Briefly summarize: how many banners, channels, theme. Offer download.
Do NOT list individual sizes — the UI shows them.`;


export const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "generate_banner",
      description: "Generate banner images. Call ONLY when all info is collected AND confirmed.",
      parameters: {
        type: "object",
        properties: {
          channel: { type: "string", enum: ["DV360", "Social", "Criteo", "Email", "all"], description: 'Use "all" to generate all 4 channels at once.' },
          sizes: { type: "array", items: { type: "string" }, description: 'Selected banner sizes or ["all"]' },
          headline: { type: "string", description: "Main headline text" },
          subcopy: { type: "string", description: "Sub-copy text" },
          cta_text: { type: "string", description: "CTA button text" },
          product_image_url: { type: "string", description: "URL of the product cutout image (white background). Optional — the server will reuse the most recently confirmed product image automatically." },
          lifestyle_image_url: { type: "string", description: "URL of the Anita-generated lifestyle image used as the banner background. Optional — the server will reuse the most recently generated lifestyle image automatically." },
        },
        required: ["channel", "sizes", "headline"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scrape_product_image",
      description: "Scrape product info and image from a PDP URL. Returns product image preview, title, category, country, and dimensions. The image will be shown as a preview to the user for confirmation.",
      parameters: {
        type: "object",
        properties: {
          pdp_url: { type: "string", description: "The product detail page URL" },
        },
        required: ["pdp_url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_lifestyle_image",
      description: "Generate a lifestyle image using Anita (lifestyle AI). Places the product in a realistic room scene based on product category, country style, and dimensions. Uses Gemini (nanobanana pro) for generation.",
      parameters: {
        type: "object",
        properties: {
          product_image_url: { type: "string", description: "URL of the confirmed product image" },
          category_id: {
            type: "string",
            description: "Product category ID (e.g., tv, refrigerator, washing_machine, monitor, laptop, etc.)",
            enum: ["tv", "lifestyle_screen", "soundbar", "bluetooth_speaker", "wireless_earbuds", "hifi", "projector", "refrigerator", "washing_machine", "washtower", "styler", "dishwasher", "microwave", "vacuum", "water_purifier", "air_conditioner", "air_purifier", "aerotower", "dehumidifier", "heat_pump", "monitor", "laptop"],
          },
          country: { type: "string", description: "Country code (e.g., uk, us, kr, sg, de, fr, jp, au, _default)" },
          product_dimensions: { type: "string", description: "Physical dimensions from PDP (e.g., W1234 x H567 x D89mm)" },
          include_people: { type: "boolean", description: "Whether to include people in the scene" },
          width: { type: "number", description: "Output width (default 1920)" },
          height: { type: "number", description: "Output height (default 1080)" },
        },
        required: ["product_image_url", "category_id", "country"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_product_image",
      description: "Generate a product image using AI from a text description.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Description of the product" },
        },
        required: ["prompt"],
      },
    },
  },
];
