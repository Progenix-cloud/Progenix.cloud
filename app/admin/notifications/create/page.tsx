"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateNotificationPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [publishAll, setPublishAll] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/clients");
      const json = await res.json();
      if (json.success) setUsers(json.data || []);
    };
    fetchUsers();
  }, []);

  const submit = async () => {
    const payload: any = { title, message, type: "message" };
    if (publishAll) payload.target = "all";
    else {
      payload.target = "users";
      payload.userIds = selectedUsers;
    }

    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      alert(`Created ${json.createdCount || 0} notifications`);
      window.location.href = "/admin/notifications";
    } else {
      alert("Failed to create notification");
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

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={publishAll}
              onChange={() => setPublishAll(true)}
            />
            <span>Publish to all users</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!publishAll}
              onChange={() => setPublishAll(false)}
            />
            <span>Publish to selected clients</span>
          </label>
        </div>

        {!publishAll && (
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
