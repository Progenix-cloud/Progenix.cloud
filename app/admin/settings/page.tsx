'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Lock, Users, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage system configuration and permissions
        </p>
      </div>

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
                <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
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
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
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
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
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
