import * as cheerio from "cheerio";

/**
 * Scrape the main product image from a PDP (Product Detail Page) URL.
 * Tries common selectors used by LG and other e-commerce sites.
 */
export async function scrapeProductImage(
  pdpUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(pdpUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Try common product image selectors
    const selectors = [
      // LG specific
      'meta[property="og:image"]',
      ".pdp-hero img",
      ".product-image img",
      ".gallery-image img",
      // Generic e-commerce
      '[data-testid="product-image"] img',
      ".product-detail img",
      ".product-gallery img",
      "#product-image img",
      ".main-image img",
      // Broad fallbacks
      'img[src*="product"]',
      'img[src*="large"]',
      "article img",
    ];

    for (const selector of selectors) {
      if (selector.startsWith("meta")) {
        const content = $(selector).attr("content");
        if (content && isImageUrl(content)) return resolveUrl(content, pdpUrl);
      } else {
        const img = $(selector).first();
        const src = img.attr("src") || img.attr("data-src");
        if (src && isImageUrl(src)) return resolveUrl(src, pdpUrl);
      }
    }

    // Last resort: find the largest image by checking src patterns
    let bestImg: string | null = null;
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && isImageUrl(src) && !isIcon(src)) {
        if (!bestImg) bestImg = resolveUrl(src, pdpUrl);
      }
    });

    return bestImg;
  } catch (error) {
    console.error("Scrape error:", error);
    return null;
  }
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|avif)/i.test(url) || url.includes("image");
}

function isIcon(url: string): boolean {
  return /icon|logo|favicon|sprite|arrow|chevron/i.test(url);
}

function resolveUrl(src: string, base: string): string {
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  return new URL(src, base).href;
}
