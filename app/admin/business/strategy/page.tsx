"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";

type Strategy = {
  _id: string;
  title: string;
  description?: string;
  ownerId?: string;
  tags?: string[];
  status?: string;
  createdAt?: string;
};

export default function StrategyPage() {
  const [items, setItems] = useState<Strategy[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/business/strategy");
      const json = await res.json();
      if (json.data) setItems(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // SSE for in-app notifications
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user?._id) return;
    const src = new EventSource(
      `/api/notifications/stream?userId=${encodeURIComponent(user._id)}`
    );
    src.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setNotifications((s) => [data, ...s]);
      } catch (err) {
        // ignore
      }
    };
    src.onerror = () => {
      try {
        src.close();
      } catch (e) {
        // ignore
      }
    };
    return () => {
      try {
        src.close();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const onCreate = async () => {
    setSaving(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const payload = {
        title,
        description,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ownerId: user?._id,
      };
      const res = await fetch("/api/business/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.data) {
        setItems((s) => [json.data, ...s]);
        setTitle("");
        setDescription("");
        setTags("");
      } else {
        alert(json.error || "Failed to create");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create strategy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedBusiness>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Strategy Engine</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Vision builder, canvas generation, ICP profiler, OKR tracker.
        </p>

        <div className="max-w-3xl space-y-6">
          {/* In-app notifications */}
          {notifications.length > 0 && (
            <div className="mb-4">
              <div className="font-semibold">Recent Notifications</div>
              <div className="space-y-2 mt-2">
                {notifications.slice(0, 5).map((n, idx) => (
                  <div key={idx} className="p-2 border rounded-md bg-white/80">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {n.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="p-4 border rounded-md">
            <h2 className="font-semibold mb-2">Create Strategy</h2>
            <div className="grid grid-cols-1 gap-2">
              <input
                className="input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="textarea"
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                className="input"
                placeholder="tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <div className="pt-2">
                <button
                  className="btn btn-primary"
                  onClick={onCreate}
                  disabled={saving || !title}
                >
                  {saving ? "Creating..." : "Create Strategy"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Recent Strategies</h2>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it._id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {it.description}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(it.createdAt || Date.now()).toLocaleString()}
                    </div>
                  </div>
                  {it.tags && it.tags.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Tags: {it.tags.join(", ")}
                    </div>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No strategies yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedBusiness>
  );
}
