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
    avatar: String,
    phone: String,
    joinDate: { type: Date, default: Date.now },
    clientId: String,
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
    createdDate: { type: Date, default: Date.now },
  },
  { collection: "projects" }
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
    type: {
      type: String,
      enum: ["kickoff", "review", "feedback", "standup", "other"],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: String,
    createdDate: { type: Date, default: Date.now },
  },
  { collection: "meetings" }
);

const documentSchema = new mongoose.Schema(
  {
    _id: String,
    projectId: String,
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "proposal",
        "sow",
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
    assignedTo: String,
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "blocked"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: Date,
    createdDate: { type: Date, default: Date.now },
    completedDate: Date,
  },
  { collection: "tasks" }
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
  },
  { collection: "changeRequests" }
);

const feedbackSchema = new mongoose.Schema(
  {
    id: String,
    projectId: String,
    clientId: String,
    rating: { type: Number, min: 1, max: 5 },
    category: {
      type: String,
      enum: ["communication", "quality", "timeline", "other"],
    },
    message: String,
    date: { type: Date, default: Date.now },
  },
  { collection: "feedback" }
);

const riskSchema = new mongoose.Schema(
  {
    id: String,
    projectId: String,
    title: { type: String, required: true },
    description: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
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
      enum: ["open", "closed", "monitoring"],
      default: "open",
    },
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
      enum: ["development", "management", "operations", "other"],
    },
    content: { type: String, required: true },
    author: String,
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
    ownerId: String,
    canvas: { type: mongoose.Schema.Types.Mixed, default: {} },
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
    ownerId: String,
    features: [
      {
        id: String,
        title: String,
        score: Number,
        status: {
          type: String,
          enum: ["planned", "in-progress", "done"],
          default: "planned",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    roadmap: { type: mongoose.Schema.Types.Mixed, default: {} },
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

const clientSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    industry: String,
    avatar: String,
    joinDate: { type: Date, default: Date.now },
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
  },
  { collection: "notificationPreferences" }
);

// Get or create models
const getModels = () => {
  return {
    User: mongoose.models.User || mongoose.model("User", userSchema),
    Client: mongoose.models.Client || mongoose.model("Client", clientSchema),
    Project:
      mongoose.models.Project || mongoose.model("Project", projectSchema),
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
    Risk: mongoose.models.Risk || mongoose.model("Risk", riskSchema),
    KnowledgeBase:
      mongoose.models.KnowledgeBase ||
      mongoose.model("KnowledgeBase", knowledgeBaseSchema),
    Strategy:
      mongoose.models.Strategy || mongoose.model("Strategy", strategySchema),
    Product:
      mongoose.models.Product || mongoose.model("Product", productSchema),
    NotificationPreference:
      mongoose.models.NotificationPreference ||
      mongoose.model("NotificationPreference", notificationPreferenceSchema),
    Notification:
      mongoose.models.Notification ||
      mongoose.model("Notification", notificationSchema),
  };
};

// Connect to MongoDB
async function connectToDB() {
  if (cachedConnection && cachedConnection.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export const db = {
  // Connect
  async connect() {
    return connectToDB();
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

  async getUsers() {
    await connectToDB();
    const { User } = getModels();
    return User.find({}).lean();
  },

  async createUser(userData: any) {
    await connectToDB();
    const { User } = getModels();
    const newUser = new User({
      _id: userData._id || `user-${Date.now()}`,
      ...userData,
      joinDate: userData.joinDate || new Date(),
    });
    return newUser.save();
  },

  async updateUser(id: string, updates: any) {
    await connectToDB();
    const { User } = getModels();
    return User.findOneAndUpdate({ _id: id }, updates, { new: true }).lean();
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

  async createClient(clientData: any) {
    await connectToDB();
    const { Client } = getModels();
    const newClient = new Client({
      _id: clientData._id || `client-${Date.now()}`,
      ...clientData,
      joinDate: clientData.joinDate || new Date(),
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
    const newProject = new Project({
      _id: projectData._id || `proj-${Date.now()}`,
      ...projectData,
      createdDate: projectData.createdDate || new Date(),
    });
    return newProject.save();
  },

  async updateProject(id: string, updates: any) {
    await connectToDB();
    const { Project } = getModels();
    return Project.findOneAndUpdate({ _id: id }, updates, { new: true }).lean();
  },

  // Meeting operations
  async getMeetings(filter?: any) {
    await connectToDB();
    const { Meeting } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    if (filter?.clientId) query.clientId = filter.clientId;
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
    const newMeeting = new Meeting({
      _id: meetingData._id || `meet-${Date.now()}`,
      ...meetingData,
      createdDate: meetingData.createdDate || new Date(),
    });
    return newMeeting.save();
  },

  async updateMeeting(id: string, updates: any) {
    await connectToDB();
    const { Meeting } = getModels();
    return Meeting.findOneAndUpdate({ _id: id }, updates, { new: true }).lean();
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
    const newDoc = new Document({
      _id: docData._id || `doc-${Date.now()}`,
      projectId: docData.projectId,
      title: docData.title || docData.name,
      type: docData.type,
      status: docData.status || "draft",
      data: docData.data || {},
      createdAt: docData.createdAt || new Date(),
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
    if (filter?.status) query.status = filter.status;
    return Task.find(query).lean();
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
      createdDate: taskData.createdDate || new Date(),
    });
    return newTask.save();
  },

  async updateTask(id: string, updates: any) {
    await connectToDB();
    const { Task } = getModels();
    return Task.findOneAndUpdate({ _id: id }, updates, { new: true }).lean();
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
    const newInvoice = new Invoice({
      _id: invoiceData._id || `inv-${Date.now()}`,
      ...invoiceData,
      issuedDate: invoiceData.issuedDate || new Date(),
    });
    return newInvoice.save();
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
    const newMessage = new Message({
      _id: messageData._id || `msg-${Date.now()}`,
      ...messageData,
      timestamp: messageData.timestamp || new Date(),
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
    const newLog = new TimeLog({
      _id: logData._id || `log-${Date.now()}`,
      ...logData,
      date: logData.date || new Date(),
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
    const newCR = new ChangeRequest({
      id: crData.id || `cr-${Date.now()}`,
      ...crData,
      submittedDate: crData.submittedDate || new Date(),
    });
    return newCR.save();
  },

  // Feedback operations
  async getFeedback(filter?: any) {
    await connectToDB();
    const { Feedback } = getModels();
    const query: any = {};
    if (filter?.projectId) query.projectId = filter.projectId;
    return Feedback.find(query).lean();
  },

  async getFeedbackById(id: string) {
    await connectToDB();
    const { Feedback } = getModels();
    return Feedback.findOne({ id }).lean();
  },

  async createFeedback(fbData: any) {
    await connectToDB();
    const { Feedback } = getModels();
    const newFB = new Feedback({
      id: fbData.id || `fb-${Date.now()}`,
      ...fbData,
      date: fbData.date || new Date(),
    });
    return newFB.save();
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
    const newRisk = new Risk({
      id: riskData.id || `risk-${Date.now()}`,
      ...riskData,
      createdDate: riskData.createdDate || new Date(),
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
    const newKB = new KnowledgeBase({
      id: kbData.id || `kb-${Date.now()}`,
      ...kbData,
      createdDate: kbData.createdDate || new Date(),
      views: kbData.views || 0,
    });
    return newKB.save();
  },

  // Strategy operations (Business Engine)
  async getStrategies(filter?: any) {
    await connectToDB();
    const { Strategy } = getModels();
    const query: any = {};
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.tag) query.tags = filter.tag;
    return Strategy.find(query).sort({ createdAt: -1 }).lean();
  },

  async getStrategyById(id: string) {
    await connectToDB();
    const { Strategy } = getModels();
    return Strategy.findOne({ _id: id }).lean();
  },

  async createStrategy(data: any) {
    await connectToDB();
    const { Strategy } = getModels();
    const newItem = new Strategy({
      _id: data._id || `str-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      ownerId: data.ownerId,
      canvas: data.canvas || {},
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateStrategy(id: string, updates: any) {
    await connectToDB();
    const { Strategy } = getModels();
    updates.updatedAt = new Date();
    return Strategy.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    }).lean();
  },

  async deleteStrategy(id: string) {
    await connectToDB();
    const { Strategy } = getModels();
    return Strategy.findOneAndDelete({ _id: id });
  },

  // Product operations (Product & Execution Engine)
  async getProducts(filter?: any) {
    await connectToDB();
    const { Product } = getModels();
    const query: any = {};
    if (filter?.ownerId) query.ownerId = filter.ownerId;
    if (filter?.status) query.status = filter.status;
    return Product.find(query).sort({ createdAt: -1 }).lean();
  },

  async getProductById(id: string) {
    await connectToDB();
    const { Product } = getModels();
    return Product.findOne({ _id: id }).lean();
  },

  async createProduct(data: any) {
    await connectToDB();
    const { Product } = getModels();
    const newItem = new Product({
      _id: data._id || `prod-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      ownerId: data.ownerId,
      features: data.features || [],
      roadmap: data.roadmap || {},
      status: data.status || "draft",
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
    return newItem.save();
  },

  async updateProduct(id: string, updates: any) {
    await connectToDB();
    const { Product } = getModels();
    updates.updatedAt = new Date();
    return Product.findOneAndUpdate({ _id: id }, updates, { new: true }).lean();
  },

  async deleteProduct(id: string) {
    await connectToDB();
    const { Product } = getModels();
    return Product.findOneAndDelete({ _id: id });
  },

  // Notification operations
  async createNotification(notifData: any) {
    await connectToDB();
    const { Notification } = getModels();
    const newNotif = new Notification({
      _id: notifData._id || `notif-${Date.now()}`,
      userId: notifData.userId,
      type: notifData.type || "message",
      title: notifData.title,
      message: notifData.message,
      read: notifData.read || false,
      createdAt: notifData.createdAt || new Date(),
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
    return Notification.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    }).lean();
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
      { read: true },
      { new: true }
    ).lean();
    return !!res;
  },

  async markAllAsRead(userId: string) {
    await connectToDB();
    const { Notification } = getModels();
    const res = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    return res.modifiedCount || 0;
  },

  async getUnreadCount(userId: string) {
    await connectToDB();
    const { Notification } = getModels();
    return Notification.countDocuments({ userId, read: false });
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
      { $set: prefs },
      { upsert: true, new: true }
    ).lean();
    return updated;
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
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
  },
  { collection: "leads" }
);

export { connectToDB, leadSchema };
