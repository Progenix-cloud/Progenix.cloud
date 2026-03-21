"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, printPage } from "@/lib/export-client";
import { formatCurrency } from "@/lib/helpers";
import EngineItemActions from "@/components/business/engine-item-actions";
import ProjectFilter from "@/components/business/project-filter";

type RevenueItem = {
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

export default function RevenuePage() {
  const [items, setItems] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const [pricing, setPricing] = useState({
    title: "",
    price: 49,
    customers: 100,
    discountRate: 0,
    billingPeriod: "monthly",
  });

  const [revenueModel, setRevenueModel] = useState({
    title: "",
    modelType: "subscription",
    units: 100,
    unitPrice: 50,
    cogsPerUnit: 10,
    notes: "",
  });

  const [cacLtv, setCacLtv] = useState({
    title: "",
    salesMarketingSpend: 5000,
    newCustomers: 50,
    arpa: 100,
    grossMarginPct: 70,
    avgLifespanMonths: 18,
  });

  const [breakEven, setBreakEven] = useState({
    title: "",
    fixedCosts: 20000,
    pricePerUnit: 50,
    variableCostPerUnit: 10,
  });

  const [forecast, setForecast] = useState({
    title: "",
    startingMRR: 5000,
    monthlyGrowthRate: 10,
    churnRate: 2,
    months: 12,
  });

  const load = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    try {
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const res = await fetch(`/api/business/revenue${qp}`, {
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

  const createItem = async (payload: Partial<RevenueItem>) => {
    const user = getUser();
    if (!user?._id) {
      alert("Missing user session");
      return null;
    }
    const res = await fetch("/api/business/revenue", {
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
      return json.data as RevenueItem;
    }
    alert(json.error || "Failed to create");
    return null;
  };

  const handleUpdated = (updated: RevenueItem) => {
    setItems((s) => s.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleDeleted = (id: string) => {
    setItems((s) => s.filter((i) => i._id !== id));
  };

  const pricingMetrics = () => {
    const gross = pricing.price * pricing.customers;
    const discountAmount = gross * (pricing.discountRate / 100);
    const net = gross - discountAmount;
    const mrr = pricing.billingPeriod === "annual" ? net / 12 : net;
    const arr = mrr * 12;
    return { gross, discountAmount, net, mrr, arr };
  };

  const revenueMetrics = () => {
    const revenue = revenueModel.units * revenueModel.unitPrice;
    const cogs = revenueModel.units * revenueModel.cogsPerUnit;
    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    return { revenue, cogs, grossProfit, grossMargin };
  };

  const cacLtvMetrics = () => {
    const cac =
      cacLtv.newCustomers > 0
        ? cacLtv.salesMarketingSpend / cacLtv.newCustomers
        : 0;
    const ltv =
      cacLtv.arpa *
      (cacLtv.grossMarginPct / 100) *
      cacLtv.avgLifespanMonths;
    const ratio = cac > 0 ? ltv / cac : 0;
    return { cac, ltv, ratio };
  };

  const breakEvenMetrics = () => {
    const contribution = breakEven.pricePerUnit - breakEven.variableCostPerUnit;
    const units = contribution > 0 ? breakEven.fixedCosts / contribution : 0;
    const revenue = units * breakEven.pricePerUnit;
    return { contribution, units, revenue };
  };

  const forecastMetrics = () => {
    const months = Number(forecast.months || 0) || 0;
    let mrr = Number(forecast.startingMRR || 0) || 0;
    const series = [] as any[];
    let total = 0;
    for (let i = 1; i <= months; i += 1) {
      const growthFactor = 1 + forecast.monthlyGrowthRate / 100;
      const churnFactor = 1 - forecast.churnRate / 100;
      mrr = Math.max(0, mrr * growthFactor * churnFactor);
      series.push({ month: i, mrr: Math.round(mrr) });
      total += mrr;
    }
    return { series, total };
  };

  const pricingItems = items.filter((i) => i.type === "pricing");
  const revenueItems = items.filter((i) => i.type === "revenue_model");
  const cacItems = items.filter((i) => i.type === "cac_ltv");
  const breakEvenItems = items.filter((i) => i.type === "break_even");
  const forecastItems = items.filter((i) => i.type === "forecast");

  const avgCAC = cacItems.length
    ? Math.round(
        (cacItems.reduce((sum, c) => sum + (c.data?.cac || 0), 0) /
          cacItems.length) *
          100
      ) / 100
    : 0;
  const avgLTV = cacItems.length
    ? Math.round(
        (cacItems.reduce((sum, c) => sum + (c.data?.ltv || 0), 0) /
          cacItems.length) *
          100
      ) / 100
    : 0;

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Revenue & Monetization Engine</h1>
            <p className="text-muted-foreground mt-2">
              Pricing, CAC/LTV, break-even, forecasts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={() => downloadJson("revenue.json", items)}>
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Pricing Scenarios" value={pricingItems.length} />
          <StatCard label="CAC (avg)" value={formatCurrency(avgCAC)} />
          <StatCard label="LTV (avg)" value={formatCurrency(avgLTV)} />
          <StatCard label="Forecasts" value={forecastItems.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Pricing Simulator</h2>
            <Input
              placeholder="Scenario title"
              value={pricing.title}
              onChange={(e) => setPricing((s) => ({ ...s, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Price"
                value={pricing.price}
                onChange={(e) =>
                  setPricing((s) => ({ ...s, price: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Customers"
                value={pricing.customers}
                onChange={(e) =>
                  setPricing((s) => ({ ...s, customers: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Discount %"
                value={pricing.discountRate}
                onChange={(e) =>
                  setPricing((s) => ({
                    ...s,
                    discountRate: Number(e.target.value),
                  }))
                }
              />
              <Input
                placeholder="Billing period (monthly/annual)"
                value={pricing.billingPeriod}
                onChange={(e) =>
                  setPricing((s) => ({ ...s, billingPeriod: e.target.value }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              MRR: {formatCurrency(pricingMetrics().mrr)} • ARR:
              {formatCurrency(pricingMetrics().arr)}
            </div>
            <Button
              onClick={async () => {
                const metrics = pricingMetrics();
                const created = await createItem({
                  title: pricing.title || "Pricing Scenario",
                  type: "pricing",
                  data: { ...pricing, ...metrics },
                });
                if (created) {
                  setPricing({
                    title: "",
                    price: 49,
                    customers: 100,
                    discountRate: 0,
                    billingPeriod: "monthly",
                  });
                }
              }}
              disabled={!pricing.title}
            >
              Save Pricing Scenario
            </Button>
            <div className="space-y-2">
              {pricingItems.map((p) => (
                <div key={p._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">
                        MRR: {formatCurrency(p.data?.mrr)}
                      </div>
                    </div>
                    <EngineItemActions
                      item={p}
                      endpoint="/api/business/revenue"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {pricingItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No pricing scenarios yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Revenue Model Builder</h2>
            <Input
              placeholder="Scenario title"
              value={revenueModel.title}
              onChange={(e) =>
                setRevenueModel((s) => ({ ...s, title: e.target.value }))
              }
            />
            <Input
              placeholder="Model type (subscription, usage, license)"
              value={revenueModel.modelType}
              onChange={(e) =>
                setRevenueModel((s) => ({ ...s, modelType: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Units"
                value={revenueModel.units}
                onChange={(e) =>
                  setRevenueModel((s) => ({ ...s, units: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Unit price"
                value={revenueModel.unitPrice}
                onChange={(e) =>
                  setRevenueModel((s) => ({
                    ...s,
                    unitPrice: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="COGS per unit"
                value={revenueModel.cogsPerUnit}
                onChange={(e) =>
                  setRevenueModel((s) => ({
                    ...s,
                    cogsPerUnit: Number(e.target.value),
                  }))
                }
              />
            </div>
            <Textarea
              placeholder="Notes"
              value={revenueModel.notes}
              onChange={(e) =>
                setRevenueModel((s) => ({ ...s, notes: e.target.value }))
              }
            />
            <div className="text-sm text-muted-foreground">
              Revenue: {formatCurrency(revenueMetrics().revenue)} • Gross Margin:
              {Math.round(revenueMetrics().grossMargin)}%
            </div>
            <Button
              onClick={async () => {
                const metrics = revenueMetrics();
                const created = await createItem({
                  title: revenueModel.title || "Revenue Model",
                  type: "revenue_model",
                  data: { ...revenueModel, ...metrics },
                });
                if (created) {
                  setRevenueModel({
                    title: "",
                    modelType: "subscription",
                    units: 100,
                    unitPrice: 50,
                    cogsPerUnit: 10,
                    notes: "",
                  });
                }
              }}
              disabled={!revenueModel.title}
            >
              Save Revenue Model
            </Button>
            <div className="space-y-2">
              {revenueItems.map((r) => (
                <div key={r._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Gross Margin: {Math.round(r.data?.grossMargin || 0)}%
                      </div>
                    </div>
                    <EngineItemActions
                      item={r}
                      endpoint="/api/business/revenue"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {revenueItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No revenue models yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">CAC / LTV Calculator</h2>
            <Input
              placeholder="Scenario title"
              value={cacLtv.title}
              onChange={(e) => setCacLtv((s) => ({ ...s, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Sales & marketing spend"
                value={cacLtv.salesMarketingSpend}
                onChange={(e) =>
                  setCacLtv((s) => ({
                    ...s,
                    salesMarketingSpend: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="New customers"
                value={cacLtv.newCustomers}
                onChange={(e) =>
                  setCacLtv((s) => ({
                    ...s,
                    newCustomers: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="ARPA"
                value={cacLtv.arpa}
                onChange={(e) =>
                  setCacLtv((s) => ({ ...s, arpa: Number(e.target.value) }))
                }
              />
              <Input
                type="number"
                placeholder="Gross margin %"
                value={cacLtv.grossMarginPct}
                onChange={(e) =>
                  setCacLtv((s) => ({
                    ...s,
                    grossMarginPct: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Avg lifespan (months)"
                value={cacLtv.avgLifespanMonths}
                onChange={(e) =>
                  setCacLtv((s) => ({
                    ...s,
                    avgLifespanMonths: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              CAC: {formatCurrency(cacLtvMetrics().cac)} • LTV:
              {formatCurrency(cacLtvMetrics().ltv)} • LTV/CAC:
              {cacLtvMetrics().ratio.toFixed(2)}
            </div>
            <Button
              onClick={async () => {
                const metrics = cacLtvMetrics();
                const created = await createItem({
                  title: cacLtv.title || "CAC/LTV",
                  type: "cac_ltv",
                  data: { ...cacLtv, ...metrics },
                });
                if (created) {
                  setCacLtv({
                    title: "",
                    salesMarketingSpend: 5000,
                    newCustomers: 50,
                    arpa: 100,
                    grossMarginPct: 70,
                    avgLifespanMonths: 18,
                  });
                }
              }}
              disabled={!cacLtv.title}
            >
              Save CAC/LTV
            </Button>
            <div className="space-y-2">
              {cacItems.map((c) => (
                <div key={c._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        CAC: {formatCurrency(c.data?.cac)} • LTV:
                        {formatCurrency(c.data?.ltv)}
                      </div>
                    </div>
                    <EngineItemActions
                      item={c}
                      endpoint="/api/business/revenue"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {cacItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No CAC/LTV scenarios yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="font-semibold">Break-even Analyzer</h2>
            <Input
              placeholder="Scenario title"
              value={breakEven.title}
              onChange={(e) =>
                setBreakEven((s) => ({ ...s, title: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Fixed costs"
                value={breakEven.fixedCosts}
                onChange={(e) =>
                  setBreakEven((s) => ({
                    ...s,
                    fixedCosts: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Price per unit"
                value={breakEven.pricePerUnit}
                onChange={(e) =>
                  setBreakEven((s) => ({
                    ...s,
                    pricePerUnit: Number(e.target.value),
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Variable cost per unit"
                value={breakEven.variableCostPerUnit}
                onChange={(e) =>
                  setBreakEven((s) => ({
                    ...s,
                    variableCostPerUnit: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Break-even units: {Math.round(breakEvenMetrics().units)} • Revenue:
              {formatCurrency(breakEvenMetrics().revenue)}
            </div>
            <Button
              onClick={async () => {
                const metrics = breakEvenMetrics();
                const created = await createItem({
                  title: breakEven.title || "Break-even",
                  type: "break_even",
                  data: { ...breakEven, ...metrics },
                });
                if (created) {
                  setBreakEven({
                    title: "",
                    fixedCosts: 20000,
                    pricePerUnit: 50,
                    variableCostPerUnit: 10,
                  });
                }
              }}
              disabled={!breakEven.title}
            >
              Save Break-even
            </Button>
            <div className="space-y-2">
              {breakEvenItems.map((b) => (
                <div key={b._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{b.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Units: {Math.round(b.data?.units || 0)}
                      </div>
                    </div>
                    <EngineItemActions
                      item={b}
                      endpoint="/api/business/revenue"
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              ))}
              {breakEvenItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No break-even scenarios yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-3">
          <h2 className="font-semibold">Forecast Engine</h2>
          <Input
            placeholder="Scenario title"
            value={forecast.title}
            onChange={(e) => setForecast((s) => ({ ...s, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              type="number"
              placeholder="Starting MRR"
              value={forecast.startingMRR}
              onChange={(e) =>
                setForecast((s) => ({
                  ...s,
                  startingMRR: Number(e.target.value),
                }))
              }
            />
            <Input
              type="number"
              placeholder="Growth %"
              value={forecast.monthlyGrowthRate}
              onChange={(e) =>
                setForecast((s) => ({
                  ...s,
                  monthlyGrowthRate: Number(e.target.value),
                }))
              }
            />
            <Input
              type="number"
              placeholder="Churn %"
              value={forecast.churnRate}
              onChange={(e) =>
                setForecast((s) => ({
                  ...s,
                  churnRate: Number(e.target.value),
                }))
              }
            />
            <Input
              type="number"
              placeholder="Months"
              value={forecast.months}
              onChange={(e) =>
                setForecast((s) => ({ ...s, months: Number(e.target.value) }))
              }
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total Forecast Revenue: {formatCurrency(forecastMetrics().total)}
          </div>
          <Button
            onClick={async () => {
              const metrics = forecastMetrics();
              const created = await createItem({
                title: forecast.title || "Forecast",
                type: "forecast",
                data: { ...forecast, ...metrics },
              });
              if (created) {
                setForecast({
                  title: "",
                  startingMRR: 5000,
                  monthlyGrowthRate: 10,
                  churnRate: 2,
                  months: 12,
                });
              }
            }}
            disabled={!forecast.title}
          >
            Save Forecast
          </Button>
          <div className="space-y-2">
            {forecastItems.map((f) => (
              <div key={f._id} className="p-3 border rounded-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Total: {formatCurrency(f.data?.total)} • Months:
                      {f.data?.months}
                    </div>
                  </div>
                  <EngineItemActions
                    item={f}
                    endpoint="/api/business/revenue"
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                </div>
              </div>
            ))}
            {forecastItems.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No forecasts yet.
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
