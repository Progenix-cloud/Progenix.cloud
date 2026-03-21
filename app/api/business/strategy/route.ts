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
  ownerId: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  projectId: z.string().optional(),
});

const createSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    canvas: z.record(z.any()).optional(),
    data: z.record(z.any()).optional(),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
    ownerId: z.string().optional(),
    projectId: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "business:strategy",
  "read",
  async (request: Request, _ctx, user) => {
    try {
      const query = validateQuery(
        querySchema,
        new URL(request.url).searchParams
      );
      const orgId = user.orgId || "org-001";
      const strategies = await db.getStrategies({
        ownerId: query.ownerId,
        status: query.status,
        type: query.type,
        projectId: query.projectId,
        orgId,
      });
      return apiSuccess(strategies);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError(
        "STRATEGY_FETCH_FAILED",
        "Failed to load strategies",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "business:strategy",
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
      const created = await db.createStrategy(payload);
      if (created) {
        await auditCreate(user, "business:strategy", created, request);
      }
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
      return apiSuccess(created, "Strategy created");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError(
        "STRATEGY_CREATE_FAILED",
        "Failed to create strategy",
        500
      );
    }
  }
);
