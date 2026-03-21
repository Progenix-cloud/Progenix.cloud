"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { buildAuthHeaders } from "@/lib/client-auth";
import { toast } from "sonner";

export default function CreateNotificationPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<
    "all" | "admins" | "clients" | "both" | "users"
  >("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users", { headers: buildAuthHeaders() });
      const json = await res.json();
      if (json.success) setUsers(json.data || []);
    };
    fetchUsers();
  }, []);

  const submit = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    if (target === "users" && selectedUsers.length === 0) {
      toast.error("Select at least one user for custom recipients");
      return;
    }

    const payload: any = { title, message, type: "message", target };
    if (target === "users") {
      payload.userIds = selectedUsers;
    }

    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      const createdCount = json?.data?.createdCount || 0;
      toast.success(`Created ${createdCount} notifications`);
      window.location.href = "/admin/notifications";
    } else {
      toast.error("Failed to create notification");
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUsers((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Notification</h1>

      <div className="max-w-2xl space-y-4">
        <Input
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <Textarea
          value={message}
          onChange={(e: any) => setMessage(e.target.value)}
          placeholder="Message"
        />

        <div className="flex flex-wrap items-center gap-4">
          {[
            { value: "all", label: "Publish to all users" },
            { value: "admins", label: "Publish to admins only" },
            { value: "clients", label: "Publish to clients only" },
            { value: "both", label: "Publish to admins and clients" },
            { value: "users", label: "Publish to selected users" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="notification-target"
                value={option.value}
                checked={target === option.value}
                onChange={() => setTarget(option.value as any)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {target === "users" && (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border p-2">
            {users.map((u) => (
              <label key={u._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                />
                <span>
                  {u.name} ({u.email})
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={submit}>Create</Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/admin/notifications")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
