"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (lead: any) => void;
}

export default function CreateLeadModal({
  open,
  onClose,
  onSuccess,
}: CreateLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    source: "LinkedIn" as const,
    location: "",
    industry: "",
    companyStage: "Idea" as const,
    teamSize: 1,
    website: "",
    linkedinUrl: "",
    status: "New" as const,
    fitScore: 5,
    problemIdentified: "",
    urgencyLevel: 1 as const,
    budgetRange: "₹50k" as const,
    isDecisionMaker: false,
  });

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseInt(value)
            : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newLead = await response.json();
        onSuccess(newLead);
      }
    } catch (error) {
      console.error("Error creating lead:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-background">
          <h2 className="text-2xl font-bold text-foreground">Add New Lead</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Company *
                </label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g., TechCorp"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., john@techcorp.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +91 98765 43210"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bangalore, India"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Industry
                </label>
                <Input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g., SaaS, Fintech"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Source *
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Agency">Agency</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Company Stage
                </label>
                <select
                  name="companyStage"
                  value={formData.companyStage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="Idea">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="Revenue">Revenue</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Team Size
                </label>
                <Input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://techcorp.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  LinkedIn URL
                </label>
                <Input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/john"
                />
              </div>
            </div>
          </div>

          {/* Qualification */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-foreground">Qualification</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Problem Identified
                </label>
                <textarea
                  name="problemIdentified"
                  value={formData.problemIdentified}
                  onChange={handleChange}
                  placeholder="Describe the problem this lead faces..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-20"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Urgency Level
                  </label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - High</option>
                    <option value={4}>4 - Very High</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Budget Range
                  </label>
                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="₹50k">₹50k</option>
                    <option value="₹2L">₹2L</option>
                    <option value="₹10L">₹10L</option>
                    <option value="₹50L+">₹50L+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Fit Score (1-10)
                  </label>
                  <Input
                    type="number"
                    name="fitScore"
                    value={formData.fitScore}
                    onChange={handleChange}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDecisionMaker"
                  id="isDecisionMaker"
                  checked={formData.isDecisionMaker}
                  onChange={handleChange}
                  className="rounded border-input"
                />
                <label
                  htmlFor="isDecisionMaker"
                  className="text-sm font-medium text-foreground"
                >
                  Is Decision Maker
                </label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-foreground">Initial Status</h3>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Closed">Closed</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
