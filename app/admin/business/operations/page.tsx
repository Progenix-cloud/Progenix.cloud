"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, printPage } from "@/lib/export-client";
import EngineItemActions from "@/components/business/engine-item-actions";
import ProjectFilter from "@/components/business/project-filter";

type OperationsItem = {
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

export default function OperationsPage() {
  const [items, setItems] = useState<OperationsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const [sop, setSop] = useState({
    title: "",
    objective: "",
    owner: "",
  });
  const [sopStep, setSopStep] = useState("");
  const [sopSteps, setSopSteps] = useState<string[]>([]);

  const [workflow, setWorkflow] = useState({
    title: "",
    trigger: "",
    automationNotes: "",
  });
  const [workflowStep, setWorkflowStep] = useState({
    name: "",
    owner: "",
    etaHours: 2,
  });
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);

  const [role, setRole] = useState({
    title: "",
    reportsTo: "",
    responsibilities: "",
  });

  const [efficiency, setEfficiency] = useState({
    processName: "",
    cycleTimeHours: 8,
    throughputPerWeek: 10,
    errorRate: 2,
  });

  const load = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    try {
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const res = await fetch(`/api/business/operations${qp}`, {
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

  const createItem = async (payload: Partial<OperationsItem>) => {
    const user = getUser();
    if (!user?._id) {
      alert("Missing user session");
      return null;
    }
    const res = await fetch("/api/business/operations", {
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
      return json.data as OperationsItem;
    }
    alert(json.error || "Failed to create");
    return null;
  };

  const handleUpdated = (updated: OperationsItem) => {
    setItems((s) => s.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleDeleted = (id: string) => {
    setItems((s) => s.filter((i) => i._id !== id));
  };

  const addSopStep = () => {
    if (!sopStep) return;
    setSopSteps((s) => [...s, sopStep]);
    setSopStep("");
  };

  const addWorkflowStep = () => {
    if (!workflowStep.name) return;
    setWorkflowSteps((s) => [...s, workflowStep]);
    setWorkflowStep({ name: "", owner: "", etaHours: 2 });
  };

  const efficiencyScore = () => {
    const cycle = Number(efficiency.cycleTimeHours || 0) || 0;
    const throughput = Number(efficiency.throughputPerWeek || 0) || 0;
    const errorRate = Number(efficiency.errorRate || 0) || 0;
    if (cycle === 0) return 0;
    const base = throughput / cycle;
    return Math.round(base * (1 - errorRate / 100) * 100) / 100;
  };

  const sops = items.filter((i) => i.type === "sop");
  const workflows = items.filter((i) => i.type === "workflow");
  const roles = items.filter((i) => i.type === "org_role");
  const efficiencies = items.filter((i) => i.type === "efficiency");

  const avgEfficiency = efficiencies.length
    ? Math.round(
        (efficiencies.reduce(
          (sum, e) => sum + (Number(e.data?.score || 0) || 0),
          0
        ) /
          efficiencies.length) *
          100
      ) / 100
    : 0;

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Operations & Systems Engine</h1>
            <p className="text-muted-foreground mt-2">
              SOPs, workflows, org roles, efficiency tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={() => downloadJson("operations.json", items)}>
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="SOPs" value={sops.length} />
          <StatCard label="Workflows" value={workflows.length} />
          <StatCard label="Roles" value={roles.length} />
          <StatCard label="Avg Efficiency" value={avgEfficiency} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">SOP Builder</h2>
            <Input
              placeholder="SOP title"
              value={sop.title}
              onChange={(e) => setSop((s) => ({ ...s, title: e.target.value }))}
            />
            <Textarea
              placeholder="Objective"
              value={sop.objective}
              onChange={(e) =>
                setSop((s) => ({ ...s, objective: e.target.value }))
              }
            />
            <Input
              placeholder="Owner"
              value={sop.owner}
              onChange={(e) => setSop((s) => ({ ...s, owner: e.target.value }))}
            />
            <div className="p-3 border rounded-md space-y-2">
              <div className="text-sm font-medium">Steps</div>
              <Input
                placeholder="Step description"
                value={sopStep}
                onChange={(e) => setSopStep(e.target.value)}
              />
              <Button variant="outline" onClick={addSopStep} disabled={!sopStep}>
                Add Step
              </Button>
              <div className="space-y-1">
                {sopSteps.map((s, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    {idx + 1}. {s}
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: sop.title || "SOP",
                  type: "sop",
                  data: { ...sop, steps: sopSteps },
                });
                if (created) {
                  setSop({ title: "", objective: "", owner: "" });
                  setSopSteps([]);
                }
              }}
              disabled={!sop.title}
            >
              Save SOP
            </Button>
            <div className="space-y-2">
              {sops.map((s) => (
                <div key={s._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Steps: {s.data?.steps?.length || 0}
                      </div>
                    </div>
                    <EngineItemActions
                      item={s}
                      endpoint="/api/business/operations"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {sops.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No SOPs yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Workflow Visualizer</h2>
            <Input
              placeholder="Workflow name"
              value={workflow.title}
              onChange={(e) =>
                setWorkflow((s) => ({ ...s, title: e.target.value }))
              }
            />
            <Input
              placeholder="Trigger"
              value={workflow.trigger}
              onChange={(e) =>
                setWorkflow((s) => ({ ...s, trigger: e.target.value }))
              }
            />
            <Textarea
              placeholder="Automation notes"
              value={workflow.automationNotes}
              onChange={(e) =>
                setWorkflow((s) => ({ ...s, automationNotes: e.target.value }))
              }
            />
            <div className="p-3 border rounded-md space-y-2">
              <div className="text-sm font-medium">Steps</div>
              <Input
                placeholder="Step name"
                value={workflowStep.name}
                onChange={(e) =>
                  setWorkflowStep((s) => ({ ...s, name: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Owner"
                  value={workflowStep.owner}
                  onChange={(e) =>
                    setWorkflowStep((s) => ({ ...s, owner: e.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="ETA (hours)"
                  value={workflowStep.etaHours}
                  onChange={(e) =>
                    setWorkflowStep((s) => ({
                      ...s,
                      etaHours: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <Button variant="outline" onClick={addWorkflowStep} disabled={!workflowStep.name}>
                Add Step
              </Button>
              <div className="space-y-1">
                {workflowSteps.map((s, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    {s.name} • {s.owner} • {s.etaHours}h
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: workflow.title || "Workflow",
                  type: "workflow",
                  data: { ...workflow, steps: workflowSteps },
                });
                if (created) {
                  setWorkflow({ title: "", trigger: "", automationNotes: "" });
                  setWorkflowSteps([]);
                }
              }}
              disabled={!workflow.title}
            >
              Save Workflow
            </Button>
            <div className="space-y-2">
              {workflows.map((w) => (
                <div key={w._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{w.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Steps: {w.data?.steps?.length || 0}
                      </div>
                    </div>
                    <EngineItemActions
                      item={w}
                      endpoint="/api/business/operations"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {workflows.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No workflows yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Org Structure Designer</h2>
            <Input
              placeholder="Role title"
              value={role.title}
              onChange={(e) => setRole((s) => ({ ...s, title: e.target.value }))}
            />
            <Input
              placeholder="Reports to"
              value={role.reportsTo}
              onChange={(e) =>
                setRole((s) => ({ ...s, reportsTo: e.target.value }))
              }
            />
            <Textarea
              placeholder="Responsibilities"
              value={role.responsibilities}
              onChange={(e) =>
                setRole((s) => ({ ...s, responsibilities: e.target.value }))
              }
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: role.title || "Role",
                  type: "org_role",
                  data: role,
                });
                if (created) {
                  setRole({ title: "", reportsTo: "", responsibilities: "" });
                }
              }}
              disabled={!role.title}
            >
              Save Role
            </Button>
            <div className="space-y-2">
              {roles.map((r) => (
                <div key={r._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Reports to: {r.data?.reportsTo || "—"}
                      </div>
                    </div>
                    <EngineItemActions
                      item={r}
                      endpoint="/api/business/operations"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No roles yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Efficiency Heatmap</h2>
            <Input
              placeholder="Process name"
              value={efficiency.processName}
              onChange={(e) =>
                setEfficiency((s) => ({ ...s, processName: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Cycle time (hours)"
                value={efficiency.cycleTimeHours}
                onChange={(e) =>
                  setEfficiency((s) => ({
                    ...s,
                    cycleTimeHours: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Throughput / week"
                value={efficiency.throughputPerWeek}
                onChange={(e) =>
                  setEfficiency((s) => ({
                    ...s,
                    throughputPerWeek: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Error rate %"
                value={efficiency.errorRate}
                onChange={(e) =>
                  setEfficiency((s) => ({
                    ...s,
                    errorRate: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Efficiency score: {efficiencyScore()}
            </div>
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: efficiency.processName || "Efficiency",
                  type: "efficiency",
                  data: { ...efficiency, score: efficiencyScore() },
                });
                if (created) {
                  setEfficiency({
                    processName: "",
                    cycleTimeHours: 8,
                    throughputPerWeek: 10,
                    errorRate: 2,
                  });
                }
              }}
              disabled={!efficiency.processName}
            >
              Save Efficiency
            </Button>
            <div className="space-y-2">
              {efficiencies.map((e) => (
                <div key={e._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Score: {e.data?.score}
                      </div>
                    </div>
                    <EngineItemActions
                      item={e}
                      endpoint="/api/business/operations"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {efficiencies.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No efficiency entries yet.
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
