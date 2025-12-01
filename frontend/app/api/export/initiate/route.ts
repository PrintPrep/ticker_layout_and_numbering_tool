// ============================================================================
// FILE: app/api/export/initiate/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Add jobId if not present
    if (!body.jobId) {
      body.jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/export/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Export initiation failed");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Export initiation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}