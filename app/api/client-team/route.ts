import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { notificationsBus } from "@/lib/notifications-bus";
import { ADMIN_ROLES, ROLES } from "@/lib/auth";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  projectId: z.string().min(1),
  members: z.array(z.string()).min(1),
  name: z.string().min(1),
});

const querySchema = z.object({
  projectId: z.string().optional(),
  clientId: z.string().optional(),
});

export const POST = withRBAC(
  "team",
  "create",
  async (req: NextRequest, _ctx, user) => {
    try {
      if (user.role !== ROLES.CLIENT && !ADMIN_ROLES.includes(user.role)) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }

      const body = await req.json();
      const validated = validateBody(createSchema, body);

      const project = await db.getProjectById(validated.projectId);
      if (!project) {
        return apiError("PROJECT_NOT_FOUND", "Project not found", 404);
      }

      if (user.role === ROLES.CLIENT && project.clientId !== user.clientId) {
        return apiError("FORBIDDEN", "Unauthorized", 403);
      }

      const team = await db.createTeam({
        name: validated.name,
        projectId: validated.projectId,
        clientId: project.clientId,
        members: validated.members.map((id: string) => ({
          userId: id,
          role: "member",
        })),
      });

      await db.updateProject(validated.projectId, {
        teamId: team._id,
        teamMembersCount: validated.members.length,
        teamMembers: validated.members,
      });

      await db.logAuditEvent({
        actorId: user._id,
        actorRole: user.role,
        action: "client-team.create",
        entityType: "team",
        entityId: team._id,
        details: { projectId: validated.projectId, memberIds: validated.members },
      });

      notificationsBus.publishToAll({
        type: "client-team.create",
        team,
        projectId: validated.projectId,
        timestamp: new Date().toISOString(),
      });

      return apiSuccess(team, "Client team created successfully");
    } catch (error) {
      console.error("Client team creation error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("TEAM_CREATE_FAILED", "Internal server error", 500);
    }
  }
);

export const GET = withRBAC(
  "team",
  "read",
  async (req: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = validateQuery(querySchema, searchParams);

      const filter: any = {};
      if (query.projectId) filter.projectId = query.projectId;

      if (user.role === ROLES.CLIENT) {
        filter.clientId = user.clientId;
      } else if (query.clientId) {
        filter.clientId = query.clientId;
      }

      const teams = await db.getTeams(filter);

      return apiSuccess(teams);
    } catch (error) {
      console.error("Client team fetch error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("TEAM_FETCH_FAILED", "Internal server error", 500);
    }
  }
);
