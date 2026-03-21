import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess, validateQuery, withRBAC } from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  search: z.string().optional(),
});

export const GET = withRBAC(
  "client",
  "read",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      let clients = await db.getClients();

      if (query.search) {
        const search = query.search.toLowerCase();
        clients = clients.filter(
          (c: any) =>
            c.name.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search)
        );
      }

      return apiSuccess(clients);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("CLIENTS_FETCH_FAILED", "Failed to fetch clients", 500);
    }
  }
);
