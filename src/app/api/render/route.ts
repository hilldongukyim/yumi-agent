import { renderBanners } from "@/lib/renderer";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { channel, sizes, headline, subcopy, ctaText, productImageUrl } =
      await request.json();

    if (!channel || !headline) {
      return Response.json(
        { error: "channel and headline are required" },
        { status: 400 }
      );
    }

    const results = await renderBanners({
      channel,
      sizes: sizes || ["all"],
      headline,
      subcopy,
      ctaText,
      productImageUrl,
    });

    return Response.json({ banners: results });
  } catch (error) {
    console.error("Render error:", error);
    return Response.json(
      { error: "Failed to render banners" },
      { status: 500 }
    );
  }
}
