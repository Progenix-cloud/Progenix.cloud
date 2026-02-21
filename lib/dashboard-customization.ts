// Dashboard customization and personalization service
export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'chart' | 'list' | 'calendar' | 'cards' | 'timeline';
  title: string;
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  config?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store
const layoutStore = new Map<string, DashboardLayout>();

export const dashboardCustomizationService = {
  // Create dashboard layout
  createLayout: async (layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>): Promise<DashboardLayout> => {
    const id = `layout-${Date.now()}-${Math.random()}`;
    const fullLayout: DashboardLayout = {
      ...layout,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    layoutStore.set(`${layout.userId}-${id}`, fullLayout);
    console.log('[v0] Dashboard layout created:', fullLayout);
    return fullLayout;
  },

  // Get user dashboard layouts
  getUserLayouts: async (userId: string): Promise<DashboardLayout[]> => {
    const layouts: DashboardLayout[] = [];
    for (const [key, layout] of layoutStore) {
      if (key.startsWith(userId)) {
        layouts.push(layout);
      }
    }
    return layouts;
  },

  // Get default layout for user
  getDefaultLayout: async (userId: string): Promise<DashboardLayout | null> => {
    const layouts = await dashboardCustomizationService.getUserLayouts(userId);
    const defaultLayout = layouts.find(l => l.isDefault);
    return defaultLayout || (layouts.length > 0 ? layouts[0] : null);
  },

  // Update layout
  updateLayout: async (userId: string, layoutId: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout | null> => {
    const key = `${userId}-${layoutId}`;
    const layout = layoutStore.get(key);
    if (!layout) return null;

    const updated = {
      ...layout,
      ...updates,
      updatedAt: new Date(),
    };
    layoutStore.set(key, updated);
    return updated;
  },

  // Delete layout
  deleteLayout: async (userId: string, layoutId: string): Promise<boolean> => {
    return layoutStore.delete(`${userId}-${layoutId}`);
  },

  // Add widget to layout
  addWidget: async (
    userId: string,
    layoutId: string,
    widget: Omit<DashboardWidget, 'id' | 'position'>
  ): Promise<DashboardWidget | null> => {
    const layout = await dashboardCustomizationService.getLayout(userId, layoutId);
    if (!layout) return null;

    const id = `widget-${Date.now()}-${Math.random()}`;
    const position = Math.max(...layout.widgets.map(w => w.position), 0) + 1;

    const fullWidget: DashboardWidget = {
      ...widget,
      id,
      position,
    };

    layout.widgets.push(fullWidget);
    layout.updatedAt = new Date();

    return fullWidget;
  },

  // Remove widget from layout
  removeWidget: async (userId: string, layoutId: string, widgetId: string): Promise<boolean> => {
    const layout = await dashboardCustomizationService.getLayout(userId, layoutId);
    if (!layout) return false;

    const index = layout.widgets.findIndex(w => w.id === widgetId);
    if (index === -1) return false;

    layout.widgets.splice(index, 1);
    layout.updatedAt = new Date();

    return true;
  },

  // Reorder widgets
  reorderWidgets: async (userId: string, layoutId: string, widgetIds: string[]): Promise<boolean> => {
    const layout = await dashboardCustomizationService.getLayout(userId, layoutId);
    if (!layout) return false;

    const reorderedWidgets = widgetIds
      .map((id, index) => {
        const widget = layout.widgets.find(w => w.id === id);
        if (widget) {
          widget.position = index;
          return widget;
        }
        return null;
      })
      .filter(Boolean) as DashboardWidget[];

    layout.widgets = reorderedWidgets;
    layout.updatedAt = new Date();

    return true;
  },

  // Get layout
  getLayout: async (userId: string, layoutId: string): Promise<DashboardLayout | null> => {
    return layoutStore.get(`${userId}-${layoutId}`) || null;
  },

  // Preset layouts
  createDefaultLayouts: async (userId: string): Promise<DashboardLayout[]> => {
    const layouts: DashboardLayout[] = [];

    // Executive Layout
    const executiveLayout = await dashboardCustomizationService.createLayout({
      userId,
      name: 'Executive Dashboard',
      isDefault: true,
      widgets: [
        {
          id: 'widget-1',
          type: 'metrics',
          title: 'Key Metrics',
          enabled: true,
          position: 1,
          size: 'large',
          config: { metrics: ['projects', 'revenue', 'clients', 'team'] },
        },
        {
          id: 'widget-2',
          type: 'chart',
          title: 'Revenue Trend',
          enabled: true,
          position: 2,
          size: 'medium',
          config: { chartType: 'line', period: 'monthly' },
        },
        {
          id: 'widget-3',
          type: 'chart',
          title: 'Project Status Distribution',
          enabled: true,
          position: 3,
          size: 'medium',
          config: { chartType: 'pie' },
        },
      ],
    });
    layouts.push(executiveLayout);

    // Project Manager Layout
    const pmLayout = await dashboardCustomizationService.createLayout({
      userId,
      name: 'Project Manager Dashboard',
      isDefault: false,
      widgets: [
        {
          id: 'widget-4',
          type: 'metrics',
          title: 'Project Overview',
          enabled: true,
          position: 1,
          size: 'large',
          config: { metrics: ['active_projects', 'team_members', 'tasks_pending', 'risks'] },
        },
        {
          id: 'widget-5',
          type: 'list',
          title: 'My Projects',
          enabled: true,
          position: 2,
          size: 'medium',
        },
        {
          id: 'widget-6',
          type: 'timeline',
          title: 'Project Timeline',
          enabled: true,
          position: 3,
          size: 'large',
        },
      ],
    });
    layouts.push(pmLayout);

    // Team Member Layout
    const teamLayout = await dashboardCustomizationService.createLayout({
      userId,
      name: 'Team Member Dashboard',
      isDefault: false,
      widgets: [
        {
          id: 'widget-7',
          type: 'metrics',
          title: 'My Tasks',
          enabled: true,
          position: 1,
          size: 'medium',
          config: { metrics: ['assigned', 'in_progress', 'completed'] },
        },
        {
          id: 'widget-8',
          type: 'calendar',
          title: 'My Calendar',
          enabled: true,
          position: 2,
          size: 'large',
        },
        {
          id: 'widget-9',
          type: 'list',
          title: 'Upcoming Meetings',
          enabled: true,
          position: 3,
          size: 'medium',
        },
      ],
    });
    layouts.push(teamLayout);

    return layouts;
  },

  // Export layout
  exportLayout: async (userId: string, layoutId: string): Promise<string> => {
    const layout = await dashboardCustomizationService.getLayout(userId, layoutId);
    if (!layout) throw new Error('Layout not found');
    return JSON.stringify(layout, null, 2);
  },

  // Import layout
  importLayout: async (json: string, userId: string): Promise<DashboardLayout> => {
    const layoutData = JSON.parse(json);
    return dashboardCustomizationService.createLayout({
      ...layoutData,
      userId,
      name: `${layoutData.name} (Imported)`,
      isDefault: false,
    });
  },
};

export type DashboardCustomizationService = typeof dashboardCustomizationService;
