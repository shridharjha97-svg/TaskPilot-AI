import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Zap, Info, Clock, X } from 'lucide-react';
import { Priority } from '../types';

export const FloatingAlerts: React.FC = () => {
  const { alerts, removeAlert } = useApp();

  const getAlertConfig = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-50/95 dark:bg-red-950/90 border-red-500/80 dark:border-red-500/80',
          titleColor: 'text-red-800 dark:text-red-400',
          textColor: 'text-red-600/90 dark:text-red-300/80',
          icon: <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />,
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
          badgeText: 'CRITICAL ALERT'
        };
      case 'high':
        return {
          bg: 'bg-orange-50/95 dark:bg-orange-950/90 border-orange-500/80 dark:border-orange-500/80',
          titleColor: 'text-orange-800 dark:text-orange-400',
          textColor: 'text-orange-600/90 dark:text-orange-300/80',
          icon: <Zap className="w-5 h-5 text-orange-500 animate-bounce" />,
          glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
          badgeText: 'HIGH ATTENTION'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50/95 dark:bg-amber-950/80 border-amber-400 dark:border-amber-500/60',
          titleColor: 'text-amber-800 dark:text-amber-400',
          textColor: 'text-amber-600/90 dark:text-amber-300/80',
          icon: <Clock className="w-5 h-5 text-amber-500" />,
          glow: 'shadow-[0_4px_12px_rgba(245,158,11,0.15)]',
          badgeText: 'MEDIUM PRIORITY'
        };
      case 'low':
      default:
        return {
          bg: 'bg-slate-50/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800',
          titleColor: 'text-slate-800 dark:text-slate-300',
          textColor: 'text-slate-500 dark:text-slate-400',
          icon: <Info className="w-5 h-5 text-slate-500" />,
          glow: 'shadow-md',
          badgeText: 'ROUTINE TASK'
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3.5 w-full max-w-sm pointer-events-none p-4">
      <AnimatePresence>
        {alerts.map((alert) => {
          const config = getAlertConfig(alert.priority);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, x: 100 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`pointer-events-auto border backdrop-blur-md rounded-2xl p-4 flex gap-3 ${config.bg} ${config.glow} transition-all duration-300 relative overflow-hidden`}
              role="alert"
            >
              {/* Top background accent subtle lighting */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20`} />

              <div className="flex-shrink-0 mt-0.5">
                {config.icon}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                    {config.badgeText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {alert.time}
                  </span>
                </div>
                <h5 className={`text-sm font-bold tracking-tight ${config.titleColor} truncate`}>
                  {alert.title}
                </h5>
                <p className={`text-xs mt-0.5 leading-relaxed font-medium ${config.textColor}`}>
                  {alert.message}
                </p>
              </div>

              <button
                onClick={() => removeAlert(alert.id)}
                className="flex-shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all absolute top-2 right-2 cursor-pointer"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
