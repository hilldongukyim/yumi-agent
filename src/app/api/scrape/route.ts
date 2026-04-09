import { scrapeProductImage } from "@/lib/scraper";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json({ error: "url is required" }, { status: 400 });
    }

    const imageUrl = await scrapeProductImage(url);

    if (!imageUrl) {
      return Response.json(
        { error: "Could not find product image on the page" },
        { status: 404 }
      );
    }

    return Response.json({ imageUrl });
  } catch (error) {
    console.error("Scrape error:", error);
    return Response.json(
      { error: "Failed to scrape product image" },
      { status: 500 }
    );
  }
}
