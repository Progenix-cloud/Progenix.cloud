'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, CheckCircle, Clock } from 'lucide-react';

export function TeamCollaboration() {
  const [activeTab, setActiveTab] = useState<'comments' | 'tasks' | 'timeline'>('comments');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      role: 'Project Manager',
      message: 'Great progress on the API integration. Keep up the momentum!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      author: 'James Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      role: 'Developer',
      message: 'Thanks! Finished the user authentication module. Ready for review.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ]);

  const teamTasks = [
    {
      id: 'task-1',
      title: 'API Documentation',
      assignee: 'Maya Patel',
      status: 'completed',
      dueDate: new Date(),
    },
    {
      id: 'task-2',
      title: 'Database Optimization',
      assignee: 'James Wilson',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-3',
      title: 'Frontend Testing',
      assignee: 'Emma Rodriguez',
      status: 'pending',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ];

  const timeline = [
    {
      id: '1',
      event: 'Project Kickoff',
      date: new Date('2024-01-15'),
      type: 'milestone',
    },
    {
      id: '2',
      event: 'Design Phase Complete',
      date: new Date('2024-02-15'),
      type: 'milestone',
    },
    {
      id: '3',
      event: 'Development Started',
      date: new Date('2024-02-20'),
      type: 'event',
    },
  ];

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: String(comments.length + 1),
          author: 'You',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
          role: 'Admin',
          message: newComment,
          timestamp: new Date(),
        },
      ]);
      setNewComment('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Collaboration</CardTitle>
        <CardDescription>
          {activeTab === 'comments'
            ? 'Real-time project discussion'
            : activeTab === 'tasks'
              ? 'Track team tasks and assignments'
              : 'Project milestone timeline'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 px-4 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Comments
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-2 px-4 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 px-4 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Timeline
            </button>
          </div>

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{comment.author}</p>
                        <span className="text-xs text-muted-foreground">{comment.role}</span>
                      </div>
                      <p className="text-sm mt-1">{comment.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {comment.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {teamTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Assigned to {task.assignee}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        task.status === 'completed'
                          ? 'default'
                          : task.status === 'in-progress'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {task.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {task.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {timeline.map((item, idx) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                    {idx !== timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-border my-2" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">{item.event}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
