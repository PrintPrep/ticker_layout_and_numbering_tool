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

  // Hardcoded export settings
  const EXPORT_QUALITY = "print";
  const COLOR_SPACE = "RGB";

  const handleExport = async () => {
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
          frontFileId: front.url,
          backFileId: back?.url || null,
        },
        layoutConfig: {
          placements: placements.map(p => ({
            ...p,
            index: p.index,
            xMm: p.xMm,
            yMm: p.yMm,
            widthMm: p.widthMm,
            heightMm: p.heightMm,
            rotation: p.rotation || 0,
            row: p.row || 0,
            col: p.col || 0,
          })),
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
          quality: EXPORT_QUALITY,
          colorSpace: COLOR_SPACE,
        },
        numberingConfig: numberingElements && (numberingElements.front.length > 0 || numberingElements.back.length > 0) ? {
          elements: [...numberingElements.front, ...numberingElements.back],
        } : null,
        importedData: importedData ? { importId: importedData.importId } : null,
      };

      console.log("Sending export request...", exportData);

      // Call the direct export API route
      const response = await fetch("/api/export/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Export failed with status: ${response.status}`);
      }

      // Get the PDF blob and download
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error("Received empty PDF file");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `tickets_export_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("PDF downloaded successfully");

    } catch (err: any) {
      console.error("Export error:", err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
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