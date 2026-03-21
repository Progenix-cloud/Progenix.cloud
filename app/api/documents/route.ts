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
  clientId: z.string().optional(),
  type: z.string().optional(),
});

const documentCreateSchema = z
  .object({
    title: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    type: z.string().min(1),
    projectId: z.string().optional(),
    clientId: z.string().optional(),
  })
  .passthrough();

const documentUpdateSchema = z.object({}).passthrough();

export const GET = withRBAC(
  "document",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const scopedClientId =
        user.role === "client" ? user.clientId : query.clientId;
      if (user.role === "client" && !user.clientId) {
        return apiSuccess([]);
      }

      let documents = await db.getDocuments({
        projectId: query.projectId || undefined,
        clientId: scopedClientId || undefined,
      });

      if (query.type) {
        documents = documents.filter((d: any) => d.type === query.type);
      }

      return apiSuccess(documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("DOCUMENTS_FETCH_FAILED", "Failed to fetch documents", 500);
    }
  }
);

export const POST = withRBAC(
  "document",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = validateBody(documentCreateSchema, await request.json());

      if (user.role === "client") {
        if (!body.projectId) {
          return apiError("PROJECT_REQUIRED", "Project is required", 400);
        }
        const project = await db.getProjectById(body.projectId);
        if (!project || project.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        if (body.clientId && body.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
      }

      const newDoc = await db.uploadDocument({
        ...body,
        clientId:
          user.role === "client" ? user.clientId || body.clientId : body.clientId,
        createdBy: body.createdBy || user._id,
      });

      return apiSuccess(newDoc, "Document uploaded");
    } catch (error) {
      console.error("Failed to upload document:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("DOCUMENT_UPLOAD_FAILED", "Failed to upload document", 500);
    }
  }
);

export const PUT = withRBAC(
  "document",
  "update",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const docId = searchParams.get("id");
      if (!docId) {
        return apiError("MISSING_ID", "Document ID is required", 400);
      }
      const body = validateBody(documentUpdateSchema, await request.json());
      const updatedDoc = await db.updateDocument(docId, body);
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
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const docId = searchParams.get("id");

      if (!docId) {
        return apiError("MISSING_ID", "Document ID is required", 400);
      }

      await db.deleteDocument(docId);

      return apiSuccess({ id: docId }, "Document deleted");
    } catch (error) {
      console.error("Failed to delete document:", error);
      return apiError("DOCUMENT_DELETE_FAILED", "Failed to delete document", 500);
    }
  }
);
