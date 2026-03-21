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
  search: z.string().optional(),
});

const kbSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  content: z.string().min(1),
});

export const GET = withRBAC(
  "knowledge",
  "read",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      let kbItems = await db.getKnowledgeBase({
        category: query.category || undefined,
      });

      if (query.search) {
        const searchLower = query.search.toLowerCase();
        kbItems = kbItems.filter(
          (kb: any) =>
            kb.title.toLowerCase().includes(searchLower) ||
            kb.content.toLowerCase().includes(searchLower)
        );
      }

      return apiSuccess(kbItems);
    } catch (error) {
      console.error("Failed to fetch knowledge base:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "KNOWLEDGE_FETCH_FAILED",
        "Failed to fetch knowledge base",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "knowledge",
  "create",
  async (request: NextRequest) => {
    try {
      const body = validateBody(kbSchema, await request.json());

      const kbItem = await db.createKnowledgeBase({
        ...body,
        views: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
      });

      return apiSuccess(kbItem, "Knowledge base article created");
    } catch (error) {
      console.error("Failed to create knowledge base article:", error);
      if (
        error instanceof Error &&
        error.message.includes("Validation failed")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "KB_CREATE_FAILED",
        "Failed to create knowledge base article",
        500
      );
    }
  }
);
