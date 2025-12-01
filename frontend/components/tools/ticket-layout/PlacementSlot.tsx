// ============================================================================
// FILE: components/tools/ticket-layout/PlacementSlot.tsx
// ============================================================================

import { useState } from "react";
import { NumberingGenerator } from "@/lib/ticket-layout/numberingGenerator";
import { NumberingElement } from "@/lib/ticket-layout/zustandStore";

type Placement = {
  index: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotation?: number;
};

interface PlacementSlotProps {
  p: Placement;
  front?: any;
  pxPerMm: number;
  showBackSide?: boolean;
  paperWidthMm?: number;
  numberingElements?: NumberingElement[];
}

export default function PlacementSlot({
  p,
  front,
  pxPerMm,
  showBackSide = false,
  paperWidthMm = 210,
  numberingElements = [],
}: PlacementSlotProps) {
  const [imageError, setImageError] = useState(false);

  let xMm = p.xMm;
  let yMm = p.yMm;
  let rotation = p.rotation ?? 0;
  let displayWidth = p.widthMm;
  let displayHeight = p.heightMm;

  // Correct back side mirroring logic
  if (showBackSide) {
    // For back side, flip horizontally
    xMm = paperWidthMm - p.xMm - p.widthMm;
    yMm = p.yMm;
    
    // Adjust rotation for back side printing
    // When flipping horizontally:
    // 0° stays 0° (just mirrored)
    // 90° becomes 270° (mirrored + rotated)
    // 180° stays 180° (just mirrored)  
    // 270° becomes 90° (mirrored + rotated)
    if (rotation === 90) rotation = 270;
    else if (rotation === 270) rotation = 90;
    // 0° and 180° remain the same
  }

  // For 90° and 270° rotations, swap width and height for display
  // This ensures the container matches the visual rotation
  if (rotation === 90 || rotation === 270) {
    [displayWidth, displayHeight] = [displayHeight, displayWidth];
  }

  const left = xMm * pxPerMm;
  const top = yMm * pxPerMm;
  const w = displayWidth * pxPerMm;
  const h = displayHeight * pxPerMm;

  const slotStyle: React.CSSProperties = {
    position: "absolute",
    left,
    top,
    width: w,
    height: h,
    border: "1px dashed rgba(0,0,0,0.12)",
    boxSizing: "border-box",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: `rotate(${rotation}deg)`,
    transformOrigin: "center center",
  };

  const imageSrc = front?.url;

  // Generate numbering preview
  let numberingText = "";
  if (numberingElements && numberingElements.length > 0) {
    const generator = new NumberingGenerator(numberingElements);
    numberingText = generator.generateForTicket(p.index + 1);
  }

  return (
    <div key={p.index} style={slotStyle} title={`#${p.index + 1}`}>
      {imageSrc && !imageError ? (
        <img
          src={imageSrc}
          alt={front?.name ?? `slot-${p.index}`}
          onError={() => setImageError(true)}
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "contain", 
            display: "block", 
            maxWidth: "100%",
            maxHeight: "100%",
            // Ensure image isn't fighting the container rotation
            transform: rotation === 90 || rotation === 270 ? 'none' : undefined,
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full text-xs text-gray-500">
          {imageError ? "Image failed to load" : "No design"}
        </div>
      )}

      {/* Numbering overlay */}
      {numberingText && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 10,
            fontWeight: "bold",
            color: "#000000",
            backgroundColor: "rgba(255,255,255,0.8)",
            padding: "2px 6px",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {numberingText}
        </div>
      )}

      {/* Index badge */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          right: 8,
          fontSize: 10,
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "#00BFA6",
          padding: "2px 6px",
          borderRadius: "4px",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {p.index + 1}
      </div>
    </div>
  );
}