// ============================================================================
// FILE: components/tools/ticket-layout/SideSelector.tsx
// ============================================================================

"use client";

import { useStore } from "@/lib/ticket-layout/zustandStore";

interface SideSelectorProps {
  onSelect: () => void;
}

export default function SideSelector({ onSelect }: SideSelectorProps) {
  const setDoubleSided = useStore((s) => s.setDoubleSided);

  const handleSideChoice = (choice: "single" | "double") => {
    setDoubleSided(choice === "double");
    onSelect();
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Choose Ticket Type
        </h2>
        <p className="text-sm text-gray-600 mb-8 text-center">
          Select whether your tickets will be printed on one side or both sides
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Single-sided */}
          <button
            onClick={() => handleSideChoice("single")}
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-[#00BFA6] hover:shadow-lg active:scale-95"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-gray-100 p-4 transition-colors group-hover:bg-[#00BFA6]/10">
                <svg
                  className="h-8 w-8 text-gray-600 transition-colors group-hover:text-[#00BFA6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  <path d="M8 12h8M8 16h8M8 8h8" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">Single-sided</p>
                <p className="text-xs text-gray-500 mt-1">Front only</p>
              </div>
            </div>
          </button>

          {/* Double-sided */}
          <button
            onClick={() => handleSideChoice("double")}
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-[#00BFA6] hover:shadow-lg active:scale-95"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-gray-100 p-4 transition-colors group-hover:bg-[#00BFA6]/10">
                <svg
                  className="h-8 w-8 text-gray-600 transition-colors group-hover:text-[#00BFA6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  <path d="M12 3v18" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 8h3M13 8h3M8 12h3M13 12h3M8 16h3M13 16h3" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">Double-sided</p>
                <p className="text-xs text-gray-500 mt-1">Front & back</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
