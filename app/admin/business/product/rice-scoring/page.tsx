"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RICEWidget from "@/components/business/rice-widget";
import ProtectedBusiness from "@/components/business/protected-business";
import { useRouter } from "next/navigation";
import { buildAuthHeaders } from "@/lib/client-auth";

type Feature = {
  id?: string;
  title: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  score?: number;
  status?: string;
};

export default function RiceScoringPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const response = await fetch("/api/business/features", {
        headers: buildAuthHeaders(),
      });
      const result = await response.json();
      if (result.success) {
        setFeatures(result.data);
      }
    } catch (error) {
      console.error("Failed to load features:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturesChange = (updatedFeatures: Feature[]) => {
    setFeatures(updatedFeatures);
  };

  const sortedFeatures = [...features].sort(
    (a, b) => Number(b.score ?? 0) - Number(a.score ?? 0)
  );

  return (
    <ProtectedBusiness>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">RICE Scoring Matrix</h1>
            <p className="text-muted-foreground mt-2">
              Prioritize features using Reach × Impact × Confidence / Effort
            </p>
          </div>
          <Button onClick={() => router.push("/admin/business/product")}>
            ← Back to Product Engine
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Feature Scoring
              <Badge variant="secondary">{features.length} features</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RICEWidget features={features} onChange={handleFeaturesChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Priority Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading features...
              </div>
            ) : sortedFeatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No features scored yet. Add some using the scoring tool above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Feature</TableHead>
                    <TableHead>R</TableHead>
                    <TableHead>I</TableHead>
                    <TableHead>C</TableHead>
                    <TableHead>E</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFeatures.map((feature, idx) => (
                    <TableRow key={feature.id ?? String(idx)}>
                      <TableCell className="font-medium">
                        {feature.title}
                      </TableCell>
                      <TableCell>{feature.reach}</TableCell>
                      <TableCell>{feature.impact}</TableCell>
                      <TableCell>{feature.confidence.toFixed(2)}</TableCell>
                      <TableCell>{feature.effort}</TableCell>
                      <TableCell className="font-semibold">
                        {Number(feature.score ?? 0).toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{idx + 1}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedBusiness>
  );
}
