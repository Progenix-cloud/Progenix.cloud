import type { SessionUser } from "./auth";
import { db } from "./db";

type AuditMeta = {
  ipAddress?: string;
  userAgent?: string;
};

function getRequestMeta(request: Request): AuditMeta {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  };
}

export async function logAuditEvent(
  user: SessionUser,
  action: string,
  entityType: string,
  entityId: string,
  request: Request,
  options?: {
    oldValue?: any;
    newValue?: any;
    details?: any;
    notes?: string;
  }
) {
  const meta = getRequestMeta(request);
  return db.logAuditEvent({
    actorId: user._id,
    actorRole: user.role,
    actorName: user.name,
    action,
    entityType,
    entityId,
    oldValue: options?.oldValue,
    newValue: options?.newValue,
    details: options?.details,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    notes: options?.notes,
  });
}

export async function auditCreate(
  user: SessionUser,
  entityType: string,
  newValue: any,
  request: Request
) {
  const entityId = newValue?._id || "";
  return logAuditEvent(user, "create", entityType, entityId, request, {
    newValue,
  });
}

export async function auditUpdate(
  user: SessionUser,
  entityType: string,
  entityId: string,
  oldValue: any,
  newValue: any,
  request: Request,
  notes?: string
) {
  return logAuditEvent(user, "update", entityType, entityId, request, {
    oldValue,
    newValue,
    notes,
  });
}

export async function auditDelete(
  user: SessionUser,
  entityType: string,
  entityId: string,
  oldValue: any,
  request: Request,
  notes?: string
) {
  return logAuditEvent(user, "delete", entityType, entityId, request, {
    oldValue,
    notes,
  });
}
