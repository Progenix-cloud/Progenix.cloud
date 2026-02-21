import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");
    const type = searchParams.get("type");

    let documents = await db.getDocuments({
      projectId: projectId || undefined,
      clientId: clientId || undefined,
    });

    if (type) {
      documents = documents.filter((d: any) => d.type === type);
    }

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newDoc = await db.uploadDocument(body);

    return NextResponse.json({ success: true, data: newDoc }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("id");
    const body = await request.json();

    if (!docId) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    const updatedDoc = await db.updateDocument(docId, body);

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    await db.deleteDocument(docId);

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
