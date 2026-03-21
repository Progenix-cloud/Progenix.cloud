import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { z } from "zod";

const meetingUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    status: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "meeting",
  "read",
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const meeting = await db.getMeetingById(params.id);
      if (!meeting) {
        return apiError("MEETING_NOT_FOUND", "Meeting not found", 404);
      }
      return apiSuccess(meeting);
    } catch (error) {
      console.error("Failed to fetch meeting:", error);
      return apiError("MEETING_FETCH_FAILED", "Failed to fetch meeting", 500);
    }
  }
);

export const PUT = withRBAC(
  "meeting",
  "update",
  async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    try {
      const body = validateBody(meetingUpdateSchema, await request.json());
      const updated = await db.updateMeeting(params.id, body);
      if (!updated) {
        return apiError("MEETING_NOT_FOUND", "Meeting not found", 404);
      }
      return apiSuccess(updated, "Meeting updated");
    } catch (error) {
      console.error("Failed to update meeting:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("MEETING_UPDATE_FAILED", "Failed to update meeting", 500);
    }
  }
);

export const DELETE = withRBAC(
  "meeting",
  "delete",
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const deleted = await db.deleteMeeting(params.id);
      if (!deleted) {
        return apiError("MEETING_NOT_FOUND", "Meeting not found", 404);
      }
      return apiSuccess(deleted, "Meeting deleted");
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      return apiError("MEETING_DELETE_FAILED", "Failed to delete meeting", 500);
    }
  }
);
