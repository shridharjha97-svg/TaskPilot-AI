export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskCategory = 'work' | 'personal' | 'academic' | 'urgent_rescue';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string; // ISO string or simple YYYY-MM-DD
  estimatedTime: number; // in hours
  remainingTime: number; // in hours
  riskMeter: number; // 0 to 100 percentage
  difficultyScore: number; // AI score 1 to 10
  subtasks: Subtask[];
  comments: TaskComment[];
  collaborators: Collaborator[];
  tag?: string;
  burnoutRisk?: 'low' | 'medium' | 'high';
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  totalCompleted: number;
  history: string[]; // dates of completion YYYY-MM-DD
  targetWeekly: number;
  currentWeekProgress: number;
  category: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO / hh:mm format
  end: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: 'work' | 'personal' | 'meeting' | 'academic';
  isMeeting?: boolean;
  meetingLink?: string;
  attendees?: string[];
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  isActionable?: boolean;
  actionType?: 'create_task' | 'plan_day' | 'rescue_mode';
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  progress: number; // percentage
  category: string;
  rewardXP: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'rescue';
  read: boolean;
}

export interface UserStats {
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  title: string;
  productivityScore: number;
  focusScore: number;
  moodScore: number;
  energyScore: number;
  isAuthenticated?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}
