// ============================================================================
// FILE: components/tools/ticket-layout/NumberingEditor/DataSourceSelector.tsx
// ============================================================================

import { useState } from "react";
import { Upload } from "lucide-react";
import { useStore } from "@/lib/ticket-layout/zustandStore";  

export default function DataSourceSelector() {
  const [dataSource, setDataSource] = useState<"manual" | "csv" | "xlsx">("manual");
  const setImportedData = useStore((s) => s.setImportedData);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", "temp-project-id");

      const response = await fetch("/api/numbering/import-data", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Import failed");

      const result = await response.json();
      setImportedData(result.data);

      alert(`Successfully imported ${result.data.rowCount} rows`);
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    }
  };

  return (
    <div className="rounded-lg border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
        Data Source
      </label>

      <div className="space-y-2">
        <button
          onClick={() => setDataSource("manual")}
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
            dataSource === "manual"
              ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          Manual Entry
        </button>

        <button
          onClick={() => setDataSource("csv")}
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
            dataSource === "csv"
              ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          Import CSV
        </button>

        <button
          onClick={() => setDataSource("xlsx")}
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
            dataSource === "xlsx"
              ? "border-[#00BFA6] bg-[#00BFA6]/10 text-[#00BFA6]"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          Import XLSX
        </button>
      </div>

      {(dataSource === "csv" || dataSource === "xlsx") && (
        <div className="mt-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-[#00BFA6] hover:bg-white">
            <Upload className="h-4 w-4" />
            Upload {dataSource.toUpperCase()} File
            <input
              type="file"
              accept={dataSource === "csv" ? ".csv" : ".xlsx,.xls"}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}