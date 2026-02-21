import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");

    const tasks = await db.getTasks({
      projectId: projectId || undefined,
      assignedTo: assignedTo || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newTask = {
      _id: `task-${Date.now()}`,
      ...body,
      createdDate: new Date(),
    };

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
