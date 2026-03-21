import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import {
  apiError,
  apiSuccess,
  validateBody,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const featureSchema = z.object({
  productId: z.string().min(1),
  feature: z
    .object({
      title: z.string().min(1),
      reach: z.coerce.number().optional(),
      impact: z.coerce.number().optional(),
      confidence: z.coerce.number().optional(),
      effort: z.coerce.number().optional(),
      notes: z.string().optional(),
    })
    .passthrough(),
});

export const GET = withRBAC(
  "business:features",
  "read",
  async (_request: NextRequest, _ctx, user) => {
    try {
      const products = await db.getProducts({ orgId: user.orgId });
      const features = products.flatMap((p: any) =>
        (p.features || []).map((f: any) => ({
          ...f,
          productId: p._id,
        }))
      );

      return apiSuccess(features);
    } catch (error) {
      return apiError("FEATURES_FETCH_FAILED", "Failed to fetch features", 500);
    }
  }
);

export const POST = withRBAC(
  "business:features",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = await request.json();
      const { productId, feature } = validateBody(featureSchema, body);

    // Validation
    const reach = Number(feature.reach ?? 0);
    const impact = Number(feature.impact ?? 0);
    const confidence = Number(feature.confidence ?? 0);
    const effort = Number(feature.effort ?? 1) || 1;
    const score = (reach * impact * confidence) / effort;
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

    const updatedProduct = await db.updateProduct(
      productId,
      {
        features: [
          ...((await db.getProductById(productId, user.orgId))?.features ||
            []),
          {
            ...feature,
            reach,
            impact,
            confidence,
            effort,
            score,
            updatedAt: new Date(),
          },
        ],
      },
      user.orgId
    );

    // Audit log
    await logAuditEvent(
      user,
      "update",
      "product_feature",
      productId,
      request,
      {
        details: { riceScore: score, featureTitle: feature.title },
        notes: "feature_added",
      }
    );

      return apiSuccess(updatedProduct, "Feature created");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("FEATURE_CREATE_FAILED", "Failed to create feature", 500);
    }
  }
);

// PATCH moved to /api/business/features/[id]
