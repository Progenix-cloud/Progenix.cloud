"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, downloadCsv, printPage } from "@/lib/export-client";
import EngineItemActions from "@/components/business/engine-item-actions";
import ProjectFilter from "@/components/business/project-filter";

type LegalItem = {
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

export default function LegalPage() {
  const [items, setItems] = useState<LegalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const [agreement, setAgreement] = useState({
    title: "",
    agreementType: "",
    parties: "",
    effectiveDate: "",
    renewalDate: "",
    status: "draft",
  });

  const [cap, setCap] = useState({
    shareholder: "",
    shares: 1000,
    shareClass: "common",
    vesting: "",
    notes: "",
  });

  const [compliance, setCompliance] = useState({
    title: "",
    owner: "",
    dueDate: "",
    status: "open",
  });

  const [risk, setRisk] = useState({
    title: "",
    impact: 3,
    probability: 3,
    mitigation: "",
    status: "open",
  });

  const load = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    try {
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const res = await fetch(`/api/business/legal${qp}`, {
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

  const createItem = async (payload: Partial<LegalItem>) => {
    const user = getUser();
    if (!user?._id) {
      alert("Missing user session");
      return null;
    }
    const res = await fetch("/api/business/legal", {
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
      return json.data as LegalItem;
    }
    alert(json.error || "Failed to create");
    return null;
  };

  const handleUpdated = (updated: LegalItem) => {
    setItems((s) => s.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleDeleted = (id: string) => {
    setItems((s) => s.filter((i) => i._id !== id));
  };

  const agreements = items.filter((i) => i.type === "agreement");
  const capTable = items.filter((i) => i.type === "cap_table");
  const complianceItems = items.filter((i) => i.type === "compliance");
  const risks = items.filter((i) => i.type === "risk");

  const totalShares = capTable.reduce(
    (sum, c) => sum + (Number(c.data?.shares || 0) || 0),
    0
  );

  const openCompliance = complianceItems.filter(
    (c) => c.data?.status !== "closed"
  ).length;
  const highRisks = risks.filter((r) => (r.data?.score || 0) >= 12).length;

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Legal & Risk Engine</h1>
            <p className="text-muted-foreground mt-2">
              Agreements, cap table, compliance, risk tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={() => downloadJson("legal.json", items)}>
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "cap-table.csv",
                  capTable.map((c) => ({
                    shareholder: c.data?.shareholder,
                    shares: c.data?.shares,
                    shareClass: c.data?.shareClass,
                    vesting: c.data?.vesting,
                    ownershipPct: totalShares
                      ? (
                          (Number(c.data?.shares || 0) / totalShares) *
                          100
                        ).toFixed(2)
                      : "0",
                  }))
                )
              }
            >
              Export Cap Table CSV
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Agreements" value={agreements.length} />
          <StatCard label="Cap Table Entries" value={capTable.length} />
          <StatCard label="Open Compliance" value={openCompliance} />
          <StatCard label="High Risks" value={highRisks} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Agreements</h2>
            <Input
              placeholder="Agreement title"
              value={agreement.title}
              onChange={(e) =>
                setAgreement((s) => ({ ...s, title: e.target.value }))
              }
            />
            <Input
              placeholder="Type (NDA, IP, Founder)"
              value={agreement.agreementType}
              onChange={(e) =>
                setAgreement((s) => ({ ...s, agreementType: e.target.value }))
              }
            />
            <Input
              placeholder="Parties"
              value={agreement.parties}
              onChange={(e) =>
                setAgreement((s) => ({ ...s, parties: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={agreement.effectiveDate}
                onChange={(e) =>
                  setAgreement((s) => ({
                    ...s,
                    effectiveDate: e.target.value,
                  }))
                }
              />
              <Input
                type="date"
                value={agreement.renewalDate}
                onChange={(e) =>
                  setAgreement((s) => ({
                    ...s,
                    renewalDate: e.target.value,
                  }))
                }
              />
            </div>
            <Input
              placeholder="Status"
              value={agreement.status}
              onChange={(e) =>
                setAgreement((s) => ({ ...s, status: e.target.value }))
              }
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: agreement.title || "Agreement",
                  type: "agreement",
                  data: agreement,
                });
                if (created) {
                  setAgreement({
                    title: "",
                    agreementType: "",
                    parties: "",
                    effectiveDate: "",
                    renewalDate: "",
                    status: "draft",
                  });
                }
              }}
              disabled={!agreement.title}
            >
              Save Agreement
            </Button>
            <div className="space-y-2">
              {agreements.map((a) => (
                <div key={a._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.data?.agreementType} • {a.data?.status}
                      </div>
                    </div>
                    <EngineItemActions
                      item={a}
                      endpoint="/api/business/legal"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {agreements.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No agreements yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Cap Table</h2>
            <Input
              placeholder="Shareholder"
              value={cap.shareholder}
              onChange={(e) => setCap((s) => ({ ...s, shareholder: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Shares"
                value={cap.shares}
                onChange={(e) =>
                  setCap((s) => ({ ...s, shares: Number(e.target.value) }))
                }
              />
              <Input
                placeholder="Share class"
                value={cap.shareClass}
                onChange={(e) =>
                  setCap((s) => ({ ...s, shareClass: e.target.value }))
                }
              />
            </div>
            <Input
              placeholder="Vesting"
              value={cap.vesting}
              onChange={(e) => setCap((s) => ({ ...s, vesting: e.target.value }))}
            />
            <Textarea
              placeholder="Notes"
              value={cap.notes}
              onChange={(e) => setCap((s) => ({ ...s, notes: e.target.value }))}
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: cap.shareholder || "Cap Table Entry",
                  type: "cap_table",
                  data: cap,
                });
                if (created) {
                  setCap({
                    shareholder: "",
                    shares: 1000,
                    shareClass: "common",
                    vesting: "",
                    notes: "",
                  });
                }
              }}
              disabled={!cap.shareholder}
            >
              Save Cap Table Entry
            </Button>
            <div className="space-y-2">
              {capTable.map((c) => {
                const shares = Number(c.data?.shares || 0) || 0;
                const pct = totalShares ? (shares / totalShares) * 100 : 0;
                return (
                  <div key={c._id} className="p-3 border rounded-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {shares} shares • {pct.toFixed(2)}%
                        </div>
                      </div>
                      <EngineItemActions
                        item={c}
                        endpoint="/api/business/legal"
                        onUpdated={handleUpdated}
                        onDeleted={handleDeleted}
                      />
                    </div>
                  </div>
                );
              })}
              {capTable.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No cap table entries yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Compliance Checklist</h2>
            <Input
              placeholder="Checklist item"
              value={compliance.title}
              onChange={(e) =>
                setCompliance((s) => ({ ...s, title: e.target.value }))
              }
            />
            <Input
              placeholder="Owner"
              value={compliance.owner}
              onChange={(e) =>
                setCompliance((s) => ({ ...s, owner: e.target.value }))
              }
            />
            <Input
              type="date"
              value={compliance.dueDate}
              onChange={(e) =>
                setCompliance((s) => ({ ...s, dueDate: e.target.value }))
              }
            />
            <Input
              placeholder="Status"
              value={compliance.status}
              onChange={(e) =>
                setCompliance((s) => ({ ...s, status: e.target.value }))
              }
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: compliance.title || "Compliance Item",
                  type: "compliance",
                  data: compliance,
                });
                if (created) {
                  setCompliance({
                    title: "",
                    owner: "",
                    dueDate: "",
                    status: "open",
                  });
                }
              }}
              disabled={!compliance.title}
            >
              Save Compliance Item
            </Button>
            <div className="space-y-2">
              {complianceItems.map((c) => (
                <div key={c._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Status: {c.data?.status}
                      </div>
                    </div>
                    <EngineItemActions
                      item={c}
                      endpoint="/api/business/legal"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {complianceItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No compliance items yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Risk Alert Engine</h2>
            <Input
              placeholder="Risk title"
              value={risk.title}
              onChange={(e) => setRisk((s) => ({ ...s, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Impact (1-5)"
                value={risk.impact}
                onChange={(e) =>
                  setRisk((s) => ({ ...s, impact: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Probability (1-5)"
                value={risk.probability}
                onChange={(e) =>
                  setRisk((s) => ({
                    ...s,
                    probability: Number(e.target.value),
                  }))
                }
              />
              <Input
                placeholder="Status"
                value={risk.status}
                onChange={(e) => setRisk((s) => ({ ...s, status: e.target.value }))}
              />
            </div>
            <Textarea
              placeholder="Mitigation plan"
              value={risk.mitigation}
              onChange={(e) =>
                setRisk((s) => ({ ...s, mitigation: e.target.value }))
              }
            />
            <Button
              onClick={async () => {
                const score = Number(risk.impact || 0) * Number(risk.probability || 0);
                const created = await createItem({
                  title: risk.title || "Risk",
                  type: "risk",
                  data: { ...risk, score },
                });
                if (created) {
                  setRisk({
                    title: "",
                    impact: 3,
                    probability: 3,
                    mitigation: "",
                    status: "open",
                  });
                }
              }}
              disabled={!risk.title}
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
                        Score: {r.data?.score} • {r.data?.status}
                      </div>
                    </div>
                    <EngineItemActions
                      item={r}
                      endpoint="/api/business/legal"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {risks.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No risks yet.
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
