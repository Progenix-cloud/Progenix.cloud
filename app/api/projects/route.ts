import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { ROLES } from "@/lib/auth";
import { auditCreate, auditUpdate } from "@/lib/audit";
import { z } from "zod";

const querySchema = z.object({
  id: z.string().optional(),
  clientId: z.string().optional(),
  status: z.string().optional(),
  includeTeam: z.coerce.boolean().optional(),
});

const createSchema = z
  .object({
    name: z.string().min(1),
    clientId: z.string().min(1).optional(),
  })
  .passthrough();

const updateSchema = z.record(z.any());

export const GET = withRBAC(
  "project",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);
      const { id, clientId, status, includeTeam } = query;

      if (id) {
        const project = await db.getProjectById(id);
        if (
          user.role === ROLES.CLIENT &&
          (!user.clientId || project?.clientId !== user.clientId)
        ) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        return apiSuccess(project);
      }

      if (user.role === ROLES.CLIENT && !user.clientId) {
        return apiSuccess([]);
      }

      const scopedClientId =
        user.role === ROLES.CLIENT ? user.clientId : clientId || undefined;

      // For clients, ensure they have a clientId
      if (user.role === ROLES.CLIENT && !user.clientId) {
        return apiError("FORBIDDEN", "Client session invalid", 403);
      }

      const projects = await db.getProjects({
        clientId: scopedClientId || undefined,
        status: status || undefined,
      });

      if (!includeTeam) {
        return apiSuccess(projects);
      }

      const projectIds = projects.map((p: any) => p._id);
      const teams = await db.getTeams({ projectIds });
      const teamByProjectId = new Map(
        teams.map((team: any) => [team.projectId, team])
      );

      const memberIds = new Set<string>();
      teams.forEach((team: any) => {
        (team.members || []).forEach((m: any) => memberIds.add(m.userId));
      });

      const members = await db.getUsersByIds(Array.from(memberIds));
      const memberById = new Map(members.map((m: any) => [m._id, m]));

      const enriched = projects.map((project: any) => {
        const team = teamByProjectId.get(project._id);
        if (!team) return project;
        const teamMembers = (team.members || []).map((m: any) => {
          const userItem = memberById.get(m.userId);
          return {
            userId: m.userId,
            role: m.role,
            name: userItem?.name,
            email: userItem?.email,
          };
        });
        return {
          ...project,
          team: {
            ...team,
            members: teamMembers,
          },
        };
      });

      return apiSuccess(enriched);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("PROJECTS_FETCH_FAILED", "Failed to fetch projects", 500);
    }
  }
);

export const POST = withRBAC(
  "project",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = await request.json();
      const validated = validateBody(createSchema, body);

      if (user.role === ROLES.CLIENT) {
        if (!user.clientId) {
          return apiError("FORBIDDEN", "Missing client session", 403);
        }
        if (validated.clientId && validated.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
      }

      const newProject = await db.createProject({
        ...validated,
        clientId:
          user.role === ROLES.CLIENT
            ? user.clientId || validated.clientId
            : validated.clientId,
      });
      await auditCreate(user, "project", newProject, request);

      return apiSuccess(newProject, "Project created");
    } catch (error) {
      console.error("Failed to create project:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("PROJECT_CREATE_FAILED", "Failed to create project", 500);
    }
  }
);

export const PUT = withRBAC(
  "project",
  "update",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);
      const id = query.id;
      if (!id) {
        return apiError("MISSING_ID", "Missing id", 400);
      }
      const updates = validateBody(updateSchema, await request.json());
      const existing = await db.getProjectById(id);
      const updated = await db.updateProject(id, updates);
      await auditUpdate(user, "project", id, existing, updated, request);
      return apiSuccess(updated, "Project updated");
    } catch (error) {
      console.error("Failed to update project:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("PROJECT_UPDATE_FAILED", "Failed to update project", 500);
    }
  }
);
