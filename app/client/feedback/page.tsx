'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function FeedbackPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);

  const mockFeedback = [
    {
      id: '1',
      date: '2024-01-20',
      category: 'communication',
      rating: 5,
      message: 'Excellent communication from the team. Very responsive to changes.',
    },
    {
      id: '2',
      date: '2024-01-15',
      category: 'quality',
      rating: 4,
      message: 'Code quality is good. Some minor improvements needed in documentation.',
    },
    {
      id: '3',
      date: '2024-01-10',
      category: 'timeline',
      rating: 5,
      message: 'Project delivered on time. Great project management.',
    },
  ];

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback & Satisfaction</h1>
          <p className="text-muted-foreground mt-2">
            Share your feedback about our team and project work
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Leave Feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Feedback</DialogTitle>
              <DialogDescription>
                Help us improve by sharing your thoughts about our team and project collaboration.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="w-full px-3 py-2 border rounded mt-2">
                  <option>Communication</option>
                  <option>Quality</option>
                  <option>Timeline</option>
                  <option>Technical Skills</option>
                  <option>Overall Experience</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="mt-2">{renderStars(rating, true)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Your Feedback</label>
                <textarea
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 border rounded h-24 mt-2"
                />
              </div>
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Submit Feedback
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {mockFeedback.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="outline">{item.category}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                {renderStars(item.rating)}
              </div>
              <p className="text-foreground">{item.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
