// ============================================================================
// FILE: app/api/layout/optimize/route.ts
// ============================================================================
import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/layout/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Optimization failed");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Layout optimization error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}