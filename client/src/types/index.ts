// Standard response envelope returned by the Express backend.
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface UserPreferences {
  notifications?: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  location?: string;
  bio?: string;
  phone?: string;
  preferences?: UserPreferences;
  role: 'user' | 'admin';
  streakDays: number;
  lastActiveDate?: string;
  badges: string[];
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  _id: string;
  userId: string;
  name: string;
  relationship: string;
  category?: 'family' | 'friend' | 'colleague' | 'mentor' | 'mentee' | 'other';
  tags: string[];
  interests: string[];
  importantDates?: {
    birthday?: string;
    anniversary?: string;
    custom?: Array<{ label: string; date: string }>;
  };
  lastContactDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  _id: string;
  userId: string;
  personId?: string;
  initiativeId?: string;
  organizationId?: string;
  title: string;
  description?: string;
  category?: 'call' | 'message' | 'visit' | 'gift' | 'activity' | 'other';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  status: 'pending' | 'completed' | 'postponed' | 'dismissed';
  completed: boolean;
  tags: string[];
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  actionId: string;
  personId?: string;
  type: 'completed' | 'undone' | 'postponed' | 'dismissed' | 'created' | 'updated';
  previousStatus?: string;
  newStatus: string;
  notes?: string;
  snapshot: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    dueDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InitiativeTask {
  _id?: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Initiative {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  participants: string[];
  status: 'planned' | 'active' | 'completed' | 'archived';
  documentation?: string;
  frequency?: string;
  impactLevel?: 'low' | 'medium' | 'high';
  location?: string;
  objectives: string[];
  tasks: InitiativeTask[];
  archived: boolean;
  template: boolean;
  featured: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  _id: string;
  userId: string;
  name: string;
  type: 'nonprofit' | 'church' | 'environmental' | 'community' | 'cause' | 'other';
  description?: string;
  website?: string;
  donationLink?: string;
  serviceLink?: string;
  opportunities: string[];
  followed: boolean;
  favorites: boolean;
  verified: boolean;
  featured: boolean;
  address?: string;
  phone?: string;
  email?: string;
  donationUrl?: string;
  volunteerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  message: string;
  entityType: 'person' | 'initiative' | 'organization';
  entityId: string;
  entityName: string;
  nextTriggerAt?: string;
  isActive: boolean;
  snoozeCount: number;
  timezone: string;
  notificationPreference: 'push' | 'email' | 'in-app';
  recurrenceRule?: string;
}

export interface Note {
  _id: string;
  userId: string;
  entityId?: string;
  entityType?: 'person' | 'action' | 'initiative' | 'organization';
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestionContent {
  title: string;
  explanation: string;
  steps: string[];
  category: string;
  estimatedTime: string;
  budget?: string;
}

export interface SuggestionPreferences {
  availableTime?: string;
  budget?: string;
  relationshipType?: string;
  constraints?: string;
}

export interface SuggestionRequest {
  context: string;
  treeType: 'inner' | 'community' | 'outer';
  preferences?: SuggestionPreferences;
}

export interface Suggestion {
  _id: string;
  userId: string;
  promptContext: string;
  treeType: 'inner' | 'community' | 'outer';
  content: SuggestionContent[];
  saved: boolean;
  completedIndices: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentLibraryItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  type: 'suggestion' | 'initiative';
  tags: string[];
  treeType: 'inner' | 'community' | 'outer';
  createdAt: string;
  updatedAt: string;
}

export interface BranchData {
  id: string;
  name: string;
  leafCount: number;
  angle: number;
  length: number;
}

export interface TreeGrowthData {
  trunkSize: number;
  branches: BranchData[];
  totalLeaves: number;
  growthLevel: number;
}

export interface DashboardMetrics {
  actionsThisWeek: number;
  innerCircleGrowth: TreeGrowthData;
  communityGrowth: TreeGrowthData;
  outerCircleGrowth: TreeGrowthData;
  streakDays: number;
  milestones: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Dashboard Summary (expanded) ────────────────────────────────────────────

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

