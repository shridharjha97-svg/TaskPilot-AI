import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, Send, Mic, Volume2, ShieldAlert, Zap, 
  Trash2, Play, Calendar, ListChecks, Hourglass, Bot 
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { 
    messages, sendMessage, clearMessages, isAiThinking, 
    accentColor, setRescueModeActive 
  } = useApp();

  const [input, setInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (text: string) => {
    // Strip emojis for pure command query parsing
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
    sendMessage(cleanText);
  };

  const textAccentClasses = {
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    violet: 'text-violet-500',
  };

  const bgAccentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    violet: 'bg-violet-600 hover:bg-violet-500',
  };

  const renderMessageText = (text: string, isAssistant: boolean) => {
    if (!text) return null;
    const lines = text.split('\n');
    const textClass = isAssistant ? 'text-slate-750 dark:text-slate-200' : 'text-white';
    const numClass = isAssistant ? 'text-indigo-500' : 'text-indigo-200';
    const strongClass = isAssistant ? 'text-slate-900 dark:text-white font-extrabold' : 'text-white font-extrabold';

    return (
      <div className="space-y-1.5">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          
          // Check for Markdown headings first
          const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const headingText = headingMatch[2];
            
            // Parse **bold** syntax inside heading text
            const parts = [];
            let currentIndex = 0;
            const boldRegex = /\*\*(.*?)\*\*/g;
            let match;

            while ((match = boldRegex.exec(headingText)) !== null) {
              const matchIndex = match.index;
              if (matchIndex > currentIndex) {
                parts.push(headingText.substring(currentIndex, matchIndex));
              }
              parts.push(
                <strong key={matchIndex} className={strongClass}>
                  {match[1]}
                </strong>
              );
              currentIndex = boldRegex.lastIndex;
            }

            if (currentIndex < headingText.length) {
              parts.push(headingText.substring(currentIndex));
            }

            const headingContent = parts.length > 0 ? parts : headingText;

            if (level === 1) {
              return (
                <h1 key={lineIdx} className="text-sm font-extrabold text-slate-900 dark:text-white mt-4 mb-1 border-b border-slate-100 dark:border-white/10 pb-1">
                  {headingContent}
                </h1>
              );
            } else if (level === 2) {
              return (
                <h2 key={lineIdx} className="text-xs font-bold text-slate-850 dark:text-slate-100 mt-3 mb-1">
                  {headingContent}
                </h2>
              );
            } else {
              return (
                <h3 key={lineIdx} className="text-[11px] font-bold text-slate-800 dark:text-slate-150 mt-2 mb-0.5">
                  {headingContent}
                </h3>
              );
            }
          }

          const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const isNumList = /^\d+\.\s/.test(trimmed);
          let displayLine = line;

          if (isBullet) {
            displayLine = trimmed.substring(2);
          } else if (isNumList) {
            const match = trimmed.match(/^\d+\.\s/);
            displayLine = trimmed.substring(match ? match[0].length : 0);
          }

          // Parse **bold** syntax securely
          const parts = [];
          let currentIndex = 0;
          const boldRegex = /\*\*(.*?)\*\*/g;
          let match;

          while ((match = boldRegex.exec(displayLine)) !== null) {
            const matchIndex = match.index;
            if (matchIndex > currentIndex) {
              parts.push(displayLine.substring(currentIndex, matchIndex));
            }
            parts.push(
              <strong key={matchIndex} className={strongClass}>
                {match[1]}
              </strong>
            );
            currentIndex = boldRegex.lastIndex;
          }

          if (currentIndex < displayLine.length) {
            parts.push(displayLine.substring(currentIndex));
          }

          if (isBullet) {
            return (
              <div key={lineIdx} className="flex gap-2 pl-2">
                <span className={`${numClass} font-bold shrink-0`}>•</span>
                <span className={`flex-1 ${textClass}`}>
                  {parts.length > 0 ? parts : displayLine}
                </span>
              </div>
            );
          }

          if (isNumList) {
            const numMatch = trimmed.match(/^(\d+\.)\s/);
            const numPrefix = numMatch ? numMatch[1] : '';
            return (
              <div key={lineIdx} className="flex gap-2 pl-2">
                <span className={`${numClass} font-mono font-bold shrink-0`}>{numPrefix}</span>
                <span className={`flex-1 ${textClass}`}>
                  {parts.length > 0 ? parts : displayLine}
                </span>
              </div>
            );
          }

          return (
            <p key={lineIdx} className={`min-h-[1.2em] ${textClass}`}>
              {parts.length > 0 ? parts : displayLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] glass-card rounded-3xl overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="h-14 border-b border-slate-100 dark:border-white/10 px-6 flex justify-between items-center bg-white/20 dark:bg-black/25">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">TaskPilot AI Commander</h4>
            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Commander Active</span>
            </span>
          </div>
        </div>

        <button 
          onClick={clearMessages}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear logs</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((m, idx) => {
          const isAssistant = m.sender === 'assistant';
          
          return (
            <div 
              key={m.id} 
              className={`flex gap-4 max-w-2xl ${isAssistant ? 'mr-auto text-left' : 'ml-auto text-right flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isAssistant ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {isAssistant ? <Sparkles className="w-4.5 h-4.5" /> : 'U'}
              </div>

              <div className="space-y-3">
                <div className={`p-4 rounded-3xl text-xs leading-relaxed ${
                  isAssistant 
                    ? 'bg-white/35 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 backdrop-blur-sm' 
                    : 'bg-indigo-600 text-white font-medium'
                }`}>
                  {/* Format line breaks and markdown syntax correctly */}
                  {renderMessageText(m.text, isAssistant)}
                </div>

                {/* Render prompt suggestions if assistant */}
                {isAssistant && m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSuggestionClick(sug)}
                        className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200/50 dark:border-slate-800 text-[10px] font-semibold rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Thinking / typing state */}
        {isAiThinking && (
          <div className="flex gap-4 max-w-xl mr-auto text-left animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5 animate-spin-slow" />
            </div>
            <div className="p-4 rounded-3xl bg-white/35 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input controls box */}
      <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-white/10 dark:bg-black/15">
        <div className="flex gap-3 bg-white/50 dark:bg-black/30 border border-slate-200/40 dark:border-white/10 rounded-2xl p-2 items-center backdrop-blur-sm">
          <input
            type="text"
            placeholder="Direct your AI Commander (e.g. 'Plan my day' or 'Activate Rescue Mode')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white pl-3"
          />

          <div className="flex items-center gap-1.5">
            {/* Mock microphone */}
            <button 
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Voice Notes"
            >
              <Mic className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleSend}
              className={`p-2.5 text-white rounded-xl transition-all shadow-md cursor-pointer ${bgAccentClasses[accentColor]}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shorthand shortcut helpers below bar */}
        <div className="mt-3 flex gap-3 text-[10px] text-slate-400 font-semibold justify-center">
          <span>Try asking:</span>
          <button onClick={() => sendMessage('Plan my day')} className="text-indigo-500 hover:underline">Plan my day</button>
          <span>•</span>
          <button onClick={() => sendMessage('Prioritize tasks')} className="text-indigo-500 hover:underline">Prioritize tasks</button>
          <span>•</span>
          <button onClick={() => sendMessage('Activate Rescue Mode')} className="text-indigo-500 hover:underline">Rescue Mode</button>
        </div>
      </div>
    </div>
  );
};
