"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Camera, Trash2, Save, X } from "lucide-react";
import { buildAuthHeaders } from "@/lib/client-auth";
import { toast } from "sonner";

// Document templates configuration - now fetched from API
interface DocumentTemplate {
  _id: string;
  title: string;
  icon: string;
  type: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }>;
}

interface Project {
  _id: string;
  id: string;
  name: string;
  clientId: string;
  description?: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  teamId?: string;
  teamMembersCount?: number;
  team?: {
    _id: string;
    name: string;
    members: Array<{
      userId: string;
      name?: string;
      email?: string;
      role?: string;
    }>;
  };
}

interface Client {
  _id: string;
  name: string;
  email?: string;
}

interface ProjectDocument {
  _id?: string;
  projectId: string;
  clientId?: string;
  type: string;
  title: string;
  status: "draft" | "in-progress" | "completed";
  data: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>(
    []
  );
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [documentTemplates, setDocumentTemplates] = useState<
    DocumentTemplate[]
  >([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch("/api/clients", {
          headers: buildAuthHeaders(),
        });
        const data = await res.json();
        const items = data.data || [];
        setClients(items);
        setSelectedClientId((prev) => prev || items[0]?._id || "");
      } catch (error) {
        console.error("Failed to load clients:", error);
      }
    };
    loadClients();
  }, []);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch("/api/projects?includeTeam=true", {
          headers: buildAuthHeaders(),
        });
        const data = await res.json();
        const items = data.data || [];
        setProjects(items);
        setSelectedProject((prev) => {
          if (prev && items.find((p: Project) => p._id === prev._id)) {
            return prev;
          }
          return items[0] || null;
        });
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const token = localStorage.getItem("authToken");
    const url = new URL(
      `/api/notifications/stream?userId=${user._id}`,
      window.location.origin
    );
    if (token) url.searchParams.set("token", token);
    const source = new EventSource(url.toString());
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "client-team.create") {
          fetch("/api/projects?includeTeam=true", {
            headers: buildAuthHeaders(),
          })
            .then((res) => res.json())
            .then((payload) => setProjects(payload.data || []));
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, []);

  // Load document templates
  useEffect(() => {
    const loadDocumentTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const res = await fetch("/api/document-templates", {
          headers: buildAuthHeaders(),
        });
        const data = await res.json();
        setDocumentTemplates(data.data || []);
      } catch (error) {
        console.error("Failed to load document templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    loadDocumentTemplates();
  }, []);

  // Load documents for selected project
  useEffect(() => {
    if (!selectedProject) {
      setProjectDocuments([]);
      setSelectedDoc(null);
      return;
    }
    const loadDocuments = async () => {
      try {
        const res = await fetch(
          `/api/documents?projectId=${selectedProject._id}`,
          { headers: buildAuthHeaders() }
        );
        const data = await res.json();
        setProjectDocuments(data.data || []);
      } catch (error) {
        console.error("Failed to load documents:", error);
      }
    };
    loadDocuments();
  }, [selectedProject]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: newProjectName,
          clientId: selectedClientId,
          status: "planning",
          progress: 0,
          budget: 0,
          spent: 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects([...projects, data.data]);
        setNewProjectName("");
        setIsEditingProject(false);
        toast.success("Project created");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedProject || !selectedTemplate) return;

    const docData: ProjectDocument = {
      projectId: selectedProject._id,
      clientId: selectedProject.clientId,
      type: selectedTemplate.type,
      title: selectedTemplate.title,
      status: selectedDoc?.status || "draft",
      data: formData,
    };

    try {
      const url = selectedDoc
        ? `/api/documents?id=${selectedDoc._id}`
        : "/api/documents";
      const method = selectedDoc ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(docData),
      });

      if (res.ok) {
        const data = await res.json();
        if (selectedDoc) {
          setProjectDocuments(
            projectDocuments.map((d) =>
              d._id === selectedDoc._id ? data.data : d
            )
          );
          setSelectedDoc(data.data);
        } else {
          setProjectDocuments([...projectDocuments, data.data]);
        }
        setIsCreatingDoc(false);
        setSelectedTemplate(null);
        setFormData({});
      }
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  };

  const handleOCRScan = async () => {
    if (!ocrFile || !selectedTemplate) return;

    setIsScanning(true);
    const formDataObj = new FormData();
    formDataObj.append("file", ocrFile);
    formDataObj.append("templateType", selectedTemplate.type);

    try {
      const res = await fetch("/api/ocr-scan", {
        method: "POST",
        headers: buildAuthHeaders(),
        body: formDataObj,
      });

      if (res.ok) {
        const data = await res.json();
        const payload = data?.data || data || {};
        const extractedData = payload.extractedData || {};
        if (Object.keys(extractedData).length === 0) {
          toast.info("No data extracted. Try a clearer file or template.");
        } else {
          toast.success("OCR data extracted");
        }
        setFormData((prev) => ({ ...prev, ...extractedData }));
      } else {
        toast.error("OCR scan failed");
      }
    } catch (error) {
      console.error("OCR scan failed:", error);
      toast.error("OCR scan failed");
    } finally {
      setIsScanning(false);
      setOcrFile(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/documents?id=${docId}`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
      });
      setProjectDocuments(projectDocuments.filter((d) => d._id !== docId));
      if (selectedDoc?._id === docId) setSelectedDoc(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleEditDocument = (doc: ProjectDocument) => {
    setSelectedDoc(doc);
    const template = documentTemplates.find((t) => t.type === doc.type);
    setSelectedTemplate(template || null);
    setFormData(doc.data);
    setIsCreatingDoc(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Projects & Documents</h1>
        <p className="text-muted-foreground">
          Manage projects and their documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Projects</h2>
            <Dialog open={isEditingProject} onOpenChange={setIsEditingProject}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Project Name</Label>
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <Label>Client</Label>
                    <Select
                      value={selectedClientId}
                      onValueChange={setSelectedClientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.name}
                            {client.email ? ` — ${client.email}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {clients.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        No clients found. Create a client first.
                      </p>
                    )}
                  </div>
                  <Button onClick={handleCreateProject} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {projects.map((project) => {
              const isSelected = selectedProject?._id === project._id;
              return (
                <Card
                  key={project._id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedProject(project);
                    setSelectedDoc(null);
                    setIsCreatingDoc(false);
                    setSelectedTemplate(null);
                    setFormData({});
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Client ID: {project.clientId}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/projects/${project._id}`}>Open</Link>
                    </Button>
                  </div>
                  {project.teamId && (
                    <Badge variant="outline" className="mt-2">
                      Client Team: {project.teamMembersCount || 0} members
                    </Badge>
                  )}
                  {project.team?.members?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.team.members.slice(0, 4).map((m) => (
                        <Badge key={m.userId} variant="secondary">
                          {m.name || m.email || m.userId}
                        </Badge>
                      ))}
                      {project.team.members.length > 4 && (
                        <Badge variant="outline">
                          +{project.team.members.length - 4} more
                        </Badge>
                      )}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Documents List or Editor */}
        <div className="lg:col-span-2 space-y-4">
          {selectedProject ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg">
                    {selectedProject.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {projectDocuments.length} documents
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setIsCreatingDoc(true);
                    setSelectedDoc(null);
                    setFormData({});
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Document
                </Button>
              </div>

              {/* Document Template Selection */}
              {isCreatingDoc && !selectedTemplate ? (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Select Document Type</h3>
                  {isLoadingTemplates ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Loading templates...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {documentTemplates.map((template) => (
                        <Card
                          key={template._id}
                          className="p-4 cursor-pointer hover:shadow-md transition-all"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setFormData(
                              template.fields.reduce(
                                (acc, field) => {
                                  acc[field.name] = "";
                                  return acc;
                                },
                                {} as Record<string, string>
                              )
                            );
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <h4 className="font-semibold text-sm">
                                {template.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {template.fields.length} fields
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              ) : isCreatingDoc && selectedTemplate ? (
                // Document Form Editor
                <Card className="p-6 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="font-semibold text-lg">
                      {selectedTemplate.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCreatingDoc(false);
                        setSelectedTemplate(null);
                        setFormData({});
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* OCR Upload Section */}
                  <div className="bg-accent/5 p-4 rounded-lg border-2 border-dashed border-accent/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        Auto-Fill with OCR
                      </span>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          setOcrFile(e.target.files?.[0] || null)
                        }
                        className="text-sm"
                      />
                      <Button
                        onClick={handleOCRScan}
                        disabled={!ocrFile || isScanning}
                        variant="outline"
                        className="w-full"
                      >
                        {isScanning ? "Scanning..." : "Scan Document"}
                      </Button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.name}>
                        <Label>{field.label}</Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            value={formData[field.name] || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                            placeholder={field.placeholder}
                            className="mt-1 min-h-20"
                          />
                        ) : (
                          <Input
                            value={formData[field.name] || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                            placeholder={field.placeholder}
                            className="mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 border-t pt-4">
                    <Button onClick={handleSaveDocument}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Document
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingDoc(false);
                        setSelectedTemplate(null);
                        setFormData({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              ) : (
                // Documents List
                <div className="space-y-3">
                  {projectDocuments.map((doc) => (
                    <Card
                      key={doc._id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedDoc?._id === doc._id
                          ? "ring-2 ring-primary"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{doc.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {
                              Object.keys(doc.data).filter((k) => doc.data[k])
                                .length
                            }{" "}
                            fields filled
                          </p>
                        </div>
                        <Badge
                          variant={
                            doc.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDocument(doc);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc._id || "");
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {projectDocuments.length === 0 && (
                    <Card className="p-6 text-center text-muted-foreground">
                      No documents yet. Click &quot;Add Document&quot; to create
                      one.
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              Select a project to view and manage its documents
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
