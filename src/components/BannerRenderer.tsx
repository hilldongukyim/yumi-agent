"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";

interface BannerConfig {
  name: string;
  width: number;
  height: number;
  layout: string;
  hasSubcopy: boolean;
  hasCTA: boolean;
  headline: string;
  subcopy?: string;
  ctaText?: string;
  productImageUrl?: string;
}

interface Props {
  banners: BannerConfig[];
  onRendered: (results: { name: string; dataUrl: string }[]) => void;
}

const BLOB_SVG = `<svg viewBox="0 0 824.247 902" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M824.247 451C824.247 700.08 622.328 902 373.248 902C240.739 902 121.577 844.853 39.0634 753.861C-64.751 639.38 71.2061 575.568 71.2061 451C71.2061 326.432 -64.751 262.62 39.0634 148.139C121.577 57.1465 240.739 0 373.248 0C622.328 0 824.247 201.92 824.247 451Z" fill="#262626"/>
</svg>`;

function getLayoutStyles(b: BannerConfig) {
  const { width: w, height: h, layout } = b;
  const pad = Math.max(8, Math.round(Math.min(w, h) * 0.06));
  const refDim = Math.max(w, h);
  const logoW = Math.max(40, Math.round(refDim * 0.1));

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

  return { pad, logoW, headlineSize, subcopySize, ctaSize };
}

function BannerElement({ config }: { config: BannerConfig }) {
  const { width: w, height: h, layout } = config;
  const s = getLayoutStyles(config);

  const productImg = config.productImageUrl ? (
    <img
      src={config.productImageUrl}
      crossOrigin="anonymous"
      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
    />
  ) : null;

  const headline = (
    <div
      style={{
        fontSize: s.headlineSize,
        fontWeight: 600,
        lineHeight: 1.12,
        color: "white",
        wordBreak: "break-word",
      }}
    >
      {config.headline}
    </div>
  );

  const subcopy =
    config.subcopy && config.hasSubcopy ? (
      <div
        style={{
          fontSize: s.subcopySize,
          fontWeight: 400,
          lineHeight: 1.35,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {config.subcopy}
      </div>
    ) : null;

  const cta =
    config.ctaText && config.hasCTA ? (
      <div
        style={{
          display: "inline-block",
          background: "#a50034",
          color: "white",
          padding: `${s.ctaSize * 0.5}px ${s.ctaSize * 1.2}px`,
          borderRadius: 4,
          fontSize: s.ctaSize,
          fontWeight: 500,
        }}
      >
        {config.ctaText}
      </div>
    ) : null;

  const blobStyle: React.CSSProperties = (() => {
    switch (layout) {
      case "banner":
        return { position: "absolute", right: -h * 0.3, top: -h * 0.8, width: h * 3, height: h * 3, zIndex: 2 };
      case "wide":
        return { position: "absolute", right: -w * 0.05, bottom: -h * 0.3, width: h * 2.5, height: h * 2.5, zIndex: 2 };
      case "narrow":
        return { position: "absolute", left: -w * 0.3, bottom: -h * 0.05, width: w * 2, height: w * 2.2, zIndex: 2 };
      case "portrait":
        return { position: "absolute", right: -w * 0.15, bottom: -h * 0.05, width: w * 1.1, height: w * 1.2, zIndex: 2 };
      default: // square
        return { position: "absolute", right: -w * 0.08, bottom: -h * 0.08, width: w * 0.85, height: h * 0.85, zIndex: 2 };
    }
  })();

  const circleSize =
    layout === "banner"
      ? h * 0.8
      : layout === "wide"
        ? h * 0.85
        : layout === "narrow"
          ? w * 0.75
          : layout === "portrait"
            ? Math.min(w * 0.55, h * 0.28)
            : Math.min(w, h) * 0.38;

  const renderContent = () => {
    if (layout === "banner" || layout === "wide") {
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            padding: `${s.pad}px ${s.pad * 1.5}px`,
            gap: s.pad,
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: s.pad * 0.4 }}>
            {headline}
            {subcopy}
            {cta}
          </div>
          <div
            style={{
              width: circleSize,
              height: circleSize,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {productImg}
          </div>
        </div>
      );
    }

    // portrait, narrow, square
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `${s.pad * 1.5}px ${s.pad}px ${s.pad}px`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: s.pad * 0.4, marginTop: h * 0.08 }}>
          {headline}
          {subcopy}
          {cta}
        </div>
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto",
            marginBottom: s.pad,
            overflow: "hidden",
          }}
        >
          {productImg}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: w,
        height: h,
        position: "relative",
        background: "#8a8a8a",
        overflow: "hidden",
        fontFamily: "'LG EI Headline', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1 }} />
      <div style={blobStyle} dangerouslySetInnerHTML={{ __html: BLOB_SVG }} />
      <img
        src="/assets/lg-logo-white.png"
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          top: s.pad * 0.5,
          right: s.pad,
          width: layout === "narrow" ? Math.min(s.logoW, w * 0.6) : s.logoW,
          zIndex: 6,
        }}
      />
      {renderContent()}
    </div>
  );
}

export default function BannerRenderer({ banners, onRendered }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    if (!containerRef.current || banners.length === 0) return;

    const render = async () => {
      // Wait for images to load
      await new Promise((r) => setTimeout(r, 500));

      const results: { name: string; dataUrl: string }[] = [];
      const elements = containerRef.current!.querySelectorAll("[data-banner]");

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const name = banners[i].name;

        try {
          const canvas = await html2canvas(el, {
            width: banners[i].width,
            height: banners[i].height,
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          });
          results.push({ name, dataUrl: canvas.toDataURL("image/png") });
        } catch (e) {
          console.error(`Render ${name} failed:`, e);
        }
      }

      setRendering(false);
      onRendered(results);
    };

    render();
  }, [banners, onRendered]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {banners.map((b, i) => (
        <div key={i} data-banner={b.name}>
          <BannerElement config={b} />
        </div>
      ))}
      {rendering && null}
    </div>
  );
}
