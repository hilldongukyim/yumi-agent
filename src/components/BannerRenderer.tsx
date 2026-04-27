"use client";

import { useEffect, useRef } from "react";
import html2canvas from "html2canvas-pro";

interface SlotBox {
  id: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: "horizontal" | "vertical";
}

interface DimSpec { x: number; y: number; w: number; h: number; fill: string }

interface LogoSpec { id: string; x: number; y: number; w: number; h: number; variant: "white" | "grey" }

interface TextSpec {
  id: string; x: number; y: number; w: number; h: number;
  fontFamily: string; fontWeight: number; fontSize: number;
  lineHeight: number; letterSpacing: number;
  align: "left" | "center" | "right" | "justified";
  color: string;
}

interface RectSpec {
  id: string; x: number; y: number; w: number; h: number;
  cornerRadius: number; fill: string;
}

interface FrameSpec {
  frameId: string; name: string; width: number; height: number;
  backgroundSlot: SlotBox;
  productSlot: SlotBox | null;
  dimLayer: DimSpec | null;
  logo: LogoSpec | null;
  headline?: TextSpec;
  subcopy?: TextSpec;
  ctaButton?: RectSpec;
  ctaText?: TextSpec;
}

export interface BannerConfig {
  spec: FrameSpec;
  headlineText: string;
  subcopyText?: string;
  ctaText?: string;
  productImageUrl?: string;
  lifestyleImageUrl?: string;
}

interface Props {
  banners: BannerConfig[];
  onRendered: (results: { name: string; dataUrl: string }[]) => void;
}

function textCss(t: TextSpec): React.CSSProperties {
  return {
    position: "absolute",
    left: t.x,
    top: t.y,
    width: t.w,
    // height intentionally omitted so multi-line text can grow inside its slot
    fontFamily: `'${t.fontFamily}', 'LG EI Headline', 'LG EI Text', 'Helvetica Neue', Arial, sans-serif`,
    fontWeight: t.fontWeight,
    fontSize: t.fontSize,
    lineHeight: `${t.lineHeight}px`,
    letterSpacing: t.letterSpacing ? `${t.letterSpacing}px` : undefined,
    textAlign: (t.align === "justified" ? "justify" : t.align) as React.CSSProperties["textAlign"],
    color: t.color,
    wordBreak: "keep-all",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
  };
}

function BannerElement({ config }: { config: BannerConfig }) {
  const { spec } = config;
  const { width: W, height: H } = spec;
  const bg = spec.backgroundSlot;
  const ps = spec.productSlot;

  const lifestyleUrl = config.lifestyleImageUrl;
  const productUrl = config.productImageUrl;

  return (
    <div style={{ width: W, height: H, position: "relative", background: "#1a1a1a", overflow: "hidden", fontFamily: "'LG EI Headline','LG EI Text','Helvetica Neue',Arial,sans-serif" }}>
      {/* 1) Background lifestyle image — fills entire frame */}
      {lifestyleUrl && (
        <img
          src={lifestyleUrl}
          crossOrigin="anonymous"
          style={{ position: "absolute", left: bg.x, top: bg.y, width: bg.w, height: bg.h, objectFit: "cover", zIndex: 1 }}
        />
      )}

      {/* 2) Dim layer */}
      {spec.dimLayer && (
        <div
          style={{
            position: "absolute",
            left: spec.dimLayer.x,
            top: spec.dimLayer.y,
            width: spec.dimLayer.w,
            height: spec.dimLayer.h,
            background: spec.dimLayer.fill,
            zIndex: 2,
          }}
        />
      )}

      {/* 3) Product cutout slot */}
      {ps && productUrl && (
        <div
          style={{
            position: "absolute",
            left: ps.x,
            top: ps.y,
            width: ps.w,
            height: ps.h,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={productUrl}
            crossOrigin="anonymous"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        </div>
      )}

      {/* 4) Logo */}
      {spec.logo && (
        <img
          src={`/figma/logo-${spec.logo.variant}.svg`}
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            left: spec.logo.x,
            top: spec.logo.y,
            width: spec.logo.w,
            height: spec.logo.h,
            zIndex: 6,
          }}
        />
      )}

      {/* 5) Headline */}
      {spec.headline && (
        <div style={{ ...textCss(spec.headline), zIndex: 5 }}>
          {config.headlineText}
        </div>
      )}

      {/* 6) Subcopy */}
      {spec.subcopy && config.subcopyText && (
        <div style={{ ...textCss(spec.subcopy), zIndex: 5 }}>
          {config.subcopyText}
        </div>
      )}

      {/* 7) CTA button */}
      {spec.ctaButton && config.ctaText && (
        <div
          style={{
            position: "absolute",
            left: spec.ctaButton.x,
            top: spec.ctaButton.y,
            width: spec.ctaButton.w,
            height: spec.ctaButton.h,
            background: spec.ctaButton.fill,
            borderRadius: spec.ctaButton.cornerRadius,
            zIndex: 5,
          }}
        />
      )}
      {spec.ctaText && config.ctaText && (
        <div
          style={{
            ...textCss(spec.ctaText),
            zIndex: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: spec.ctaText.align === "center" ? "center" : "flex-start",
            height: spec.ctaText.h,
          }}
        >
          {config.ctaText}
        </div>
      )}
    </div>
  );
}

export default function BannerRenderer({ banners, onRendered }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || banners.length === 0) return;

    const render = async () => {
      // Wait a bit for images and fonts to settle.
      await new Promise((r) => setTimeout(r, 800));
      try {
        // Wait for all images inside the staging area to finish loading.
        const imgs = Array.from(containerRef.current!.querySelectorAll("img"));
        await Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((res) => {
                  img.onload = () => res();
                  img.onerror = () => res();
                })
          )
        );
      } catch {}

      const results: { name: string; dataUrl: string }[] = [];
      const elements = containerRef.current!.querySelectorAll("[data-banner]");

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const b = banners[i];
        try {
          const canvas = await html2canvas(el, {
            width: b.spec.width,
            height: b.spec.height,
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          });
          results.push({ name: b.spec.name, dataUrl: canvas.toDataURL("image/png") });
        } catch (e) {
          console.error(`Render ${b.spec.name} failed:`, e);
        }
      }
      onRendered(results);
    };
    render();
  }, [banners, onRendered]);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", left: "-9999px", top: 0, opacity: 0, pointerEvents: "none" }}
    >
      {banners.map((b, i) => (
        <div key={i} data-banner={b.spec.name}>
          <BannerElement config={b} />
        </div>
      ))}
    </div>
  );
}
