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
    canvas: z.record(z.any()).optional(),
    data: z.record(z.any()).optional(),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "business:strategy",
  "read",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const strategy = await db.getStrategyById(id, orgId);
      if (!strategy)
        return apiError("STRATEGY_NOT_FOUND", "Not found", 404);
      return apiSuccess(strategy);
    } catch (err) {
      return apiError("STRATEGY_FETCH_FAILED", "Failed to load strategy", 500);
    }
  }
);

export const PUT = withRBAC(
  "business:strategy",
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
        canvas: validated.canvas,
        data: validated.data,
        type: validated.type,
        tags: validated.tags,
        status: validated.status,
      };
      const existing = await db.getStrategyById(id, orgId);
      const updated = await db.updateStrategy(id, allowed as any, orgId);
      if (!updated)
        return apiError("STRATEGY_NOT_FOUND", "Not found", 404);
      await auditUpdate(
        user,
        "business:strategy",
        id,
        existing,
        updated,
        request
      );
      return apiSuccess(updated, "Strategy updated");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError("STRATEGY_UPDATE_FAILED", "Failed to update strategy", 500);
    }
  }
);

export const DELETE = withRBAC(
  "business:strategy",
  "delete",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const existing = await db.getStrategyById(id, orgId);
      await db.deleteStrategy(id, orgId);
      if (existing) {
        await auditDelete(user, "business:strategy", id, existing, request);
      }
      return apiSuccess({ id }, "Strategy deleted");
    } catch (err) {
      return apiError("STRATEGY_DELETE_FAILED", "Failed to delete strategy", 500);
    }
  }
);
