// ============================================================================
// FILE: components/tools/ticket-layout/PlacementSlot.tsx
// ============================================================================

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
  let xMm = p.xMm;
  let yMm = p.yMm;
  let rotation = p.rotation ?? 0;

  if (showBackSide) {
    const centerX = p.xMm + p.widthMm / 2;
    const centerY = p.yMm + p.heightMm / 2;
    const newCenterX = paperWidthMm - centerX;
    const newCenterY = centerY;
    xMm = newCenterX - p.widthMm / 2;
    yMm = newCenterY - p.heightMm / 2;

    if (rotation === 90) rotation = 270;
  }

  const left = xMm * pxPerMm;
  const top = yMm * pxPerMm;
  const w = p.widthMm * pxPerMm;
  const h = p.heightMm * pxPerMm;

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
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={front?.name ?? `slot-${p.index}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full text-xs text-gray-500">
          No design
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
        }}
      >
        {p.index + 1}
      </div>
    </div>
  );
}
