import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");

    let feedback = await db.getFeedback({ projectId: projectId || undefined });

    if (clientId) {
      feedback = feedback.filter((f: any) => f.clientId === clientId);
    }

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newFeedback = {
      id: `fb-${Date.now()}`,
      ...body,
      date: new Date(),
    };

    return NextResponse.json(
      { success: true, data: newFeedback },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
