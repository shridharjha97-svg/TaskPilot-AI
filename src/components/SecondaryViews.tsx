import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, Sparkles, Award, Play, CheckCircle2, Trophy, 
  Coins, ShoppingBag, ShieldAlert, Heart, Flame, Users, 
  Settings, CheckSquare, Plus, Zap, AlertTriangle, Compass, 
  Moon, Sun, ShieldCheck 
} from 'lucide-react';

// ==========================================
// 1. GOALS ROADMAP VIEW
// ==========================================
export const GoalsView: React.FC = () => {
  const { milestones, user, accentColor } = useApp();
  const [goalQuery, setGoalQuery] = useState<string>('');
  const [goalDecomposition, setGoalDecomposition] = useState<string[]>([]);
  const [isCoachThinking, setIsCoachThinking] = useState<boolean>(false);

  const handleGoalCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalQuery.trim()) return;

    setIsCoachThinking(true);
    try {
      const token = localStorage.getItem('taskpilot_token');
      const response = await fetch('/api/ai/formulate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ goal: goalQuery.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.roadmap && Array.isArray(data.roadmap)) {
          setGoalDecomposition(data.roadmap);
        } else {
          throw new Error('Invalid roadmap array payload');
        }
      } else {
        throw new Error('Failed to request roadmap formulation');
      }
    } catch (err) {
      console.error('Goal Coach Formulation Error:', err);
      // Clean fallback if API times out or experiences network issues
      setGoalDecomposition([
        `🎯 Phase 1: Establish scaffolding for "${goalQuery.trim()}" (Est: 2 days)`,
        `🧱 Phase 2: Code and configure the primary feature elements (Est: 3 days)`,
        `🚀 Phase 3: Finalize system verification and deployment (Est: 1 day)`
      ]);
    } finally {
      setIsCoachThinking(false);
    }
  };

  const bgAccentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    violet: 'bg-violet-600 hover:bg-violet-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Milestones list */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Milestone Goals Vision Board</h4>
        
        <div className="space-y-4">
          {milestones.map(ms => (
            <div 
              key={ms.id} 
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h5 className="text-sm font-bold text-slate-850 dark:text-slate-100">{ms.title}</h5>
                  <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">{ms.category} • due {ms.targetDate}</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded">+{ms.rewardXP} XP</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                  <span>Development Progress</span>
                  <span>{ms.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${ms.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Goal Coach Chat */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-spin-slow" />
          <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">AI Goal Coach Planner</h4>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Tell me your ambitious target, and I will instantly map a structured chronological roadmap!
        </p>

        <form onSubmit={handleGoalCoach} className="space-y-3">
          <input
            type="text"
            placeholder="e.g. Deploy full-stack Applet to Cloud Run..."
            value={goalQuery}
            onChange={(e) => setGoalQuery(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            required
          />
          <button
            type="submit"
            disabled={isCoachThinking}
            className={`w-full py-2.5 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer ${bgAccentClasses[accentColor]}`}
          >
            {isCoachThinking ? 'Drafting Blueprint...' : 'Formulate Roadmap'}
          </button>
        </form>

        {/* Goal Breakdown output */}
        {goalDecomposition.length > 0 && (
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 font-mono">Generated Milestones:</span>
            <div className="space-y-2">
              {goalDecomposition.map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] border border-slate-100 dark:border-slate-850/60 leading-relaxed text-slate-600 dark:text-slate-300">
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. HABIT TRACKER VIEW
// ==========================================
export const HabitTrackerView: React.FC = () => {
  const { habits, toggleHabit, addHabit, accentColor } = useApp();
  const [newHabitTitle, setNewHabitTitle] = useState<string>('');

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    addHabit({
      title: newHabitTitle,
      category: 'Focus',
      targetWeekly: 5
    });
    setNewHabitTitle('');
  };

  const bgAccentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    violet: 'bg-violet-600 hover:bg-violet-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Core Habits Check list */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Daily Ergonomics & focus Habits</h4>
        
        <div className="space-y-4">
          {habits.map(h => (
            <div 
              key={h.id} 
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-850 dark:text-slate-100">{h.title}</h5>
                <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase font-mono">
                  <span>Category: {h.category}</span>
                  <span>•</span>
                  <span>Completed: {h.currentWeekProgress} / {h.targetWeekly} this week</span>
                </div>
              </div>

              {/* Toggle checklist check */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-mono">🔥 {h.streak}d</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Streak</span>
                </div>

                <input 
                  type="checkbox"
                  checked={h.history.includes(new Date().toISOString().split('T')[0])}
                  onChange={() => toggleHabit(h.id)}
                  className="custom-checkbox h-7 w-7"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spawn New Habit panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Register Habit Trigger</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Create regular recurring focus guidelines to compound productivity levels over sprints.
        </p>

        <form onSubmit={handleCreateHabit} className="space-y-3">
          <input
            type="text"
            placeholder="e.g. Rest eyes for 2m..."
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
            required
          />
          <button
            type="submit"
            className={`w-full py-2.5 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer ${bgAccentClasses[accentColor]}`}
          >
            Spawn Habit Ring
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. TEAM CO-WORKING SPACE
// ==========================================
export const TeamWorkspaceView: React.FC = () => {
  const { accentColor } = useApp();

  const members = [
    { name: 'Sarah Nate', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80', status: 'Focus soundroom active', color: 'border-emerald-500' },
    { name: 'Nate Ryan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', status: 'Muted JIRA notifications', color: 'border-amber-500' },
    { name: 'PM Maya', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80', status: 'Polishing slide numbers', color: 'border-indigo-500' }
  ];

  const activities = [
    { member: 'Nate Ryan', act: 'decomposed tasks checklist items for "Final Product Architecture"', time: '12m ago' },
    { member: 'Sarah Nate', act: 'marked "Draft schema designs" as complete, adding +25 XP to squad', time: '1h ago' },
    { member: 'PM Maya', act: 'initiated shared meeting slot on slide-decks', time: '2h ago' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Squad online states */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Multiplayer Workspace Presence</h4>
        
        {/* Simulate real-time cursors */}
        <div className="relative h-44 bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">Active Collaboration Canvas</span>
          
          {/* Cursor 1 */}
          <div className="absolute top-12 left-1/4 flex gap-2 items-center text-[10px] bg-emerald-500 text-white font-bold px-2 py-1 rounded-full shadow-lg">
            <span>Sarah (UX) coding...</span>
          </div>

          {/* Cursor 2 */}
          <div className="absolute bottom-16 right-1/4 flex gap-2 items-center text-[10px] bg-indigo-500 text-white font-bold px-2 py-1 rounded-full shadow-lg animate-float">
            <span>Nate checking schema...</span>
          </div>
        </div>

        {/* Member statuses */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {members.map((m, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl flex flex-col items-center text-center gap-2">
              <img src={m.avatar} alt={m.name} className={`w-12 h-12 rounded-full border-2 ${m.color} object-cover`} />
              <div>
                <h6 className="text-xs font-bold text-slate-850 dark:text-slate-100">{m.name}</h6>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Streams feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Recent activity logs</h4>
        
        <div className="space-y-4">
          {activities.map((act, i) => (
            <div key={i} className="flex gap-3 text-xs leading-normal pb-3 border-b border-slate-100 dark:border-slate-850/40 last:border-none last:pb-0">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 animate-pulse"></div>
              <div>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-850 dark:text-slate-100">{act.member}</strong> {act.act}
                </p>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. GAMIFICATION CENTER & REWARDS
// ==========================================
export const GamificationView: React.FC = () => {
  const { user, achievements, unlockAchievement, accentColor, purchaseItem } = useApp();

  const missions = [
    { title: 'Beat an urgent 2-hour priority deadline', reward: '250 XP • 50 Coins', done: true },
    { title: 'Log a continuous 45m deep focus session', reward: '150 XP • 25 Coins', done: false },
    { title: 'Check 5 subtask checklist boxes', reward: '80 XP • 15 Coins', done: false }
  ];

  const shopItems = [
    { title: 'Twilight Glass Skin', price: 150, desc: 'Ultra-frosted glass aesthetic theme configuration.' },
    { title: 'Lofi Cyber Ambient Track', price: 100, desc: 'Continuous deep bass lo-fi focus sound track.' },
    { title: 'Crisis Widget Upgrade', price: 200, desc: 'Unlocks delay indicators graphs for landing pages.' }
  ];

  const ringAccentClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Missions list */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Survival Quests & Missions</h4>
          <span className="text-xs text-indigo-500 font-bold">Resets in: 14 Hrs</span>
        </div>

        <div className="space-y-3">
          {missions.map((m, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 flex items-center justify-between"
            >
              <div className="flex gap-3 items-center">
                <input type="checkbox" checked={m.done} readOnly className="custom-checkbox h-5 w-5 pointer-events-none" />
                <div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.title}</h6>
                  <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">{m.reward}</span>
                </div>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${m.done ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-850 text-slate-400'}`}>
                {m.done ? 'Earned' : 'Progress'}
              </span>
            </div>
          ))}
        </div>

        {/* Locked Badges */}
        <div className="space-y-3 mt-4">
          <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Trophy Room achievements</h4>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map(ach => (
              <button
                key={ach.id}
                onClick={() => unlockAchievement(ach.id)}
                className={`p-4 rounded-2xl border text-left flex gap-3 items-start transition-all cursor-pointer ${
                  ach.isUnlocked 
                    ? 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850/60' 
                    : 'bg-slate-100/30 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{ach.title}</span>
                    {ach.isUnlocked && <span className="text-[9px] text-emerald-500">✓</span>}
                  </h6>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">{ach.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coins Shop Catalog */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-indigo-500" />
              <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">TaskPilot AI Coin Shop</h4>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-xl text-xs font-bold font-mono">
              <Coins className="w-3.5 h-3.5" />
              <span>{user.coins}</span>
            </div>
          </div>

          <div className="space-y-4">
            {shopItems.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-250/20 rounded-2xl flex flex-col justify-between gap-3"
              >
                <div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h6>
                  <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                </div>
                <button
                  onClick={() => purchaseItem(item.title, item.price)}
                  className="self-end py-1.5 px-3.5 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-[10px] font-extrabold text-indigo-700 dark:text-slate-200 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <span>{item.price} LSC</span>
                  <Coins className="w-3 h-3 text-amber-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-250/15 rounded-2xl text-[10px] text-slate-400 text-center leading-normal mt-6">
          Beating deadlines increases Coin rewards by 3x multiplier!
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SETTINGS PANEL
// ==========================================
export const SettingsView: React.FC = () => {
  const { 
    theme, setTheme, accentColor, setAccentColor, user,
    twilightGlassSkinEnabled, setTwilightGlassSkinEnabled,
    lofiTrackPlaying, setLofiTrackPlaying
  } = useApp();

  const hasGlassSkin = user?.purchasedItems?.includes('Twilight Glass Skin');
  const hasLofiTrack = user?.purchasedItems?.includes('Lofi Cyber Ambient Track');

  const colors: Array<'indigo' | 'emerald' | 'amber' | 'rose' | 'violet'> = [
    'indigo', 'emerald', 'amber', 'rose', 'violet'
  ];

  const colorLabels = {
    indigo: 'Sunset Neon',
    emerald: 'Forest Zen',
    amber: 'Vaporwave Sunset',
    rose: 'Cyber Pink',
    violet: 'Ultra Purple'
  };

  const ringAccentColors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm space-y-8 animate-fade-in">
      {/* Visual customizations */}
      <div className="space-y-4">
        <h4 className="font-display font-extrabold text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-indigo-500" />
          <span>Workspace Aesthetic Matrix</span>
        </h4>

        {/* Light / Dark Mode selector */}
        <div className="flex justify-between items-center text-xs font-semibold">
          <div>
            <span>Core Workspace Theme</span>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">Toggle display visual guidelines.</p>
          </div>

          <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-xl flex gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                theme === 'light' ? 'bg-white shadow text-slate-850 font-bold' : 'text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                theme === 'dark' ? 'bg-white dark:bg-slate-900 shadow text-slate-850 dark:text-white font-bold' : 'text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Accent Color switcher */}
        <div className="flex flex-col gap-2.5 text-xs font-semibold pb-4">
          <div>
            <span>Visual Accent Tone</span>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">Applies custom gradient lighting systems across workspace cards.</p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {colors.map(col => {
              const activeClasses = {
                indigo: 'border-indigo-500 bg-indigo-500/10 text-indigo-500',
                emerald: 'border-emerald-500 bg-emerald-500/10 text-emerald-500',
                amber: 'border-amber-500 bg-amber-500/10 text-amber-500',
                rose: 'border-rose-500 bg-rose-500/10 text-rose-500',
                violet: 'border-violet-500 bg-violet-500/10 text-violet-500',
              };
              return (
                <button
                  key={col}
                  onClick={() => setAccentColor(col)}
                  className={`px-3 py-2 border rounded-xl flex items-center gap-2.5 text-[11px] font-bold transition-all cursor-pointer ${
                    accentColor === col 
                      ? activeClasses[col]
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${ringAccentColors[col]}`}></span>
                  <span>{colorLabels[col]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Premium Twilight Glass Skin Activation */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs font-semibold">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">Premium Twilight Glass Skin</span>
              {hasGlassSkin && (
                <span className="bg-indigo-500/10 text-indigo-500 text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-indigo-500/20">Unlocked</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">Activate a stunning glassmorphism dashboard overlay styled with deep cosmic purple accents.</p>
          </div>

          {hasGlassSkin ? (
            <button
              onClick={() => setTwilightGlassSkinEnabled(!twilightGlassSkinEnabled)}
              className={`py-1.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                twilightGlassSkinEnabled 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-none' 
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{twilightGlassSkinEnabled ? 'Active ✓' : 'Equip'}</span>
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-850">
              🔒 Locked (Purchase in Coin Shop)
            </span>
          )}
        </div>

        {/* Premium Lofi Cyber Ambient Track Player */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs font-semibold">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">Lofi Cyber Ambient Track</span>
              {hasLofiTrack && (
                <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-emerald-500/20">Unlocked</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">Generates real-time custom deep bass lofi focus notes and soft cyber soundscapes offline.</p>
          </div>

          {hasLofiTrack ? (
            <button
              onClick={() => setLofiTrackPlaying(!lofiTrackPlaying)}
              className={`py-1.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                lofiTrackPlaying 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 border-none' 
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {lofiTrackPlaying ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  <span>Playing ♫</span>
                </div>
              ) : (
                <span>Play synth</span>
              )}
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-850">
              🔒 Locked (Purchase in Coin Shop)
            </span>
          )}
        </div>
      </div>

      {/* Integration integrations */}
      <div className="space-y-4">
        <h4 className="font-display font-extrabold text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">Platform synchronizations</h4>
        
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-between items-center text-xs font-bold border border-slate-200/40">
            <div>
              <span>Google Calendar synchronization</span>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Import events and map calendar schedules.</p>
            </div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-mono uppercase">Connected ✓</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-between items-center text-xs font-bold border border-slate-200/40">
            <div>
              <span>Slack distraction block</span>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Enables automatic muting of Slack workspace threads.</p>
            </div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-mono uppercase">Connected ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
