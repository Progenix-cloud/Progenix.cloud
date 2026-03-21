import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Standard API error response
 */
export function apiError(
  code: string,
  message: string,
  status = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      status,
    },
    { status }
  );
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

/**
 * Pagination options
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  pageToken?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPageToken?: string;
  prevPageToken?: string;
}

/**
 * Validate request body with Zod
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: any): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(
      `Validation failed: ${JSON.stringify(result.error.errors)}`
    );
  }
  return result.data;
}

/**
 * Validate query params with Zod
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): T {
  const query = Object.fromEntries(searchParams);
  const result = schema.safeParse(query);
  if (!result.success) {
    throw new Error(
      `Query validation failed: ${JSON.stringify(result.error.errors)}`
    );
  }
  return result.data;
}

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  pageToken: z.string().optional(),
});

import { Action, getUserFromHeader, hasPermission } from "./rbac";
import type { SessionUser } from "./auth";

/**
 * RBAC-protected API handler factory
 * Usage:
 * export const GET = protectedHandler('admin', 'read', async (req) => {
 *   const user = getUserFromReq(req);
 *   // handler code
 * });
 */
type RbacHandler = (
  req: NextRequest,
  ctx: any,
  user: SessionUser
) => Promise<Response>;

/**
 * RBAC-protected API handler wrapper
 */
export const withRBAC = (
  resource: string,
  action: Action = "read",
  handler?: RbacHandler
) => {
  if (!handler) {
    throw new Error("withRBAC requires a handler");
  }
  return async (req: NextRequest, ctx: any = {}): Promise<Response> => {
    const user = await getUserFromHeader(req);
    if (!user) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401);
    }
    if (!hasPermission(user, resource, action)) {
      return apiError("FORBIDDEN", `Access denied: ${resource}:${action}`, 403);
    }
    return handler(req, ctx, user);
  };
};

// Backwards-compatible alias
export const protectedHandler = withRBAC;

// Versioned API helper
export const API_VERSION = "v1";

export function getVersionedPath(path: string): string {
  return `/api/${API_VERSION}${path}`;
}
