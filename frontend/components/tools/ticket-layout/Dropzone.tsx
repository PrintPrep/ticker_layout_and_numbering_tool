// ============================================================================
// FILE: components/tools/ticket-layout/Dropzone.tsx
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SideFile, useStore } from "@/lib/ticket-layout/zustandStore";
import { v4 as uuidv4 } from "uuid";
import { uploadFile } from "@/lib/api/fileUpload";
import { Upload, X, Check } from "lucide-react";

interface DropzoneProps {
  side: "front" | "back";
  isDisabled?: boolean;
}

export default function Dropzone({ side, isDisabled }: DropzoneProps) {
  const file = useStore((s) => (side === "front" ? s.front : s.back));
  const setSide = useStore((s) => s.setSide);
  const removeSide = useStore((s) => s.removeSide);
  const setLayout = useStore((s) => s.setLayout);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (!f) return;

      setIsUploading(true);
      setError(null);

      try {
        // Upload to backend
        const result = await uploadFile(f, side);

        // Create SideFile
        const sideFile: SideFile = {
          id: result.fileId,
          name: result.originalName,
          type: result.mimeType.includes("pdf") ? "pdf" : "image",
          url: result.processedUrl,
          previewUrl: result.thumbnailUrl,
          dimensions: result.dimensions,
        };

        setSide(side, sideFile);

        // Set card dimensions based on uploaded file
        if (result.dimensions) {
          const aspectRatio = result.dimensions.aspectRatio;
          const defaultHeight = 90;
          const calculatedWidth = defaultHeight * aspectRatio;

          setLayout({
            cardWidthMm: calculatedWidth,
            cardHeightMm: defaultHeight,
            aspectRatio: aspectRatio,
            aspectRatioLocked: true,
          });
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.message || "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [side, setSide, setLayout]
  );

  const drop = useDropzone({
    onDrop: handleDrop,
    accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: false,
    disabled: isDisabled || isUploading,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-base font-semibold text-gray-800">
        {side === "front" ? "Front side" : "Back side"}
      </h3>
      <p className="mb-3 text-xs text-gray-600">
        Upload an image or PDF to use as the {side} design.
      </p>

      <div
        {...drop.getRootProps()}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-all ${
          isDisabled || isUploading
            ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
            : drop.isDragActive
            ? "border-[#00BFA6] bg-[#00BFA6]/5"
            : "border-gray-300 bg-gray-50 hover:border-[#00BFA6] hover:bg-white cursor-pointer"
        }`}
      >
        <input {...drop.getInputProps()} />

        {isUploading && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#00BFA6]"></div>
            <p className="text-sm text-gray-600">Uploading & processing...</p>
          </div>
        )}

        {!file && !isUploading && (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drop {side} image/PDF here, or click to browse
            </p>
            <p className="text-xs text-gray-500">PDF, PNG, JPG, WEBP (max 50MB)</p>
          </div>
        )}

        {file && !isUploading && (
          <div className="flex flex-col items-center gap-3">
            <img
              src={file.previewUrl || file.url}
              alt={file.name}
              className="max-h-40 w-full rounded-lg object-contain shadow-sm"
            />
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">{file.name}</span>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSide(side);
                }}
              >
                Remove
              </button>
              <button
                className="rounded-lg bg-[#00BFA6] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#00D1B2]"
                onClick={(e) => {
                  e.stopPropagation();
                  drop.open();
                }}
              >
                Replace
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2 text-xs text-red-500">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
