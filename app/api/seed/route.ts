import { NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

const DEMO_ORG = {
  _id: "org-001",
  name: "Default Organization",
  slug: "default-organization",
};

// Note: These are temporary default passwords for seeding only.
// They will be hashed before storage. See documentation for production setup.
const DEMO_PASSWORDS = {
  admin: "SecurePassword123!@#",
  projectManager: "ProjectMgr456$%^",
  businessHead: "BusinessHead789&*(",
  client: "ClientUser012)+_",
};

const DEMO_USERS = [
  {
    _id: "admin-001",
    email: "pm@agency.com",
    name: "Sarah Chen",
    role: "project_manager",
    orgId: "org-001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    phone: "+1-234-567-8901",
    joinDate: new Date("2023-01-15"),
  },
  {
    _id: "admin-002",
    email: "ba@agency.com",
    name: "Alex Kumar",
    role: "business_head",
    orgId: "org-001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    phone: "+1-234-567-8902",
    joinDate: new Date("2022-06-01"),
  },
  {
    _id: "admin-003",
    email: "architect@agency.com",
    name: "Maya Patel",
    role: "lead_architect",
    orgId: "org-001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    phone: "+1-234-567-8903",
    joinDate: new Date("2022-03-10"),
  },
  {
    _id: "client-001",
    email: "client@demo.com",
    name: "Demo Client",
    role: "client",
    orgId: "org-001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Client",
    phone: "+1-555-0101",
    joinDate: new Date("2024-01-10"),
    clientId: "CLIENT-001",
  },
];

const DEMO_CLIENTS = [
  {
    _id: "client-001",
    name: "TechStartup Inc",
    email: "contact@techstartup.com",
    phone: "+1-555-0101",
    industry: "Technology",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechStartup",
    joinDate: new Date("2024-01-10"),
  },
];

const DEMO_PROJECTS = [
  {
    _id: "proj-001",
    name: "E-Commerce Platform",
    clientId: "CLIENT-001",
    description:
      "Full-stack e-commerce platform with React frontend and Node backend",
    status: "in-progress",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-06-15"),
    budget: 50000,
    spent: 35000,
    teamMembers: ["admin-001", "admin-003"],
    progress: 65,
    priority: "high",
    technology: ["React", "Node.js", "MongoDB", "AWS"],
    milestones: [
      {
        id: "m1",
        name: "Backend API",
        status: "completed",
        dueDate: new Date("2024-02-15"),
        deliverables: ["REST API", "Database Schema"],
      },
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
];

export async function POST(_request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return apiError("FORBIDDEN", "Seeding disabled in production", 403);
    }
    await db.connect();

    // Seed organization
    await db.ensureOrganization(DEMO_ORG);

    const results = {
      users: 0,
      clients: 0,
      projects: 0,
      skipped: 0,
    };

    // Seed users with hashed passwords
    for (const user of DEMO_USERS) {
      const existing = await db.getUser(user.email);
      if (!existing) {
        // Hash password based on role
        const hashedPassword = await bcryptjs.hash(
          user.role === "project_manager"
            ? DEMO_PASSWORDS.projectManager
            : user.role === "business_head"
              ? DEMO_PASSWORDS.businessHead
              : user.role === "lead_architect"
                ? DEMO_PASSWORDS.admin
                : DEMO_PASSWORDS.client,
          12
        );

        await db.createUser({
          ...user,
          password: hashedPassword,
        });
        results.users++;
      } else {
        results.skipped++;
      }
    }

    // Seed clients
    for (const client of DEMO_CLIENTS) {
      const existing = await db.getClientById(client._id);
      if (!existing) {
        await db.createClient(client);
        results.clients++;
      } else {
        results.skipped++;
      }
    }

    // Seed projects
    for (const project of DEMO_PROJECTS) {
      const existing = await db.getProjectById(project._id);
      if (!existing) {
        await db.createProject(project);
        results.projects++;
      } else {
        results.skipped++;
      }
    }

    return apiSuccess(
      {
        results,
        note: "Credentials have been generated and hashed. See server logs or documentation for access details.",
      },
      "Demo data seeded successfully"
    );
  } catch (error) {
    console.error("Seed error:", error);
    return apiError(
      "SEED_FAILED",
      error instanceof Error ? error.message : "Failed to seed demo data",
      500
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    return apiSuccess({
      message:
        "Seeding endpoint - POST to create demo data with securely hashed passwords",
      warning:
        "This endpoint is for development only. Do not use in production.",
    });
  } catch (error) {
    return apiError(
      "SEED_INFO_FAILED",
      "Failed to retrieve endpoint info",
      500
    );
  }
}
