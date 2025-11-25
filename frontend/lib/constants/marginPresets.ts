// ============================================================================
// FILE: lib/constants/marginPresets.ts
// ============================================================================

export const MARGIN_PRESETS = {
  none: {
    label: "None",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    spacing: 0,
  },
  minimal: {
    label: "Minimal (3mm)",
    top: 3,
    bottom: 3,
    left: 3,
    right: 3,
    spacing: 2,
  },
  standard: {
    label: "Standard (5mm)",
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    spacing: 5,
  },
  wide: {
    label: "Wide (10mm)",
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
    spacing: 8,
  },
};

export type MarginPreset = keyof typeof MARGIN_PRESETS | "custom";