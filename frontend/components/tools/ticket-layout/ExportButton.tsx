// ============================================================================
// FILE: components/tools/ticket-layout/ExportButton.tsx
// ============================================================================

import { useState } from "react";
import { useStore } from "@/lib/ticket-layout/zustandStore";
import { Download } from "lucide-react";
import ExportProgressModal from "./ExportProgressModal";

export default function ExportButton() {
  const [showModal, setShowModal] = useState(false);
  const front = useStore((s) => s.front);
  const back = useStore((s) => s.back);
  const placements = useStore((s) => s.placements);
  const layout = useStore((s) => s.layout);

  const handleExport = () => {
    if (!front) {
      alert("Please upload a front side design first.");
      return;
    }
    if (placements.length === 0) {
      alert("No layout generated. Please configure your layout first.");
      return;
    }

    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-2 rounded-lg bg-[#34C759] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#28A745] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#34C759]"
      >
        <Download className="h-4 w-4" />
        Export PDF
      </button>

      {showModal && <ExportProgressModal onClose={() => setShowModal(false)} />}
    </>
  );
}