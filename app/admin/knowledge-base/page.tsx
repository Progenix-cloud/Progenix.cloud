"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildAuthHeaders } from "@/lib/client-auth";

interface KBArticle {
  _id: string;
  title: string;
  category: string;
  content: string;
  views?: number;
  lastUpdated?: string;
  createdAt?: string;
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    content: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/knowledge-base?${params}`, {
        headers: buildAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch articles");

      const result = await response.json();
      if (result.success) {
        setArticles(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch articles");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchArticles(searchQuery);
  };

  const handleCreateArticle = async () => {
    if (
      !newArticle.title.trim() ||
      !newArticle.category.trim() ||
      !newArticle.content.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newArticle),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setNewArticle({ title: "", category: "", content: "" });
        fetchArticles();
      } else {
        alert("Failed to create article");
      }
    } catch (error) {
      console.error("Failed to create article:", error);
      alert("Failed to create article");
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "onboarding":
        return "bg-blue-500/20 text-blue-700";
      case "processes":
        return "bg-primary/20 text-primary";
      case "templates":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Knowledge Base
            </h1>
            <p className="text-muted-foreground mt-2">
              Internal documentation, SOPs, and best practices
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading articles...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Knowledge Base
            </h1>
            <p className="text-muted-foreground mt-2">
              Internal documentation, SOPs, and best practices
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading articles</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Internal documentation, SOPs, and best practices
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newArticle.title}
                  onChange={(e) =>
                    setNewArticle((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Article title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newArticle.category}
                  onValueChange={(value) =>
                    setNewArticle((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="processes">Processes</SelectItem>
                    <SelectItem value="templates">Templates</SelectItem>
                    <SelectItem value="best-practices">
                      Best Practices
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newArticle.content}
                  onChange={(e) =>
                    setNewArticle((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Article content"
                  rows={6}
                />
              </div>
              <Button onClick={handleCreateArticle} className="w-full">
                Create Article
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Articles</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {articles.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {new Set(articles.map((a) => a.category)).size}
          </p>
        </Card>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Card key={article._id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {article.title}
                    </h3>
                    <Badge
                      className={`mt-2 ${getCategoryColor(article.category)}`}
                    >
                      {article.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <p>{article.views || 0} views</p>
                    <p>
                      Updated:{" "}
                      {article.createdAt
                        ? new Date(article.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
