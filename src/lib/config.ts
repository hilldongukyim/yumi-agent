/**
 * Banner template configuration — channels, frames, and editable layers.
 * Derived from Figma file: bjwT2QqOSmjHejS5z2XzqE
 */

export interface FrameConfig {
  name: string;
  id: string;
  width: number;
  height: number;
  layout: "wide" | "square" | "portrait" | "narrow" | "banner";
  hasSubcopy: boolean;
  hasCTA: boolean;
}

export interface ChannelConfig {
  label: string;
  description: string;
  frames: FrameConfig[];
}

function detectLayout(
  w: number,
  h: number
): "wide" | "square" | "portrait" | "narrow" | "banner" {
  const ratio = w / h;
  if (ratio > 3) return "banner"; // very wide strips (970x90, 468x60, etc.)
  if (ratio > 1.4) return "wide"; // landscape (970x250, 800x250, etc.)
  if (ratio > 0.8) return "square"; // squarish (1200x1200, 336x280, 320x320, etc.)
  if (w <= 160) return "narrow"; // very narrow columns (160x600, 120x600)
  return "portrait"; // tall (1080x1920, 300x600, 320x480, etc.)
}

function frame(
  name: string,
  id: string,
  w: number,
  h: number,
  opts?: { subcopy?: boolean; cta?: boolean }
): FrameConfig {
  return {
    name,
    id,
    width: w,
    height: h,
    layout: detectLayout(w, h),
    hasSubcopy: opts?.subcopy ?? h >= 250,
    hasCTA: opts?.cta ?? false,
  };
}

export const CHANNELS: Record<string, ChannelConfig> = {
  DV360: {
    label: "DV360",
    description: "Display & Video 360 programmatic ads",
    frames: [
      frame("DV360_970x250", "1:30", 970, 250, { subcopy: true, cta: true }),
      frame("DV360_970x90", "1:32", 970, 90),
      frame("DV360_800x250", "1:34", 800, 250, { cta: true }),
      frame("DV360_728x90", "1:38", 728, 90),
      frame("DV360_468x60", "1:40", 468, 60),
      frame("DV360_375x667", "1:42", 375, 667),
      frame("DV360_360x640", "1:44", 360, 640),
      frame("DV360_360x592", "1:46", 360, 592),
      frame("DV360_336x280", "1:58", 336, 280),
      frame("DV360_320x480", "1:60", 320, 480),
      frame("DV360_320x320", "1:62", 320, 320),
      frame("DV360_320x100", "1:64", 320, 100),
      frame("DV360_320x50", "1:66", 320, 50),
      frame("DV360_300x1050", "1:68", 300, 1050, {
        subcopy: true,
        cta: true,
      }),
      frame("DV360_300x600", "1:70", 300, 600),
      frame("DV360_300x250", "1:72", 300, 250),
      frame("DV360_300x100", "1:74", 300, 100),
      frame("DV360_300x50", "1:76", 300, 50),
      frame("DV360_250x250", "1:78", 250, 250),
      frame("DV360_160x600", "1:80", 160, 600),
      frame("DV360_120x600", "1:82", 120, 600),
    ],
  },
  Social: {
    label: "Social",
    description: "Social media (Facebook, Instagram, etc.)",
    frames: [
      frame("Social_1200x1200", "1:85", 1200, 1200, { subcopy: true }),
      frame("Social_1080x1920", "1:87", 1080, 1920, { subcopy: true }),
    ],
  },
  Criteo: {
    label: "Criteo",
    description: "Criteo retargeting ads",
    frames: [
      frame("Criteo_970x250", "1:7", 970, 250, { subcopy: true, cta: true }),
      frame("Criteo_970x90", "1:8", 970, 90),
      frame("Criteo_728x90", "1:12", 728, 90),
      frame("Criteo_480x320", "1:14", 480, 320, { subcopy: true, cta: true }),
      frame("Criteo_468x60", "1:16", 468, 60),
      frame("Criteo_336x280", "1:18", 336, 280, { cta: true }),
      frame("Criteo_320x480", "1:20", 320, 480),
      frame("Criteo_320x100", "1:22", 320, 100),
      frame("Criteo_320x50", "1:24", 320, 50),
      frame("Criteo_300x600", "1:26", 300, 600),
      frame("Criteo_120x600", "1:28", 120, 600, { cta: true }),
    ],
  },
  Email: {
    label: "Email",
    description: "Email marketing banners",
    frames: [frame("Email_650x800", "57:90", 650, 800, { subcopy: false })],
  },
};

/** Get a flat list of channel names */
export function getChannelList(): string[] {
  return Object.keys(CHANNELS);
}

/** Get sizes for a specific channel, formatted for display */
export function getChannelSizes(channel: string): string[] {
  const ch = CHANNELS[channel];
  if (!ch) return [];
  return ch.frames.map((f) => `${f.width}x${f.height}`);
}

/** Get frame configs for specific channel + selected sizes */
export function getSelectedFrames(
  channel: string,
  sizes: string[]
): FrameConfig[] {
  const ch = CHANNELS[channel];
  if (!ch) return [];
  if (sizes.includes("all")) return ch.frames;
  return ch.frames.filter((f) => sizes.includes(`${f.width}x${f.height}`));
}
