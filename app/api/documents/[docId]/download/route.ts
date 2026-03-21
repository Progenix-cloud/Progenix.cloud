import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, withRBAC } from "@/lib/api-utils";
import { ROLES } from "@/lib/auth";

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*);base64,(.*)$/);
  if (!match) return { contentType: "", base64: "" };
  return { contentType: match[1], base64: match[2] };
}

export const GET = withRBAC(
  "document",
  "read",
  async (
    request: NextRequest,
    { params }: { params: { docId: string } },
    user
  ) => {
    try {
      const doc = await db.getDocumentById(params.docId);
      if (!doc) {
        return apiError("DOCUMENT_NOT_FOUND", "Document not found", 404);
      }

      if (user.role === ROLES.CLIENT && doc.clientId !== user.clientId) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }

      const data = (doc as any).data || {};
      let base64 = data.base64;
      let contentType = data.contentType;

      if ((!base64 || !contentType) && data.dataUrl) {
        const parsed = parseDataUrl(data.dataUrl);
        base64 = base64 || parsed.base64;
        contentType = contentType || parsed.contentType;
      }

      if (!base64) {
        return apiError("NO_FILE_CONTENT", "No file content available", 400);
      }

      const buffer = Buffer.from(base64, "base64");
      const fileName =
        data.fileName || (doc as any).title || `document-${params.docId}`;

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } catch (error) {
      console.error("Failed to download document:", error);
      return apiError(
        "DOCUMENT_DOWNLOAD_FAILED",
        "Failed to download document",
        500
      );
    }
  }
);
