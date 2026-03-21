"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { CardSkeleton } from "@/components/loading-skeleton";
import { buildAuthHeaders, getStoredClientId } from "@/lib/client-auth";

interface FeedbackItem {
  id?: string;
  _id?: string;
  category: string;
  rating: number;
  message: string;
  date?: string;
  createdAt?: string;
}

export default function FeedbackPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
    }
  }, []);

  const {
    data: feedback = [],
    isLoading,
    mutate,
  } = useSWR(clientId ? ["feedback", clientId] : null, () =>
    apiService.getFeedback({ clientId: clientId as string })
  );

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (rating < 1) {
        toast.error("Please select a rating.");
        return;
      }
      const resolvedClientId = clientId || getStoredClientId();
      if (!resolvedClientId) {
        toast.error("Missing client session");
        return;
      }
      const formData = new FormData(e.target as HTMLFormElement);
      const payload = {
        clientId: resolvedClientId,
        category: formData.get("category"),
        rating,
        message: formData.get("message"),
        submittedAt: new Date(),
      };
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsOpen(false);
        (e.target as HTMLFormElement).reset();
        setRating(0);
        mutate();
        toast.success("Feedback submitted");
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const renderStars = (ratingValue: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            className="focus:outline-none"
            aria-label={
              interactive ? `Set rating ${star}` : `Rating ${star}`
            }
            type="button"
          >
            <Star
              className={`w-5 h-5 ${
                star <= ratingValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
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
                Help us improve by sharing your thoughts about our team and
                project collaboration.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  name="category"
                  className="w-full px-3 py-2 border rounded mt-2"
                  required
                >
                  <option value="communication">Communication</option>
                  <option value="quality">Quality</option>
                  <option value="timeline">Timeline</option>
                  <option value="technical">Technical Skills</option>
                  <option value="overall">Overall Experience</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="mt-2">{renderStars(rating, true)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Your Feedback</label>
                <textarea
                  name="message"
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 border rounded h-24 mt-2"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Feedback
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <CardSkeleton />
        </div>
      ) : feedback.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No feedback yet</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {feedback.map((item: FeedbackItem) => (
            <Card key={item.id || item._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="outline">{item.category}</Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  {renderStars(item.rating)}
                </div>
                <p className="text-foreground">{item.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
