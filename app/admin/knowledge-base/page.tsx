'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PlusCircle, Edit2, Trash2, Search } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles] = useState([
    {
      id: '1',
      title: 'Getting Started with Projects',
      category: 'onboarding',
      views: 324,
      lastUpdated: '2024-03-15',
      content: 'Learn how to create and manage projects in SoftAgent...',
    },
    {
      id: '2',
      title: 'Time Tracking Best Practices',
      category: 'processes',
      views: 215,
      lastUpdated: '2024-03-10',
      content: 'Guidelines for accurate time tracking and billing...',
    },
    {
      id: '3',
      title: 'Meeting Minutes Template',
      category: 'templates',
      views: 156,
      lastUpdated: '2024-03-01',
      content: 'Standard template for documenting meeting outcomes...',
    },
    {
      id: '4',
      title: 'Project Status Reporting',
      category: 'processes',
      views: 298,
      lastUpdated: '2024-02-28',
      content: 'How to create comprehensive project status reports...',
    },
  ]);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding':
        return 'bg-blue-500/20 text-blue-700';
      case 'processes':
        return 'bg-primary/20 text-primary';
      case 'templates':
        return 'bg-accent/20 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Internal documentation, SOPs, and best practices
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Articles</p>
          <p className="text-2xl font-bold text-foreground mt-2">{articles.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {articles.reduce((sum, a) => sum + a.views, 0)}
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
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <Card key={article.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {article.title}
                    </h3>
                    <Badge className={`mt-2 ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <p>{article.views} views</p>
                    <p>Updated: {new Date(article.lastUpdated).toLocaleDateString()}</p>
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
