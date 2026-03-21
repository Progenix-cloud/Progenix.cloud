"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, downloadCsv, printPage } from "@/lib/export-client";
import { formatCurrency } from "@/lib/helpers";
import EngineItemActions from "@/components/business/engine-item-actions";
import ProjectFilter from "@/components/business/project-filter";

type FundraisingItem = {
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

export default function FundraisingPage() {
  const [items, setItems] = useState<FundraisingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const [pitch, setPitch] = useState({
    title: "",
    problem: "",
    solution: "",
    market: "",
    traction: "",
    businessModel: "",
    team: "",
    ask: "",
  });

  const [valuation, setValuation] = useState({
    title: "",
    preMoney: 1000000,
    investment: 250000,
    optionPoolPct: 10,
  });

  const [investor, setInvestor] = useState({
    name: "",
    firm: "",
    role: "",
    email: "",
    phone: "",
    stage: "seed",
    checkSize: "",
    thesis: "",
    lastContact: "",
    nextStep: "",
    status: "active",
    notes: "",
  });

  const [deal, setDeal] = useState({
    title: "",
    stage: "intro",
    amount: 100000,
    probability: 20,
    expectedCloseDate: "",
    notes: "",
  });

  const load = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    try {
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const res = await fetch(`/api/business/fundraising${qp}`, {
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

  const createItem = async (payload: Partial<FundraisingItem>) => {
    const user = getUser();
    if (!user?._id) {
      alert("Missing user session");
      return null;
    }
    const res = await fetch("/api/business/fundraising", {
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
      return json.data as FundraisingItem;
    }
    alert(json.error || "Failed to create");
    return null;
  };

  const handleUpdated = (updated: FundraisingItem) => {
    setItems((s) => s.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleDeleted = (id: string) => {
    setItems((s) => s.filter((i) => i._id !== id));
  };

  const valuationMetrics = () => {
    const postMoney = valuation.preMoney + valuation.investment;
    const dilution = postMoney > 0 ? (valuation.investment / postMoney) * 100 : 0;
    const effectiveFounder = 100 - dilution - valuation.optionPoolPct;
    return { postMoney, dilution, effectiveFounder };
  };

  const dealMetrics = () => {
    const weighted = deal.amount * (deal.probability / 100);
    return { weighted };
  };

  const pitches = items.filter((i) => i.type === "pitch");
  const valuations = items.filter((i) => i.type === "valuation");
  const investors = items.filter((i) => i.type === "investor");
  const deals = items.filter((i) => i.type === "deal");

  const pipelineTotal = deals.reduce(
    (sum, d) => sum + (Number(d.data?.amount || 0) || 0),
    0
  );
  const weightedPipeline = deals.reduce(
    (sum, d) => sum + (Number(d.data?.weighted || 0) || 0),
    0
  );

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Investor & Fundraising Engine</h1>
            <p className="text-muted-foreground mt-2">
              Pitch, valuation, investor CRM, fundraising tracker.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={() => downloadJson("fundraising.json", items)}>
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "investor-crm.csv",
                  investors.map((i) => ({
                    name: i.data?.name,
                    firm: i.data?.firm,
                    stage: i.data?.stage,
                    checkSize: i.data?.checkSize,
                    email: i.data?.email,
                    phone: i.data?.phone,
                    status: i.data?.status,
                    nextStep: i.data?.nextStep,
                    lastContact: i.data?.lastContact,
                  }))
                )
              }
            >
              Export CRM CSV
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Pitches" value={pitches.length} />
          <StatCard label="Investors" value={investors.length} />
          <StatCard label="Pipeline" value={formatCurrency(pipelineTotal)} />
          <StatCard label="Weighted" value={formatCurrency(weightedPipeline)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Pitch Builder</h2>
            <Input
              placeholder="Pitch title"
              value={pitch.title}
              onChange={(e) => setPitch((s) => ({ ...s, title: e.target.value }))}
            />
            <Textarea
              placeholder="Problem"
              value={pitch.problem}
              onChange={(e) => setPitch((s) => ({ ...s, problem: e.target.value }))}
            />
            <Textarea
              placeholder="Solution"
              value={pitch.solution}
              onChange={(e) => setPitch((s) => ({ ...s, solution: e.target.value }))}
            />
            <Textarea
              placeholder="Market"
              value={pitch.market}
              onChange={(e) => setPitch((s) => ({ ...s, market: e.target.value }))}
            />
            <Textarea
              placeholder="Traction"
              value={pitch.traction}
              onChange={(e) => setPitch((s) => ({ ...s, traction: e.target.value }))}
            />
            <Textarea
              placeholder="Business model"
              value={pitch.businessModel}
              onChange={(e) =>
                setPitch((s) => ({ ...s, businessModel: e.target.value }))
              }
            />
            <Textarea
              placeholder="Team"
              value={pitch.team}
              onChange={(e) => setPitch((s) => ({ ...s, team: e.target.value }))}
            />
            <Textarea
              placeholder="Ask"
              value={pitch.ask}
              onChange={(e) => setPitch((s) => ({ ...s, ask: e.target.value }))}
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: pitch.title || "Pitch",
                  type: "pitch",
                  data: pitch,
                });
                if (created) {
                  setPitch({
                    title: "",
                    problem: "",
                    solution: "",
                    market: "",
                    traction: "",
                    businessModel: "",
                    team: "",
                    ask: "",
                  });
                }
              }}
              disabled={!pitch.title}
            >
              Save Pitch
            </Button>
            <div className="space-y-2">
              {pitches.map((p) => (
                <div key={p._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.data?.market}
                      </div>
                    </div>
                    <EngineItemActions
                      item={p}
                      endpoint="/api/business/fundraising"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {pitches.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No pitches yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Valuation Calculator</h2>
            <Input
              placeholder="Scenario title"
              value={valuation.title}
              onChange={(e) =>
                setValuation((s) => ({ ...s, title: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Pre-money"
                value={valuation.preMoney}
                onChange={(e) =>
                  setValuation((s) => ({
                    ...s,
                    preMoney: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Investment"
                value={valuation.investment}
                onChange={(e) =>
                  setValuation((s) => ({
                    ...s,
                    investment: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Option pool %"
                value={valuation.optionPoolPct}
                onChange={(e) =>
                  setValuation((s) => ({
                    ...s,
                    optionPoolPct: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Post-money: {formatCurrency(valuationMetrics().postMoney)} • Dilution:
              {valuationMetrics().dilution.toFixed(2)}% • Founder after pool:
              {valuationMetrics().effectiveFounder.toFixed(2)}%
            </div>
            <Button
              onClick={async () => {
                const metrics = valuationMetrics();
                const created = await createItem({
                  title: valuation.title || "Valuation",
                  type: "valuation",
                  data: { ...valuation, ...metrics },
                });
                if (created) {
                  setValuation({
                    title: "",
                    preMoney: 1000000,
                    investment: 250000,
                    optionPoolPct: 10,
                  });
                }
              }}
              disabled={!valuation.title}
            >
              Save Valuation
            </Button>
            <div className="space-y-2">
              {valuations.map((v) => (
                <div key={v._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{v.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Post-money: {formatCurrency(v.data?.postMoney)}
                      </div>
                    </div>
                    <EngineItemActions
                      item={v}
                      endpoint="/api/business/fundraising"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {valuations.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No valuations yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Investor CRM</h2>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Name"
                value={investor.name}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, name: e.target.value }))
                }
              />
              <Input
                placeholder="Firm"
                value={investor.firm}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, firm: e.target.value }))
                }
              />
              <Input
                placeholder="Role"
                value={investor.role}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, role: e.target.value }))
                }
              />
              <Input
                placeholder="Stage"
                value={investor.stage}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, stage: e.target.value }))
                }
              />
              <Input
                placeholder="Check size"
                value={investor.checkSize}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, checkSize: e.target.value }))
                }
              />
              <Input
                placeholder="Email"
                value={investor.email}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, email: e.target.value }))
                }
              />
              <Input
                placeholder="Phone"
                value={investor.phone}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, phone: e.target.value }))
                }
              />
              <Input
                placeholder="Status"
                value={investor.status}
                onChange={(e) =>
                  setInvestor((s) => ({ ...s, status: e.target.value }))
                }
              />
            </div>
            <Textarea
              placeholder="Thesis"
              value={investor.thesis}
              onChange={(e) =>
                setInvestor((s) => ({ ...s, thesis: e.target.value }))
              }
            />
            <Input
              type="date"
              placeholder="Last contact"
              value={investor.lastContact}
              onChange={(e) =>
                setInvestor((s) => ({ ...s, lastContact: e.target.value }))
              }
            />
            <Input
              placeholder="Next step"
              value={investor.nextStep}
              onChange={(e) =>
                setInvestor((s) => ({ ...s, nextStep: e.target.value }))
              }
            />
            <Textarea
              placeholder="Notes"
              value={investor.notes}
              onChange={(e) =>
                setInvestor((s) => ({ ...s, notes: e.target.value }))
              }
            />
            <Button
              onClick={async () => {
                const created = await createItem({
                  title: investor.name || "Investor",
                  type: "investor",
                  data: investor,
                });
                if (created) {
                  setInvestor({
                    name: "",
                    firm: "",
                    role: "",
                    email: "",
                    phone: "",
                    stage: "seed",
                    checkSize: "",
                    thesis: "",
                    lastContact: "",
                    nextStep: "",
                    status: "active",
                    notes: "",
                  });
                }
              }}
              disabled={!investor.name}
            >
              Save Investor
            </Button>
            <div className="space-y-2">
              {investors.map((i) => (
                <div key={i._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{i.data?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {i.data?.firm} • {i.data?.stage}
                      </div>
                    </div>
                    <EngineItemActions
                      item={i}
                      endpoint="/api/business/fundraising"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {investors.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No investors yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Fundraising Tracker</h2>
            <Input
              placeholder="Deal title"
              value={deal.title}
              onChange={(e) => setDeal((s) => ({ ...s, title: e.target.value }))}
            />
            <Input
              placeholder="Stage"
              value={deal.stage}
              onChange={(e) => setDeal((s) => ({ ...s, stage: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Amount"
                value={deal.amount}
                onChange={(e) =>
                  setDeal((s) => ({ ...s, amount: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Probability %"
                value={deal.probability}
                onChange={(e) =>
                  setDeal((s) => ({
                    ...s,
                    probability: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="date"
                placeholder="Expected close"
                value={deal.expectedCloseDate}
                onChange={(e) =>
                  setDeal((s) => ({
                    ...s,
                    expectedCloseDate: e.target.value,
                  }))
                }
              />
            </div>
            <Textarea
              placeholder="Notes"
              value={deal.notes}
              onChange={(e) => setDeal((s) => ({ ...s, notes: e.target.value }))}
            />
            <div className="text-sm text-muted-foreground">
              Weighted amount: {formatCurrency(dealMetrics().weighted)}
            </div>
            <Button
              onClick={async () => {
                const metrics = dealMetrics();
                const created = await createItem({
                  title: deal.title || "Deal",
                  type: "deal",
                  data: { ...deal, ...metrics },
                });
                if (created) {
                  setDeal({
                    title: "",
                    stage: "intro",
                    amount: 100000,
                    probability: 20,
                    expectedCloseDate: "",
                    notes: "",
                  });
                }
              }}
              disabled={!deal.title}
            >
              Save Deal
            </Button>
            <div className="space-y-2">
              {deals.map((d) => (
                <div key={d._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{d.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(d.data?.amount)} • Weighted:
                        {formatCurrency(d.data?.weighted)}
                      </div>
                    </div>
                    <EngineItemActions
                      item={d}
                      endpoint="/api/business/fundraising"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {deals.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No deals yet.
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
