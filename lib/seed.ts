// Script to seed demo credentials into MongoDB
import { db, connectToDB } from "./db";

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

export async function seedDemoData() {
  try {
    await connectToDB();
    console.log("🌱 Seeding demo credentials...");

    // Seed users
    for (const user of DEMO_USERS) {
      const existing = await db.getUser(user.email);
      if (!existing) {
        await db.createUser(user);
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`⏭️  User already exists: ${user.email}`);
      }
    }

    // Seed clients
    for (const client of DEMO_CLIENTS) {
      const existing = await db.getClientById(client._id);
      if (!existing) {
        await db.createClient(client);
        console.log(`✅ Created client: ${client.name}`);
      } else {
        console.log(`⏭️  Client already exists: ${client.name}`);
      }
    }

    // Seed projects
    for (const project of DEMO_PROJECTS) {
      const existing = await db.getProjectById(project._id);
      if (!existing) {
        await db.createProject(project);
        console.log(`✅ Created project: ${project.name}`);
      } else {
        console.log(`⏭️  Project already exists: ${project.name}`);
      }
    }

    console.log("🎉 Demo data seeded successfully!");
    console.log("\n📝 Demo Credentials:");
    console.log("─".repeat(50));
    DEMO_USERS.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: demo`);
      console.log(`Role: ${user.role}`);
      console.log("─".repeat(50));
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData();
}

export const DEMO_CREDENTIALS = DEMO_USERS.map((u) => ({
  email: u.email,
  password: "demo",
  name: u.name,
  role: u.role,
}));
