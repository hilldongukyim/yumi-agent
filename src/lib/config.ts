/**
 * Banner template configuration — channels, frames, and editable layers.
 * Font sizes are extracted directly from Figma file: bjwT2QqOSmjHejS5z2XzqE
 */

export interface TextStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

export interface FrameConfig {
  name: string;
  id: string;
  width: number;
  height: number;
  layout: "wide" | "square" | "portrait" | "narrow" | "banner";
  headline: TextStyle;
  subcopy?: TextStyle;
  cta?: TextStyle;
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
  if (ratio > 3) return "banner";
  if (ratio > 1.4) return "wide";
  if (ratio > 0.8) return "square";
  if (w <= 160) return "narrow";
  return "portrait";
}

function f(
  name: string,
  id: string,
  w: number,
  h: number,
  headline: TextStyle,
  subcopy?: TextStyle,
  cta?: TextStyle
): FrameConfig {
  return {
    name, id, width: w, height: h,
    layout: detectLayout(w, h),
    headline, subcopy, cta,
  };
}

export const CHANNELS: Record<string, ChannelConfig> = {
  DV360: {
    label: "DV360",
    description: "Display & Video 360 programmatic ads",
    frames: [
      f("DV360_970x250", "1:30", 970, 250,
        { fontSize: 40, fontWeight: 600, lineHeight: 40 },
        { fontSize: 20, fontWeight: 400, lineHeight: 23.4 },
        { fontSize: 20, fontWeight: 600, lineHeight: 23.4 }),
      f("DV360_970x90", "1:32", 970, 90,
        { fontSize: 25, fontWeight: 600, lineHeight: 40 }),
      f("DV360_800x250", "1:34", 800, 250,
        { fontSize: 40, fontWeight: 600, lineHeight: 40 },
        undefined,
        { fontSize: 20, fontWeight: 600, lineHeight: 23.4 }),
      f("DV360_728x90", "1:38", 728, 90,
        { fontSize: 23, fontWeight: 600, lineHeight: 30 }),
      f("DV360_468x60", "1:40", 468, 60,
        { fontSize: 17, fontWeight: 600, lineHeight: 20 }),
      f("DV360_375x667", "1:42", 375, 667,
        { fontSize: 30, fontWeight: 600, lineHeight: 40 }),
      f("DV360_360x640", "1:44", 360, 640,
        { fontSize: 30, fontWeight: 600, lineHeight: 40 }),
      f("DV360_360x592", "1:46", 360, 592,
        { fontSize: 30, fontWeight: 600, lineHeight: 40 }),
      f("DV360_336x280", "1:58", 336, 280,
        { fontSize: 27, fontWeight: 600, lineHeight: 35 }),
      f("DV360_320x480", "1:60", 320, 480,
        { fontSize: 25, fontWeight: 600, lineHeight: 30 }),
      f("DV360_320x320", "1:62", 320, 320,
        { fontSize: 25, fontWeight: 600, lineHeight: 30 }),
      f("DV360_320x100", "1:64", 320, 100,
        { fontSize: 18, fontWeight: 600, lineHeight: 20 }),
      f("DV360_320x50", "1:66", 320, 50,
        { fontSize: 13, fontWeight: 600, lineHeight: 15 }),
      f("DV360_300x1050", "1:68", 300, 1050,
        { fontSize: 32, fontWeight: 600, lineHeight: 40 },
        { fontSize: 22, fontWeight: 400, lineHeight: 28 },
        { fontSize: 20, fontWeight: 600, lineHeight: 23.4 }),
      f("DV360_300x600", "1:70", 300, 600,
        { fontSize: 32, fontWeight: 600, lineHeight: 40 }),
      f("DV360_300x250", "1:72", 300, 250,
        { fontSize: 20, fontWeight: 600, lineHeight: 22 }),
      f("DV360_300x100", "1:74", 300, 100,
        { fontSize: 15, fontWeight: 600, lineHeight: 20 }),
      f("DV360_300x50", "1:76", 300, 50,
        { fontSize: 13, fontWeight: 600, lineHeight: 15 }),
      f("DV360_250x250", "1:78", 250, 250,
        { fontSize: 15, fontWeight: 600, lineHeight: 20 }),
      f("DV360_160x600", "1:80", 160, 600,
        { fontSize: 23, fontWeight: 600, lineHeight: 27 }),
      f("DV360_120x600", "1:82", 120, 600,
        { fontSize: 20, fontWeight: 600, lineHeight: 25 }),
    ],
  },
  Social: {
    label: "Social",
    description: "Social media (Facebook, Instagram, etc.)",
    frames: [
      f("Social_1200x1200", "1:85", 1200, 1200,
        { fontSize: 70, fontWeight: 600, lineHeight: 67 },
        { fontSize: 40, fontWeight: 400, lineHeight: 46.8 }),
      f("Social_1080x1920", "1:87", 1080, 1920,
        { fontSize: 80, fontWeight: 600, lineHeight: 80 },
        { fontSize: 40, fontWeight: 400, lineHeight: 46.8 }),
    ],
  },
  Criteo: {
    label: "Criteo",
    description: "Criteo retargeting ads",
    frames: [
      f("Criteo_970x250", "1:7", 970, 250,
        { fontSize: 40, fontWeight: 600, lineHeight: 40 },
        { fontSize: 22, fontWeight: 400, lineHeight: 25.7 },
        { fontSize: 20, fontWeight: 600, lineHeight: 23.4 }),
      f("Criteo_970x90", "1:8", 970, 90,
        { fontSize: 30, fontWeight: 600, lineHeight: 30 }),
      f("Criteo_728x90", "1:12", 728, 90,
        { fontSize: 25, fontWeight: 600, lineHeight: 30 }),
      f("Criteo_480x320", "1:14", 480, 320,
        { fontSize: 30, fontWeight: 600, lineHeight: 35 },
        { fontSize: 17, fontWeight: 400, lineHeight: 19.9 },
        { fontSize: 15, fontWeight: 600, lineHeight: 17.5 }),
      f("Criteo_468x60", "1:16", 468, 60,
        { fontSize: 15, fontWeight: 600, lineHeight: 17 }),
      f("Criteo_336x280", "1:18", 336, 280,
        { fontSize: 27, fontWeight: 600, lineHeight: 35 },
        undefined,
        { fontSize: 15, fontWeight: 600, lineHeight: 17.5 }),
      f("Criteo_320x480", "1:20", 320, 480,
        { fontSize: 30, fontWeight: 600, lineHeight: 40 }),
      f("Criteo_320x100", "1:22", 320, 100,
        { fontSize: 15, fontWeight: 600, lineHeight: 20 }),
      f("Criteo_320x50", "1:24", 320, 50,
        { fontSize: 12, fontWeight: 600, lineHeight: 13 }),
      f("Criteo_300x600", "1:26", 300, 600,
        { fontSize: 30, fontWeight: 600, lineHeight: 40 }),
      f("Criteo_120x600", "1:28", 120, 600,
        { fontSize: 20, fontWeight: 600, lineHeight: 25 },
        undefined,
        { fontSize: 10, fontWeight: 600, lineHeight: 11.7 }),
    ],
  },
  Email: {
    label: "Email",
    description: "Email marketing banners",
    frames: [
      f("Email_650x800", "57:90", 650, 800,
        { fontSize: 43, fontWeight: 600, lineHeight: 50 }),
    ],
  },
};

export function getChannelList(): string[] {
  return Object.keys(CHANNELS);
}

export function getChannelSizes(channel: string): string[] {
  const ch = CHANNELS[channel];
  if (!ch) return [];
  return ch.frames.map((f) => `${f.width}x${f.height}`);
}

export function getSelectedFrames(channel: string, sizes: string[]): FrameConfig[] {
  const ch = CHANNELS[channel];
  if (!ch) return [];
  if (sizes.includes("all")) return ch.frames;
  return ch.frames.filter((f) => sizes.includes(`${f.width}x${f.height}`));
}
