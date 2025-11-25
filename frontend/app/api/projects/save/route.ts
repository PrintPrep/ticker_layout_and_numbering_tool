// ============================================================================
// FILE: app/api/projects/save/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: When authentication is added, save to Supabase database
    // For now, just return success (data persists in localStorage via Zustand)

    /*
    // UNCOMMENT WHEN AUTH IS READY:
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .upsert({
        user_id: userId,
        project_data: body,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    */

    return NextResponse.json({
      success: true,
      message: "Project saved (localStorage only - auth not enabled)",
    });
  } catch (error: any) {
    console.error("Project save error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
