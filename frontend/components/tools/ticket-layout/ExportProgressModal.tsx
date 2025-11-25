// ============================================================================
// FILE: components/tools/ticket-layout/ExportProgressModal.tsx
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/ticket-layout/zustandStore";
import { pollExportStatus, downloadFile } from "@/lib/utils/exportHelpers";
import { X, Check, AlertCircle } from "lucide-react";

interface ExportProgressModalProps {
  onClose: () => void;
}

export default function ExportProgressModal({ onClose }: ExportProgressModalProps) {
  const [step, setStep] = useState<"settings" | "processing" | "complete" | "error">("settings");
  const [quality, setQuality] = useState<"print" | "digital">("print");
  const [colorSpace, setColorSpace] = useState<"RGB" | "CMYK">("RGB");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const front = useStore((s) => s.front);
  const back = useStore((s) => s.back);
  const layout = useStore((s) => s.layout);
  const placements = useStore((s) => s.placements);
  const numberingElements = useStore((s) => s.numberingElements);
  const importedData = useStore((s) => s.importedData);

  const handleStartExport = async () => {
    setStep("processing");
    setProgress(0);

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
          quality,
          colorSpace,
        },
        numberingConfig: {
          elements: [...numberingElements.front, ...numberingElements.back],
        },
        importedData: importedData ? { importId: importedData.importId } : undefined,
      };

      // Initiate export
      const response = await fetch("/api/export/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) throw new Error("Failed to initiate export");

      const result = await response.json();
      const jobId = result.jobId;

      // Poll for status
      const finalResult = await pollExportStatus(
        jobId,
        (prog, status) => {
          setProgress(prog);
        },
        1000,
        300
      );

      setDownloadUrl(finalResult.downloadUrl);
      setStep("complete");
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err.message || "Export failed");
      setStep("error");
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      downloadFile(downloadUrl, "tickets_export.pdf");
      onClose();
    }
  };

  return (
    <div 
    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    style={{ zIndex: 99999 }}
    >
      
      <div 
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        style={{ zIndex: 100000 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Settings Step */}
        {step === "settings" && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Export Settings</h2>

            <div className="mb-6 space-y-4">
              {/* Quality */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quality
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQuality("print")}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      quality === "print"
                        ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Print (300 DPI)
                  </button>
                  <button
                    onClick={() => setQuality("digital")}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      quality === "digital"
                        ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Digital (150 DPI)
                  </button>
                </div>
              </div>

              {/* Color Space */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Color Space
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setColorSpace("RGB")}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      colorSpace === "RGB"
                        ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    RGB
                  </button>
                  <button
                    onClick={() => setColorSpace("CMYK")}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      colorSpace === "CMYK"
                        ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    CMYK
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartExport}
              className="w-full rounded-lg bg-[#00BFA6] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#00D1B2] hover:shadow-lg"
            >
              Start Export
            </button>
          </div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#00BFA6]"></div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">Generating PDF...</h2>
            <p className="mb-4 text-sm text-gray-600">Please wait while we process your export</p>

            {/* Progress bar */}
            <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#00BFA6] transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-700">{progress}%</p>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">Export Complete!</h2>
            <p className="mb-6 text-sm text-gray-600">Your PDF is ready to download</p>

            <button
              onClick={handleDownload}
              className="w-full rounded-lg bg-[#00BFA6] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#00D1B2] hover:shadow-lg"
            >
              Download PDF
            </button>
          </div>
        )}

        {/* Error Step */}
        {step === "error" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">Export Failed</h2>
            <p className="mb-6 text-sm text-gray-600">{error}</p>

            <button
              onClick={() => setStep("settings")}
              className="w-full rounded-lg bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}