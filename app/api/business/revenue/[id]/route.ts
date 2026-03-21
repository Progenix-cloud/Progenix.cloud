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
    amount: z.coerce.number().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "business:revenue",
  "read",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const item = await db.getRevenueById(id, orgId);
      if (!item)
        return apiError("REVENUE_NOT_FOUND", "Not found", 404);
      return apiSuccess(item);
    } catch (err) {
      return apiError(
        "REVENUE_FETCH_FAILED",
        "Failed to load revenue item",
        500
      );
    }
  }
);

export const PUT = withRBAC(
  "business:revenue",
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
        amount: validated.amount,
      };
      const existing = await db.getRevenueById(id, orgId);
      const updated = await db.updateRevenue(id, allowed as any, orgId);
      if (!updated)
        return apiError("REVENUE_NOT_FOUND", "Not found", 404);
      await auditUpdate(
        user,
        "business:revenue",
        id,
        existing,
        updated,
        request
      );
      return apiSuccess(updated, "Revenue item updated");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError(
        "REVENUE_UPDATE_FAILED",
        "Failed to update revenue item",
        500
      );
    }
  }
);

export const DELETE = withRBAC(
  "business:revenue",
  "delete",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const existing = await db.getRevenueById(id, orgId);
      await db.deleteRevenue(id, orgId);
      if (existing) {
        await auditDelete(user, "business:revenue", id, existing, request);
      }
      return apiSuccess({ id }, "Revenue item deleted");
    } catch (err) {
      return apiError(
        "REVENUE_DELETE_FAILED",
        "Failed to delete revenue item",
        500
      );
    }
  }
);
