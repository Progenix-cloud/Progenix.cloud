import { connectToDB } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  paginationSchema,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { z } from "zod";

const querySchema = paginationSchema.extend({
  search: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  fitScore: z.coerce.number().optional(),
});

const leadCreateSchema = z
  .object({
    fullName: z.string().min(1),
    company: z.string().min(1),
    email: z.string().email(),
    source: z.enum([
      "LinkedIn",
      "Hackathon",
      "Freelance",
      "Agency",
      "Referral",
    ]),
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

// GET all leads with optional filters
export const GET = withRBAC("lead", "read", async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = validateQuery(querySchema, searchParams);

    const LeadModel = await getLeadModel();

    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: "i" } },
        { company: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.source) filter.source = query.source;
    if (query.status) filter.status = query.status;
    if (query.fitScore) filter.fitScore = { $gte: query.fitScore };

    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const leads = await LeadModel.find(filter)
      .sort({ dateAdded: -1 })
      .skip(skip)
      .limit(query.limit || 20)
      .lean();

    const total = await LeadModel.countDocuments(filter);

    return apiSuccess({
      items: leads,
      total,
      page: query.page || 1,
      limit: query.limit || 20,
      pages: Math.ceil(total / (query.limit || 20)),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    if (error instanceof Error && error.message.includes("Query validation")) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("LEADS_FETCH_FAILED", "Failed to fetch leads", 500);
  }
});

// POST - Create new lead
export const POST = withRBAC("lead", "create", async (request: NextRequest) => {
  try {
    const data = validateBody(leadCreateSchema, await request.json());
    const LeadModel = await getLeadModel();

    const leadId = `LD-${Date.now()}`;
    const createdAt =
      data.createdAt || data.createdDate || data.dateAdded || new Date();
    const updatedAt = data.updatedAt || data.updatedDate || createdAt;
    const lead = new LeadModel({
      _id: leadId,
      ...data,
      createdAt,
      updatedAt,
      createdDate: data.createdDate || createdAt,
      updatedDate: data.updatedDate || updatedAt,
    });

    await lead.save();
    return apiSuccess(lead, "Lead created");
  } catch (error) {
    console.error("Error creating lead:", error);
    if (error instanceof Error && error.message.includes("Validation failed")) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("LEAD_CREATE_FAILED", "Failed to create lead", 500);
  }
});
