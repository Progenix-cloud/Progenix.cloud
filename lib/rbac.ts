import { db } from "./db";

export const allowedBusinessRoles = [
  "business_head",
  "project_manager",
  "lead_architect",
];

export async function getUserFromHeader(request: Request) {
  const userId = request.headers.get("x-user-id") || "";
  if (!userId) return null;
  try {
    const user = await db.getUserById(userId);
    return user || null;
  } catch (e) {
    return null;
  }
}

export function userHasBusinessRole(user: any) {
  if (!user || !user.role) return false;
  return allowedBusinessRoles.includes(user.role);
}
