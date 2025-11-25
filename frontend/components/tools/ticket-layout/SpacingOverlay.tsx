// ============================================================================
// FILE: components/tools/ticket-layout/SpacingOverlay.tsx (NEW)
// ============================================================================

interface SpacingOverlayProps {
  placements: any[];
  spacingMm: number;
  pxPerMm: number;
  paperHeightPt: number;
}

export function SpacingOverlay({ placements, spacingMm, pxPerMm, paperHeightPt }: SpacingOverlayProps) {
  if (!placements || placements.length === 0 || spacingMm === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    >
      {placements.map((p, idx) => {
        const x = p.xMm * pxPerMm;
        const y = p.yMm * pxPerMm;
        const w = p.widthMm * pxPerMm;
        const h = p.heightMm * pxPerMm;

        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke="rgba(0, 191, 166, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
        );
      })}
    </svg>
  );
}