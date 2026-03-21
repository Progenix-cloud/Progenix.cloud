import { db } from "@/lib/db";
import { auditDelete, auditUpdate } from "@/lib/audit";
import {
  apiError,
  apiSuccess,
  validateBody,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    data: z.record(z.any()).optional(),
    type: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "business:marketing",
  "read",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const item = await db.getMarketingById(id, orgId);
      if (!item)
        return apiError("MARKETING_NOT_FOUND", "Not found", 404);
      return apiSuccess(item);
    } catch (err) {
      return apiError(
        "MARKETING_FETCH_FAILED",
        "Failed to load marketing item",
        500
      );
    }
  }
);

export const PUT = withRBAC(
  "business:marketing",
  "update",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const body = await request.json();
      const validated = validateBody(updateSchema, body);
      const orgId = user.orgId || "org-001";
      const allowed = {
        title: validated.title,
        description: validated.description,
        category: validated.category,
        tags: validated.tags,
        data: validated.data,
        type: validated.type,
        status: validated.status,
      };
      const existing = await db.getMarketingById(id, orgId);
      const updated = await db.updateMarketing(id, allowed as any, orgId);
      if (!updated)
        return apiError("MARKETING_NOT_FOUND", "Not found", 404);
      await auditUpdate(
        user,
        "business:marketing",
        id,
        existing,
        updated,
        request
      );
      return apiSuccess(updated, "Marketing item updated");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError(
        "MARKETING_UPDATE_FAILED",
        "Failed to update marketing item",
        500
      );
    }
  }
);

export const DELETE = withRBAC(
  "business:marketing",
  "delete",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const existing = await db.getMarketingById(id, orgId);
      await db.deleteMarketing(id, orgId);
      if (existing) {
        await auditDelete(user, "business:marketing", id, existing, request);
      }
      return apiSuccess({ id }, "Marketing item deleted");
    } catch (err) {
      return apiError(
        "MARKETING_DELETE_FAILED",
        "Failed to delete marketing item",
        500
      );
    }
  }
);
