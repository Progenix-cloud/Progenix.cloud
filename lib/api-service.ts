// Client-side data service - uses APIs instead of direct DB access
// This is safe to use in client components

/* eslint-disable @typescript-eslint/no-explicit-any */

import { buildAuthHeaders } from "./client-auth";

const authFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  return fetch(input, {
    ...init,
    headers: buildAuthHeaders(init.headers),
  });
};

export const apiService = {
  // Users
  async getUsers(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.role) params.append("role", filter.role);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    const res = await authFetch(`/api/users?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  async getUserById(id: string) {
    const res = await authFetch(`/api/users/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  // Audit Logs
  async getAuditLogs(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.actorId) params.append("actorId", filter.actorId);
    if (filter?.action) params.append("action", filter.action);
    if (filter?.entityType) params.append("entityType", filter.entityType);
    if (filter?.dateFrom) params.append("dateFrom", filter.dateFrom);
    if (filter?.dateTo) params.append("dateTo", filter.dateTo);
    const res = await authFetch(`/api/audit-logs?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Clients
  async getClients() {
    const res = await authFetch("/api/clients");
    const data = await res.json();
    return data.data || [];
  },

  async getClientById(id: string) {
    const res = await authFetch(`/api/clients/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  // Projects
  async getProjects(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.clientId) params.append("clientId", filter.clientId);
    if (filter?.status) params.append("status", filter.status);
    const res = await authFetch(`/api/projects?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  async getProjectById(id: string) {
    const res = await authFetch(`/api/projects/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  async createProject(projectData: Record<string, any>) {
    const res = await authFetch("/api/projects", {
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
    const res = await authFetch(`/api/meetings?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  async getMeetingById(id: string) {
    const res = await authFetch(`/api/meetings/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  async createMeeting(meetingData: Record<string, any>) {
    const res = await authFetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meetingData),
    });
    const data = await res.json();
    return data.data || null;
  },

  async updateMeeting(id: string, meetingData: Record<string, any>) {
    const res = await authFetch(`/api/meetings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meetingData),
    });
    const data = await res.json();
    return data.data || null;
  },

  async deleteMeeting(id: string) {
    const res = await authFetch(`/api/meetings/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data.data || null;
  },

  // Documents
  async getDocuments(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    const res = await authFetch(`/api/documents?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Tasks
  async getTasks(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.assignedTo) params.append("assignedTo", filter.assignedTo);
    if (filter?.status) params.append("status", filter.status);
    const res = await authFetch(`/api/tasks?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Invoices
  async getInvoices(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    if (filter?.status) params.append("status", filter.status);
    const res = await authFetch(`/api/invoices?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Messages
  async getMessages(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    const res = await authFetch(`/api/messages?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  async createMessage(messageData: Record<string, any>) {
    const res = await authFetch("/api/messages", {
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
    const res = await authFetch(`/api/timeLogs?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Change Requests
  async getChangeRequests(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.status) params.append("status", filter.status);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    const res = await authFetch(`/api/change-requests?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Feedback
  async getFeedback(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    const res = await authFetch(`/api/feedback?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Risks
  async getRisks(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.status) params.append("status", filter.status);
    const res = await authFetch(`/api/risks?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Knowledge Base
  async getKnowledgeBase(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.category) params.append("category", filter.category);
    const res = await authFetch(`/api/knowledge-base?${params}`);
    const data = await res.json();
    return data.data || [];
  },

  // Client Teams
  async getClientTeams(filter?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append("projectId", filter.projectId);
    if (filter?.clientId) params.append("clientId", filter.clientId);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken")
        : null;
    const res = await authFetch(`/api/client-team?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await res.json();
    return data.data || [];
  },
};
