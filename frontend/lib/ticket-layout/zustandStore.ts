// lib/ticket-layout/zustandStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * SideFile represents an uploaded side (front/back)
 */
export type SideFile = {
  id: string;
  name: string;
  type: "pdf" | "image";
  file?: File;
  url: string;
  previewUrl?: string;
  dimensions?: {
    widthMm: number;
    heightMm: number;
    aspectRatio: number;
  };
};

/**
 * Numbering Element Configuration
 */
export type SubElementConfig = {
  // Text type
  text?: string;

  // Numeric type
  numericType?: "123" | "roman_lower" | "roman_upper" | "abc_lower" | "abc_upper" | "hex";
  digits?: "fixed" | "dynamic";
  fixedDigitCount?: number;
  flow?: "increment" | "decrement";
  startValue?: number;
  step?: number;

  // Styling (common)
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline?: boolean;
  color: string;
};

export type SubElement = {
  id: string;
  order: number;
  type: "text" | "numeric";
  config: SubElementConfig;
  columnMapping?: string; // For CSV/XLSX mapping
};

export type SeparatorConfig = {
  type: "hyphen" | "underscore" | "dot" | "comma" | "space" | "none" | "custom";
  customValue?: string;
};

export type ContainerStyle = {
  backgroundColor: string;
  backgroundOpacity: number;
  borderWidth: number;
  borderColor: string;
  borderOpacity: number;
  borderRadius: number;
  padding: number;
  textAlign: "left" | "center" | "right";
};

export type QRCodeAddon = {
  enabled: boolean;
  dataSource: "element" | "custom" | "column" | "url" | "vcard" | "wifi" | "email";
  sourceElementId?: string;
  customData?: string;
  columnName?: string;
  structuredData?: any;
  size: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  position: { x: number; y: number };
};

export type BarcodeAddon = {
  enabled: boolean;
  type: "code128" | "ean13" | "ean8" | "upca" | "code39";
  dataSource: "element" | "custom" | "column";
  sourceElementId?: string;
  customData?: string;
  columnName?: string;
  showText: boolean;
  height: number;
  position: { x: number; y: number };
};

export type ImageAddon = {
  enabled: boolean;
  imageId: string;
  imageUrl: string;
  size: { width: number; height: number };
  position: { x: number; y: number };
  opacity: number;
  repeatPerTicket: boolean;
};

export type NumberingElement = {
  id: string;
  side: "front" | "back";
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  subElements: SubElement[];
  separator: SeparatorConfig;
  layout: {
    direction: "horizontal" | "vertical";
    alignment: "left" | "center" | "right";
    spacing: number;
  };
  containerStyle: ContainerStyle;
  addons?: {
    qrCode?: QRCodeAddon;
    barcode?: BarcodeAddon;
    image?: ImageAddon;
  };
};

/**
 * Layout Configuration
 */
export type LayoutOptions = {
  paperSize: string; // 'A4', 'A3', 'Letter', 'Custom', etc.
  paperWidthMm: number;
  paperHeightMm: number;
  cardWidthMm: number;
  cardHeightMm: number;
  cardCount: number;

  // Margins (distance from paper edge)
  marginPreset: "none" | "minimal" | "standard" | "wide" | "custom";
  topMarginMm: number;
  bottomMarginMm: number;
  leftMarginMm: number;
  rightMarginMm: number;

  // Spacing (gap between tickets)
  spacingMm: number;

  // Orientation
  horizontalOnly: boolean;
  verticalOnly: boolean;
  autoRotate: boolean;

  aspectRatioLocked: boolean;
  aspectRatio?: number;
};

/**
 * Imported Data Reference
 */
export type ImportedData = {
  importId: string;
  columns: string[];
  rowCount: number;
  preview: any[];
  expiresAt: string;
};

/**
 * Main Store
 */
type Store = {
  // Wizard state
  isDoubleSided: boolean | null;
  front?: SideFile;
  back?: SideFile;
  setSide: (side: "front" | "back", file: SideFile) => void;
  removeSide: (side: "front" | "back") => void;
  setDoubleSided: (v: boolean) => void;
  resetWizard: () => void;

  // Numbering state
  numberingElements: {
    front: NumberingElement[];
    back: NumberingElement[];
  };
  addNumberingElement: (side: "front" | "back", element: NumberingElement) => void;
  updateNumberingElement: (side: "front" | "back", elementId: string, updates: Partial<NumberingElement>) => void;
  removeNumberingElement: (side: "front" | "back", elementId: string) => void;
  setNumberingElements: (side: "front" | "back", elements: NumberingElement[]) => void;

  // Imported data
  importedData?: ImportedData;
  setImportedData: (data: ImportedData | undefined) => void;

  // Workspace state
  layout: LayoutOptions;
  setLayout: (patch: Partial<LayoutOptions>) => void;

  // Optimization result (placements)
  placements: any[];
  setPlacements: (p: any[]) => void;

  // Project management
  projectId?: string;
  projectName?: string;
  setProject: (id: string, name: string) => void;
  clearProject: () => void;

  // Auto-save status (for UI indicator)
  lastSaved?: string;
  setLastSaved: (timestamp: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ==================== WIZARD STATE ====================
      isDoubleSided: null,
      front: undefined,
      back: undefined,

      setSide: (side, file) => {
        const prev = get()[side];
        if (prev?.url) {
          try {
            URL.revokeObjectURL(prev.url);
          } catch (e) {}
        }
        set({ [side]: file } as any);
      },

      removeSide: (side) => {
        const prev = get()[side];
        if (prev?.url) {
          try {
            URL.revokeObjectURL(prev.url);
          } catch (e) {}
        }
        set({ [side]: undefined } as any);
      },

      setDoubleSided: (v) => set({ isDoubleSided: v }),

      resetWizard: () => {
        const { front, back } = get();
        if (front?.url) try { URL.revokeObjectURL(front.url); } catch (e) {}
        if (back?.url) try { URL.revokeObjectURL(back.url); } catch (e) {}
        set({ isDoubleSided: null, front: undefined, back: undefined });
      },

      // ==================== NUMBERING STATE ====================
      numberingElements: {
        front: [],
        back: [],
      },

      addNumberingElement: (side, element) => {
        set((state) => ({
          numberingElements: {
            ...state.numberingElements,
            [side]: [...state.numberingElements[side], element],
          },
        }));
      },

      updateNumberingElement: (side, elementId, updates) => {
        set((state) => ({
          numberingElements: {
            ...state.numberingElements,
            [side]: state.numberingElements[side].map((el) =>
              el.id === elementId ? { ...el, ...updates } : el
            ),
          },
        }));
      },

      removeNumberingElement: (side, elementId) => {
        set((state) => ({
          numberingElements: {
            ...state.numberingElements,
            [side]: state.numberingElements[side].filter((el) => el.id !== elementId),
          },
        }));
      },

      setNumberingElements: (side, elements) => {
        set((state) => ({
          numberingElements: {
            ...state.numberingElements,
            [side]: elements,
          },
        }));
      },

      // ==================== IMPORTED DATA ====================
      importedData: undefined,
      setImportedData: (data) => set({ importedData: data }),

      // ==================== LAYOUT STATE ====================
      layout: {
        paperSize: "A4",
        paperWidthMm: 210,
        paperHeightMm: 297,
        cardWidthMm: 50,
        cardHeightMm: 90,
        cardCount: 10,

        marginPreset: "standard",
        topMarginMm: 5,
        bottomMarginMm: 5,
        leftMarginMm: 5,
        rightMarginMm: 5,
        spacingMm: 5,

        horizontalOnly: false,
        verticalOnly: false,
        autoRotate: true,

        aspectRatioLocked: false,
        aspectRatio: undefined,
      },

      setLayout: (patch) =>
        set((s) => ({ layout: { ...s.layout, ...patch } })),

      placements: [],
      setPlacements: (p) => set({ placements: p }),

      // ==================== PROJECT MANAGEMENT ====================
      projectId: undefined,
      projectName: undefined,

      setProject: (id, name) => set({ projectId: id, projectName: name }),

      clearProject: () => set({ projectId: undefined, projectName: undefined }),

      // ==================== AUTO-SAVE STATUS ====================
      lastSaved: undefined,
      setLastSaved: (timestamp) => set({ lastSaved: timestamp }),
    }),
    {
      name: "ticket-layout-storage", // localStorage key
      partialize: (state) => ({
        // Only persist specific fields
        isDoubleSided: state.isDoubleSided,
        front: state.front,
        back: state.back,
        numberingElements: state.numberingElements,
        importedData: state.importedData,
        layout: state.layout,
        placements: state.placements,
        projectId: state.projectId,
        projectName: state.projectName,
      }),
    }
  )
);