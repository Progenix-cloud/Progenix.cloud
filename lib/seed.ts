// Script to seed demo credentials into MongoDB
import { db, connectToDB } from "./db";

const DEMO_ORG = {
  _id: "org-001",
  name: "Default Organization",
  slug: "default-organization",
};

const DEMO_USERS = [
  {
    _id: "admin-001",
    email: "pm@agency.com",
    password: "demo",
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
    password: "demo",
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
    password: "demo",
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
    password: "demo",
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

const DEMO_DOCUMENT_TEMPLATES = [
  {
    _id: "template-001",
    title: "Proposal / Solution Brief",
    icon: "📋",
    type: "proposal",
    fields: [
      {
        name: "overview",
        label: "Overview",
        type: "textarea",
        placeholder: "Describe the solution overview",
      },
      {
        name: "problem_statement",
        label: "Problem Statement",
        type: "textarea",
        placeholder: "Describe the client's problem",
      },
      {
        name: "proposed_solution",
        label: "Proposed Solution",
        type: "textarea",
        placeholder: "Describe your proposed solution",
      },
      {
        name: "scope_summary",
        label: "Scope Summary",
        type: "textarea",
        placeholder: "Summarize the project scope",
      },
      {
        name: "architecture",
        label: "High-Level Architecture",
        type: "textarea",
        placeholder: "Describe the architecture",
      },
      {
        name: "timeline",
        label: "Timeline & Milestones",
        type: "textarea",
        placeholder: "List milestones and timeline",
      },
      {
        name: "pricing",
        label: "Pricing & Engagement Model",
        type: "textarea",
        placeholder: "Specify pricing details",
      },
      {
        name: "risks",
        label: "Risks & Assumptions",
        type: "textarea",
        placeholder: "List risks and assumptions",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-002",
    title: "Statement of Work (SOW)",
    icon: "📝",
    type: "sow",
    fields: [
      {
        name: "project_scope",
        label: "Project Scope",
        type: "textarea",
        placeholder: "Define what's in/out of scope",
      },
      {
        name: "deliverables",
        label: "Deliverables",
        type: "textarea",
        placeholder: "List all deliverables",
      },
      {
        name: "milestones",
        label: "Milestones & Payments",
        type: "textarea",
        placeholder: "Define milestones and payment schedule",
      },
      {
        name: "acceptance",
        label: "Acceptance Criteria",
        type: "textarea",
        placeholder: "Define acceptance criteria",
      },
      {
        name: "change_management",
        label: "Change Management",
        type: "textarea",
        placeholder: "Describe change management process",
      },
      {
        name: "roles",
        label: "Roles & Responsibilities",
        type: "textarea",
        placeholder: "Define roles and responsibilities",
      },
      {
        name: "confidentiality",
        label: "Confidentiality & IP",
        type: "textarea",
        placeholder: "Specify confidentiality and IP terms",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-003",
    title: "Business Requirements Document (BRD)",
    icon: "💼",
    type: "brd",
    fields: [
      {
        name: "objectives",
        label: "Business Objectives",
        type: "textarea",
        placeholder: "List business objectives",
      },
      {
        name: "stakeholders",
        label: "Stakeholders",
        type: "textarea",
        placeholder: "List key stakeholders",
      },
      {
        name: "current_state",
        label: "Current State Analysis",
        type: "textarea",
        placeholder: "Analyze current state",
      },
      {
        name: "future_state",
        label: "Future State Vision",
        type: "textarea",
        placeholder: "Describe desired future state",
      },
      {
        name: "personas",
        label: "User Personas",
        type: "textarea",
        placeholder: "Define user personas",
      },
      {
        name: "requirements",
        label: "Business Requirements",
        type: "textarea",
        placeholder: "List business requirements",
      },
      {
        name: "constraints",
        label: "Constraints",
        type: "textarea",
        placeholder: "List constraints and limitations",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-004",
    title: "Functional Requirements Document (FRD)",
    icon: "⚙️",
    type: "frd",
    fields: [
      {
        name: "system_overview",
        label: "System Overview",
        type: "textarea",
        placeholder: "Describe system overview",
      },
      {
        name: "user_roles",
        label: "User Roles & Permissions",
        type: "textarea",
        placeholder: "Define user roles",
      },
      {
        name: "functional_reqs",
        label: "Functional Requirements",
        type: "textarea",
        placeholder: "List functional requirements",
      },
      {
        name: "use_cases",
        label: "Use Cases / User Stories",
        type: "textarea",
        placeholder: "Define use cases",
      },
      {
        name: "validation",
        label: "Validation Rules",
        type: "textarea",
        placeholder: "Define validation rules",
      },
      {
        name: "error_handling",
        label: "Error Handling",
        type: "textarea",
        placeholder: "Describe error handling",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-005",
    title: "System Design Document",
    icon: "🏗️",
    type: "system_design",
    fields: [
      {
        name: "architecture",
        label: "Architecture Overview",
        type: "textarea",
        placeholder: "Describe system architecture",
      },
      {
        name: "tech_stack",
        label: "Tech Stack",
        type: "textarea",
        placeholder: "List technology stack",
      },
      {
        name: "components",
        label: "System Components",
        type: "textarea",
        placeholder: "Describe components",
      },
      {
        name: "data_flow",
        label: "Data Flow",
        type: "textarea",
        placeholder: "Describe data flow",
      },
      {
        name: "integration",
        label: "Integration Points",
        type: "textarea",
        placeholder: "List integration points",
      },
      {
        name: "security",
        label: "Security Overview",
        type: "textarea",
        placeholder: "Describe security approach",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-006",
    title: "High-Level Design (HLD)",
    icon: "📊",
    type: "hld",
    fields: [
      {
        name: "modules",
        label: "Module Breakdown",
        type: "textarea",
        placeholder: "Break down modules",
      },
      {
        name: "interactions",
        label: "Service Interactions",
        type: "textarea",
        placeholder: "Describe service interactions",
      },
      {
        name: "api_overview",
        label: "API Overview",
        type: "textarea",
        placeholder: "Provide API overview",
      },
      {
        name: "data_storage",
        label: "Data Storage Strategy",
        type: "textarea",
        placeholder: "Describe data storage",
      },
      {
        name: "scalability",
        label: "Scalability & Availability",
        type: "textarea",
        placeholder: "Discuss scalability",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-007",
    title: "Low-Level Design (LLD)",
    icon: "🔧",
    type: "lld",
    fields: [
      {
        name: "component_design",
        label: "Detailed Component Design",
        type: "textarea",
        placeholder: "Design components",
      },
      {
        name: "database_design",
        label: "Database Design",
        type: "textarea",
        placeholder: "Design database schema",
      },
      {
        name: "api_contracts",
        label: "API Contracts",
        type: "textarea",
        placeholder: "Define API contracts",
      },
      {
        name: "algorithms",
        label: "Algorithms & Logic",
        type: "textarea",
        placeholder: "Describe algorithms",
      },
      {
        name: "error_handling",
        label: "Error & Exception Handling",
        type: "textarea",
        placeholder: "Error handling approach",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-008",
    title: "Test Plan",
    icon: "✅",
    type: "test_plan",
    fields: [
      {
        name: "test_strategy",
        label: "Test Strategy",
        type: "textarea",
        placeholder: "Describe test strategy",
      },
      {
        name: "test_types",
        label: "Test Types",
        type: "textarea",
        placeholder: "List test types",
      },
      {
        name: "test_cases",
        label: "Test Cases",
        type: "textarea",
        placeholder: "Define test cases",
      },
      {
        name: "bug_classification",
        label: "Bug Classification",
        type: "textarea",
        placeholder: "Define bug levels",
      },
      {
        name: "acceptance",
        label: "Acceptance Criteria",
        type: "textarea",
        placeholder: "Define acceptance criteria",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
  {
    _id: "template-009",
    title: "Deployment Plan",
    icon: "🚀",
    type: "deployment",
    fields: [
      {
        name: "overview",
        label: "Deployment Overview",
        type: "textarea",
        placeholder: "Describe deployment overview",
      },
      {
        name: "environment",
        label: "Environment Setup",
        type: "textarea",
        placeholder: "Describe environment setup",
      },
      {
        name: "release_process",
        label: "Release Process",
        type: "textarea",
        placeholder: "Describe release process",
      },
      {
        name: "rollback",
        label: "Rollback Strategy",
        type: "textarea",
        placeholder: "Describe rollback strategy",
      },
      {
        name: "go_live",
        label: "Go-Live Checklist",
        type: "textarea",
        placeholder: "Create go-live checklist",
      },
    ],
    orgId: "org-001",
    isDefault: true,
    status: "active",
  },
];

export async function seedDemoData() {
  try {
    await connectToDB();
    console.log("🌱 Seeding demo credentials...");

    // Seed organization
    await db.ensureOrganization(DEMO_ORG);

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

    // Seed document templates
    for (const template of DEMO_DOCUMENT_TEMPLATES) {
      const existing = await db.getDocumentTemplateById(template._id);
      if (!existing) {
        await db.createDocumentTemplate(template);
        console.log(`✅ Created document template: ${template.title}`);
      } else {
        console.log(`⏭️  Document template already exists: ${template.title}`);
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
