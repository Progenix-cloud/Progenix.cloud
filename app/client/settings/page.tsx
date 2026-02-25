"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ClientSettingsPage() {
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      setName(u.name || "");
      setPhone(u.phone || "");
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = { name, phone };
      if (avatarFile) {
        const b64 = await toBase64(avatarFile);
        payload.avatarBase64 = b64;
      }

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.data) {
        const updated = json.data;
        const merged = { ...user, ...updated };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser(merged);
        setMessage("Saved successfully");
      } else {
        setMessage(json.error || "Failed to save");
      }
    } catch (e) {
      setMessage("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      <div className="max-w-2xl bg-white dark:bg-gray-900 p-6 rounded-md shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-muted-foreground">
              Member since{" "}
              {user?.joinDate
                ? new Date(user.joinDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />

          <label className="text-sm">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label className="text-sm">Avatar</label>
          <input type="file" accept="image/*" onChange={onFileChange} />

          <div className="pt-4 flex items-center gap-3">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
