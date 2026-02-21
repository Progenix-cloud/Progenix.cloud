// Advanced search service for full-text search across all entities
import { db } from "./db";

export interface SearchResult {
  type:
    | "project"
    | "client"
    | "user"
    | "document"
    | "task"
    | "meeting"
    | "invoice"
    | "article";
  id: string;
  title: string;
  description?: string;
  metadata?: any;
  score: number;
}

export const searchService = {
  // Full-text search across all entities
  search: async (
    query: string,
    filters?: {
      type?: SearchResult["type"][];
      limit?: number;
      offset?: number;
    }
  ): Promise<SearchResult[]> => {
    const q = query.toLowerCase();
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    const types = filters?.type || [
      "project",
      "client",
      "user",
      "document",
      "task",
      "meeting",
      "invoice",
      "article",
    ];

    const results: SearchResult[] = [];

    // Search projects
    if (types.includes("project")) {
      const projects = await db.getProjects();
      projects.forEach((p) => {
        let score = 0;
        if (p.name.toLowerCase().includes(q)) score += 10;
        if (p.description?.toLowerCase().includes(q)) score += 5;
        if (score > 0) {
          results.push({
            type: "project",
            id: p._id,
            title: p.name,
            description: p.description,
            metadata: { status: p.status, client: p.clientId },
            score,
          });
        }
      });
    }

    // Search clients
    if (types.includes("client")) {
      const clients = await db.getClients();
      clients.forEach((c) => {
        let score = 0;
        if (c.name.toLowerCase().includes(q)) score += 10;
        if (c.email.toLowerCase().includes(q)) score += 5;
        if (score > 0) {
          results.push({
            type: "client",
            id: c._id,
            title: c.name,
            description: c.email,
            metadata: { industry: c.industry },
            score,
          });
        }
      });
    }

    // Search users
    if (types.includes("user")) {
      const users = await db.getUsers();
      users.forEach((u) => {
        let score = 0;
        if (u.name.toLowerCase().includes(q)) score += 10;
        if (u.email.toLowerCase().includes(q)) score += 5;
        if (score > 0) {
          results.push({
            type: "user",
            id: u._id,
            title: u.name,
            description: u.email,
            metadata: { role: u.role },
            score,
          });
        }
      });
    }

    // Search documents
    if (types.includes("document")) {
      const docs = await db.getDocuments();
      docs.forEach((d) => {
        let score = 0;
        if (d.name.toLowerCase().includes(q)) score += 10;
        if (d.type.toLowerCase().includes(q)) score += 3;
        if (score > 0) {
          results.push({
            type: "document",
            id: d._id,
            title: d.name,
            description: d.type,
            metadata: { projectId: d.projectId, uploadedBy: d.uploadedBy },
            score,
          });
        }
      });
    }

    // Search tasks
    if (types.includes("task")) {
      const tasks = await db.getTasks();
      tasks.forEach((t) => {
        let score = 0;
        if (t.title.toLowerCase().includes(q)) score += 10;
        if (t.description?.toLowerCase().includes(q)) score += 5;
        if (score > 0) {
          results.push({
            type: "task",
            id: t._id,
            title: t.title,
            description: t.description,
            metadata: { status: t.status, projectId: t.projectId },
            score,
          });
        }
      });
    }

    // Search meetings
    if (types.includes("meeting")) {
      const meetings = await db.getMeetings();
      meetings.forEach((m) => {
        let score = 0;
        if (m.title.toLowerCase().includes(q)) score += 10;
        if (m.description?.toLowerCase().includes(q)) score += 5;
        if (score > 0) {
          results.push({
            type: "meeting",
            id: m._id,
            title: m.title,
            description: m.description,
            metadata: { date: m.date, type: m.type },
            score,
          });
        }
      });
    }

    // Search invoices
    if (types.includes("invoice")) {
      const invoices = await db.getInvoices();
      invoices.forEach((inv) => {
        let score = 0;
        if (inv.invoiceNumber.toLowerCase().includes(q)) score += 10;
        if (inv.description?.toLowerCase().includes(q)) score += 5;
        if (score > 0) {
          results.push({
            type: "invoice",
            id: inv._id,
            title: inv.invoiceNumber,
            description: inv.description,
            metadata: { amount: inv.amount, status: inv.status },
            score,
          });
        }
      });
    }

    // Search knowledge base
    if (types.includes("article")) {
      const kb = await db.getKnowledgeBase();
      kb.forEach((article) => {
        let score = 0;
        if (article.title.toLowerCase().includes(q)) score += 10;
        if (article.content.toLowerCase().includes(q)) score += 5;
        if (article.category.toLowerCase().includes(q)) score += 3;
        if (score > 0) {
          results.push({
            type: "article",
            id: article.id,
            title: article.title,
            description: article.category,
            metadata: { views: article.views },
            score,
          });
        }
      });
    }

    // Sort by score (descending) and then by title
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.title.localeCompare(b.title);
    });

    // Apply pagination
    return results.slice(offset, offset + limit);
  },

  // Quick search for specific entity type
  searchProjects: async (query: string) => {
    const results = await searchService.search(query, { type: ["project"] });
    return results.map((r) => ({
      id: r.id,
      name: r.title,
      status: r.metadata?.status,
    }));
  },

  searchClients: async (query: string) => {
    const results = await searchService.search(query, { type: ["client"] });
    return results.map((r) => ({
      id: r.id,
      name: r.title,
      email: r.description,
    }));
  },

  searchTasks: async (query: string) => {
    const results = await searchService.search(query, { type: ["task"] });
    return results.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.metadata?.status,
    }));
  },

  // Auto-complete suggestions
  getSuggestions: async (query: string, type?: SearchResult["type"]) => {
    const results = await searchService.search(query, {
      type: type ? [type] : undefined,
      limit: 5,
    });
    return results.map((r) => ({
      id: r.id,
      label: r.title,
      type: r.type,
    }));
  },
};

export type SearchService = typeof searchService;
