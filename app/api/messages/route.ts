import { NextRequest } from "next/server";
import { db } from "@/lib/db";
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
});

const messageSchema = z
  .object({
    projectId: z.string().optional(),
    senderId: z.string().optional(),
    senderName: z.string().optional(),
    senderRole: z.string().optional(),
    message: z.string().min(1),
    type: z.enum(["text", "file", "system"]).optional(),
    timestamp: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "message",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      if (user.role === "client") {
        if (!user.clientId) return apiSuccess([]);
        if (!query.projectId) return apiSuccess([]);
        const project = await db.getProjectById(query.projectId);
        if (!project || project.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
      }

      const messages = await db.getMessages({
        projectId: query.projectId || undefined,
      });

      return apiSuccess(messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("MESSAGES_FETCH_FAILED", "Failed to fetch messages", 500);
    }
  }
);

export const POST = withRBAC(
  "message",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = await request.json();
      const validated = validateBody(messageSchema, body);

      if (user.role === "client") {
        if (!user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        if (!validated.projectId || validated.projectId === "global") {
          return apiError(
            "FORBIDDEN",
            "Clients cannot post to global chat",
            403
          );
        }
        const project = await db.getProjectById(validated.projectId);
        if (!project || project.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
      }

      const newMessage = await db.createMessage({
        ...validated,
        senderId: validated.senderId || user._id,
        senderName: validated.senderName || user.name,
        senderRole: validated.senderRole || user.role,
      });

      return apiSuccess(newMessage, "Message sent");
    } catch (error) {
      console.error("Failed to create message:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("MESSAGE_CREATE_FAILED", "Failed to create message", 500);
    }
  }
);
