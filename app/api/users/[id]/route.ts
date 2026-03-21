import { db } from "@/lib/db";
import fs from "fs";
import path from "path";
import { getUserFromHeader, hasPermission } from "@/lib/rbac";
import { auditUpdate } from "@/lib/audit";
import { apiError, apiSuccess, validateBody } from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z.record(z.any());

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return apiError("MISSING_ID", "Missing id", 400);
  try {
    const session = await getUserFromHeader(req);
    if (!session) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401);
    }
    const canRead =
      session._id === id || hasPermission(session, "user", "read");
    if (!canRead) {
      return apiError("FORBIDDEN", "Forbidden", 403);
    }
    const user = await db.getUserById(id);
    if (!user)
      return apiError("USER_NOT_FOUND", "User not found", 404);
    return apiSuccess(user);
  } catch (err) {
    return apiError("USER_FETCH_FAILED", "Failed to fetch user", 500);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return apiError("MISSING_ID", "Missing id", 400);
  try {
    const session = await getUserFromHeader(req);
    if (!session) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401);
    }
    const canUpdate =
      session._id === id || hasPermission(session, "user", "admin");
    if (!canUpdate) {
      return apiError("FORBIDDEN", "Forbidden", 403);
    }
    const body = validateBody(updateSchema, await req.json());
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

    const existing = await db.getUserById(id);
    const updated = await db.updateUser(id, updates);
    if (!updated)
      return apiError("USER_UPDATE_FAILED", "Failed to update", 500);

    await auditUpdate(session, "user", id, existing, updated, req);

    return apiSuccess(updated, "User updated");
  } catch (err) {
    console.error(err);
    if (
      err instanceof Error &&
      err.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", err.message, 400);
    }
    return apiError("USER_UPDATE_FAILED", "Failed to update user", 500);
  }
}
