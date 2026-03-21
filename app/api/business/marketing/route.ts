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
  "business:marketing",
  "read",
  async (request: Request, _ctx, user) => {
    try {
      const query = validateQuery(
        querySchema,
        new URL(request.url).searchParams
      );
      const orgId = user.orgId || "org-001";
      const items = await db.getMarketingItems({
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
        "MARKETING_FETCH_FAILED",
        "Failed to load marketing items",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "business:marketing",
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
      const created = await db.createMarketing(payload);
      if (created) {
        await auditCreate(user, "business:marketing", created, request);
      }
      if (created && created.ownerId) {
        try {
          await db.createNotification({
            userId: created.ownerId,
            title: "New marketing item created",
            message: `Marketing item '${created.title}' was created.`,
            type: "system",
          });
        } catch (e) {
          // ignore notification errors
        }
      }
      return apiSuccess(created, "Marketing item created");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError(
        "MARKETING_CREATE_FAILED",
        "Failed to create marketing item",
        500
      );
    }
  }
);
