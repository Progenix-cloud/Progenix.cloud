import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

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
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const source = searchParams.get("source");
    const status = searchParams.get("status");
    const fitScore = searchParams.get("fitScore");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const LeadModel = await getLeadModel();

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (source) filter.source = source;
    if (status) filter.status = status;
    if (fitScore) filter.fitScore = { $gte: parseInt(fitScore) };

    const skip = (page - 1) * limit;
    const leads = await LeadModel.find(filter)
      .sort({ dateAdded: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await LeadModel.countDocuments(filter);

    return NextResponse.json({
      leads,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const LeadModel = await getLeadModel();

    const leadId = `LD-${Date.now()}`;
    const lead = new LeadModel({
      _id: leadId,
      ...data,
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    await lead.save();
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
