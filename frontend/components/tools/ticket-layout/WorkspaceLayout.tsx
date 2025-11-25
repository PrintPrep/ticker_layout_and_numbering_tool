// ============================================================================
// FILE: components/tools/ticket-layout/WorkspaceLayout.tsx
// ============================================================================

"use client";

import React, { useRef } from "react";
import PaperPreview from "./PaperPreview";

export default function WorkspaceLayout() {
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={previewWrapperRef}
        className="relative flex w-full items-center justify-center rounded-2xl border border-white/70 bg-white/50 px-6 py-8 backdrop-blur-xl overflow-hidden"
        style={{
          maxHeight: "calc(100vh - 240px)",
          minHeight: "400px",
          height: "calc(100vh - 240px)",
        }}
      >
        <PaperPreview wrapperRef={previewWrapperRef} />
      </div>
    </div>
  );
}