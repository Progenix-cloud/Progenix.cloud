import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ownerId = url.searchParams.get("ownerId") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const strategies = await db.getStrategies({ ownerId, status });
    return NextResponse.json({ data: strategies });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load strategies" },
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
    // RBAC: require business role
    const { getUserFromHeader, userHasBusinessRole } =
      await import("@/lib/rbac");
    const user = await getUserFromHeader(request);
    if (!user || !userHasBusinessRole(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // ensure ownerId is set to requester if not provided
    if (!body.ownerId) body.ownerId = user._id;
    const created = await db.createStrategy(body);
    // create a basic notification for owner if provided
    if (created && created.ownerId) {
      try {
        await db.createNotification({
          userId: created.ownerId,
          title: "New strategy created",
          message: `Strategy '${created.title}' was created.`,
          type: "system",
        });
      } catch (e) {
        // ignore notification errors
      }
    }
    return NextResponse.json({ data: created });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create strategy" },
      { status: 500 }
    );
  }
}
