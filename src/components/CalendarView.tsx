import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, Clock, Sparkles, CheckCircle2, ChevronLeft, 
  ChevronRight, ArrowRight, Video, AlertTriangle, Plus 
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { events, addEvent, updateEvent, accentColor } = useApp();

  const [activeViewMode, setActiveViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showAddEventForm, setShowAddEventForm] = useState<boolean>(false);

  // Dynamic Month & Year Navigation
  const systemToday = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(systemToday.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(systemToday.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(systemToday.getDate());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Find the Architecture focus block event to check for conflict
  const conflictEvent = events.find(e => e.start === '13:00' && e.title.includes('Architecture'));

  const handleAutonomouslyReschedule = async () => {
    if (conflictEvent) {
      await updateEvent(conflictEvent.id, { start: '15:30', end: '18:00' });
    }
  };

  // New Event State
  const [evtTitle, setEvtTitle] = useState<string>('');
  const [evtStart, setEvtStart] = useState<string>('09:00');
  const [evtEnd, setEvtEnd] = useState<string>('10:00');
  const [evtDesc, setEvtDesc] = useState<string>('');

  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // Calculate the current week's dates dynamically based on selected month and year
  const getWeekDates = () => {
    // Start on the selected day of the selected month/year
    const baseDate = new Date(currentYear, currentMonth, selectedDay);
    const day = baseDate.getDay(); // 0-6
    const diff = baseDate.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(currentYear, currentMonth, diff);
    
    const week = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNum = String(d.getDate()).padStart(2, '0');
      
      const sysToday = new Date();
      const isToday = d.getDate() === sysToday.getDate() && d.getMonth() === sysToday.getMonth() && d.getFullYear() === sysToday.getFullYear();
      
      week.push({
        label: `${dayNames[i]} ${dayNum}`,
        date: dateStr,
        isToday: isToday
      });
    }
    return week;
  };

  const weekDays = getWeekDates();

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;

    addEvent({
      title: evtTitle,
      start: evtStart,
      end: evtEnd,
      date: activeViewMode === 'day' 
        ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` 
        : (weekDays[0]?.date || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`),
      description: evtDesc,
      category: 'work'
    });

    setEvtTitle('');
    setEvtDesc('');
    setShowAddEventForm(false);
  };

  const renderDayView = () => {
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === todayStr);
    const dateFormatted = new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="flex-1 flex flex-col gap-4 animate-fade-in">
        <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 p-3 rounded-2xl mb-2">
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-100">Schedule for {dateFormatted}</span>
            <span className="text-slate-400 block mt-0.5">{dayEvents.length} slots booked</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-500 px-2 py-0.5 rounded-lg border border-indigo-500/20">Selected Date</span>
        </div>

        <div className="space-y-3">
          {times.map((time, tIdx) => {
            const matchingEvent = dayEvents.find(e => e.start === time);

            return (
              <div key={tIdx} className="grid grid-cols-12 gap-4 items-center min-h-[50px] border-b border-slate-100/50 dark:border-slate-850/20 pb-3">
                <div className="col-span-2 text-[10px] font-mono font-bold text-slate-400 pl-3">{time}</div>
                
                <div 
                  className={`col-span-10 h-full min-h-[44px] rounded-2xl border flex flex-col justify-center p-3 text-left transition-all ${
                    matchingEvent 
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300' 
                      : 'bg-slate-50/30 dark:bg-slate-950/10 border-slate-100/50 dark:border-slate-850/40 border-dashed hover:bg-slate-100 dark:hover:bg-slate-950/30 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!matchingEvent) {
                      setEvtStart(time);
                      const hr = parseInt(time.split(':')[0]) + 1;
                      setEvtEnd(`${String(hr).padStart(2, '0')}:00`);
                      setShowAddEventForm(true);
                    }
                  }}
                >
                  {matchingEvent ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs block">{matchingEvent.title}</span>
                        {matchingEvent.category && (
                          <span className="text-[8px] uppercase tracking-wider bg-indigo-500/15 px-1.5 py-0.5 rounded font-bold">
                            {matchingEvent.category}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] opacity-80 block mt-1">{matchingEvent.description}</span>
                    </div>
                  ) : (
                    <span className="text-slate-350 dark:text-slate-600 text-[10px] font-medium italic flex items-center gap-1">
                      <Plus className="w-3 h-3" /> No commitments. Click to block slot.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="overflow-x-auto animate-fade-in">
        <div className="min-w-[650px]">
          {/* Week Headers */}
          <div className="grid grid-cols-8 gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2 text-center text-xs font-bold text-slate-400">
            <div className="text-left pl-3">Hours</div>
            {weekDays.map((day, dIdx) => (
              <div 
                key={dIdx} 
                className={`py-1 rounded-xl ${day.isToday ? `${textAccentClasses[accentColor]} bg-indigo-500/5 border border-indigo-500/10 font-extrabold` : ''}`}
              >
                {day.label}
              </div>
            ))}
          </div>

          {/* Time Slots rows */}
          <div className="space-y-3">
            {times.map((time, tIdx) => {
              return (
                <div key={tIdx} className="grid grid-cols-8 gap-3 items-center min-h-[44px]">
                  <div className="text-[10px] font-mono font-bold text-slate-400 pl-3">{time}</div>
                  
                  {/* Render Columns */}
                  {weekDays.map((day, cIdx) => {
                    const matchingEvent = events.find(e => e.date === day.date && e.start === time);
                    const hasEvent = !!matchingEvent;

                    return (
                      <div 
                        key={cIdx} 
                        className={`h-full rounded-xl border flex flex-col justify-center p-2.5 text-left text-[10px] transition-all ${
                          hasEvent 
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                            : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850/60 border-dashed hover:bg-slate-100 dark:hover:bg-slate-950/30 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!hasEvent) {
                            setEvtStart(time);
                            const hr = parseInt(time.split(':')[0]) + 1;
                            setEvtEnd(`${String(hr).padStart(2, '0')}:00`);
                            setShowAddEventForm(true);
                          }
                        }}
                      >
                        {hasEvent ? (
                          <div className="truncate">
                            <span className="font-extrabold block truncate">{matchingEvent.title}</span>
                            <span className="text-[9px] opacity-75 block truncate mt-0.5">{matchingEvent.description}</span>
                          </div>
                        ) : (
                          <span className="text-transparent font-mono select-none">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const systemToday = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      
      const isToday = i === systemToday.getDate() && currentMonth === systemToday.getMonth() && currentYear === systemToday.getFullYear();
      
      days.push({
        dayNum: i,
        date: dateStr,
        isToday: isToday,
        events: dayEvents
      });
    }

    return (
      <div className="flex-1 flex flex-col gap-4 animate-fade-in">
        {/* Month grid headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          {dayNames.map(name => (
            <div key={name} className="py-1">{name}</div>
          ))}
        </div>

        {/* Month days grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div 
              key={day.dayNum} 
              onClick={() => {
                setSelectedDay(day.dayNum);
                setActiveViewMode('day');
              }}
              className={`min-h-[85px] rounded-xl border p-2 flex flex-col gap-1 transition-all hover:border-indigo-400 cursor-pointer ${
                day.isToday 
                  ? 'bg-indigo-500/5 border-indigo-500/30 font-bold' 
                  : day.dayNum === selectedDay
                    ? 'bg-indigo-50/30 dark:bg-slate-800/40 border-indigo-400/40 font-bold shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850/60'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-bold ${day.isToday ? 'text-indigo-500 font-extrabold text-[11px]' : 'text-slate-400'}`}>
                  {day.dayNum}
                </span>
                {day.isToday && (
                  <span className="text-[7px] font-bold bg-indigo-500 text-white px-1 py-0.2 rounded-full uppercase">Today</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 max-h-[50px] custom-scrollbar">
                {day.events.map(evt => (
                  <div 
                    key={evt.id}
                    className="text-[8px] leading-tight p-1 rounded bg-indigo-500/10 border border-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-medium truncate"
                    title={`${evt.start} - ${evt.title}`}
                  >
                    <span className="font-bold mr-0.5">{evt.start}</span>
                    {evt.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const bgAccentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    violet: 'bg-violet-600 hover:bg-violet-500',
  };

  const textAccentClasses = {
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    violet: 'text-violet-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
      {/* Calendar Timetable Block Grid */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        {/* Navigation header row */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-display font-extrabold text-sm uppercase tracking-wide px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 font-sans"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-display font-extrabold text-sm uppercase tracking-wide px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 font-sans"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-xl flex gap-1">
              <button 
                onClick={() => setActiveViewMode('day')}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeViewMode === 'day' ? 'bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-white' : 'text-slate-400'}`}
              >Day</button>
              <button 
                onClick={() => setActiveViewMode('week')}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeViewMode === 'week' ? 'bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-white' : 'text-slate-400'}`}
              >Week</button>
              <button 
                onClick={() => setActiveViewMode('month')}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeViewMode === 'month' ? 'bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-white' : 'text-slate-400'}`}
              >Month</button>
            </div>

            <button
              onClick={() => setShowAddEventForm(!showAddEventForm)}
              className={`p-2 rounded-xl text-white shadow transition-all cursor-pointer hover:scale-105 active:scale-95 ${bgAccentClasses[accentColor]}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create Event Form Row */}
        {showAddEventForm && (
          <form onSubmit={handleCreateEvent} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
            <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Lock Event Slot</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="e.g. Code walkthrough with Sarah"
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                required
              />
              <input
                type="text"
                placeholder="Brief purpose description..."
                value={evtDesc}
                onChange={(e) => setEvtDesc(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              />
            </div>
            <div className="flex gap-3 justify-end items-center pt-2">
              <div className="flex gap-2 items-center text-xs">
                <input type="text" value={evtStart} onChange={(e) => setEvtStart(e.target.value)} className="w-14 p-1 text-center bg-white dark:bg-slate-900 border border-slate-250 rounded" />
                <span>to</span>
                <input type="text" value={evtEnd} onChange={(e) => setEvtEnd(e.target.value)} className="w-14 p-1 text-center bg-white dark:bg-slate-900 border border-slate-250 rounded" />
              </div>
              <button type="submit" className={`py-1.5 px-4 text-white font-bold rounded-lg text-xs ${bgAccentClasses[accentColor]}`}>Add Event</button>
            </div>
          </form>
        )}

        {/* Timetable columns grid based on active view mode */}
        {activeViewMode === 'day' && renderDayView()}
        {activeViewMode === 'week' && renderWeekView()}
        {activeViewMode === 'month' && renderMonthView()}
      </div>

      {/* Side Column: AI Rescheduling Advice */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-spin-slow" />
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wide text-slate-850 dark:text-white">AI De-conflict Engines</h4>
          </div>
          
          {conflictEvent ? (
            <>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our autonomous scheduling parser detected **1 core conflict** in today's deep execution roadmap.
              </p>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-3 animate-fade-in">
                <div className="flex gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Overlap Detected: Focus Room</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your 13:00 "Architecture Review block" overlaps with Sarah's urgent Design QA request at 14:00.
                </p>
                <div className="pt-2 border-t border-amber-500/25 space-y-2">
                  <span className="text-[10px] font-bold block">RECOMMENDED MITIGATION:</span>
                  <p className="text-[10px] italic">"Shift Architecture focus block to 15:30 to bypass Sarah's design callback, saving 2.5 hours of delay risk."</p>
                </div>
                <button 
                  onClick={handleAutonomouslyReschedule}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer active:scale-95"
                >
                  Autonomously Reschedule (Save 2.5 Hrs)
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-3 animate-fade-in">
              <div className="flex gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>All Calendar conflicts resolved!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your daily timeline has been optimized successfully. No active overlaps detected.
              </p>
              <div className="pt-1.5 border-t border-emerald-500/20 text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                🚀 +60 XP Awarded & +15 Coins Received
              </div>
            </div>
          )}
        </div>

        {/* Available blocks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
          <h4 className="font-display font-extrabold text-sm uppercase tracking-wide mb-4">Availability blocks</h4>
          <div className="space-y-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/40 flex justify-between">
              <span>🌅 Morning Window</span>
              <span className="text-emerald-500">92% Unblocked</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/40 flex justify-between">
              <span>☀️ Midday Sprints</span>
              <span className="text-amber-500">40% Blocked</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/40 flex justify-between">
              <span>🌙 Night Guard</span>
              <span className="text-emerald-500">100% Free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
