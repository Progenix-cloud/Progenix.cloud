// RBAC - Role Based Access Control
import { SessionUser, verifySession } from "./auth";
import { db } from "./db";

export type Action = "read" | "create" | "update" | "delete" | "admin" | "*";

export type Permission = {
  resource: string;
  action: Action;
};

export type RolePermissions = Record<string, Permission[]>;

export const PERMISSIONS: RolePermissions = {
  admin: [
    { resource: "*", action: "admin" as Action },
    { resource: "user", action: "admin" as Action },
    { resource: "project", action: "*" as Action },
    { resource: "task", action: "*" as Action },
    { resource: "business:*", action: "*" as Action },
    { resource: "admin", action: "admin" as Action },
    { resource: "client", action: "*" as Action },
    { resource: "lead", action: "*" as Action },
    { resource: "team", action: "*" as Action },
    { resource: "meeting", action: "*" as Action },
    { resource: "document", action: "*" as Action },
    { resource: "documentTemplate", action: "*" as Action },
    { resource: "invoice", action: "*" as Action },
    { resource: "message", action: "*" as Action },
    { resource: "timeLog", action: "*" as Action },
    { resource: "changeRequest", action: "*" as Action },
    { resource: "feedback", action: "*" as Action },
    { resource: "attendance", action: "*" as Action },
    { resource: "risk", action: "*" as Action },
    { resource: "knowledge", action: "*" as Action },
    { resource: "notification", action: "*" as Action },
    { resource: "taskTemplate", action: "*" as Action },
    { resource: "taskDelegation", action: "*" as Action },
    { resource: "resource", action: "*" as Action },
    { resource: "report", action: "*" as Action },
    { resource: "analytics", action: "*" as Action },
    { resource: "dashboard", action: "*" as Action },
    { resource: "export", action: "*" as Action },
    { resource: "search", action: "*" as Action },
  ],
  project_manager: [
    { resource: "project", action: "*" as Action },
    { resource: "task", action: "*" as Action },
    { resource: "team", action: "read" },
    { resource: "meeting", action: "*" as Action },
    { resource: "document", action: "*" as Action },
    { resource: "documentTemplate", action: "read" },
    { resource: "invoice", action: "create" },
    { resource: "invoice", action: "read" },
    { resource: "invoice", action: "update" },
    { resource: "client", action: "read" },
    { resource: "message", action: "*" as Action },
    { resource: "changeRequest", action: "*" as Action },
    { resource: "feedback", action: "create" },
    { resource: "feedback", action: "read" },
    { resource: "attendance", action: "read" },
    { resource: "risk", action: "create" },
    { resource: "risk", action: "read" },
    { resource: "knowledge", action: "create" },
    { resource: "knowledge", action: "read" },
    { resource: "lead", action: "create" },
    { resource: "lead", action: "read" },
    { resource: "notification", action: "*" as Action },
    { resource: "taskTemplate", action: "*" as Action },
    { resource: "taskDelegation", action: "*" as Action },
    { resource: "resource", action: "read" },
    { resource: "report", action: "read" },
    { resource: "analytics", action: "read" },
    { resource: "dashboard", action: "read" },
    { resource: "business:strategy", action: "read" },
    { resource: "user", action: "read" },
    { resource: "admin", action: "admin" as Action },
  ],
  business_head: [
    { resource: "business:*", action: "*" as Action },
    { resource: "project", action: "read" },
    { resource: "report", action: "*" as Action },
    { resource: "user", action: "read" },
    { resource: "admin", action: "admin" as Action },
    { resource: "task", action: "read" },
    { resource: "client", action: "read" },
    { resource: "lead", action: "*" as Action },
    { resource: "meeting", action: "read" },
    { resource: "document", action: "read" },
    { resource: "documentTemplate", action: "read" },
    { resource: "invoice", action: "create" },
    { resource: "invoice", action: "read" },
    { resource: "invoice", action: "update" },
    { resource: "message", action: "read" },
    { resource: "message", action: "create" },
    { resource: "changeRequest", action: "read" },
    { resource: "feedback", action: "create" },
    { resource: "feedback", action: "read" },
    { resource: "attendance", action: "read" },
    { resource: "risk", action: "*" as Action },
    { resource: "knowledge", action: "*" as Action },
    { resource: "notification", action: "read" },
    { resource: "notification", action: "update" },
    { resource: "resource", action: "read" },
    { resource: "analytics", action: "read" },
    { resource: "dashboard", action: "read" },
  ],
  lead_architect: [
    { resource: "project", action: "read" },
    { resource: "task", action: "read" },
    { resource: "task", action: "update" },
    { resource: "document", action: "read" },
    { resource: "meeting", action: "read" },
    { resource: "message", action: "read" },
    { resource: "message", action: "create" },
    { resource: "knowledge", action: "read" },
    { resource: "resource", action: "read" },
    { resource: "dashboard", action: "read" },
    { resource: "notification", action: "read" },
    { resource: "notification", action: "update" },
    { resource: "user", action: "read" },
    { resource: "admin", action: "admin" as Action },
  ],
  developer: [
    { resource: "task", action: "read" },
    { resource: "task", action: "update" },
    { resource: "project", action: "read" },
    { resource: "document", action: "read" },
    { resource: "meeting", action: "read" },
    { resource: "message", action: "read" },
    { resource: "message", action: "create" },
    { resource: "knowledge", action: "read" },
    { resource: "dashboard", action: "read" },
    { resource: "notification", action: "read" },
    { resource: "notification", action: "update" },
    { resource: "user", action: "read" },
    { resource: "admin", action: "admin" as Action },
  ],
  client: [
    { resource: "project", action: "read" },
    { resource: "project", action: "create" },
    { resource: "task", action: "read" },
    { resource: "task", action: "update" },
    { resource: "meeting", action: "read" },
    { resource: "feedback", action: "create" },
    { resource: "feedback", action: "read" },
    { resource: "meeting", action: "create" },
    { resource: "document", action: "read" },
    { resource: "document", action: "create" },
    { resource: "invoice", action: "read" },
    { resource: "message", action: "read" },
    { resource: "message", action: "create" },
    { resource: "changeRequest", action: "create" },
    { resource: "changeRequest", action: "read" },
    { resource: "notification", action: "read" },
    { resource: "notification", action: "update" },
    { resource: "team", action: "read" },
    { resource: "team", action: "create" },
    { resource: "user", action: "read" },
  ],
};

export const hasPermission = (
  user: SessionUser,
  resource: string,
  action: string
): boolean => {
  const rolePerms = PERMISSIONS[user.role as keyof typeof PERMISSIONS] || [];

  // Wildcard admin
  if (rolePerms.some((p) => p.resource === "*" && p.action === "admin")) {
    return true;
  }

  // Exact match
  if (rolePerms.some((p) => p.resource === resource && p.action === action)) {
    return true;
  }

  // Wildcard resource
  if (
    rolePerms.some((p) => p.resource === `${resource}:*` && p.action === action)
  ) {
    return true;
  }

  // Prefix wildcard resource (e.g., "business:*" matches "business:strategy")
  if (
    rolePerms.some((p) => {
      if (!p.resource.endsWith(":*")) return false;
      const prefix = p.resource.slice(0, -2);
      const matchesPrefix =
        resource === prefix || resource.startsWith(`${prefix}:`);
      return matchesPrefix && (p.action === action || p.action === "*");
    })
  ) {
    return true;
  }

  // Wildcard action
  if (rolePerms.some((p) => p.resource === resource && p.action === "*")) {
    return true;
  }

  // Scoped check (project:123:read)
  const [scopedResource] = resource.split(":");
  if (
    rolePerms.some((p) => p.resource === scopedResource && p.action === action)
  ) {
    return true;
  }
  if (
    rolePerms.some((p) => p.resource === scopedResource && p.action === "*")
  ) {
    return true;
  }

  return false;
};

export const requirePermission = (
  user: SessionUser,
  resource: string,
  action: string
): asserts user is SessionUser => {
  if (!hasPermission(user, resource, action)) {
    throw new Error(`Insufficient permissions for ${resource}:${action}`);
  }
};

export const rbacMiddleware = (resource: string, action: string) => {
  return async (
    req: Request
  ): Promise<{ user: SessionUser | null; authorized: boolean }> => {
    try {
      const user = await getUserFromHeader(req);
      if (!user || !hasPermission(user, resource, action)) {
        return { user: user || null, authorized: false };
      }

      return { user: user!, authorized: true };
    } catch {
      return { user: null, authorized: false };
    }
  };
};

export const requireRbac = (resource: string, action: string) => {
  return async (req: Request) => {
    const result = await rbacMiddleware(resource, action)(req);
    if (!result.authorized) {
      throw new Error(`Unauthorized: ${resource}:${action}`);
    }
    return result.user!;
  };
};

export function getPermissionsForRole(role: string): Permission[] {
  return PERMISSIONS[role as keyof typeof PERMISSIONS] || [];
}

export const BUSINESS_ROLES: SessionUser["role"][] = [
  "admin",
  "business_head",
  "project_manager",
  "lead_architect",
];

export const userHasBusinessRole = (user: SessionUser): boolean =>
  BUSINESS_ROLES.includes(user.role);

export async function getUserRole(
  request: Request
): Promise<SessionUser["role"] | null> {
  const user = await getUserFromHeader(request);
  return user?.role ?? null;
}

export async function getUserFromHeader(
  request: Request
): Promise<SessionUser | null> {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : authHeader;
  const getCookie = (name: string) => {
    const cookie = request.headers.get("cookie");
    if (!cookie) return null;
    const parts = cookie.split(";").map((c) => c.trim());
    for (const part of parts) {
      if (part.startsWith(`${name}=`)) {
        return decodeURIComponent(part.slice(name.length + 1));
      }
    }
    return null;
  };
  const urlToken = (() => {
    try {
      return new URL(request.url).searchParams.get("token");
    } catch {
      return null;
    }
  })();
  const cookieToken = getCookie("access_token") || getCookie("authToken");
  const token = bearer || urlToken || cookieToken;
  const isUnsafe = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (cookieToken && !bearer && isUnsafe) {
    const csrfHeader = request.headers.get("x-csrf-token");
    const csrfCookie = getCookie("csrf_token");
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return null;
    }
  }
  if (token) {
    const session = await verifySession(token);
    if (session) return session;
  }

  const userId = request.headers.get("x-user-id");
  if (!userId) return null;
  const user = await db.getUserById(userId);
  if (!user) return null;
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.clientId,
    orgId: user.orgId,
  };
}
