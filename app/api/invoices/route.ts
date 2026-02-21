import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const invoices = await db.getInvoices({
      projectId: projectId || undefined,
      clientId: clientId || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
