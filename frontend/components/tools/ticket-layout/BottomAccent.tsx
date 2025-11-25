// ============================================================================
// FILE: components/tools/ticket-layout/BottomAccent.tsx
// ============================================================================

export default function BottomAccent({
  paperPx,
  scale,
}: {
  paperPx: { w: number; h: number };
  scale: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        height: 8,
        width: Math.min(paperPx.w * (scale < 1 ? scale : 1), 640),
        borderRadius: 999,
        background: "linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02), rgba(0,0,0,0.06))",
        opacity: 0.6,
        pointerEvents: "none",
      }}
    />
  );
}