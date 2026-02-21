import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");

    const meetings = await db.getMeetings({
      projectId: projectId || undefined,
      clientId: clientId || undefined,
    });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newMeeting = {
      _id: `meet-${Date.now()}`,
      ...body,
      createdDate: new Date(),
    };

    return NextResponse.json(
      { success: true, data: newMeeting },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
