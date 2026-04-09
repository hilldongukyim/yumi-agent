import { prepareBanners } from "@/lib/renderer";

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

    const banners = prepareBanners({
      channel,
      sizes: sizes || ["all"],
      headline,
      subcopy,
      ctaText,
      productImageUrl,
    });

    return Response.json({ banners });
  } catch (error) {
    console.error("Render error:", error);
    return Response.json(
      { error: "Failed to prepare banners" },
      { status: 500 }
    );
  }
}
