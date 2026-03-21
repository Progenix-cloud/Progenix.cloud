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
  severity: z.string().optional(),
});

const createSchema = z
  .object({
    title: z.string().min(1),
    projectId: z.string().min(1),
    description: z.string().optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    status: z
      .enum(["open", "monitoring", "in-progress", "resolved", "closed"])
      .optional(),
    probability: z.enum(["low", "medium", "high"]).optional(),
    mitigation: z.string().optional(),
    dueDate: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC("risk", "read", async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = validateQuery(querySchema, searchParams);

    let risks = await db.getRisks({ projectId: query.projectId || undefined });

    if (query.severity) {
      risks = risks.filter((r: any) => r.severity === query.severity);
    }

    return apiSuccess(risks);
  } catch (error) {
    console.error("Failed to fetch risks:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("RISKS_FETCH_FAILED", "Failed to fetch risks", 500);
  }
});

export const POST = withRBAC(
  "risk",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = validateBody(createSchema, await request.json());
      const created = await db.createRisk({
        ...body,
        owner: body.owner || user._id,
        ownerName: body.ownerName || user.name,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      });
      return apiSuccess(created, "Risk created");
    } catch (error) {
      console.error("Failed to create risk:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("RISK_CREATE_FAILED", "Failed to create risk", 500);
    }
  }
);
