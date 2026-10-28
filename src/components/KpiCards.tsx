import React from 'react';
import { Users, TrendingUp, AlertOctagon, Video } from 'lucide-react';

interface KpiCardsProps {
  totalStudents: number;
  presentCount: number;
  attendanceRate: number;
  proxyCount: number;
  activeClassroomsCount: number;
  totalClassroomsCount: number;
  activeFilter: string;
  onSelectFilter: (filter: 'all' | 'present' | 'low' | 'proxy') => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalStudents,
  presentCount,
  attendanceRate,
  proxyCount,
  activeClassroomsCount,
  totalClassroomsCount,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Students */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
          activeFilter === 'all'
            ? 'bg-slate-900/90 border-slate-600 shadow-lg shadow-slate-900/40 ring-1 ring-slate-500'
            : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Enrolled</span>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-slate-700 transition-colors">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-white">{totalStudents}</span>
          <span className="text-xs text-slate-400">students across branches</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Active in session</span>
          <span className="font-mono text-slate-300 font-semibold">{presentCount} present</span>
        </div>
      </div>

      {/* KPI 2: Attendance Rate */}
      <div
        onClick={() => onSelectFilter('present')}
        className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
          activeFilter === 'present'
            ? 'bg-slate-900/90 border-emerald-600/70 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500'
            : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Attendance Rate</span>
          <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 group-hover:bg-emerald-900/60 transition-colors">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">{attendanceRate.toFixed(1)}%</span>
          <span className="text-xs text-emerald-500 font-mono font-medium">+2.4% vs 7d avg</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Target threshold</span>
          <span className="font-mono text-slate-300">75.0% mandatory</span>
        </div>
      </div>

      {/* KPI 3: Proxy Anomalies */}
      <div
        onClick={() => onSelectFilter('proxy')}
        className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
          activeFilter === 'proxy'
            ? 'bg-red-950/40 border-red-600 shadow-lg shadow-red-950/30 ring-1 ring-red-500'
            : proxyCount > 0
            ? 'bg-slate-900/60 hover:bg-slate-900/80 border-red-900/60 hover:border-red-700'
            : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Proxy Anomalies</span>
          <div className={`p-2 rounded-lg transition-colors ${proxyCount > 0 ? 'bg-red-950 text-red-400 border border-red-800/60' : 'bg-slate-800 text-slate-400'}`}>
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono tabular-nums ${proxyCount > 0 ? 'text-red-400' : 'text-slate-200'}`}>
            {proxyCount}
          </span>
          <span className="text-xs text-red-400/90 font-medium">
            {proxyCount > 0 ? 'Action required' : 'Nominal'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Biometric spoof flags</span>
          <span className="font-mono text-red-400 font-semibold">{proxyCount > 0 ? '2D photo/duplicate' : 'None'}</span>
        </div>
      </div>

      {/* KPI 4: Active Classrooms */}
      <div className="p-4 rounded-xl border bg-slate-900/60 border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Monitored Rooms</span>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <Video className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            {activeClassroomsCount} / {totalClassroomsCount}
          </span>
          <span className="text-xs text-slate-400">RTSP CCTV feeds</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Neural pipeline</span>
          <span className="font-mono text-emerald-400 font-semibold">30 FPS · 14ms</span>
        </div>
      </div>
    </div>
  );
};
