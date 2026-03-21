"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, printPage } from "@/lib/export-client";
import EngineItemActions from "@/components/business/engine-item-actions";
import ProjectFilter from "@/components/business/project-filter";

type StrategyItem = {
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

export default function StrategyPage() {
  const [items, setItems] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [values, setValues] = useState("");
  const [northStar, setNorthStar] = useState("");
  const [valueProp, setValueProp] = useState("");

  const [canvas, setCanvas] = useState({
    keyPartners: "",
    keyActivities: "",
    keyResources: "",
    valuePropositions: "",
    customerRelationships: "",
    channels: "",
    customerSegments: "",
    costStructure: "",
    revenueStreams: "",
  });

  const [icp, setIcp] = useState({
    personaName: "",
    industry: "",
    companySize: "",
    role: "",
    pains: "",
    goals: "",
    budgetRange: "",
    decisionCriteria: "",
    acquisitionChannels: "",
  });

  const [okrObjective, setOkrObjective] = useState("");
  const [okrCadence, setOkrCadence] = useState("Quarterly");
  const [okrDueDate, setOkrDueDate] = useState("");
  const [krTitle, setKrTitle] = useState("");
  const [krTarget, setKrTarget] = useState(100);
  const [krCurrent, setKrCurrent] = useState(0);
  const [keyResults, setKeyResults] = useState<any[]>([]);

  const [riskTitle, setRiskTitle] = useState("");
  const [riskImpact, setRiskImpact] = useState(3);
  const [riskProbability, setRiskProbability] = useState(3);
  const [riskMitigation, setRiskMitigation] = useState("");
  const [riskStatus, setRiskStatus] = useState("open");

  const load = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    try {
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const res = await fetch(`/api/business/strategy${qp}`, {
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

  const createItem = async (payload: Partial<StrategyItem>) => {
    const user = getUser();
    if (!user?._id) {
      alert("Missing user session");
      return null;
    }
    const res = await fetch("/api/business/strategy", {
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
      return json.data as StrategyItem;
    }
    alert(json.error || "Failed to create");
    return null;
  };

  const handleUpdated = (updated: StrategyItem) => {
    setItems((s) => s.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleDeleted = (id: string) => {
    setItems((s) => s.filter((i) => i._id !== id));
  };

  const addKeyResult = () => {
    if (!krTitle) return;
    setKeyResults((s) => [
      ...s,
      { title: krTitle, target: krTarget, current: krCurrent },
    ]);
    setKrTitle("");
    setKrTarget(100);
    setKrCurrent(0);
  };

  const okrProgress = (krs: any[]) => {
    if (!krs || krs.length === 0) return 0;
    const avg =
      krs.reduce((sum, kr) => {
        const t = Number(kr.target || 0) || 0;
        const c = Number(kr.current || 0) || 0;
        if (t === 0) return sum;
        return sum + Math.min(c / t, 1);
      }, 0) / krs.length;
    return Math.round(avg * 100);
  };

  const visions = items.filter((i) => i.type === "vision");
  const canvases = items.filter((i) => i.type === "canvas");
  const icps = items.filter((i) => i.type === "icp");
  const okrs = items.filter((i) => i.type === "okr");
  const risks = items.filter((i) => i.type === "risk");

  const avgOkrProgress = okrs.length
    ? Math.round(
        okrs.reduce((sum, o) => sum + (o.data?.progress || 0), 0) / okrs.length
      )
    : 0;
  const openRisks = risks.filter((r) => r.data?.status !== "closed").length;

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Strategy Engine</h1>
            <p className="text-muted-foreground mt-2">
              Vision, canvas, ICP, OKRs, strategic risk.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={() => downloadJson("strategy.json", items)}>
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Artifacts" value={items.length} />
          <StatCard label="OKR Avg Progress" value={`${avgOkrProgress}%`} />
          <StatCard label="Open Risks" value={openRisks} />
          <StatCard label="ICP Profiles" value={icps.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Vision Builder</h2>
            <Input
              placeholder="Vision statement"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
            />
            <Textarea
              placeholder="Mission statement"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
            />
            <Input
              placeholder="Values (comma separated)"
              value={values}
              onChange={(e) => setValues(e.target.value)}
            />
            <Input
              placeholder="North Star Metric"
              value={northStar}
              onChange={(e) => setNorthStar(e.target.value)}
            />
            <Textarea
              placeholder="Value proposition"
              value={valueProp}
              onChange={(e) => setValueProp(e.target.value)}
            />
            <Button
              onClick={async () => {
                const data = {
                  vision,
                  mission,
                  values: values
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                  northStarMetric: northStar,
                  valueProp,
                };
                const created = await createItem({
                  title: vision || "Vision",
                  type: "vision",
                  data,
                });
                if (created) {
                  setVision("");
                  setMission("");
                  setValues("");
                  setNorthStar("");
                  setValueProp("");
                }
              }}
              disabled={!vision}
            >
              Save Vision
            </Button>
            <div className="space-y-2">
              {visions.map((v) => (
                <div key={v._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{v.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {v.data?.mission}
                      </div>
                    </div>
                    <EngineItemActions
                      item={v}
                      endpoint="/api/business/strategy"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {visions.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No vision entries yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Business Model Canvas</h2>
            <div className="grid grid-cols-1 gap-2">
              <Textarea
                placeholder="Key Partners"
                value={canvas.keyPartners}
                onChange={(e) =>
                  setCanvas((s) => ({ ...s, keyPartners: e.target.value }))
                }
              />
              <Textarea
                placeholder="Key Activities"
                value={canvas.keyActivities}
                onChange={(e) =>
                  setCanvas((s) => ({ ...s, keyActivities: e.target.value }))
                }
              />
              <Textarea
                placeholder="Key Resources"
                value={canvas.keyResources}
                onChange={(e) =>
                  setCanvas((s) => ({ ...s, keyResources: e.target.value }))
                }
              />
              <Textarea
                placeholder="Value Propositions"
                value={canvas.valuePropositions}
                onChange={(e) =>
                  setCanvas((s) => ({
                    ...s,
                    valuePropositions: e.target.value,
                  }))
                }
              />
              <Textarea
                placeholder="Customer Relationships"
                value={canvas.customerRelationships}
                onChange={(e) =>
                  setCanvas((s) => ({
                    ...s,
                    customerRelationships: e.target.value,
                  }))
                }
              />
              <Textarea
                placeholder="Channels"
                value={canvas.channels}
                onChange={(e) =>
                  setCanvas((s) => ({ ...s, channels: e.target.value }))
                }
              />
              <Textarea
                placeholder="Customer Segments"
                value={canvas.customerSegments}
                onChange={(e) =>
                  setCanvas((s) => ({
                    ...s,
                    customerSegments: e.target.value,
                  }))
                }
              />
              <Textarea
                placeholder="Cost Structure"
                value={canvas.costStructure}
                onChange={(e) =>
                  setCanvas((s) => ({ ...s, costStructure: e.target.value }))
                }
              />
              <Textarea
                placeholder="Revenue Streams"
                value={canvas.revenueStreams}
                onChange={(e) =>
                  setCanvas((s) => ({ ...s, revenueStreams: e.target.value }))
                }
              />
            </div>
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: `Canvas ${new Date().toLocaleDateString()}`,
                  type: "canvas",
                  data: canvas,
                });
                if (created) {
                  setCanvas({
                    keyPartners: "",
                    keyActivities: "",
                    keyResources: "",
                    valuePropositions: "",
                    customerRelationships: "",
                    channels: "",
                    customerSegments: "",
                    costStructure: "",
                    revenueStreams: "",
                  });
                }
              }}
              disabled={!canvas.valuePropositions}
            >
              Save Canvas
            </Button>
            <div className="space-y-2">
              {canvases.map((c) => (
                <div key={c._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.data?.valuePropositions}
                      </div>
                    </div>
                    <EngineItemActions
                      item={c}
                      endpoint="/api/business/strategy"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {canvases.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No canvases yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">ICP Profiler</h2>
            <Input
              placeholder="Persona name"
              value={icp.personaName}
              onChange={(e) => setIcp((s) => ({ ...s, personaName: e.target.value }))}
            />
            <Input
              placeholder="Industry"
              value={icp.industry}
              onChange={(e) => setIcp((s) => ({ ...s, industry: e.target.value }))}
            />
            <Input
              placeholder="Company size"
              value={icp.companySize}
              onChange={(e) => setIcp((s) => ({ ...s, companySize: e.target.value }))}
            />
            <Input
              placeholder="Role / Title"
              value={icp.role}
              onChange={(e) => setIcp((s) => ({ ...s, role: e.target.value }))}
            />
            <Textarea
              placeholder="Pains"
              value={icp.pains}
              onChange={(e) => setIcp((s) => ({ ...s, pains: e.target.value }))}
            />
            <Textarea
              placeholder="Goals"
              value={icp.goals}
              onChange={(e) => setIcp((s) => ({ ...s, goals: e.target.value }))}
            />
            <Input
              placeholder="Budget range"
              value={icp.budgetRange}
              onChange={(e) => setIcp((s) => ({ ...s, budgetRange: e.target.value }))}
            />
            <Textarea
              placeholder="Decision criteria"
              value={icp.decisionCriteria}
              onChange={(e) =>
                setIcp((s) => ({ ...s, decisionCriteria: e.target.value }))
              }
            />
            <Textarea
              placeholder="Acquisition channels"
              value={icp.acquisitionChannels}
              onChange={(e) =>
                setIcp((s) => ({ ...s, acquisitionChannels: e.target.value }))
              }
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: icp.personaName || "ICP Profile",
                  type: "icp",
                  data: icp,
                });
                if (created) {
                  setIcp({
                    personaName: "",
                    industry: "",
                    companySize: "",
                    role: "",
                    pains: "",
                    goals: "",
                    budgetRange: "",
                    decisionCriteria: "",
                    acquisitionChannels: "",
                  });
                }
              }}
              disabled={!icp.personaName}
            >
              Save ICP
            </Button>
            <div className="space-y-2">
              {icps.map((i) => (
                <div key={i._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{i.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {i.data?.industry} • {i.data?.role}
                      </div>
                    </div>
                    <EngineItemActions
                      item={i}
                      endpoint="/api/business/strategy"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {icps.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No ICP profiles yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">OKR Tracker</h2>
            <Input
              placeholder="Objective"
              value={okrObjective}
              onChange={(e) => setOkrObjective(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder="Cadence (e.g., Quarterly)"
                value={okrCadence}
                onChange={(e) => setOkrCadence(e.target.value)}
              />
              <Input
                type="date"
                value={okrDueDate}
                onChange={(e) => setOkrDueDate(e.target.value)}
              />
            </div>

            <div className="p-3 border rounded-md space-y-2">
              <div className="font-medium text-sm">Key Results</div>
              <Input
                placeholder="Key result"
                value={krTitle}
                onChange={(e) => setKrTitle(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Target"
                  value={krTarget}
                  onChange={(e) => setKrTarget(Number(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="Current"
                  value={krCurrent}
                  onChange={(e) => setKrCurrent(Number(e.target.value))}
                />
              </div>
              <Button variant="outline" onClick={addKeyResult} disabled={!krTitle}>
                Add Key Result
              </Button>
              <div className="space-y-2">
                {keyResults.map((kr, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    {kr.title} — {kr.current}/{kr.target}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={async () => {
                const progress = okrProgress(keyResults);
                const created = await createItem({
                  title: okrObjective || "OKR",
                  type: "okr",
                  data: {
                    objective: okrObjective,
                    cadence: okrCadence,
                    dueDate: okrDueDate,
                    keyResults,
                    progress,
                  },
                });
                if (created) {
                  setOkrObjective("");
                  setOkrCadence("Quarterly");
                  setOkrDueDate("");
                  setKeyResults([]);
                }
              }}
              disabled={!okrObjective || keyResults.length === 0}
            >
              Save OKR
            </Button>
            <div className="space-y-2">
              {okrs.map((o) => (
                <div key={o._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{o.data?.objective}</div>
                      <div className="text-xs text-muted-foreground">
                        Progress: {o.data?.progress || 0}%
                      </div>
                    </div>
                    <EngineItemActions
                      item={o}
                      endpoint="/api/business/strategy"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {okrs.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No OKRs yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-3">
          <h2 className="font-semibold">Strategic Risk Scanner</h2>
          <Input
            placeholder="Risk title"
            value={riskTitle}
            onChange={(e) => setRiskTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              type="number"
              placeholder="Impact (1-5)"
              value={riskImpact}
              onChange={(e) => setRiskImpact(Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Probability (1-5)"
              value={riskProbability}
              onChange={(e) => setRiskProbability(Number(e.target.value))}
            />
            <Input
              placeholder="Status"
              value={riskStatus}
              onChange={(e) => setRiskStatus(e.target.value)}
            />
          </div>
          <Textarea
            placeholder="Mitigation plan"
            value={riskMitigation}
            onChange={(e) => setRiskMitigation(e.target.value)}
          />
          <Button
            onClick={async () => {
              const score = Number(riskImpact || 0) * Number(riskProbability || 0);
              const created = await createItem({
                title: riskTitle,
                type: "risk",
                data: {
                  impact: riskImpact,
                  probability: riskProbability,
                  mitigation: riskMitigation,
                  status: riskStatus,
                  score,
                },
              });
              if (created) {
                setRiskTitle("");
                setRiskImpact(3);
                setRiskProbability(3);
                setRiskMitigation("");
                setRiskStatus("open");
              }
            }}
            disabled={!riskTitle}
          >
            Save Risk
          </Button>
          <div className="space-y-2">
            {risks.map((r) => (
              <div key={r._id} className="p-3 border rounded-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Score: {r.data?.score} • Status: {r.data?.status}
                    </div>
                  </div>
                  <EngineItemActions
                    item={r}
                    endpoint="/api/business/strategy"
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                </div>
              </div>
            ))}
            {risks.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No risks logged.
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
