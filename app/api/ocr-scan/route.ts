import { apiError, apiSuccess, withRBAC } from "@/lib/api-utils";
import { db } from "@/lib/db";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
}

function extractFromText(
  text: string,
  template: { fields?: Array<{ name: string; label?: string }> } | null
) {
  const extracted: Record<string, string> = {};
  const trimmed = text || "";
  const fields = template?.fields || [];

  for (const field of fields) {
    const label = field.label || field.name;
    const regex = new RegExp(
      `${escapeRegExp(label)}\\\\s*[:\\-–]\\\\s*(.+)`,
      "i"
    );
    const match = trimmed.match(regex);
    if (match && match[1]) {
      extracted[field.name] = match[1].split("\\n")[0].trim();
    }
  }

  if (Object.keys(extracted).length === 0) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        for (const field of fields) {
          const value = parsed[field.name] ?? parsed[field.label || ""];
          if (value !== undefined && value !== null) {
            extracted[field.name] = String(value);
          }
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }

  return extracted;
}

export const POST = withRBAC(
  "document",
  "create",
  async (request: Request) => {
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      const templateType = formData.get("templateType");

      if (!(file instanceof File)) {
        return apiError("MISSING_FILE", "File is required", 400);
      }

      const template =
        typeof templateType === "string" && templateType
          ? await db.getDocumentTemplateByType(templateType)
          : null;

      const buffer = Buffer.from(await file.arrayBuffer());
      const contentType = file.type || "";
      let text = "";

      if (contentType.startsWith("text/") || contentType === "application/json") {
        text = buffer.toString("utf8");
      }

      const extractedData = text ? extractFromText(text, template) : {};
      const warning =
        !text && contentType
          ? `OCR not configured for ${contentType}`
          : !text
            ? "OCR not configured for this file type"
            : undefined;

      return apiSuccess({ extractedData, warning });
    } catch (error) {
      console.error("OCR scan failed:", error);
      return apiError("OCR_SCAN_FAILED", "Failed to scan document", 500);
    }
  }
);
