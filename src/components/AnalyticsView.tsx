import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, Sparkles, TrendingUp, Heart, Hourglass, 
  Flame, CheckCircle2, ShieldAlert, Award, Compass 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { user, tasks, habits } = useApp();

  // Stats derivation
  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  const totalTasksCount = tasks.length;
  const completionPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Render a custom SVG Area Chart for Weekly Focus Hours
  const weeklyFocusData = [4.5, 6.0, 8.5, 5.0, 9.5, 3.0, 2.0]; // Hours
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Render custom SVG Pie Chart for Time Distribution
  // Values: Work (45%), Personal (25%), Academic (30%)
  const segments = [
    { label: 'Engineering', value: 45, color: 'stroke-indigo-500', dash: '28.2 100', text: '45%' },
    { label: 'Academic', value: 30, color: 'stroke-violet-500', dash: '18.8 100', text: '30%' },
    { label: 'Wellness', value: 25, color: 'stroke-emerald-500', dash: '15.7 100', text: '25%' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase">Deadlines Secured</span>
            <h3 className="text-2xl font-display font-extrabold text-slate-850 dark:text-white">
              {completedTasksCount} / {totalTasksCount}
            </h3>
            <p className="text-[10px] text-emerald-500 font-bold">↑ {completionPercent}% completion rate</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase">Focus Soundroom Session</span>
            <h3 className="text-2xl font-display font-extrabold text-slate-850 dark:text-white">12.5 Hrs</h3>
            <p className="text-[10px] text-indigo-500 font-bold">Recommended: 15 Hrs / week</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Hourglass className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase">Level 4 Reputation</span>
            <h3 className="text-2xl font-display font-extrabold text-slate-850 dark:text-white">Code Firefighter</h3>
            <p className="text-[10px] text-slate-400">Next milestone at level 5</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Area Chart: Weekly Focus Efficiency */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Deep Focus Flow Hours</h4>
              <p className="text-[10px] text-slate-400">Calculated based on active Pomodoro completions</p>
            </div>
            <span className="text-xs font-bold text-indigo-500 font-mono">AVG: 5.8h/day</span>
          </div>

          <div className="relative h-48 w-full mt-4">
            <svg className="w-full h-full" viewBox="0 0 500 160">
              {/* Guidelines */}
              <line x1="0" y1="20" x2="500" y2="20" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" className="stroke-slate-100 dark:stroke-slate-800/50" strokeDasharray="4 4" />

              {/* Gradient fill */}
              <defs>
                <linearGradient id="focus-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Chart Line Path fill */}
              <path 
                d="M 10 140 L 10 90 L 90 70 L 170 30 L 250 80 L 330 20 L 410 110 L 490 120 L 490 140 Z" 
                fill="url(#focus-gradient)" 
              />

              {/* Line Stroke */}
              <path 
                d="M 10 90 L 90 70 L 170 30 L 250 80 L 330 20 L 410 110 L 490 120" 
                fill="none" 
                className="stroke-emerald-500"
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Nodes circles */}
              <circle cx="10" cy="90" r="4.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              <circle cx="90" cy="70" r="4.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              <circle cx="170" cy="30" r="4.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              <circle cx="250" cy="80" r="4.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              <circle cx="330" cy="20" r="4.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              <circle cx="410" cy="110" r="4.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              <circle cx="490" cy="120" r="4.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex justify-between px-2 text-[10px] font-mono font-bold text-slate-400">
            {days.map((day, idx) => (
              <span key={idx} className="w-10 text-center">{day}</span>
            ))}
          </div>
        </div>

        {/* Core Pie Chart: Time Allocation segments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Workload Categories</h4>
            <p className="text-[10px] text-slate-400">Allocation breakdown by task tags</p>
          </div>

          {/* SVG Pie Representation */}
          <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Segment 1: Work (45%) */}
              <circle className="stroke-indigo-500" strokeWidth="5.5" strokeDasharray="45 100" strokeDashoffset="0" fill="none" cx="18" cy="18" r="14" />
              {/* Segment 2: Academic (30%) */}
              <circle className="stroke-violet-500" strokeWidth="5.5" strokeDasharray="30 100" strokeDashoffset="-45" fill="none" cx="18" cy="18" r="14" />
              {/* Segment 3: Personal (25%) */}
              <circle className="stroke-emerald-500" strokeWidth="5.5" strokeDasharray="25 100" strokeDashoffset="-75" fill="none" cx="18" cy="18" r="14" />
            </svg>
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Task Count</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">{totalTasksCount}</span>
            </div>
          </div>

          {/* Legend Lists */}
          <div className="space-y-2 text-[11px] font-semibold">
            {segments.map((seg, sIdx) => (
              <div key={sIdx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${seg.color.replace('stroke', 'bg')}`}></span>
                  <span className="text-slate-600 dark:text-slate-300">{seg.label}</span>
                </div>
                <span className="font-mono text-slate-400">{seg.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Diagnoses & Stress analysis insights feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-spin-slow" />
            <h5 className="font-display font-extrabold text-sm uppercase tracking-wide">AI Predictive Diagnostics</h5>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <div className="flex justify-between font-bold">
                <span>⚡ PEAK PRODUCTIVITY WINDOW</span>
                <span className="text-indigo-500 font-mono">11:00 AM - 1:00 PM</span>
              </div>
              <p className="text-slate-400 text-[10px] mt-1">Focus Soundroom sessions completed during this window have a 92% escape rate under deadlines.</p>
            </div>

            <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
              <div className="flex justify-between font-bold text-rose-500">
                <span>⚠️ HIGHEST DELAY BOTTLENECK</span>
                <span className="font-mono">"Prepare Venture Pitch Slide-deck"</span>
              </div>
              <p className="text-slate-400 text-[10px] mt-1">High conceptual difficulty matched with low subtask counts predicts a 2-hour delivery spillover. Request AI breakdown.</p>
            </div>
          </div>
        </div>

        {/* Habit tracker heatmap statistics summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h5 className="font-display font-extrabold text-sm uppercase tracking-wide">Habit Ring Resilience</h5>
            <p className="text-[10px] text-slate-400">Track of health & ergonomics streaks</p>
          </div>

          <div className="space-y-4 my-4">
            {habits.map(h => (
              <div key={h.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{h.title}</span>
                  <span className="text-indigo-500 font-mono">{h.streak} day streak</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${Math.min(100, (h.currentWeekProgress / h.targetWeekly) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400">
            🌳 <strong>Reputation Status</strong>: Your "Hydration Intake" habit has achieved perfect 7-day resonance. Earned 120 Coins bonus!
          </div>
        </div>
      </div>
    </div>
  );
};
