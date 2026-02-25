"use client";

import { useEffect, useState } from "react";
import ProtectedBusiness from "@/components/business/protected-business";

type Product = {
  _id: string;
  title: string;
  description?: string;
  ownerId?: string;
  features?: any[];
  status?: string;
  createdAt?: string;
};

export default function ProductPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/business/product");
      const json = await res.json();
      if (json.data) setItems(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    setSaving(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const payload = { title, description, ownerId: user?._id };
      const res = await fetch("/api/business/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.data) {
        setItems((s) => [json.data, ...s]);
        setTitle("");
        setDescription("");
      } else {
        alert(json.error || "Failed to create product");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedBusiness>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Product & Execution Engine</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          MVP scoping, feature scoring, sprint planner.
        </p>

        <div className="max-w-3xl space-y-6">
          <div className="p-4 border rounded-md">
            <h2 className="font-semibold mb-2">Create Product</h2>
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
              <div className="pt-2">
                <button
                  className="btn btn-primary"
                  onClick={onCreate}
                  disabled={saving || !title}
                >
                  {saving ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Products</h2>
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
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No products yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedBusiness>
  );
}
