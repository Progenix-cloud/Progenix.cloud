"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Lock, Users, Bell } from "lucide-react";

type User = {
  _id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
  phone?: string;
  role?: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
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
      setRole(u.role || "");
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

  const onSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload: Partial<User> & { avatarBase64?: string } = {
        name,
        phone,
        role,
      };
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
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage system configuration and permissions
        </p>
      </div>

      {/* Profile / Personal settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
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

          <label className="text-sm">Role</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} />

          <label className="text-sm">Avatar</label>
          <input type="file" accept="image/*" onChange={onFileChange} />

          <div className="pt-4 flex items-center gap-3">
            <Button onClick={onSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">General</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Organization Name</Label>
            <Input defaultValue="SoftAgent" className="mt-2" />
          </div>
          <div>
            <Label>Time Zone</Label>
            <Select defaultValue="utc">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">
                  UTC (Coordinated Universal Time)
                </SelectItem>
                <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
                <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Password Policy</Label>
            <Select defaultValue="strong">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-muted-foreground">
                Require 2FA for all users
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Update Security Settings</Button>
        </div>
      </Card>

      {/* Role-Based Access Control */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Permissions</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Project Managers</p>
              <p className="text-xs text-muted-foreground">
                Can create and manage projects
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Developers</p>
              <p className="text-xs text-muted-foreground">
                Can view projects and log time
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Clients</p>
              <p className="text-xs text-muted-foreground">
                Can access project portal
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Update Permissions</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">
            Notifications
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">
                Send notifications to email
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Daily Digest</p>
              <p className="text-xs text-muted-foreground">
                Receive daily project summary
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Deadline Alerts</p>
              <p className="text-xs text-muted-foreground">
                Alert on approaching deadlines
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Save Notification Settings</Button>
        </div>
      </Card>
    </div>
  );
}
