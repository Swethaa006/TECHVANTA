import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Mail,
  ShieldAlert,
  UserX,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Copy,
  Check
} from 'lucide-react';
import { NotificationPacket } from '../types/attendance';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationPacket[];
  onResendNotification?: (notification: NotificationPacket) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onResendNotification,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'hod' | 'parents' | 'students'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'hod') return notif.recipientType === 'HOD';
    if (activeFilter === 'parents') return notif.recipientType === 'Parent';
    if (activeFilter === 'students') return notif.recipientType === 'Student';
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const countHod = notifications.filter((n) => n.recipientType === 'HOD').length;
  const countParents = notifications.filter((n) => n.recipientType === 'Parent').length;
  const countStudents = notifications.filter((n) => n.recipientType === 'Student').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Automated Multi-Channel Alert & Notification Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                  REAL-TIME DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of instant SMS & Email dispatches triggered by student absences and faculty no-show alerts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Segmented Tabs */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Transmissions ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('hod')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'hod'
                  ? 'bg-red-950 text-red-300 border border-red-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>HOD Faculty Alerts ({countHod})</span>
            </button>
            <button
              onClick={() => setActiveFilter('parents')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'parents'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Parent Absence SMS ({countParents})</span>
            </button>
            <button
              onClick={() => setActiveFilter('students')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'students'
                  ? 'bg-sky-950 text-sky-300 border border-sky-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-sky-400'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Student Notices ({countStudents})</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
            Carrier: Airtel / AWS SNS & SES
          </span>
        </div>

        {/* Notification Packets List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
              <p className="text-sm font-semibold text-slate-400">No notifications in this category</p>
              <p className="text-xs">Triggers will record SMS and emails here automatically.</p>
            </div>
          ) : (
            filteredNotifications.map((packet) => {
              const isHod = packet.recipientType === 'HOD';
              const isSMS = packet.channel === 'SMS';

              return (
                <div
                  key={packet.id}
                  className={`p-4 rounded-xl border text-xs transition-all ${
                    isHod
                      ? 'bg-red-950/25 border-red-800/80 shadow-md shadow-red-950/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Packet Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      {isSMS ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-700/60 text-emerald-400 font-mono font-bold text-[10px]">
                          <MessageSquare className="w-3 h-3" /> SMS GATEWAY
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/90 border border-sky-700/60 text-sky-400 font-mono font-bold text-[10px]">
                          <Mail className="w-3 h-3" /> OFFICIAL EMAIL
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                          packet.triggerReason === 'Faculty No-Show'
                            ? 'bg-red-600 text-white animate-pulse'
                            : packet.triggerReason === 'Student Absenteeism'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {packet.triggerReason}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {packet.timestamp}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </span>
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-400">Recipient ({packet.recipientType}): </span>
                      <span className="font-semibold text-white">{packet.recipientName}</span>
                      <span className="font-mono text-slate-400 text-[11px] ml-2">
                        ({packet.recipientContact})
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(packet.id, packet.message)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Copy message text"
                    >
                      {copiedId === packet.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Subject Line */}
                  <div className="mt-1.5 font-semibold text-slate-200 text-xs">
                    {packet.subject}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`mt-2 p-3 rounded-lg font-mono text-[11px] leading-relaxed whitespace-pre-line ${
                      isSMS
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-300'
                    }`}
                  >
                    {packet.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Automated SMS & Email Engine v3.1 · Compliant with Institutional Notification Standards
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Outbox
          </button>
        </div>
      </div>
    </div>
  );
};
