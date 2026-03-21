import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateBody,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const bodySchema = z.object({
  userId: z.string().min(1),
  date: z.union([z.string(), z.date()]),
});

export const POST = withRBAC(
  "attendance",
  "update",
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { userId, date } = validateBody(bodySchema, body);

      const attendanceDate = new Date(date);
      const attendance = await db.markAttendanceForUser(
        userId,
        attendanceDate
      );

      if (attendance) {
        return apiSuccess(attendance, "Attendance marked as present");
      }
      return apiSuccess(null, "Not all tasks completed for the day");
    } catch (error) {
      console.error("Failed to auto-mark attendance:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "ATTENDANCE_AUTO_MARK_FAILED",
        "Failed to auto-mark attendance",
        500
      );
    }
  }
);
