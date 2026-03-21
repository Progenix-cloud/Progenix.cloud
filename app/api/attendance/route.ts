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
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  date: z.string().optional(),
});

const attendanceSchema = z.object({
  userId: z.string().min(1),
  date: z.string().or(z.date()),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withRBAC(
  "attendance",
  "read",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const filter: {
        userId?: string;
        date?: Date;
        startDate?: Date;
        endDate?: Date;
      } = {};
      if (query.userId) filter.userId = query.userId;
      if (query.startDate && query.endDate) {
        filter.startDate = new Date(query.startDate);
        filter.endDate = new Date(query.endDate);
      } else if (query.date) {
        filter.date = new Date(query.date);
      }

      const attendance = await db.getAttendance(filter);

      return apiSuccess(attendance);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("ATTENDANCE_FETCH_FAILED", "Failed to fetch attendance", 500);
    }
  }
);

export const POST = withRBAC(
  "attendance",
  "create",
  async (request: NextRequest) => {
    try {
      const body = validateBody(attendanceSchema, await request.json());
      const attendanceData = {
        userId: body.userId,
        date: new Date(body.date),
        status: body.status || "present",
        notes: body.notes,
        checkInTime: new Date(),
      };

      const attendance = await db.createOrUpdateAttendance(attendanceData);

      return apiSuccess(attendance, "Attendance recorded");
    } catch (error) {
      console.error("Failed to create attendance:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("ATTENDANCE_CREATE_FAILED", "Failed to create attendance", 500);
    }
  }
);
