/**
 * Server-side: returns banner config data for client-side rendering.
 * No Puppeteer — rendering happens in the browser with html2canvas.
 */

import { getSelectedFrames, FrameConfig } from "./config";

interface RenderRequest {
  channel: string;
  sizes: string[];
  headline: string;
  subcopy?: string;
  ctaText?: string;
  productImageUrl?: string;
}

export interface BannerConfig {
  name: string;
  width: number;
  height: number;
  layout: string;
  hasSubcopy: boolean;
  hasCTA: boolean;
  headline: string;
  subcopy?: string;
  ctaText?: string;
  productImageUrl?: string;
}

export function prepareBanners(req: RenderRequest): BannerConfig[] {
  const frames = getSelectedFrames(req.channel, req.sizes);
  if (frames.length === 0) {
    throw new Error(
      `No frames found for ${req.channel} with sizes ${req.sizes.join(", ")}`
    );
  }

  return frames.map((frame) => ({
    name: frame.name,
    width: frame.width,
    height: frame.height,
    layout: frame.layout,
    hasSubcopy: frame.hasSubcopy,
    hasCTA: frame.hasCTA,
    headline: req.headline,
    subcopy: req.subcopy,
    ctaText: req.ctaText,
    productImageUrl: req.productImageUrl,
  }));
}
