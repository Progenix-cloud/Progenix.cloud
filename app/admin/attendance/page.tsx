"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { buildAuthHeaders } from "@/lib/client-auth";
import { useAuthSession, ROLES } from "@/lib/hooks/useAuthSession";

interface Attendance {
  _id: string;
  userId: string;
  userName?: string;
  date: string;
  status: string;
  checkInTime: string;
  checkOutTime?: string;
  tasks: Array<{
    taskId: string;
    title: string;
    status: string;
    completedAt: string;
  }>;
  isAutoMarked: boolean;
  notes?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AttendancePage() {
  const {
    loading: authLoading,
    error: authError,
    hasRole,
  } = useAuthSession();
  const isPM = hasRole([ROLES.PROJECT_MANAGER]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);

      const [attendanceRes, usersRes] = await Promise.all([
        fetch(
          `/api/attendance?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}${selectedUser !== "all" ? `&userId=${selectedUser}` : ""}`,
          { headers: buildAuthHeaders() }
        ),
        fetch("/api/users", { headers: buildAuthHeaders() }),
      ]);

      const [attendanceData, usersData] = await Promise.all([
        attendanceRes.json(),
        usersRes.json(),
      ]);

      if (attendanceData.success) {
        // Add user names to attendance records using the users list
        const attendanceWithNames = attendanceData.data.map(
          (record: Attendance) => {
            const user = usersData.success
              ? usersData.data.find((u: User) => u._id === record.userId)
              : null;
            return {
              ...record,
              userName: user ? user.name : "Unknown User",
            };
          }
        );
        setAttendance(attendanceWithNames);
      }

      if (usersData.success) {
        setUsers(usersData.data);
        // Update attendance names if attendance was already loaded
        if (attendance.length > 0) {
          const updatedAttendance = attendance.map((record) => {
            const user = usersData.data.find(
              (u: User) => u._id === record.userId
            );
            return {
              ...record,
              userName: user ? user.name : record.userName || "Unknown User",
            };
          });
          setAttendance(updatedAttendance);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedUser, selectedMonth]);

  useEffect(() => {
    if (isPM) {
      fetchData();
    }
  }, [fetchData, isPM]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {authError ? `Auth error: ${authError}` : "Loading..."}
      </div>
    );
  }

  if (authError || !isPM) {
    return (
      <div className="p-8 text-center">Unauthorized (Project Manager only)</div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "half-day":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4" />;
      case "absent":
        return <XCircle className="w-4 h-4" />;
      case "late":
        return <Clock className="w-4 h-4" />;
      case "half-day":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === "present").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    const late = attendance.filter((a) => a.status === "late").length;
    const autoMarked = attendance.filter((a) => a.isAutoMarked).length;

    return { total, present, absent, late, autoMarked };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance Tracking</h1>
        <div className="flex gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.present}
                </div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.absent}
                </div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.autoMarked}
                </div>
                <div className="text-sm text-gray-600">Auto Marked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Month</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                className="rounded-md border"
                modifiers={{
                  hasAttendance: attendance
                    .map((a) => new Date(a.date))
                    .filter(Boolean),
                }}
                modifiersStyles={{
                  hasAttendance: {
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance Records - {format(selectedMonth, "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendance.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No attendance records found
                  </p>
                ) : (
                  attendance
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((record) => (
                      <div
                        key={record._id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{record.userName}</h4>
                            <p className="text-sm text-gray-600">
                              {format(
                                new Date(record.date),
                                "EEEE, MMM dd, yyyy"
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <Badge className={getStatusColor(record.status)}>
                              {record.status.toUpperCase()}
                            </Badge>
                            {record.isAutoMarked && (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Check In:</span>
                            <p>
                              {record.checkInTime
                                ? format(new Date(record.checkInTime), "HH:mm")
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Check Out:</span>
                            <p>
                              {record.checkOutTime
                                ? format(new Date(record.checkOutTime), "HH:mm")
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        {record.tasks && record.tasks.length > 0 && (
                          <div>
                            <span className="font-medium text-sm">
                              Tasks Completed:
                            </span>
                            <div className="mt-1 space-y-1">
                              {record.tasks.map((task) => (
                                <div
                                  key={task.taskId}
                                  className="text-xs bg-gray-50 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {task.title}
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    (
                                    {format(
                                      new Date(task.completedAt),
                                      "HH:mm"
                                    )}
                                    )
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.notes && (
                          <div>
                            <span className="font-medium text-sm">Notes:</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
