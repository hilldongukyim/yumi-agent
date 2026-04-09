/**
 * HTML banner template engine — generates HTML for any size/layout.
 * Adapts layout, font sizes, and element positions based on dimensions.
 */

import { FrameConfig } from "./config";

export interface BannerData {
  headline: string;
  subcopy?: string;
  ctaText?: string;
  productImageUrl?: string;
  logoDataUrl: string;
}

const BLOB_SVG = `<svg viewBox="0 0 824.247 902" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M824.247 451C824.247 700.08 622.328 902 373.248 902C240.739 902 121.577 844.853 39.0634 753.861C-64.751 639.38 71.2061 575.568 71.2061 451C71.2061 326.432 -64.751 262.62 39.0634 148.139C121.577 57.1465 240.739 0 373.248 0C622.328 0 824.247 201.92 824.247 451Z" fill="#262626"/>
</svg>`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}

/** Scale a value proportionally to banner width relative to a 1200px base */
function s(baseValue: number, bannerWidth: number, base = 1200): number {
  return Math.round(baseValue * (bannerWidth / base));
}

export function generateBannerHTML(
  frame: FrameConfig,
  data: BannerData
): string {
  const { width: w, height: h, layout } = frame;

  // Font sizes scaled to banner dimensions
  const refDim = Math.max(w, h);
  const headlineSize = Math.max(
    12,
    Math.round(
      layout === "banner"
        ? h * 0.45
        : layout === "wide"
          ? h * 0.25
          : layout === "narrow"
            ? w * 0.14
            : Math.min(w, h) * 0.08
    )
  );
  const subcopySize = Math.max(10, Math.round(headlineSize * 0.42));
  const ctaSize = Math.max(9, Math.round(headlineSize * 0.3));
  const logoWidth = Math.max(40, Math.round(refDim * 0.1));
  const padding = Math.max(8, Math.round(Math.min(w, h) * 0.06));

  const productImg = data.productImageUrl
    ? `<img src="${data.productImageUrl}" style="max-width:100%;max-height:100%;object-fit:contain;"/>`
    : "";

  const subcopyHtml =
    data.subcopy && frame.hasSubcopy
      ? `<div class="subcopy">${escapeHtml(data.subcopy)}</div>`
      : "";

  const ctaHtml =
    data.ctaText && frame.hasCTA
      ? `<div class="cta">${escapeHtml(data.ctaText)}</div>`
      : "";

  // Choose layout-specific CSS
  let layoutCSS = "";
  let layoutHTML = "";

  switch (layout) {
    case "banner": // very wide strips (970x90, 728x90, 468x60, 320x50, etc.)
      layoutCSS = `
        .blob { position:absolute; right:-${h * 0.3}px; top:-${h * 0.8}px; width:${h * 3}px; height:${h * 3}px; z-index:2; }
        .content { position:absolute; inset:0; z-index:5; display:flex; align-items:center; padding:0 ${padding}px; gap:${padding}px; }
        .text-area { flex:1; }
        .headline { font-size:${headlineSize}px; font-weight:600; line-height:1.15; color:white; }
        .product-area { width:${h * 0.8}px; height:${h * 0.8}px; display:flex; align-items:center; justify-content:center; }
        .logo { position:absolute; top:${padding * 0.5}px; right:${padding}px; width:${logoWidth}px; z-index:6; }
      `;
      layoutHTML = `
        <div class="content">
          <div class="text-area"><div class="headline">${escapeHtml(data.headline)}</div></div>
          <div class="product-area">${productImg}</div>
        </div>
      `;
      break;

    case "wide": // landscape (970x250, 800x250, 480x320, etc.)
      layoutCSS = `
        .blob { position:absolute; right:-${w * 0.05}px; bottom:-${h * 0.3}px; width:${h * 2.5}px; height:${h * 2.5}px; z-index:2; }
        .content { position:absolute; inset:0; z-index:5; display:flex; align-items:center; padding:${padding}px ${padding * 1.5}px; gap:${padding}px; }
        .text-area { flex:1; display:flex; flex-direction:column; gap:${padding * 0.4}px; }
        .headline { font-size:${headlineSize}px; font-weight:600; line-height:1.12; color:white; }
        .subcopy { font-size:${subcopySize}px; font-weight:400; line-height:1.3; color:rgba(255,255,255,0.9); }
        .cta { display:inline-block; background:#a50034; color:white; padding:${ctaSize * 0.5}px ${ctaSize * 1.2}px; border-radius:4px; font-size:${ctaSize}px; font-weight:500; margin-top:${padding * 0.3}px; }
        .product-area { width:${h * 0.85}px; height:${h * 0.85}px; border-radius:50%; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
        .logo { position:absolute; top:${padding * 0.5}px; right:${padding}px; width:${logoWidth}px; z-index:6; }
      `;
      layoutHTML = `
        <div class="content">
          <div class="text-area">
            <div class="headline">${escapeHtml(data.headline)}</div>
            ${subcopyHtml}
            ${ctaHtml}
          </div>
          <div class="product-area">${productImg}</div>
        </div>
      `;
      break;

    case "narrow": // very narrow columns (160x600, 120x600)
      layoutCSS = `
        .blob { position:absolute; left:-${w * 0.3}px; bottom:-${h * 0.05}px; width:${w * 2}px; height:${w * 2.2}px; z-index:2; }
        .content { position:absolute; inset:0; z-index:5; display:flex; flex-direction:column; align-items:center; padding:${padding}px; text-align:center; }
        .text-area { flex:1; display:flex; flex-direction:column; justify-content:flex-start; gap:${padding * 0.3}px; padding-top:${h * 0.08}px; }
        .headline { font-size:${headlineSize}px; font-weight:600; line-height:1.15; color:white; word-break:break-word; }
        .product-area { width:${w * 0.75}px; height:${w * 0.75}px; border-radius:50%; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; margin-top:auto; margin-bottom:${padding}px; overflow:hidden; }
        .logo { position:absolute; top:${padding * 0.5}px; right:${padding * 0.5}px; width:${Math.min(logoWidth, w * 0.6)}px; z-index:6; }
      `;
      layoutHTML = `
        <div class="content">
          <div class="text-area"><div class="headline">${escapeHtml(data.headline)}</div></div>
          <div class="product-area">${productImg}</div>
        </div>
      `;
      break;

    case "portrait": // tall (1080x1920, 300x600, 320x480, 360x640, 650x800, etc.)
      const circleSize = Math.round(Math.min(w * 0.55, h * 0.28));
      layoutCSS = `
        .blob { position:absolute; right:-${w * 0.15}px; bottom:-${h * 0.05}px; width:${w * 1.1}px; height:${w * 1.2}px; z-index:2; }
        .content { position:absolute; inset:0; z-index:5; display:flex; flex-direction:column; align-items:center; padding:${padding * 1.5}px ${padding}px ${padding}px; text-align:center; }
        .text-area { display:flex; flex-direction:column; gap:${padding * 0.5}px; margin-top:${h * 0.08}px; }
        .headline { font-size:${headlineSize}px; font-weight:600; line-height:1.1; color:white; }
        .subcopy { font-size:${subcopySize}px; font-weight:400; line-height:1.35; color:rgba(255,255,255,0.9); }
        .product-area { width:${circleSize}px; height:${circleSize}px; border-radius:50%; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; margin-top:auto; margin-bottom:${h * 0.05}px; overflow:hidden; }
        .logo { position:absolute; top:${padding}px; right:${padding}px; width:${logoWidth}px; z-index:6; }
      `;
      layoutHTML = `
        <div class="content">
          <div class="text-area">
            <div class="headline">${escapeHtml(data.headline)}</div>
            ${subcopyHtml}
          </div>
          <div class="product-area">${productImg}</div>
        </div>
      `;
      break;

    case "square": // squarish (1200x1200, 336x280, 320x320, 250x250, 300x250)
    default:
      const sqCircle = Math.round(Math.min(w, h) * 0.38);
      layoutCSS = `
        .blob { position:absolute; right:-${w * 0.08}px; bottom:-${h * 0.08}px; width:${w * 0.85}px; height:${h * 0.85}px; z-index:2; }
        .content { position:absolute; inset:0; z-index:5; display:flex; flex-direction:column; padding:${padding}px; text-align:center; }
        .text-area { display:flex; flex-direction:column; gap:${padding * 0.4}px; margin-top:${h * 0.1}px; }
        .headline { font-size:${headlineSize}px; font-weight:600; line-height:1.1; color:white; }
        .subcopy { font-size:${subcopySize}px; font-weight:400; line-height:1.35; color:rgba(255,255,255,0.9); }
        .cta { display:inline-block; background:#a50034; color:white; padding:${ctaSize * 0.4}px ${ctaSize}px; border-radius:3px; font-size:${ctaSize}px; font-weight:500; margin-top:${padding * 0.2}px; align-self:center; }
        .product-area { width:${sqCircle}px; height:${sqCircle}px; border-radius:50%; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; margin:auto auto ${padding}px ${padding}px; overflow:hidden; }
        .logo { position:absolute; top:${padding * 0.6}px; right:${padding * 0.6}px; width:${logoWidth}px; z-index:6; }
      `;
      layoutHTML = `
        <div class="content">
          <div class="text-area">
            <div class="headline">${escapeHtml(data.headline)}</div>
            ${subcopyHtml}
            ${ctaHtml}
          </div>
          <div class="product-area">${productImg}</div>
        </div>
      `;
      break;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @font-face {
    font-family: 'LG EI Headline';
    src: local('LG EI Headline SemiBold'), local('LGEIHeadline-SemiBold');
    font-weight: 600;
  }
  @font-face {
    font-family: 'LG EI Headline';
    src: local('LG EI Headline Regular'), local('LGEIHeadline-Regular');
    font-weight: 400;
  }
  body { font-family: 'LG EI Headline', 'Helvetica Neue', Arial, sans-serif; overflow:hidden; }
  .banner {
    width: ${w}px;
    height: ${h}px;
    position: relative;
    background: #8a8a8a;
    overflow: hidden;
  }
  .dim {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 1;
  }
  .blob svg { width:100%; height:100%; }
  ${layoutCSS}
</style>
</head>
<body>
<div class="banner">
  <div class="dim"></div>
  <div class="blob">${BLOB_SVG}</div>
  <img class="logo" src="${data.logoDataUrl}" />
  ${layoutHTML}
</div>
</body>
</html>`;
}
