import { NextRequest, NextResponse } from "next/server";
import { db, connectToDB } from "@/lib/db";

const DEMO_USERS = [
  {
    _id: "admin-001",
    email: "pm@agency.com",
    password: "demo",
    name: "Sarah Chen",
    role: "project_manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    phone: "+1-234-567-8901",
    joinDate: new Date("2023-01-15"),
  },
  {
    _id: "admin-002",
    email: "ba@agency.com",
    password: "demo",
    name: "Alex Kumar",
    role: "business_head",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    phone: "+1-234-567-8902",
    joinDate: new Date("2022-06-01"),
  },
  {
    _id: "admin-003",
    email: "architect@agency.com",
    password: "demo",
    name: "Maya Patel",
    role: "lead_architect",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    phone: "+1-234-567-8903",
    joinDate: new Date("2022-03-10"),
  },
  {
    _id: "client-001",
    email: "client@demo.com",
    password: "demo",
    name: "Demo Client",
    role: "client",
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
    createdDate: new Date("2024-01-15"),
  },
];

export async function POST(_request: NextRequest) {
  try {
    await connectToDB();

    const results = {
      users: 0,
      clients: 0,
      projects: 0,
      skipped: 0,
    };

    // Seed users
    for (const user of DEMO_USERS) {
      const existing = await db.getUser(user.email);
      if (!existing) {
        await db.createUser(user);
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

    return NextResponse.json(
      {
        success: true,
        message: "Demo data seeded successfully",
        results,
        credentials: DEMO_USERS.map((u) => ({
          email: u.email,
          password: "demo",
          name: u.name,
          role: u.role,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to seed demo data",
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "POST to this endpoint to seed demo credentials",
      credentials: DEMO_USERS.map((u) => ({
        email: u.email,
        password: "demo",
        name: u.name,
        role: u.role,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve credentials" },
      { status: 500 }
    );
  }
}
