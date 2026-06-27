import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, AlertTriangle, Play, CheckCircle, CalendarDays, 
  ArrowRight, Sparkles, Zap, Flame, Heart, CloudSun, Compass, MessageSquarePlus 
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    user, tasks, events, startFocusSession, updateTask, 
    setCurrentTab, accentColor, rescueModeActive, addTask 
  } = useApp();

  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [quickTitle, setQuickTitle] = useState<string>('');
  const [quickPriority, setQuickPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: 'Quickly deployed from the System Command Deck dashboard.',
      priority: quickPriority,
      status: 'todo',
      category: quickPriority === 'urgent' ? 'urgent_rescue' : 'work',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedTime: 2.0,
      remainingTime: 2.0,
      difficultyScore: 3,
      subtasks: [],
      collaborators: [],
      tag: 'Quick'
    });

    setQuickTitle('');
    setQuickPriority('medium');
  };

  const quotes = [
    "“Pressure is a privilege. It reveals what we are capable of escaping.”",
    "“Your future self is begging you to start the first subtask right now.”",
    "“Do not stare at the clock; mimic its progress. Keep stepping.”",
    "“Action is the ultimate antidote to deadline apprehension.”"
  ];
  const [activeQuote, setActiveQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  // Filtering data
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done');
  const otherTasks = tasks.filter(t => t.priority !== 'urgent' && t.status !== 'done');
  const todayEvents = events.slice(0, 3);

  // SVG Custom Graph Values
  const performanceData = [30, 45, 85, 60, 95, 80, 75]; // focus hours percentages
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const ringAccentColors = {
    indigo: 'stroke-indigo-500',
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    rose: 'stroke-rose-500',
    violet: 'stroke-violet-500',
  };

  const bgAccentColors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Greeting Panel */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Command Deck</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
              Good Morning, {user.name} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium italic">
              {activeQuote}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/40 dark:border-white/10">
            <CloudSun className="w-8 h-8 text-indigo-400 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">72°F Silicon Valley</div>
              <div className="text-slate-400 mt-0.5">Focus Atmosphere: Excellent</div>
            </div>
          </div>
        </div>

        {/* AI Suggestions Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">AI Priority Strategy:</span> Let PM Maya polish the slide theme while you secure **"{tasks[0]?.title}"** to bypass developer blockades.
            </div>
          </div>
          <button 
            onClick={() => setCurrentTab('ai-assistant')}
            className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-3 py-1.5 rounded-lg shrink-0 hover:bg-indigo-500 transition-all cursor-pointer"
          >
            Review Strategy
          </button>
        </div>
      </div>

      {/* Core Score Ring Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Productivity</span>
            <h3 className="text-2xl font-display font-extrabold mt-1 text-slate-800 dark:text-white">{user.productivityScore}%</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-block">↑ 4.2% from yesterday</span>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`stroke-indigo-500`} strokeDasharray={`${user.productivityScore}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <Zap className="absolute inset-0 m-auto w-4 h-4 text-indigo-500" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Deep Focus</span>
            <h3 className="text-2xl font-display font-extrabold mt-1 text-slate-800 dark:text-white">{user.focusScore}%</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-block">↑ 2.5% this week</span>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="stroke-emerald-500" strokeDasharray={`${user.focusScore}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <Flame className="absolute inset-0 m-auto w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Vibe Index</span>
            <h3 className="text-2xl font-display font-extrabold mt-1 text-slate-800 dark:text-white">{user.moodScore}%</h3>
            <span className="text-[10px] text-slate-400 font-bold mt-1 inline-block">Self-reported: Calm</span>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="stroke-violet-500" strokeDasharray={`${user.moodScore}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <Compass className="absolute inset-0 m-auto w-4 h-4 text-violet-500" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Battery Power</span>
            <h3 className="text-2xl font-display font-extrabold mt-1 text-slate-800 dark:text-white">{user.energyScore}%</h3>
            <span className="text-[10px] text-rose-500 font-bold mt-1 inline-block">↓ Risk: High exhaustion</span>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="stroke-amber-500" strokeDasharray={`${user.energyScore}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <Heart className="absolute inset-0 m-auto w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Grid Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Left Column: Deadlines and Burnout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Today's Priorities */}
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Today's Escalating Deadlines</h4>
              </div>
              <button 
                onClick={() => setCurrentTab('tasks')}
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>Task Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {urgentTasks.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  Congratulations! All urgent deadline priorities are safely secured.
                </div>
              ) : (
                urgentTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold tracking-widest bg-red-500/10 text-red-500 px-2 py-0.5 rounded uppercase font-mono">
                          94% risk
                        </span>
                        <span className="text-xs font-mono text-slate-400">Tag: {task.tag}</span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{task.title}</h5>
                      <p className="text-xs text-slate-400 truncate max-w-md">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => startFocusSession('pomodoro')}
                        className="p-2.5 bg-emerald-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Rescue Session</span>
                      </button>
                      <button 
                        onClick={() => updateTask(task.id, { status: 'done' })}
                        className="p-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                        title="Mark Complete"
                      >
                        <CheckCircle className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Custom SVG Analytics */}
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wide mb-6">Deep focus efficiency trends (focus hours/day)</h4>
            
            {/* Native SVG Chart */}
            <div className="relative h-48 w-full">
              <svg className="w-full h-full" viewBox="0 0 500 160">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />
                <line x1="0" y1="60" x2="500" y2="60" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="500" y2="100" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="500" y2="140" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />

                {/* Performance Chart Line Area */}
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Path Area */}
                <path 
                  d="M 10 140 L 10 110 L 90 95 L 170 35 L 250 70 L 330 20 L 410 40 L 490 50 L 490 140 Z" 
                  fill="url(#chart-glow)" 
                />

                {/* Path Stroke */}
                <path 
                  d="M 10 110 L 90 95 L 170 35 L 250 70 L 330 20 L 410 40 L 490 50" 
                  fill="none" 
                  className={`stroke-indigo-500`}
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Chart Nodes circles */}
                <circle cx="10" cy="110" r="4.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx="90" cy="95" r="4.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx="170" cy="35" r="4.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx="250" cy="70" r="4.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx="330" cy="20" r="4.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx="410" cy="40" r="4.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx="490" cy="50" r="4.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              </svg>
            </div>
            
            {/* Days markers */}
            <div className="flex justify-between px-2 text-[10px] font-mono font-bold text-slate-400 mt-2">
              {daysOfWeek.map((day, idx) => (
                <span key={idx} className="w-10 text-center">{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Meetings and Scratchpad */}
        <div className="space-y-6">
          {/* Section: Quick Task Deployer */}
          <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">⚡ Quick Task Deployer</h4>
              <span className="text-[9px] bg-indigo-500/15 text-indigo-500 px-2.5 py-1 rounded font-mono font-bold uppercase">Ready</span>
            </div>
            
            <form onSubmit={handleQuickAddTask} className="space-y-3">
              <input
                type="text"
                placeholder="Secure which objective? (e.g. Code API endpoint)"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                required
              />
              <div className="flex gap-2">
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value as any)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-[11px] focus:outline-none text-slate-800 dark:text-slate-200"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">🚨 Urgent</option>
                </select>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md hover:shadow-indigo-500/10 active:scale-95"
                >
                  Deploy Task
                </button>
              </div>
            </form>
          </div>

          {/* Section: Upcoming Meetings */}
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wide mb-4">Agenda Chronology</h4>
            
            <div className="space-y-4">
              {todayEvents.map(event => (
                <div 
                  key={event.id} 
                  className="flex gap-3 pb-3 border-b border-slate-100 dark:border-slate-850/60 last:border-none last:pb-0"
                >
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-xs font-extrabold text-indigo-500 font-mono">{event.start}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{event.category}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h6 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{event.title}</h6>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{event.description}</p>
                    {event.isMeeting && event.meetingLink && (
                      <a 
                        href={event.meetingLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1 hover:underline"
                      >
                        <span>Join Meet video feed</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Burnout Risk Gauge */}
          <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Exhaustion Risk Index</h4>
              <span className="text-[9px] bg-red-500/15 text-red-500 px-2 py-0.5 rounded font-mono font-bold uppercase">72% Exhausted</span>
            </div>

            {/* Circular Gauge Bar */}
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="stroke-red-500" strokeDasharray="72, 100" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <AlertTriangle className="absolute m-auto w-5 h-5 text-red-500 animate-bounce" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">Exhaustion Index high</p>
                <p className="text-slate-400 mt-0.5">Continuous deep work blocks exceed standard guidelines.</p>
              </div>
            </div>

            {/* Quick Action Suggestion */}
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex gap-2">
              <span>🧘</span>
              <p className="font-medium">
                <strong>Stretch Break Required</strong>: Mute notifications for 5 minutes and practice the "shoulder roll release" routine.
              </p>
            </div>
          </div>

          {/* Section: Scratchpad */}
          <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Crisis Scratchpad</h4>
              <span className="text-[8px] text-slate-400 font-mono font-bold">Auto-persisted local node</span>
            </div>
            
            <textarea
              id="dashboard-scratchpad"
              rows={4}
              placeholder="Dump spontaneous ideas, terminal outputs, or quick numbers here to clear active cognitive loads..."
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
