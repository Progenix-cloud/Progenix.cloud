"use client";

import { useState, useEffect } from "react";

type Feature = {
  id?: string;
  title: string;
  reach: number; // numeric estimate
  impact: number; // 1-10
  confidence: number; // 0-1 (0..1)
  effort: number; // person-months or relative effort
  score?: number;
  status?: string;
};

type Props = {
  features: Feature[];
  onChange: (f: Feature[]) => void;
};

export default function RICEWidget({
  features: initial = [],
  onChange,
}: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [title, setTitle] = useState("");
  const [reach, setReach] = useState(1000);
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(0.8);
  const [effort, setEffort] = useState(1);

  useEffect(() => {
    setFeatures(
      initial.map((f) => ({
        ...f,
        score: computeScore(f),
      }))
    );
  }, [initial]);

  useEffect(() => {
    onChange(features);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features]);

  function computeScore(f: Feature) {
    // RICE: (Reach * Impact * Confidence) / Effort
    const r = Number(f.reach || 0);
    const i = Number(f.impact || 0);
    const c = Number(f.confidence || 0);
    const e = Number(f.effort || 1) || 1;
    const sc = (r * i * c) / e;
    return Math.round(sc * 100) / 100;
  }

  const addFeature = () => {
    const f: Feature = {
      id: `f-${Date.now()}`,
      title: title || "Untitled",
      reach,
      impact,
      confidence,
      effort,
      score: computeScore({ title, reach, impact, confidence, effort }),
      status: "planned",
    };
    setFeatures((s) => [f, ...s]);
    setTitle("");
    setReach(1000);
    setImpact(5);
    setConfidence(0.8);
    setEffort(1);
  };

  // Update feature function (currently unused but kept for future)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _updateFeature = (_id: string, _patch: Partial<Feature>) => {
    // TODO: Implement feature update logic
    console.log("Update feature called");
  };

  const removeFeature = (id: string) =>
    setFeatures((s) => s.filter((f) => f.id !== id));

  return (
    <div className="p-4 border rounded-md">
      <h3 className="font-semibold mb-2">Feature Scoring (RICE)</h3>
      <div className="grid grid-cols-1 gap-2 mb-3">
        <input
          className="input"
          placeholder="Feature title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-4 gap-2">
          <input
            className="input"
            type="number"
            value={reach}
            onChange={(e) => setReach(Number(e.target.value))}
            placeholder="Reach"
          />
          <input
            className="input"
            type="number"
            value={impact}
            onChange={(e) => setImpact(Number(e.target.value))}
            placeholder="Impact (1-10)"
          />
          <input
            className="input"
            type="number"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            placeholder="Confidence (0-1)"
          />
          <input
            className="input"
            type="number"
            step="0.1"
            value={effort}
            onChange={(e) => setEffort(Number(e.target.value))}
            placeholder="Effort"
          />
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={addFeature}
            disabled={!title}
          >
            Add Feature
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {features.map((f) => (
          <div key={f.id} className="p-2 border rounded-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium">{f.title}</div>
                <div className="text-xs text-muted-foreground">
                  Reach: {f.reach} • Impact: {f.impact} • Confidence:{" "}
                  {f.confidence} • Effort: {f.effort}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">Score: {f.score}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => removeFeature(f.id!)}
                  >
                    Remove
                  </button>
                </div>
              </div>
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
  );
}
