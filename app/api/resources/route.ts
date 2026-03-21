import { db } from "@/lib/db";
import { apiError, apiSuccess, withRBAC } from "@/lib/api-utils";

// Resources endpoint
export const GET = withRBAC("resource", "read", async () => {
  try {
    const users = await db.getUsers();

    // Get all tasks
    const tasks = await db.getTasks();

    // Get time logs for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const timeLogs = await db.getTimeLogs({
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    });

    // Calculate resource utilization by role
    const roleStats = calculateResourceUtilization(users, tasks, timeLogs);

    // Calculate overall stats
    const totalTeamMembers = users.length;
    const activeProjects = new Set(tasks.map((t) => t.projectId)).size;
    const avgUtilization =
      roleStats.length > 0
        ? Math.round(
            roleStats.reduce(
              (sum, role) => sum + parseFloat(role.utilization),
              0
            ) / roleStats.length
          )
        : 0;

    return apiSuccess({
      totalTeamMembers,
      activeProjects,
      avgUtilization,
      teamCapacity: roleStats,
    });
  } catch (error) {
    console.error("Resources fetch error:", error);
    return apiError(
      "RESOURCES_FETCH_FAILED",
      "Failed to fetch resource data",
      500
    );
  }
});

// Calculate resource utilization by role
function calculateResourceUtilization(
  users: any[],
  tasks: any[],
  timeLogs: any[]
) {
  // Group users by role
  const usersByRole: Record<string, any[]> = {};
  users.forEach((user) => {
    const role = user.role || "developer"; // Default to developer if no role
    if (!usersByRole[role]) usersByRole[role] = [];
    usersByRole[role].push(user);
  });

  // Calculate utilization for each role
  const roleStats = Object.entries(usersByRole).map(([role, roleUsers]) => {
    const totalUsers = roleUsers.length;

    // Count allocated users (those with active tasks)
    const allocatedUsers = new Set();
    tasks.forEach((task) => {
      if (task.assignedTo && roleUsers.find((u) => u._id === task.assignedTo)) {
        allocatedUsers.add(task.assignedTo);
      }
    });
    const allocated = allocatedUsers.size;

    // Available users (total - allocated)
    const available = Math.max(0, totalUsers - allocated);

    // Calculate utilization based on time logs
    const roleTimeLogs = timeLogs.filter((log) =>
      roleUsers.find((u) => u._id === log.userId)
    );

    let totalLoggedHours = 0;
    let totalEstimatedHours = 0;

    // For each user in this role, calculate their utilization
    roleUsers.forEach((user) => {
      const userTimeLogs = timeLogs.filter((log) => log.userId === user._id);
      const userTasks = tasks.filter((task) => task.assignedTo === user._id);

      const loggedHours = userTimeLogs.reduce(
        (sum, log) => sum + (log.hours || 0),
        0
      );
      const estimatedHours = userTasks.reduce(
        (sum, task) => sum + (task.estimatedHours || 0),
        0
      );

      totalLoggedHours += loggedHours;
      totalEstimatedHours += Math.max(estimatedHours, 40); // Assume 40 hours/week minimum
    });

    // Calculate utilization percentage
    const utilization =
      totalEstimatedHours > 0
        ? Math.min(
            100,
            Math.round((totalLoggedHours / totalEstimatedHours) * 100)
          )
        : allocated > 0
          ? 50
          : 0; // Default utilization if no data

    return {
      role: role.charAt(0).toUpperCase() + role.slice(1).replace("_", " "),
      allocated,
      available,
      utilization: `${utilization}%`,
      utilizationValue: utilization,
    };
  });

  // Sort by utilization descending
  return roleStats.sort((a, b) => b.utilizationValue - a.utilizationValue);
}
