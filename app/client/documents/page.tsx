"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Download, Eye, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { CardSkeleton } from "@/components/loading-skeleton";
import {
  buildAuthHeaders,
  getStoredClientId,
  getStoredUser,
} from "@/lib/client-auth";

interface DocumentData {
  fileName?: string;
  size?: number;
  contentType?: string;
  base64?: string;
  dataUrl?: string;
  version?: number;
}

interface Document {
  _id: string;
  title: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  data?: DocumentData;
}

export default function ClientDocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("documentation");
  const [uploading, setUploading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
    }
  }, []);

  const {
    data: documents = [],
    isLoading,
    mutate,
  } = useSWR(
    clientId && projectId ? ["documents", clientId, projectId] : null,
    () =>
      apiService.getDocuments({
        clientId: clientId as string,
        projectId: projectId as string,
      })
  );

  const { data: projects = [] } = useSWR(
    clientId ? ["projects", clientId] : null,
    () => apiService.getProjects({ clientId: clientId as string })
  );

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0]._id);
    }
  }, [projectId, projects]);

  const sortedDocuments = useMemo(() => {
    return [...(documents || [])].sort(
      (a: any, b: any) =>
        new Date(b.createdAt || b.updatedAt || 0).getTime() -
        new Date(a.createdAt || a.updatedAt || 0).getTime()
    );
  }, [documents]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sow":
        return "bg-primary/20 text-primary";
      case "spec":
        return "bg-accent/20 text-accent";
      case "documentation":
        return "bg-secondary/20 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDocName = (doc: Document) =>
    doc.data?.fileName || doc.title || "Untitled";

  const getDocSize = (doc: Document) => doc.data?.size || 0;

  const getDocDate = (doc: Document) =>
    doc.createdAt || doc.updatedAt || new Date().toISOString();

  const buildDataUrl = (doc: Document) => {
    const data = doc.data || {};
    if (data.dataUrl) return data.dataUrl;
    if (data.base64 && data.contentType) {
      return `data:${data.contentType};base64,${data.base64}`;
    }
    return "";
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFile || uploading) return;

    setUploading(true);
    try {
      const user = getStoredUser();
      const resolvedClientId = clientId || getStoredClientId();
      if (!user || !resolvedClientId) {
        toast.error("Missing client session");
        return;
      }
      if (!projectId) {
        toast.error("No project available");
        return;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(uploadFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

      const match = dataUrl.match(/^data:(.*);base64,(.*)$/);
      const contentType =
        match?.[1] || uploadFile.type || "application/octet-stream";
      const base64 = match?.[2] || "";

      const payload = {
        title: uploadTitle || uploadFile.name,
        type: uploadType,
        status: "completed",
        projectId: projectId,
        clientId: resolvedClientId,
        createdBy: user._id,
        data: {
          fileName: uploadFile.name,
          size: uploadFile.size,
          contentType,
          base64,
          version: 1,
        },
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadTitle("");
        setUploadType("documentation");
        mutate();
        toast.success("Document uploaded");
      } else {
        toast.error("Failed to upload document");
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] || null;
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name);
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      const res = await fetch(`/api/documents/${doc._id}`, {
        headers: buildAuthHeaders(),
      });
      const json = await res.json();
      if (json.data) {
        setPreviewDoc(json.data);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error("Failed to preview document:", error);
      toast.error("Failed to preview document");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Access and manage your project documents
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="hidden"
                  id="upload-file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="upload-file" className="cursor-pointer">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop file here or click to browse
                  </p>
                </label>
                {uploadFile && (
                  <p className="text-sm mt-2">Selected: {uploadFile.name}</p>
                )}
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="documentation">Documentation</option>
                  <option value="spec">Specification</option>
                  <option value="sow">Scope of Work</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="project-select">Project:</Label>
          <Select value={projectId || ""} onValueChange={setProjectId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project: any) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No documents yet</p>
          </Card>
        ) : (
          sortedDocuments.map((doc: Document) => (
            <Card key={doc._id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {getDocName(doc)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatFileSize(getDocSize(doc))}</span>
                      <span>
                        {new Date(getDocDate(doc)).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(doc.type)}>{doc.type}</Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePreview(doc)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = buildDataUrl(doc);
                      link.download = getDocName(doc);
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {previewDoc ? getDocName(previewDoc) : "Preview"}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <iframe
              src={buildDataUrl(previewDoc)}
              className="w-full h-[70vh] border rounded"
              title="Document Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
