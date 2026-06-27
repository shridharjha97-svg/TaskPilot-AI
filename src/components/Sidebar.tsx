import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, ListTodo, Calendar, MessageSquareCode, 
  BarChart3, Hourglass, Target, CalendarDays, Users2, Trophy, 
  Settings, LogOut, ChevronLeft, ChevronRight, ChevronsUpDown, ShieldAlert, Zap, X 
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { 
    currentTab, setCurrentTab, user, setCurrentView, 
    accentColor, rescueModeActive, setRescueModeActive, logout 
  } = useApp();
  
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState<boolean>(false);
  const [activeWorkspace, setActiveWorkspace] = useState<string>('Alex Personal Workspace');

  const workspaces = [
    'Alex Personal Workspace',
    '🚀 Alpha Platform Squad',
    '🎓 CS Senior Capstone',
    '🚒 Crisis Control Unit'
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Smart Tasks', icon: ListTodo, badge: 'Hot' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquareCode, glow: true },
    { id: 'calendar', label: 'Calendar Planner', icon: Calendar },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
    { id: 'focus-mode', label: 'Focus Soundroom', icon: Hourglass },
    { id: 'goals', label: 'Milestone Roadmap', icon: Target },
    { id: 'habit-tracker', label: 'Habit Rings', icon: CalendarDays },
    { id: 'gamification', label: 'Quests & Achievements', icon: Trophy, badge: 'Win' },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  // Map active accent color styles
  const accentClasses = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-r-4 border-indigo-500',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-r-4 border-emerald-500',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-r-4 border-amber-500',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-r-4 border-rose-500',
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-r-4 border-violet-500',
  };

  const ringAccentClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 bottom-0 left-0 h-screen border-r border-slate-200/60 dark:border-slate-800/60 glass-panel-heavy flex flex-col justify-between transition-all duration-300 z-50 shrink-0 ${
          mobileOpen 
            ? 'translate-x-0 w-80 flex' 
            : 'hidden md:flex -translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-80'}`}
      >
        {/* Collapse Action Button - Desktop Only */}
        <button
          id="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute top-10 -right-3 w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white shadow-sm cursor-pointer hover:scale-105 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Header Branding */}
          <div className={`p-6 flex items-center justify-between shrink-0 ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                    TaskPilot AI
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">2026 Core v4.1</span>
                </div>
              )}
            </div>

            {/* Mobile close button inside the sidebar menu */}
            {mobileOpen && (
              <button 
                onClick={onClose}
                className="md:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

        {/* Workspace Switcher */}
        <div className="px-4 mb-4 relative shrink-0">
          <button
            id="workspace-switcher-btn"
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className={`w-full py-2 px-3 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all ${
              isCollapsed ? 'p-2 justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                {activeWorkspace.charAt(0)}
              </div>
              {!isCollapsed && (
                <span className="text-xs font-semibold truncate text-left">{activeWorkspace}</span>
              )}
            </div>
            {!isCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Switcher dropdown */}
          {!isCollapsed && showWorkspaceMenu && (
            <div className="absolute top-11 left-4 right-4 glass-panel rounded-xl shadow-xl p-1.5 z-40">
              {workspaces.map((ws, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeWorkspace === ws 
                      ? 'bg-indigo-500/20 dark:bg-white/10 text-slate-950 dark:text-white font-bold' 
                      : 'text-slate-500 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {ws}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Deadline Rescue Button */}
        <div className="px-4 mb-6 shrink-0">
          <button
            id="emergency-rescue-toggle"
            onClick={() => setRescueModeActive(!rescueModeActive)}
            className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 font-semibold transition-all relative overflow-hidden group cursor-pointer ${
              rescueModeActive 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20' 
                : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/15'
            } ${isCollapsed ? 'justify-center p-3' : ''}`}
          >
            <Zap className={`w-5 h-5 shrink-0 ${rescueModeActive ? 'animate-bounce text-yellow-300' : 'text-red-500'}`} />
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-wider">Rescue Mode</span>
                <span className="text-[10px] opacity-70">
                  {rescueModeActive ? 'Lock-down Active 🚨' : 'Deploy Shields 🛡️'}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* View Selection List */}
        <nav className="space-y-1.5 px-2 pb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                  isActive 
                    ? accentClasses[accentColor] 
                    : 'text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'md:justify-center md:p-2.5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`} />
                    {item.glow && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    )}
                  </div>
                  {(!isCollapsed || mobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {(!isCollapsed || mobileOpen) && item.badge && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.badge === 'Hot' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile and Logout Section */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 shrink-0">
        {(!isCollapsed || mobileOpen) ? (
          <div className="flex flex-col gap-3">
            {/* User Details */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[7px] font-bold text-white ${ringAccentClasses[accentColor]}`}>
                  {user.level}
                </span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate">{user.title}</span>
              </div>
            </div>

            {/* Level / XP Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                <span>XP Progress</span>
                <span>{user.xp} / {user.xpToNextLevel} XP</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${ringAccentClasses[accentColor]}`}
                  style={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Log Out CTA */}
            <button
              id="sidebar-logout-btn"
              onClick={logout}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Terminal</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-850"
            />
            <button
              onClick={() => setCurrentView('landing')}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  </>
  );
};
