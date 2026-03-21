import { searchService } from "@/lib/search-service";
import { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(2),
  type: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export const GET = withRBAC("search", "read", async (req: NextRequest) => {
  try {
    const query = validateQuery(querySchema, req.nextUrl.searchParams);

    const results = await searchService.search(query.q, {
      type: query.type ? [query.type as any] : undefined,
      limit: query.limit || 20,
      offset: query.offset || 0,
    });

    return apiSuccess({
      results,
      query: query.q,
      count: results.length,
    });
  } catch (error) {
    console.error("[v0] Search error:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("SEARCH_FAILED", "Search failed", 500);
  }
});
