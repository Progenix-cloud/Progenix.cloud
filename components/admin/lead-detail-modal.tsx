"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface Lead {
  _id: string;
  fullName: string;
  company: string;
  email: string;
  phone?: string;
  source: "LinkedIn" | "Hackathon" | "Freelance" | "Agency" | "Referral";
  dateAdded: string;
  location: string;
  industry: string;
  companyStage: "Idea" | "MVP" | "Revenue";
  teamSize: number;
  website?: string;
  linkedinUrl?: string;
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Closed" | "Lost";
  fitScore: number;
  problemIdentified: string;
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  budgetRange: "₹50k" | "₹2L" | "₹10L" | "₹50L+";
  isDecisionMaker: boolean;
  currentTechStack?: string;
  revenue?: string;
  timeline?: string;
  dateContacted?: string;
  channelUsed?: string;
  messageType?: "Cold DM" | "Warm Intro";
  replyReceived?: boolean;
  followUp1Date?: string;
  followUp2Date?: string;
  callBooked?: boolean;
  proposalSent?: boolean;
  projectValue?: number;
  pricingModel?: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  paymentStatus?: "Pending" | "Partial" | "Complete";
  advanceReceived?: number;
  marginPercentage?: number;
  projectType?: string;
  leadTemperature?: "Cold" | "Warm" | "Hot";
  painSeverityScore?: number;
  technicalComplexity?: "Low" | "Medium" | "High";
  objectionType?: string;
  whyLost?: string;
  notes?: string;
  createdDate: string;
}

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

export default function LeadDetailModal({
  lead,
  open,
  onClose,
  onSave,
}: LeadDetailModalProps) {
  const [formData, setFormData] = useState(lead);
  const [loading, setLoading] = useState(false);

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
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${lead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updatedLead = await response.json();
      onSave(updatedLead);
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {formData.fullName}
              </h2>
              <p className="text-muted-foreground">{formData.company}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs for different sections */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Full Name
                  </label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Company
                  </label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Location
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Agency">Agency</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Qualification Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Qualification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-2">
                    Problem Identified
                  </label>
                  <textarea
                    name="problemIdentified"
                    value={formData.problemIdentified}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Urgency Level (1-5)
                  </label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Budget Range
                  </label>
                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="₹50k">₹50k</option>
                    <option value="₹2L">₹2L</option>
                    <option value="₹10L">₹10L</option>
                    <option value="₹50L+">₹50L+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Fit Score (1-10)
                  </label>
                  <Input
                    name="fitScore"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.fitScore}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-end">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <input
                      name="isDecisionMaker"
                      type="checkbox"
                      checked={formData.isDecisionMaker}
                      onChange={handleChange}
                    />
                    Is Decision Maker
                  </label>
                </div>
              </div>
            </div>

            {/* Outreach Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Outreach</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Closed">Closed</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Channel Used
                  </label>
                  <Input
                    name="channelUsed"
                    value={formData.channelUsed || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <input
                      name="replyReceived"
                      type="checkbox"
                      checked={formData.replyReceived || false}
                      onChange={handleChange}
                    />
                    Reply Received
                  </label>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <input
                      name="callBooked"
                      type="checkbox"
                      checked={formData.callBooked || false}
                      onChange={handleChange}
                    />
                    Call Booked
                  </label>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <input
                      name="proposalSent"
                      type="checkbox"
                      checked={formData.proposalSent || false}
                      onChange={handleChange}
                    />
                    Proposal Sent
                  </label>
                </div>
              </div>
            </div>

            {/* Deal Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Deal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Project Value
                  </label>
                  <Input
                    name="projectValue"
                    type="number"
                    value={formData.projectValue || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Pricing Model
                  </label>
                  <Input
                    name="pricingModel"
                    value={formData.pricingModel || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Payment Status
                  </label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select...</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Margin %
                  </label>
                  <Input
                    name="marginPercentage"
                    type="number"
                    value={formData.marginPercentage || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Scoring Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Advanced Scoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Lead Temperature
                  </label>
                  <select
                    name="leadTemperature"
                    value={formData.leadTemperature || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select...</option>
                    <option value="Cold">Cold</option>
                    <option value="Warm">Warm</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Pain Severity Score (1-10)
                  </label>
                  <Input
                    name="painSeverityScore"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.painSeverityScore || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Technical Complexity
                  </label>
                  <select
                    name="technicalComplexity"
                    value={formData.technicalComplexity || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Objection Type
                  </label>
                  <Input
                    name="objectionType"
                    value={formData.objectionType || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
