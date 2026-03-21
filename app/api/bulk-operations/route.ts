import { bulkOperationsService } from "@/lib/bulk-operations";
import { NextRequest } from "next/server";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { z } from "zod";

const bodySchema = z.object({
  action: z.string().min(1),
  entity: z.string().min(1),
  ids: z.array(z.string()).min(1),
  data: z.record(z.any()).optional(),
});

export const POST = withRBAC(
  "admin",
  "admin",
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { action, entity, ids, data } = validateBody(bodySchema, body);

      const result = await bulkOperationsService.execute({
        action: action as any,
        entity: entity as any,
        ids,
        data,
      });

      return apiSuccess(result, "Bulk operation completed");
    } catch (error) {
      console.error("[v0] Bulk operation error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("BULK_OPERATION_FAILED", "Bulk operation failed", 500);
    }
  }
);
