import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TaskManagerView } from './components/TaskManagerView';
import { AIAssistantView } from './components/AIAssistantView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { FocusModeView } from './components/FocusModeView';
import { 
  GoalsView, HabitTrackerView, TeamWorkspaceView, 
  GamificationView, SettingsView 
} from './components/SecondaryViews';
import { 
  LayoutGrid, CheckSquare, Sparkles, Calendar, 
  BarChart3, Hourglass, Target, Flame, Users, Trophy, Settings 
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, currentTab, setCurrentTab, showLanding, setShowLanding } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState<boolean>(false);

  // 1. If user wants to see the public landing presentation page
  if (showLanding && !user.isAuthenticated) {
    return (
      <LandingPage 
        onGetStarted={() => setShowLanding(false)} 
        onLogin={() => setShowLanding(false)} 
      />
    );
  }

  // 2. If user clicks "Launch App" or wants to authenticate
  if (!user.isAuthenticated) {
    return <AuthPage onBack={() => setShowLanding(true)} onSuccess={() => {}} />;
  }

  // 3. Main Dashboard Workspace Layout once logged in
  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TaskManagerView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'calendar':
        return <CalendarView />;
      case 'focus-mode':
        return <FocusModeView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'goals':
        return <GoalsView />;
      case 'habit-tracker':
        return <HabitTrackerView />;
      case 'team':
        return <TeamWorkspaceView />;
      case 'gamification':
        return <GamificationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutGrid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'ai-assistant', label: 'AI Copilot', icon: Sparkles },
    { id: 'focus-mode', label: 'Focus', icon: Hourglass },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-[#020203] text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-orange-500/5 dark:bg-orange-500/10 blur-[100px] pointer-events-none"></div>
      </div>

      {/* Sidebar - Collapsible sidebar for Tablet, Laptops and Desktop screen resolutions */}
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Main Container Wrapper */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Universal Header bar */}
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Dynamic content viewport space */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on small mobile viewports) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/50 flex justify-around items-center z-40 px-3 shadow-lg">
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id as any)}
              className="flex flex-col items-center justify-center text-center gap-1 cursor-pointer"
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-500 scale-110' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <span className={`text-[9px] font-bold ${
                isActive ? 'text-indigo-500 font-extrabold' : 'text-slate-400'
              }`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
