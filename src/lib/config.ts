/**
 * Compatibility shim: re-export channel/frame helpers from the manifest module.
 * The hardcoded font-size table is gone — everything now lives in figma-manifest.json.
 */

import {
  CHANNEL_LIST,
  getChannelFrames,
  getChannelSizes,
  getSelectedFrames,
  getChannelDescription,
  type FrameSpec,
} from "./figma-manifest";

export type { FrameSpec };

export interface ChannelInfo {
  label: string;
  description: string;
  frames: FrameSpec[];
}

export const CHANNELS: Record<string, ChannelInfo> = Object.fromEntries(
  CHANNEL_LIST.map((key) => [
    key,
    {
      label: key,
      description: getChannelDescription(key),
      frames: getChannelFrames(key),
    },
  ])
);

export function getChannelList(): string[] {
  return CHANNEL_LIST;
}

export { getChannelSizes, getSelectedFrames };
