import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const user = await db.getUserById(id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ data: user });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const body = await req.json();
    const updates: any = { ...body };

    // Handle avatarBase64 if provided (data:[mime];base64,xxxx)
    if (body.avatarBase64 && typeof body.avatarBase64 === "string") {
      const matches = body.avatarBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mime = matches[1];
        const b64 = matches[2];
        const ext = mime.split("/").pop() || "png";
        const filename = `${id}-${Date.now()}.${ext}`;
        const outPath = path.join(process.cwd(), "public", "uploads", filename);
        const buffer = Buffer.from(b64, "base64");
        await fs.promises.writeFile(outPath, buffer);
        updates.avatar = `/uploads/${filename}`;
      }
      delete updates.avatarBase64;
    }

    // Remove protected fields
    delete updates._id;
    delete updates.email;

    const updated = await db.updateUser(id, updates);
    if (!updated)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
