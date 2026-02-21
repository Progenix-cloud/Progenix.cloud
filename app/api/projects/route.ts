import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const projects = await db.getProjects({
      clientId: clientId || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProject = await db.createProject(body);

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
