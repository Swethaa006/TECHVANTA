import React from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Video,
  UserCheck,
  UserX,
  Send
} from 'lucide-react';
import { Classroom, FacultyMember, Student } from '../types/attendance';

interface DepartmentOverviewGridProps {
  allClassrooms: Classroom[];
  currentClassroom: Classroom;
  onSelectClassroom: (classroom: Classroom) => void;
  facultyRoster: FacultyMember[];
  students: Student[];
  onOpenNotifications: () => void;
  totalAlertsCount: number;
}

export const DepartmentOverviewGrid: React.FC<DepartmentOverviewGridProps> = ({
  allClassrooms,
  currentClassroom,
  onSelectClassroom,
  facultyRoster,
  students,
  onOpenNotifications,
  totalAlertsCount,
}) => {
  // Aggregate stats across all departments
  const totalEnrolled = students.length;
  const totalPresent = students.filter((s) => s.status === 'present').length;
  const campusAttendanceRate =
    totalEnrolled > 0 ? ((totalPresent / totalEnrolled) * 100).toFixed(1) : '0.0';
  const totalProxies = students.filter((s) => s.status === 'proxy').length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl p-5 space-y-5 backdrop-blur-md">
      {/* Central Command Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Centralized Multi-Department Real-Time Command
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              4 DEPARTMENTS ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric monitoring across IT, CSE, ECE, and Mechanical branches. Click any department card to switch the live CCTV neural feed.
          </p>
        </div>

        {/* Global Aggregate Strip */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400">Campus Attendance:</span>
            <span className="text-sm font-bold text-emerald-400 ml-1.5">{campusAttendanceRate}%</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-slate-400">Automated Alerts:</span>
            <button
              onClick={onOpenNotifications}
              className="text-sm font-bold text-red-400 hover:underline ml-1.5 cursor-pointer"
            >
              {totalAlertsCount} Dispatches &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 4-Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allClassrooms.map((room) => {
          const isSelected = currentClassroom.id === room.id;
          const deptFaculty = facultyRoster.find((f) => f.department === room.code);
          const deptStudents = students.filter((s) => s.department === room.code);
          const deptPresent = deptStudents.filter((s) => s.status === 'present').length;
          const deptRate =
            deptStudents.length > 0
              ? ((deptPresent / deptStudents.length) * 100).toFixed(1)
              : '0.0';
          const deptProxies = deptStudents.filter((s) => s.status === 'proxy').length;
          const isFacultyNoShow = deptFaculty?.status === 'no_show';

          return (
            <div
              key={room.id}
              onClick={() => onSelectClassroom(room)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-slate-900 border-red-500 shadow-xl shadow-red-950/30 ring-1 ring-red-500'
                  : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top: Code & Active Tag */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white tracking-tight">{room.code}</span>
                  <span className="text-[10px] font-mono text-slate-400">({room.section})</span>
                </div>
                {isSelected ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                    LIVE STREAM
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">
                    Switch Feed &rarr;
                  </span>
                )}
              </div>

              {/* Department Name & Subject */}
              <div className="mt-2.5">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{room.name}</h4>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                  {deptFaculty ? `${deptFaculty.subjectCode} · ${deptFaculty.subjectName}` : 'In Session'}
                </p>
              </div>

              {/* Attendance & Present Metrics */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Attendance</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{deptRate}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Present Count</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {deptPresent}/{deptStudents.length}
                  </span>
                </div>
              </div>

              {/* Faculty Status Indicator */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Faculty:</span>
                {isFacultyNoShow ? (
                  <span className="inline-flex items-center gap-1 text-red-400 font-bold font-mono animate-pulse">
                    <UserX className="w-3 h-3 text-red-500" />
                    NO-SHOW ALERT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium font-mono">
                    <UserCheck className="w-3 h-3" />
                    Checked In
                  </span>
                )}
              </div>

              {/* Anomaly Badge if present */}
              {deptProxies > 0 && (
                <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 flex items-center justify-between">
                  <span>Biometric Spoof Detected</span>
                  <span className="font-bold">{deptProxies} Flagged</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
