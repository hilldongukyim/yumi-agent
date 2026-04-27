#!/usr/bin/env node
/**
 * One-off: fetch Figma frames for the 4 channels and emit src/lib/figma-manifest.json
 * Usage: node scripts/extract-figma-manifest.mjs
 *
 * Requires FIGMA_TOKEN and FIGMA_FILE_KEY in .env.local.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Load .env.local manually (no dotenv dep).
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}

const TOKEN = process.env.FIGMA_TOKEN;
const FILE = process.env.FIGMA_FILE_KEY;
if (!TOKEN || !FILE) {
  console.error("FIGMA_TOKEN / FIGMA_FILE_KEY not set");
  process.exit(1);
}

// Channel → frames (ids match Promotion-Content_Type-A file)
const CHANNELS = {
  DV360: [
    ["DV360_970x250", "1:21"],
    ["DV360_970x90", "1:30"],
    ["DV360_800x250", "1:36"],
    ["DV360_728x90", "1:44"],
    ["DV360_468x60", "1:50"],
    ["DV360_375x667", "1:56"],
    ["DV360_360x640", "1:186"],
    ["DV360_360x640_v2", "1:192"],
    ["DV360_360x592", "1:62"],
    ["DV360_360x592_v2", "1:68"],
    ["DV360_336x280", "1:74"],
    ["DV360_336x280_v2", "1:80"],
    ["DV360_320x480", "1:86"],
    ["DV360_320x480_v2", "1:92"],
    ["DV360_320x320", "1:98"],
    ["DV360_320x320_v2", "1:104"],
    ["DV360_320x100", "1:110"],
    ["DV360_320x100_v2", "1:116"],
    ["DV360_320x50", "1:122"],
    ["DV360_320x50_v2", "1:128"],
    ["DV360_300x1050", "1:134"],
    ["DV360_300x600", "1:143"],
    ["DV360_300x250", "1:149"],
    ["DV360_300x100", "1:155"],
    ["DV360_300x50", "1:161"],
    ["DV360_250x250", "1:168"],
    ["DV360_160x600", "1:174"],
    ["DV360_120x600", "1:180"],
  ],
  Social: [
    ["Social_1200x1200", "1:199"],
    ["Social_1080x1920", "1:206"],
  ],
  Criteo: [
    ["Criteo_970x250", "1:11"],
    ["Criteo_970x90", "1:213"],
    ["Criteo_728x90", "1:219"],
    ["Criteo_480x320", "1:225"],
    ["Criteo_468x60", "1:234"],
    ["Criteo_336x280", "1:240"],
    ["Criteo_320x480", "1:253"],
    ["Criteo_320x100", "1:259"],
    ["Criteo_320x50", "1:265"],
    ["Criteo_300x600", "1:271"],
    ["Criteo_120x600", "1:277"],
  ],
  Email: [["Email_650x800", "1:248"]],
};

async function fetchNodes(ids) {
  const url = `https://api.figma.com/v1/files/${FILE}/nodes?ids=${ids.join(",")}&depth=5`;
  const res = await fetch(url, { headers: { "X-Figma-Token": TOKEN } });
  if (!res.ok) throw new Error(`Figma ${res.status}: ${await res.text()}`);
  return res.json();
}

function rgba(fill) {
  if (!fill || fill.type !== "SOLID") return null;
  const c = fill.color;
  const a = fill.opacity !== undefined ? fill.opacity : c.a;
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}

function findChildren(node, predicate, results = []) {
  if (predicate(node)) results.push(node);
  if (node.children) for (const c of node.children) findChildren(c, predicate, results);
  return results;
}

function relBox(child, frame) {
  const b = child.absoluteBoundingBox;
  const f = frame.absoluteBoundingBox;
  if (!b || !f) return null;
  return {
    x: Math.round((b.x - f.x) * 100) / 100,
    y: Math.round((b.y - f.y) * 100) / 100,
    w: Math.round(b.width * 100) / 100,
    h: Math.round(b.height * 100) / 100,
  };
}

function clampBox(box, frameW, frameH) {
  const x = Math.max(0, box.x);
  const y = Math.max(0, box.y);
  const w = Math.min(frameW - x, box.x + box.w - x);
  const h = Math.min(frameH - y, box.y + box.h - y);
  return { x, y, w, h };
}

function textInfo(node, frame) {
  if (!node) return undefined;
  const s = node.style || {};
  const box = relBox(node, frame);
  const fill = node.fills && node.fills.find((f) => f.type === "SOLID");
  return {
    id: node.id,
    ...box,
    fontFamily: s.fontFamily,
    fontWeight: s.fontWeight,
    fontSize: s.fontSize,
    lineHeight: s.lineHeightPx || s.fontSize,
    letterSpacing: s.letterSpacing || 0,
    align: (s.textAlignHorizontal || "LEFT").toLowerCase(),
    color: rgba(fill) || "rgba(255,255,255,1)",
  };
}

function rectInfo(node, frame) {
  if (!node) return undefined;
  const box = relBox(node, frame);
  const fill = node.fills && node.fills.find((f) => f.type === "SOLID");
  return {
    id: node.id,
    ...box,
    cornerRadius: node.cornerRadius || 0,
    fill: rgba(fill) || "rgba(165,0,52,1)",
  };
}

function buildFrameEntry(frameNode) {
  const f = frameNode;
  const fb = f.absoluteBoundingBox;
  const W = fb.width;
  const H = fb.height;

  // Find slots
  const eiShapes = findChildren(f, (n) =>
    n.type === "INSTANCE" && /^EI-Shape_/.test(n.name || "")
  );
  // Criteo_970x250 special: product slot named "product A"
  const productAlt = findChildren(f, (n) => n.type === "INSTANCE" && n.name === "product A");
  for (const p of productAlt) eiShapes.push(p);

  // Sort by area; first = background (largest visible coverage),
  // remaining smaller ones = product slot.
  eiShapes.sort((a, b) => {
    const aa = a.absoluteBoundingBox.width * a.absoluteBoundingBox.height;
    const bb = b.absoluteBoundingBox.width * b.absoluteBoundingBox.height;
    return bb - aa;
  });
  // background = largest
  const backgroundNode = eiShapes[0];
  // product = smallest (different from background)
  const productNode = eiShapes.length > 1 ? eiShapes[eiShapes.length - 1] : null;

  // Background slot is always the entire frame (image fills it via cover).
  const backgroundSlot = backgroundNode
    ? { id: backgroundNode.id, x: 0, y: 0, w: W, h: H }
    : { id: null, x: 0, y: 0, w: W, h: H };

  // Product slot: take its absolute box, then clamp to frame.
  let productSlot = null;
  if (productNode && productNode !== backgroundNode) {
    const raw = relBox(productNode, f);
    const clamped = clampBox(raw, W, H);
    if (clamped.w > 4 && clamped.h > 4) {
      productSlot = { id: productNode.id, ...clamped, shape: /Vertical/.test(productNode.name) ? "vertical" : "horizontal" };
    }
  }

  // Dim layer
  const dimNode = findChildren(f, (n) => n.name === "Dim_Layer")[0];
  let dimLayer = null;
  if (dimNode) {
    const raw = relBox(dimNode, f);
    const clamped = clampBox(raw, W, H);
    const fill = dimNode.fills && dimNode.fills.find((x) => x.type === "SOLID");
    dimLayer = { ...clamped, fill: rgba(fill) || "rgba(0,0,0,0.4)" };
  }

  // Logo
  const logoNode = findChildren(f, (n) => /^LG Logo_/.test(n.name || ""))[0];
  let logo = null;
  if (logoNode) {
    const box = relBox(logoNode, f);
    logo = {
      id: logoNode.id,
      ...box,
      variant: /Grey/i.test(logoNode.name) ? "grey" : "white",
    };
  }

  // Texts (handle Frame 1 wrapper: search recursively)
  const headlineNode = findChildren(f, (n) => n.name === "Copy_Headline")[0];
  const subcopyNode = findChildren(f, (n) => n.name === "Copy_Subcopy")[0];
  const ctaTextNode = findChildren(f, (n) => n.name === "Copy_CTA_White")[0];
  const ctaButtonNode = findChildren(f, (n) => n.name === "Button_CTA_Red")[0];

  return {
    frameId: f.id,
    name: f.name,
    width: W,
    height: H,
    backgroundSlot,
    productSlot,
    dimLayer,
    logo,
    headline: textInfo(headlineNode, f),
    subcopy: textInfo(subcopyNode, f),
    ctaButton: rectInfo(ctaButtonNode, f),
    ctaText: textInfo(ctaTextNode, f),
  };
}

async function main() {
  const allIds = Object.values(CHANNELS).flat().map(([, id]) => id);
  console.log(`Fetching ${allIds.length} frames…`);
  // Fetch in chunks of 20
  const chunks = [];
  for (let i = 0; i < allIds.length; i += 20) chunks.push(allIds.slice(i, i + 20));
  const merged = {};
  for (const c of chunks) {
    const data = await fetchNodes(c);
    Object.assign(merged, data.nodes);
  }

  const manifest = { channels: {} };
  for (const [channel, frames] of Object.entries(CHANNELS)) {
    manifest.channels[channel] = [];
    for (const [name, id] of frames) {
      const node = merged[id];
      if (!node || !node.document) {
        console.warn(`Missing node ${id} (${name})`);
        continue;
      }
      const entry = buildFrameEntry(node.document);
      entry.expectedName = name;
      manifest.channels[channel].push(entry);
    }
  }

  const out = path.join(root, "src", "lib", "figma-manifest.json");
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${out}`);

  // Quick sanity log
  for (const [ch, list] of Object.entries(manifest.channels)) {
    console.log(`\n${ch}: ${list.length} frames`);
    for (const f of list) {
      const flags = [
        f.headline ? "H" : "-",
        f.subcopy ? "S" : "-",
        f.ctaButton ? "B" : "-",
        f.ctaText ? "T" : "-",
        f.productSlot ? "P" : "-",
        f.logo ? `L:${f.logo.variant[0]}` : "-",
      ].join("");
      console.log(`  ${f.name.padEnd(20)} ${f.width}x${f.height}  [${flags}]`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
