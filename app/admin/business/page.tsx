"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { downloadJson, printPage } from "@/lib/export-client";
import { formatCurrency } from "@/lib/helpers";
import { BarList, ProgressBar, Sparkline } from "@/components/business/charts";
import ProjectFilter from "@/components/business/project-filter";

type EngineItem = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  data?: any;
  createdAt?: string;
};

type EngineData = {
  strategy: EngineItem[];
  product: EngineItem[];
  revenue: EngineItem[];
  marketing: EngineItem[];
  operations: EngineItem[];
  legal: EngineItem[];
  fundraising: EngineItem[];
};

const emptyData: EngineData = {
  strategy: [],
  product: [],
  revenue: [],
  marketing: [],
  operations: [],
  legal: [],
  fundraising: [],
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

const EngineCard = ({
  title,
  description,
  href,
  count,
  lastUpdated,
}: any) => (
  <Link
    href={href}
    className="p-4 border rounded-lg hover:shadow-sm transition"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {description}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl font-semibold">{count}</div>
        <div className="text-xs text-muted-foreground">items</div>
      </div>
    </div>
    <div className="text-xs text-muted-foreground mt-3">
      Last update: {lastUpdated || "—"}
    </div>
  </Link>
);

export default function BusinessHome() {
  const [data, setData] = useState<EngineData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");

  const loadAll = async () => {
    const user = getUser();
    if (!user?._id) return;
    setLoading(true);
    setError("");
    try {
      const headers = { "x-user-id": user._id };
      const qp = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      const [strategy, product, revenue, marketing, operations, legal, fundraising] =
        await Promise.all([
          fetch(`/api/business/strategy${qp}`, { headers }).then((r) => r.json()),
          fetch(`/api/business/product${qp}`, { headers }).then((r) => r.json()),
          fetch(`/api/business/revenue${qp}`, { headers }).then((r) => r.json()),
          fetch(`/api/business/marketing${qp}`, { headers }).then((r) => r.json()),
          fetch(`/api/business/operations${qp}`, { headers }).then((r) => r.json()),
          fetch(`/api/business/legal${qp}`, { headers }).then((r) => r.json()),
          fetch(`/api/business/fundraising${qp}`, { headers }).then((r) => r.json()),
        ]);

      setData({
        strategy: strategy.data || [],
        product: product.data || [],
        revenue: revenue.data || [],
        marketing: marketing.data || [],
        operations: operations.data || [],
        legal: legal.data || [],
        fundraising: fundraising.data || [],
      });
    } catch (e) {
      console.error(e);
      setError("Failed to load business data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const metrics = useMemo(() => {
    const okrs = data.strategy.filter((i) => i.type === "okr");
    const avgOkr = okrs.length
      ? Math.round(
          okrs.reduce((sum, o) => sum + (o.data?.progress || 0), 0) / okrs.length
        )
      : 0;

    const features = data.product.filter((i) => i.type === "feature");
    const avgRice = features.length
      ? Math.round(
          (features.reduce((sum, f) => sum + (f.data?.score || 0), 0) /
            features.length) *
            100
        ) / 100
      : 0;

    const cacItems = data.revenue.filter((i) => i.type === "cac_ltv");
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

    const funnels = data.marketing.filter((i) => i.type === "funnel");
    const avgConversion = funnels.length
      ? Math.round(
          (funnels.reduce((sum, f) => sum + (f.data?.overall || 0), 0) /
            funnels.length) *
            100
        ) / 100
      : 0;

    const experiments = data.marketing.filter((i) => i.type === "experiment");
    const winRate = experiments.length
      ? Math.round(
          (experiments.filter((e) => e.data?.outcome === "win").length /
            experiments.length) *
            100
        )
      : 0;

    const efficiencies = data.operations.filter((i) => i.type === "efficiency");
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

    const compliance = data.legal.filter((i) => i.type === "compliance");
    const openCompliance = compliance.filter(
      (c) => c.data?.status !== "closed"
    ).length;
    const legalRisks = data.legal.filter((i) => i.type === "risk");
    const highRisks = legalRisks.filter((r) => (r.data?.score || 0) >= 12).length;

    const deals = data.fundraising.filter((i) => i.type === "deal");
    const pipelineTotal = deals.reduce(
      (sum, d) => sum + (Number(d.data?.amount || 0) || 0),
      0
    );
    const weightedPipeline = deals.reduce(
      (sum, d) => sum + (Number(d.data?.weighted || 0) || 0),
      0
    );

    return {
      avgOkr,
      avgRice,
      avgCAC,
      avgLTV,
      avgConversion,
      winRate,
      avgEfficiency,
      openCompliance,
      highRisks,
      pipelineTotal,
      weightedPipeline,
    };
  }, [data]);

  const recentActivity = useMemo(() => {
    const all = [
      ...data.strategy.map((i) => ({ ...i, engine: "Strategy" })),
      ...data.product.map((i) => ({ ...i, engine: "Product" })),
      ...data.revenue.map((i) => ({ ...i, engine: "Revenue" })),
      ...data.marketing.map((i) => ({ ...i, engine: "Marketing" })),
      ...data.operations.map((i) => ({ ...i, engine: "Operations" })),
      ...data.legal.map((i) => ({ ...i, engine: "Legal" })),
      ...data.fundraising.map((i) => ({ ...i, engine: "Fundraising" })),
    ];
    return all
      .sort((a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 10);
  }, [data]);

  const insights = useMemo(() => {
    const forecastItems = data.revenue.filter((i) => i.type === "forecast");
    const latestForecast = [...forecastItems].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )[0];
    const forecastSeries: number[] =
      latestForecast?.data?.series?.map((s: any) => Number(s.mrr || 0)) || [];

    const funnelItems = data.marketing.filter((i) => i.type === "funnel");
    const latestFunnel = [...funnelItems].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )[0];
    const funnelSteps = latestFunnel
      ? [
          { label: "Visitors", value: Number(latestFunnel.data?.visitors || 0) },
          { label: "Signups", value: Number(latestFunnel.data?.signups || 0) },
          {
            label: "Activations",
            value: Number(latestFunnel.data?.activations || 0),
          },
          { label: "Paid", value: Number(latestFunnel.data?.paid || 0) },
        ]
      : [];

    const okrs = data.strategy
      .filter((i) => i.type === "okr")
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 5)
      .map((o) => ({
        label: o.data?.objective || o.title,
        value: Number(o.data?.progress || 0),
      }));

    const topFeatures = data.product
      .filter((i) => i.type === "feature")
      .sort((a, b) => (b.data?.score || 0) - (a.data?.score || 0))
      .slice(0, 5)
      .map((f) => ({
        label: f.title,
        value: Number(f.data?.score || 0),
      }));

    const deals = data.fundraising.filter((i) => i.type === "deal");
    const stageMap = new Map<string, number>();
    deals.forEach((d) => {
      const stage = d.data?.stage || "unknown";
      const amount = Number(d.data?.amount || 0) || 0;
      stageMap.set(stage, (stageMap.get(stage) || 0) + amount);
    });
    const pipelineStages = Array.from(stageMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return {
      forecastSeries,
      funnelSteps,
      okrs,
      topFeatures,
      pipelineStages,
    };
  }, [data]);

  const lastUpdated = (items: EngineItem[]) => {
    if (!items.length) return "—";
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
    const date = sorted[0]?.createdAt ? new Date(sorted[0].createdAt) : null;
    return date ? date.toLocaleDateString() : "—";
  };

  const exportAll = () => {
    downloadJson("business-overview.json", data);
  };

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Business Hub</h1>
            <p className="text-muted-foreground mt-2">
              End-to-end visibility across Strategy, Product, Revenue, Marketing,
              Operations, Legal, and Fundraising.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectFilter
              value={projectId}
              onChange={setProjectId}
              includeAll
              placeholder="All projects"
            />
            <Button variant="outline" onClick={loadAll} disabled={loading}>
              Refresh
            </Button>
            <Button variant="outline" onClick={exportAll}>
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="OKR Avg Progress" value={`${metrics.avgOkr}%`} />
          <StatCard label="Avg RICE" value={metrics.avgRice} />
          <StatCard
            label="Avg LTV/CAC"
            value={
              metrics.avgCAC > 0
                ? (metrics.avgLTV / metrics.avgCAC).toFixed(2)
                : "0.00"
            }
            hint={`${formatCurrency(metrics.avgLTV)} / ${formatCurrency(metrics.avgCAC)}`}
          />
          <StatCard
            label="Pipeline (Weighted)"
            value={formatCurrency(metrics.weightedPipeline)}
            hint={`Total ${formatCurrency(metrics.pipelineTotal)}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Funnel Conv." value={`${metrics.avgConversion}%`} />
          <StatCard label="Experiment Win Rate" value={`${metrics.winRate}%`} />
          <StatCard label="Avg Efficiency" value={metrics.avgEfficiency} />
          <StatCard
            label="Compliance / High Risks"
            value={`${metrics.openCompliance} / ${metrics.highRisks}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Forecast Trend</h2>
            <Sparkline data={insights.forecastSeries} height={80} />
            {insights.forecastSeries.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                Latest MRR:{" "}
                {formatCurrency(
                  insights.forecastSeries[insights.forecastSeries.length - 1]
                )}
              </div>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Latest Funnel</h2>
            <BarList
              items={insights.funnelSteps}
              formatValue={(v) => v.toFixed(0)}
            />
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Pipeline by Stage</h2>
            <BarList
              items={insights.pipelineStages}
              formatValue={(v) => formatCurrency(v)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">OKR Progress</h2>
            <div className="space-y-3">
              {insights.okrs.length === 0 && (
                <div className="text-sm text-muted-foreground">No OKRs yet.</div>
              )}
              {insights.okrs.map((o) => (
                <ProgressBar key={o.label} label={o.label} value={o.value} />
              ))}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Top RICE Features</h2>
            <BarList items={insights.topFeatures} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Engines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <EngineCard
              title="Strategy"
              description="Vision, canvas, ICP, OKRs"
              href="/admin/business/strategy"
              count={data.strategy.length}
              lastUpdated={lastUpdated(data.strategy)}
            />
            <EngineCard
              title="Product & Execution"
              description="MVPs, RICE, sprints, alignment"
              href="/admin/business/product"
              count={data.product.length}
              lastUpdated={lastUpdated(data.product)}
            />
            <EngineCard
              title="Revenue & Monetization"
              description="Pricing, CAC/LTV, break-even"
              href="/admin/business/revenue"
              count={data.revenue.length}
              lastUpdated={lastUpdated(data.revenue)}
            />
            <EngineCard
              title="Marketing & Growth"
              description="GTM, funnels, experiments, PMF"
              href="/admin/business/marketing"
              count={data.marketing.length}
              lastUpdated={lastUpdated(data.marketing)}
            />
            <EngineCard
              title="Operations & Systems"
              description="SOPs, workflows, org design"
              href="/admin/business/operations"
              count={data.operations.length}
              lastUpdated={lastUpdated(data.operations)}
            />
            <EngineCard
              title="Legal & Risk"
              description="Agreements, cap table, compliance"
              href="/admin/business/legal"
              count={data.legal.length}
              lastUpdated={lastUpdated(data.legal)}
            />
            <EngineCard
              title="Investor & Fundraising"
              description="Pitch, valuation, CRM, tracker"
              href="/admin/business/fundraising"
              count={data.fundraising.length}
              lastUpdated={lastUpdated(data.fundraising)}
            />
            <EngineCard
              title="Business Reports"
              description="Exports, summaries, and portfolio snapshots"
              href="/admin/business/reports"
              count={
                data.strategy.length +
                data.product.length +
                data.revenue.length +
                data.marketing.length +
                data.operations.length +
                data.legal.length +
                data.fundraising.length
              }
              lastUpdated={lastUpdated([
                ...data.strategy,
                ...data.product,
                ...data.revenue,
                ...data.marketing,
                ...data.operations,
                ...data.legal,
                ...data.fundraising,
              ])}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.map((item: any) => (
                <div key={item._id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.engine} • {item.type || "item"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No business activity yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/admin/business/strategy" className="p-3 border rounded-md hover:shadow-sm">
                Create Vision / OKR
              </Link>
              <Link href="/admin/business/product" className="p-3 border rounded-md hover:shadow-sm">
                Score Features
              </Link>
              <Link href="/admin/business/revenue" className="p-3 border rounded-md hover:shadow-sm">
                Run CAC/LTV
              </Link>
              <Link href="/admin/business/marketing" className="p-3 border rounded-md hover:shadow-sm">
                Build GTM Plan
              </Link>
              <Link href="/admin/business/operations" className="p-3 border rounded-md hover:shadow-sm">
                Create SOP
              </Link>
              <Link href="/admin/business/legal" className="p-3 border rounded-md hover:shadow-sm">
                Update Cap Table
              </Link>
              <Link href="/admin/business/fundraising" className="p-3 border rounded-md hover:shadow-sm">
                Add Investor
              </Link>
              <Link href="/admin/business/reports" className="p-3 border rounded-md hover:shadow-sm">
                Business Reports
              </Link>
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
