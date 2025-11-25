// ============================================================================
// FILE: app/tools/ticket-layout/page.tsx
// ============================================================================

"use client";

import OptimizePanel from "@/components/tools/ticket-layout/OptimizePanel";
import WorkspaceLayout from "@/components/tools/ticket-layout/WorkspaceLayout";
import ExportButton from "@/components/tools/ticket-layout/ExportButton";
import WizardUploader from "@/components/tools/ticket-layout/WizardUploader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WorkspacePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#E0F7F4_0%,#f5f7ff_45%,#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
        {/* App bar */}
        <header className="rounded-lg border border-white/60 bg-white/80 px-6 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00BFA6]">
                Workspace
              </p>
              <h1 className="text-xl font-bold text-gray-800">Ticket Builder</h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/tools/ticket-layout/wizard"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Wizard
              </Link>
              <ExportButton />
            </div>
          </div>
        </header>

        {/* Two-column layout */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Left column - Optimize Panel */}
          <div className="w-full flex-none lg:w-80">
            <div className="rounded-lg border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur transition hover:border-[#00BFA6]">
              <OptimizePanel />
            </div>
          </div>

          {/* Right column - Workspace + Uploader */}
          <div className="flex-1">
            <div className="h-full rounded-lg border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur transition hover:border-[#00BFA6] lg:p-8">
              <div className="flex flex-col gap-8">
                <WorkspaceLayout />
                <WizardUploader />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}