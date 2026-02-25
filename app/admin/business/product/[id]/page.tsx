"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ProtectedBusiness from "@/components/business/protected-business";
import RiceWidget from "@/components/business/rice-widget";

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

type Product = {
  _id: string;
  title: string;
  description?: string;
  features?: Feature[];
  roadmap?: any;
};

export default function ProductDetail() {
  const params = useParams() as any;
  const id = params?.id as string;
  const [_item, setItem] = useState<Product | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roadmapText, setRoadmapText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/business/product/${id}`);
      const json = await res.json();
      if (json.data) {
        setItem(json.data);
        setTitle(json.data.title || "");
        setDescription(json.data.description || "");
        setRoadmapText(JSON.stringify(json.data.roadmap || {}, null, 2));
        setFeatures((json.data.features as Feature[]) || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      let roadmap = {};
      try {
        roadmap = JSON.parse(roadmapText || "{}");
      } catch (e) {
        setMessage("Roadmap JSON invalid");
        setSaving(false);
        return;
      }
      const payload = { title, description, roadmap, features };
      const res = await fetch(`/api/business/product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.data) {
        setItem(json.data);
        setMessage("Saved");
      } else {
        setMessage(json.error || "Failed to save");
      }
    } catch (e) {
      console.error(e);
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <div className="p-8">Missing product id</div>;

  return (
    <ProtectedBusiness>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Product Detail</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="input w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="textarea w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Roadmap (JSON)</label>
            <textarea
              className="textarea w-full h-48 font-mono text-xs"
              value={roadmapText}
              onChange={(e) => setRoadmapText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Edit roadmap JSON directly.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Feature Scoring</label>
            <div className="mt-2">
              <RiceWidget
                features={features}
                onChange={(f) => setFeatures(f)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn btn-primary"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {message && (
              <div className="text-sm text-muted-foreground">{message}</div>
            )}
          </div>
        </div>
      </div>
    </ProtectedBusiness>
  );
}
