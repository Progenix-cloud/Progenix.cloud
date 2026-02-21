import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let kbItems = await db.getKnowledgeBase({
      category: category || undefined,
    });

    if (search) {
      kbItems = kbItems.filter(
        (kb: any) =>
          kb.title.toLowerCase().includes(search.toLowerCase()) ||
          kb.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ success: true, data: kbItems });
  } catch (error) {
    console.error("Failed to fetch knowledge base:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch knowledge base" },
      { status: 500 }
    );
  }
}
