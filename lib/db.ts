// MongoDB connection and database operations
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/agency-db";

let cachedConnection: typeof mongoose | null = null;

// MongoDB Schemas
const userSchema = new mongoose.Schema(
  {
    _id: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "project_manager",
        "business_head",
        "lead_architect",
        "developer",
        "client",
      ],
      required: true,
    },
    orgId: { type: String, index: true },
    avatar: String,
    phone: String,
    joinDate: { type: Date, default: Date.now },
    clientId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

const projectSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true },
    clientId: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["planning", "in-progress", "on-hold", "completed"],
      default: "planning",
    },
    startDate: Date,
    endDate: Date,
    budget: Number,
    spent: { type: Number, default: 0 },
    teamMembers: [String],
    teamId: String,
    teamMembersCount: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    technology: [String],
    milestones: [
      {
        id: String,
        name: String,
        status: String,
        dueDate: Date,
        deliverables: [String],
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    completedDate: Date,
    // legacy compatibility
    createdDate: { type: Date, default: Date.now },
    updatedDate: Date,
  },
  { collection: "projects" }
);

const teamSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true },
    projectId: { type: String, required: true },
    clientId: String,
    members: [
      {
        userId: String,
        role: { type: String, default: "member" },
        title: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // legacy compatibility
    createdDate: { type: Date, default: Date.now },
    updatedDate: Date,
  },
  { collection: "teams" }
);

const auditLogSchema = new mongoose.Schema(
  {
    _id: String,
    actorId: String,
    actorRole: String,
    actorName: String,
    action: String,
    entityType: String,
    entityId: String,
    oldValue: { type: mongoose.Schema.Types.Mixed, default: {} },
    newValue: { type: mongoose.Schema.Types.Mixed, default: {} },
    changes: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: String,
    userAgent: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "auditLogs" }
);

const meetingSchema = new mongoose.Schema(
  {
    _id: String,
    projectId: String,
    clientId: String,
    title: { type: String, required: true },
    description: String,
    date: Date,
    time: String,
    duration: Number,
    attendees: [String],
    meetingLink: String,
    type: {
      type: String,
      enum: [
        "kickoff",
        "review",
        "feedback",
        "standup",
        "other",
        "meeting",
        "client-meeting",
      ],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
    updatedDate: Date,
  },
  { collection: "meetings" }
);

const documentSchema = new mongoose.Schema(
  {
    _id: String,
    projectId: String,
    clientId: String,
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "proposal",
        "sow",
        "spec",
        "documentation",
        "brd",
        "frd",
        "system_design",
        "hld",
        "lld",
        "test_plan",
        "deployment",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "in-progress", "completed"],
      default: "draft",
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: String,
  },
  { collection: "documents" }
);

const taskSchema = new mongoose.Schema(
  {
    _id: String,
    projectId: String,
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "pending",
        "in-progress",
        "submitted",
        "reviewed",
        "completed",
        "blocked",
      ],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    order: { type: Number, default: 0 },
    dueDate: Date,
    scheduledDate: Date, // When PM scheduled this task
    startedDate: Date, // When assignee started work
    submittedDate: Date, // When user marked as completed
    reviewedDate: Date, // When PM reviewed
    completedDate: Date, // When PM marked as completed
    reviewedBy: String, // PM who reviewed
    estimatedHours: Number,
    actualHours: Number,
    isTemplate: { type: Boolean, default: false },
    templateId: String,
    tags: [String],
    dependencies: [String], // Task IDs this depends on
    subtasks: [
      {
        id: String,
        title: String,
        status: String,
      },
    ],
    delegationHistory: [
      {
        fromUser: String,
        toUser: String,
        delegatedAt: Date,
        reason: String,
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // legacy compatibility
    createdDate: { type: Date, default: Date.now },
    updatedDate: Date,
  },
  { collection: "tasks" }
);

const attendanceSchema = new mongoose.Schema(
  {
    _id: String,
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day"],
      default: "present",
    },
    checkInTime: Date,
    checkOutTime: Date,
    tasks: [
      {
        taskId: String,
        title: String,
        status: String,
        completedAt: Date,
      },
    ],
    isAutoMarked: { type: Boolean, default: false },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
    updatedDate: Date,
  },
  { collection: "attendance" }
);

const taskTemplateSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true },
    description: String,
    category: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    estimatedHours: Number,
    tags: [String],
    isActive: { type: Boolean, default: true },
    createdBy: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
  },
  { collection: "task_templates" }
);

const taskDelegationSchema = new mongoose.Schema(
  {
    _id: String,
    taskId: { type: String, required: true },
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    reason: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    delegatedAt: { type: Date, default: Date.now },
    respondedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "task_delegations" }
);

const invoiceSchema = new mongoose.Schema(
  {
    _id: String,
    projectId: String,
    clientId: String,
    invoiceNumber: { type: String, unique: true, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue"],
      default: "draft",
    },
    dueDate: Date,
    issuedDate: { type: Date, default: Date.now },
    paidDate: Date,
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "invoices" }
);

const messageSchema = new mongoose.Schema(
  {
    _id: String,
    projectId: String,
    senderId: String,
    senderName: String,
    senderRole: String,
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ["text", "file", "system"], default: "text" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "messages" }
);

const timeLogSchema = new mongoose.Schema(
  {
    _id: String,
    projectId: String,
    userId: String,
    taskId: String,
    date: Date,
    hours: { type: Number, required: true },
    description: String,
    billable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "timeLogs" }
);

const changeRequestSchema = new mongoose.Schema(
  {
    id: String,
    projectId: String,
    clientId: String,
    title: { type: String, required: true },
    description: String,
    impact: String,
    estimatedEffort: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "implemented"],
      default: "pending",
    },
    submittedDate: { type: Date, default: Date.now },
    approvedDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "changeRequests" }
);

const feedbackSchema = new mongoose.Schema(
  {
    id: String,
    projectId: String,
    clientId: String,
    userId: String,
    rating: { type: Number, min: 1, max: 5 },
    category: {
      type: String,
      enum: [
        "communication",
        "quality",
        "timeline",
        "technical",
        "overall",
        "general",
        "bug",
        "feature",
        "support",
        "anonymous",
        "mood",
        "other",
      ],
    },
    mood: String,
    message: String,
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "feedback" }
);

const riskSchema = new mongoose.Schema(
  {
    id: String,
    projectId: String,
    title: { type: String, required: true },
    description: String,
    owner: String,
    ownerName: String,
    dueDate: Date,
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    probability: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    mitigation: String,
    status: {
      type: String,
      enum: ["open", "monitoring", "in-progress", "resolved", "closed"],
      default: "open",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
  },
  { collection: "risks" }
);

const knowledgeBaseSchema = new mongoose.Schema(
  {
    id: String,
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "development",
        "management",
        "operations",
        "other",
        "onboarding",
        "processes",
        "templates",
        "best-practices",
      ],
    },
    content: { type: String, required: true },
    author: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
  },
  { collection: "knowledgeBase" }
);

const strategySchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    projectId: String,
    ownerId: String,
    type: { type: String, default: "strategy" },
    canvas: { type: mongoose.Schema.Types.Mixed, default: {} },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "strategies" }
);

const productSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    projectId: String,
    ownerId: String,
    type: { type: String, default: "product" },
    features: [
      {
        id: String,
        title: String,
        reach: { type: Number, default: 0 },
        impact: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        effort: { type: Number, default: 1 },
        score: Number,
        notes: String,
        status: {
          type: String,
          enum: ["planned", "in-progress", "done"],
          default: "planned",
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    roadmap: { type: mongoose.Schema.Types.Mixed, default: {} },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "products" }
);

const revenueSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    projectId: String,
    ownerId: String,
    type: { type: String, default: "revenue" },
    category: String,
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "revenues" }
);

const marketingSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    projectId: String,
    ownerId: String,
    type: { type: String, default: "marketing" },
    category: String,
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "marketing" }
);

const operationsSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    projectId: String,
    ownerId: String,
    type: { type: String, default: "operations" },
    category: String,
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "operations" }
);

const legalSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    projectId: String,
    ownerId: String,
    type: { type: String, default: "legal" },
    category: String,
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "legal" }
);

const fundraisingSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    projectId: String,
    ownerId: String,
    type: { type: String, default: "fundraising" },
    category: String,
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "fundraising" }
);

const clientSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    industry: String,
    avatar: String,
    joinDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "clients" }
);

const notificationSchema = new mongoose.Schema(
  {
    _id: String,
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "project",
        "task",
        "meeting",
        "message",
        "approval",
        "deadline",
        "mention",
        "system",
      ],
      default: "message",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    actionUrl: String,
    actionData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { collection: "notifications" }
);

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    channels: {
      projects: { type: Boolean, default: true },
      tasks: { type: Boolean, default: true },
      meetings: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      approvals: { type: Boolean, default: true },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "notificationPreferences" }
);

const documentTemplateSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    icon: { type: String, required: true },
    type: { type: String, required: true, unique: true },
    fields: [
      {
        name: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, required: true },
        placeholder: { type: String, required: true },
      },
    ],
    orgId: { type: String, index: true },
    isDefault: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "documentTemplates" }
);

const organizationSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "organizations" }
);

// Get or create models
const getModels = () => {
  return {
    User: mongoose.models.User || mongoose.model("User", userSchema),
    Organization:
      mongoose.models.Organization ||
      mongoose.model("Organization", organizationSchema),
    Client: mongoose.models.Client || mongoose.model("Client", clientSchema),
    Project:
      mongoose.models.Project || mongoose.model("Project", projectSchema),
    Team: mongoose.models.Team || mongoose.model("Team", teamSchema),
    Meeting:
      mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema),
    Document:
      mongoose.models.Document || mongoose.model("Document", documentSchema),
    Task: mongoose.models.Task || mongoose.model("Task", taskSchema),
    Invoice:
      mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema),
    Message:
      mongoose.models.Message || mongoose.model("Message", messageSchema),
    TimeLog:
      mongoose.models.TimeLog || mongoose.model("TimeLog", timeLogSchema),
    ChangeRequest:
      mongoose.models.ChangeRequest ||
      mongoose.model("ChangeRequest", changeRequestSchema),
    Feedback:
      mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema),
    AuditLog:
      mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema),
    Risk: mongoose.models.Risk || mongoose.model("Risk", riskSchema),
    KnowledgeBase:
      mongoose.models.KnowledgeBase ||
      mongoose.model("KnowledgeBase", knowledgeBaseSchema),
    Strategy:
      mongoose.models.Strategy || mongoose.model("Strategy", strategySchema),
    Product:
      mongoose.models.Product || mongoose.model("Product", productSchema),
    Revenue:
      mongoose.models.Revenue || mongoose.model("Revenue", revenueSchema),
    Marketing:
      mongoose.models.Marketing || mongoose.model("Marketing", marketingSchema),
    Operations:
      mongoose.models.Operations ||
      mongoose.model("Operations", operationsSchema),
    Legal: mongoose.models.Legal || mongoose.model("Legal", legalSchema),
    Fundraising:
      mongoose.models.Fundraising ||
      mongoose.model("Fundraising", fundraisingSchema),
    NotificationPreference:
      mongoose.models.NotificationPreference ||
      mongoose.model("NotificationPreference", notificationPreferenceSchema),
    DocumentTemplate:
      mongoose.models.DocumentTemplate ||
      mongoose.model("DocumentTemplate", documentTemplateSchema),
    Notification:
      mongoose.models.Notification ||
      mongoose.model("Notification", notificationSchema),
    Lead: mongoose.models.Lead || mongoose.model("Lead", leadSchema),
    Attendance:
      mongoose.models.Attendance ||
      mongoose.model("Attendance", attendanceSchema),
    TaskTemplate:
      mongoose.models.TaskTemplate ||
      mongoose.model("TaskTemplate", taskTemplateSchema),
    TaskDelegation:
      mongoose.models.TaskDelegation ||
      mongoose.model("TaskDelegation", taskDelegationSchema),
  };
};

// Connect to MongoDB
async function connectToDB() {
  if (cachedConnection && cachedConnection.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export { connectToDB };
export const db = {
  // Connect
  async connect() {
    return connectToDB();
  },

  // Organization operations
  async getOrganizations() {
    await connectToDB();
    const { Organization } = getModels();
    return Organization.find({}).lean();
  },

  async getOrganizationById(id: string) {
    await connectToDB();
    const { Organization } = getModels();
    return Organization.findOne({ _id: id }).lean();
  },

  async getOrganizationBySlug(slug: string) {
    await connectToDB();
    const { Organization } = getModels();
    return Organization.findOne({ slug }).lean();
  },

  async createOrganization(orgData: any) {
    await connectToDB();
    const { Organization } = getModels();
    const createdAt = orgData.createdAt || new Date();
    const updatedAt = orgData.updatedAt || createdAt;
    const newOrg = new Organization({
      _id: orgData._id || `org-${Date.now()}`,
      name: orgData.name,
      slug: orgData.slug,
      createdAt,
      updatedAt,
    });
    return newOrg.save();
  },

  async ensureOrganization(orgData: any) {
    await connectToDB();
    const { Organization } = getModels();
    const existing = await Organization.findOne({
      $or: [{ _id: orgData._id }, { slug: orgData.slug }],
    }).lean();
    if (existing) return existing;
    const created = await this.createOrganization(orgData);
    return created.toObject ? created.toObject() : created;
  },

  // User operations
  async getUser(email: string) {
    await connectToDB();
    const { User } = getModels();
    return User.findOne({ email }).lean();
  },

  async getUserById(id: string) {
    await connectToDB();
    const { User } = getModels();
    return User.findOne({ _id: id }).lean();
  },

  async getUsers(filter?: any) {
    await connectToDB();
    const { User } = getModels();
    const query: any = {};
    if (filter?.role) query.role = filter.role;
    if (filter?.clientId) query.clientId = filter.clientId;
    return User.find(query).lean();
  },

  async getUsersByIds(ids: string[]) {
    await connectToDB();
    const { User } = getModels();
    if (!ids || ids.length === 0) return [];
    return User.find({ _id: { $in: ids } }).lean();
  },

  async createUser(userData: any) {
    await connectToDB();
    const { User } = getModels();
    const createdAt =
      userData.createdAt ||
      userData.joinDate ||
      userData.createdDate ||
      new Date();
    const updatedAt = userData.updatedAt || userData.updatedDate || createdAt;
    const newUser = new User({
      _id: userData._id || `user-${Date.now()}`,
      ...userData,
      orgId: userData.orgId || "org-001",
      joinDate: userData.joinDate || new Date(),
      createdAt,
      updatedAt,
    });
    return newUser.save();
  },

  async updateUser(id: string, updates: any) {
    await connectToDB();
    const { User } = getModels();
    return User.findOneAndUpdate(
      { _id: id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  },

  // Client operations
  async getClients() {
    await connectToDB();
    const { Client } = getModels();
    return Client.find({}).lean();
  },

  async getClientById(id: string) {
    await connectToDB();
    const { Client } = getModels();
    return Client.findOne({ _id: id }).lean();
  },

  async getClientByEmail(email: string) {
    await connectToDB();
    const { Client } = getModels();
    return Client.findOne({ email }).lean();
  },

  async createClient(clientData: any) {
    await connectToDB();
    const { Client } = getModels();
    const createdAt =
      clientData.createdAt ||
      clientData.joinDate ||
      clientData.createdDate ||
      new Date();
    const updatedAt =
      clientData.updatedAt || clientData.updatedDate || createdAt;
    const newClient = new Client({
      _id: clientData._id || `client-${Date.now()}`,
      ...clientData,
      joinDate: clientData.joinDate || new Date(),
      createdAt,
      updatedAt,
    });
    return newClient.save();
  },

  // Project operations
  async getProjects(filter?: any) {
    await connectToDB();
    const { Project } = getModels();
    const query: any = {};
    if (filter?.clientId) query.clientId = filter.clientId;
    if (filter?.teamMemberId) query.teamMembers = filter.teamMemberId;
    if (filter?.status) query.status = filter.status;
    return Project.find(query).lean();
  },

  async getProjectById(id: string) {
    await connectToDB();
    const { Project } = getModels();
    return Project.findOne({ _id: id }).lean();
  },

  async createProject(projectData: any) {
    await connectToDB();
    const { Project } = getModels();
    const createdAt =
      projectData.createdAt || projectData.createdDate || new Date();
    const updatedAt = projectData.updatedAt || createdAt;
    const newProject = new Project({
      _id: projectData._id || `proj-${Date.now()}`,
      ...projectData,
      createdAt,
      updatedAt,
      createdDate: projectData.createdDate || createdAt,
      updatedDate: projectData.updatedDate || updatedAt,
    });
    return newProject.save();
  },

  async updateProject(id: string, updates: any) {
    await connectToDB();
    const { Project } = getModels();
    const nextUpdates = {
      ...updates,
      updatedAt: new Date(),
      updatedDate: new Date(),
    };
    if (updates?.status === "completed" && !updates?.completedDate) {
      nextUpdates.completedDate = new Date();
    }
    return Project.findOneAndUpdate({ _id: id }, nextUpdates, {
      new: true,
    }).lean();
  },

  async reorderProjectMilestones(projectId: string, orderedKeys: string[]) {
    await connectToDB();
    const { Project } = getModels();
    const project = await Project.findOne({ _id: projectId }).lean();
    if (!project) return null;

    const buildKey = (milestone: any) => {
      if (milestone?.id) return milestone.id;
      const due = milestone?.dueDate
        ? new Date(milestone.dueDate).toISOString()
        : "";
      return `${milestone?.name || ""}::${due}`;
    };

    const milestones = Array.isArray(project.milestones)
      ? project.milestones
      : [];
    const milestoneMap = new Map(
      milestones.map((milestone: any) => [buildKey(milestone), milestone])
    );

    const reordered = orderedKeys
      .map((key) => milestoneMap.get(key))
      .filter(Boolean);
    const missing = milestones.filter(
      (milestone: any) => !orderedKeys.includes(buildKey(milestone))
    );

    const updated = await Project.findOneAndUpdate(
      { _id: projectId },
      { milestones: [...reordered, ...missing] },
      { new: true }
    ).lean();

    return updated;
  },

  // Team operations
  async getTeams(filter?: any) {
    await connectToDB();
    const { Team } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.projectIds) query.projectId = { $in: filter.projectIds };
    if (filter?.clientId) query.clientId = filter.clientId;
    return Team.find(query).lean();
  },

  async getTeamByProjectId(projectId: string) {
    await connectToDB();
    const { Team } = getModels();
    return Team.findOne({ projectId }).lean();
  },

  async createTeam(teamData: any) {
    await connectToDB();
    const { Team } = getModels();
    const createdAt = teamData.createdAt || teamData.createdDate || new Date();
    const updatedAt = teamData.updatedAt || teamData.updatedDate || createdAt;
    const newTeam = new Team({
      _id: teamData._id || `team-${Date.now()}`,
      ...teamData,
      createdAt,
      updatedAt,
      createdDate: teamData.createdDate || createdAt,
      updatedDate: teamData.updatedDate || updatedAt,
    });
    return newTeam.save();
  },

  async updateTeam(id: string, updates: any) {
    await connectToDB();
    const { Team } = getModels();
    const nextUpdates = {
      ...updates,
      updatedAt: new Date(),
      updatedDate: new Date(),
    };
    return Team.findOneAndUpdate({ _id: id }, nextUpdates, {
      new: true,
    }).lean();
  },

  // Meeting operations
  async getMeetings(filter?: any) {
    await connectToDB();
    const { Meeting } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.clientId) query.clientId = filter.clientId;
    if (filter?.status) query.status = filter.status;
    return Meeting.find(query).lean();
  },

  async getMeetingById(id: string) {
    await connectToDB();
    const { Meeting } = getModels();
    return Meeting.findOne({ _id: id }).lean();
  },

  async createMeeting(meetingData: any) {
    await connectToDB();
    const { Meeting } = getModels();
    const meetingId = meetingData._id || `meet-${Date.now()}`;
    const meetingLink =
      meetingData.meetingLink || `https://meet.jit.si/${meetingId}`;
    const createdAt =
      meetingData.createdAt || meetingData.createdDate || new Date();
    const updatedAt =
      meetingData.updatedAt || meetingData.updatedDate || createdAt;
    const newMeeting = new Meeting({
      _id: meetingId,
      ...meetingData,
      meetingLink,
      createdAt,
      updatedAt,
      createdDate: meetingData.createdDate || createdAt,
      updatedDate: meetingData.updatedDate || updatedAt,
    });
    return newMeeting.save();
  },

  async updateMeeting(id: string, updates: any) {
    await connectToDB();
    const { Meeting } = getModels();
    const nextUpdates = {
      ...updates,
      updatedAt: new Date(),
      updatedDate: new Date(),
    };
    return Meeting.findOneAndUpdate({ _id: id }, nextUpdates, {
      new: true,
    }).lean();
  },

  async deleteMeeting(id: string) {
    await connectToDB();
    const { Meeting } = getModels();
    return Meeting.findOneAndDelete({ _id: id }).lean();
  },

  // Document operations
  async getDocuments(filter?: any) {
    await connectToDB();
    const { Document } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.clientId) query.clientId = filter.clientId;
    return Document.find(query).lean();
  },

  async getDocumentById(id: string) {
    await connectToDB();
    const { Document } = getModels();
    return Document.findOne({ _id: id }).lean();
  },

  async uploadDocument(docData: any) {
    await connectToDB();
    const { Document } = getModels();
    const createdAt = docData.createdAt || new Date();
    const newDoc = new Document({
      _id: docData._id || `doc-${Date.now()}`,
      projectId: docData.projectId,
      clientId: docData.clientId,
      title: docData.title || docData.name,
      type: docData.type,
      status: docData.status || "draft",
      data: docData.data || {},
      createdAt,
      updatedAt: docData.updatedAt || createdAt,
      createdBy: docData.createdBy,
    });
    return newDoc.save();
  },

  async updateDocument(docId: string, docData: any) {
    await connectToDB();
    const { Document } = getModels();
    return Document.findByIdAndUpdate(
      docId,
      {
        title: docData.title || docData.name,
        type: docData.type,
        status: docData.status,
        clientId: docData.clientId,
        data: docData.data || {},
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  },

  async deleteDocument(docId: string) {
    await connectToDB();
    const { Document } = getModels();
    return Document.findByIdAndDelete(docId);
  },

  // Task operations
  async getTasks(filter?: any) {
    await connectToDB();
    const { Task } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.assignedTo) query.assignedTo = filter.assignedTo;
    if (filter?.status) {
      if (Array.isArray(filter.status)) {
        query.status = { $in: filter.status };
      } else {
        query.status = filter.status;
      }
    }
    if (filter?.createdBy) query.createdBy = filter.createdBy;
    if (filter?.date) {
      // Filter by scheduled date
      const startOfDay = new Date(filter.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filter.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (filter?.startDate || filter?.endDate) {
      const start = filter.startDate ? new Date(filter.startDate) : null;
      const end = filter.endDate ? new Date(filter.endDate) : null;
      query.scheduledDate = {
        ...(query.scheduledDate || {}),
        ...(start ? { $gte: start } : {}),
        ...(end ? { $lte: end } : {}),
      };
    }
    if (filter?.isTemplate !== undefined) query.isTemplate = filter.isTemplate;
    return Task.find(query)
      .sort({ order: 1, createdAt: -1, createdDate: -1 })
      .lean();
  },

  async getTaskById(id: string) {
    await connectToDB();
    const { Task } = getModels();
    return Task.findOne({ _id: id }).lean();
  },

  async createTask(taskData: any) {
    await connectToDB();
    const { Task } = getModels();
    const newTask = new Task({
      _id: taskData._id || `task-${Date.now()}`,
      ...taskData,
      order: taskData.order ?? Date.now(),
      createdAt: taskData.createdAt || new Date(),
      createdDate: taskData.createdDate || taskData.createdAt || new Date(),
      updatedAt: taskData.updatedAt || new Date(),
      updatedDate: taskData.updatedDate || taskData.updatedAt || new Date(),
    });
    return newTask.save();
  },

  async updateTask(id: string, updates: any) {
    await connectToDB();
    const { Task } = getModels();
    updates.updatedAt = new Date();
    updates.updatedDate = updates.updatedAt;
    return Task.findOneAndUpdate({ _id: id }, updates, { new: true }).lean();
  },

  async reorderTasks(
    taskIds: string[],
    options?: { assignedTo?: string; projectId?: string }
  ) {
    await connectToDB();
    const { Task } = getModels();
    if (!taskIds?.length) return [];
    const filter: any = {};
    if (options?.assignedTo) filter.assignedTo = options.assignedTo;
    if (options?.projectId) filter.projectId = options.projectId;

    const updates = taskIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, ...filter },
        update: {
          $set: {
            order: index,
            updatedAt: new Date(),
            updatedDate: new Date(),
          },
        },
      },
    }));

    await Task.bulkWrite(updates, { ordered: false });
    return Task.find({ _id: { $in: taskIds }, ...filter })
      .sort({ order: 1 })
      .lean();
  },

  async startTask(taskId: string, userId: string) {
    await connectToDB();
    const { Task } = getModels();
    const existing = await Task.findOne({
      _id: taskId,
      assignedTo: userId,
    }).lean();
    if (!existing) return null;
    if (
      !["pending", "scheduled", "draft", "blocked"].includes(existing.status)
    ) {
      return null;
    }
    return Task.findOneAndUpdate(
      { _id: taskId, assignedTo: userId },
      {
        status: "in-progress",
        startedDate: new Date(),
        updatedAt: new Date(),
        updatedDate: new Date(),
      },
      { new: true }
    ).lean();
  },

  async submitTaskForReview(taskId: string, userId: string) {
    await connectToDB();
    const { Task } = getModels();
    const existing = await Task.findOne({
      _id: taskId,
      assignedTo: userId,
    }).lean();
    if (!existing) return null;
    if (existing.status !== "in-progress") {
      return null;
    }
    return Task.findOneAndUpdate(
      { _id: taskId, assignedTo: userId },
      {
        status: "submitted",
        submittedDate: new Date(),
        updatedAt: new Date(),
        updatedDate: new Date(),
      },
      { new: true }
    ).lean();
  },

  async reviewTask(taskId: string, reviewerId: string, approved: boolean) {
    await connectToDB();
    const { Task } = getModels();
    const existing = await Task.findOne({ _id: taskId }).lean();
    if (!existing) return null;
    if (existing.status !== "submitted") {
      return null;
    }
    const updateData: any = {
      reviewedBy: reviewerId,
      reviewedDate: new Date(),
      updatedAt: new Date(),
      updatedDate: new Date(),
    };

    if (approved) {
      updateData.status = "reviewed";
    } else {
      updateData.status = "in-progress"; // Send back for revision
    }

    return Task.findOneAndUpdate({ _id: taskId }, updateData, {
      new: true,
    }).lean();
  },

  async completeTask(taskId: string, reviewerId: string) {
    await connectToDB();
    const { Task } = getModels();
    const existing = await Task.findOne({ _id: taskId }).lean();
    if (!existing) return null;
    if (existing.status !== "reviewed") {
      return null;
    }
    return Task.findOneAndUpdate(
      { _id: taskId },
      {
        status: "completed",
        completedDate: new Date(),
        reviewedBy: reviewerId,
        updatedAt: new Date(),
        updatedDate: new Date(),
      },
      { new: true }
    ).lean();
  },

  async delegateTask(
    taskId: string,
    fromUserId: string,
    toUserId: string,
    reason: string
  ) {
    await connectToDB();
    const { Task, TaskDelegation } = getModels();

    // Create delegation record
    const delegation = new TaskDelegation({
      _id: `delegation-${Date.now()}`,
      taskId,
      fromUserId,
      toUserId,
      reason,
      status: "pending",
    });
    await delegation.save();

    // Update task with delegation history
    return Task.findOneAndUpdate(
      { _id: taskId },
      {
        $push: {
          delegationHistory: {
            fromUser: fromUserId,
            toUser: toUserId,
            delegatedAt: new Date(),
            reason,
          },
        },
        assignedTo: toUserId,
        updatedAt: new Date(),
        updatedDate: new Date(),
      },
      { new: true }
    ).lean();
  },

  // Attendance operations
  async getAttendance(filter?: any) {
    await connectToDB();
    const { Attendance } = getModels();
    const query: any = {};
    if (filter?.userId) query.userId = filter.userId;
    if (filter?.date) {
      const startOfDay = new Date(filter.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filter.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (filter?.startDate && filter?.endDate) {
      query.date = {
        $gte: new Date(filter.startDate),
        $lte: new Date(filter.endDate),
      };
    }
    return Attendance.find(query).sort({ date: -1 }).lean();
  },

  async createOrUpdateAttendance(attendanceData: any) {
    await connectToDB();
    const { Attendance } = getModels();

    const existing = await Attendance.findOne({
      userId: attendanceData.userId,
      date: {
        $gte: new Date(attendanceData.date).setHours(0, 0, 0, 0),
        $lt: new Date(attendanceData.date).setHours(23, 59, 59, 999),
      },
    });

    if (existing) {
      return Attendance.findOneAndUpdate(
        { _id: existing._id },
        {
          ...attendanceData,
          updatedAt: new Date(),
          updatedDate: new Date(),
        },
        { new: true }
      ).lean();
    } else {
      const createdAt = new Date();
      const newAttendance = new Attendance({
        _id: attendanceData._id || `attendance-${Date.now()}`,
        ...attendanceData,
        createdAt,
        updatedAt: createdAt,
        createdDate: createdAt,
        updatedDate: createdAt,
      });
      return newAttendance.save();
    }
  },

  async markAttendanceForUser(userId: string, date: Date) {
    await connectToDB();
    const { Task, Attendance } = getModels();

    // Check if all tasks for the user on this date are completed
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const userTasks = await Task.find({
      assignedTo: userId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "completed" },
    }).lean();

    if (userTasks.length === 0) {
      // All tasks completed, mark attendance
      return this.createOrUpdateAttendance({
        userId,
        date,
        status: "present",
        isAutoMarked: true,
        checkInTime: startOfDay,
        checkOutTime: endOfDay,
      });
    }

    return null; // Not all tasks completed
  },

  // Task Template operations
  async getTaskTemplates(filter?: any) {
    await connectToDB();
    const { TaskTemplate } = getModels();
    const query: any = { isActive: true };
    if (filter?.category) query.category = filter.category;
    if (filter?.createdBy) query.createdBy = filter.createdBy;
    return TaskTemplate.find(query).sort({ name: 1 }).lean();
  },

  async createTaskTemplate(templateData: any) {
    await connectToDB();
    const { TaskTemplate } = getModels();
    const createdAt =
      templateData.createdAt || templateData.createdDate || new Date();
    const updatedAt =
      templateData.updatedAt || templateData.updatedDate || createdAt;
    const newTemplate = new TaskTemplate({
      _id: templateData._id || `template-${Date.now()}`,
      ...templateData,
      createdAt,
      updatedAt,
      createdDate: templateData.createdDate || createdAt,
    });
    return newTemplate.save();
  },

  async createTasksFromTemplate(
    templateIds: string[],
    assignments: any[],
    createdBy?: string
  ) {
    await connectToDB();
    const { TaskTemplate, Task } = getModels();

    const templates = await TaskTemplate.find({
      _id: { $in: templateIds },
    }).lean();
    const tasks = [];

    for (const assignment of assignments) {
      for (const template of templates) {
        const scheduledDate = assignment.date
          ? new Date(assignment.date)
          : undefined;
        const dueDate = assignment.dueDate
          ? new Date(assignment.dueDate)
          : scheduledDate
            ? new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000)
            : undefined;

        const task = new Task({
          _id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: template.name,
          description: template.description,
          assignedTo: assignment.userId,
          createdBy: createdBy || assignment.userId || "system",
          scheduledDate,
          dueDate,
          priority: template.priority,
          estimatedHours: template.estimatedHours,
          tags: template.tags,
          isTemplate: false,
          templateId: template._id,
          status: scheduledDate ? "scheduled" : "pending",
          order: Date.now() + Math.floor(Math.random() * 1000),
          createdAt: new Date(),
          createdDate: new Date(),
          updatedAt: new Date(),
          updatedDate: new Date(),
        });
        tasks.push(await task.save());
      }
    }

    return tasks;
  },

  // Task Delegation operations
  async getDelegations(filter?: any) {
    await connectToDB();
    const { TaskDelegation } = getModels();
    const query: any = {};
    if (filter?.taskId) query.taskId = filter.taskId;
    if (filter?.fromUserId) query.fromUserId = filter.fromUserId;
    if (filter?.toUserId) query.toUserId = filter.toUserId;
    if (filter?.status) query.status = filter.status;
    return TaskDelegation.find(query).sort({ delegatedAt: -1 }).lean();
  },

  async respondToDelegation(delegationId: string, accepted: boolean) {
    await connectToDB();
    const { TaskDelegation } = getModels();
    return TaskDelegation.findOneAndUpdate(
      { _id: delegationId },
      {
        status: accepted ? "accepted" : "rejected",
        respondedAt: new Date(),
      },
      { new: true }
    ).lean();
  },

  // Invoice operations
  async getInvoices(filter?: any) {
    await connectToDB();
    const { Invoice } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.clientId) query.clientId = filter.clientId;
    if (filter?.status) query.status = filter.status;
    return Invoice.find(query).lean();
  },

  async getInvoiceById(id: string) {
    await connectToDB();
    const { Invoice } = getModels();
    return Invoice.findOne({ _id: id }).lean();
  },

  async createInvoice(invoiceData: any) {
    await connectToDB();
    const { Invoice } = getModels();
    const createdAt =
      invoiceData.createdAt || invoiceData.createdDate || new Date();
    const updatedAt =
      invoiceData.updatedAt || invoiceData.updatedDate || createdAt;
    const newInvoice = new Invoice({
      _id: invoiceData._id || `inv-${Date.now()}`,
      ...invoiceData,
      issuedDate: invoiceData.issuedDate || new Date(),
      createdAt,
      updatedAt,
    });
    return newInvoice.save();
  },

  async updateInvoice(id: string, updateData: any) {
    await connectToDB();
    const { Invoice } = getModels();
    return Invoice.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).lean();
  },

  // Message operations
  async getMessages(filter?: any) {
    await connectToDB();
    const { Message } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    return Message.find(query).sort({ timestamp: -1 }).lean();
  },

  async getMessageById(id: string) {
    await connectToDB();
    const { Message } = getModels();
    return Message.findOne({ _id: id }).lean();
  },

  async createMessage(messageData: any) {
    await connectToDB();
    const { Message } = getModels();
    const createdAt =
      messageData.createdAt || messageData.timestamp || new Date();
    const updatedAt = messageData.updatedAt || createdAt;
    const newMessage = new Message({
      _id: messageData._id || `msg-${Date.now()}`,
      ...messageData,
      timestamp: messageData.timestamp || new Date(),
      createdAt,
      updatedAt,
    });
    return newMessage.save();
  },

  // Time log operations
  async getTimeLogs(filter?: any) {
    await connectToDB();
    const { TimeLog } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.userId) query.userId = filter.userId;
    return TimeLog.find(query).lean();
  },

  async getTimeLogById(id: string) {
    await connectToDB();
    const { TimeLog } = getModels();
    return TimeLog.findOne({ _id: id }).lean();
  },

  async createTimeLog(logData: any) {
    await connectToDB();
    const { TimeLog } = getModels();
    const createdAt = logData.createdAt || logData.date || new Date();
    const updatedAt = logData.updatedAt || createdAt;
    const newLog = new TimeLog({
      _id: logData._id || `log-${Date.now()}`,
      ...logData,
      date: logData.date || new Date(),
      createdAt,
      updatedAt,
    });
    return newLog.save();
  },

  // Change Request operations
  async getChangeRequests(filter?: any) {
    await connectToDB();
    const { ChangeRequest } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.status) query.status = filter.status;
    if (filter?.clientId) query.clientId = filter.clientId;
    return ChangeRequest.find(query).lean();
  },

  async getChangeRequestById(id: string) {
    await connectToDB();
    const { ChangeRequest } = getModels();
    return ChangeRequest.findOne({ id }).lean();
  },

  async createChangeRequest(crData: any) {
    await connectToDB();
    const { ChangeRequest } = getModels();
    const createdAt = crData.createdAt || crData.submittedDate || new Date();
    const updatedAt = crData.updatedAt || createdAt;
    const newCR = new ChangeRequest({
      id: crData.id || `cr-${Date.now()}`,
      ...crData,
      submittedDate: crData.submittedDate || new Date(),
      createdAt,
      updatedAt,
    });
    return newCR.save();
  },

  // Feedback operations
  async getFeedback(filter?: any) {
    await connectToDB();
    const { Feedback } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.clientId) query.clientId = filter.clientId;
    if (filter?.category) query.category = filter.category;
    const limit = filter?.limit ? Number(filter.limit) : 0;
    let q = Feedback.find(query).sort({ date: -1 });
    if (limit) q = q.limit(limit);
    return q.lean();
  },

  async getFeedbackById(id: string) {
    await connectToDB();
    const { Feedback } = getModels();
    return Feedback.findOne({ id }).lean();
  },

  async createFeedback(fbData: any) {
    await connectToDB();
    const { Feedback } = getModels();
    const createdAt = fbData.createdAt || fbData.date || new Date();
    const updatedAt = fbData.updatedAt || createdAt;
    const newFB = new Feedback({
      id: fbData.id || `fb-${Date.now()}`,
      ...fbData,
      date: fbData.date || new Date(),
      createdAt,
      updatedAt,
    });
    return newFB.save();
  },

  // Audit log operations
  async logAuditEvent(
    actorIdOrEvent:
      | string
      | {
          actorId: string;
          actorRole: string;
          actorName?: string;
          action: string;
          entityType: string;
          entityId: string;
          oldValue?: any;
          newValue?: any;
          changes?: any;
          details?: any;
          ipAddress?: string;
          userAgent?: string;
          notes?: string;
        },
    actorRole?: string,
    actorName?: string,
    action?: string,
    entityType?: string,
    entityId?: string,
    oldValue: any = {},
    newValue: any = {},
    ipAddress?: string,
    userAgent?: string,
    notes?: string
  ) {
    await connectToDB();
    const { AuditLog, User } = getModels();
    const event =
      typeof actorIdOrEvent === "string"
        ? {
            actorId: actorIdOrEvent,
            actorRole: actorRole || "",
            actorName: actorName || "",
            action: action || "",
            entityType: entityType || "",
            entityId: entityId || "",
            oldValue,
            newValue,
            ipAddress,
            userAgent,
            notes,
          }
        : actorIdOrEvent;
    const derivedChanges =
      event.changes ??
      event.details ??
      (event.oldValue || event.newValue
        ? { oldValue: event.oldValue ?? {}, newValue: event.newValue ?? {} }
        : {});
    const newLog = new AuditLog({
      _id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      actorId: event.actorId,
      actorRole: event.actorRole,
      actorName: event.actorName || "",
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      oldValue: event.oldValue ?? {},
      newValue: event.newValue ?? event.details ?? {},
      changes: derivedChanges ?? {},
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      notes: event.notes,
      createdAt: new Date(),
    });
    return newLog.save();
  },

  async getActorName(actorId: string): Promise<string> {
    const user = await this.getUserById(actorId);
    return user?.name || "Unknown User";
  },

  async auditCreate(
    actorId: string,
    actorRole: string,
    actorName: string,
    entityType: string,
    newValue: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.logAuditEvent(
      actorId,
      actorRole,
      actorName,
      "create",
      entityType,
      newValue._id,
      {},
      newValue,
      ipAddress,
      userAgent
    );
  },

  async auditUpdate(
    actorId: string,
    actorRole: string,
    actorName: string,
    entityType: string,
    entityId: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.logAuditEvent(
      actorId,
      actorRole,
      actorName,
      "update",
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent
    );
  },

  async auditDelete(
    actorId: string,
    actorRole: string,
    actorName: string,
    entityType: string,
    entityId: string,
    oldValue: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.logAuditEvent(
      actorId,
      actorRole,
      actorName,
      "delete",
      entityType,
      entityId,
      oldValue,
      {},
      ipAddress,
      userAgent
    );
  },

  async createWithAudit<T>(params: {
    actorId: string;
    actorRole: string;
    actorName: string;
    entityType: string;
    data: any;
    create: (payload: any) => Promise<T>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<T> {
    const created = await params.create(params.data);
    if (created) {
      await this.auditCreate(
        params.actorId,
        params.actorRole,
        params.actorName,
        params.entityType,
        created,
        params.ipAddress,
        params.userAgent
      );
    }
    return created;
  },

  async updateWithAudit<T>(params: {
    actorId: string;
    actorRole: string;
    actorName: string;
    entityType: string;
    entityId: string;
    oldValue: any;
    updates: any;
    update: (id: string, updates: any) => Promise<T>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<T> {
    const updated = await params.update(params.entityId, params.updates);
    await this.auditUpdate(
      params.actorId,
      params.actorRole,
      params.actorName,
      params.entityType,
      params.entityId,
      params.oldValue,
      updated,
      params.ipAddress,
      params.userAgent
    );
    return updated;
  },

  async deleteWithAudit<T>(params: {
    actorId: string;
    actorRole: string;
    actorName: string;
    entityType: string;
    entityId: string;
    oldValue: any;
    remove: (id: string) => Promise<T>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<T> {
    const result = await params.remove(params.entityId);
    await this.auditDelete(
      params.actorId,
      params.actorRole,
      params.actorName,
      params.entityType,
      params.entityId,
      params.oldValue,
      params.ipAddress,
      params.userAgent
    );
    return result;
  },

  async getAuditLogs(filter?: any) {
    await connectToDB();
    const { AuditLog } = getModels();
    const query: any = {};
    if (filter?.actorId) query.actorId = filter.actorId;
    if (filter?.action) query.action = filter.action;
    if (filter?.entityType) query.entityType = filter.entityType;
    if (filter?.entityId) query.entityId = filter.entityId;
    if (filter?.dateFrom || filter?.dateTo) {
      query.createdAt = {};
      if (filter?.dateFrom) query.createdAt.$gte = new Date(filter.dateFrom);
      if (filter?.dateTo) query.createdAt.$lte = new Date(filter.dateTo);
    }
    return AuditLog.find(query).sort({ createdAt: -1 }).lean();
  },

  // Risk operations
  async getRisks(filter?: any) {
    await connectToDB();
    const { Risk } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.status) query.status = filter.status;
    return Risk.find(query).lean();
  },

  async getRiskById(id: string) {
    await connectToDB();
    const { Risk } = getModels();
    return Risk.findOne({ id }).lean();
  },

  async createRisk(riskData: any) {
    await connectToDB();
    const { Risk } = getModels();
    const createdAt = riskData.createdAt || riskData.createdDate || new Date();
    const updatedAt = riskData.updatedAt || riskData.updatedDate || createdAt;
    const newRisk = new Risk({
      id: riskData.id || `risk-${Date.now()}`,
      ...riskData,
      createdAt,
      updatedAt,
      createdDate: riskData.createdDate || createdAt,
    });
    return newRisk.save();
  },

  // Knowledge Base operations
  async getKnowledgeBase(filter?: any) {
    await connectToDB();
    const { KnowledgeBase } = getModels();
    const query: any = {};
    if (filter?.category) query.category = filter.category;
    return KnowledgeBase.find(query).lean();
  },

  async getKBById(id: string) {
    await connectToDB();
    const { KnowledgeBase } = getModels();
    return KnowledgeBase.findOne({ id }).lean();
  },

  async createKnowledgeBase(kbData: any) {
    await connectToDB();
    const { KnowledgeBase } = getModels();
    const createdAt = kbData.createdAt || kbData.createdDate || new Date();
    const updatedAt = kbData.updatedAt || kbData.updatedDate || createdAt;
    const newKB = new KnowledgeBase({
      id: kbData.id || `kb-${Date.now()}`,
      ...kbData,
      createdAt,
      updatedAt,
      createdDate: kbData.createdDate || createdAt,
      views: kbData.views || 0,
    });
    return newKB.save();
  },

  // Strategy operations (Business Engine)
  async getStrategies(filter?: any) {
    await connectToDB();
    const { Strategy } = getModels();
    const query: any = {};
    if (filter?.orgId) query.orgId = filter.orgId;
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.type) query.type = filter.type;
    if (filter?.tag) query.tags = filter.tag;
    return Strategy.find(query).sort({ createdAt: -1 }).lean();
  },

  async getStrategyById(id: string, orgId?: string) {
    await connectToDB();
    const { Strategy } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Strategy.findOne(query).lean();
  },

  async createStrategy(data: any) {
    await connectToDB();
    const { Strategy } = getModels();
    const newItem = new Strategy({
      _id: data._id || `str-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      orgId: data.orgId,
      projectId: data.projectId,
      ownerId: data.ownerId,
      type: data.type || "strategy",
      canvas: data.canvas || {},
      data: data.data || {},
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateStrategy(id: string, updates: any, orgId?: string) {
    await connectToDB();
    const { Strategy } = getModels();
    updates.updatedAt = new Date();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Strategy.findOneAndUpdate(query, updates, {
      new: true,
    }).lean();
  },

  async deleteStrategy(id: string, orgId?: string) {
    await connectToDB();
    const { Strategy } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Strategy.findOneAndDelete(query);
  },

  // Product operations (Product & Execution Engine)
  async getProducts(filter?: any) {
    await connectToDB();
    const { Product } = getModels();
    const query: any = {};
    if (filter?.orgId) query.orgId = filter.orgId;
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.type) query.type = filter.type;
    return Product.find(query).sort({ createdAt: -1 }).lean();
  },

  async getProductById(id: string, orgId?: string) {
    await connectToDB();
    const { Product } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Product.findOne(query).lean();
  },

  async createProduct(data: any) {
    await connectToDB();
    const { Product } = getModels();
    const newItem = new Product({
      _id: data._id || `prod-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      orgId: data.orgId,
      projectId: data.projectId,
      ownerId: data.ownerId,
      type: data.type || "product",
      features: data.features || [],
      roadmap: data.roadmap || {},
      data: data.data || {},
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateProduct(id: string, updates: any, orgId?: string) {
    await connectToDB();
    const { Product } = getModels();
    updates.updatedAt = new Date();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Product.findOneAndUpdate(query, updates, { new: true }).lean();
  },

  async deleteProduct(id: string, orgId?: string) {
    await connectToDB();
    const { Product } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Product.findOneAndDelete(query);
  },

  // Revenue operations (Revenue & Monetization Engine)
  async getRevenues(filter?: any) {
    await connectToDB();
    const { Revenue } = getModels();
    const query: any = {};
    if (filter?.orgId) query.orgId = filter.orgId;
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.category) query.category = filter.category;
    if (filter?.type) query.type = filter.type;
    return Revenue.find(query).sort({ createdAt: -1 }).lean();
  },

  async getRevenueById(id: string, orgId?: string) {
    await connectToDB();
    const { Revenue } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Revenue.findOne(query).lean();
  },

  async createRevenue(data: any) {
    await connectToDB();
    const { Revenue } = getModels();
    const newItem = new Revenue({
      _id: data._id || `rev-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      orgId: data.orgId,
      projectId: data.projectId,
      ownerId: data.ownerId,
      type: data.type || "revenue",
      category: data.category || "",
      data: data.data || {},
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateRevenue(id: string, updates: any, orgId?: string) {
    await connectToDB();
    const { Revenue } = getModels();
    updates.updatedAt = new Date();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Revenue.findOneAndUpdate(query, updates, {
      new: true,
    }).lean();
  },

  async deleteRevenue(id: string, orgId?: string) {
    await connectToDB();
    const { Revenue } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Revenue.findOneAndDelete(query);
  },

  // Marketing operations (Marketing & Growth Engine)
  async getMarketingItems(filter?: any) {
    await connectToDB();
    const { Marketing } = getModels();
    const query: any = {};
    if (filter?.orgId) query.orgId = filter.orgId;
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.category) query.category = filter.category;
    if (filter?.type) query.type = filter.type;
    return Marketing.find(query).sort({ createdAt: -1 }).lean();
  },

  async getMarketingById(id: string, orgId?: string) {
    await connectToDB();
    const { Marketing } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Marketing.findOne(query).lean();
  },

  async createMarketing(data: any) {
    await connectToDB();
    const { Marketing } = getModels();
    const newItem = new Marketing({
      _id: data._id || `mkt-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      orgId: data.orgId,
      projectId: data.projectId,
      ownerId: data.ownerId,
      type: data.type || "marketing",
      category: data.category || "",
      data: data.data || {},
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateMarketing(id: string, updates: any, orgId?: string) {
    await connectToDB();
    const { Marketing } = getModels();
    updates.updatedAt = new Date();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Marketing.findOneAndUpdate(query, updates, {
      new: true,
    }).lean();
  },

  async deleteMarketing(id: string, orgId?: string) {
    await connectToDB();
    const { Marketing } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Marketing.findOneAndDelete(query);
  },

  // Operations operations (Operations & Systems Engine)
  async getOperationsItems(filter?: any) {
    await connectToDB();
    const { Operations } = getModels();
    const query: any = {};
    if (filter?.orgId) query.orgId = filter.orgId;
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.category) query.category = filter.category;
    if (filter?.type) query.type = filter.type;
    return Operations.find(query).sort({ createdAt: -1 }).lean();
  },

  async getOperationsById(id: string, orgId?: string) {
    await connectToDB();
    const { Operations } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Operations.findOne(query).lean();
  },

  async createOperations(data: any) {
    await connectToDB();
    const { Operations } = getModels();
    const newItem = new Operations({
      _id: data._id || `ops-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      orgId: data.orgId,
      projectId: data.projectId,
      ownerId: data.ownerId,
      type: data.type || "operations",
      category: data.category || "",
      data: data.data || {},
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateOperations(id: string, updates: any, orgId?: string) {
    await connectToDB();
    const { Operations } = getModels();
    updates.updatedAt = new Date();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Operations.findOneAndUpdate(query, updates, {
      new: true,
    }).lean();
  },

  async deleteOperations(id: string, orgId?: string) {
    await connectToDB();
    const { Operations } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Operations.findOneAndDelete(query);
  },

  // Legal operations (Legal & Risk Engine)
  async getLegalItems(filter?: any) {
    await connectToDB();
    const { Legal } = getModels();
    const query: any = {};
    if (filter?.orgId) query.orgId = filter.orgId;
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.category) query.category = filter.category;
    if (filter?.type) query.type = filter.type;
    return Legal.find(query).sort({ createdAt: -1 }).lean();
  },

  async getLegalById(id: string, orgId?: string) {
    await connectToDB();
    const { Legal } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Legal.findOne(query).lean();
  },

  async createLegal(data: any) {
    await connectToDB();
    const { Legal } = getModels();
    const newItem = new Legal({
      _id: data._id || `legal-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      orgId: data.orgId,
      projectId: data.projectId,
      ownerId: data.ownerId,
      type: data.type || "legal",
      category: data.category || "",
      data: data.data || {},
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateLegal(id: string, updates: any, orgId?: string) {
    await connectToDB();
    const { Legal } = getModels();
    updates.updatedAt = new Date();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Legal.findOneAndUpdate(query, updates, {
      new: true,
    }).lean();
  },

  async deleteLegal(id: string, orgId?: string) {
    await connectToDB();
    const { Legal } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Legal.findOneAndDelete(query);
  },

  // Fundraising operations (Investor & Fundraising Engine)
  async getFundraisingItems(filter?: any) {
    await connectToDB();
    const { Fundraising } = getModels();
    const query: any = {};
    if (filter?.orgId) query.orgId = filter.orgId;
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.category) query.category = filter.category;
    if (filter?.type) query.type = filter.type;
    return Fundraising.find(query).sort({ createdAt: -1 }).lean();
  },

  async getFundraisingById(id: string, orgId?: string) {
    await connectToDB();
    const { Fundraising } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Fundraising.findOne(query).lean();
  },

  async createFundraising(data: any) {
    await connectToDB();
    const { Fundraising } = getModels();
    const newItem = new Fundraising({
      _id: data._id || `fund-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      orgId: data.orgId,
      projectId: data.projectId,
      ownerId: data.ownerId,
      type: data.type || "fundraising",
      category: data.category || "",
      data: data.data || {},
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateFundraising(id: string, updates: any, orgId?: string) {
    await connectToDB();
    const { Fundraising } = getModels();
    updates.updatedAt = new Date();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Fundraising.findOneAndUpdate(query, updates, {
      new: true,
    }).lean();
  },

  async deleteFundraising(id: string, orgId?: string) {
    await connectToDB();
    const { Fundraising } = getModels();
    const query: any = { _id: id };
    if (orgId) query.orgId = orgId;
    return Fundraising.findOneAndDelete(query);
  },

  // Notification operations
  async createNotification(notifData: any) {
    await connectToDB();
    const { Notification } = getModels();
    const createdAt = notifData.createdAt || new Date();
    const newNotif = new Notification({
      _id: notifData._id || `notif-${Date.now()}`,
      userId: notifData.userId,
      type: notifData.type || "message",
      title: notifData.title,
      message: notifData.message,
      read: notifData.read || false,
      createdAt,
      updatedAt: notifData.updatedAt || createdAt,
      actionUrl: notifData.actionUrl,
      actionData: notifData.actionData || {},
    });
    return newNotif.save();
  },

  async getUserNotifications(userId: string, unreadOnly = false) {
    await connectToDB();
    const { Notification } = getModels();
    const query: any = { userId };
    if (unreadOnly) query.read = false;
    return Notification.find(query).sort({ createdAt: -1 }).lean();
  },

  async getAllNotifications() {
    await connectToDB();
    const { Notification } = getModels();
    return Notification.find({}).sort({ createdAt: -1 }).lean();
  },

  async getNotificationById(id: string) {
    await connectToDB();
    const { Notification } = getModels();
    return Notification.findOne({ _id: id }).lean();
  },

  async updateNotification(id: string, updates: any) {
    await connectToDB();
    const { Notification } = getModels();
    return Notification.findOneAndUpdate(
      { _id: id },
      { ...updates, updatedAt: new Date() },
      {
        new: true,
      }
    ).lean();
  },

  async deleteNotification(id: string) {
    await connectToDB();
    const { Notification } = getModels();
    return Notification.findOneAndDelete({ _id: id });
  },

  async markAsRead(id: string) {
    await connectToDB();
    const { Notification } = getModels();
    const res = await Notification.findOneAndUpdate(
      { _id: id },
      { read: true, updatedAt: new Date() },
      { new: true }
    ).lean();
    return !!res;
  },

  async markAllAsRead(userId: string) {
    await connectToDB();
    const { Notification } = getModels();
    const res = await Notification.updateMany(
      { userId, read: false },
      { read: true, updatedAt: new Date() }
    );
    return res.modifiedCount || 0;
  },

  async getUnreadCount(userId: string) {
    await connectToDB();
    const { Notification } = getModels();
    return Notification.countDocuments({ userId, read: false });
  },

  // Lead operations
  async getLeads(filter?: any) {
    await connectToDB();
    const { Lead } = getModels();
    const query: any = {};
    if (filter?.status) query.status = filter.status;
    if (filter?.source) query.source = filter.source;
    return Lead.find(query).lean();
  },

  async getLeadById(id: string) {
    await connectToDB();
    const { Lead } = getModels();
    return Lead.findOne({ _id: id }).lean();
  },

  async getLeadByEmail(email: string) {
    await connectToDB();
    const { Lead } = getModels();
    return Lead.findOne({ email }).lean();
  },

  async createLead(leadData: any) {
    await connectToDB();
    const { Lead } = getModels();
    const createdAt =
      leadData.createdAt ||
      leadData.createdDate ||
      leadData.dateAdded ||
      new Date();
    const updatedAt = leadData.updatedAt || leadData.updatedDate || createdAt;
    const newLead = new Lead({
      _id: leadData._id || `lead-${Date.now()}`,
      ...leadData,
      dateAdded: leadData.dateAdded || new Date(),
      createdAt,
      updatedAt,
      createdDate: leadData.createdDate || createdAt,
      updatedDate: leadData.updatedDate || updatedAt,
    });
    return newLead.save();
  },

  async updateLead(id: string, updates: any) {
    await connectToDB();
    const { Lead } = getModels();
    return Lead.findOneAndUpdate(
      { _id: id },
      { ...updates, updatedAt: new Date(), updatedDate: new Date() },
      { new: true }
    ).lean();
  },

  async getPreferences(userId: string) {
    await connectToDB();
    const { NotificationPreference } = getModels();
    const pref = await NotificationPreference.findOne({ userId }).lean();
    if (pref) return pref;
    // return defaults if not set
    return {
      userId,
      email: true,
      push: true,
      inApp: true,
      channels: {
        projects: true,
        tasks: true,
        meetings: true,
        messages: true,
        approvals: true,
      },
    };
  },

  async setPreferences(userId: string, prefs: any) {
    await connectToDB();
    const { NotificationPreference } = getModels();
    const updated = await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        $set: { ...prefs, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, new: true }
    ).lean();
    return updated;
  },

  // Document Template operations
  async getDocumentTemplates() {
    await connectToDB();
    const { DocumentTemplate } = getModels();
    return DocumentTemplate.find({ status: "active" }).lean();
  },

  async getDocumentTemplateById(id: string) {
    await connectToDB();
    const { DocumentTemplate } = getModels();
    return DocumentTemplate.findOne({ _id: id }).lean();
  },

  async getDocumentTemplateByType(type: string) {
    await connectToDB();
    const { DocumentTemplate } = getModels();
    return DocumentTemplate.findOne({ type, status: "active" }).lean();
  },

  async createDocumentTemplate(templateData: any) {
    await connectToDB();
    const { DocumentTemplate } = getModels();
    const newTemplate = new DocumentTemplate({
      _id: templateData._id || `template-${Date.now()}`,
      ...templateData,
      createdAt: templateData.createdAt || new Date(),
      updatedAt: templateData.updatedAt || new Date(),
    });
    return newTemplate.save();
  },

  async updateDocumentTemplate(id: string, updates: any) {
    await connectToDB();
    const { DocumentTemplate } = getModels();
    return DocumentTemplate.findOneAndUpdate(
      { _id: id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  },

  async deleteDocumentTemplate(id: string) {
    await connectToDB();
    const { DocumentTemplate } = getModels();
    return DocumentTemplate.findOneAndDelete({ _id: id }).lean();
  },
};

// Lead Schema for CRM
const leadSchema = new mongoose.Schema(
  {
    _id: String,
    fullName: { type: String, required: true },
    company: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    linkedinUrl: String,
    website: String,
    source: {
      type: String,
      enum: ["LinkedIn", "Hackathon", "Freelance", "Agency", "Referral"],
      required: true,
    },
    location: String,
    industry: String,
    companyStage: {
      type: String,
      enum: ["Idea", "MVP", "Revenue"],
    },
    teamSize: Number,
    dateAdded: { type: Date, default: Date.now },
    // Qualification
    problemIdentified: String,
    urgencyLevel: { type: Number, min: 1, max: 5 },
    budgetRange: {
      type: String,
      enum: ["₹50k", "₹2L", "₹10L", "₹50L+"],
    },
    isDecisionMaker: Boolean,
    currentTechStack: String,
    revenue: String,
    timeline: String,
    fitScore: { type: Number, min: 1, max: 10 },
    // Outreach
    dateContacted: Date,
    channelUsed: String,
    messageType: { type: String, enum: ["Cold DM", "Warm Intro"] },
    replyReceived: Boolean,
    followUp1Date: Date,
    followUp2Date: Date,
    callBooked: Boolean,
    proposalSent: Boolean,
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal", "Closed", "Lost"],
      default: "New",
    },
    // Deal
    projectValue: Number,
    pricingModel: String,
    expectedCloseDate: Date,
    actualCloseDate: Date,
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Complete"],
    },
    advanceReceived: Number,
    marginPercentage: Number,
    projectType: String,
    // Scoring
    leadTemperature: { type: String, enum: ["Cold", "Warm", "Hot"] },
    painSeverityScore: { type: Number, min: 1, max: 10 },
    technicalComplexity: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    objectionType: String,
    whyLost: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
  },
  { collection: "leads" }
);
