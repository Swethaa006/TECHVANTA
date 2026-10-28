import React from 'react';
import { ShieldCheck, Moon, Sun, UserPlus, Radio, Bell } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenOverrideModal: (tab?: 'override' | 'enroll') => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isScanning: boolean;
  anomalyActive: boolean;
  onOpenNotificationsModal?: () => void;
  alertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenOverrideModal,
  activeNav,
  setActiveNav,
  isScanning,
  anomalyActive,
  onOpenNotificationsModal,
  alertsCount = 6,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 bg-slate-900/80 dark:bg-slate-950/80 border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30">
              <ShieldCheck className="w-5 h-5" />
              {isScanning && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Tech<span className="text-red-500">Vanta</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/50">
                  AI CORE
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveNav('monitor')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeNav === 'monitor'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              Live Monitoring
            </button>
            <button
              onClick={() => setActiveNav('roster')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeNav === 'roster'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              Student Roster
            </button>
            <button
              onClick={() => setActiveNav('analytics')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeNav === 'analytics'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              Analytics & Heatmap
            </button>
            <button
              onClick={() => setActiveNav('logs')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeNav === 'logs'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              System Audit
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Feed Status Tag */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300">
              <Radio className={`w-3.5 h-3.5 ${anomalyActive ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className="font-mono text-[11px] tabular-nums">
                {anomalyActive ? 'ANOMALY DETECTED' : isScanning ? 'NEURAL SCAN ACTIVE' : 'SYSTEM ONLINE'}
              </span>
            </div>

            {/* Notification Outbox Button */}
            {onOpenNotificationsModal && (
              <button
                onClick={onOpenNotificationsModal}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
                aria-label="View Automated Alert Outbox"
                title="Automated SMS & Email Outbox"
              >
                <Bell className="w-4 h-4 text-red-400" />
                {alertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white font-mono">
                    {alertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
              aria-label="Toggle dark/light theme"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => onOpenOverrideModal('override')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg shadow-md shadow-red-600/25 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Override / Enroll</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
