// Workflow automation engine
import { notificationsService } from "./notifications-service";

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    event:
      | "task_created"
      | "task_completed"
      | "project_created"
      | "project_completed"
      | "invoice_created"
      | "invoice_overdue"
      | "meeting_created"
      | "risk_created"
      | "milestone_reached"
      | "deadline_approaching";
    conditions?: Record<string, any>;
  };
  actions: Array<{
    type:
      | "notify"
      | "assign"
      | "update_status"
      | "create_task"
      | "send_email"
      | "escalate";
    config: Record<string, any>;
  }>;
  enabled: boolean;
  createdAt: Date;
  createdBy: string;
}

// In-memory rule store
const ruleStore = new Map<string, AutomationRule>();

export const automationRulesService = {
  // Create automation rule
  createRule: async (
    rule: Omit<AutomationRule, "id" | "createdAt">
  ): Promise<AutomationRule> => {
    const id = `rule-${Date.now()}-${Math.random()}`;
    const fullRule: AutomationRule = {
      ...rule,
      id,
      createdAt: new Date(),
    };

    ruleStore.set(id, fullRule);
    console.log("[v0] Automation rule created:", fullRule);
    return fullRule;
  },

  // Get all rules
  getRules: async (): Promise<AutomationRule[]> => {
    return Array.from(ruleStore.values());
  },

  // Get rule by ID
  getRule: async (id: string): Promise<AutomationRule | null> => {
    return ruleStore.get(id) || null;
  },

  // Update rule
  updateRule: async (
    id: string,
    updates: Partial<AutomationRule>
  ): Promise<AutomationRule | null> => {
    const rule = ruleStore.get(id);
    if (!rule) return null;

    const updated = { ...rule, ...updates };
    ruleStore.set(id, updated);
    return updated;
  },

  // Delete rule
  deleteRule: async (id: string): Promise<boolean> => {
    return ruleStore.delete(id);
  },

  // Execute automation based on trigger
  executeTrigger: async (
    event: AutomationRule["trigger"]["event"],
    data: Record<string, any>
  ): Promise<void> => {
    const rules = await automationRulesService.getRules();
    const applicableRules = rules.filter(
      (r) => r.enabled && r.trigger.event === event
    );

    for (const rule of applicableRules) {
      try {
        // Check conditions
        if (
          rule.trigger.conditions &&
          !automationRulesService.evaluateConditions(
            rule.trigger.conditions,
            data
          )
        ) {
          continue;
        }

        // Execute actions
        for (const action of rule.actions) {
          await automationRulesService.executeAction(action, data);
        }

        console.log("[v0] Automation rule executed:", rule.id);
      } catch (error) {
        console.error("[v0] Automation rule error:", error);
      }
    }
  },

  // Evaluate conditions
  evaluateConditions: (
    conditions: Record<string, any>,
    data: Record<string, any>
  ): boolean => {
    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) return false;
    }
    return true;
  },

  // Execute action
  executeAction: async (
    action: AutomationRule["actions"][0],
    data: Record<string, any>
  ): Promise<void> => {
    switch (action.type) {
      case "notify":
        await notificationsService.createNotification({
          userId: action.config.userId || data.userId,
          type: action.config.notificationType || "approval",
          title: action.config.title || "Automated Notification",
          message: action.config.message || "",
          read: false,
        });
        break;

      case "assign":
        // Would update task/project assignment
        console.log("[v0] Auto-assign action:", action.config);
        break;

      case "update_status":
        // Would update entity status
        console.log("[v0] Auto-update status:", action.config);
        break;

      case "create_task":
        // Would create a new task
        console.log("[v0] Auto-create task:", action.config);
        break;

      case "send_email":
        // Would send email
        console.log("[v0] Auto-send email:", action.config);
        break;

      case "escalate":
        // Would escalate to manager
        await notificationsService.onApprovalNeeded(
          action.config.managerId,
          "escalation",
          data.resourceId
        );
        break;
    }
  },

  // Pre-built rules
  createDefaultRules: async (userId: string): Promise<void> => {
    // Rule: Notify on task overdue
    await automationRulesService.createRule({
      name: "Notify on Task Overdue",
      trigger: {
        event: "task_created",
      },
      actions: [
        {
          type: "notify",
          config: {
            userId,
            notificationType: "deadline",
            title: "Task Reminder",
            message: "Your task is due soon",
          },
        },
      ],
      enabled: true,
      createdBy: userId,
    });

    // Rule: Create follow-up task on project completion
    await automationRulesService.createRule({
      name: "Auto-create Follow-up Tasks",
      trigger: {
        event: "project_completed",
      },
      actions: [
        {
          type: "create_task",
          config: {
            title: "Post-Project Review",
            description: "Complete post-project review and lessons learned",
            priority: "medium",
          },
        },
      ],
      enabled: true,
      createdBy: userId,
    });

    // Rule: Escalate overdue invoices
    await automationRulesService.createRule({
      name: "Escalate Overdue Invoices",
      trigger: {
        event: "invoice_overdue",
      },
      actions: [
        {
          type: "escalate",
          config: {
            managerId: userId,
          },
        },
        {
          type: "send_email",
          config: {
            template: "invoice_reminder",
          },
        },
      ],
      enabled: true,
      createdBy: userId,
    });
  },
};

export type AutomationRulesService = typeof automationRulesService;
