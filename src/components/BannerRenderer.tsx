"use client";

import { useEffect, useRef } from "react";
import html2canvas from "html2canvas-pro";

interface TextStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

interface BannerConfig {
  name: string;
  width: number;
  height: number;
  layout: string;
  headline: TextStyle;
  subcopy?: TextStyle;
  cta?: TextStyle;
  headlineText: string;
  subcopText?: string;
  ctaText?: string;
  productImageUrl?: string;
}

interface Props {
  banners: BannerConfig[];
  onRendered: (results: { name: string; dataUrl: string }[]) => void;
}

const BLOB_SVG = `<svg viewBox="0 0 824.247 902" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M824.247 451C824.247 700.08 622.328 902 373.248 902C240.739 902 121.577 844.853 39.0634 753.861C-64.751 639.38 71.2061 575.568 71.2061 451C71.2061 326.432 -64.751 262.62 39.0634 148.139C121.577 57.1465 240.739 0 373.248 0C622.328 0 824.247 201.92 824.247 451Z" fill="#262626"/></svg>`;

function BannerElement({ config: b }: { config: BannerConfig }) {
  const { width: w, height: h, layout } = b;
  const pad = Math.max(8, Math.round(Math.min(w, h) * 0.06));
  const refDim = Math.max(w, h);
  const logoW = Math.max(40, Math.round(refDim * 0.1));

  const productImg = b.productImageUrl ? (
    <img src={b.productImageUrl} crossOrigin="anonymous" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
  ) : null;

  const headline = (
    <div style={{ fontSize: b.headline.fontSize, fontWeight: b.headline.fontWeight, lineHeight: `${b.headline.lineHeight}px`, color: "white", wordBreak: "break-word" }}>
      {b.headlineText}
    </div>
  );

  const subcopy = b.subcopText && b.subcopy ? (
    <div style={{ fontSize: b.subcopy.fontSize, fontWeight: b.subcopy.fontWeight, lineHeight: `${b.subcopy.lineHeight}px`, color: "rgba(255,255,255,0.9)" }}>
      {b.subcopText}
    </div>
  ) : null;

  const cta = b.ctaText && b.cta ? (
    <div style={{
      display: "inline-block", background: "#a50034", color: "white",
      padding: `${Math.max(6, b.cta.fontSize * 0.45)}px ${b.cta.fontSize * 1.2}px`,
      borderRadius: 4, fontSize: b.cta.fontSize, fontWeight: b.cta.fontWeight,
      lineHeight: `${b.cta.lineHeight}px`, marginTop: pad * 0.3,
    }}>
      {b.ctaText}
    </div>
  ) : null;

  const blobStyle: React.CSSProperties = (() => {
    switch (layout) {
      case "banner": return { position: "absolute", right: -h * 0.3, top: -h * 0.8, width: h * 3, height: h * 3, zIndex: 2 };
      case "wide": return { position: "absolute", right: -w * 0.05, bottom: -h * 0.3, width: h * 2.5, height: h * 2.5, zIndex: 2 };
      case "narrow": return { position: "absolute", left: -w * 0.3, bottom: -h * 0.05, width: w * 2, height: w * 2.2, zIndex: 2 };
      case "portrait": return { position: "absolute", right: -w * 0.15, bottom: -h * 0.05, width: w * 1.1, height: w * 1.2, zIndex: 2 };
      default: return { position: "absolute", right: -w * 0.08, bottom: -h * 0.08, width: w * 0.85, height: h * 0.85, zIndex: 2 };
    }
  })();

  const circleSize = layout === "banner" ? h * 0.8
    : layout === "wide" ? h * 0.85
    : layout === "narrow" ? w * 0.75
    : layout === "portrait" ? Math.min(w * 0.55, h * 0.28)
    : Math.min(w, h) * 0.38;

  const isHorizontal = layout === "banner" || layout === "wide";

  return (
    <div style={{ width: w, height: h, position: "relative", background: "#8a8a8a", overflow: "hidden", fontFamily: "'LG EI Headline', 'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1 }} />
      <div style={blobStyle} dangerouslySetInnerHTML={{ __html: BLOB_SVG }} />
      <img src="/assets/lg-logo-white.png" crossOrigin="anonymous" style={{ position: "absolute", top: pad * 0.5, right: pad, width: layout === "narrow" ? Math.min(logoW, w * 0.6) : logoW, zIndex: 6 }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 5,
        display: "flex", flexDirection: isHorizontal ? "row" : "column",
        alignItems: isHorizontal ? "center" : "center",
        padding: isHorizontal ? `${pad}px ${pad * 1.5}px` : `${pad * 1.5}px ${pad}px ${pad}px`,
        gap: pad, textAlign: isHorizontal ? undefined : "center",
      }}>
        <div style={{ flex: isHorizontal ? 1 : undefined, display: "flex", flexDirection: "column", gap: pad * 0.4, marginTop: isHorizontal ? 0 : h * 0.08 }}>
          {headline}
          {subcopy}
          {cta}
        </div>
        <div style={{
          width: circleSize, height: circleSize, borderRadius: "50%",
          background: "rgba(255,255,255,0.25)", display: "flex",
          alignItems: "center", justifyContent: "center",
          flexShrink: 0, overflow: "hidden",
          marginTop: isHorizontal ? 0 : "auto",
          marginBottom: isHorizontal ? 0 : pad,
        }}>
          {productImg}
        </div>
      </div>
    </div>
  );
}

export default function BannerRenderer({ banners, onRendered }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || banners.length === 0) return;

    const render = async () => {
      await new Promise((r) => setTimeout(r, 500));
      const results: { name: string; dataUrl: string }[] = [];
      const elements = containerRef.current!.querySelectorAll("[data-banner]");

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        try {
          const canvas = await html2canvas(el, {
            width: banners[i].width, height: banners[i].height,
            scale: 1, useCORS: true, allowTaint: true, backgroundColor: null,
          });
          results.push({ name: banners[i].name, dataUrl: canvas.toDataURL("image/png") });
        } catch (e) {
          console.error(`Render ${banners[i].name} failed:`, e);
        }
      }
      onRendered(results);
    };
    render();
  }, [banners, onRendered]);

  return (
    <div ref={containerRef} style={{ position: "fixed", left: "-9999px", top: 0, opacity: 0, pointerEvents: "none" }}>
      {banners.map((b, i) => (
        <div key={i} data-banner={b.name}>
          <BannerElement config={b} />
        </div>
      ))}
    </div>
  );
}
