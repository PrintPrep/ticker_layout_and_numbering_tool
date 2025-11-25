// ============================================================================
// FILE: app/tools/ticket-layout/wizard/page.tsx
// ============================================================================

"use client";

import { useState } from "react";
import SideSelector from "@/components/tools/ticket-layout/SideSelector";
import WizardUploader from "@/components/tools/ticket-layout/WizardUploader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WizardPage() {
  const [step, setStep] = useState(1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#E0F7F4] to-gray-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00BFA6]">
              Step {step}
            </p>
            <h1 className="text-2xl font-bold text-gray-800">
              {step === 1 ? "Choose Ticket Type" : "Upload Designs"}
            </h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Step 1: Side Selection */}
        {step === 1 && <SideSelector onSelect={() => setStep(2)} />}

        {/* Step 2: Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <WizardUploader />
            <div className="flex justify-center">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}