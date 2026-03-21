import { connectToDB } from "@/lib/db";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { z } from "zod";

const leadUpdateSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    company: z.string().min(1).optional(),
    email: z.string().email().optional(),
    source: z
      .enum(["LinkedIn", "Hackathon", "Freelance", "Agency", "Referral"])
      .optional(),
  })
  .passthrough();

const leadSchema = new mongoose.Schema(
  {
    _id: String,
    fullName: { type: String, required: true },
    company: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    linkedinUrl: String,
    website: String,
    source: {
      type: String,
      enum: ["LinkedIn", "Hackathon", "Freelance", "Agency", "Referral"],
      required: true,
    },
    location: String,
    industry: String,
    companyStage: { type: String, enum: ["Idea", "MVP", "Revenue"] },
    teamSize: Number,
    dateAdded: { type: Date, default: Date.now },
    problemIdentified: String,
    urgencyLevel: { type: Number, min: 1, max: 5 },
    budgetRange: { type: String, enum: ["₹50k", "₹2L", "₹10L", "₹50L+"] },
    isDecisionMaker: Boolean,
    currentTechStack: String,
    revenue: String,
    timeline: String,
    fitScore: { type: Number, min: 1, max: 10 },
    dateContacted: Date,
    channelUsed: String,
    messageType: { type: String, enum: ["Cold DM", "Warm Intro"] },
    replyReceived: Boolean,
    followUp1Date: Date,
    followUp2Date: Date,
    callBooked: Boolean,
    proposalSent: Boolean,
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal", "Closed", "Lost"],
      default: "New",
    },
    projectValue: Number,
    pricingModel: String,
    expectedCloseDate: Date,
    actualCloseDate: Date,
    paymentStatus: { type: String, enum: ["Pending", "Partial", "Complete"] },
    advanceReceived: Number,
    marginPercentage: Number,
    projectType: String,
    leadTemperature: { type: String, enum: ["Cold", "Warm", "Hot"] },
    painSeverityScore: { type: Number, min: 1, max: 10 },
    technicalComplexity: { type: String, enum: ["Low", "Medium", "High"] },
    objectionType: String,
    whyLost: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
  },
  { collection: "leads" }
);

let Lead: mongoose.Model<any>;

async function getLeadModel() {
  if (!Lead) {
    await connectToDB();
    Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
  }
  return Lead;
}

// GET single lead by ID
export const GET = withRBAC(
  "lead",
  "read",
  async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const LeadModel = await getLeadModel();
    const lead = await LeadModel.findById(params.id).lean();

    if (!lead) {
      return apiError("LEAD_NOT_FOUND", "Lead not found", 404);
    }

    return apiSuccess(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return apiError("LEAD_FETCH_FAILED", "Failed to fetch lead", 500);
  }
  }
);

// PUT - Update lead
export const PUT = withRBAC(
  "lead",
  "update",
  async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const data = validateBody(leadUpdateSchema, await request.json());
    const LeadModel = await getLeadModel();

    const lead = await LeadModel.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date(), updatedDate: new Date() },
      { new: true }
    );

    if (!lead) {
      return apiError("LEAD_NOT_FOUND", "Lead not found", 404);
    }

    return apiSuccess(lead, "Lead updated");
  } catch (error) {
    console.error("Error updating lead:", error);
    if (error instanceof Error && error.message.includes("Validation failed")) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("LEAD_UPDATE_FAILED", "Failed to update lead", 500);
  }
  }
);

// DELETE - Delete lead
export const DELETE = withRBAC(
  "lead",
  "delete",
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const LeadModel = await getLeadModel();
    const lead = await LeadModel.findByIdAndDelete(params.id);

    if (!lead) {
      return apiError("LEAD_NOT_FOUND", "Lead not found", 404);
    }

    return apiSuccess({ id: params.id }, "Lead deleted");
  } catch (error) {
    console.error("Error deleting lead:", error);
    return apiError("LEAD_DELETE_FAILED", "Failed to delete lead", 500);
  }
  }
);
