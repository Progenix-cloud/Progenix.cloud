"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";
import { Button } from "@/components/ui/button";
import { downloadJson, downloadCsv, printPage } from "@/lib/export-client";
import ProjectFilter from "@/components/business/project-filter";

type EngineItem = {
  _id: string;
  title: string;
  type?: string;
  createdAt?: string;
  data?: any;
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

const exportCsvRows = (items: EngineItem[]) =>
  items.map((i) => ({
    id: i._id,
    title: i.title,
    type: i.type,
    createdAt: i.createdAt,
    data: JSON.stringify(i.data || {}),
  }));

export default function BusinessReportsPage() {
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
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const exportAllJson = () => downloadJson("business-reports.json", data);

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Business Reports</h1>
            <p className="text-muted-foreground mt-2">
              Export and audit all Business Engine data.
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
            <Button variant="outline" onClick={exportAllJson}>
              Export All JSON
            </Button>
            <Button variant="outline" onClick={() => printPage()}>
              Print
            </Button>
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="font-semibold">Strategy</div>
            <div className="text-sm text-muted-foreground">
              {data.strategy.length} items
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson("strategy.json", data.strategy)}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv("strategy.csv", exportCsvRows(data.strategy))
                }
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-semibold">Product</div>
            <div className="text-sm text-muted-foreground">
              {data.product.length} items
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson("product.json", data.product)}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv("product.csv", exportCsvRows(data.product))
                }
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-semibold">Revenue</div>
            <div className="text-sm text-muted-foreground">
              {data.revenue.length} items
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson("revenue.json", data.revenue)}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv("revenue.csv", exportCsvRows(data.revenue))
                }
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-semibold">Marketing</div>
            <div className="text-sm text-muted-foreground">
              {data.marketing.length} items
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson("marketing.json", data.marketing)}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv("marketing.csv", exportCsvRows(data.marketing))
                }
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-semibold">Operations</div>
            <div className="text-sm text-muted-foreground">
              {data.operations.length} items
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson("operations.json", data.operations)}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv("operations.csv", exportCsvRows(data.operations))
                }
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-semibold">Legal</div>
            <div className="text-sm text-muted-foreground">
              {data.legal.length} items
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson("legal.json", data.legal)}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv("legal.csv", exportCsvRows(data.legal))
                }
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-semibold">Fundraising</div>
            <div className="text-sm text-muted-foreground">
              {data.fundraising.length} items
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson("fundraising.json", data.fundraising)}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv(
                    "fundraising.csv",
                    exportCsvRows(data.fundraising)
                  )
                }
              >
                CSV
              </Button>
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
