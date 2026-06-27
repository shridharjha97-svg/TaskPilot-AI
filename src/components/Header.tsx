import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Bell, Search, Clock, Sparkles, Coins, CheckCircle, 
  Settings, Zap, ShieldAlert, ArrowUpRight, Plus, HelpCircle,
  ListTodo, Calendar, Trophy, Activity, MessageSquareCode, Target, CalendarDays, Users2, LogOut, User, Menu
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { 
    user, notifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications,
    addTask, startFocusSession, accentColor, rescueModeActive,
    setCurrentTab, tasks = [], habits = [], events = [], logout
  } = useApp();

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [systemTime, setSystemTime] = useState<string>('');

  // Click outside notifications dropdown to close
  useEffect(() => {
    if (!showNotifications) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If the clicked element is no longer in the document (unmounted during click), do not close
      if (!document.body.contains(target)) return;

      if (!target.closest('#notifications-trigger-btn') && !target.closest('#notifications-dropdown-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showNotifications]);

  // Click outside profile dropdown to close
  useEffect(() => {
    if (!showProfileDropdown) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!document.body.contains(target)) return;

      if (!target.closest('#profile-dropdown-trigger') && !target.closest('#profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showProfileDropdown]);

  // Click outside search dropdown to close
  useEffect(() => {
    if (!showSearchModal) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!document.body.contains(target)) return;

      if (!target.closest('#global-search-trigger') && !target.closest('#global-search-dropdown-container')) {
        setShowSearchModal(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSearchModal]);

  // Live clock trigger
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setSystemTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleQuickTask = () => {
    const titles = [
      '🚒 Immediate API Server Patch',
      '📝 Polish UX Pitch deck feedback',
      '⚡ Align cloud run parameters',
      '⚙️ Re-index firestore query indicators'
    ];
    const chosen = titles[Math.floor(Math.random() * titles.length)];
    
    addTask({
      title: chosen,
      description: 'Quickly spawned action item to rescue the workflow before the afternoon reviews.',
      priority: 'high',
      status: 'todo',
      category: 'work',
      dueDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 1.5,
      difficultyScore: 4,
      tag: 'Spawned Rescue'
    });
    setShowSearchModal(false);
  };

  const handleQuickFocus = () => {
    startFocusSession('pomodoro');
    setShowSearchModal(false);
  };

  const ringAccentClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  };

  const textAccentClasses = {
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    violet: 'text-violet-500',
  };

  return (
    <header className="h-16 border-b border-slate-200/40 dark:border-white/10 px-4 md:px-6 flex justify-between items-center bg-white/30 dark:bg-black/25 backdrop-blur-xl relative z-20 shrink-0">
      {/* Search Input/Hamburger Button */}
      <div className="flex items-center gap-2 md:gap-4 w-auto md:w-1/3 relative" id="global-search-container">
        {onMenuToggle && (
          <button
            id="mobile-menu-hamburger"
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-850/50 text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <button
          id="global-search-trigger"
          onClick={() => setShowSearchModal(!showSearchModal)}
          className="w-32 sm:w-48 md:w-full max-w-sm flex items-center justify-between py-1.5 px-3 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-850/50 rounded-xl text-slate-400 dark:text-slate-500 text-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 shrink-0" />
            <span className="truncate text-left">Search...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-200 dark:bg-slate-850 border border-slate-300 dark:border-slate-800 rounded text-[9px] font-mono font-bold text-slate-500">⌘K</kbd>
        </button>

        {showSearchModal && (
          <div 
            id="global-search-dropdown-container"
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full mt-2 w-72 sm:w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 cursor-default flex flex-col max-h-[380px] z-[100]"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Type 'rescue', 'focus', 'task' or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs outline-none text-slate-800 dark:text-white"
                autoFocus
              />
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchModal(false);
                }}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-3">
              {/* If search query is empty, show default Quick Actions */}
              {searchQuery.trim() === '' ? (
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Quick Actions</span>
                  <div className="grid grid-cols-1 gap-1">
                    <button
                      onClick={handleQuickTask}
                      className="group w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-xl transition-all flex items-center justify-between text-xs font-semibold cursor-pointer border border-slate-100 dark:border-slate-850"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="group-hover:text-slate-950 dark:group-hover:text-white transition-colors">Create Quick Task</span>
                      </div>
                      <kbd className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200 dark:border-slate-750 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">⌘N</kbd>
                    </button>

                    <button
                      onClick={handleQuickFocus}
                      className="group w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-xl transition-all flex items-center justify-between text-xs font-semibold cursor-pointer border border-slate-100 dark:border-slate-850"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="group-hover:text-slate-950 dark:group-hover:text-white transition-colors">Start 45m Focus Session</span>
                      </div>
                      <kbd className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200 dark:border-slate-750 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">⌘F</kbd>
                    </button>
                  </div>

                  <div className="pt-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Quick Navigation Suggestions</span>
                    <div className="grid grid-cols-2 gap-1 mt-1.5">
                      {[
                        { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
                        { id: 'tasks', label: 'Smart Tasks', icon: ListTodo },
                        { id: 'ai-assistant', label: 'AI Copilot Chat', icon: MessageSquareCode },
                        { id: 'calendar', label: 'Calendar Planner', icon: Calendar },
                        { id: 'habit-tracker', label: 'Habit Rings', icon: CalendarDays },
                        { id: 'focus-mode', label: 'Focus Soundroom', icon: Clock },
                      ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setCurrentTab(tab.id);
                              setShowSearchModal(false);
                            }}
                            className="group text-left p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-slate-100/40 dark:border-slate-850/40"
                          >
                            <TabIcon className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                            <span className="truncate group-hover:text-slate-950 dark:group-hover:text-white transition-colors text-[11px]">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Results lists */}
                  {(() => {
                    const normalizedQuery = searchQuery.toLowerCase().trim();
                    
                    const allTabsList = [
                      { id: 'dashboard', label: 'Dashboard / Home Overview', icon: Sparkles },
                      { id: 'tasks', label: 'Smart Tasks (Kanban Board)', icon: ListTodo },
                      { id: 'ai-assistant', label: 'AI Assistant Copilot Chat', icon: MessageSquareCode },
                      { id: 'calendar', label: 'Calendar Planner & De-conflict', icon: Calendar },
                      { id: 'analytics', label: 'Analytics & Focus Insights', icon: Activity },
                      { id: 'focus-mode', label: 'Focus Soundroom', icon: Clock },
                      { id: 'goals', label: 'Milestone Roadmap', icon: Target },
                      { id: 'habit-tracker', label: 'Habit Rings & Streaks', icon: CalendarDays },
                      { id: 'gamification', label: 'Quests & Achievements', icon: Trophy },
                      { id: 'settings', label: 'Platform Settings & Customization', icon: Settings },
                    ];

                    const matchedTabs = allTabsList.filter(t => t.label.toLowerCase().includes(normalizedQuery));
                    const matchedTasks = tasks.filter(t => t.title.toLowerCase().includes(normalizedQuery) || t.description?.toLowerCase().includes(normalizedQuery) || t.tag?.toLowerCase().includes(normalizedQuery)).slice(0, 4);
                    const matchedHabits = habits.filter(h => h.title.toLowerCase().includes(normalizedQuery)).slice(0, 3);
                    const matchedEvents = events.filter(e => e.title.toLowerCase().includes(normalizedQuery) || e.category.toLowerCase().includes(normalizedQuery)).slice(0, 3);

                    const totalMatches = matchedTabs.length + matchedTasks.length + matchedHabits.length + matchedEvents.length;

                    if (totalMatches === 0) {
                      return (
                        <div className="py-4 text-center space-y-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">No results found for <span className="font-bold text-slate-800 dark:text-white">"{searchQuery}"</span></p>
                          <p className="text-[10px] text-slate-400">Try searching for 'focus', 'rescue', 'meeting', 'tasks'.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {/* Navigation Matches */}
                        {matchedTabs.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Navigation Pages</span>
                            {matchedTabs.map(tab => {
                              const TabIcon = tab.icon;
                              return (
                                <button
                                  key={tab.id}
                                  onClick={() => {
                                    setCurrentTab(tab.id);
                                    setSearchQuery('');
                                    setShowSearchModal(false);
                                  }}
                                  className="group w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer border border-slate-100/50 dark:border-slate-850/50"
                                >
                                  <div className="p-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-500">
                                    <TabIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors truncate font-semibold text-[11px]">{tab.label}</p>
                                    <p className="text-[9px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-400 font-normal transition-colors">Go to page</p>
                                  </div>
                                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white transition-colors" />
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Task Matches */}
                        {matchedTasks.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Active Smart Tasks</span>
                            {matchedTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => {
                                  setCurrentTab('tasks');
                                  setSearchQuery('');
                                  setShowSearchModal(false);
                                }}
                                className="group w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer border border-slate-100/50 dark:border-slate-850/50"
                              >
                                <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-500">
                                  <ListTodo className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors truncate font-semibold text-[11px]">{task.title}</p>
                                    <span className="text-[8px] px-1 py-0.1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full">{task.priority}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-450 font-normal truncate transition-colors">{task.description || 'No description'}</p>
                                </div>
                                <span className="text-[8px] text-indigo-500 bg-indigo-500/10 px-1 py-0.5 rounded font-mono font-bold shrink-0">{task.tag}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Habit Matches */}
                        {matchedHabits.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Habit Rings</span>
                            {matchedHabits.map(habit => (
                              <button
                                key={habit.id}
                                onClick={() => {
                                  setCurrentTab('habit-tracker');
                                  setSearchQuery('');
                                  setShowSearchModal(false);
                                }}
                                className="group w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer border border-slate-100/50 dark:border-slate-850/50"
                              >
                                <div className="p-1 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-500">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors truncate font-semibold text-[11px]">{habit.title}</p>
                                  <p className="text-[9px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-450 font-normal transition-colors">Streak: {habit.streak}d | Freq: {habit.frequency}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Event Matches */}
                        {matchedEvents.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Calendar Events</span>
                            {matchedEvents.map(event => (
                              <button
                                key={event.id}
                                onClick={() => {
                                  setCurrentTab('calendar');
                                  setSearchQuery('');
                                  setShowSearchModal(false);
                                }}
                                className="group w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-xl transition-all flex items-center gap-2.5 text-xs font-semibold cursor-pointer border border-slate-100/50 dark:border-slate-850/50"
                              >
                                <div className="p-1 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-500">
                                  <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors truncate font-semibold text-[11px]">{event.title}</p>
                                  <p className="text-[9px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-450 font-normal transition-colors">
                                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Clock and Meta Indicators */}
      <div className="hidden md:flex items-center gap-6 font-mono text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 px-3 py-1 rounded-xl">
          <Clock className={`w-3.5 h-3.5 ${textAccentClasses[accentColor]}`} />
          <span>UTC SPRINT TIME:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{systemTime || '12:00:00'}</span>
        </div>
        
        {rescueModeActive && (
          <div className="flex items-center gap-1.5 animate-pulse bg-rose-500/10 text-rose-500 px-3 py-1 rounded-xl font-bold font-sans text-[10px] uppercase tracking-wider border border-rose-500/25">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span>Shield Active</span>
          </div>
        )}
      </div>

      {/* Action Buttons Hub */}
      <div className="flex items-center gap-4">
        {/* Coin counter */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl border border-amber-500/25 text-xs font-bold font-display select-none">
          <Coins className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>{user.coins}</span>
          <span className="text-[10px] opacity-70">LSC</span>
        </div>

        {/* Dynamic Notification bell icon */}
        <div className="relative">
          <button
            id="notifications-trigger-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              showNotifications 
                ? 'bg-slate-100 dark:bg-slate-850 border-slate-300 dark:border-slate-750 text-slate-950 dark:text-white' 
                : 'bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-850/60 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white font-extrabold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Overlays */}
          {showNotifications && (
            <div 
              id="notifications-dropdown-container"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-11 right-0 w-80 glass-panel rounded-2xl shadow-2xl p-4 z-40 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsRead}
                      className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer border-l pl-2 border-slate-200 dark:border-slate-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 space-y-2.5 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No active timeline violations recorded. Perfect!
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex gap-3 ${
                        n.read 
                          ? 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-60' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'error' && <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />}
                        {n.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />}
                        {n.type === 'warning' && <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />}
                        {n.type === 'rescue' && <Zap className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />}
                        {n.type === 'info' && <Sparkles className="w-4.5 h-4.5 text-blue-500" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline gap-2">
                          <h6 className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-200">{n.title}</h6>
                          <span className="text-[8px] font-mono text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown trigger and container */}
        <div className="relative">
          <button
            id="profile-dropdown-trigger"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="relative focus:outline-none cursor-pointer flex items-center hover:opacity-90 active:scale-95 transition-all"
          >
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-8.5 h-8.5 rounded-xl object-cover border border-slate-200 dark:border-slate-800 select-none"
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${ringAccentClasses[accentColor]}`}></span>
          </button>

          {showProfileDropdown && (
            <div 
              id="profile-dropdown-container"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-11 right-0 w-56 glass-panel rounded-2xl shadow-2xl p-3 z-40 overflow-hidden text-left"
            >
              <div className="px-2 py-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email || 'alex@lifesaver.ai'}</p>
              </div>

              <div className="mt-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer text-left"
                >
                  <User className="w-3.5 h-3.5 text-slate-450" />
                  <span>Profile Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};
