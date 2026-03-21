"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, printPage } from "@/lib/export-client";
import EngineItemActions from "@/components/business/engine-item-actions";
import ProjectFilter from "@/components/business/project-filter";

type ProductItem = {
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

export default function ProductPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const [mvp, setMvp] = useState({
    problem: "",
    solution: "",
    targetUsers: "",
    mustHaveFeatures: "",
    validationMethod: "",
    urgency: 3,
    willingnessToPay: 3,
    reachability: 3,
    differentiation: 3,
  });

  const [featureTitle, setFeatureTitle] = useState("");
  const [reach, setReach] = useState(1000);
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(0.8);
  const [effort, setEffort] = useState(1);

  const [sprint, setSprint] = useState({
    name: "",
    startDate: "",
    endDate: "",
    goals: "",
    capacityHours: 40,
    plannedHours: 20,
  });

  const [alignment, setAlignment] = useState({
    feature: "",
    businessGoal: "",
    metric: "",
    alignmentScore: 3,
    notes: "",
  });

  const load = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    try {
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const res = await fetch(`/api/business/product${qp}`, {
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

  const createItem = async (payload: Partial<ProductItem>) => {
    const user = getUser();
    if (!user?._id) {
      alert("Missing user session");
      return null;
    }
    const res = await fetch("/api/business/product", {
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
      return json.data as ProductItem;
    }
    alert(json.error || "Failed to create");
    return null;
  };

  const handleUpdated = (updated: ProductItem) => {
    setItems((s) => s.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleDeleted = (id: string) => {
    setItems((s) => s.filter((i) => i._id !== id));
  };

  const featureScore = () => {
    const r = Number(reach || 0);
    const i = Number(impact || 0);
    const c = Number(confidence || 0);
    const e = Number(effort || 1) || 1;
    const score = (r * i * c) / e;
    return Math.round(score * 100) / 100;
  };

  const mvpScore = () => {
    const avg =
      (Number(mvp.urgency || 0) +
        Number(mvp.willingnessToPay || 0) +
        Number(mvp.reachability || 0) +
        Number(mvp.differentiation || 0)) /
      4;
    return Math.round(avg * 20);
  };

  const sprintUtilization = () => {
    const cap = Number(sprint.capacityHours || 0) || 0;
    const planned = Number(sprint.plannedHours || 0) || 0;
    if (cap === 0) return 0;
    return Math.round((planned / cap) * 100);
  };

  const mvps = items.filter((i) => i.type === "mvp");
  const features = items.filter((i) => i.type === "feature");
  const sprints = items.filter((i) => i.type === "sprint");
  const alignments = items.filter((i) => i.type === "alignment");

  const avgRice = features.length
    ? Math.round(
        (features.reduce((sum, f) => sum + (f.data?.score || 0), 0) /
          features.length) *
          100
      ) / 100
    : 0;

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Product & Execution Engine</h1>
            <p className="text-muted-foreground mt-2">
              MVP validation, feature scoring, sprint planning, alignment.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={() => downloadJson("product.json", items)}>
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="MVPs" value={mvps.length} />
          <StatCard label="Features" value={features.length} hint={`Avg RICE ${avgRice}`} />
          <StatCard label="Sprints" value={sprints.length} />
          <StatCard label="Alignments" value={alignments.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">MVP Validator</h2>
            <Textarea
              placeholder="Problem"
              value={mvp.problem}
              onChange={(e) => setMvp((s) => ({ ...s, problem: e.target.value }))}
            />
            <Textarea
              placeholder="Solution"
              value={mvp.solution}
              onChange={(e) => setMvp((s) => ({ ...s, solution: e.target.value }))}
            />
            <Input
              placeholder="Target users"
              value={mvp.targetUsers}
              onChange={(e) => setMvp((s) => ({ ...s, targetUsers: e.target.value }))}
            />
            <Textarea
              placeholder="Must-have features"
              value={mvp.mustHaveFeatures}
              onChange={(e) =>
                setMvp((s) => ({ ...s, mustHaveFeatures: e.target.value }))
              }
            />
            <Input
              placeholder="Validation method"
              value={mvp.validationMethod}
              onChange={(e) =>
                setMvp((s) => ({ ...s, validationMethod: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Urgency (1-5)"
                value={mvp.urgency}
                onChange={(e) =>
                  setMvp((s) => ({ ...s, urgency: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Willingness to pay (1-5)"
                value={mvp.willingnessToPay}
                onChange={(e) =>
                  setMvp((s) => ({
                    ...s,
                    willingnessToPay: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Reachability (1-5)"
                value={mvp.reachability}
                onChange={(e) =>
                  setMvp((s) => ({ ...s, reachability: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Differentiation (1-5)"
                value={mvp.differentiation}
                onChange={(e) =>
                  setMvp((s) => ({
                    ...s,
                    differentiation: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              MVP Score: {mvpScore()} / 100
            </div>
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: mvp.problem || "MVP",
                  type: "mvp",
                  data: { ...mvp, score: mvpScore() },
                });
                if (created) {
                  setMvp({
                    problem: "",
                    solution: "",
                    targetUsers: "",
                    mustHaveFeatures: "",
                    validationMethod: "",
                    urgency: 3,
                    willingnessToPay: 3,
                    reachability: 3,
                    differentiation: 3,
                  });
                }
              }}
              disabled={!mvp.problem}
            >
              Save MVP
            </Button>
            <div className="space-y-2">
              {mvps.map((m) => (
                <div key={m._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{m.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Score: {m.data?.score}
                      </div>
                    </div>
                    <EngineItemActions
                      item={m}
                      endpoint="/api/business/product"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {mvps.length === 0 && (
                <div className="text-sm text-muted-foreground">No MVPs yet.</div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Feature Scoring (RICE)</h2>
            <Input
              placeholder="Feature title"
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Reach"
                value={reach}
                onChange={(e) => setReach(Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Impact (1-10)"
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
              />
              <Input
                type="number"
                step="0.05"
                placeholder="Confidence (0-1)"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
              />
              <Input
                type="number"
                step="0.1"
                placeholder="Effort"
                value={effort}
                onChange={(e) => setEffort(Number(e.target.value))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              RICE Score: {featureScore()}
            </div>
            <Button
              onClick={async () => {
                const score = featureScore();
                const created = await createItem({
                  title: featureTitle,
                  type: "feature",
                  data: {
                    reach,
                    impact,
                    confidence,
                    effort,
                    score,
                  },
                });
                if (created) {
                  setFeatureTitle("");
                  setReach(1000);
                  setImpact(5);
                  setConfidence(0.8);
                  setEffort(1);
                }
              }}
              disabled={!featureTitle}
            >
              Save Feature
            </Button>
            <div className="space-y-2">
              {features.map((f) => (
                <div key={f._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{f.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Score: {f.data?.score} • Reach {f.data?.reach}
                      </div>
                    </div>
                    <EngineItemActions
                      item={f}
                      endpoint="/api/business/product"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {features.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No features scored yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Sprint Planner</h2>
            <Input
              placeholder="Sprint name"
              value={sprint.name}
              onChange={(e) => setSprint((s) => ({ ...s, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={sprint.startDate}
                onChange={(e) =>
                  setSprint((s) => ({ ...s, startDate: e.target.value }))
                }
              />
              <Input
                type="date"
                value={sprint.endDate}
                onChange={(e) =>
                  setSprint((s) => ({ ...s, endDate: e.target.value }))
                }
              />
            </div>
            <Textarea
              placeholder="Goals"
              value={sprint.goals}
              onChange={(e) => setSprint((s) => ({ ...s, goals: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Capacity hours"
                value={sprint.capacityHours}
                onChange={(e) =>
                  setSprint((s) => ({
                    ...s,
                    capacityHours: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Planned hours"
                value={sprint.plannedHours}
                onChange={(e) =>
                  setSprint((s) => ({
                    ...s,
                    plannedHours: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Utilization: {sprintUtilization()}%
            </div>
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: sprint.name || "Sprint",
                  type: "sprint",
                  data: {
                    ...sprint,
                    utilization: sprintUtilization(),
                  },
                });
                if (created) {
                  setSprint({
                    name: "",
                    startDate: "",
                    endDate: "",
                    goals: "",
                    capacityHours: 40,
                    plannedHours: 20,
                  });
                }
              }}
              disabled={!sprint.name}
            >
              Save Sprint
            </Button>
            <div className="space-y-2">
              {sprints.map((s) => (
                <div key={s._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Utilization: {s.data?.utilization}%
                      </div>
                    </div>
                    <EngineItemActions
                      item={s}
                      endpoint="/api/business/product"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {sprints.length === 0 && (
                <div className="text-sm text-muted-foreground">No sprints yet.</div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Tech–Business Alignment</h2>
            <Input
              placeholder="Feature"
              value={alignment.feature}
              onChange={(e) =>
                setAlignment((s) => ({ ...s, feature: e.target.value }))
              }
            />
            <Input
              placeholder="Business goal"
              value={alignment.businessGoal}
              onChange={(e) =>
                setAlignment((s) => ({ ...s, businessGoal: e.target.value }))
              }
            />
            <Input
              placeholder="Success metric"
              value={alignment.metric}
              onChange={(e) =>
                setAlignment((s) => ({ ...s, metric: e.target.value }))
              }
            />
            <Input
              type="number"
              placeholder="Alignment score (1-5)"
              value={alignment.alignmentScore}
              onChange={(e) =>
                setAlignment((s) => ({
                  ...s,
                  alignmentScore: Number(e.target.value),
                }))
              }
            />
            <Textarea
              placeholder="Notes"
              value={alignment.notes}
              onChange={(e) =>
                setAlignment((s) => ({ ...s, notes: e.target.value }))
              }
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: alignment.feature || "Alignment",
                  type: "alignment",
                  data: alignment,
                });
                if (created) {
                  setAlignment({
                    feature: "",
                    businessGoal: "",
                    metric: "",
                    alignmentScore: 3,
                    notes: "",
                  });
                }
              }}
              disabled={!alignment.feature}
            >
              Save Alignment
            </Button>
            <div className="space-y-2">
              {alignments.map((a) => (
                <div key={a._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Score: {a.data?.alignmentScore} • {a.data?.businessGoal}
                      </div>
                    </div>
                    <EngineItemActions
                      item={a}
                      endpoint="/api/business/product"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {alignments.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No alignment entries yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </div>
    </ProtectedBusiness>
  );
}
