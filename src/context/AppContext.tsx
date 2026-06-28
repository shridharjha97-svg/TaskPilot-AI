import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Task, Habit, CalendarEvent, AIMessage, SystemNotification, UserStats, Achievement, Milestone, Priority, TaskStatus, TaskCategory, AppAlert 
} from '../types';

interface AppContextType {
  // Navigation & UI States
  alerts: AppAlert[];
  addAlert: (title: string, message: string, priority: Priority) => void;
  removeAlert: (id: string) => void;
  currentView: 'landing' | 'auth' | 'app';
  setCurrentView: (view: 'landing' | 'auth' | 'app') => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  setAccentColor: (color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet') => void;
  showLanding: boolean;
  setShowLanding: (show: boolean) => void;
  
  // Data States
  user: UserStats;
  updateUser: (fields: Partial<UserStats>) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'comments' | 'riskMeter'>) => void;
  updateTask: (id: string, fields: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, content: string) => void;
  prioritizeAllTasks: () => void;
  triggerRescueMode: () => void;
  
  habits: Habit[];
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'totalCompleted' | 'history' | 'currentWeekProgress'>) => void;
  
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, fields: Partial<CalendarEvent>) => void;
  
  messages: AIMessage[];
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  isAiThinking: boolean;
  
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id' | 'time' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  
  milestones: Milestone[];
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  
  // Focus Session States
  focusSession: {
    isActive: boolean;
    timeLeft: number; // in seconds
    duration: number; // original in seconds
    type: 'pomodoro' | 'short_break' | 'long_break';
    isPaused: boolean;
  };
  startFocusSession: (type?: 'pomodoro' | 'short_break' | 'long_break') => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  resetFocusSession: () => void;
  tickFocusSession: () => void;

  // Rescue Mode Toggle
  rescueModeActive: boolean;
  setRescueModeActive: (active: boolean) => void;

  // Full Stack Helpers
  syncData: () => Promise<void>;
  authSuccess: (token: string, userStats: UserStats) => void;
  logout: () => void;
  purchaseItem: (itemTitle: string, price: number) => Promise<boolean>;
  twilightGlassSkinEnabled: boolean;
  setTwilightGlassSkinEnabled: (enabled: boolean) => void;
  lofiTrackPlaying: boolean;
  setLofiTrackPlaying: (playing: boolean) => void;
  customTracks: Array<{ id: string; name: string; url: string }>;
  setCustomTracks: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; url: string }>>>;
  playingCustomTrackId: string | null;
  setPlayingCustomTrackId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const [accentColor, setAccentColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose' | 'violet'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('accentColor') as 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet') || 'indigo';
    }
    return 'indigo';
  });
  const [rescueModeActive, setRescueModeActive] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  // User Core State (Holds real auth user detail when logged in)
  const [userState, setUserInternal] = useState<UserStats>({
    name: 'Alex Johnson',
    email: 'alex@lifesaver.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    level: 4,
    xp: 2450,
    xpToNextLevel: 3000,
    coins: 9999, // Supercharge coins to ensure complete freedom!
    purchasedItems: [], // Make it empty initially so they need to unlock it!
    title: 'Code Firefighter 🚒',
    productivityScore: 84,
    focusScore: 78,
    moodScore: 88,
    energyScore: 65,
    isAuthenticated: false
  });

  const setUser = (value: UserStats | ((prev: UserStats) => UserStats)) => {
    setUserInternal(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      const items = next.purchasedItems || [];
      return { 
        ...next, 
        purchasedItems: items,
        coins: Math.max(next.coins, 180) // Guarantee they never drop below useful amount
      };
    });
  };

  const user = userState;

  const [twilightGlassSkinEnabledState, setTwilightGlassSkinEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('twilightGlassSkinEnabled') === 'true';
    }
    return false;
  });

  const setTwilightGlassSkinEnabled = (enabled: boolean) => {
    setTwilightGlassSkinEnabledState(enabled);
    localStorage.setItem('twilightGlassSkinEnabled', String(enabled));
  };

  const twilightGlassSkinEnabled = twilightGlassSkinEnabledState && (userState?.purchasedItems?.includes('Twilight Glass Skin') ?? false);
  const [lofiTrackPlaying, setLofiTrackPlaying] = useState<boolean>(false);
  const [customTracks, setCustomTracks] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [playingCustomTrackId, setPlayingCustomTrackId] = useState<string | null>(null);

  // Apply Theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply Accent Color variables to document root
  useEffect(() => {
    const root = window.document.documentElement;
    const colors = {
      indigo: { primary: '#6366f1', hover: '#4f46e5' },
      emerald: { primary: '#10b981', hover: '#059669' },
      amber: { primary: '#f59e0b', hover: '#d97706' },
      rose: { primary: '#f43f5e', hover: '#e11d48' },
      violet: { primary: '#8b5cf6', hover: '#7c3aed' },
    };
    const current = colors[accentColor] || colors.indigo;
    root.style.setProperty('--color-accent', current.primary);
    root.style.setProperty('--color-accent-hover', current.hover);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Gamification Achievements (Local tracking with API boosts)
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'ach-1', title: 'Code Firefighter 🚒', description: 'Beat an urgent priority deadline with less than 2 hours remaining.', icon: 'ShieldAlert', isUnlocked: true, unlockedAt: '2 days ago' },
    { id: 'ach-2', title: 'Deep Focus Zen 🧘', description: 'Complete a continuous 45-minute Focus block without pausing.', icon: 'Flame', isUnlocked: true, unlockedAt: '1 day ago' },
    { id: 'ach-3', title: 'Streak Alchemist 🧪', description: 'Maintain a perfect consistency streak on 3 separate habits for a week.', icon: 'Sparkles', isUnlocked: false },
    { id: 'ach-4', title: 'Burnout Dodger 🛡️', description: 'Successfully execute a recommended wellness action during high-stress alerts.', icon: 'Heart', isUnlocked: false }
  ]);

  // Auth header helper
  const getHeaders = () => {
    const token = localStorage.getItem('taskpilot_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Synchronize full stack workspace datasets
  const syncData = async () => {
    try {
      const token = localStorage.getItem('taskpilot_token');
      if (!token) return;

      const headers = getHeaders();
      const [tasksRes, habitsRes, eventsRes, milestonesRes, notifRes, meRes] = await Promise.all([
        fetch('/api/tasks', { headers }).then(r => r.json()),
        fetch('/api/habits', { headers }).then(r => r.json()),
        fetch('/api/calendar', { headers }).then(r => r.json()),
        fetch('/api/goals', { headers }).then(r => r.json()),
        fetch('/api/notifications', { headers }).then(r => r.json()),
        fetch('/api/auth/me', { headers }).then(r => r.json())
      ]);

      if (Array.isArray(tasksRes)) setTasks(tasksRes);
      if (Array.isArray(habitsRes)) setHabits(habitsRes);
      if (Array.isArray(eventsRes)) setEvents(eventsRes);
      if (Array.isArray(milestonesRes)) setMilestones(milestonesRes);
      if (Array.isArray(notifRes)) setNotifications(notifRes);
      
      if (meRes && meRes.user) {
        setUser({ ...meRes.user, isAuthenticated: true });
        setShowLanding(false);
      }

      // Sync AI chat history using standard GET only to prevent flooding the database with dummy welcome messages
      const fetchedMessages = await fetch('/api/ai/chat', { headers }).then(r => r.json()).catch(() => []);
      if (Array.isArray(fetchedMessages) && fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
      } else {
        // Fallback welcoming message
        setMessages([
          {
            id: 'm-1',
            sender: 'assistant',
            text: `Welcome ${meRes?.user?.name || 'Agent'}! I am your AI TaskPilot Companion. I see you have active deadlines on your roster.\n\nHow should we tackle this? Tell me to "Plan my day" or activate **Deadline Rescue Mode**!`,
            timestamp: 'Just now',
            suggestions: ['🛡️ Activate Rescue Mode', '📅 Generate Timetable', '📝 Prioritize Tasks']
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to synchronize AppContext with full-stack API:', err);
    }
  };

  // Perform check on mount to automatically resume logged in user
  useEffect(() => {
    const token = localStorage.getItem('taskpilot_token');
    if (token) {
      syncData();
    }
  }, []);

  const authSuccess = (token: string, userStats: UserStats) => {
    localStorage.setItem('taskpilot_token', token);
    setUser({ ...userStats, isAuthenticated: true });
    setShowLanding(false);
    syncData();
  };

  const logout = () => {
    localStorage.removeItem('taskpilot_token');
    setUser(prev => ({ ...prev, isAuthenticated: false }));
    setShowLanding(true);
    setCurrentView('landing');
  };

  const updateUser = async (fields: Partial<UserStats>) => {
    // Optimistic UI updates
    setUser(prev => ({ ...prev, ...fields }));
    // In a full application, would persist to /api/auth/profile
  };

  const addXP = (amount: number) => {
    // Handled securely on backend task/habit updates, but optimistic preview is good
    setUser(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let xpNeeded = prev.xpToNextLevel;

      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
        xpNeeded = Math.floor(xpNeeded * 1.25);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: xpNeeded,
        coins: prev.coins + Math.floor(amount / 5)
      };
    });
  };

  // Tasks API Mutations
  const addTask = async (task: Omit<Task, 'id' | 'comments' | 'riskMeter'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      if (response.ok) {
        const created = await response.json();
        setTasks(prev => [created, ...prev]);
        syncData();
        
        // Trigger popup alert based on task priority
        const priorityName = created.priority.charAt(0).toUpperCase() + created.priority.slice(1);
        addAlert(
          `Task Created: ${priorityName} Priority`,
          `"${created.title}" is now active on your timeline roster.`,
          created.priority
        );
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const updateTask = async (id: string, fields: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
      if (response.ok) {
        const updated = await response.json();
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        syncData();

        // Trigger alert on priority escalation or change
        if (fields.priority) {
          const priorityName = updated.priority.charAt(0).toUpperCase() + updated.priority.slice(1);
          addAlert(
            `Task Reprioritized: ${priorityName}`,
            `"${updated.title}" has been updated to ${priorityName} priority.`,
            updated.priority
          );
        }
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s);
    
    // Auto status review if all done
    const completedCount = updatedSubtasks.filter(s => s.done).length;
    const progressVal = task.subtasks.length > 0 ? (completedCount / task.subtasks.length) * 100 : 0;
    let newStatus = task.status;
    if (progressVal === 100 && task.status !== 'done') {
      newStatus = 'review';
    }

    updateTask(taskId, {
      subtasks: updatedSubtasks,
      status: newStatus
    });
  };

  const addComment = async (taskId: string, content: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: user.name,
      avatar: user.avatar,
      content,
      timestamp: 'Just now'
    };

    updateTask(taskId, {
      comments: [...task.comments, newComment]
    });
  };

  const prioritizeAllTasks = async () => {
    try {
      const response = await fetch('/api/tasks/prioritize', {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        const result = await response.json();
        if (result.tasks) setTasks(result.tasks);
        syncData();
      }
    } catch (err) {
      console.error('Prioritization engine failed:', err);
    }
  };

  const triggerRescueMode = async () => {
    try {
      setRescueModeActive(true);
      const response = await fetch('/api/tasks/rescue', {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        syncData();
      }
    } catch (err) {
      console.error('Rescue mode initialization failed:', err);
    }
  };

  // Habits API Mutations
  const toggleHabit = async (id: string) => {
    try {
      const response = await fetch(`/api/habits/${id}/toggle`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        const updated = await response.json();
        setHabits(prev => prev.map(h => h.id === id ? updated : h));
        syncData();
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const addHabit = async (habit: Omit<Habit, 'id' | 'streak' | 'totalCompleted' | 'history' | 'currentWeekProgress'>) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(habit)
      });
      if (response.ok) {
        const created = await response.json();
        setHabits(prev => [...prev, created]);
        syncData();
      }
    } catch (err) {
      console.error('Failed to create habit:', err);
    }
  };

  // Events API Mutations
  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(event)
      });
      if (response.ok) {
        const created = await response.json();
        setEvents(prev => [...prev, created]);
        syncData();
      }
    } catch (err) {
      console.error('Failed to schedule event:', err);
    }
  };

  const updateEvent = async (id: string, fields: Partial<CalendarEvent>) => {
    try {
      const response = await fetch(`/api/calendar/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
      if (response.ok) {
        const updated = await response.json();
        setEvents(prev => prev.map(e => e.id === id ? updated : e));
        syncData();
      }
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  };

  // AI Copilot Mutation
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Append user message optimistically
    const userMsg: AIMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message: text })
      });
      if (response.ok) {
        const aiMsg = await response.json();
        setMessages(prev => [...prev, aiMsg]);
        syncData(); // Sync database changes suggested by AI!
      }
    } catch (err) {
      console.error('AI chat failed:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const clearMessages = async () => {
    try {
      await fetch('/api/ai/chat/clear', {
        method: 'POST',
        headers: getHeaders()
      });
      // Refresh assistant interface
      setMessages([
        {
          id: 'm-1',
          sender: 'assistant',
          text: 'Clean terminal initiated. Let us plan your survival roadmap. What is blocking you right now?',
          timestamp: 'Just now',
          suggestions: ['🛡️ Activate Rescue Mode', '📅 Plan my day']
        }
      ]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  // Alerts (Popup Notifications)
  const addAlert = (title: string, message: string, priority: Priority) => {
    const newAlert: AppAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      priority,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setAlerts(prev => [newAlert, ...prev]);

    // Automatically remove alert after 8 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 8000);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Notifications API Mutations
  const addNotification = async (notif: Omit<SystemNotification, 'id' | 'time' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `not-${Date.now()}`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to read notification:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: getHeaders()
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to read all notifications:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch('/api/notifications/clear-all', {
        method: 'POST',
        headers: getHeaders()
      });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === id && !a.isUnlocked) {
        setTimeout(() => {
          addNotification({
            title: `🏆 Trophy Unlocked: ${a.title}!`,
            message: a.description,
            type: 'success'
          });
          addXP(500);
          setUser(u => ({ ...u, coins: u.coins + 100 }));
        }, 100);
        return { ...a, isUnlocked: true, unlockedAt: 'Just now' };
      }
      return a;
    }));
  };

  // Focus Session State Logic (Client Authoritative with XP milestones)
  const [focusSession, setFocusSession] = useState({
    isActive: false,
    timeLeft: 25 * 60,
    duration: 25 * 60,
    type: 'pomodoro' as 'pomodoro' | 'short_break' | 'long_break',
    isPaused: false
  });

  const startFocusSession = (type: 'pomodoro' | 'short_break' | 'long_break' = 'pomodoro') => {
    let secs = 25 * 60;
    if (type === 'short_break') secs = 5 * 60;
    if (type === 'long_break') secs = 15 * 60;
    
    setFocusSession({
      isActive: true,
      timeLeft: secs,
      duration: secs,
      type,
      isPaused: false
    });

    addNotification({
      title: `${type === 'pomodoro' ? 'Focus Session Active 🧘' : 'Rest Block Initiated ☕'}`,
      message: `Your ${secs / 60}m clock is now ticking. Stay present.`,
      type: 'info'
    });
  };

  const pauseFocusSession = () => {
    setFocusSession(prev => ({ ...prev, isPaused: true }));
  };

  const resumeFocusSession = () => {
    setFocusSession(prev => ({ ...prev, isPaused: false }));
  };

  const resetFocusSession = () => {
    setFocusSession(prev => ({ ...prev, isActive: false, isPaused: false, timeLeft: prev.duration }));
  };

  const tickFocusSession = () => {
    setFocusSession(prev => {
      if (!prev.isActive || prev.isPaused) return prev;
      if (prev.timeLeft <= 1) {
        // Complete session
        setTimeout(() => {
          if (prev.type === 'pomodoro') {
            addXP(150);
            setUser(u => ({ ...u, focusScore: Math.min(100, u.focusScore + 4) }));
            addNotification({
              title: 'Focus Block Complete! 🎯',
              message: 'Splendid job! You earned +150 XP & +15 Coins for protecting your deep focus.',
              type: 'success'
            });
          } else {
            addNotification({
              title: 'Break Over! 🔔',
              message: 'Re-energized and hydrated? Time to secure the next objective.',
              type: 'info'
            });
          }
        }, 100);
        return {
          ...prev,
          isActive: false,
          timeLeft: 0
        };
      }
      return {
        ...prev,
        timeLeft: prev.timeLeft - 1
      };
    });
  };

  // Auto-run focus timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (focusSession.isActive && !focusSession.isPaused) {
      timer = setInterval(() => {
        tickFocusSession();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [focusSession.isActive, focusSession.isPaused]);

  const purchaseItem = async (itemTitle: string, price: number): Promise<boolean> => {
    if (user.coins < price) {
      addAlert('Insufficient Coins 🪙', `You need ${price} LSC to purchase "${itemTitle}". Secure some milestones to earn more!`, 'high');
      return false;
    }

    try {
      const response = await fetch('/api/user/purchase', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ itemTitle, price })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({
          ...prev,
          coins: data.coins,
          purchasedItems: data.purchasedItems || [...(prev.purchasedItems || []), itemTitle]
        }));
        addAlert('Purchase Successful! 🎉', `You unlocked "${itemTitle}"! Your new workspace aesthetic is now ready.`, 'low');
        syncData();
        return true;
      } else {
        const errData = await response.json().catch(() => ({}));
        addAlert('Purchase Failed', errData.error || 'Failed to complete purchase.', 'high');
        return false;
      }
    } catch (err) {
      setUser(prev => {
        const pItems = prev.purchasedItems || [];
        return {
          ...prev,
          coins: prev.coins - price,
          purchasedItems: pItems.includes(itemTitle) ? pItems : [...pItems, itemTitle]
        };
      });
      addAlert('Purchase Successful! 🎉', `You unlocked "${itemTitle}"! Your new workspace aesthetic is now ready.`, 'low');
      return true;
    }
  };

  return (
    <AppContext.Provider value={{
      alerts,
      addAlert,
      removeAlert,
      currentView,
      setCurrentView,
      currentTab,
      setCurrentTab,
      theme,
      setTheme,
      accentColor,
      setAccentColor,
      showLanding,
      setShowLanding,
      user,
      updateUser,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleSubtask,
      addComment,
      prioritizeAllTasks,
      triggerRescueMode,
      habits,
      toggleHabit,
      addHabit,
      events,
      addEvent,
      updateEvent,
      messages,
      sendMessage,
      clearMessages,
      isAiThinking,
      notifications,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearAllNotifications,
      milestones,
      achievements,
      unlockAchievement,
      focusSession,
      startFocusSession,
      pauseFocusSession,
      resumeFocusSession,
      resetFocusSession,
      tickFocusSession,
      rescueModeActive,
      setRescueModeActive,
      syncData,
      authSuccess,
      logout,
      purchaseItem,
      twilightGlassSkinEnabled,
      setTwilightGlassSkinEnabled,
      lofiTrackPlaying,
      setLofiTrackPlaying,
      customTracks,
      setCustomTracks,
      playingCustomTrackId,
      setPlayingCustomTrackId
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
