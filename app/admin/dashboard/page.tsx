"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Smile,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Target,
  Video,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const mockAttendanceData = [
  { name: "Mon", present: 18, absent: 2 },
  { name: "Tue", present: 19, absent: 1 },
  { name: "Wed", present: 17, absent: 3 },
  { name: "Thu", present: 20, absent: 0 },
  { name: "Fri", present: 18, absent: 2 },
];

const mockMoodData = [
  { mood: "Very Happy", value: 35, fill: "#10b981" },
  { mood: "Happy", value: 40, fill: "#3b82f6" },
  { mood: "Neutral", value: 20, fill: "#f59e0b" },
  { mood: "Sad", value: 5, fill: "#ef4444" },
];

const mockScheduleData = [
  { time: "9:00 AM", task: "Team Standup", attendees: 12 },
  { time: "10:30 AM", task: "Project Planning", attendees: 8 },
  { time: "2:00 PM", task: "Client Call", attendees: 5 },
  { time: "3:30 PM", task: "Design Review", attendees: 6 },
];

const mockGoals = [
  { title: "Complete Project X", progress: 75, dueDate: "Mar 15" },
  { title: "Team Onboarding", progress: 50, dueDate: "Mar 20" },
  { title: "Quarterly Review", progress: 25, dueDate: "Mar 31" },
];

export default function AdminDashboardPage() {
  const [anonymousFeedback, setAnonymousFeedback] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Total Team Members
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                24
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Today&apos;s Attendance
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                20/24
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Scheduled Meetings
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                4
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Active Goals
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                3
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar & Schedule */}
        <Card className="lg:col-span-1 border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Calendar
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {mockScheduleData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {item.time}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.task}
                    </p>
                  </div>
                  <Badge variant="secondary">{item.attendees}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Moody Board */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Smile className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Team Mood
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockMoodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {mockMoodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {mockMoodData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.mood}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Attendance */}
        <Card className="lg:col-span-1 border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Attendance
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" stackId="a" fill="#10b981" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anonymous Feedback */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Anonymous Feedback
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Recent Feedback:
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Great communication and teamwork this week! 👍
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                Team feels motivated about new projects
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Need better communication on deadlines
              </p>
            </div>
            <Textarea
              placeholder="Submit anonymous feedback..."
              value={anonymousFeedback}
              onChange={(e) => setAnonymousFeedback(e.target.value)}
              className="text-xs"
            />
            <Button size="sm" className="w-full">
              Submit Feedback
            </Button>
          </div>
        </Card>

        {/* Support */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Support
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900">
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                Urgent: System Maintenance
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Scheduled for Mar 15, 2:00 AM
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                Reminder: Update Your Profile
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Complete your profile information
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                New Feature Released
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Check out the new analytics dashboard
              </p>
            </div>
            <Textarea
              placeholder="Send a support request..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              className="text-xs"
            />
            <Button size="sm" className="w-full">
              Send Support Request
            </Button>
          </div>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Goals
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {mockGoals.map((goal, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {goal.title}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {goal.dueDate}
                  </Badge>
                </div>
                <Progress
                  value={goal.progress}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {goal.progress}% Complete
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Analytics */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Analytics
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={[
                  { week: "W1", performance: 65 },
                  { week: "W2", performance: 72 },
                  { week: "W3", performance: 68 },
                  { week: "W4", performance: 85 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="performance"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* My Schedule */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              My Schedule
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {mockScheduleData.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 min-w-16">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {item.task}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.attendees} attendees
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fourth Row - Meetings Partition & Global Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meets Partition */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Meets Partition
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Engineering Team
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  8 members online
                </p>
              </div>
              <Button size="sm" variant="outline">
                Join
              </Button>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Product Meeting
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  5 members online
                </p>
              </div>
              <Button size="sm" variant="outline">
                Join
              </Button>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-900 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Client Presentation
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3 members online
                </p>
              </div>
              <Button size="sm" variant="outline">
                Join
              </Button>
            </div>
          </div>
        </Card>

        {/* Global Chat */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Global Chat
            </h2>
          </div>
          <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                JD
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  John Doe
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Great work on the new design! 🎨
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                SM
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Sarah Miller
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Thanks! Ready for the presentation
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                AJ
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Alex Johnson
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Let&apos;s schedule a sync tomorrow
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Input placeholder="Type a message..." className="text-xs" />
              <Button size="sm" variant="ghost">
                <Send className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
