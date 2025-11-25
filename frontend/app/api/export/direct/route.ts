// ============================================================================
// FILE: app/api/export/direct/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Calling Python backend for direct export...");
    console.log("Backend URL:", PYTHON_BACKEND_URL);

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/export/direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      throw new Error(errorText || `Backend returned ${response.status}`);
    }

    // Get the PDF as blob
    const pdfBlob = await response.blob();
    
    console.log("PDF generated successfully, size:", pdfBlob.size);

    // Return the PDF directly
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tickets_export_${Date.now()}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("Direct export error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}