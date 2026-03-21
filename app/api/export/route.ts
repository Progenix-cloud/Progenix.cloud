import { exportService } from "@/lib/export-service";
import { NextRequest, NextResponse } from "next/server";
import { apiError, validateQuery, withRBAC } from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  format: z.enum(["json", "csv"]).optional(),
  entity: z.string().optional(),
  type: z
    .enum(["full", "analytics", "project", "invoice-summary"])
    .optional(),
});

export const GET = withRBAC("export", "read", async (req: NextRequest) => {
  try {
    const query = validateQuery(querySchema, req.nextUrl.searchParams);
    const format = query.format || "json";
    const entity = query.entity;
    const type = query.type || "full";

    let data: string;
    let contentType = "application/json";
    let filename = `export-${Date.now()}`;

    if (format === "csv" && entity) {
      data = await exportService.exportCSV(entity);
      contentType = "text/csv";
      filename = `${entity}-${Date.now()}.csv`;
    } else if (type === "analytics") {
      data = await exportService.exportAnalytics();
      filename = `analytics-${Date.now()}.json`;
    } else if (type === "project" && entity) {
      data = await exportService.exportProjectReport(entity);
      filename = `project-report-${entity}-${Date.now()}.json`;
    } else if (type === "invoice-summary" && entity) {
      data = await exportService.exportInvoiceSummary(entity);
      filename = `invoice-summary-${entity}-${Date.now()}.json`;
    } else {
      data = await exportService.exportJSON();
      filename = `full-export-${Date.now()}.json`;
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[v0] Export error:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("EXPORT_FAILED", "Export failed", 500);
  }
});
