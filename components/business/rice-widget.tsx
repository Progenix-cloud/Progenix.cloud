"use client";

import { useState, useEffect } from "react";
import { buildAuthHeaders } from "@/lib/client-auth";

type Feature = {
  id?: string;
  title: string;
  reach: number; // numeric estimate
  impact: number; // 1-10
  confidence: number; // 0-1 (0..1)
  effort: number; // person-months or relative effort
  score?: number;
  status?: string;
  notes?: string;
  productId?: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editReach, setEditReach] = useState(0);
  const [editImpact, setEditImpact] = useState(0);
  const [editConfidence, setEditConfidence] = useState(0);
  const [editEffort, setEditEffort] = useState(1);
  const [editNotes, setEditNotes] = useState("");
  const [editError, setEditError] = useState("");

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
    if (reach < 0 || impact < 1 || impact > 10 || confidence < 0 || confidence > 1 || effort < 1) {
      alert("Invalid RICE values");
      return;
    }
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

  const updateFeature = async (id: string, patch: Partial<Feature>) => {
    const prev = features;
    // Optimistic update
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, ...patch, score: computeScore({ ...f, ...patch }) }
          : f
      )
    );

    try {
      const response = await fetch(`/api/business/features/${id}`, {
        method: "PATCH",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(patch),
      });

      if (!response.ok) throw new Error("Update failed");
    } catch (error) {
      // Rollback on error
      setFeatures(prev);
      console.error("Update failed:", error);
    }
  };

  const removeFeature = (id: string) =>
    setFeatures((s) => s.filter((f) => f.id !== id));

  const startEdit = (feature: Feature) => {
    setEditingId(feature.id || null);
    setEditTitle(feature.title || "");
    setEditReach(feature.reach ?? 0);
    setEditImpact(feature.impact ?? 0);
    setEditConfidence(feature.confidence ?? 0);
    setEditEffort(feature.effort ?? 1);
    setEditNotes(feature.notes || "");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (
      editReach < 0 ||
      editImpact < 1 ||
      editImpact > 10 ||
      editConfidence < 0 ||
      editConfidence > 1 ||
      editEffort < 1
    ) {
      setEditError("Invalid RICE values");
      return;
    }
    await updateFeature(editingId, {
      title: editTitle,
      reach: editReach,
      impact: editImpact,
      confidence: editConfidence,
      effort: editEffort,
      notes: editNotes,
    });
    setEditingId(null);
  };

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
                {f.notes && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Notes: {f.notes}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold">Score: {f.score}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => startEdit(f)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => removeFeature(f.id!)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            {editingId === f.id && (
              <div className="mt-3 p-3 rounded border bg-muted/30 space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <input
                    className="input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Feature title"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      className="input"
                      type="number"
                      value={editReach}
                      onChange={(e) => setEditReach(Number(e.target.value))}
                      placeholder="Reach"
                    />
                    <input
                      className="input"
                      type="number"
                      value={editImpact}
                      onChange={(e) => setEditImpact(Number(e.target.value))}
                      placeholder="Impact (1-10)"
                    />
                    <input
                      className="input"
                      type="number"
                      step="0.05"
                      value={editConfidence}
                      onChange={(e) => setEditConfidence(Number(e.target.value))}
                      placeholder="Confidence (0-1)"
                    />
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      value={editEffort}
                      onChange={(e) => setEditEffort(Number(e.target.value))}
                      placeholder="Effort"
                    />
                  </div>
                  <textarea
                    className="input"
                    placeholder="Notes / rationale"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    Current score: {f.score} → New score:{" "}
                    {computeScore({
                      title: editTitle,
                      reach: editReach,
                      impact: editImpact,
                      confidence: editConfidence,
                      effort: editEffort,
                    })}
                  </div>
                  {editError && <div className="text-red-600">{editError}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
