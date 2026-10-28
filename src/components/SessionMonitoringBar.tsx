import React from 'react';
import {
  Clock,
  Scan,
  UserCheck,
  AlertOctagon,
  Bell,
  Mail,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Users,
  LogOut,
  Send
} from 'lucide-react';
import { FacultyMember, SessionMonitoringState, Classroom } from '../types/attendance';

interface SessionMonitoringBarProps {
  currentClassroom: Classroom;
  faculty: FacultyMember;
  sessionState: SessionMonitoringState;
  onSimulateStartScan: () => void;
  onSimulateEndScan: () => void;
  onSimulateFacultyNoShow: () => void;
  onSimulateFacultyCheckIn: () => void;
  onOpenNotificationsModal: () => void;
  isScanningStart: boolean;
  isScanningEnd: boolean;
  totalStudentsCount: number;
  presentCount: number;
}

export const SessionMonitoringBar: React.FC<SessionMonitoringBarProps> = ({
  currentClassroom,
  faculty,
  sessionState,
  onSimulateStartScan,
  onSimulateEndScan,
  onSimulateFacultyNoShow,
  onSimulateFacultyCheckIn,
  onOpenNotificationsModal,
  isScanningStart,
  isScanningEnd,
  totalStudentsCount,
  presentCount,
}) => {
  const isNoShow = faculty.status === 'no_show';
  const isCheckedIn = faculty.status === 'checked_in';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-5 space-y-5 backdrop-blur-md">
      {/* Top Banner: Automation Workflow Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Automated Session Monitoring Engine
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              FIRST 10M & LAST 10M DUAL-VERIFICATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated facial recognition sweeps at session open (09:00–09:10 AM) and departure (09:40–09:50 AM) with automated SMS/Email triggers for absentees and faculty no-show.
          </p>
        </div>

        {/* View Notification Outbox Button */}
        <button
          onClick={onOpenNotificationsModal}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-red-400" />
          <span>View Outbox (SMS & Email Logs)</span>
        </button>
      </div>

      {/* Visual 50-Minute Session Timeline */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-white">Period 1 Timeline:</span>
            <span className="font-mono text-slate-300">09:00 AM — 09:50 AM (50 Mins)</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400 font-bold">
            SESSION ACTIVE · ELAPSED: 12 MINS
          </span>
        </div>

        {/* 3-Stage Session Timeline Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {/* Phase 1: First 10 Mins Scan */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              sessionState.startScanCompleted
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-200 animate-pulse'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider">
                1. First 10 Mins Entrance Scan
              </span>
              <span className="font-mono text-[10px] font-bold">
                {sessionState.startScanCompleted ? 'COMPLETED' : 'WINDOW CLOSING'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300 leading-tight">
              09:00 - 09:10 AM · Auto-face scan marks initial attendance and sends absentee SMS to parents.
            </p>
          </div>

          {/* Phase 2: Core Instruction */}
          <div className="p-3 rounded-xl border bg-slate-900 border-slate-800 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-200">
                2. Core Lecture & Lab
              </span>
              <span className="font-mono text-[10px] text-slate-400">IN PROGRESS</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-tight">
              09:10 - 09:40 AM · Ambient proctor monitoring, liveness verification, and proxy anomaly tracking.
            </p>
          </div>

          {/* Phase 3: Last 10 Mins Verification */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              sessionState.endScanCompleted
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider">
                3. Last 10 Mins Departure Sweep
              </span>
              <span className="font-mono text-[10px] font-bold">
                {sessionState.endScanCompleted ? 'VERIFIED' : 'SCHEDULED (09:40)'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-tight">
              09:40 - 09:50 AM · Departure check prevents early bunking; validates session retention rate.
            </p>
          </div>
        </div>

        {/* Action Triggers: Simulate Start Scan & End Verification */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onSimulateStartScan}
            disabled={isScanningStart}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Scan className="w-4 h-4" />
            <span>
              {isScanningStart
                ? 'Running First 10-Min Scan...'
                : 'Simulate Class Start Scan (First 10 Mins)'}
            </span>
          </button>

          <button
            onClick={onSimulateEndScan}
            disabled={isScanningEnd}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 text-emerald-400" />
            <span>
              {isScanningEnd
                ? 'Running Departure Sweep...'
                : 'Simulate Class End Verification (Last 10 Mins)'}
            </span>
          </button>
        </div>
      </div>

      {/* Faculty Attendance & HOD Alert Card */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isNoShow
            ? 'bg-red-950/30 border-red-700 shadow-xl shadow-red-950/40 ring-1 ring-red-600'
            : 'bg-slate-950/70 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <img
              src={faculty.avatar}
              alt={faculty.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 shrink-0 bg-slate-800"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Assigned Faculty:</span>
                <h4 className="text-sm font-bold text-white">{faculty.name}</h4>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {faculty.subjectCode}: {faculty.subjectName}
                </span>
              </div>

              {/* Status display */}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                {isCheckedIn ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                    <UserCheck className="w-3.5 h-3.5" /> Checked In at {faculty.checkInTime}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-400 font-bold font-mono animate-pulse">
                    <AlertOctagon className="w-4 h-4 text-red-500" />
                    CRITICAL: FACULTY NO-SHOW (10+ MINS ELAPSED)
                  </span>
                )}
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  Room: <span className="font-mono text-slate-200">{faculty.roomCode}</span>
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  HOD Contact: <span className="text-slate-300 font-medium">{faculty.hodName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Faculty Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
            {isNoShow ? (
              <button
                onClick={onSimulateFacultyCheckIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Simulate Faculty Late Arrival</span>
              </button>
            ) : (
              <button
                onClick={onSimulateFacultyNoShow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-950/80 hover:bg-red-900 border border-red-700/60 rounded-lg transition-colors cursor-pointer"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Faculty No-Show (10 Min Breach)</span>
              </button>
            )}

            <button
              onClick={onOpenNotificationsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-red-400" />
              <span>HOD Alert Packet</span>
            </button>
          </div>
        </div>

        {/* Urgent Warning Details if No-Show */}
        {isNoShow && (
          <div className="mt-3.5 pt-3 border-t border-red-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Automated high-priority alert dispatched to {faculty.hodName} ({faculty.hodPhone} / {faculty.hodEmail}). 62 students currently unattended in {faculty.roomCode}.
              </span>
            </div>
            <button
              onClick={onOpenNotificationsModal}
              className="underline hover:text-white font-medium shrink-0"
            >
              Inspect Sent SMS/Email &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
