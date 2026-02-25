"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notifications");
    const json = await res.json();
    if (json.success) setNotifications(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startEdit = (notif: any) => {
    setEditingId(notif.id);
    setTitle(notif.title);
    setMessage(notif.message);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const res = await fetch("/api/admin/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, updates: { title, message } }),
    });
    const json = await res.json();
    if (json.success) {
      setEditingId(null);
      setTitle("");
      setMessage("");
      fetchAll();
    }
  };

  const del = async (id: string) => {
    await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    fetchAll();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Notifications</h1>
        <Button
          onClick={() => (window.location.href = "/admin/notifications/create")}
        >
          Create +
        </Button>
      </div>

      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 border rounded flex justify-between items-start"
              >
                <div>
                  <div className="text-sm text-muted-foreground">
                    {n.type} • {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm">{n.message}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" onClick={() => startEdit(n)}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => del(n.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-xl">
            <h2 className="text-lg font-semibold mb-3">Edit Notification</h2>
            <Input
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <Textarea
              className="mt-3"
              value={message}
              onChange={(e: any) => setMessage(e.target.value)}
              placeholder="Message"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
