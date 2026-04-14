import * as cheerio from "cheerio";

export interface ProductInfo {
  title: string;
  imageUrl: string | null;
  allImages: string[];
  dimensions: string | null;
  category: string | null;
  country: string;
  pdpUrl: string;
}

/**
 * Scrape product info from a PDP URL.
 * Returns title, main image, all gallery images, dimensions, and detected category/country.
 */
export async function scrapeProductInfo(pdpUrl: string): Promise<ProductInfo> {
  const result: ProductInfo = {
    title: "",
    imageUrl: null,
    allImages: [],
    dimensions: null,
    category: null,
    country: detectCountryFromUrl(pdpUrl),
    pdpUrl,
  };

  try {
    const res = await fetch(pdpUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Title
    result.title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "";

    // Main image (og:image is most reliable)
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) {
      result.imageUrl = resolveUrl(ogImage, pdpUrl);
    }

    // Collect all product images
    const imageSet = new Set<string>();
    if (result.imageUrl) imageSet.add(result.imageUrl);

    // Gallery images
    const gallerySelectors = [
      ".pdp-hero img",
      ".product-image img",
      ".gallery-image img",
      '[data-testid="product-image"] img',
      ".product-gallery img",
      ".swiper-slide img",
      '[class*="gallery"] img',
      '[class*="carousel"] img',
      'picture source[srcset]',
    ];

    for (const sel of gallerySelectors) {
      $(sel).each((_, el) => {
        const src =
          $(el).attr("src") || $(el).attr("data-src") || $(el).attr("srcset");
        if (src && isProductImage(src)) {
          const resolved = resolveUrl(src.split(",")[0].trim().split(" ")[0], pdpUrl);
          imageSet.add(resolved);
        }
      });
    }

    // Additional images from img tags
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && isProductImage(src) && !isIcon(src) && imageSet.size < 10) {
        imageSet.add(resolveUrl(src, pdpUrl));
      }
    });

    result.allImages = Array.from(imageSet);

    // If no main image found, use first gallery image
    if (!result.imageUrl && result.allImages.length > 0) {
      result.imageUrl = result.allImages[0];
    }

    // Dimensions — look for spec tables
    const dimPatterns = [
      /(\d{2,4})\s*[xX×]\s*(\d{2,4})\s*[xX×]\s*(\d{2,4})\s*mm/,
      /W\s*(\d+)\s*[xX×]\s*H\s*(\d+)\s*[xX×]\s*D\s*(\d+)/i,
    ];
    const bodyText = $("body").text();
    for (const pat of dimPatterns) {
      const match = bodyText.match(pat);
      if (match) {
        result.dimensions = match[0];
        break;
      }
    }

    // Category detection from page text
    result.category = detectCategoryFromText(result.title + " " + bodyText.substring(0, 3000));
  } catch (error) {
    console.error("Scrape error:", error);
  }

  return result;
}

/**
 * Simple product image scraper (backward compatible)
 */
export async function scrapeProductImage(pdpUrl: string): Promise<string | null> {
  const info = await scrapeProductInfo(pdpUrl);
  return info.imageUrl;
}

function detectCountryFromUrl(url: string): string {
  const match = url.match(/lg\.com\/([a-z]{2})\//i);
  return match ? match[1].toLowerCase() : "_default";
}

function detectCategoryFromText(text: string): string {
  const lower = text.toLowerCase();
  const categories: [string, string[]][] = [
    ["washtower", ["washtower", "wash tower"]],
    ["washing_machine", ["washing machine", "washer", "dryer", "front load"]],
    ["tv", ["oled", "miniled", "qned", "nanocell", "uhd", "4k tv", "smart tv"]],
    ["refrigerator", ["refrigerator", "fridge", "freezer", "instaview", "multi-door"]],
    ["soundbar", ["soundbar", "sound bar"]],
    ["air_conditioner", ["air conditioner", "dualcool", "artcool"]],
    ["air_purifier", ["air purifier", "puricare 360"]],
    ["vacuum", ["vacuum", "cordzero"]],
    ["dishwasher", ["dishwasher", "quadwash"]],
    ["monitor", ["monitor", "ultragear", "ultrawide"]],
    ["laptop", ["laptop", "gram pro", "gram "]],
    ["projector", ["projector", "cinebeam"]],
    ["microwave", ["microwave", "neochef"]],
    ["styler", ["styler", "clothing care"]],
  ];

  for (const [cat, keywords] of categories) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "tv";
}

function isProductImage(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|avif)/i.test(url) || url.includes("image");
}

function isIcon(url: string): boolean {
  return /icon|logo|favicon|sprite|arrow|chevron|badge|star|rating/i.test(url);
}

function resolveUrl(src: string, base: string): string {
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  return new URL(src, base).href;
}
