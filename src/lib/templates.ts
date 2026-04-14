/**
 * HTML banner template engine — uses exact Figma font sizes per frame.
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

export function generateBannerHTML(frame: FrameConfig, data: BannerData): string {
  const { width: w, height: h, layout } = frame;
  const hl = frame.headline;
  const sc = frame.subcopy;
  const ct = frame.cta;

  const pad = Math.max(8, Math.round(Math.min(w, h) * 0.06));
  const refDim = Math.max(w, h);
  const logoW = Math.max(40, Math.round(refDim * 0.1));

  const productImg = data.productImageUrl
    ? `<img src="${data.productImageUrl}" style="max-width:100%;max-height:100%;object-fit:contain;"/>`
    : "";

  const subcopyHtml = data.subcopy && sc
    ? `<div style="font-size:${sc.fontSize}px;font-weight:${sc.fontWeight};line-height:${sc.lineHeight}px;color:rgba(255,255,255,0.9);">${escapeHtml(data.subcopy)}</div>`
    : "";

  const ctaHtml = data.ctaText && ct
    ? `<div style="display:inline-block;background:#a50034;color:white;padding:${Math.max(6, ct.fontSize * 0.45)}px ${ct.fontSize * 1.2}px;border-radius:4px;font-size:${ct.fontSize}px;font-weight:${ct.fontWeight};line-height:${ct.lineHeight}px;margin-top:${pad * 0.3}px;">${escapeHtml(data.ctaText)}</div>`
    : "";

  // Layout-specific styles
  let layoutCSS = "";
  let layoutHTML = "";

  const headlineStyle = `font-size:${hl.fontSize}px;font-weight:${hl.fontWeight};line-height:${hl.lineHeight}px;color:white;word-break:break-word;`;

  switch (layout) {
    case "banner":
      layoutCSS = `
        .blob{position:absolute;right:${-h*0.3}px;top:${-h*0.8}px;width:${h*3}px;height:${h*3}px;z-index:2}
        .content{position:absolute;inset:0;z-index:5;display:flex;align-items:center;padding:0 ${pad}px;gap:${pad}px}
        .text-area{flex:1}
        .product-area{width:${h*0.8}px;height:${h*0.8}px;display:flex;align-items:center;justify-content:center}
        .logo{position:absolute;top:${pad*0.5}px;right:${pad}px;width:${logoW}px;z-index:6}`;
      layoutHTML = `<div class="content"><div class="text-area"><div style="${headlineStyle}">${escapeHtml(data.headline)}</div></div><div class="product-area">${productImg}</div></div>`;
      break;

    case "wide":
      layoutCSS = `
        .blob{position:absolute;right:${-w*0.05}px;bottom:${-h*0.3}px;width:${h*2.5}px;height:${h*2.5}px;z-index:2}
        .content{position:absolute;inset:0;z-index:5;display:flex;align-items:center;padding:${pad}px ${pad*1.5}px;gap:${pad}px}
        .text-area{flex:1;display:flex;flex-direction:column;gap:${pad*0.4}px}
        .product-area{width:${h*0.85}px;height:${h*0.85}px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
        .logo{position:absolute;top:${pad*0.5}px;right:${pad}px;width:${logoW}px;z-index:6}`;
      layoutHTML = `<div class="content"><div class="text-area"><div style="${headlineStyle}">${escapeHtml(data.headline)}</div>${subcopyHtml}${ctaHtml}</div><div class="product-area">${productImg}</div></div>`;
      break;

    case "narrow": {
      layoutCSS = `
        .blob{position:absolute;left:${-w*0.3}px;bottom:${-h*0.05}px;width:${w*2}px;height:${w*2.2}px;z-index:2}
        .content{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;padding:${pad}px;text-align:center}
        .text-area{flex:1;display:flex;flex-direction:column;justify-content:flex-start;gap:${pad*0.3}px;padding-top:${h*0.08}px}
        .product-area{width:${w*0.75}px;height:${w*0.75}px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;margin-top:auto;margin-bottom:${pad}px;overflow:hidden}
        .logo{position:absolute;top:${pad*0.5}px;right:${pad*0.5}px;width:${Math.min(logoW,w*0.6)}px;z-index:6}`;
      layoutHTML = `<div class="content"><div class="text-area"><div style="${headlineStyle}">${escapeHtml(data.headline)}</div>${ctaHtml}</div><div class="product-area">${productImg}</div></div>`;
      break;
    }

    case "portrait": {
      const circleSize = Math.round(Math.min(w * 0.55, h * 0.28));
      layoutCSS = `
        .blob{position:absolute;right:${-w*0.15}px;bottom:${-h*0.05}px;width:${w*1.1}px;height:${w*1.2}px;z-index:2}
        .content{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;padding:${pad*1.5}px ${pad}px ${pad}px;text-align:center}
        .text-area{display:flex;flex-direction:column;gap:${pad*0.5}px;margin-top:${h*0.08}px}
        .product-area{width:${circleSize}px;height:${circleSize}px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;margin-top:auto;margin-bottom:${h*0.05}px;overflow:hidden}
        .logo{position:absolute;top:${pad}px;right:${pad}px;width:${logoW}px;z-index:6}`;
      layoutHTML = `<div class="content"><div class="text-area"><div style="${headlineStyle}">${escapeHtml(data.headline)}</div>${subcopyHtml}</div><div class="product-area">${productImg}</div></div>`;
      break;
    }

    case "square":
    default: {
      const sqCircle = Math.round(Math.min(w, h) * 0.38);
      layoutCSS = `
        .blob{position:absolute;right:${-w*0.08}px;bottom:${-h*0.08}px;width:${w*0.85}px;height:${h*0.85}px;z-index:2}
        .content{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;padding:${pad}px;text-align:center}
        .text-area{display:flex;flex-direction:column;gap:${pad*0.4}px;margin-top:${h*0.1}px}
        .product-area{width:${sqCircle}px;height:${sqCircle}px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;margin:auto auto ${pad}px ${pad}px;overflow:hidden}
        .logo{position:absolute;top:${pad*0.6}px;right:${pad*0.6}px;width:${logoW}px;z-index:6}`;
      layoutHTML = `<div class="content"><div class="text-area"><div style="${headlineStyle}">${escapeHtml(data.headline)}</div>${subcopyHtml}${ctaHtml}</div><div class="product-area">${productImg}</div></div>`;
      break;
    }
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
@font-face{font-family:'LG EI Headline';src:local('LG EI Headline SemiBold');font-weight:600}
@font-face{font-family:'LG EI Headline';src:local('LG EI Headline Regular');font-weight:400}
body{font-family:'LG EI Headline','Helvetica Neue',Arial,sans-serif;overflow:hidden}
.banner{width:${w}px;height:${h}px;position:relative;background:#8a8a8a;overflow:hidden}
.dim{position:absolute;inset:0;background:rgba(0,0,0,0.4);z-index:1}
.blob svg{width:100%;height:100%}
${layoutCSS}
</style></head><body>
<div class="banner">
  <div class="dim"></div>
  <div class="blob">${BLOB_SVG}</div>
  <img class="logo" src="${data.logoDataUrl}" />
  ${layoutHTML}
</div>
</body></html>`;
}
