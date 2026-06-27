import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Hourglass, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Sparkles, CheckCircle, ShieldAlert, Zap, Music 
} from 'lucide-react';

export const FocusModeView: React.FC = () => {
  const { 
    focusSession, startFocusSession, pauseFocusSession, 
    resumeFocusSession, resetFocusSession, accentColor 
  } = useApp();

  const [volume, setVolume] = useState<number>(65);
  const [activeSound, setActiveSound] = useState<string>('Heavy Rainforest');
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  // Mock site block toggles
  const [blockSlack, setBlockSlack] = useState<boolean>(true);
  const [blockYoutube, setBlockYoutube] = useState<boolean>(true);
  const [blockTwitter, setBlockTwitter] = useState<boolean>(false);

  // Helper formatting mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const ambientTracks = [
    { name: 'Heavy Rainforest', emoji: '🌳' },
    { name: 'Lo-Fi Coding Synth', emoji: '💻' },
    { name: 'Cozy Espresso Bar', emoji: '☕' },
    { name: 'Deep Space Cosmic Wave', emoji: '🌌' }
  ];

  const bgAccentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    violet: 'bg-violet-600 hover:bg-violet-500',
  };

  const ringAccentClasses = {
    indigo: 'border-indigo-500',
    emerald: 'border-emerald-500',
    amber: 'border-amber-500',
    rose: 'border-rose-500',
    violet: 'border-violet-500',
  };

  const textAccentClasses = {
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    violet: 'text-violet-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Column 1: Pomodoro Tracker */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-6">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Hourglass className="w-4 h-4 animate-spin-slow" />
          <span>Deep Focus Timer</span>
        </span>

        {/* Big Countdown Timer Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="2.5" fill="none" cx="18" cy="18" r="16" />
            <circle 
              className={`stroke-indigo-500 transition-all duration-1000`} 
              strokeWidth="2.8" 
              strokeDasharray={`${(focusSession.timeLeft / focusSession.duration) * 100}, 100`} 
              strokeLinecap="round" 
              fill="none" 
              cx="18" 
              cy="18" 
              r="16" 
            />
          </svg>

          {/* Time digits */}
          <div className="flex flex-col">
            <span className="text-5xl font-mono font-extrabold text-slate-850 dark:text-white tracking-tight">
              {formatTime(focusSession.timeLeft)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              {focusSession.type === 'pomodoro' ? 'Deep Sprints' : 'Rest Block'}
            </span>
          </div>
        </div>

        {/* Basic Session Operations */}
        <div className="flex gap-4 items-center">
          <button
            onClick={resetFocusSession}
            className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-all cursor-pointer"
            title="Reset Clock"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {!focusSession.isActive ? (
            <button
              onClick={() => startFocusSession('pomodoro')}
              className={`p-5 rounded-full text-white shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 ${bgAccentClasses[accentColor]}`}
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          ) : focusSession.isPaused ? (
            <button
              onClick={resumeFocusSession}
              className={`p-5 rounded-full text-white shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 ${bgAccentClasses[accentColor]}`}
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          ) : (
            <button
              onClick={pauseFocusSession}
              className="p-5 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Pause className="w-6 h-6" />
            </button>
          )}

          <div className="w-11"></div> {/* Spacer for symmetry */}
        </div>

        {/* Quick presets buttons */}
        <div className="flex gap-2.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl w-full max-w-sm mt-4">
          <button
            onClick={() => startFocusSession('pomodoro')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${focusSession.type === 'pomodoro' && focusSession.isActive ? 'bg-white dark:bg-slate-900 shadow text-slate-850 dark:text-white font-bold' : 'text-slate-400'}`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => startFocusSession('short_break')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${focusSession.type === 'short_break' && focusSession.isActive ? 'bg-white dark:bg-slate-900 shadow text-slate-850 dark:text-white font-bold' : 'text-slate-400'}`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => startFocusSession('long_break')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${focusSession.type === 'long_break' && focusSession.isActive ? 'bg-white dark:bg-slate-900 shadow text-slate-850 dark:text-white font-bold' : 'text-slate-400'}`}
          >
            Long Rest (15m)
          </button>
        </div>
      </div>

      {/* Column 2: Ambient Sound and Browser Blocker */}
      <div className="space-y-6">
        {/* Ambient Track Player Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Music className="w-4 h-4 text-indigo-500" />
              <span>Ambient Soundroom</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Hi-Fi Sine Wave</span>
          </div>

          <div className="space-y-3">
            {ambientTracks.map((track, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSound(track.name);
                  setIsPlayingSound(true);
                }}
                className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                  activeSound === track.name && isPlayingSound
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-bold'
                    : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850/60 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{track.emoji}</span>
                  <span className="text-xs">{track.name}</span>
                </div>
                {activeSound === track.name && isPlayingSound && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-500 px-2.5 py-1 rounded font-mono uppercase tracking-wider">Active</span>
                )}
              </button>
            ))}
          </div>

          {/* Volume bar and power controls */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4">
            <button 
              onClick={() => setIsPlayingSound(!isPlayingSound)}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              {isPlayingSound ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5 text-slate-400" />}
            </button>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Simulated Distraction Website Blocker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wide">Shield Filter Configuration</h4>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Configure target networks to automatically block and intercept when starting focus countdowns.
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
              <div className="text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">Slack & Discord API</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Intercepts push integrations</div>
              </div>
              <input 
                type="checkbox" 
                checked={blockSlack}
                onChange={() => setBlockSlack(!blockSlack)}
                className="custom-checkbox"
              />
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
              <div className="text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">YouTube & Video Hubs</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Blocks autoplay parameters</div>
              </div>
              <input 
                type="checkbox" 
                checked={blockYoutube}
                onChange={() => setBlockYoutube(!blockYoutube)}
                className="custom-checkbox"
              />
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
              <div className="text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">Social Feeds (Twitter/X)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Injects focus notification gate</div>
              </div>
              <input 
                type="checkbox" 
                checked={blockTwitter}
                onChange={() => setBlockTwitter(!blockTwitter)}
                className="custom-checkbox"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
