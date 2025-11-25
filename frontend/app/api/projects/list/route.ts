// ============================================================================
// FILE: app/api/projects/list/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // TODO: When authentication is added, fetch from Supabase database
    // For now, return empty array (data persists in localStorage)

    /*
    // UNCOMMENT WHEN AUTH IS READY:
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ projects: data });
    */

    return NextResponse.json({
      projects: [],
      message: "Auth not enabled - using localStorage",
    });
  } catch (error: any) {
    console.error("Project list error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}