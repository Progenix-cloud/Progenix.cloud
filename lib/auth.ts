// Authentication utilities
import bcryptjs from "bcryptjs";
import crypto from "crypto";
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
  orgId?: string;
}

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-secret-change-me";
const JWT_ISSUER = "software-agency-website";
const JWT_AUDIENCE = "software-agency-website";
const ACCESS_TOKEN_TTL_SEC = 60 * 60; // 1 hour
const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: SessionUser["role"];
  clientId?: string;
  orgId?: string;
  type: "access" | "refresh";
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 ? "=".repeat(4 - (padded.length % 4)) : "";
  return Buffer.from(padded + pad, "base64").toString("utf8");
}

function signJwt(payload: JwtPayload) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(data)
    .digest();
  const sig = base64UrlEncode(signature);
  return `${data}.${sig}`;
}

function verifyJwt(token: string): JwtPayload | null {
  try {
    const [headerB64, payloadB64, sigB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !sigB64) return null;
    const data = `${headerB64}.${payloadB64}`;
    const expected = base64UrlEncode(
      crypto.createHmac("sha256", JWT_SECRET).update(data).digest()
    );
    if (sigB64.length !== expected.length) {
      return null;
    }
    if (
      !crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expected))
    ) {
      return null;
    }
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== JWT_ISSUER || payload.aud !== JWT_AUDIENCE) {
      return null;
    }
    if (!payload.exp || payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function createAccessToken(user: SessionUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.clientId,
    orgId: user.orgId,
    type: "access",
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SEC,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
  };
  return signJwt(payload);
}

function createRefreshToken(user: SessionUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.clientId,
    orgId: user.orgId,
    type: "refresh",
    iat: now,
    exp: now + REFRESH_TOKEN_TTL_SEC,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
  };
  return signJwt(payload);
}

async function ensureClientId(user: any) {
  if (!user || user.role !== "client") return user;
  if (user.clientId) return user;
  const existingClient = await db.getClientByEmail(user.email);
  const client =
    existingClient ||
    (await db.createClient({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      avatar: user.avatar || "",
    }));
  if (client?._id) {
    try {
      await db.updateUser(user._id, { clientId: client._id });
    } catch {
      // ignore update failures
    }
    return { ...user, clientId: client._id };
  }
  return user;
}

async function ensureClientIdForRegistration(input: {
  email: string;
  name: string;
  role: SessionUser["role"];
}) {
  if (input.role !== "client") return null;
  const existingClient = await db.getClientByEmail(input.email);
  if (existingClient?._id) return existingClient._id;
  const client = await db.createClient({
    name: input.name,
    email: input.email,
    phone: "",
  });
  return client?._id || null;
}

export function issueTokens(user: SessionUser) {
  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}

// Hash password using bcryptjs with 12 salt rounds
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcryptjs.hash(password, saltRounds);
}

// Verify password against hash using bcryptjs
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return bcryptjs.compare(password, hashedPassword);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

export async function createSession(user: SessionUser): Promise<string> {
  return createAccessToken(user);
}

export async function verifySession(
  token: string
): Promise<SessionUser | null> {
  try {
    if (token.includes(".")) {
      const payload = verifyJwt(token);
      if (!payload) return null;
      if (payload.type !== "access") return null;
      await db.connect();
      const user = await db.getUserById(payload.sub);
      if (!user) return null;
      const ensured = await ensureClientId(user);
      return {
        _id: ensured._id,
        email: ensured.email,
        name: ensured.name,
        role: ensured.role,
        clientId: ensured.clientId,
        orgId: ensured.orgId,
      };
    }

    // Legacy base64 token fallback
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    if (decoded.exp < Date.now()) return null;
    await db.connect();
    const user = await db.getUserById(decoded.userId);
    if (!user) return null;
    const ensured = await ensureClientId(user);
    return {
      _id: ensured._id,
      email: ensured.email,
      name: ensured.name,
      role: ensured.role,
      clientId: ensured.clientId,
      orgId: ensured.orgId,
    };
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<SessionUser | null> {
  try {
    if (!token.includes(".")) return null;
    const payload = verifyJwt(token);
    if (!payload) return null;
    if (payload.type !== "refresh") return null;
    await db.connect();
    const user = await db.getUserById(payload.sub);
    if (!user) return null;
    const ensured = await ensureClientId(user);
    return {
      _id: ensured._id,
      email: ensured.email,
      name: ensured.name,
      role: ensured.role,
      clientId: ensured.clientId,
      orgId: ensured.orgId,
    };
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string; refreshToken: string } | null> {
  await db.connect();
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

  const ensuredUser = await ensureClientId(user);

  const sessionUser: SessionUser = {
    _id: ensuredUser._id,
    email: ensuredUser.email,
    name: ensuredUser.name,
    role: ensuredUser.role,
    clientId: ensuredUser.clientId,
    orgId: ensuredUser.orgId,
  };

  const token = await createSession(sessionUser);
  const refreshToken = createRefreshToken(sessionUser);

  return { user: sessionUser, token, refreshToken };
}

export async function register(
  email: string,
  name: string,
  password: string,
  role: SessionUser["role"] = "client"
): Promise<{ user: SessionUser; token: string; refreshToken: string } | null> {
  await db.connect();
  await db.ensureOrganization({
    _id: "org-001",
    name: "Default Organization",
    slug: "default-organization",
  });
  // Check if user already exists
  const existingUser = await db.getUser(email);
  if (existingUser) {
    return null; // User already exists
  }

  // Hash password before storing
  const hashedPassword = await hashPassword(password);
  const clientId = await ensureClientIdForRegistration({ email, name, role });
  const user = await db.createUser({
    email,
    name,
    password: hashedPassword,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    phone: "",
    orgId: "org-001",
    ...(clientId ? { clientId } : {}),
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
    orgId: user.orgId,
  };

  const token = await createSession(sessionUser);
  const refreshToken = createRefreshToken(sessionUser);

  return { user: sessionUser, token, refreshToken };
}

export function getAuthConfig() {
  return {
    accessTtlSec: ACCESS_TOKEN_TTL_SEC,
    refreshTtlSec: REFRESH_TOKEN_TTL_SEC,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  };
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

export const ADMIN_ROLES: SessionUser["role"][] = [
  ROLES.ADMIN,
  ROLES.PROJECT_MANAGER,
  ROLES.BUSINESS_HEAD,
  ROLES.LEAD_ARCHITECT,
  ROLES.DEVELOPER,
];

export const CLIENT_ROLES = [ROLES.CLIENT];
