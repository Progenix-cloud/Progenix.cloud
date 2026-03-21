"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type EngineItem = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  data?: any;
};

type Props = {
  item: EngineItem;
  endpoint: string;
  onUpdated: (item: EngineItem) => void;
  onDeleted: (id: string) => void;
};

const getUserId = () => {
  if (typeof window === "undefined") return "";
  const userStr = localStorage.getItem("user");
  if (!userStr) return "";
  try {
    const user = JSON.parse(userStr);
    return user?._id || "";
  } catch {
    return "";
  }
};

export default function EngineItemActions({
  item,
  endpoint,
  onUpdated,
  onDeleted,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [type, setType] = useState(item.type || "");
  const [dataText, setDataText] = useState(
    JSON.stringify(item.data ?? {}, null, 2)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const startEdit = () => {
    setEditing(true);
    setError("");
    setTitle(item.title || "");
    setDescription(item.description || "");
    setType(item.type || "");
    setDataText(JSON.stringify(item.data ?? {}, null, 2));
  };

  const save = async () => {
    const userId = getUserId();
    if (!userId) {
      setError("Missing user session");
      return;
    }
    let parsed: any = {};
    try {
      parsed = dataText ? JSON.parse(dataText) : {};
    } catch (e) {
      setError("Invalid JSON in data field");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${endpoint}/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          title,
          description,
          type,
          data: parsed,
        }),
      });
      const json = await res.json();
      if (json.data) {
        onUpdated(json.data);
        setEditing(false);
      } else {
        setError(json.error || "Failed to update");
      }
    } catch (e) {
      setError("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const userId = getUserId();
    if (!userId) {
      setError("Missing user session");
      return;
    }
    if (!confirm("Delete this item?")) return;
    try {
      await fetch(`${endpoint}/${item._id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });
      onDeleted(item._id);
    } catch (e) {
      setError("Failed to delete");
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={startEdit}>
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
      {editing && (
        <div className="w-full max-w-md p-3 border rounded-md bg-white dark:bg-gray-900">
          <div className="grid gap-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Textarea
              placeholder="Data (JSON)"
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              rows={6}
            />
            {error && <div className="text-xs text-destructive">{error}</div>}
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
