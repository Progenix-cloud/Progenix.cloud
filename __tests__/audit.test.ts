import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    logAuditEvent: vi.fn().mockResolvedValue({}),
  },
}));

import { logAuditEvent, auditCreate, auditUpdate, auditDelete } from "@/lib/audit";
import { db } from "@/lib/db";

describe("Audit Logging Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logAuditEvent passes actor info and request metadata", async () => {
    const user = {
      _id: "user-1",
      role: "admin",
      name: "Admin",
      email: "admin@example.com",
    } as any;

    const req = new Request("http://test", {
      headers: {
        "x-forwarded-for": "10.0.0.1",
        "user-agent": "vitest-agent",
      },
    });

    await logAuditEvent(user, "login", "auth", "user-1", req, {
      details: { email: user.email },
    });

    expect(db.logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "user-1",
        actorRole: "admin",
        actorName: "Admin",
        action: "login",
        entityType: "auth",
        entityId: "user-1",
        details: { email: "admin@example.com" },
        ipAddress: "10.0.0.1",
        userAgent: "vitest-agent",
      })
    );
  });

  it("auditCreate logs create with entity id", async () => {
    const user = { _id: "u1", role: "admin", name: "Admin" } as any;
    const req = new Request("http://test");
    await auditCreate(user, "project", { _id: "proj-1", name: "Test" }, req);

    expect(db.logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "create",
        entityType: "project",
        entityId: "proj-1",
      })
    );
  });

  it("auditUpdate logs update", async () => {
    const user = { _id: "u1", role: "admin", name: "Admin" } as any;
    const req = new Request("http://test");
    await auditUpdate(user, "project", "proj-1", { name: "Old" }, { name: "New" }, req);

    expect(db.logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "update",
        entityType: "project",
        entityId: "proj-1",
      })
    );
  });

  it("auditDelete logs delete", async () => {
    const user = { _id: "u1", role: "admin", name: "Admin" } as any;
    const req = new Request("http://test");
    await auditDelete(user, "project", "proj-1", { name: "Old" }, req);

    expect(db.logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        entityType: "project",
        entityId: "proj-1",
      })
    );
  });
});
