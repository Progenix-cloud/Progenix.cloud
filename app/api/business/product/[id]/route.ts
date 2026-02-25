import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await db.getProductById(id);
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load product" },
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
    const { getUserFromHeader, userHasBusinessRole } =
      await import("@/lib/rbac");
    const user = await getUserFromHeader(request);
    if (!user || !userHasBusinessRole(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const allowed = {
      title: body.title,
      description: body.description,
      features: body.features,
      roadmap: body.roadmap,
      status: body.status,
    };
    const updated = await db.updateProduct(id, allowed as any);
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update product" },
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
    const { getUserFromHeader, userHasBusinessRole } =
      await import("@/lib/rbac");
    const user = await getUserFromHeader(_request);
    if (!user || !userHasBusinessRole(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.deleteProduct(id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
