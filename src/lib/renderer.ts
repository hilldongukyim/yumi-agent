import puppeteer from "puppeteer";
import { generateBannerHTML, BannerData } from "./templates";
import { getSelectedFrames, FrameConfig } from "./config";
import path from "path";
import fs from "fs";

interface RenderRequest {
  channel: string;
  sizes: string[];
  headline: string;
  subcopy?: string;
  ctaText?: string;
  productImageUrl?: string;
}

interface RenderResult {
  name: string;
  size: string;
  dataUrl: string;
}

export async function renderBanners(
  req: RenderRequest
): Promise<RenderResult[]> {
  const frames = getSelectedFrames(req.channel, req.sizes);
  if (frames.length === 0) {
    throw new Error(`No frames found for ${req.channel} with sizes ${req.sizes.join(", ")}`);
  }

  // Read and encode the LG logo
  const logoPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "lg-logo-white.png"
  );
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  const bannerData: BannerData = {
    headline: req.headline,
    subcopy: req.subcopy,
    ctaText: req.ctaText,
    productImageUrl: req.productImageUrl,
    logoDataUrl,
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results: RenderResult[] = [];

  try {
    for (const frame of frames) {
      const html = generateBannerHTML(frame, bannerData);

      const page = await browser.newPage();
      await page.setViewport({
        width: frame.width,
        height: frame.height,
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 300));

      const screenshot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: frame.width, height: frame.height },
      });

      const base64 = Buffer.from(screenshot).toString("base64");
      results.push({
        name: frame.name,
        size: `${frame.width}x${frame.height}`,
        dataUrl: `data:image/png;base64,${base64}`,
      });

      await page.close();
    }
  } finally {
    await browser.close();
  }

  return results;
}
