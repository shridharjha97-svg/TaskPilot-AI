import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, Search, ListFilter, LayoutGrid, CalendarRange, 
  TableProperties, Sparkles, AlertTriangle, Play,  
  CheckCircle, PlusCircle, Trash, Clock, Flame, Tag, CheckSquare 
} from 'lucide-react';
import { Task, Priority, TaskCategory, TaskStatus } from '../types';

export const TaskManagerView: React.FC = () => {
  const { 
    tasks, addTask, updateTask, deleteTask, toggleSubtask, addComment, 
    user, accentColor 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'kanban' | 'list' | 'timeline' | 'table'>('kanban');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [activeTaskDetailId, setActiveTaskDetailId] = useState<string | null>(null);

  // Task Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('work');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newEstTime, setNewEstTime] = useState<string>('3.0');
  const [newDifficulty, setNewDifficulty] = useState<number>(5);
  const [newTag, setNewTag] = useState<string>('');

  // Comment Form State
  const [commentText, setCommentText] = useState<string>('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Use current time + offsets if user doesn't provide due date
    const finalDueDate = newDueDate 
      ? new Date(newDueDate).toISOString() 
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    addTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'todo',
      category: newCategory,
      dueDate: finalDueDate,
      estimatedTime: parseFloat(newEstTime) || 2.0,
      remainingTime: parseFloat(newEstTime) || 2.0,
      difficultyScore: newDifficulty,
      subtasks: [],
      collaborators: [],
      tag: newTag || 'Rescue'
    });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewCategory('work');
    setNewDueDate('');
    setNewEstTime('3.0');
    setNewDifficulty(5);
    setNewTag('');
    setShowAddForm(false);
  };

  // AI Task decomposition simulation - generates custom subtasks based on title
  const triggerAiDecomposition = (taskId: string, title: string) => {
    const lowTitle = title.toLowerCase();
    let decomposed: string[] = [];

    if (lowTitle.includes('architecture') || lowTitle.includes('api')) {
      decomposed = [
        'Model SQL schema relations on DB designer tool',
        'Draft Express endpoints path in types.ts router file',
        'Verify token authorization headers matching criteria',
        'Deploy testing scripts on local sandboxes'
      ];
    } else if (lowTitle.includes('deck') || lowTitle.includes('slide') || lowTitle.includes('pitch')) {
      decomposed = [
        'Format slides layout applying custom twilight glass theme',
        'Review market projections & SAM estimates data',
        'Write 2-minute elevator pitch script',
        'Practice transitions speech under clock constraints'
      ];
    } else if (lowTitle.includes('qa') || lowTitle.includes('testing')) {
      decomposed = [
        'Setup playwright browser instance specs',
        'Write authentication check gate tests suites',
        'Trigger test container workflow in Github action pipeline'
      ];
    } else {
      decomposed = [
        `Plan foundational milestones for "${title}"`,
        `Draft specifications document with stakeholders`,
        `QA cycle checks on deliverables criteria`,
        'Sign-off and sync files metadata'
      ];
    }

    const subtaskArray = decomposed.map((str, idx) => ({
      id: `s-decomp-${Date.now()}-${idx}`,
      title: str,
      done: false
    }));

    updateTask(taskId, { subtasks: subtaskArray, difficultyScore: Math.max(1, subtaskArray.length + 2) });
  };

  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case 'urgent': return 'bg-red-500/10 text-red-500 border border-red-500/25';
      case 'high': return 'bg-orange-500/10 text-orange-500 border border-orange-500/25';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25';
      case 'low': return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
    }
  };

  const getRiskMeterColor = (risk: number) => {
    if (risk > 75) return 'bg-red-500';
    if (risk > 40) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

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
    <div className="space-y-6">
      {/* Search and View Toggles Bar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
          <button
            onClick={() => setActiveSubTab('kanban')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'kanban' 
                ? 'bg-white dark:bg-slate-900 shadow-md text-slate-900 dark:text-white font-bold' 
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kanban Column</span>
          </button>

          <button
            onClick={() => setActiveSubTab('list')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'list' 
                ? 'bg-white dark:bg-slate-900 shadow-md text-slate-900 dark:text-white font-bold' 
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Checklist Stream</span>
          </button>

          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'timeline' 
                ? 'bg-white dark:bg-slate-900 shadow-md text-slate-900 dark:text-white font-bold' 
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Timeline Index</span>
          </button>

          <button
            onClick={() => setActiveSubTab('table')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'table' 
                ? 'bg-white dark:bg-slate-900 shadow-md text-slate-900 dark:text-white font-bold' 
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Metadata Table</span>
          </button>
        </div>

        {/* Task Creation Trigger */}
        <button
          id="create-task-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 ${bgAccentClasses[accentColor]}`}
        >
          <Plus className="w-4.5 h-4.5" />
          <span>+ Create New Task</span>
        </button>
      </div>

      {/* Embedded Create Task Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-lg space-y-4 animate-fade-in relative z-20">
          <h4 className="text-sm font-extrabold uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">Create New Task</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Code firewalls for auth pathways"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Shorthand Tag</label>
              <input
                type="text"
                placeholder="e.g. Firebase Auth"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">Core Description</label>
            <textarea
              placeholder="Dump specifications instructions and notes here..."
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Priority Tier</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs focus:outline-none"
              >
                <option value="work">Work Engineering</option>
                <option value="personal">Wellness Personal</option>
                <option value="academic">Academic / Career</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Target Deadline</label>
              <input
                type="datetime-local"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Estimated Duration (Hrs)</label>
              <input
                type="number"
                step="0.5"
                placeholder="3.0"
                value={newEstTime}
                onChange={(e) => setNewEstTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-add-task-btn"
              type="submit"
              className={`py-2 px-5 text-white font-semibold rounded-xl text-xs cursor-pointer ${bgAccentClasses[accentColor]}`}
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Render Kanban Columns */}
      {activeSubTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
          {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map(status => {
            const list = tasks.filter(t => t.status === status);
            const statusLabels = {
              todo: 'To Do',
              in_progress: 'In Progress',
              review: 'In Review',
              done: 'Completed'
            };
            const colColors = {
              todo: 'border-t-4 border-t-slate-400',
              in_progress: 'border-t-4 border-t-indigo-500',
              review: 'border-t-4 border-t-amber-500',
              done: 'border-t-4 border-t-emerald-500'
            };

            return (
              <div 
                key={status} 
                className={`glass-card rounded-3xl p-4 flex flex-col min-h-[500px] ${colColors[status]}`}
              >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{statusLabels[status]}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-500">{list.length}</span>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  {list.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setActiveTaskDetailId(task.id)}
                      className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/30 dark:border-white/5 shadow-sm hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all cursor-pointer group backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{task.category}</span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-850 dark:text-slate-100 line-clamp-2 leading-relaxed group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h5>

                      {/* Smart Risk Indicator */}
                      {task.status !== 'done' && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Risk index</span>
                            <span className="font-mono">{task.riskMeter}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getRiskMeterColor(task.riskMeter)}`}
                              style={{ width: `${task.riskMeter}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Subtasks Progress */}
                      {task.subtasks.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold font-mono">
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>
                            {task.subtasks.filter(s => s.done).length} / {task.subtasks.length} Subtasks
                          </span>
                        </div>
                      )}

                      {/* Bottom row */}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex -space-x-1.5">
                          {task.collaborators.map(c => (
                            <img 
                              key={c.id} 
                              src={c.avatar} 
                              alt={c.name} 
                              className="w-5.5 h-5.5 rounded-full border border-white dark:border-slate-900 object-cover"
                              title={`${c.name} - ${c.role}`}
                            />
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-1 text-[9px] font-bold font-mono text-slate-400 uppercase">
                          <Clock className="w-3 h-3" />
                          <span>Est: {task.estimatedTime}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render List View */}
      {activeSubTab === 'list' && (
        <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-200/50 dark:border-slate-850/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 dark:hover:border-slate-750 transition-all"
            >
              <div className="flex gap-4 items-start flex-1 overflow-hidden">
                <input 
                  type="checkbox" 
                  checked={task.status === 'done'}
                  onChange={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                  className="custom-checkbox mt-1 shrink-0"
                />
                
                <div className="space-y-1 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Category: {task.category}</span>
                    {task.tag && <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-semibold text-slate-500">Tag: {task.tag}</span>}
                  </div>
                  <h5 className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'} truncate`}>{task.title}</h5>
                  <p className="text-xs text-slate-400 truncate max-w-xl">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-mono font-bold text-slate-400">AI Difficulty Rating</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">{task.difficultyScore} / 10</div>
                </div>
                
                <button
                  onClick={() => setActiveTaskDetailId(task.id)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Timeline View */}
      {activeSubTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-8 animate-fade-in relative">
          <div className="absolute left-10 top-16 bottom-16 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
          
          {tasks.map((task, idx) => {
            const displayDate = new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return (
              <div key={task.id} className="flex gap-6 relative">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 z-10 relative">
                  {idx + 1}
                </div>
                <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-2xl">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{displayDate}</span>
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">{task.title}</h5>
                  <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render Table View */}
      {activeSubTab === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm overflow-x-auto animate-fade-in">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 uppercase tracking-widest text-[9px] font-bold text-slate-400">
                <th className="pb-3 pl-3">S/N</th>
                <th className="pb-3">Title Description</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Risk Level</th>
                <th className="pb-3 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tasks.map((task, idx) => (
                <tr key={task.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 pl-3 font-mono font-bold">{idx + 1}</td>
                  <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div>{task.title}</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5 max-w-sm truncate">{task.description}</div>
                  </td>
                  <td className="py-4">
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4 font-medium uppercase font-mono text-[10px]">{task.category}</td>
                  <td className="py-4">
                    <span className={`font-mono font-bold ${task.riskMeter > 75 ? 'text-red-500' : task.riskMeter > 40 ? 'text-orange-500' : 'text-emerald-500'}`}>
                      {task.riskMeter}%
                    </span>
                  </td>
                  <td className="py-4 pr-3">
                    <button
                      onClick={() => setActiveTaskDetailId(task.id)}
                      className="text-indigo-500 hover:underline font-bold"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAILED TASK CONFIGURATION SLIDEOUT MODAL */}
      {activeTaskDetailId && (
        (() => {
          const detailTask = tasks.find(t => t.id === activeTaskDetailId);
          if (!detailTask) return null;
          
          return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in p-4">
              <div className="w-full max-w-xl h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded uppercase font-bold">Configure Task #{detailTask.id}</span>
                      <h3 className="text-lg font-extrabold text-slate-850 dark:text-white mt-1.5 leading-normal">{detailTask.title}</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTaskDetailId(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* AI Decompose Section */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-spin-slow" />
                        <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100">AI Checklist Decompressor</h6>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerAiDecomposition(detailTask.id, detailTask.title)}
                        className="text-[10px] bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-all cursor-pointer"
                      >
                        Generate Subtasks
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Deconstruct massive deliverables into sequential 15-minute milestones to overcome executive inertia.</p>
                  </div>

                  {/* Checklist Subtasks Render */}
                  <div className="space-y-3">
                    <h6 className="text-xs font-bold uppercase tracking-wider text-slate-400">Micro Milestones Checklist</h6>
                    {detailTask.subtasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No subtask checklists initialized. Use the generator above.</p>
                    ) : (
                      <div className="space-y-2">
                        {detailTask.subtasks.map(sub => (
                          <div 
                            key={sub.id} 
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40"
                          >
                            <input 
                              type="checkbox" 
                              checked={sub.done}
                              onChange={() => toggleSubtask(detailTask.id, sub.id)}
                              className="custom-checkbox shrink-0"
                            />
                            <span className={`text-xs ${sub.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>{sub.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments feed */}
                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <h6 className="text-xs font-bold uppercase tracking-wider text-slate-400">Collaborators Chat</h6>
                    <div className="space-y-3">
                      {detailTask.comments.map(c => (
                        <div key={c.id} className="flex gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/30">
                          <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-lg object-cover" />
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-slate-850 dark:text-slate-200">{c.author}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{c.timestamp}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Write a status update comment..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        onClick={() => {
                          if (!commentText.trim()) return;
                          addComment(detailTask.id, commentText);
                          setCommentText('');
                        }}
                        className={`px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-500`}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center mt-6">
                  <button
                    onClick={() => {
                      deleteTask(detailTask.id);
                      setActiveTaskDetailId(null);
                    }}
                    className="flex items-center gap-1 text-xs text-rose-500 font-bold hover:underline"
                  >
                    <Trash className="w-4 h-4" />
                    <span>Scrap Project</span>
                  </button>
                  <button 
                    onClick={() => setActiveTaskDetailId(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Finish Audit
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
