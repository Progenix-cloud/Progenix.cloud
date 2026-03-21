import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  actorId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const GET = withRBAC(
  "admin",
  "admin",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const filter = validateQuery(querySchema, searchParams);

      const logs = await db.getAuditLogs(filter);
      const enriched = await Promise.all(
        logs.map(async (log: any) => ({
          ...log,
          actorName: log.actorName || (await db.getActorName(log.actorId)),
        }))
      );

      return apiSuccess(enriched);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "AUDIT_LOGS_FETCH_FAILED",
        "Failed to fetch audit logs",
        500
      );
    }
  }
);
