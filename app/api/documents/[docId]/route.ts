import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { z } from "zod";

const documentUpdateSchema = z.object({}).passthrough();

export const GET = withRBAC(
  "document",
  "read",
  async (
    _request: NextRequest,
    { params }: { params: { docId: string } },
    user
  ) => {
    try {
      const doc = await db.getDocumentById(params.docId);
      if (!doc) {
        return apiError("DOCUMENT_NOT_FOUND", "Document not found", 404);
      }
      if (user.role === "client" && doc.clientId !== user.clientId) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }
      return apiSuccess(doc);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      return apiError("DOCUMENT_FETCH_FAILED", "Failed to fetch document", 500);
    }
  }
);

export const PUT = withRBAC(
  "document",
  "update",
  async (
    request: NextRequest,
    { params }: { params: { docId: string } },
    user
  ) => {
    try {
      const existing = await db.getDocumentById(params.docId);
      if (!existing) {
        return apiError("DOCUMENT_NOT_FOUND", "Document not found", 404);
      }
      if (user.role === "client" && existing.clientId !== user.clientId) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }
      const body = validateBody(documentUpdateSchema, await request.json());
      const updatedDoc = await db.updateDocument(params.docId, body);
      return apiSuccess(updatedDoc, "Document updated");
    } catch (error) {
      console.error("Failed to update document:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("DOCUMENT_UPDATE_FAILED", "Failed to update document", 500);
    }
  }
);

export const DELETE = withRBAC(
  "document",
  "delete",
  async (
    _request: NextRequest,
    { params }: { params: { docId: string } },
    user
  ) => {
    try {
      const existing = await db.getDocumentById(params.docId);
      if (!existing) {
        return apiError("DOCUMENT_NOT_FOUND", "Document not found", 404);
      }
      if (user.role === "client" && existing.clientId !== user.clientId) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }
      await db.deleteDocument(params.docId);
      return apiSuccess({ id: params.docId }, "Document deleted");
    } catch (error) {
      console.error("Failed to delete document:", error);
      return apiError("DOCUMENT_DELETE_FAILED", "Failed to delete document", 500);
    }
  }
);
