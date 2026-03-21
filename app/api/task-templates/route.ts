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
  category: z.string().optional(),
  createdBy: z.string().optional(),
});

const templateSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    estimatedHours: z.coerce.number().optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "taskTemplate",
  "read",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const templates = await db.getTaskTemplates({
        category: query.category,
        createdBy: query.createdBy,
      });

      return apiSuccess(templates);
    } catch (error) {
      console.error("Failed to fetch task templates:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "TEMPLATES_FETCH_FAILED",
        "Failed to fetch task templates",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "taskTemplate",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = await request.json();
      const validated = validateBody(templateSchema, body);

      const templateData = {
        ...validated,
        priority: validated.priority || "medium",
        tags: validated.tags || [],
        createdBy: user._id,
      };

      const template = await db.createTaskTemplate(templateData);

      return apiSuccess(template, "Task template created");
    } catch (error) {
      console.error("Failed to create task template:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "TEMPLATE_CREATE_FAILED",
        "Failed to create task template",
        500
      );
    }
  }
);
