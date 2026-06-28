import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Hourglass, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Sparkles, CheckCircle, ShieldAlert, Zap, Music, Upload, Trash
} from 'lucide-react';

export const FocusModeView: React.FC = () => {
  const { 
    focusSession, startFocusSession, pauseFocusSession, 
    resumeFocusSession, resetFocusSession, accentColor,
    lofiTrackPlaying, setLofiTrackPlaying,
    customTracks, setCustomTracks,
    playingCustomTrackId, setPlayingCustomTrackId
  } = useApp();

  const [volume, setVolume] = useState<number>(65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume with custom audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Sync custom audio playback status
  useEffect(() => {
    if (!audioRef.current) return;
    if (playingCustomTrackId) {
      const activeTrack = customTracks.find(t => t.id === playingCustomTrackId);
      if (activeTrack) {
        if (audioRef.current.src !== activeTrack.url) {
          audioRef.current.src = activeTrack.url;
          audioRef.current.load();
        }
        audioRef.current.play().catch(err => {
          console.warn("User interaction required to initiate audio playback", err);
        });
      } else {
        audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
    }
  }, [playingCustomTrackId, customTracks]);

  // Turn off custom tracks if lofi coding synth is activated
  useEffect(() => {
    if (lofiTrackPlaying) {
      setPlayingCustomTrackId(null);
    }
  }, [lofiTrackPlaying, setPlayingCustomTrackId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newTracks: Array<{ id: string; name: string; url: string }> = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        const uniqueId = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        newTracks.push({
          id: uniqueId,
          name: file.name,
          url: url
        });
      }
      
      if (newTracks.length > 0) {
        setCustomTracks(prev => [...prev, ...newTracks]);
        // Auto-play the first uploaded song from the list
        setPlayingCustomTrackId(newTracks[0].id);
        setLofiTrackPlaying(false);
      }
      e.target.value = '';
    }
  };

  const removeCustomAudio = (trackId: string) => {
    const trackToRemove = customTracks.find(t => t.id === trackId);
    if (trackToRemove) {
      URL.revokeObjectURL(trackToRemove.url);
    }
    setCustomTracks(prev => prev.filter(t => t.id !== trackId));
    if (playingCustomTrackId === trackId) {
      setPlayingCustomTrackId(null);
    }
  };

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

  const bgAccentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    violet: 'bg-violet-600 hover:bg-violet-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="focus-soundroom-view">
      {/* Column 1: Pomodoro Tracker */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-6" id="pomodoro-tracker-card">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Hourglass className="w-4 h-4 animate-spin-slow" />
          <span>Deep Focus Timer</span>
        </span>

        {/* Big Countdown Timer Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center" id="countdown-timer-circle">
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
        <div className="flex gap-4 items-center" id="session-operations-container">
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
        <div className="flex gap-2.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl w-full max-w-sm mt-4" id="presets-buttons-container">
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
      <div className="space-y-6" id="ambient-sound-blocker-column">
        {/* Ambient Track Player Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4" id="ambient-player-panel">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Music className="w-4 h-4 text-indigo-500" />
              <span>Ambient Soundroom</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Hi-Fi Synth</span>
          </div>

          <div className="space-y-3" id="tracks-selection-container">
            {/* 1. Standard Default Option: Lo-Fi Coding Synth */}
            <div
              className={`p-3 rounded-2xl border flex justify-between items-center transition-all ${
                lofiTrackPlaying
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-bold'
                  : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850/60 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="lofi-coding-synth-track"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎹</span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Lo-Fi Coding Synth</span>
                  <span className="text-[9px] text-slate-400 font-normal">Web Audio generative rhythm</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setLofiTrackPlaying(!lofiTrackPlaying);
                }}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  lofiTrackPlaying ? 'bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30' : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {lofiTrackPlaying ? 'Pause' : 'Play'}
              </button>
            </div>

            {/* Interactive Uploaded Custom Playlist Header */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Custom Uploaded Playlist
              </span>

              {/* Playlist songs list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1" id="custom-playlist-container">
                {customTracks.length === 0 ? (
                  <div className="text-center py-4 px-3 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10 text-slate-400 text-[11px]">
                    No custom tracks uploaded yet. Select files below to build your focus playlist.
                  </div>
                ) : (
                  customTracks.map((track) => {
                    const isPlaying = playingCustomTrackId === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`p-2.5 rounded-xl border flex justify-between items-center transition-all ${
                          isPlaying
                            ? 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'bg-slate-50/30 dark:bg-slate-950/10 border-slate-100 dark:border-slate-850/60 text-slate-500'
                        }`}
                        id={`custom-track-${track.id}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <Music className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-indigo-500 animate-bounce' : 'text-slate-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium truncate text-slate-700 dark:text-slate-300 pr-1">
                              {track.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Play/Pause Button */}
                          <button
                            onClick={() => {
                              if (isPlaying) {
                                setPlayingCustomTrackId(null);
                              } else {
                                setPlayingCustomTrackId(track.id);
                                setLofiTrackPlaying(false);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isPlaying 
                                ? 'bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30' 
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-300'
                            }`}
                            title={isPlaying ? 'Pause song' : 'Play song'}
                          >
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeCustomAudio(track.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Delete song"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Custom Music Upload Section - ALWAYS VISIBLE */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60" id="music-upload-section">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Upload New Tracks
            </span>
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 rounded-2xl p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-all text-center">
              <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Select music/audio files</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Supports uploading multiple files (MP3, WAV, AAC, etc.)</span>
              <input 
                type="file" 
                accept="audio/*" 
                multiple
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Volume bar and power controls */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4" id="volume-controls-bar">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              {!isMuted ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5 text-rose-500" />}
            </button>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={volume}
              onChange={(e) => {
                setVolume(parseInt(e.target.value));
                setIsMuted(false);
              }}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Simulated Distraction Website Blocker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4" id="shield-blocker-panel">
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

      {/* Hidden audio element for custom user upload */}
      <audio ref={audioRef} loop />
    </div>
  );
};
