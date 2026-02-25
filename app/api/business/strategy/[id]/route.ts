import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const strategy = await db.getStrategyById(id);
    if (!strategy)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: strategy });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load strategy" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    // RBAC: only business roles may update
    const { getUserFromHeader, userHasBusinessRole } =
      await import("@/lib/rbac");
    const user = await getUserFromHeader(request);
    if (!user || !userHasBusinessRole(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const allowed = {
      title: body.title,
      description: body.description,
      canvas: body.canvas,
      tags: body.tags,
      status: body.status,
    };
    const updated = await db.updateStrategy(id, allowed as any);
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update strategy" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // RBAC: only business roles may delete
    const { getUserFromHeader, userHasBusinessRole } =
      await import("@/lib/rbac");
    const user = await getUserFromHeader(_request);
    if (!user || !userHasBusinessRole(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.deleteStrategy(id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete strategy" },
      { status: 500 }
    );
  }
}
