import { apiError, apiSuccess, withRBAC } from "@/lib/api-utils";
import { db } from "@/lib/db";

// Analytics endpoint
export const GET = withRBAC("analytics", "read", async () => {
  try {
    // Get key metrics
    const onTimeDelivery = await calculateOnTimeDelivery();
    const avgCompletionTime = await calculateAvgCompletionTime();
    const budgetAdherence = await calculateBudgetAdherence();
    const clientSatisfaction = await calculateClientSatisfaction();

    // Get chart data
    const projectTrendData = await getProjectTrendData();
    const taskCompletionData = await getTaskCompletionData();

    return apiSuccess({
      metrics: {
        onTimeDelivery,
        avgCompletionTime,
        budgetAdherence,
        clientSatisfaction,
      },
      charts: {
        projectTrendData,
        taskCompletionData,
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return apiError(
      "ANALYTICS_FETCH_FAILED",
      "Failed to fetch analytics data",
      500
    );
  }
});

// Calculate on-time delivery percentage
async function calculateOnTimeDelivery() {
  const projects = await db.getProjects();
  const completedProjects = projects.filter(
    (p: any) => p.status === "completed"
  );

  if (completedProjects.length === 0) return 0;

  const onTimeProjects = completedProjects.filter((p: any) => {
    if (!p.endDate) return true; // Assume on-time if no deadline
    const completedAt = p.completedDate || p.updatedAt || p.endDate;
    if (!completedAt) return true;
    return new Date(completedAt) <= new Date(p.endDate);
  });

  return Math.round((onTimeProjects.length / completedProjects.length) * 100);
}

// Calculate average completion time in days
async function calculateAvgCompletionTime() {
  const projects = await db.getProjects();
  const completedProjects = projects.filter(
    (p: any) =>
      p.status === "completed" &&
      p.startDate &&
      (p.completedDate || p.endDate)
  );

  if (completedProjects.length === 0) return 0;

  const totalDays = completedProjects.reduce((sum: number, p: any) => {
    const start = new Date(p.startDate);
    const end = new Date(p.completedDate || p.endDate);
    if (Number.isNaN(end.getTime())) return sum;
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  return Math.round(totalDays / completedProjects.length);
}

// Calculate budget adherence percentage
async function calculateBudgetAdherence() {
  const projects = await db.getProjects();
  const projectsWithBudget = projects.filter(
    (p: any) => p.budget && p.budget > 0
  );

  if (projectsWithBudget.length === 0) return 0;

  const withinBudget = projectsWithBudget.filter((p: any) => {
    const spent = p.spent || 0;
    return spent <= p.budget;
  });

  return Math.round((withinBudget.length / projectsWithBudget.length) * 100);
}

// Calculate client satisfaction rating
async function calculateClientSatisfaction() {
  const feedback = await db.getFeedback();
  if (feedback.length === 0) return 0;

  const totalRating = feedback.reduce(
    (sum: number, f: any) => sum + (f.rating || 0),
    0
  );
  const avgRating = totalRating / feedback.length;

  return Math.round(avgRating * 10) / 10; // Round to 1 decimal place
}

// Get project trend data for the last 3 months
async function getProjectTrendData() {
  const now = new Date();
  const months = [];

  for (let i = 2; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      yearNum: date.getFullYear(),
    });
  }

  const projects = await db.getProjects();

  return months.map(({ month, monthIndex, yearNum }) => {
    const monthProjects = projects.filter((p: any) => {
      if (!p.startDate) return false;
      const startDate = new Date(p.startDate);
      return (
        startDate.getMonth() === monthIndex &&
        startDate.getFullYear() === yearNum
      );
    });

    return {
      month,
      completed: monthProjects.filter((p: any) => p.status === "completed")
        .length,
      inProgress: monthProjects.filter((p: any) => p.status === "in-progress")
        .length,
      planning: monthProjects.filter((p: any) => p.status === "planning")
        .length,
    };
  });
}

// Get task completion data for the last 3 weeks
async function getTaskCompletionData() {
  const now = new Date();
  const weeks = [];

  for (let i = 2; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    weeks.push({
      week: `W${3 - i}`,
      startDate: weekStart,
      endDate: weekEnd,
    });
  }

  const tasks = await db.getTasks();

  return weeks.map(({ week, startDate, endDate }) => {
    const weekTasks = tasks.filter((t: any) => {
      if (!t.createdDate && !t.createdAt) return false;
      const createdAt = new Date(t.createdDate || t.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });

    const completed = weekTasks.filter(
      (t: any) => t.status === "completed"
    ).length;
    const pending = weekTasks.filter((t: any) =>
      ["scheduled", "pending", "in-progress"].includes(t.status)
    ).length;
    const overdue = weekTasks.filter((t: any) => {
      if (t.status !== "completed" && t.dueDate) {
        return new Date(t.dueDate) < now;
      }
      return false;
    }).length;
    return {
      week,
      completed,
      pending,
      overdue,
    };
  });
}
