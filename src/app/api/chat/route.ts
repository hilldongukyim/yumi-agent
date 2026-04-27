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

interface RequestState {
  productImageUrl?: string;
  lifestyleImageUrl?: string;
}

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  state: RequestState
): Promise<
  | { type: "text"; content: string }
  | { type: "banners"; content: string; banners: unknown[] }
  | { type: "preview"; content: string; previewImages: { url: string; label: string }[] }
> {
  if (name === "generate_banner") {
    const productImageUrl =
      (args.product_image_url as string | undefined) || state.productImageUrl;
    const lifestyleImageUrl =
      (args.lifestyle_image_url as string | undefined) || state.lifestyleImageUrl;
      
    const banners = prepareBanners({
      channel: args.channel as string,
      sizes: args.sizes as string[],
      headline: args.headline as string,
      subcopy: args.subcopy as string | undefined,
      ctaText: args.cta_text as string | undefined,
      productImageUrl,
      lifestyleImageUrl,
    });
    
    // Asynchronously trigger figma update if relay server is configured
    try {
      // In this environment we can't easily self-fetch the route API, so we fetch the relay directly here
      // Alternatively, we let the frontend do it to avoid blocking the chat response.
      // We will add a flag to tell the frontend to push to figma.
    } catch (e) {
      console.error(e);
    }

    return {
      type: "banners",
      content: JSON.stringify({
        success: true,
        generated: banners.length,
        names: banners.map((b) => b.spec.name),
        used_product_image: !!productImageUrl,
        used_lifestyle_image: !!lifestyleImageUrl,
        // Frontend will use these payload to call /api/figma-update
        figmaPayload: {
          channel: args.channel,
          sizes: args.sizes,
          headline: args.headline,
          subcopy: args.subcopy,
          ctaText: args.cta_text,
          lifestyleImageUrl,
          productImageUrl,
        }
      }),
      banners,
    };
  }

  if (name === "scrape_product_image") {
    const info = await scrapeProductInfo(args.pdp_url as string);
    if (info.imageUrl) {
      state.productImageUrl = info.imageUrl;
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
          cta_text_from_pdp: info.ctaText,
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
      const isDataUrl = imageDataUrl.startsWith("data:");
      state.lifestyleImageUrl = imageDataUrl;
      return {
        type: "preview",
        content: JSON.stringify({
          success: true,
          lifestyle_image_url: isDataUrl ? "[generated inline image stored for banner]" : imageDataUrl,
        }),
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
    const falKey = process.env.FAL_KEY;

    if (falKey) {
      try {
        const res = await fetch("https://fal.run/fal-ai/nano-banana-pro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${falKey}`,
          },
          body: JSON.stringify({
            prompt: `Professional product photo on pure white background: ${args.prompt}. Clean studio photography, centered, high resolution.`,
            num_images: 1,
            output_format: "jpeg",
            aspect_ratio: "1:1",
            sync_mode: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const url = data?.images?.[0]?.url;
          if (typeof url === "string" && url.length > 0) generatedUrl = url;
        } else {
          console.error("fal.ai nano-banana-pro error:", res.status, await res.text());
        }
      } catch (e) {
        console.error("fal.ai image gen error:", e);
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

    if (generatedUrl) {
      const isDataUrl = generatedUrl.startsWith("data:");
      state.productImageUrl = generatedUrl;
      return {
        type: "preview",
        content: JSON.stringify({
          success: true,
          image_url: isDataUrl ? "[generated inline image stored for banner]" : generatedUrl,
        }),
        previewImages: [{ url: generatedUrl, label: "Product Image" }],
      };
    }
    return {
      type: "text",
      content: JSON.stringify({ success: false, error: "Image generation failed." }),
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
    const state: RequestState = {};

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
          const result = await executeTool(fn.name, args, state);
          if (result.type === "banners") {
            let figmaPayload = undefined;
            try {
              const resData = JSON.parse(result.content);
              figmaPayload = resData.figmaPayload;
            } catch (e) {}
            const newBanners = (result as { banners: unknown[] }).banners;
            bannerResult = {
              banners: [...((bannerResult?.banners as unknown[]) || []), ...newBanners],
              figmaPayload,
            } as { banners: unknown[]; figmaPayload?: unknown };
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
