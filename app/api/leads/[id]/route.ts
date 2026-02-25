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

// GET single lead by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const LeadModel = await getLeadModel();
    const lead = await LeadModel.findById(params.id).lean();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

// PUT - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const LeadModel = await getLeadModel();

    const lead = await LeadModel.findByIdAndUpdate(
      params.id,
      { ...data, updatedDate: new Date() },
      { new: true }
    );

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const LeadModel = await getLeadModel();
    const lead = await LeadModel.findByIdAndDelete(params.id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
