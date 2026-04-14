import { openai, SYSTEM_PROMPT, TOOLS } from "@/lib/openai";
import { prepareBanners } from "@/lib/renderer";
import { scrapeProductInfo } from "@/lib/scraper";
import {
  composeLifestylePrompt,
  generateLifestyleImage,
  detectCountry,
  detectCategory,
  CATEGORY_MAP,
} from "@/lib/anita";
import type OpenAI from "openai";

export const maxDuration = 120;

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFn(tc: any) {
  return {
    name: tc.function?.name as string,
    arguments: tc.function?.arguments as string,
    id: tc.id as string,
  };
}

async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<
  | { type: "text"; content: string }
  | { type: "banners"; content: string; banners: unknown[] }
  | { type: "preview"; content: string; previewImages: { url: string; label: string }[] }
> {
  if (name === "generate_banner") {
    const banners = prepareBanners({
      channel: args.channel as string,
      sizes: args.sizes as string[],
      headline: args.headline as string,
      subcopy: args.subcopy as string | undefined,
      ctaText: args.cta_text as string | undefined,
      productImageUrl: args.product_image_url as string | undefined,
    });
    return {
      type: "banners",
      content: JSON.stringify({ success: true, generated: banners.length, names: banners.map((b) => b.name) }),
      banners,
    };
  }

  if (name === "scrape_product_image") {
    const info = await scrapeProductInfo(args.pdp_url as string);
    if (info.imageUrl) {
      const categoryName = info.category ? CATEGORY_MAP[info.category]?.name || info.category : "Unknown";
      return {
        type: "preview",
        content: JSON.stringify({
          success: true,
          image_url: info.imageUrl,
          title: info.title,
          category: categoryName,
          category_id: info.category,
          country: info.country,
          dimensions: info.dimensions,
          all_images_count: info.allImages.length,
        }),
        previewImages: [
          { url: info.imageUrl, label: info.title || "Product Image" },
        ],
      };
    }
    return {
      type: "text",
      content: JSON.stringify({ success: false, error: "Could not find product image. Please provide a direct image URL." }),
    };
  }

  if (name === "generate_lifestyle_image") {
    const productImageUrl = args.product_image_url as string;
    const categoryId = (args.category_id as string) || "tv";
    const country = (args.country as string) || "_default";
    const includePeople = (args.include_people as boolean) || false;
    const width = (args.width as number) || 1920;
    const height = (args.height as number) || 1080;

    const prompt = composeLifestylePrompt({
      categoryId,
      country,
      productDimensions: (args.product_dimensions as string) || "standard size",
      includePeople,
      width,
      height,
    });

    const imageDataUrl = await generateLifestyleImage({
      prompt,
      productImageUrl,
      width,
      height,
    });

    if (imageDataUrl) {
      return {
        type: "preview",
        content: JSON.stringify({ success: true, lifestyle_image_url: imageDataUrl }),
        previewImages: [{ url: imageDataUrl, label: "Lifestyle Image (by Anita)" }],
      };
    }

    return {
      type: "text",
      content: JSON.stringify({ success: false, error: "Lifestyle image generation failed. Try again or provide a direct image URL." }),
    };
  }

  if (name === "generate_product_image") {
    let generatedUrl: string | undefined;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Professional product photo on pure white background: ${args.prompt}. Clean studio photography, centered, high resolution.` }] }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const b64 = data?.candidates?.[0]?.content?.parts?.find((p: Record<string, unknown>) => p.inlineData)?.inlineData?.data;
          if (b64) generatedUrl = `data:image/png;base64,${b64}`;
        }
      } catch (e) {
        console.error("Gemini image gen error:", e);
      }
    }

    if (!generatedUrl) {
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Professional product photo on white background: ${args.prompt}. Clean commercial photography.`,
          n: 1, size: "1024x1024", quality: "standard",
        });
        generatedUrl = dalleResponse.data?.[0]?.url;
      } catch (e) {
        console.error("DALL-E error:", e);
      }
    }

    return {
      type: "text",
      content: generatedUrl
        ? JSON.stringify({ success: true, image_url: generatedUrl })
        : JSON.stringify({ success: false, error: "Image generation failed." }),
    };
  }

  return { type: "text", content: JSON.stringify({ error: "Unknown tool" }) };
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const allMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const MAX_ITERATIONS = 6;
    let bannerResult: { banners: unknown[] } | null = null;
    let previewResult: { previewImages: { url: string; label: string }[] } | null = null;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: allMessages,
        tools: TOOLS,
        tool_choice: "auto",
      });

      const assistantMsg = response.choices[0].message;

      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        return Response.json({
          message: assistantMsg.content || "",
          ...(bannerResult || {}),
          ...(previewResult || {}),
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allMessages.push(assistantMsg as any);

      for (const toolCall of assistantMsg.tool_calls) {
        const fn = getFn(toolCall);
        let args: Record<string, unknown>;
        try { args = JSON.parse(fn.arguments); } catch { args = {}; }

        try {
          const result = await executeTool(fn.name, args);
          if (result.type === "banners") {
            bannerResult = { banners: (result as { banners: unknown[] }).banners };
          }
          if (result.type === "preview") {
            previewResult = { previewImages: (result as { previewImages: { url: string; label: string }[] }).previewImages };
          }
          allMessages.push({ role: "tool", tool_call_id: fn.id, content: result.content });
        } catch (error) {
          console.error(`Tool ${fn.name} error:`, error);
          allMessages.push({
            role: "tool",
            tool_call_id: fn.id,
            content: JSON.stringify({ error: error instanceof Error ? error.message : "Tool failed" }),
          });
        }
      }
    }

    return Response.json({
      message: "처리를 완료했습니다.",
      ...(bannerResult || {}),
      ...(previewResult || {}),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
