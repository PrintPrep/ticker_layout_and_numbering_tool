// components/tools/ticket-layout/NumberingEditor/Canvas.tsx

"use client";

import { useRef, useState, useEffect } from "react";
import { useStore } from "@/lib/ticket-layout/zustandStore";
import DraggableElement from "./DraggableElement";

interface CanvasProps {
  side: "front" | "back";
  designImageUrl?: string;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

export default function Canvas({
  side,
  designImageUrl,
  selectedElementId,
  onSelectElement,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [scale, setScale] = useState(1);

  const numberingElements = useStore((s) => s.numberingElements);
  const layout = useStore((s) => s.layout);

  const elements = numberingElements[side];

  // Calculate canvas scale based on card dimensions
  useEffect(() => {
    if (!canvasRef.current) return;

    const containerWidth = canvasRef.current.clientWidth;
    const containerHeight = canvasRef.current.clientHeight - 100; // Reserve space for controls

    // Card dimensions in mm
    const cardWidthMm = layout.cardWidthMm || 50;
    const cardHeightMm = layout.cardHeightMm || 90;

    // Convert mm to pixels (assuming 3.78 px/mm for screen display)
    const pxPerMm = 3.78;
    const cardWidthPx = cardWidthMm * pxPerMm;
    const cardHeightPx = cardHeightMm * pxPerMm;

    // Calculate scale to fit
    const scaleX = containerWidth / cardWidthPx;
    const scaleY = containerHeight / cardHeightPx;
    const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1

    setScale(newScale);
    setCanvasSize({
      width: cardWidthPx * newScale,
      height: cardHeightPx * newScale,
    });
  }, [layout.cardWidthMm, layout.cardHeightMm]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect if clicking on canvas background
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  return (
    <div ref={canvasRef} className="relative flex h-[600px] w-full flex-col items-center justify-center">
      {/* Scale indicator */}
      <div className="absolute right-4 top-4 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
        Scale: {Math.round(scale * 100)}%
      </div>

      {/* Canvas area */}
      <div
        className="relative rounded-lg border-2 border-gray-300 bg-white shadow-xl"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
        onClick={handleCanvasClick}
      >
        {/* Background design image */}
        {designImageUrl && (
          <img
            src={designImageUrl}
            alt="Design background"
            className="absolute inset-0 h-full w-full rounded-lg object-cover opacity-50"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* Numbering elements */}
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            side={side}
            scale={scale}
            isSelected={element.id === selectedElementId}
            onSelect={() => onSelectElement(element.id)}
          />
        ))}

        {/* Helper text when no elements */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">
                No numbering elements yet
              </p>
              <p className="text-xs text-gray-400">
                Click "Add Numbering Element" to start
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canvas info */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Canvas size: {layout.cardWidthMm}mm × {layout.cardHeightMm}mm
        {designImageUrl && " • Design preview visible"}
      </div>
    </div>
  );
}