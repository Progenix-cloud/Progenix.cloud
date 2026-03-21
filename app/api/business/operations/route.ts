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
  category: z.string().optional(),
  type: z.string().optional(),
});

const createSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    ownerId: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "business:operations",
  "read",
  async (request: Request, _ctx, user) => {
    try {
      const query = validateQuery(
        querySchema,
        new URL(request.url).searchParams
      );
      const orgId = user.orgId || "org-001";
      const items = await db.getOperationsItems({
        projectId: query.projectId,
        ownerId: query.ownerId,
        status: query.status,
        category: query.category,
        type: query.type,
        orgId,
      });
      return apiSuccess(items);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError(
        "OPERATIONS_FETCH_FAILED",
        "Failed to load operations items",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "business:operations",
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
      const created = await db.createOperations(payload);
      if (created) {
        await auditCreate(user, "business:operations", created, request);
      }
      if (created && created.ownerId) {
        try {
          await db.createNotification({
            userId: created.ownerId,
            title: "New operations item created",
            message: `Operations item '${created.title}' was created.`,
            type: "system",
          });
        } catch (e) {
          // ignore notification errors
        }
      }
      return apiSuccess(created, "Operations item created");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError(
        "OPERATIONS_CREATE_FAILED",
        "Failed to create operations item",
        500
      );
    }
  }
);
