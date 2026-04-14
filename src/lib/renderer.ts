/**
 * Server-side: returns banner config data for client-side rendering.
 * Includes exact Figma font sizes per frame.
 */

import { getSelectedFrames } from "./config";

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
  headline: { fontSize: number; fontWeight: number; lineHeight: number };
  subcopy?: { fontSize: number; fontWeight: number; lineHeight: number };
  cta?: { fontSize: number; fontWeight: number; lineHeight: number };
  headlineText: string;
  subcopText?: string;
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
    headline: frame.headline,
    subcopy: frame.subcopy,
    cta: frame.cta,
    headlineText: req.headline,
    subcopText: req.subcopy,
    ctaText: req.ctaText,
    productImageUrl: req.productImageUrl,
  }));
}
