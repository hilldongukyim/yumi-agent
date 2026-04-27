/**
 * Server-side: returns Figma-faithful banner specs for client-side rendering.
 * Each spec carries the full FrameSpec from figma-manifest.json plus the user
 * content (headline / subcopy / CTA / images).
 */

import { getSelectedFrames, type FrameSpec } from "./figma-manifest";

interface RenderRequest {
  channel: string;
  sizes: string[];
  headline: string;
  subcopy?: string;
  ctaText?: string;
  productImageUrl?: string;
  lifestyleImageUrl?: string;
}

export interface BannerConfig {
  spec: FrameSpec;
  headlineText: string;
  subcopyText?: string;
  ctaText?: string;
  productImageUrl?: string;
  lifestyleImageUrl?: string;
}

export function prepareBanners(req: RenderRequest): BannerConfig[] {
  const frames = getSelectedFrames(req.channel, req.sizes);
  if (frames.length === 0) {
    throw new Error(
      `No frames found for ${req.channel} with sizes ${req.sizes.join(", ")}`
    );
  }

  return frames.map((spec) => ({
    spec,
    headlineText: req.headline,
    subcopyText: req.subcopy,
    ctaText: req.ctaText,
    productImageUrl: req.productImageUrl,
    lifestyleImageUrl: req.lifestyleImageUrl,
  }));
}
