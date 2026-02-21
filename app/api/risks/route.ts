import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const severity = searchParams.get("severity");

    let risks = await db.getRisks({ projectId: projectId || undefined });

    if (severity) {
      risks = risks.filter((r: any) => r.severity === severity);
    }

    return NextResponse.json({ success: true, data: risks });
  } catch (error) {
    console.error("Failed to fetch risks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch risks" },
      { status: 500 }
    );
  }
}
