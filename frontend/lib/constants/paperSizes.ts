// ============================================================================
// FILE: lib/constants/paperSizes.ts
// ============================================================================

export const PAPER_SIZES = {
  // ISO A-series
  A0: { w: 841, h: 1189, label: "A0 (841 × 1189 mm)" },
  A1: { w: 594, h: 841, label: "A1 (594 × 841 mm)" },
  A2: { w: 420, h: 594, label: "A2 (420 × 594 mm)" },
  A3: { w: 297, h: 420, label: "A3 (297 × 420 mm)" },
  A4: { w: 210, h: 297, label: "A4 (210 × 297 mm)" },
  A5: { w: 148, h: 210, label: "A5 (148 × 210 mm)" },
  A6: { w: 105, h: 148, label: "A6 (105 × 148 mm)" },
  A7: { w: 74, h: 105, label: "A7 (74 × 105 mm)" },

  // ISO B-series
  B4: { w: 250, h: 353, label: "B4 (250 × 353 mm)" },
  B5: { w: 176, h: 250, label: "B5 (176 × 250 mm)" },

  // US formats
  Letter: { w: 216, h: 279, label: "Letter (216 × 279 mm)" },
  Legal: { w: 216, h: 356, label: "Legal (216 × 356 mm)" },
  Tabloid: { w: 279, h: 432, label: "Tabloid (279 × 432 mm)" },
};

export type PaperSize = keyof typeof PAPER_SIZES | "Custom";

export function getPaperSize(size: string): { w: number; h: number } {
  return PAPER_SIZES[size as keyof typeof PAPER_SIZES] || PAPER_SIZES.A4;
}
