import { getSelectedFrames } from "@/lib/figma-manifest";

export async function POST(request: Request) {
  try {
    const { channel, sizes, headline, subcopy, ctaText, lifestyleImageUrl } = await request.json();

    if (!channel) {
      return Response.json({ error: "channel is required" }, { status: 400 });
    }

    const targetSizes = sizes?.length && sizes[0] !== "all" ? sizes : ["all"];
    const frames = getSelectedFrames(channel, targetSizes);

    if (frames.length === 0) {
      return Response.json({ error: "No matching frames found" }, { status: 404 });
    }

    let base64Image = null;
    if (lifestyleImageUrl) {
      // Fetch the image URL and convert to Base64 for the Figma plugin
      const res = await fetch(lifestyleImageUrl);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString('base64');
      } else {
        console.warn("Failed to fetch lifestyleImageUrl for Figma upload", res.status);
      }
    }

    const framesPayload = frames.map(f => {
      const text_edits: Record<string, string> = {};
      if (f.headline?.id && headline) text_edits[f.headline.id] = headline;
      if (f.subcopy?.id && subcopy) text_edits[f.subcopy.id] = subcopy;
      if (f.ctaText?.id && ctaText) text_edits[f.ctaText.id] = ctaText;

      const framePayload: Record<string, unknown> = {
        name: f.name,
        text_edits,
      };

      if (base64Image && f.backgroundSlot?.id) {
        framePayload.image_nid = f.backgroundSlot.id;
        framePayload.image_data = base64Image;
      }

      return framePayload;
    });

    const command = {
      action: "edit_and_export",
      frames: framesPayload
    };

    const relayUrl = process.env.NEXT_PUBLIC_FIGMA_RELAY_URL || process.env.FIGMA_RELAY_URL || "http://localhost:5050/api/command";
    
    const relayRes = await fetch(relayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(command)
    });

    if (!relayRes.ok) {
      const errorText = await relayRes.text();
      throw new Error(`Relay Server Error (${relayRes.status}): ${errorText}`);
    }

    const relayData = await relayRes.json().catch(() => ({}));
    const pluginsNotified = relayData?.plugins_notified ?? 0;

    if (pluginsNotified === 0) {
      return Response.json({
        success: false,
        message: "Relay received the command, but no Figma plugin is connected. Open the 'LG EI Shape Editor' plugin in Figma and connect it to the relay.",
        relayUrl,
        pluginsNotified,
      }, { status: 503 });
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
      { error: "Failed to push to Figma Relay Server", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
