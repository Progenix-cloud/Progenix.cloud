import { NextRequest } from "next/server";
import { notificationsBus } from "@/lib/notifications-bus";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const eventSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.any()).optional(),
  targetUserIds: z.array(z.string()).optional(),
});

export const POST = withRBAC(
  "admin",
  "admin",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = await request.json();
      const { type, payload, targetUserIds } = validateBody(eventSchema, body);

      const event = {
        type,
        payload: payload || {},
        actorId: user._id,
        timestamp: new Date().toISOString(),
      };

      if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
        targetUserIds.forEach((id: string) => notificationsBus.publish(id, event));
      } else {
        notificationsBus.publishToAll(event);
      }

      await logAuditEvent(
        user,
        "create",
        "admin.event",
        type,
        request,
        {
          details: event,
        }
      );

      return apiSuccess({ ok: true }, "Event published");
    } catch (error) {
      console.error("Admin event error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("EVENT_PUBLISH_FAILED", "Failed to publish event", 500);
    }
  }
);
