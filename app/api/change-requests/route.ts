import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const changeRequests = await db.getChangeRequests({
      projectId: projectId || undefined,
      status: status || undefined,
    });

    let filtered = changeRequests;
    if (clientId) {
      filtered = filtered.filter((cr: any) => cr.clientId === clientId);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("Failed to fetch change requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch change requests" },
      { status: 500 }
    );
  }
}
