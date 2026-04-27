import { getSelectedFrames } from "@/lib/figma-manifest";

const BRIA_TIMEOUT_MS = 35_000;

async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString("base64");
  } catch {
    return null;
  }
}

/**
 * Generate a product-in-scene composite via fal.ai BRIA background replace.
 * Takes a product cutout (white bg) and places it in a realistic room scene.
 * Falls back to null on any error.
 */
async function generateComposite(
  productImageUrl: string,
  falKey: string
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BRIA_TIMEOUT_MS);

  try {
    const res = await fetch("https://fal.run/fal-ai/bria/background/replace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${falKey}`,
      },
      body: JSON.stringify({
        image_url: productImageUrl,
        prompt:
          "Modern premium living space, warm neutral tones, contemporary interior design, natural lighting, professional lifestyle photography, clean and elegant atmosphere",
        num_results: 1,
        sync_mode: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) {
      console.error("[figma-update] BRIA error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const compositeUrl = data?.images?.[0]?.url;
    if (typeof compositeUrl !== "string") return null;

    return fetchAsBase64(compositeUrl);
  } catch (e) {
    clearTimeout(timer);
    console.error("[figma-update] BRIA composite failed:", e);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const {
      channel,
      sizes,
      headline,
      subcopy,
      ctaText,
      lifestyleImageUrl,
      productImageUrl,
    } = await request.json();

    if (!channel) {
      return Response.json({ error: "channel is required" }, { status: 400 });
    }

    const targetSizes = sizes?.length && sizes[0] !== "all" ? sizes : ["all"];
    const frames = getSelectedFrames(channel, targetSizes);

    if (frames.length === 0) {
      return Response.json({ error: "No matching frames found" }, { status: 404 });
    }

    const falKey = process.env.FAL_KEY;

    // Try to generate a product-in-scene composite for Figma slots.
    // If productImageUrl is available use BRIA; otherwise fall back to lifestyle bg.
    let compositeBase64: string | null = null;

    if (productImageUrl && falKey) {
      console.log("[figma-update] Generating BRIA composite...");
      compositeBase64 = await generateComposite(productImageUrl, falKey);
      if (compositeBase64) {
        console.log("[figma-update] BRIA composite ready.");
      } else {
        console.warn("[figma-update] BRIA failed, falling back to lifestyle image.");
      }
    }

    if (!compositeBase64 && lifestyleImageUrl) {
      console.log("[figma-update] Using lifestyle background as fallback image...");
      compositeBase64 = await fetchAsBase64(lifestyleImageUrl);
    }

    // Build the frames payload.
    // Each Figma frame gets TWO entries: one for backgroundSlot and one for productSlot,
    // both receiving the same composite image so Figma's native blur/dim effects apply
    // automatically to the background layer while the EI-Shape mask shows the product scene.
    const framesPayload: Record<string, unknown>[] = [];

    for (const f of frames) {
      const text_edits: Record<string, string> = {};
      if (f.headline?.id && headline) text_edits[f.headline.id] = headline;
      if (f.subcopy?.id && subcopy) text_edits[f.subcopy.id] = subcopy;
      if (f.ctaText?.id && ctaText) text_edits[f.ctaText.id] = ctaText;

      // Entry 1: text edits + background slot image
      const mainEntry: Record<string, unknown> = { name: f.name, text_edits };
      if (compositeBase64 && f.backgroundSlot?.id) {
        mainEntry.image_nid = f.backgroundSlot.id;
        mainEntry.image_data = compositeBase64;
      }
      framesPayload.push(mainEntry);

      // Entry 2: product slot (EI-Shape masked) — same composite image, no text edits
      if (compositeBase64 && f.productSlot?.id) {
        framesPayload.push({
          name: f.name,
          text_edits: {},
          image_nid: f.productSlot.id,
          image_data: compositeBase64,
        });
      }
    }

    const command = {
      action: "edit_and_export",
      frames: framesPayload,
    };

    const relayUrl =
      process.env.NEXT_PUBLIC_FIGMA_RELAY_URL ||
      process.env.FIGMA_RELAY_URL ||
      "http://localhost:5050/api/command";

    const relayRes = await fetch(relayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });

    if (!relayRes.ok) {
      const errorText = await relayRes.text();
      throw new Error(`Relay Server Error (${relayRes.status}): ${errorText}`);
    }

    const relayData = await relayRes.json().catch(() => ({}));
    const pluginsNotified = relayData?.plugins_notified ?? 0;

    if (pluginsNotified === 0) {
      return Response.json(
        {
          success: false,
          message:
            "Relay received the command, but no Figma plugin is connected. Open the 'LG EI Shape Editor' plugin in Figma and connect it to the relay.",
          relayUrl,
          pluginsNotified,
        },
        { status: 503 }
      );
    }

    return Response.json({
      success: true,
      message: "Figma update command sent successfully",
      relayUrl,
      pluginsNotified,
    });
  } catch (error) {
    console.error("Figma Update API error:", error);
    return Response.json(
      {
        error: "Failed to push to Figma Relay Server",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
