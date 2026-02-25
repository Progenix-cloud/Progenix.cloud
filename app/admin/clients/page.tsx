"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Target,
  Phone,
  TrendingUp,
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";
import LeadDetailModal from "../../../components/admin/lead-detail-modal";
import CreateLeadModal from "../../../components/admin/create-lead-modal";

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
  projectValue?: number;
  paymentStatus?: "Pending" | "Partial" | "Complete";
  leadTemperature?: "Cold" | "Warm" | "Hot";
  notes?: string;
  createdDate: string;
  // Outreach fields
  channelUsed?: string;
  replyReceived?: boolean;
  callBooked?: boolean;
  proposalSent?: boolean;
  dateContacted?: string;
  followUp1Date?: string;
  followUp2Date?: string;
  // Deal fields
  pricingModel?: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  advanceReceived?: number;
  marginPercentage?: number;
  // Scoring fields
  painSeverityScore?: number;
  technicalComplexity?: "Low" | "Medium" | "High";
  objectionType?: string;
  whyLost?: string;
}

export default function ClientsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fitScoreFilter, setFitScoreFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all-leads");

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sourceFilter) params.append("source", sourceFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (fitScoreFilter) params.append("fitScore", fitScoreFilter);

      const response = await fetch(`/api/leads?${params.toString()}`);
      const data = await response.json();
      setLeads(data.leads || []);
      setFilteredLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter, statusFilter, fitScoreFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleOpenDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
        setLeads(leads.filter((l) => l._id !== leadId));
        setFilteredLeads(filteredLeads.filter((l) => l._id !== leadId));
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  const handleCreateLead = (newLead: Lead) => {
    setLeads([newLead, ...leads]);
    setFilteredLeads([newLead, ...filteredLeads]);
    setShowCreateModal(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSourceFilter("");
    setStatusFilter("");
    setFitScoreFilter("");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      New: "bg-blue-100 text-blue-800",
      Contacted: "bg-yellow-100 text-yellow-800",
      Qualified: "bg-green-100 text-green-800",
      Proposal: "bg-purple-100 text-purple-800",
      Closed: "bg-emerald-100 text-emerald-800",
      Lost: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTemperatureColor = (temp?: string) => {
    if (!temp) return "";
    const colors: Record<string, string> = {
      Cold: "text-blue-600",
      Warm: "text-yellow-600",
      Hot: "text-red-600",
    };
    return colors[temp] || "";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Lead & Client Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all leads and clients from acquisition to revenue (
            {leads.length} total)
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Add New Lead
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all-leads" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">All Leads</span>
          </TabsTrigger>
          <TabsTrigger
            value="qualification"
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Qualify</span>
          </TabsTrigger>
          <TabsTrigger value="outreach" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Outreach</span>
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Deals</span>
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Scoring</span>
          </TabsTrigger>
        </TabsList>

        {/* ALL LEADS - Main Sheet with Filters */}
        <TabsContent value="all-leads" className="space-y-6 mt-6">
          {/* Filters Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Filters</h3>
              {(search || sourceFilter || statusFilter || fitScoreFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Search
                </label>
                <Input
                  placeholder="Name, Company, Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Source
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="">All Sources</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Agency">Agency</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Closed">Closed</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Min Fit Score
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  value={fitScoreFilter}
                  onChange={(e) => setFitScoreFilter(e.target.value)}
                >
                  <option value="">All Scores</option>
                  <option value="3">3+</option>
                  <option value="5">5+</option>
                  <option value="7">7+</option>
                  <option value="8">8+</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchLeads}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Apply Filters"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Leads Table */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No leads found</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">
                        Lead
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Source
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Fit Score
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Budget
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Temperature
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                      >
                        <td
                          className="py-4 px-4"
                          onClick={() => handleOpenDetails(lead)}
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {lead.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">{lead.company}</td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">{lead.source}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{lead.fitScore}/10</Badge>
                        </td>
                        <td className="py-4 px-4">{lead.budgetRange}</td>
                        <td className="py-4 px-4">
                          <span
                            className={getTemperatureColor(
                              lead.leadTemperature
                            )}
                          >
                            {lead.leadTemperature || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Message"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${lead.email}`;
                              }}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit"
                              onClick={() => handleOpenDetails(lead)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead._id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* QUALIFICATION TAB */}
        <TabsContent value="qualification" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Lead Qualification
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Lead</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Problem
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Urgency
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Budget
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Decision Maker
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Fit Score
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads
                    .filter((l) => l.problemIdentified)
                    .map((lead) => (
                      <tr key={lead._id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <p className="font-medium">{lead.fullName}</p>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {lead.problemIdentified || "—"}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant="outline"
                            className={
                              lead.urgencyLevel && lead.urgencyLevel >= 4
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                          >
                            {lead.urgencyLevel || "—"}/5
                          </Badge>
                        </td>
                        <td className="py-4 px-4">{lead.budgetRange}</td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              lead.isDecisionMaker ? "default" : "outline"
                            }
                          >
                            {lead.isDecisionMaker ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">{lead.fitScore}/10</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(lead)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* OUTREACH TAB */}
        <TabsContent value="outreach" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Outreach Tracking
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Lead</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Contacted
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Channel
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Reply</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Call Booked
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Proposal
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads
                    .filter((l) => l.status !== "New")
                    .map((lead) => (
                      <tr key={lead._id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <p className="font-medium">{lead.fullName}</p>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {lead.dateAdded
                            ? new Date(lead.dateAdded).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {lead.channelUsed || "—"}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {lead.replyReceived ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {lead.callBooked ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {lead.proposalSent ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(lead)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* DEALS TAB */}
        <TabsContent value="deals" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Deal Tracking
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Lead</th>
                    <th className="text-left py-3 px-4 font-semibold">Value</th>
                    <th className="text-left py-3 px-4 font-semibold">Model</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Expected Close
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Payment
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Margin
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads
                    .filter(
                      (l) => l.status === "Proposal" || l.status === "Closed"
                    )
                    .map((lead) => (
                      <tr key={lead._id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <p className="font-medium">{lead.fullName}</p>
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          {lead.projectValue
                            ? `₹${lead.projectValue.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {lead.pricingModel || "—"}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {lead.expectedCloseDate
                            ? new Date(
                                lead.expectedCloseDate
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">
                            {lead.paymentStatus || "—"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {lead.marginPercentage
                            ? `${lead.marginPercentage}%`
                            : "—"}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(lead)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* SCORING TAB */}
        <TabsContent value="scoring" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Advanced Lead Scoring
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🌡️ Lead Temperature
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Cold / Warm / Hot
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  📊 Pain Severity
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  1-10 scale
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  ⚙️ Tech Complexity
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Low / Medium / High
                </p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  🚫 Objection Type
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Price / Trust / Timeline
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ❌ Why Lost?
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  Too expensive / etc
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Lead</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Temperature
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Pain</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Complexity
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Objection
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Why Lost
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <p className="font-medium">{lead.fullName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={getTemperatureColor(lead.leadTemperature)}
                        >
                          {lead.leadTemperature || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {lead.painSeverityScore
                          ? `${lead.painSeverityScore}/10`
                          : "—"}
                      </td>
                      <td className="py-4 px-4">
                        {lead.technicalComplexity || "—"}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {lead.objectionType || "—"}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {lead.whyLost || "—"}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetails(lead)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      {showDetailModal && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onSave={(updatedLead) => {
            const index = leads.findIndex((l) => l._id === updatedLead._id);
            if (index > -1) {
              const newLeads = [...leads];
              newLeads[index] = updatedLead;
              setLeads(newLeads);
              setFilteredLeads(newLeads);
            }
            setShowDetailModal(false);
          }}
        />
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <CreateLeadModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateLead}
        />
      )}
    </div>
  );
}
