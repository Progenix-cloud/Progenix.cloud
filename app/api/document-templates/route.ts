import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateBody,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const fieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.string().min(1),
  placeholder: z.string().min(1),
});

const templateSchema = z
  .object({
    title: z.string().min(1),
    icon: z.string().min(1),
    type: z.string().min(1),
    fields: z.array(fieldSchema).min(1),
    orgId: z.string().optional(),
    isDefault: z.boolean().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "documentTemplate",
  "read",
  async () => {
    try {
      const templates = await db.getDocumentTemplates();
      return apiSuccess(templates);
    } catch (error) {
      console.error("Failed to fetch document templates:", error);
      return apiError(
        "TEMPLATES_FETCH_FAILED",
        "Failed to fetch document templates",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "documentTemplate",
  "create",
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validated = validateBody(templateSchema, body);
      const template = await db.createDocumentTemplate(validated);
      return apiSuccess(template, "Document template created");
    } catch (error) {
      console.error("Failed to create document template:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "TEMPLATE_CREATE_FAILED",
        "Failed to create document template",
        500
      );
    }
  }
);
