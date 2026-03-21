import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { notificationsBus } from "@/lib/notifications-bus";
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
  clientId: z.string().optional(),
  status: z.string().optional(),
});

const meetingSchema = z
  .object({
    title: z.string().min(1),
    projectId: z.string().optional(),
    clientId: z.string().optional(),
    date: z.string().or(z.date()).optional(),
    time: z.string().optional(),
    duration: z.number().optional(),
    attendees: z.array(z.string()).optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "meeting",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const scopedClientId =
        user.role === "client" ? user.clientId : query.clientId;
      if (user.role === "client" && !user.clientId) {
        return apiSuccess([]);
      }

      const meetings = await db.getMeetings({
        projectId: query.projectId || undefined,
        clientId: scopedClientId || undefined,
        status: query.status || undefined,
      });

      return apiSuccess(meetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("MEETINGS_FETCH_FAILED", "Failed to fetch meetings", 500);
    }
  }
);

export const POST = withRBAC(
  "meeting",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = validateBody(meetingSchema, await request.json());
      let attendees = Array.isArray(body.attendees) ? body.attendees : [];

      if (user.role === "client") {
        if (!body.projectId) {
          return apiError("PROJECT_REQUIRED", "Project is required", 400);
        }
        const project = await db.getProjectById(body.projectId);
        if (!project || project.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        if (body.clientId && body.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
      }

      if (attendees.length === 0 && body.projectId) {
        const team = await db.getTeamByProjectId(body.projectId);
        if (team?.members?.length) {
          attendees = team.members.map((m: any) => m.userId);
        }
      }

      const now = new Date();
      const newMeeting = await db.createMeeting({
        _id: body._id || `meet-${Date.now()}`,
        ...body,
        clientId:
          user.role === "client" ? user.clientId || body.clientId : body.clientId,
        attendees,
        createdAt: body.createdAt || body.createdDate || now,
        updatedAt: body.updatedAt || body.createdAt || body.createdDate || now,
        createdDate: body.createdDate || body.createdAt || now,
        createdBy: body.createdBy || user._id,
      });

      await db.logAuditEvent({
        actorId: user._id,
        actorRole: user.role,
        action: "meeting.create",
        entityType: "meeting",
        entityId: newMeeting._id,
        details: { projectId: body.projectId, attendees },
      });

      notificationsBus.publishToAll({
        type: "meeting.booked",
        meeting: newMeeting,
        projectId: body.projectId,
        timestamp: new Date().toISOString(),
      });

      return apiSuccess(newMeeting, "Meeting created");
    } catch (error) {
      console.error("Failed to create meeting:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("MEETING_CREATE_FAILED", "Failed to create meeting", 500);
    }
  }
);
