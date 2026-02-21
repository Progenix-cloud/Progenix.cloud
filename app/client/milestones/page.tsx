'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';

export default function MilestonesPage() {
  const milestones = [
    {
      id: '1',
      project: 'E-Commerce Platform',
      name: 'Backend API',
      status: 'completed',
      dueDate: '2024-02-15',
      deliverables: ['REST API', 'Database Schema'],
    },
    {
      id: '2',
      project: 'E-Commerce Platform',
      name: 'Frontend Setup',
      status: 'in-progress',
      dueDate: '2024-04-15',
      deliverables: ['UI Components', 'State Management'],
    },
    {
      id: '3',
      project: 'Mobile App Development',
      name: 'Design & Planning',
      status: 'completed',
      dueDate: '2024-02-15',
      deliverables: ['Wireframes', 'Design System'],
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Milestones & Deliverables</h1>
        <p className="text-muted-foreground mt-2">
          Track project milestones and deliverables
        </p>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className="p-6">
            <div className="flex gap-4">
              <div className="pt-1">
                {milestone.status === 'completed' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-accent" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {milestone.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{milestone.project}</p>
                  </div>
                  <Badge
                    className={
                      milestone.status === 'completed'
                        ? 'bg-green-500/20 text-green-700'
                        : 'bg-accent/20 text-accent'
                    }
                  >
                    {milestone.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {milestone.deliverables.map((d, i) => (
                      <Badge key={i} variant="outline">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
