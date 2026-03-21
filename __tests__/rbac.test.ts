import { describe, it, expect, beforeEach, vi } from "vitest";
import { hasPermission } from "@/lib/rbac";

const adminUser = { role: "admin" } as any;
const clientUser = { role: "client" } as any;
const managerUser = { role: "project_manager" } as any;
const devUser = { role: "developer" } as any;

describe("RBAC Permissions", () => {
  it("admin has full access", () => {
    expect(hasPermission(adminUser, "project", "delete")).toBe(true);
    expect(hasPermission(adminUser, "business:strategy", "update")).toBe(true);
    expect(hasPermission(adminUser, "user", "read")).toBe(true);
  });

  it("client limited access", () => {
    expect(hasPermission(clientUser, "project", "read")).toBe(true);
    expect(hasPermission(clientUser, "task", "read")).toBe(true);
    expect(hasPermission(clientUser, "task", "update")).toBe(true);
    expect(hasPermission(clientUser, "project", "delete")).toBe(false);
  });

  it("manager scoped access", () => {
    expect(hasPermission(managerUser, "task", "*")).toBe(true);
    expect(hasPermission(managerUser, "project", "read")).toBe(true);
    expect(hasPermission(managerUser, "admin", "admin")).toBe(true);
  });

  it("scoped resource checks", () => {
    expect(hasPermission(managerUser, "project:123", "read")).toBe(true);
    expect(hasPermission(devUser, "task:456", "update")).toBe(true);
  });
});

describe("RBAC Middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("authorizes admin via bearer token", async () => {
    vi.doMock("@/lib/auth", () => ({
      verifySession: vi.fn().mockResolvedValue({
        _id: "user-1",
        role: "admin",
        name: "Admin",
        email: "admin@example.com",
      }),
    }));

    const { rbacMiddleware } = await import("@/lib/rbac");
    const req = new Request("http://test", {
      headers: { Authorization: "Bearer testtoken" },
    });
    const result = await rbacMiddleware("project", "delete")(req);
    expect(result.authorized).toBe(true);
  });

  it("denies client for admin actions", async () => {
    vi.doMock("@/lib/auth", () => ({
      verifySession: vi.fn().mockResolvedValue({
        _id: "user-2",
        role: "client",
        name: "Client",
        email: "client@example.com",
      }),
    }));

    const { rbacMiddleware } = await import("@/lib/rbac");
    const req = new Request("http://test", {
      headers: { Authorization: "Bearer testtoken" },
    });
    const result = await rbacMiddleware("admin", "admin")(req);
    expect(result.authorized).toBe(false);
  });
});
