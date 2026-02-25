"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedBusiness from "@/components/business/protected-business";

type Strategy = {
  _id: string;
  title: string;
  description?: string;
  canvas?: any;
  tags?: string[];
  status?: string;
};

export default function StrategyDetail() {
  const params = useParams() as any;
  const id = params?.id as string;
  const [_item, setItem] = useState<Strategy | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [canvasText, setCanvasText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/business/strategy/${id}`);
      const json = await res.json();
      if (json.data) {
        setItem(json.data);
        setTitle(json.data.title || "");
        setDescription(json.data.description || "");
        setCanvasText(JSON.stringify(json.data.canvas || {}, null, 2));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      let canvas = {};
      try {
        canvas = JSON.parse(canvasText || "{}");
      } catch (e) {
        setMessage("Canvas JSON is invalid");
        setSaving(false);
        return;
      }
      const payload = { title, description, canvas };
      const res = await fetch(`/api/business/strategy/${id}`, {
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

  if (!id) return <div className="p-8">Missing strategy id</div>;

  return (
    <ProtectedBusiness>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Strategy Detail</h1>
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
            <label className="block text-sm font-medium">Canvas (JSON)</label>
            <textarea
              className="textarea w-full h-48 font-mono text-xs"
              value={canvasText}
              onChange={(e) => setCanvasText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Edit canvas JSON directly. Use the Strategy list to create new
              items.
            </p>
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
