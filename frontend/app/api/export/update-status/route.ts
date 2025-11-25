// ============================================================================
// FILE: app/api/export/update-status/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // This endpoint is called by Python backend to update job status
    // Store in cache or database
    
    // For now, just forward to Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/export/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Status update failed");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Export status update error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}