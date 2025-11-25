// ============================================================================
// FILE: components/tools/ticket-layout/WizardUploader.tsx
// ============================================================================

"use client";

import { useStore } from "@/lib/ticket-layout/zustandStore";
import { useRouter } from "next/navigation";
import Dropzone from "./Dropzone";
import { ArrowRight } from "lucide-react";

export default function WizardUploader() {
  const isDoubleSided = useStore((s) => s.isDoubleSided);
  const front = useStore((s) => s.front);
  const back = useStore((s) => s.back);
  const router = useRouter();

  const canContinue = !!front && (!isDoubleSided || !!back);

  const handleContinue = () => {
    // Skip numbering or go to numbering editor?
    // For now, go directly to workspace
    router.push("/tools/ticket-layout");
  };

  const handleAddNumbering = () => {
    router.push("/tools/ticket-layout/numbering-editor");
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Dropzone side="front" />
        <Dropzone side="back" isDisabled={!isDoubleSided} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
          {isDoubleSided ? "Front and back required" : "Front required"}
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={!canContinue}
            onClick={handleAddNumbering}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              canContinue
                ? "border border-[#00BFA6] bg-white text-[#00BFA6] hover:bg-[#00BFA6]/5"
                : "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
            }`}
          >
            Add Numbering (Optional)
          </button>

          <button
            disabled={!canContinue}
            onClick={handleContinue}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
              canContinue
                ? "bg-[#00BFA6] text-white shadow-sm hover:bg-[#00D1B2] hover:shadow-lg"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
          >
            Continue to Workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}