import manifestJson from "./figma-manifest.json";

export interface SlotBox {
  id: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: "horizontal" | "vertical";
}

export interface DimSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

export interface LogoSpec {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  variant: "white" | "grey";
}

export interface TextSpec {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  align: "left" | "center" | "right" | "justified";
  color: string;
}

export interface RectSpec {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cornerRadius: number;
  fill: string;
}

export interface FrameSpec {
  frameId: string;
  name: string;
  width: number;
  height: number;
  backgroundSlot: SlotBox;
  productSlot: SlotBox | null;
  dimLayer: DimSpec | null;
  logo: LogoSpec | null;
  headline?: TextSpec;
  subcopy?: TextSpec;
  ctaButton?: RectSpec;
  ctaText?: TextSpec;
}

interface Manifest {
  channels: Record<string, FrameSpec[]>;
}

const manifest = manifestJson as unknown as Manifest;

export const CHANNEL_LIST = Object.keys(manifest.channels);

export function getChannelFrames(channel: string): FrameSpec[] {
  return manifest.channels[channel] || [];
}

export function getChannelSizes(channel: string): string[] {
  return getChannelFrames(channel).map((f) => `${f.width}x${f.height}`);
}

export function getSelectedFrames(channel: string, sizes: string[]): FrameSpec[] {
  const all = getChannelFrames(channel);
  if (!sizes || sizes.length === 0 || sizes.includes("all")) return all;
  return all.filter((f) => sizes.includes(`${f.width}x${f.height}`));
}

export function getChannelDescription(channel: string): string {
  const map: Record<string, string> = {
    DV360: "Display & Video 360 programmatic ads",
    Social: "Social media (Facebook, Instagram, etc.)",
    Criteo: "Criteo retargeting ads",
    Email: "Email marketing banners",
  };
  return map[channel] || "";
}
