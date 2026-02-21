"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Upload } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Document {
  _id: string;
  name: string;
  type: string;
  uploadDate: Date;
  size: number;
  version: number;
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const loadDocuments = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const docsData = await apiService.getDocuments({
          clientId: user.clientId,
        });
        setDocuments(docsData);
      }
    };
    loadDocuments();
  }, []);

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Download contracts, reports, and project documentation
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Documents</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {documents.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Size</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatFileSize(documents.reduce((s, d) => s + d.size, 0))}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Latest Upload</p>
          <p className="text-sm font-medium text-foreground mt-2">
            {documents.length > 0
              ? new Date(documents[0].uploadDate).toLocaleDateString()
              : "N/A"}
          </p>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Document
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Size
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Uploaded
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={getTypeColor(doc.type)}>{doc.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
