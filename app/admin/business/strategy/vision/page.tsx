"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Download, Printer } from "lucide-react";
import ProtectedBusiness from "@/components/business/protected-business";

type VisionData = {
  problem: string;
  solution: string;
  marketSize: string;
  targetAudience: string;
  competitiveAdvantage: string;
  vision3Year: string;
  northStarMetric: string;
};

export default function VisionBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<VisionData>({
    problem: "",
    solution: "",
    marketSize: "",
    targetAudience: "",
    competitiveAdvantage: "",
    vision3Year: "",
    northStarMetric: "",
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: "Problem & Solution", icon: "🎯" },
    { title: "Market & Target", icon: "📊" },
    { title: "Competitive Edge", icon: "⚔️" },
    { title: "3-Year Vision", icon: "🚀" },
    { title: "North Star & Summary", icon: "⭐" },
  ];

  const updateData = (updates: Partial<VisionData>): void => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const saveVision = async (): Promise<void> => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const response = await fetch("/api/business/strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?._id || "",
        },
        body: JSON.stringify({
          title: `Vision - ${new Date().toLocaleDateString()}`,
          type: "vision-complete",
          data,
        }),
      });

      if (response.ok) {
        router.push("/admin/business/strategy");
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    // Simple text export for now
    const content = `
VISION BUILDER OUTPUT

1. Problem: ${data.problem}
2. Solution: ${data.solution}
3. Market Size: ${data.marketSize}
4. Target Audience: ${data.targetAudience}
5. Competitive Advantage: ${data.competitiveAdvantage}
6. 3-Year Vision: ${data.vision3Year}
7. North Star Metric: ${data.northStarMetric}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "company-vision.txt";
    a.click();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Textarea
              placeholder="What problem are you solving?"
              value={data.problem}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateData({ problem: e.target.value })
              }
              className="mb-4"
            />
            <Textarea
              placeholder="How will you solve it?"
              value={data.solution}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateData({ solution: e.target.value })
              }
            />
          </>
        );
      case 2:
        return (
          <>
            <Input
              placeholder="Market size (TAM/SAM/SOM)"
              value={data.marketSize}
              onChange={(e) => updateData({ marketSize: e.target.value })}
              className="mb-4"
            />
            <Textarea
              placeholder="Target audience description"
              value={data.targetAudience}
              onChange={(e) => updateData({ targetAudience: e.target.value })}
            />
          </>
        );
      case 3:
        return (
          <Textarea
            placeholder="What makes you uniquely positioned to win?"
            value={data.competitiveAdvantage}
            onChange={(e) =>
              updateData({ competitiveAdvantage: e.target.value })
            }
          />
        );
      case 4:
        return (
          <Textarea
            placeholder="Where do you want to be in 3 years?"
            value={data.vision3Year}
            onChange={(e) => updateData({ vision3Year: e.target.value })}
          />
        );
      case 5:
        return (
          <>
            <Input
              placeholder="North Star Metric (e.g., Monthly Active Users)"
              value={data.northStarMetric}
              onChange={(e) => updateData({ northStarMetric: e.target.value })}
              className="mb-4"
            />
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <h3 className="font-semibold">Summary Preview:</h3>
              <p>
                <strong>Problem:</strong> {data.problem.slice(0, 100)}...
              </p>
              <p>
                <strong>Solution:</strong> {data.solution.slice(0, 100)}...
              </p>
              <p>
                <strong>3-Year Vision:</strong> {data.vision3Year.slice(0, 100)}
                ...
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedBusiness>
      <div className="p-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Strategy
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              {steps[step - 1].icon} Vision Builder
            </CardTitle>
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx + 1 === step
                        ? "bg-blue-500 text-white"
                        : idx < step - 1
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 ${
                        idx < step - 1
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground">
              Step {step} of {steps.length}: {steps[step - 1].title}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex gap-3 pt-6 border-t">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              {step < steps.length ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1"
                  disabled={!data.problem || !data.solution} // Basic validation
                >
                  Next Step
                </Button>
              ) : (
                <div className="flex gap-3 flex-1">
                  <Button
                    variant="outline"
                    onClick={exportPDF}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button
                    onClick={saveVision}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <Printer className="w-4 h-4" />
                    Save Vision
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedBusiness>
  );
}
