import { openai, SYSTEM_PROMPT, TOOLS } from "@/lib/openai";
import { prepareBanners } from "@/lib/renderer";
import { scrapeProductImage } from "@/lib/scraper";
import type OpenAI from "openai";

export const maxDuration = 60;

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
): Promise<{ type: "text"; content: string } | { type: "banners"; content: string; banners: unknown[] }> {
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
      content: JSON.stringify({
        success: true,
        generated: banners.length,
        names: banners.map((b) => b.name),
      }),
      banners,
    };
  }

  if (name === "scrape_product_image") {
    const imageUrl = await scrapeProductImage(args.pdp_url as string);
    return {
      type: "text",
      content: imageUrl
        ? JSON.stringify({ success: true, image_url: imageUrl })
        : JSON.stringify({
            success: false,
            error: "Could not find product image. Ask the user for a direct image URL.",
          }),
    };
  }

  if (name === "generate_product_image") {
    let generatedUrl: string | undefined;

    // Try Google Imagen
    if (process.env.GOOGLE_API_KEY) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GOOGLE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [
                {
                  prompt: `Professional product photo on pure white background: ${args.prompt}. Clean studio photography, centered, high resolution.`,
                },
              ],
              parameters: { sampleCount: 1 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
          if (b64) generatedUrl = `data:image/png;base64,${b64}`;
        }
      } catch (e) {
        console.error("Imagen error:", e);
      }
    }

    // Fall back to DALL-E
    if (!generatedUrl) {
      try {
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Professional product photo on white background: ${args.prompt}. Clean, high-quality commercial photography, centered product, studio lighting.`,
          n: 1,
          size: "1024x1024",
          quality: "standard",
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

    const MAX_ITERATIONS = 5;
    let bannerResult: { banners: unknown[] } | null = null;

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
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allMessages.push(assistantMsg as any);

      for (const toolCall of assistantMsg.tool_calls) {
        const fn = getFn(toolCall);
        let args: Record<string, unknown>;
        try {
          args = JSON.parse(fn.arguments);
        } catch {
          args = {};
        }

        try {
          const result = await executeTool(fn.name, args);
          if (result.type === "banners") {
            bannerResult = { banners: result.banners };
          }
          allMessages.push({
            role: "tool",
            tool_call_id: fn.id,
            content: result.content,
          });
        } catch (error) {
          console.error(`Tool ${fn.name} error:`, error);
          allMessages.push({
            role: "tool",
            tool_call_id: fn.id,
            content: JSON.stringify({
              error: error instanceof Error ? error.message : "Tool execution failed",
            }),
          });
        }
      }
    }

    return Response.json({
      message: bannerResult
        ? `배너 ${(bannerResult.banners as unknown[]).length}개가 생성되었습니다!`
        : "처리 시간이 초과되었습니다. 다시 시도해주세요.",
      ...(bannerResult || {}),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
