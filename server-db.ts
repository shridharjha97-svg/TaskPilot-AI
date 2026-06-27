import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.join(process.cwd(), 'database.json');

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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  category: 'work' | 'personal' | 'academic' | 'urgent_rescue';
  dueDate: string;
  estimatedTime: number;
  remainingTime: number;
  riskMeter: number;
  difficultyScore: number;
  subtasks: Subtask[];
  comments: TaskComment[];
  collaborators: Collaborator[];
  tag?: string;
  burnoutRisk?: 'low' | 'medium' | 'high';
  userId: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  totalCompleted: number;
  history: string[];
  targetWeekly: number;
  currentWeekProgress: number;
  category: string;
  userId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  date: string;
  description: string;
  category: 'work' | 'personal' | 'meeting' | 'academic';
  isMeeting?: boolean;
  meetingLink?: string;
  attendees?: string[];
  userId: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
  category: string;
  rewardXP: number;
  userId: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  userId: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'rescue';
  read: boolean;
  userId: string;
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
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  stats: UserStats;
}

export interface DbSchema {
  users: User[];
  tasks: Task[];
  habits: Habit[];
  events: CalendarEvent[];
  goals: Goal[];
  messages: AIMessage[];
  notifications: SystemNotification[];
}

const DEFAULT_DB: DbSchema = {
  users: [],
  tasks: [],
  habits: [],
  events: [],
  goals: [],
  messages: [],
  notifications: []
};

// Simple custom JWT auth
const JWT_SECRET = process.env.JWT_SECRET || 'taskpilot-pilot-rescue-secret-1337';

export function hashPassword(password: string): { hash: string, salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === testHash;
}

export function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payloadStr}`).digest('base64url');
  return `${header}.${payloadStr}.${signature}`;
}

export function verifyToken(token: string): any {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decodedPayload.exp < Date.now()) return null;
    return decodedPayload;
  } catch {
    return null;
  }
}

export class Database {
  private data: DbSchema = { ...DEFAULT_DB };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = { ...DEFAULT_DB };
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, resetting...', e);
      this.data = { ...DEFAULT_DB };
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving database', e);
    }
  }

  // User methods
  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(email: string, passwordPlain: string, name: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) throw new Error('User already exists');

    const { hash, salt } = hashPassword(passwordPlain);
    const id = `user-${crypto.randomUUID()}`;
    const newUser: User = {
      id,
      email,
      name,
      passwordHash: hash,
      passwordSalt: salt,
      stats: {
        name,
        email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        coins: 50,
        title: 'Fresh Recruit 🛡️',
        productivityScore: 75,
        focusScore: 70,
        moodScore: 80,
        energyScore: 75
      }
    };

    this.data.users.push(newUser);

    // Bootstrap user with basic mock tasks/events/habits
    this.bootstrapUser(id, name);

    this.save();
    return newUser;
  }

  public updateUserStats(id: string, updates: Partial<UserStats>) {
    const user = this.getUserById(id);
    if (user) {
      user.stats = { ...user.stats, ...updates };
      this.save();
    }
  }

  public addXp(id: string, amount: number, notificationCallback?: (title: string, msg: string) => void) {
    const user = this.getUserById(id);
    if (!user) return;

    let newXp = user.stats.xp + amount;
    let newLevel = user.stats.level;
    let xpNeeded = user.stats.xpToNextLevel;

    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
      xpNeeded = Math.floor(xpNeeded * 1.25);
      
      const newTitle = newLevel >= 5 ? 'Elite Shield-Commander 🚀' : newLevel >= 3 ? 'Code Firefighter 🚒' : 'Timeline Protector 🧭';
      user.stats.title = newTitle;

      if (notificationCallback) {
        notificationCallback('Level Up! 🎉', `Congratulations! You've reached Level ${newLevel} and earned the title of ${newTitle}!`);
      }
    }

    user.stats.xp = newXp;
    user.stats.level = newLevel;
    user.stats.xpToNextLevel = xpNeeded;
    user.stats.coins += Math.floor(amount / 5);
    this.save();
  }

  // Tasks methods
  public getTasks(userId: string): Task[] {
    return this.data.tasks.filter(t => t.userId === userId);
  }

  public getTask(id: string): Task | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  public createTask(userId: string, task: Omit<Task, 'id' | 'userId'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${crypto.randomUUID()}`,
      userId
    };
    this.data.tasks.push(newTask);
    this.addXp(userId, 80);
    this.save();
    return newTask;
  }

  public updateTask(id: string, fields: Partial<Task>): Task | undefined {
    const taskIndex = this.data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return undefined;

    const task = this.data.tasks[taskIndex];
    const originalStatus = task.status;

    const updatedTask = {
      ...task,
      ...fields
    };

    this.data.tasks[taskIndex] = updatedTask;

    // Award XP if completed
    if (fields.status === 'done' && originalStatus !== 'done') {
      this.addXp(task.userId, 250);
      const user = this.getUserById(task.userId);
      if (user) {
        user.stats.coins += 30;
      }
      this.createNotification(task.userId, {
        title: 'Deadline Safely Beat! 🏆',
        message: `You completed "${task.title}" and saved ${task.remainingTime.toFixed(1)} hours of delay! Earned +250 XP & +30 Life Saver Coins.`,
        type: 'success'
      });
    }

    this.save();
    return updatedTask;
  }

  public deleteTask(id: string): boolean {
    const len = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    const deleted = this.data.tasks.length < len;
    if (deleted) this.save();
    return deleted;
  }

  // Habits methods
  public getHabits(userId: string): Habit[] {
    return this.data.habits.filter(h => h.userId === userId);
  }

  public createHabit(userId: string, habit: Omit<Habit, 'id' | 'userId' | 'streak' | 'totalCompleted' | 'history' | 'currentWeekProgress'>): Habit {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${crypto.randomUUID()}`,
      streak: 0,
      totalCompleted: 0,
      history: [],
      currentWeekProgress: 0,
      userId
    };
    this.data.habits.push(newHabit);
    this.addXp(userId, 80);
    this.save();
    return newHabit;
  }

  public toggleHabit(id: string): Habit | undefined {
    const habit = this.data.habits.find(h => h.id === id);
    if (!habit) return undefined;

    const todayStr = new Date().toISOString().split('T')[0];
    const completedIndex = habit.history.indexOf(todayStr);

    if (completedIndex !== -1) {
      // Remove completion
      habit.history.splice(completedIndex, 1);
      habit.streak = Math.max(0, habit.streak - 1);
      habit.totalCompleted = Math.max(0, habit.totalCompleted - 1);
      habit.currentWeekProgress = Math.max(0, habit.currentWeekProgress - 1);
    } else {
      // Add completion
      habit.history.push(todayStr);
      habit.streak += 1;
      habit.totalCompleted += 1;
      habit.currentWeekProgress += 1;
      this.addXp(habit.userId, 50);
      this.createNotification(habit.userId, {
        title: 'Habit Synced! ⚡',
        message: `Successfully recorded "${habit.title}". Your streak is now ${habit.streak} days! +50 XP.`,
        type: 'success'
      });
    }

    this.save();
    return habit;
  }

  // Events methods
  public getEvents(userId: string): CalendarEvent[] {
    return this.data.events.filter(e => e.userId === userId);
  }

  public createEvent(userId: string, event: Omit<CalendarEvent, 'id' | 'userId'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${crypto.randomUUID()}`,
      userId
    };
    this.data.events.push(newEvent);
    this.addXp(userId, 60);
    this.save();
    return newEvent;
  }

  public updateEvent(id: string, fields: Partial<CalendarEvent>): CalendarEvent | undefined {
    const eventIndex = this.data.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return undefined;

    const event = this.data.events[eventIndex];
    const originalStart = event.start;
    const updatedEvent = {
      ...event,
      ...fields
    };

    this.data.events[eventIndex] = updatedEvent;

    // Award XP if conflict is resolved by moving Architecture block from 13:00 to 15:30
    if (originalStart === '13:00' && fields.start === '15:30') {
      this.addXp(event.userId, 60);
      const user = this.getUserById(event.userId);
      if (user) {
        user.stats.coins += 15;
      }
      this.createNotification(event.userId, {
        title: 'Conflict Safely Resolved! 🛡️',
        message: 'Your Architecture Review block has been rescheduled, saving 2.5 hours of delay risk. Earned +60 XP & +15 Coins.',
        type: 'success'
      });
    }

    this.save();
    return updatedEvent;
  }

  // Goals methods
  public getGoals(userId: string): Goal[] {
    return this.data.goals.filter(g => g.userId === userId);
  }

  public createGoal(userId: string, goal: Omit<Goal, 'id' | 'userId'>): Goal {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${crypto.randomUUID()}`,
      userId
    };
    this.data.goals.push(newGoal);
    this.addXp(userId, 100);
    this.save();
    return newGoal;
  }

  // Notifications
  public getNotifications(userId: string): SystemNotification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public createNotification(userId: string, notification: Omit<SystemNotification, 'id' | 'time' | 'read' | 'userId'>): SystemNotification {
    const newNotif: SystemNotification = {
      ...notification,
      id: `not-${crypto.randomUUID()}`,
      time: 'Just now',
      read: false,
      userId
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find(not => not.id === id);
    if (n) {
      n.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string) {
    this.data.notifications
      .filter(n => n.userId === userId)
      .forEach(n => { n.read = true; });
    this.save();
  }

  public clearAllNotifications(userId: string) {
    this.data.notifications = this.data.notifications.filter(n => n.userId !== userId);
    this.save();
  }

  // AI Chat Logs
  public getMessages(userId: string): AIMessage[] {
    return this.data.messages.filter(m => m.userId === userId);
  }

  public addMessage(userId: string, sender: 'user' | 'assistant', text: string, suggestions?: string[]): AIMessage {
    const msg: AIMessage = {
      id: `msg-${crypto.randomUUID()}`,
      sender,
      text,
      suggestions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId
    };
    this.data.messages.push(msg);
    if (sender === 'assistant') {
      this.addXp(userId, 40);
    }
    this.save();
    return msg;
  }

  public clearMessages(userId: string) {
    this.data.messages = this.data.messages.filter(m => m.userId !== userId);
    this.addMessage(userId, 'assistant', 'Clean terminal initiated. Let us plan your survival roadmap. What is blocking you right now?', ['🛡️ Activate Rescue Mode', '📅 Plan my day']);
  }

  // Boost strap mock data on creation
  private bootstrapUser(userId: string, name: string) {
    // Basic tasks
    const tasksToBootstrap: Omit<Task, 'id' | 'userId'>[] = [
      {
        title: 'Final Product Architecture & API Design',
        description: 'Define exact REST API schemas, database schemas, and clean architecture diagram for the new launch.',
        priority: 'urgent',
        status: 'in_progress',
        category: 'work',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 4.5,
        remainingTime: 2.0,
        riskMeter: 94,
        difficultyScore: 8,
        tag: 'Rescue Priority',
        burnoutRisk: 'high',
        subtasks: [
          { id: 's-1', title: 'Draft schema draft on Excalidraw', done: true },
          { id: 's-2', title: 'Review endpoint patterns with Sarah', done: true },
          { id: 's-3', title: 'Generate Typescript interface exports', done: false },
          { id: 's-4', title: 'Set up database migration script', done: false }
        ],
        comments: [
          { id: 'co-1', author: 'Nate', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', content: 'This is super urgent Alex. The backend container deployment depends on this design.', timestamp: '1 hour ago' }
        ],
        collaborators: [
          { id: 'c-1', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80', role: 'UX Designer' },
          { id: 'c-2', name: 'Nate', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', role: 'Dev Lead' }
        ]
      },
      {
        title: 'Venture Pitch Slide-Deck Refinement',
        description: 'Polish visual slides, slide templates, market sizing numbers, and financial projections graph.',
        priority: 'urgent',
        status: 'todo',
        category: 'academic',
        dueDate: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 3.0,
        remainingTime: 14.0,
        riskMeter: 78,
        difficultyScore: 7,
        tag: 'Pitch Deck',
        burnoutRisk: 'medium',
        subtasks: [
          { id: 's-5', title: 'Confirm TAM & SAM estimates with finance', done: false },
          { id: 's-6', title: 'Apply glassmorphism themes to PowerPoint', done: false },
          { id: 's-7', title: 'Practice 5-minute presentation speech', done: false }
        ],
        comments: [],
        collaborators: [
          { id: 'c-3', name: 'Maya', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80', role: 'Product Manager' }
        ]
      },
      {
        title: 'QA Automation Test Suite Configuration',
        description: 'Set up automated tests for main authentication gates, checkout flows, and Stripe callback verification.',
        priority: 'medium',
        status: 'todo',
        category: 'work',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 8.0,
        remainingTime: 72.0,
        riskMeter: 24,
        difficultyScore: 5,
        tag: 'QA Automate',
        burnoutRisk: 'low',
        subtasks: [
          { id: 's-8', title: 'Install Playwright and setup config', done: true },
          { id: 's-9', title: 'Write mock login specs', done: false },
          { id: 's-10', title: 'Verify Github actions workflow integration', done: false }
        ],
        comments: [],
        collaborators: []
      }
    ];

    tasksToBootstrap.forEach(t => {
      this.data.tasks.push({
        ...t,
        id: `task-${crypto.randomUUID()}`,
        userId
      });
    });

    // Habits
    const habitsToBootstrap: Omit<Habit, 'id' | 'userId'>[] = [
      { title: 'Deep Work Session (45m)', streak: 5, totalCompleted: 24, history: ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'], targetWeekly: 5, currentWeekProgress: 5, category: 'Focus' },
      { title: 'Hydration Intake (3L)', streak: 12, totalCompleted: 45, history: ['2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'], targetWeekly: 7, currentWeekProgress: 7, category: 'Health' },
      { title: 'Stand & Stretch (Hourly)', streak: 0, totalCompleted: 10, history: [], targetWeekly: 14, currentWeekProgress: 4, category: 'Ergonomics' }
    ];

    habitsToBootstrap.forEach(h => {
      this.data.habits.push({
        ...h,
        id: `habit-${crypto.randomUUID()}`,
        userId
      });
    });

    // Events
    const eventsToBootstrap: Omit<CalendarEvent, 'id' | 'userId'>[] = [
      { title: '🚀 Launch Strategy Meeting', start: '10:00', end: '11:00', date: new Date().toISOString().split('T')[0], description: 'Align with marketing on product packaging & digital asset delivery.', category: 'meeting', isMeeting: true, meetingLink: 'https://meet.google.com/abc-defg-hij', attendees: ['Sarah', 'Nate', name] },
      { title: '🧠 Architecture Review Block', start: '13:00', end: '15:30', date: new Date().toISOString().split('T')[0], description: 'Dedicated focus block to polish schema code design without Slack interruptions.', category: 'work' },
      { title: '🎓 Pitch Presentation Practice', start: '16:00', end: '17:00', date: new Date().toISOString().split('T')[0], description: 'Do a timed practice run with pitch coaches.', category: 'academic' }
    ];

    eventsToBootstrap.forEach(e => {
      this.data.events.push({
        ...e,
        id: `event-${crypto.randomUUID()}`,
        userId
      });
    });

    // Goals
    const goalsToBootstrap: Omit<Goal, 'id' | 'userId'>[] = [
      { title: 'V2 Platform Launch Integration', targetDate: '2026-06-30', progress: 65, category: 'Work', rewardXP: 1000 },
      { title: 'Venture Pitch Presentation', targetDate: '2026-06-28', progress: 40, category: 'Academic', rewardXP: 1200 },
      { title: 'Consistent Gym Sprint', targetDate: '2026-07-05', progress: 15, category: 'Personal', rewardXP: 500 }
    ];

    goalsToBootstrap.forEach(g => {
      this.data.goals.push({
        ...g,
        id: `goal-${crypto.randomUUID()}`,
        userId
      });
    });

    // Welcome notification
    this.createNotification(userId, {
      title: '🛡️ SECURE PORTAL DEPLOYED',
      message: `Welcome Agent ${name}. TaskPilot rescue monitors are now actively guarding your temporal escape routes.`,
      type: 'rescue'
    });

    // Default assistant msg
    this.addMessage(userId, 'assistant', `Hello ${name}! I am your AI TaskPilot Companion. I see you have **1 urgent deadline** looming (Final Product Architecture & API Design) and a major slide deck pitch tomorrow. \n\nHow should we tackle this? Tell me to "Plan my day" or activate **Deadline Rescue Mode**!`, ['🛡️ Activate Rescue Mode', '📅 Generate Timetable', '📝 Prioritize Tasks']);
  }
}

export const dbInstance = new Database();
