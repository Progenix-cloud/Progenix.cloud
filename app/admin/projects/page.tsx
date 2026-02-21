"use client";

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
import { Plus, Edit, Camera, Trash2, Save, X } from "lucide-react";

// Document templates configuration
const documentTemplates = [
  {
    id: 1,
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
  },
  {
    id: 2,
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
  },
  {
    id: 3,
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
  },
  {
    id: 4,
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
  },
  {
    id: 5,
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
  },
  {
    id: 6,
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
  },
  {
    id: 7,
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
  },
  {
    id: 8,
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
  },
  {
    id: 9,
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
  },
];

interface Project {
  _id: string;
  name: string;
  clientId: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
}

interface ProjectDocument {
  _id?: string;
  projectId: string;
  type: string;
  title: string;
  status: "draft" | "in-progress" | "completed";
  data: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>(
    []
  );
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof documentTemplates)[0] | null
  >(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data.data || []);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, []);

  // Load documents for selected project
  useEffect(() => {
    if (!selectedProject) return;
    const loadDocuments = async () => {
      try {
        const res = await fetch(
          `/api/documents?projectId=${selectedProject._id}`
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
    if (!newProjectName.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          clientId: "NEW",
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
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedProject || !selectedTemplate) return;

    const docData: ProjectDocument = {
      projectId: selectedProject._id,
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
        headers: { "Content-Type": "application/json" },
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
        body: formDataObj,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, ...data.extractedData }));
      }
    } catch (error) {
      console.error("OCR scan failed:", error);
    } finally {
      setIsScanning(false);
      setOcrFile(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/documents?id=${docId}`, { method: "DELETE" });
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
                  <Button onClick={handleCreateProject} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {projects.map((project) => (
              <Card
                key={project._id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedProject?._id === project._id
                    ? "ring-2 ring-primary"
                    : "hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedProject(project);
                  setSelectedDoc(null);
                  setIsCreatingDoc(false);
                }}
              >
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {project.clientId}
                </p>
              </Card>
            ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documentTemplates.map((template) => (
                      <Card
                        key={template.id}
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
