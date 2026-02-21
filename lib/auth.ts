// Authentication utilities
import { db } from "./db";

export interface SessionUser {
  _id: string;
  email: string;
  name: string;
  role:
    | "admin"
    | "project_manager"
    | "business_head"
    | "lead_architect"
    | "developer"
    | "client";
  clientId?: string;
}

// Simple password hashing for mock data (no bcryptjs needed)
// For production, use bcryptjs: import bcryptjs and use bcryptjs.hash(password, 10)
export async function hashPassword(password: string): Promise<string> {
  // For mock mode, just encode the password with a salt prefix
  const salt = "mockSalt2024";
  return Promise.resolve(Buffer.from(salt + password).toString("base64"));
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // For mock data, accept 'demo' or 'password123' for all users
    // In production, use proper bcrypt comparison
    return password === "demo" || password === "password123";
  } catch (error) {
    return false;
  }
}

export async function createSession(user: SessionUser): Promise<string> {
  // Create a JWT token or session ID
  // For now, using simple base64 encoding
  const sessionData = JSON.stringify({
    userId: user._id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return Buffer.from(sessionData).toString("base64");
}

export async function verifySession(
  token: string
): Promise<SessionUser | null> {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());

    // Check expiration
    if (decoded.exp < Date.now()) {
      return null;
    }

    // Verify user still exists
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
    };
  } catch (error) {
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string } | null> {
  const user = await db.getUser(email);

  if (!user) {
    return null;
  }

  // For mock data, compare with stored password
  // In production, use bcryptjs.compare()
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  const sessionUser: SessionUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.clientId,
  };

  const token = await createSession(sessionUser);

  return { user: sessionUser, token };
}

export async function register(
  email: string,
  name: string,
  password: string,
  role: SessionUser["role"] = "client"
): Promise<{ user: SessionUser; token: string } | null> {
  // Check if user already exists
  const existingUser = await db.getUser(email);
  if (existingUser) {
    return null; // User already exists
  }

  // Create new user
  const hashedPassword = await hashPassword(password);
  const user = await db.createUser({
    email,
    name,
    password: hashedPassword,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    phone: "",
  });

  if (!user) {
    return null;
  }

  const sessionUser: SessionUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.clientId,
  };

  const token = await createSession(sessionUser);

  return { user: sessionUser, token };
}

// Role-based access control
export function checkRole(
  userRole: SessionUser["role"],
  requiredRoles: SessionUser["role"][]
): boolean {
  return requiredRoles.includes(userRole);
}

export const ROLES = {
  ADMIN: "admin" as const,
  PROJECT_MANAGER: "project_manager" as const,
  BUSINESS_HEAD: "business_head" as const,
  LEAD_ARCHITECT: "lead_architect" as const,
  DEVELOPER: "developer" as const,
  CLIENT: "client" as const,
};

export const ADMIN_ROLES = [
  ROLES.PROJECT_MANAGER,
  ROLES.BUSINESS_HEAD,
  ROLES.LEAD_ARCHITECT,
  ROLES.DEVELOPER,
];

export const CLIENT_ROLES = [ROLES.CLIENT];
