// ============================================================================
// FILE: components/tools/ticket-layout/ExportButton.tsx
// ============================================================================

import { useState } from "react";
import { useStore } from "@/lib/ticket-layout/zustandStore";
import { Download, Loader2 } from "lucide-react";

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const front = useStore((s) => s.front);
  const back = useStore((s) => s.back);
  const placements = useStore((s) => s.placements);
  const layout = useStore((s) => s.layout);
  const numberingElements = useStore((s) => s.numberingElements);
  const importedData = useStore((s) => s.importedData);

  const handleDirectExport = async () => {
    if (!front) {
      alert("Please upload a front side design first.");
      return;
    }
    if (placements.length === 0) {
      alert("No layout generated. Please configure your layout first.");
      return;
    }

    setIsExporting(true);

    try {
      // Prepare export data
      const exportData = {
        designFiles: {
          frontFileId: front?.url,
          backFileId: back?.url,
        },
        layoutConfig: {
          placements: placements,
          totalCopies: layout.cardCount || placements.length,
          paperSettings: {
            paperWidthMm: layout.paperWidthMm,
            paperHeightMm: layout.paperHeightMm,
            topMarginMm: layout.topMarginMm,
            bottomMarginMm: layout.bottomMarginMm,
            leftMarginMm: layout.leftMarginMm,
            rightMarginMm: layout.rightMarginMm,
            spacingMm: layout.spacingMm,
          },
        },
        exportSettings: {
          quality: "print", // Default to print quality
          colorSpace: "RGB", // Default to RGB
        },
        numberingConfig: {
          elements: [...numberingElements.front, ...numberingElements.back],
        },
        importedData: importedData ? { importId: importedData.importId } : undefined,
      };

      // Call the direct export API
      const response = await fetch("/api/export/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Export failed");
      }

      // Get the PDF blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `tickets_export_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err: any) {
      console.error("Export error:", err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleDirectExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-lg bg-[#34C759] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#28A745] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#34C759] disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}