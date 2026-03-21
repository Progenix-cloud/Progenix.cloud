import { apiError, apiSuccess, withRBAC } from "@/lib/api-utils";
import { db } from "@/lib/db";

// Dashboard stats endpoint
export const GET = withRBAC("dashboard", "read", async () => {
  try {
    // Get total team members
    const users = await db.getUsers();
    const totalTeamMembers = users.length;

    // Get active projects
    const projects = await db.getProjects();
    const activeProjects = projects.filter((p: any) =>
      ["planning", "in-progress"].includes(p.status)
    ).length;

    // Get total leads
    const leads = await db.getLeads();
    const totalLeads = leads.length;

    // Get recent notifications count
    const notifications = await db.getAllNotifications();
    const recentNotifications = notifications.filter((n: any) => {
      const createdDate = new Date(n.createdAt || n.createdDate || n.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;

    // Get attendance data for the current week
    const attendanceChartData = await getAttendanceData();
    const attendanceData = {
      present: attendanceChartData.reduce((sum, day) => sum + day.present, 0),
      total: attendanceChartData.reduce(
        (sum, day) => sum + day.present + day.absent,
        0
      ),
    };

    // Get mood/sentiment data
    const moodData = await getMoodData();

    // Get schedule data
    const scheduleData = await getScheduleData();

    // Timeline items for gantt calendar
    const timelineItems = await getTimelineItems();

    // Get goals data
    const goalsData = await getGoalsData();

    // Recent feedback & support
    const recentFeedback = await getRecentFeedback();
    const supportRequests = await getSupportRequests();

    // Performance chart data
    const performanceData = await getPerformanceData();

    // Global chat messages
    const globalChat = await getGlobalChat();

    // Meetings partition data
    const meetingsPartition = await getMeetingsPartition();

    return apiSuccess({
      totalTeamMembers,
      activeProjects,
      totalLeads,
      recentNotifications,
      attendanceData,
      attendanceChartData,
      moodData,
      scheduleData,
      timelineItems,
      goalsData,
      recentFeedback,
      supportRequests,
      performanceData,
      globalChat,
      meetingsPartition,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return apiError(
      "DASHBOARD_FETCH_FAILED",
      "Failed to fetch dashboard data",
      500
    );
  }
});

// Helper function to get attendance data
async function getAttendanceData() {
  const now = new Date();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  );
  const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

  const attendanceRecords = await db.getAttendance({
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString(),
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return days.map((day, index) => {
    const dayDate = new Date(
      startOfWeek.getTime() + index * 24 * 60 * 60 * 1000
    );
    const dayRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getFullYear() === dayDate.getFullYear() &&
        recordDate.getMonth() === dayDate.getMonth() &&
        recordDate.getDate() === dayDate.getDate()
      );
    });

    return {
      name: day,
      present: dayRecords.filter((r) => r.status === "present").length,
      absent: dayRecords.filter((r) => r.status === "absent").length,
    };
  });
}

// Helper function to get mood/sentiment data
async function getMoodData() {
  // Prefer explicit mood entries if available
  const moodFeedback = await db.getFeedback({ category: "mood" });
  if (moodFeedback.length > 0) {
    const latestByUser = new Map<string, any>();
    moodFeedback.forEach((fb: any) => {
      const key = fb.userId || fb.clientId || fb.id;
      if (!key) return;
      const existing = latestByUser.get(key);
      const fbDate = new Date(fb.date || fb.createdAt || 0);
      const existingDate = existing
        ? new Date(existing.date || existing.createdAt || 0)
        : null;
      if (!existing || (existingDate && fbDate > existingDate)) {
        latestByUser.set(key, fb);
      }
    });

    const entries =
      latestByUser.size > 0 ? Array.from(latestByUser.values()) : moodFeedback;

    const moodMap: Record<string, number> = {
      ready: 0,
      busy: 0,
      low: 0,
      rest: 0,
    };

    entries.forEach((fb: any) => {
      const mood = String(fb.mood || "").toLowerCase();
      if (mood in moodMap) {
        moodMap[mood] += 1;
      }
    });

    const total = Object.values(moodMap).reduce((a, b) => a + b, 0) || 1;
    return [
      {
        mood: "Ready",
        value: Math.round((moodMap.ready / total) * 100),
        fill: "#10b981",
      },
      {
        mood: "Busy",
        value: Math.round((moodMap.busy / total) * 100),
        fill: "#f59e0b",
      },
      {
        mood: "Low",
        value: Math.round((moodMap.low / total) * 100),
        fill: "#ef4444",
      },
      {
        mood: "Rest",
        value: Math.round((moodMap.rest / total) * 100),
        fill: "#3b82f6",
      },
    ];
  }

  // Fallback to rating-based sentiment
  const feedback = await db.getFeedback();
  const moodMap = { happy: 0, neutral: 0, sad: 0 };
  feedback.forEach((fb) => {
    if (typeof fb.rating !== "number") return;
    if (fb.rating >= 4) moodMap.happy++;
    else if (fb.rating === 3) moodMap.neutral++;
    else moodMap.sad++;
  });
  const total = Object.values(moodMap).reduce((a, b) => a + b, 0) || 1;
  return [
    {
      mood: "Happy",
      value: Math.round((moodMap.happy / total) * 100),
      fill: "#10b981",
    },
    {
      mood: "Neutral",
      value: Math.round((moodMap.neutral / total) * 100),
      fill: "#f59e0b",
    },
    {
      mood: "Unhappy",
      value: Math.round((moodMap.sad / total) * 100),
      fill: "#ef4444",
    },
  ];
}

// Helper function to get schedule data
async function getScheduleData() {
  const meetings = await db.getMeetings({ status: "scheduled" });
  const today = new Date();
  const upcomingMeetings = meetings
    .filter((meeting: any) => new Date(meeting.date) >= today)
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .slice(0, 4)
    .map((meeting: any) => ({
      time: new Date(meeting.date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      task: meeting.title,
      attendees: meeting.attendees?.length || 0,
      meetingLink: meeting.meetingLink || null,
      meetingId: meeting._id,
    }));

  return upcomingMeetings;
}

async function getTimelineItems() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);

  const items: Array<{
    id: string;
    type: "meeting" | "milestone";
    title: string;
    date: string;
    projectId?: string;
    projectName?: string;
  }> = [];

  const meetings = await db.getMeetings({ status: "scheduled" });
  meetings.forEach((meeting: any) => {
    const date = new Date(meeting.date);
    if (Number.isNaN(date.getTime())) return;
    if (date < start || date > end) return;
    items.push({
      id: meeting._id,
      type: "meeting",
      title: meeting.title || "Meeting",
      date: meeting.date,
      projectId: meeting.projectId,
    });
  });

  const projects = await db.getProjects();
  projects.forEach((project: any) => {
    (project.milestones || []).forEach((milestone: any, idx: number) => {
      if (!milestone?.dueDate) return;
      const date = new Date(milestone.dueDate);
      if (Number.isNaN(date.getTime())) return;
      if (date < start || date > end) return;
      items.push({
        id: milestone.id || `${project._id}-${idx}`,
        type: "milestone",
        title: milestone.name || "Milestone",
        date: milestone.dueDate,
        projectId: project._id,
        projectName: project.name,
      });
    });
  });

  return items.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// Helper function to get goals data
async function getGoalsData() {
  const projects = await db.getProjects();
  const goals = [];

  for (const project of projects.slice(0, 3)) {
    const tasks = await db.getTasks({ projectId: project._id });
    let progress = 0;

    if (tasks.length > 0) {
      const completed = tasks.filter((t: any) =>
        ["completed", "reviewed"].includes(t.status)
      ).length;
      progress = Math.round((completed / tasks.length) * 100);
    } else if (project.milestones?.length) {
      const completed = project.milestones.filter(
        (m: any) => m.status === "completed"
      ).length;
      progress = Math.round((completed / project.milestones.length) * 100);
    } else if (typeof project.progress === "number") {
      progress = Math.round(project.progress);
    }

    const dueSource =
      project.deadline ||
      project.endDate ||
      project.startDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(dueSource).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    goals.push({
      title: project.name,
      progress,
      dueDate,
      projectId: project._id,
    });
  }

  return goals;
}

async function getRecentFeedback() {
  const anonymous = await db.getFeedback({ category: "anonymous", limit: 3 });
  if (anonymous.length > 0) return anonymous;
  const recent = await db.getFeedback({ limit: 6 });
  return recent.filter((fb: any) => fb.category !== "mood").slice(0, 3);
}

async function getSupportRequests() {
  return db.getFeedback({ category: "support", limit: 3 });
}

async function getPerformanceData() {
  const tasks = await db.getTasks();
  const now = new Date();
  const weeks: { week: string; performance: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekTasks = tasks.filter((t: any) => {
      if (!t.createdDate && !t.createdAt) return false;
      const created = new Date(t.createdAt || t.createdDate);
      if (Number.isNaN(created.getTime())) return false;
      return created >= weekStart && created <= weekEnd;
    });

    const completed = weekTasks.filter((t: any) =>
      ["completed", "reviewed"].includes(t.status)
    ).length;
    const performance = weekTasks.length
      ? Math.round((completed / weekTasks.length) * 100)
      : 0;

    weeks.push({
      week: `W${4 - i}`,
      performance,
    });
  }

  return weeks;
}

async function getGlobalChat() {
  const messages = await db.getMessages({ projectId: "global" });
  return messages.slice(0, 20);
}

async function getMeetingsPartition() {
  const meetings = await db.getMeetings({ status: "scheduled" });
  const now = new Date();
  return meetings
    .filter((m: any) => new Date(m.date) >= now)
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .slice(0, 3)
    .map((m: any) => ({
      id: m._id,
      title: m.title,
      attendees: m.attendees?.length || 0,
      meetingLink: m.meetingLink || null,
      date: m.date,
    }));
}
