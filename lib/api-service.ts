// Client-side data service - uses APIs instead of direct DB access
// This is safe to use in client components

/* eslint-disable @typescript-eslint/no-explicit-any */

export const apiService = {
  // Users
  async getUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    return data.data || [];
  },

  async getUserById(id: string) {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  // Clients
  async getClients() {
    const res = await fetch("/api/clients");
    const data = await res.json();
    return data.data || [];
  },

  async getClientById(id: string) {
    const res = await fetch(`/api/clients/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  // Projects
  async getProjects(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.clientId) params.append("clientId", filter.clientId);
    if (filter?.status) params.append("status", filter.status);
    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  async getProjectById(id: string) {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  async createProject(projectData: Record<string, any>) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    return data.data || null;
  },

  // Meetings
  async getMeetings(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    const res = await fetch(`/api/meetings?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  async getMeetingById(id: string) {
    const res = await fetch(`/api/meetings/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  async createMeeting(meetingData: Record<string, any>) {
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meetingData),
    });
    const data = await res.json();
    return data.data || null;
  },

  // Documents
  async getDocuments(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    const res = await fetch(`/api/documents?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Tasks
  async getTasks(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.assignedTo) params.append("assignedTo", filter.assignedTo);
    if (filter?.status) params.append("status", filter.status);
    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Invoices
  async getInvoices(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    if (filter?.status) params.append("status", filter.status);
    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Messages
  async getMessages(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    const res = await fetch(`/api/messages?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  async createMessage(messageData: Record<string, any>) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });
    const data = await res.json();
    return data.data || null;
  },

  // Time Logs
  async getTimeLogs(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.userId) params.append("userId", filter.userId);
    const res = await fetch(`/api/timeLogs?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Change Requests
  async getChangeRequests(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.status) params.append("status", filter.status);
    const res = await fetch(`/api/change-requests?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Feedback
  async getFeedback(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    const res = await fetch(`/api/feedback?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Risks
  async getRisks(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.status) params.append("status", filter.status);
    const res = await fetch(`/api/risks?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Knowledge Base
  async getKnowledgeBase(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.category) params.append("category", filter.category);
    const res = await fetch(`/api/knowledge-base?${params}`);
    const data = await res.json();
    return data.data || [];
  },
};
