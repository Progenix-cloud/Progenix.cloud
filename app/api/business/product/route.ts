import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ownerId = url.searchParams.get("ownerId") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const products = await db.getProducts({ ownerId, status });
    return NextResponse.json({ data: products });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }
    const { getUserFromHeader, userHasBusinessRole } =
      await import("@/lib/rbac");
    const user = await getUserFromHeader(request);
    if (!user || !userHasBusinessRole(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!body.ownerId) body.ownerId = user._id;
    const created = await db.createProduct(body);
    if (created && created.ownerId) {
      try {
        await db.createNotification({
          userId: created.ownerId,
          title: "New product created",
          message: `Product '${created.title}' was created.`,
          type: "system",
        });
      } catch (e) {
        // notification creation failed, continue
      }
    }
    return NextResponse.json({ data: created });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
