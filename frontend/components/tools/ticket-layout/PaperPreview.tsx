// ============================================================================
// FILE: components/tools/ticket-layout/PaperPreview.tsx
// ============================================================================

"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useStore } from "@/lib/ticket-layout/zustandStore";
import PlacementSlot from "./PlacementSlot";
import FittedBadge from "./FittedBadge";
import BottomAccent from "./BottomAccent";
import { SpacingOverlay } from "./SpacingOverlay";

type Placement = {
  index: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotation?: number;
};

interface PaperPreviewProps {
  wrapperRef?: React.RefObject<HTMLDivElement>;
}

export default function PaperPreview({ wrapperRef }: PaperPreviewProps) {
  const front = useStore((s) => s.front);
  const back = useStore((s) => s.back);
  const isDoubleSided = useStore((s) => s.isDoubleSided);
  const layout = useStore((s) => s.layout);
  const placements = useStore((s) => s.placements) as Placement[];
  const numberingElements = useStore((s) => s.numberingElements);

  const [showingFront, setShowingFront] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);
  const [fitted, setFitted] = useState<boolean>(false);

  const BASE_PX_PER_MM = 3;
  const pxPerMm = BASE_PX_PER_MM;

  const paperPx = useMemo(() => {
    const w = Math.round((layout.paperWidthMm ?? 210) * BASE_PX_PER_MM);
    const h = Math.round((layout.paperHeightMm ?? 297) * BASE_PX_PER_MM);
    return { w, h };
  }, [layout.paperWidthMm, layout.paperHeightMm]);

  const internalWrapperRef = useRef<HTMLDivElement | null>(null);
  const effectiveWrapperRef = wrapperRef || internalWrapperRef;

  const currentSide = showingFront ? front : back;
  const showToggle = isDoubleSided && back;

  // Calculate scale to fit
  useEffect(() => {
    function recompute() {
      const wrapper = effectiveWrapperRef.current;
      if (!wrapper) return;

      const style = getComputedStyle(wrapper);
      const padLeft = parseFloat(style.paddingLeft || "0");
      const padRight = parseFloat(style.paddingRight || "0");
      const padTop = parseFloat(style.paddingTop || "0");
      const padBottom = parseFloat(style.paddingBottom || "0");

      const availableWidth = Math.max(120, wrapper.clientWidth - padLeft - padRight - 40);
      const availableHeight = Math.max(200, wrapper.clientHeight - padTop - padBottom - 40);

      const scaleByWidth = availableWidth / paperPx.w;
      const scaleByHeight = availableHeight / paperPx.h;

      const newScale = Math.min(1, scaleByWidth, scaleByHeight);

      if (Math.abs(newScale - scale) > 0.001) {
        setScale(newScale);
        setFitted(newScale < 1);
      } else {
        setFitted(newScale < 1);
      }
    }

    recompute();
    const rAFHandler = () => window.requestAnimationFrame(recompute);
    window.addEventListener("resize", rAFHandler);
    const ro = new ResizeObserver(recompute);
    if (effectiveWrapperRef.current) ro.observe(effectiveWrapperRef.current);

    return () => {
      window.removeEventListener("resize", rAFHandler);
      try {
        ro.disconnect();
      } catch {}
    };
  }, [paperPx.w, paperPx.h, scale, effectiveWrapperRef]);

  const scaledWidth = paperPx.w * scale;
  const scaledHeight = paperPx.h * scale;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {fitted && <FittedBadge />}

      {/* Toggle Switch */}
      {showToggle && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "8px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: showingFront ? "#00BFA6" : "#6B7280",
            }}
          >
            FRONT
          </span>
          <button
            onClick={() => setShowingFront(!showingFront)}
            style={{
              position: "relative",
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              backgroundColor: showingFront ? "#00BFA6" : "#9CA3AF",
              border: "none",
              cursor: "pointer",
              transition: "background-color 200ms ease",
              outline: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: showingFront ? "2px" : "22px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "white",
                transition: "left 200ms ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </button>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: !showingFront ? "#00BFA6" : "#6B7280",
            }}
          >
            BACK
          </span>
        </div>
      )}

      {/* Paper */}
      <div
        style={{
          position: "relative",
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          flexShrink: 0,
        }}
      >
        <div
          className="relative rounded-md border bg-white shadow-xl"
          style={{
            width: `${paperPx.w}px`,
            height: `${paperPx.h}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 200ms ease",
            boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
            border: "1px solid rgba(15,23,42,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Spacing overlay */}
            <SpacingOverlay
              placements={placements}
              spacingMm={layout.spacingMm}
              pxPerMm={pxPerMm}
              paperHeightPt={paperPx.h}
            />

            {placements && placements.length > 0 ? (
              placements.map((p) => (
                <PlacementSlot
                  key={`${showingFront ? "front" : "back"}-${p.index}`}
                  p={p}
                  pxPerMm={pxPerMm}
                  front={currentSide}
                  showBackSide={!showingFront}
                  paperWidthMm={layout.paperWidthMm ?? 210}
                  numberingElements={numberingElements[showingFront ? "front" : "back"]}
                />
              ))
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#9CA3AF",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                No layout generated yet
              </div>
            )}
          </div>

          {/* Page label */}
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: 10,
              fontWeight: "600",
              color: "#6B7280",
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            {showingFront ? "FRONT" : "BACK"}
          </div>
        </div>

        <BottomAccent paperPx={paperPx} scale={scale} />
      </div>
    </div>
  );
}