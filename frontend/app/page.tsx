// ============================================================================
// FILE: app/page.tsx
// ============================================================================

import Link from "next/link";
import { ArrowRight, Zap, Layout, QrCode } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#E0F7F4] to-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Ticket Layout & Numbering Tool
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Design, optimize, and export professional tickets with automatic numbering
          </p>
          <Link
            href="/tools/ticket-layout/wizard"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00BFA6] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-[#00D1B2] hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00BFA6]/10">
              <Layout className="h-6 w-6 text-[#00BFA6]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Smart Layout Optimization
            </h3>
            <p className="text-sm text-gray-600">
              Automatically optimize ticket placement on any paper size with margins and spacing controls
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00BFA6]/10">
              <QrCode className="h-6 w-6 text-[#00BFA6]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Advanced Numbering
            </h3>
            <p className="text-sm text-gray-600">
              Add custom numbering, QR codes, and barcodes with drag-and-drop positioning
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00BFA6]/10">
              <Zap className="h-6 w-6 text-[#00BFA6]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Print-Ready PDFs
            </h3>
            <p className="text-sm text-gray-600">
              Export high-quality PDFs with 300 DPI resolution, perfect for professional printing
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}