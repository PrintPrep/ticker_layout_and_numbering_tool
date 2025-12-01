// ============================================================================
// FILE: components/tools/ticket-layout/NumberingEditor/AddonsPanel.tsx
// ============================================================================

import { useStore } from "@/lib/ticket-layout/zustandStore";  

export default function AddonsPanel({ element, side }: SubElementsListProps) {
  const updateNumberingElement = useStore((s) => s.updateNumberingElement);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        QR codes, barcodes, and images can be added here.
      </p>
      <p className="text-xs text-gray-500">
        Coming soon: Full addon configuration UI
      </p>
      
      {/* Placeholder for future addon configuration */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        <p className="text-sm text-gray-400">
          QR Code & Barcode configuration
        </p>
      </div>
    </div>
  );
}