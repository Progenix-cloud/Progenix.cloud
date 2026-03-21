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
    features: z.any().optional(),
    roadmap: z.any().optional(),
    data: z.record(z.any()).optional(),
    type: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "business:product",
  "read",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const product = await db.getProductById(id, orgId);
      if (!product)
        return apiError("PRODUCT_NOT_FOUND", "Not found", 404);
      return apiSuccess(product);
    } catch (err) {
      return apiError("PRODUCT_FETCH_FAILED", "Failed to load product", 500);
    }
  }
);

export const PUT = withRBAC(
  "business:product",
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
        features: validated.features,
        roadmap: validated.roadmap,
        data: validated.data,
        type: validated.type,
        status: validated.status,
      };
      const existing = await db.getProductById(id, orgId);
      const updated = await db.updateProduct(id, allowed as any, orgId);
      if (!updated)
        return apiError("PRODUCT_NOT_FOUND", "Not found", 404);
      await auditUpdate(
        user,
        "business:product",
        id,
        existing,
        updated,
        request
      );
      return apiSuccess(updated, "Product updated");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError("PRODUCT_UPDATE_FAILED", "Failed to update product", 500);
    }
  }
);

export const DELETE = withRBAC(
  "business:product",
  "delete",
  async (request: Request, { params }: { params: { id: string } }, user) => {
    try {
      const { id } = params;
      const orgId = user.orgId || "org-001";
      const existing = await db.getProductById(id, orgId);
      await db.deleteProduct(id, orgId);
      if (existing) {
        await auditDelete(user, "business:product", id, existing, request);
      }
      return apiSuccess({ id }, "Product deleted");
    } catch (err) {
      return apiError("PRODUCT_DELETE_FAILED", "Failed to delete product", 500);
    }
  }
);
