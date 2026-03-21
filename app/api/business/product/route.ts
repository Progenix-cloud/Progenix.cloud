import { db } from "@/lib/db";
import { auditCreate } from "@/lib/audit";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  projectId: z.string().optional(),
  ownerId: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
});

const createSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().optional(),
    data: z.record(z.any()).optional(),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
    ownerId: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "business:product",
  "read",
  async (request: Request, _ctx, user) => {
    try {
      const query = validateQuery(
        querySchema,
        new URL(request.url).searchParams
      );
      const orgId = user.orgId || "org-001";
      const products = await db.getProducts({
        projectId: query.projectId,
        ownerId: query.ownerId,
        status: query.status,
        type: query.type,
        orgId,
      });
      return apiSuccess(products);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError("PRODUCTS_FETCH_FAILED", "Failed to load products", 500);
    }
  }
);

export const POST = withRBAC(
  "business:product",
  "create",
  async (request: Request, _ctx, user) => {
    try {
      const body = await request.json();
      const validated = validateBody(createSchema, body);
      const orgId = user.orgId || "org-001";
      const payload = {
        ...validated,
        ownerId: validated.ownerId || user._id,
        orgId,
      };
      const created = await db.createProduct(payload);
      if (created) {
        await auditCreate(user, "business:product", created, request);
      }
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
      return apiSuccess(created, "Product created");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError("PRODUCT_CREATE_FAILED", "Failed to create product", 500);
    }
  }
);
