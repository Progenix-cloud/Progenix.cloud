"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, printPage } from "@/lib/export-client";
import EngineItemActions from "@/components/business/engine-item-actions";
import ProjectFilter from "@/components/business/project-filter";

type MarketingItem = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  data?: any;
  createdAt?: string;
};

const getUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const StatCard = ({ label, value, hint }: any) => (
  <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </div>
);

export default function MarketingPage() {
  const [items, setItems] = useState<MarketingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const [gtm, setGtm] = useState({
    title: "",
    targetSegment: "",
    positioning: "",
    channels: "",
    coreMessage: "",
    budget: "",
    timeline: "",
  });

  const [funnel, setFunnel] = useState({
    title: "",
    visitors: 1000,
    signups: 150,
    activations: 80,
    paid: 25,
  });

  const [experiment, setExperiment] = useState({
    title: "",
    hypothesis: "",
    metric: "",
    target: 0,
    durationWeeks: 2,
    result: 0,
  });

  const [pmf, setPmf] = useState({
    title: "",
    veryDisappointed: 0,
    somewhatDisappointed: 0,
    notDisappointed: 0,
  });

  const [content, setContent] = useState({
    title: "",
    cost: 200,
    leads: 10,
    conversions: 2,
    revenue: 500,
  });

  const load = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    try {
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const res = await fetch(`/api/business/marketing${qp}`, {
        headers: { "x-user-id": user._id },
      });
      const json = await res.json();
      if (json.data) setItems(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const createItem = async (payload: Partial<MarketingItem>) => {
    const user = getUser();
    if (!user?._id) {
      alert("Missing user session");
      return null;
    }
    const res = await fetch("/api/business/marketing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user._id,
      },
      body: JSON.stringify({
        projectId: projectId || undefined,
        ...payload,
        ownerId: user._id,
      }),
    });
    const json = await res.json();
    if (json.data) {
      setItems((s) => [json.data, ...s]);
      return json.data as MarketingItem;
    }
    alert(json.error || "Failed to create");
    return null;
  };

  const handleUpdated = (updated: MarketingItem) => {
    setItems((s) => s.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleDeleted = (id: string) => {
    setItems((s) => s.filter((i) => i._id !== id));
  };

  const funnelMetrics = () => {
    const visitors = Number(funnel.visitors || 0) || 0;
    const signups = Number(funnel.signups || 0) || 0;
    const activations = Number(funnel.activations || 0) || 0;
    const paid = Number(funnel.paid || 0) || 0;
    const v2s = visitors > 0 ? (signups / visitors) * 100 : 0;
    const s2a = signups > 0 ? (activations / signups) * 100 : 0;
    const a2p = activations > 0 ? (paid / activations) * 100 : 0;
    const overall = visitors > 0 ? (paid / visitors) * 100 : 0;
    return { v2s, s2a, a2p, overall };
  };

  const pmfMetrics = () => {
    const total =
      pmf.veryDisappointed + pmf.somewhatDisappointed + pmf.notDisappointed;
    const score = total > 0 ? (pmf.veryDisappointed / total) * 100 : 0;
    const label = score >= 40 ? "Strong" : score >= 25 ? "Moderate" : "Weak";
    return { total, score, label };
  };

  const contentMetrics = () => {
    const cost = Number(content.cost || 0) || 0;
    const leads = Number(content.leads || 0) || 0;
    const conversions = Number(content.conversions || 0) || 0;
    const revenue = Number(content.revenue || 0) || 0;
    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
    const cpl = leads > 0 ? cost / leads : 0;
    const cpa = conversions > 0 ? cost / conversions : 0;
    return { roi, cpl, cpa };
  };

  const gtmItems = items.filter((i) => i.type === "gtm");
  const funnelItems = items.filter((i) => i.type === "funnel");
  const experimentItems = items.filter((i) => i.type === "experiment");
  const pmfItems = items.filter((i) => i.type === "pmf");
  const contentItems = items.filter((i) => i.type === "content");

  const experimentSuccess = experimentItems.length
    ? Math.round(
        (experimentItems.filter((e) => e.data?.outcome === "win").length /
          experimentItems.length) *
          100
      )
    : 0;

  const avgConversion = funnelItems.length
    ? Math.round(
        (funnelItems.reduce((sum, f) => sum + (f.data?.overall || 0), 0) /
          funnelItems.length) *
          100
      ) / 100
    : 0;

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Marketing & Growth Engine</h1>
            <p className="text-muted-foreground mt-2">
              GTM plans, funnels, experiments, PMF, content ROI.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={() => downloadJson("marketing.json", items)}>
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="GTM Plans" value={gtmItems.length} />
          <StatCard label="Avg Funnel Conv." value={`${avgConversion}%`} />
          <StatCard label="Experiment Win Rate" value={`${experimentSuccess}%`} />
          <StatCard label="Content Items" value={contentItems.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">GTM Planner</h2>
            <Input
              placeholder="Plan title"
              value={gtm.title}
              onChange={(e) => setGtm((s) => ({ ...s, title: e.target.value }))}
            />
            <Input
              placeholder="Target segment"
              value={gtm.targetSegment}
              onChange={(e) =>
                setGtm((s) => ({ ...s, targetSegment: e.target.value }))
              }
            />
            <Textarea
              placeholder="Positioning"
              value={gtm.positioning}
              onChange={(e) => setGtm((s) => ({ ...s, positioning: e.target.value }))}
            />
            <Input
              placeholder="Channels"
              value={gtm.channels}
              onChange={(e) => setGtm((s) => ({ ...s, channels: e.target.value }))}
            />
            <Textarea
              placeholder="Core message"
              value={gtm.coreMessage}
              onChange={(e) => setGtm((s) => ({ ...s, coreMessage: e.target.value }))}
            />
            <Input
              placeholder="Budget"
              value={gtm.budget}
              onChange={(e) => setGtm((s) => ({ ...s, budget: e.target.value }))}
            />
            <Input
              placeholder="Timeline"
              value={gtm.timeline}
              onChange={(e) => setGtm((s) => ({ ...s, timeline: e.target.value }))}
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: gtm.title || "GTM Plan",
                  type: "gtm",
                  data: gtm,
                });
                if (created) {
                  setGtm({
                    title: "",
                    targetSegment: "",
                    positioning: "",
                    channels: "",
                    coreMessage: "",
                    budget: "",
                    timeline: "",
                  });
                }
              }}
              disabled={!gtm.title}
            >
              Save GTM Plan
            </Button>
            <div className="space-y-2">
              {gtmItems.map((g) => (
                <div key={g._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{g.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.data?.targetSegment}
                      </div>
                    </div>
                    <EngineItemActions
                      item={g}
                      endpoint="/api/business/marketing"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {gtmItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No GTM plans yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Funnel Analyzer</h2>
            <Input
              placeholder="Funnel title"
              value={funnel.title}
              onChange={(e) => setFunnel((s) => ({ ...s, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Visitors"
                value={funnel.visitors}
                onChange={(e) =>
                  setFunnel((s) => ({ ...s, visitors: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Signups"
                value={funnel.signups}
                onChange={(e) =>
                  setFunnel((s) => ({ ...s, signups: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Activations"
                value={funnel.activations}
                onChange={(e) =>
                  setFunnel((s) => ({ ...s, activations: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Paid"
                value={funnel.paid}
                onChange={(e) =>
                  setFunnel((s) => ({ ...s, paid: Number(e.target.value) }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Overall conversion: {funnelMetrics().overall.toFixed(2)}%
            </div>
            <Button
              onClick={async () => {
                const metrics = funnelMetrics();
                const created = await createItem({
                  title: funnel.title || "Funnel",
                  type: "funnel",
                  data: { ...funnel, ...metrics },
                });
                if (created) {
                  setFunnel({
                    title: "",
                    visitors: 1000,
                    signups: 150,
                    activations: 80,
                    paid: 25,
                  });
                }
              }}
              disabled={!funnel.title}
            >
              Save Funnel
            </Button>
            <div className="space-y-2">
              {funnelItems.map((f) => (
                <div key={f._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{f.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Overall: {Number(f.data?.overall || 0).toFixed(2)}%
                      </div>
                    </div>
                    <EngineItemActions
                      item={f}
                      endpoint="/api/business/marketing"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {funnelItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No funnels yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Growth Experiment Tracker</h2>
            <Input
              placeholder="Experiment title"
              value={experiment.title}
              onChange={(e) =>
                setExperiment((s) => ({ ...s, title: e.target.value }))
              }
            />
            <Textarea
              placeholder="Hypothesis"
              value={experiment.hypothesis}
              onChange={(e) =>
                setExperiment((s) => ({ ...s, hypothesis: e.target.value }))
              }
            />
            <Input
              placeholder="Primary metric"
              value={experiment.metric}
              onChange={(e) =>
                setExperiment((s) => ({ ...s, metric: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Target"
                value={experiment.target}
                onChange={(e) =>
                  setExperiment((s) => ({ ...s, target: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Result"
                value={experiment.result}
                onChange={(e) =>
                  setExperiment((s) => ({ ...s, result: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Duration (weeks)"
                value={experiment.durationWeeks}
                onChange={(e) =>
                  setExperiment((s) => ({
                    ...s,
                    durationWeeks: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Outcome: {experiment.result >= experiment.target ? "win" : "loss"}
            </div>
            <Button
              onClick={async () => {
                const outcome =
                  experiment.result >= experiment.target ? "win" : "loss";
                const created = await createItem({
                  title: experiment.title || "Experiment",
                  type: "experiment",
                  data: { ...experiment, outcome },
                });
                if (created) {
                  setExperiment({
                    title: "",
                    hypothesis: "",
                    metric: "",
                    target: 0,
                    durationWeeks: 2,
                    result: 0,
                  });
                }
              }}
              disabled={!experiment.title}
            >
              Save Experiment
            </Button>
            <div className="space-y-2">
              {experimentItems.map((e) => (
                <div key={e._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Outcome: {e.data?.outcome}
                      </div>
                    </div>
                    <EngineItemActions
                      item={e}
                      endpoint="/api/business/marketing"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {experimentItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No experiments yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">PMF Scoring</h2>
            <Input
              placeholder="Survey title"
              value={pmf.title}
              onChange={(e) => setPmf((s) => ({ ...s, title: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Very disappointed"
                value={pmf.veryDisappointed}
                onChange={(e) =>
                  setPmf((s) => ({
                    ...s,
                    veryDisappointed: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Somewhat disappointed"
                value={pmf.somewhatDisappointed}
                onChange={(e) =>
                  setPmf((s) => ({
                    ...s,
                    somewhatDisappointed: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Not disappointed"
                value={pmf.notDisappointed}
                onChange={(e) =>
                  setPmf((s) => ({
                    ...s,
                    notDisappointed: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              PMF Score: {pmfMetrics().score.toFixed(1)}% ({pmfMetrics().label})
            </div>
            <Button
              onClick={async () => {
                const metrics = pmfMetrics();
                const created = await createItem({
                  title: pmf.title || "PMF Survey",
                  type: "pmf",
                  data: { ...pmf, ...metrics },
                });
                if (created) {
                  setPmf({
                    title: "",
                    veryDisappointed: 0,
                    somewhatDisappointed: 0,
                    notDisappointed: 0,
                  });
                }
              }}
              disabled={!pmf.title}
            >
              Save PMF
            </Button>
            <div className="space-y-2">
              {pmfItems.map((p) => (
                <div key={p._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Score: {Number(p.data?.score || 0).toFixed(1)}%
                      </div>
                    </div>
                    <EngineItemActions
                      item={p}
                      endpoint="/api/business/marketing"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {pmfItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No PMF surveys yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-3">
          <h2 className="font-semibold">Content ROI Tracker</h2>
          <Input
            placeholder="Content title"
            value={content.title}
            onChange={(e) => setContent((s) => ({ ...s, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              type="number"
              placeholder="Cost"
              value={content.cost}
              onChange={(e) =>
                setContent((s) => ({ ...s, cost: Number(e.target.value) }))
              }
            />
            <Input
              type="number"
              placeholder="Leads"
              value={content.leads}
              onChange={(e) =>
                setContent((s) => ({ ...s, leads: Number(e.target.value) }))
              }
            />
            <Input
              type="number"
              placeholder="Conversions"
              value={content.conversions}
              onChange={(e) =>
                setContent((s) => ({
                  ...s,
                  conversions: Number(e.target.value),
                }))
              }
            />
            <Input
              type="number"
              placeholder="Revenue"
              value={content.revenue}
              onChange={(e) =>
                setContent((s) => ({ ...s, revenue: Number(e.target.value) }))
              }
            />
          </div>
          <div className="text-sm text-muted-foreground">
            ROI: {contentMetrics().roi.toFixed(1)}% • CPL:
            {contentMetrics().cpl.toFixed(2)} • CPA:
            {contentMetrics().cpa.toFixed(2)}
          </div>
          <Button
            onClick={async () => {
              const metrics = contentMetrics();
              const created = await createItem({
                title: content.title || "Content",
                type: "content",
                data: { ...content, ...metrics },
              });
              if (created) {
                setContent({
                  title: "",
                  cost: 200,
                  leads: 10,
                  conversions: 2,
                  revenue: 500,
                });
              }
            }}
            disabled={!content.title}
          >
            Save Content
          </Button>
          <div className="space-y-2">
            {contentItems.map((c) => (
              <div key={c._id} className="p-3 border rounded-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">
                      ROI: {Number(c.data?.roi || 0).toFixed(1)}%
                    </div>
                  </div>
                  <EngineItemActions
                    item={c}
                    endpoint="/api/business/marketing"
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                </div>
              </div>
            ))}
            {contentItems.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No content ROI items yet.
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </div>
    </ProtectedBusiness>
  );
}
