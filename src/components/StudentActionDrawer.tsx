import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Camera,
  MessageCircle,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import { Student, AttendanceStatus } from '../types/attendance';

interface StudentActionDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSendAlert: (student: Student, channel: 'whatsapp' | 'email', customNote?: string) => void;
  onUpdateStatus: (studentId: string, status: AttendanceStatus) => void;
}

export const StudentActionDrawer: React.FC<StudentActionDrawerProps> = ({
  student,
  isOpen,
  onClose,
  onSendAlert,
  onUpdateStatus,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !student) return null;

  const handleSend = (channel: 'whatsapp' | 'email') => {
    setIsSending(true);
    setTimeout(() => {
      onSendAlert(student, channel, customNote);
      setIsSending(false);
      setCustomNote('');
    }, 400);
  };

  const isProxy = student.status === 'proxy';
  const isPresent = student.status === 'present';
  const isAbsent = student.status === 'absent';
  const isLate = student.status === 'late';
  const isLowAttendance = student.overallAttendancePct < 75;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-red-400 uppercase tracking-wider">
                Student Biometric Dossier
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="mt-4 flex items-center gap-4">
              <img
                src={student.avatar}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-lg shrink-0 bg-slate-800"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white truncate">{student.name}</h3>
                  {isLowAttendance && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 border border-red-800 text-red-300">
                      &lt;75% RISK
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Roll No: <span className="text-slate-200 font-semibold">{student.rollNo}</span> · {student.department}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{student.studentEmail}</p>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400">Current Session</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isPresent && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present ({student.checkInTime})
                    </span>
                  )}
                  {isProxy && (
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" /> Proxy Alert Flagged
                    </span>
                  )}
                  {isAbsent && (
                    <span className="text-xs font-bold text-slate-400">Absent Today</span>
                  )}
                  {isLate && (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Marked Late ({student.checkInTime})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400">Overall Attendance</span>
                <div className="text-sm font-bold font-mono tabular-nums text-white mt-0.5">
                  {student.overallAttendancePct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Proxy Alert Detailed Banner if active */}
            {isProxy && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Biometric Anomaly Diagnostic</span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">
                  {student.anomalyReason ||
                    'Face matching confidence fell below university verification threshold (42.1%). 3D IR liveness probe detected planar smartphone screen reflection.'}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => onUpdateStatus(student.id, 'present')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 rounded-lg hover:bg-emerald-900 transition-colors"
                  >
                    Clear & Mark Present
                  </button>
                  <button
                    onClick={() => onUpdateStatus(student.id, 'absent')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-red-300 bg-red-950 border border-red-700 rounded-lg hover:bg-red-900 transition-colors"
                  >
                    Confirm Absent
                  </button>
                </div>
              </div>
            )}

            {/* AI Biometric Telemetry */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>AI Face Recognition Metrics</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Match Confidence</span>
                  <div className="text-base font-bold font-mono tabular-nums text-white mt-1">
                    {student.confidence > 0 ? `${student.confidence.toFixed(1)}%` : 'N/A'}
                  </div>
                  <span className="text-[10px] text-slate-500">DeepFace Euclidean Dist: 0.12</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Liveness Test</span>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    {isProxy ? 'FAILED (Spoof)' : 'PASSED'}
                  </div>
                  <span className="text-[10px] text-slate-500">RGB-D Micro-Texture & Blink</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Assigned Seat</span>
                  <div className="text-sm font-semibold font-mono text-slate-200 mt-1">
                    {student.seatLocation}
                  </div>
                  <span className="text-[10px] text-slate-500">Lab Row B · Zone 2</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Camera Feed</span>
                  <div className="text-sm font-semibold font-mono text-slate-200 mt-1">
                    CAM-01 (HD 1080p)
                  </div>
                  <span className="text-[10px] text-slate-500">Angle: 45° Ceiling CCTV</span>
                </div>
              </div>
            </div>

            {/* Attendance History (Past 7 Days) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Past 7 Sessions Audit</span>
              </h4>

              <div className="space-y-2">
                {student.history.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-12 font-mono text-slate-400">{item.day}</span>
                      <span className="text-slate-300">{item.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.checkInTime && (
                        <span className="font-mono text-slate-400 text-[11px]">{item.checkInTime}</span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          item.status === 'present'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : item.status === 'proxy'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : item.status === 'late'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent & Emergency Communication */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Parent Communication Channel</span>
              </h4>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Parent / Guardian:</span>
                  <span className="font-semibold text-slate-200">{student.parentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">WhatsApp / Phone:</span>
                  <span className="font-mono text-slate-200">{student.parentPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">
                    {student.parentEmail}
                  </span>
                </div>
              </div>

              {/* Optional Custom Note input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">
                  Custom message addendum (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please meet HOD tomorrow at 10 AM regarding attendance."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleSend('whatsapp')}
                  disabled={isSending}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp</span>
                </button>

                <button
                  onClick={() => handleSend('email')}
                  disabled={isSending}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Notice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">TechVanta Smart Proctor v2.4</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
