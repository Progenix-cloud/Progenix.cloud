import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { z } from "zod";

const toNumber = (value: any, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const updateSchema = z
  .object({
    reach: z.coerce.number().optional(),
    impact: z.coerce.number().optional(),
    confidence: z.coerce.number().optional(),
    effort: z.coerce.number().optional(),
    notes: z.string().optional(),
    title: z.string().optional(),
  })
  .passthrough();

export const PATCH = withRBAC(
  "business:features",
  "update",
  async (request: NextRequest, { params }: { params: { id: string } }, user) => {
    try {
      const featureId = params.id;
      const body = validateBody(updateSchema, await request.json());

    const products = await db.getProducts({ orgId: user.orgId });
    const product = products.find((p: any) =>
      (p.features || []).some((f: any) => f.id === featureId)
    );

      if (!product) {
        return apiError("FEATURE_NOT_FOUND", "Feature not found", 404);
      }

    const existing = (product.features || []).find(
      (f: any) => f.id === featureId
    );
    const reach = toNumber(body.reach ?? existing?.reach ?? 0, 0);
    const impact = toNumber(body.impact ?? existing?.impact ?? 0, 0);
    const confidence = toNumber(
      body.confidence ?? existing?.confidence ?? 0,
      0
    );
    const effort = toNumber(body.effort ?? existing?.effort ?? 1, 1) || 1;

      if (
        reach < 0 ||
        impact < 1 ||
        impact > 10 ||
        confidence < 0 ||
        confidence > 1 ||
        effort < 1
      ) {
        return apiError("INVALID_RICE", "Invalid RICE values", 400);
      }

    const score = Math.round(((reach * impact * confidence) / effort) * 100) / 100;
    const updatedFeature = {
      ...existing,
      ...body,
      reach,
      impact,
      confidence,
      effort,
      score,
      updatedAt: new Date(),
    };

    const updatedFeatures = (product.features || []).map((f: any) =>
      f.id === featureId ? updatedFeature : f
    );

    await db.updateProduct(
      product._id,
      { features: updatedFeatures },
      user.orgId
    );

    await logAuditEvent(
      user,
      "update",
      "product_feature",
      featureId,
      request,
      {
        oldValue: existing,
        newValue: updatedFeature,
        notes: body?.notes,
      }
    );

      return apiSuccess(updatedFeature, "Feature updated");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("FEATURE_UPDATE_FAILED", "Failed to update feature", 500);
    }
  }
);
