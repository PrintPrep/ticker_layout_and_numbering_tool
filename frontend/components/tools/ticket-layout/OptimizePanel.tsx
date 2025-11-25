// ============================================================================
// FILE: components/tools/ticket-layout/OptimizePanel.tsx
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/ticket-layout/zustandStore";
import { optimizeLayout } from "@/lib/ticket-layout/optimize";
import { PAPER_SIZES, PaperSize } from "@/lib/constants/paperSizes";
import { MARGIN_PRESETS, MarginPreset } from "@/lib/constants/marginPresets";

export default function OptimizePanel() {
  const layout = useStore((s) => s.layout);
  const setLayout = useStore((s) => s.setLayout);
  const setPlacements = useStore((s) => s.setPlacements);

  const [lastResult, setLastResult] = useState({ fitted: 0 });

  // Auto-optimize whenever layout changes
  useEffect(() => {
    const opts = {
      paperWidthMm: layout.paperWidthMm,
      paperHeightMm: layout.paperHeightMm,
      cardWidthMm: layout.cardWidthMm,
      cardHeightMm: layout.cardHeightMm,
      cardCount: layout.cardCount > 0 ? layout.cardCount : undefined,
      topMarginMm: layout.topMarginMm,
      bottomMarginMm: layout.bottomMarginMm,
      leftMarginMm: layout.leftMarginMm,
      rightMarginMm: layout.rightMarginMm,
      spacingMm: layout.spacingMm,
      horizontalOnly: layout.horizontalOnly,
      verticalOnly: layout.verticalOnly,
      autoRotate: layout.autoRotate,
    };

    const res = optimizeLayout(opts);
    setPlacements(res.placements);
    setLastResult({ fitted: res.fittedCount });
  }, [
    layout.paperWidthMm,
    layout.paperHeightMm,
    layout.cardWidthMm,
    layout.cardHeightMm,
    layout.cardCount,
    layout.topMarginMm,
    layout.bottomMarginMm,
    layout.leftMarginMm,
    layout.rightMarginMm,
    layout.spacingMm,
    layout.horizontalOnly,
    layout.verticalOnly,
    layout.autoRotate,
  ]);

  const handlePaperSizeChange = (size: string) => {
    setLayout({ paperSize: size });
    if (size !== "Custom") {
      const dims = PAPER_SIZES[size as keyof typeof PAPER_SIZES];
      setLayout({
        paperWidthMm: dims.w,
        paperHeightMm: dims.h,
      });
    }
  };

  const handleMarginPresetChange = (preset: MarginPreset) => {
    setLayout({ marginPreset: preset });
    if (preset !== "custom") {
      const margins = MARGIN_PRESETS[preset];
      setLayout({
        topMarginMm: margins.top,
        bottomMarginMm: margins.bottom,
        leftMarginMm: margins.left,
        rightMarginMm: margins.right,
        spacingMm: margins.spacing,
      });
    }
  };

  const handleCardHeightChange = (newHeight: number) => {
    setLayout({ cardHeightMm: newHeight });

    if (layout.aspectRatioLocked && layout.aspectRatio && newHeight > 0) {
      const newWidth = newHeight * layout.aspectRatio;
      setLayout({ cardWidthMm: newWidth });
    }
  };

  return (
    <aside className="w-full max-w-sm space-y-4">
      {/* Paper Size */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          Paper Size
        </label>
        <select
          value={layout.paperSize}
          onChange={(e) => handlePaperSizeChange(e.target.value)}
          className="w-full rounded-lg border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]"
        >
          {Object.entries(PAPER_SIZES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
          <option value="Custom">Custom</option>
        </select>

        {layout.paperSize === "Custom" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Width (mm)</label>
              <input
                type="number"
                value={layout.paperWidthMm}
                onChange={(e) => setLayout({ paperWidthMm: parseFloat(e.target.value) })}
                className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">Height (mm)</label>
              <input
                type="number"
                value={layout.paperHeightMm}
                onChange={(e) => setLayout({ paperHeightMm: parseFloat(e.target.value) })}
                className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orientation Options */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          Orientation
        </label>
        
        <select
          value={
            layout.horizontalOnly ? "horizontal" :
            layout.verticalOnly ? "vertical" :
            layout.autoRotate ? "auto" :
            "none"
          }
          onChange={(e) => {
            const value = e.target.value;
            setLayout({
              horizontalOnly: value === "horizontal",
              verticalOnly: value === "vertical",
              autoRotate: value === "auto",
            });
          }}
          className="w-full rounded-lg border border-gray-300 text-gray-500 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]"
        >
          <option value="auto">Auto-rotate (fit more)</option>
          <option value="horizontal">Horizontal only</option>
          <option value="vertical">Vertical only</option>
          <option value="none">No rotation</option>
        </select>
        
        <p className="mt-2 text-xs text-gray-500">
          {layout.autoRotate && "Will try both orientations for optimal fit"}
          {layout.horizontalOnly && "Cards will only be placed horizontally"}
          {layout.verticalOnly && "Cards will only be placed vertically"}
          {!layout.autoRotate && !layout.horizontalOnly && !layout.verticalOnly && "Cards placed without rotation"}
        </p>
      </div>

      {/* Card Dimensions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Card Size (mm)
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={layout.aspectRatioLocked}
              onChange={(e) => setLayout({ aspectRatioLocked: e.target.checked })}
              className="rounded"
            />
            Lock ratio
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Width</label>
            <input
              type="number"
              value={layout.cardWidthMm}
              onChange={(e) => setLayout({ cardWidthMm: parseFloat(e.target.value) })}
              disabled={layout.aspectRatioLocked}
              className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-50 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Height</label>
            <input
              type="number"
              value={layout.cardHeightMm}
              onChange={(e) => handleCardHeightChange(parseFloat(e.target.value))}
              className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Margins & Spacing */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          Margins & Spacing
        </label>

        <select
          value={layout.marginPreset}
          onChange={(e) => handleMarginPresetChange(e.target.value as MarginPreset)}
          className="mb-3 w-full rounded-lg border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {Object.entries(MARGIN_PRESETS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>

        {layout.marginPreset === "custom" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Top</label>
                <input
                  type="number"
                  value={layout.topMarginMm}
                  onChange={(e) => setLayout({ topMarginMm: parseFloat(e.target.value) })}
                  className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Bottom</label>
                <input
                  type="number"
                  value={layout.bottomMarginMm}
                  onChange={(e) => setLayout({ bottomMarginMm: parseFloat(e.target.value) })}
                  className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Left</label>
                <input
                  type="number"
                  value={layout.leftMarginMm}
                  onChange={(e) => setLayout({ leftMarginMm: parseFloat(e.target.value) })}
                  className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Right</label>
                <input
                  type="number"
                  value={layout.rightMarginMm}
                  onChange={(e) => setLayout({ rightMarginMm: parseFloat(e.target.value) })}
                  className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">Spacing (gap)</label>
              <input
                type="number"
                value={layout.spacingMm}
                onChange={(e) => setLayout({ spacingMm: parseFloat(e.target.value) })}
                className="w-full rounded border text-gray-500 border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Count */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          Total Copies
        </label>
        <input
          type="number"
          min={0}
          value={layout.cardCount}
          onChange={(e) => setLayout({ cardCount: parseInt(e.target.value) })}
          placeholder="0 = fill maximum"
          className="w-full rounded-lg border text-gray-500 border-gray-300 px-3 py-2 text-sm shadow-sm"
        />
      </div>

      {/* Fitted Count */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Fitted
          </span>
          <span className="rounded-full bg-[#00BFA6] px-3 py-1 text-sm font-bold text-white">
            {lastResult.fitted}
          </span>
        </div>
      </div>
    </aside>
  );
}