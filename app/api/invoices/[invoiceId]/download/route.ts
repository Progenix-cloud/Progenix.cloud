import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, withRBAC } from "@/lib/api-utils";
import { ROLES } from "@/lib/auth";

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatDate(value?: Date) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString();
}

function createInvoicePdf(invoice: any) {
  const lines = [
    `Invoice ${invoice.invoiceNumber || invoice._id}`,
    `Amount: $${Number(invoice.amount || 0).toLocaleString()}`,
    `Status: ${invoice.status || "pending"}`,
    `Issued: ${formatDate(invoice.issuedDate)}`,
    `Due: ${formatDate(invoice.dueDate)}`,
  ];

  const contentLines = [
    "BT",
    "/F1 18 Tf",
    "50 750 Td",
    `(${escapePdfText(lines[0])}) Tj`,
    "0 -24 Td",
    "/F1 12 Tf",
    `(${escapePdfText(lines[1])}) Tj`,
    "0 -16 Td",
    `(${escapePdfText(lines[2])}) Tj`,
    "0 -16 Td",
    `(${escapePdfText(lines[3])}) Tj`,
    "0 -16 Td",
    `(${escapePdfText(lines[4])}) Tj`,
    "ET",
  ];

  const content = contentLines.join("\n");
  const contentLength = Buffer.byteLength(content, "utf8");

  const header = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
  const obj4 = `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${content}\nendstream\nendobj\n`;
  const obj5 =
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  const parts = [header, obj1, obj2, obj3, obj4, obj5];
  const offsets: number[] = [];
  let offset = Buffer.byteLength(header, "utf8");

  offsets[1] = offset;
  offset += Buffer.byteLength(obj1, "utf8");
  offsets[2] = offset;
  offset += Buffer.byteLength(obj2, "utf8");
  offsets[3] = offset;
  offset += Buffer.byteLength(obj3, "utf8");
  offsets[4] = offset;
  offset += Buffer.byteLength(obj4, "utf8");
  offsets[5] = offset;
  offset += Buffer.byteLength(obj5, "utf8");

  const xrefOffset = offset;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const pdf = parts.join("") + xref + trailer;
  return Buffer.from(pdf, "utf8");
}

export const GET = withRBAC(
  "invoice",
  "read",
  async (
    request: NextRequest,
    { params }: { params: { invoiceId: string } },
    user
  ) => {
    try {
      const invoice = await db.getInvoiceById(params.invoiceId);
      if (!invoice) {
        return apiError("INVOICE_NOT_FOUND", "Invoice not found", 404);
      }

      if (user.role === ROLES.CLIENT && invoice.clientId !== user.clientId) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }

      const pdfBuffer = createInvoicePdf(invoice);
      const fileName = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } catch (error) {
      console.error("Failed to download invoice:", error);
      return apiError("INVOICE_DOWNLOAD_FAILED", "Failed to download invoice", 500);
    }
  }
);
