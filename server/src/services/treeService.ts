import Action from '../models/Action';
import Person from '../models/Person';
import Initiative from '../models/Initiative';
import Organization from '../models/Organization';
import type { IReminder } from '../models/Reminder';

export interface TreeGrowthData {
  trunkSize: number;
  branches: BranchData[];
  totalLeaves: number;
  growthLevel: number;
}

export interface BranchData {
  id: string;
  name: string;
  leafCount: number;
  angle: number;
  length: number;
}

export async function calculateInnerCircleGrowth(userId: string): Promise<TreeGrowthData> {
  const people = await Person.find({ userId });
  const actions = await Action.find({ userId, completed: true });

  const branches: BranchData[] = people.map((person, index) => {
    const personActions = actions.filter(a => a.personId?.toString() === person._id.toString());
    const angle = (index / Math.max(people.length, 1)) * 360;

    return {
      id: person._id.toString(),
      name: person.name,
      leafCount: personActions.length,
      angle,
      length: Math.min(50 + personActions.length * 5, 150),
    };
  });

  const totalLeaves = branches.reduce((sum, b) => sum + b.leafCount, 0);
  const trunkSize = Math.min(20 + totalLeaves * 2, 100);
  const growthLevel = Math.floor(totalLeaves / 10);

  return { trunkSize, branches, totalLeaves, growthLevel };
}

export async function calculateCommunityTreeGrowth(userId: string): Promise<TreeGrowthData> {
  const initiatives = await Initiative.find({ userId });
  const actions = await Action.find({ userId, completed: true, initiativeId: { $exists: true } });

  const branches: BranchData[] = initiatives.map((initiative, index) => {
    const initiativeActions = actions.filter(
      a => a.initiativeId?.toString() === initiative._id.toString()
    );
    const impactMultiplier = initiative.impactLevel === 'high' ? 3 : initiative.impactLevel === 'medium' ? 2 : 1;
    const angle = (index / Math.max(initiatives.length, 1)) * 360;

    return {
      id: initiative._id.toString(),
      name: initiative.title,
      leafCount: initiativeActions.length * impactMultiplier,
      angle,
      length: Math.min(40 + initiativeActions.length * 8, 120),
    };
  });

  const totalLeaves = branches.reduce((sum, b) => sum + b.leafCount, 0);
  const trunkSize = Math.min(15 + totalLeaves * 3, 90);
  const growthLevel = Math.floor(totalLeaves / 8);

  return { trunkSize, branches, totalLeaves, growthLevel };
}

export async function calculateOuterCircleGrowth(userId: string): Promise<TreeGrowthData> {
  const organizations = await Organization.find({ userId, followed: true });
  const actions = await Action.find({ userId, completed: true, organizationId: { $exists: true } });

  const branches: BranchData[] = organizations.map((org, index) => {
    const orgActions = actions.filter(
      a => a.organizationId?.toString() === org._id.toString()
    );
    const angle = (index / Math.max(organizations.length, 1)) * 360;

    return {
      id: org._id.toString(),
      name: org.name,
      leafCount: orgActions.length,
      angle,
      length: Math.min(35 + orgActions.length * 6, 100),
    };
  });

  const totalLeaves = branches.reduce((sum, b) => sum + b.leafCount, 0);
  const trunkSize = Math.min(10 + totalLeaves * 2, 80);
  const growthLevel = Math.floor(totalLeaves / 5);

  return { trunkSize, branches, totalLeaves, growthLevel };
}

export interface DashboardMetrics {
  actionsThisWeek: number;
  innerCircleGrowth: TreeGrowthData;
  communityGrowth: TreeGrowthData;
  outerCircleGrowth: TreeGrowthData;
  streakDays: number;
  milestones: string[];
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const actionsThisWeek = await Action.countDocuments({
    userId,
    completed: true,
    completedAt: { $gte: weekAgo },
  });

  const [innerCircleGrowth, communityGrowth, outerCircleGrowth] = await Promise.all([
    calculateInnerCircleGrowth(userId),
    calculateCommunityTreeGrowth(userId),
    calculateOuterCircleGrowth(userId),
  ]);

  const User = (await import('../models/User')).default;
  const user = await User.findById(userId);
  const streakDays = user?.streakDays || 0;

  // Calculate milestones
  const milestones: string[] = [];
  if (innerCircleGrowth.totalLeaves >= 10) milestones.push('First 10 acts of kindness');
  if (innerCircleGrowth.totalLeaves >= 50) milestones.push('Kindness Champion');
  if (communityGrowth.totalLeaves >= 5) milestones.push('Community Builder');
  if (outerCircleGrowth.totalLeaves >= 3) milestones.push('Giving Heart');
  if (streakDays >= 7) milestones.push('Week Warrior');
  if (streakDays >= 30) milestones.push('Monthly Master');

  return {
    actionsThisWeek,
    innerCircleGrowth,
    communityGrowth,
    outerCircleGrowth,
    streakDays,
    milestones,
  };
}

// ─── Expanded Dashboard Summary ──────────────────────────────────────────────

export interface TodayAction {
  _id: string;
  title: string;
  status: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  personId?: string;
  initiativeId?: string;
  organizationId?: string;
}

export interface UpcomingReminder {
  id: string;
  message: string;
  entityType: string;
  entityId: string;
  entityName: string;
  nextTriggerAt: string;
}

export interface CompletedActivity {
  _id: string;
  title: string;
  completedAt: string;
  category?: string;
}

export interface InnerCircleStats {
  contactedThisWeek: number;
  staleConnections: number;
}

export interface CommunityStats {
  activeInitiatives: number;
  taskCompletionPercent: number;
}

export interface OuterCircleStats {
  followedOrganizations: number;
  upcomingEvents: number;
}

export interface MonthlySummary {
  actionsCompleted: number;
  avgPerWeek: number;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  todayActions: TodayAction[];
  upcomingReminders: UpcomingReminder[];
  recentCompleted: CompletedActivity[];
  innerCircleStats: InnerCircleStats;
  communityStats: CommunityStats;
  outerCircleStats: OuterCircleStats;
  monthlySummary: MonthlySummary;
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  // Base metrics
  const metrics = await getDashboardMetrics(userId);

  // Today's pending/due actions
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayActionsRaw = await Action.find({
    userId,
    $or: [
      { status: 'pending', dueDate: { $lte: endOfDay, $gte: startOfDay } },
      { status: 'pending', dueDate: null },
    ],
  }).sort({ priority: -1, dueDate: 1 }).limit(10).lean();

  const todayActions: TodayAction[] = todayActionsRaw.map(a => ({
    _id: a._id.toString(),
    title: a.title,
    status: a.status,
    priority: a.priority,
    category: a.category,
    dueDate: a.dueDate?.toISOString(),
    personId: a.personId?.toString(),
    initiativeId: a.initiativeId?.toString(),
    organizationId: a.organizationId?.toString(),
  }));

  // Upcoming reminders (next 5 by nextTriggerAt)
  const Reminder = (await import('../models/Reminder')).default;
  const upcomingRaw = await Reminder.find({
    userId,
    isActive: true,
  }).sort({ nextTriggerAt: 1 }).limit(5).lean();

  const upcomingReminders: UpcomingReminder[] = upcomingRaw.map((r: any) => ({
    id: r._id.toString(),
    message: r.message,
    entityType: r.entityType,
    entityId: r.entityId.toString(),
    entityName: '', // resolved below
    nextTriggerAt: r.nextTriggerAt?.toISOString() || '',
  }));

  // Resolve entity names for reminders
  for (const reminder of upcomingReminders) {
    if (reminder.entityType === 'person') {
      const person = await Person.findById(reminder.entityId);
      reminder.entityName = person?.name || 'Unknown';
    } else if (reminder.entityType === 'initiative') {
      const initiative = await Initiative.findById(reminder.entityId);
      reminder.entityName = initiative?.title || 'Unknown';
    } else if (reminder.entityType === 'organization') {
      const org = await Organization.findById(reminder.entityId);
      reminder.entityName = org?.name || 'Unknown';
    }
  }

  // Recently completed (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentCompletedRaw = await Action.find({
    userId,
    completed: true,
    completedAt: { $gte: weekAgo },
  }).sort({ completedAt: -1 }).limit(10).lean();

  const recentCompleted: CompletedActivity[] = recentCompletedRaw.map(a => ({
    _id: a._id.toString(),
    title: a.title,
    completedAt: (a.completedAt as Date)?.toISOString() || '',
    category: a.category,
  }));

  // Inner circle stats
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [contactedThisWeek, staleConnections] = await Promise.all([
    Person.countDocuments({
      userId,
      lastContactDate: { $gte: weekAgo },
    }),
    Person.countDocuments({
      userId,
      lastContactDate: { $lt: twoWeeksAgo },
    }),
  ]);

  const innerCircleStats: InnerCircleStats = { contactedThisWeek, staleConnections };

  // Community stats
  const activeInitiatives = await Initiative.countDocuments({
    userId,
    status: 'active',
  });

  const allInitiatives = await Initiative.find({ userId }).lean();
  let totalTasks = 0;
  let completedTasks = 0;
  for (const init of allInitiatives) {
    if (init.tasks) {
      totalTasks += init.tasks.length;
      completedTasks += init.tasks.filter((t: any) => t.completed).length;
    }
  }
  const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const communityStats: CommunityStats = { activeInitiatives, taskCompletionPercent };

  // Outer circle stats
  const followedOrganizations = await Organization.countDocuments({
    userId,
    followed: true,
  });

  const outerCircleStats: OuterCircleStats = { followedOrganizations, upcomingEvents: 0 };

  // Monthly summary
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const actionsThisMonth = await Action.countDocuments({
    userId,
    completed: true,
    completedAt: { $gte: monthAgo },
  });

  const monthlySummary: MonthlySummary = {
    actionsCompleted: actionsThisMonth,
    avgPerWeek: Math.round(actionsThisMonth / 4.33),
  };

  return {
    metrics,
    todayActions,
    upcomingReminders,
    recentCompleted,
    innerCircleStats,
    communityStats,
    outerCircleStats,
    monthlySummary,
  };
}
