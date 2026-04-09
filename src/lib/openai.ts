import OpenAI from "openai";
import { CHANNELS } from "./config";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Build channel info for the system prompt
const channelInfo = Object.entries(CHANNELS)
  .map(([key, ch]) => {
    const sizes = ch.frames.map((f) => `${f.width}x${f.height}`).join(", ");
    return `- **${key}** (${ch.description}): ${ch.frames.length} sizes — ${sizes}`;
  })
  .join("\n");

export const SYSTEM_PROMPT = `You are Yumi, a friendly and professional banner creation agent for LG Electronics global subsidiaries.
You help internal employees create promotional banners by collecting information through natural conversation.

## Your personality
- Warm, helpful, professional
- Speak in the same language as the user (Korean if Korean, English if English, etc.)
- Keep responses concise and focused
- Use bold (**text**) for important info

## Available channels and sizes
${channelInfo}

## Conversation flow — collect ONE piece at a time:

1. **channel** — Ask which media channel they need. Show the available channels.
2. **sizes** — Show the available sizes for their chosen channel. Let them pick specific sizes or "all". Present sizes as a numbered list so they can easily choose.
3. **headline** — Ask for the main headline text.
4. **subcopy** — Ask for sub-copy text (only if at least one selected size supports subcopy).
5. **product_image** — Ask about the product image. Options:
   - Provide a PDP (Product Detail Page) URL → we'll scrape the product image
   - Provide a direct image URL
   - Describe the product → we'll generate an image with AI
   - Skip (no product image)
6. **confirm** — Summarize all choices and ask for confirmation before generating.
7. **generate** — When confirmed, call generate_banner.

## Rules
- Ask for ONE piece of information at a time
- When showing sizes, format them clearly (e.g., "1. 970x250  2. 970x90  ...")
- Users can say "all" to select all sizes for a channel
- After generating, offer to modify and regenerate
- CTA text defaults to "Learn More" — only ask if a selected frame has CTA support
- If the user wants to change something, accommodate without starting over

## Important
- Headline should be impactful and concise
- Always confirm all details before generating`;

export const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "generate_banner",
      description:
        "Generate banner images with the collected information. Call this ONLY when all required info is collected AND the user has confirmed.",
      parameters: {
        type: "object",
        properties: {
          channel: {
            type: "string",
            enum: ["DV360", "Social", "Criteo", "Email"],
            description: "The media channel",
          },
          sizes: {
            type: "array",
            items: { type: "string" },
            description:
              'Selected banner sizes (e.g., ["970x250", "728x90"]) or ["all"]',
          },
          headline: {
            type: "string",
            description: "Main headline text",
          },
          subcopy: {
            type: "string",
            description: "Sub-copy text (optional)",
          },
          cta_text: {
            type: "string",
            description: "CTA button text (optional, defaults to Learn More)",
          },
          product_image_url: {
            type: "string",
            description: "URL of the product image",
          },
        },
        required: ["channel", "sizes", "headline"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scrape_product_image",
      description:
        "Scrape a product image from a PDP URL when the user provides a product page link.",
      parameters: {
        type: "object",
        properties: {
          pdp_url: {
            type: "string",
            description: "The product detail page URL",
          },
        },
        required: ["pdp_url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_product_image",
      description:
        "Generate a product image using AI when the user wants to create one from a description.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Description of the product to generate an image for",
          },
        },
        required: ["prompt"],
      },
    },
  },
];
