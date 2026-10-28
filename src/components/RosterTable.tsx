import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronRight,
  MessageSquare,
  Building,
  MoreVertical,
  ShieldAlert,
  ArrowUpDown,
  Send,
  UserX,
  PhoneCall,
  Mail
} from 'lucide-react';
import { Student, AttendanceStatus, Classroom, FacultyMember } from '../types/attendance';

export type RosterFilter = 'all' | 'present' | 'low' | 'absent_alerts' | 'faculty_alerts' | 'proxy';

interface RosterTableProps {
  students: Student[];
  allClassrooms: Classroom[];
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
  activeFilter: RosterFilter;
  onSelectFilter: (filter: RosterFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectStudent: (student: Student) => void;
  onQuickToggleStatus: (studentId: string, newStatus: AttendanceStatus) => void;
  onSendParentAlert: (student: Student, channel: 'whatsapp' | 'email') => void;
  facultyRoster?: FacultyMember[];
  onOpenNotifications?: () => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  students,
  allClassrooms,
  selectedDepartment,
  onSelectDepartment,
  activeFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  onSelectStudent,
  onQuickToggleStatus,
  onSendParentAlert,
  facultyRoster = [],
  onOpenNotifications,
}) => {
  const [sortField, setSortField] = useState<'name' | 'rollNo' | 'confidence' | 'overall'>('rollNo');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Filter students based on department, filter criteria, and search
  const filteredStudents = students
    .filter((student) => {
      // Department filter
      if (selectedDepartment !== 'ALL' && student.department !== selectedDepartment) {
        return false;
      }
      // Status & Attendance filter
      if (activeFilter === 'present' && student.status !== 'present') return false;
      if (activeFilter === 'proxy' && student.status !== 'proxy') return false;
      if (activeFilter === 'low' && student.overallAttendancePct >= 75) return false;
      if (activeFilter === 'absent_alerts' && student.status !== 'absent') return false;

      // Faculty alerts filter (shows students in rooms with faculty no-show)
      if (activeFilter === 'faculty_alerts') {
        const noShowDepts = facultyRoster.filter((f) => f.status === 'no_show').map((f) => f.department);
        if (!noShowDepts.includes(student.department)) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(q) ||
          student.rollNo.toLowerCase().includes(q) ||
          student.seatLocation.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let result = 0;
      if (sortField === 'name') result = a.name.localeCompare(b.name);
      else if (sortField === 'rollNo') result = a.rollNo.localeCompare(b.rollNo);
      else if (sortField === 'confidence') result = a.confidence - b.confidence;
      else if (sortField === 'overall') result = a.overallAttendancePct - b.overallAttendancePct;
      return sortAsc ? result : -result;
    });

  const handleSort = (field: 'name' | 'rollNo' | 'confidence' | 'overall') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Counts for filters within currently selected department
  const deptStudents = selectedDepartment === 'ALL'
    ? students
    : students.filter((s) => s.department === selectedDepartment);

  const countAll = deptStudents.length;
  const countPresent = deptStudents.filter((s) => s.status === 'present').length;
  const countLow = deptStudents.filter((s) => s.overallAttendancePct < 75).length;
  const countAbsentAlerts = deptStudents.filter((s) => s.status === 'absent').length;
  const countProxy = deptStudents.filter((s) => s.status === 'proxy').length;
  const countFacultyAlerts = facultyRoster.filter((f) => f.status === 'no_show').length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header Bar with Department Switcher & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Enterprise Classroom Attendance Roster</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({filteredStudents.length} of {countAll} students)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated multi-department attendance register with instant parent SMS dispatch & faculty no-show tracking.
            </p>
          </div>

          {/* Interactive Class & Department Switcher Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDepartment}
              onChange={(e) => onSelectDepartment(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
            >
              <option value="ALL">All Departments (Consolidated Campus)</option>
              {allClassrooms.map((cls) => (
                <option key={cls.id} value={cls.code}>
                  {cls.code} - {cls.name} ({cls.section})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Segmented Buttons & Search Bar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 pt-1">
          {/* Working Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 overflow-x-auto">
            {/* Filter 1: All Departments */}
            <button
              onClick={() => {
                onSelectDepartment('ALL');
                onSelectFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeFilter === 'all' && selectedDepartment === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Departments ({students.length})
            </button>

            {/* Filter: Present */}
            <button
              onClick={() => onSelectFilter('present')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeFilter === 'present'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Present ({countPresent})</span>
            </button>

            {/* Filter 2: Low Attendance */}
            <button
              onClick={() => onSelectFilter('low')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeFilter === 'low'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Attendance &lt;75% ({countLow})</span>
            </button>

            {/* Filter 3: Absent Alerts Sent */}
            <button
              onClick={() => onSelectFilter('absent_alerts')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeFilter === 'absent_alerts'
                  ? 'bg-red-950 text-red-300 border border-red-700/60 shadow-sm ring-1 ring-red-500/50'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-red-400" />
              <span>Absent Alerts Sent ({countAbsentAlerts})</span>
            </button>

            {/* Filter 4: Faculty Alerts Sent */}
            <button
              onClick={() => onSelectFilter('faculty_alerts')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeFilter === 'faculty_alerts'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Faculty Alerts Sent ({countFacultyAlerts})</span>
            </button>

            {/* Proxy Alerts */}
            <button
              onClick={() => onSelectFilter('proxy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeFilter === 'proxy'
                  ? 'bg-red-950 text-red-300 border border-red-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Proxy Alerts ({countProxy})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student, roll no, seat..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Student & Parent</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rollNo')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Roll No</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Class & Seat</th>
              <th className="py-3 px-4">Today's Session Status</th>
              <th
                onClick={() => handleSort('confidence')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>AI Confidence</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('overall')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Overall %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Automated Trigger</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-semibold text-slate-300">No students match current filter</p>
                    <p className="text-xs text-slate-500">Try adjusting your search query or selecting All Departments.</p>
                    <button
                      onClick={() => {
                        onSelectFilter('all');
                        onSearchChange('');
                      }}
                      className="mt-2 px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isProxy = student.status === 'proxy';
                const isPresent = student.status === 'present';
                const isAbsent = student.status === 'absent';
                const isLate = student.status === 'late';
                const isLowAttendance = student.overallAttendancePct < 75;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors cursor-pointer group ${
                      isProxy
                        ? 'bg-red-950/20 hover:bg-red-950/40'
                        : isAbsent
                        ? 'bg-slate-950/40 hover:bg-slate-900/60'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Student Info */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3 px-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-100 group-hover:text-red-400 transition-colors truncate">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            Parent: {student.parentName} ({student.parentPhone})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3 px-4 font-mono font-medium text-slate-300"
                    >
                      {student.rollNo}
                    </td>

                    {/* Class & Seat */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3 px-4 text-slate-300"
                    >
                      <div>
                        <span className="font-mono text-slate-200">{student.department}</span>
                        <div className="text-[11px] text-slate-400 font-mono">{student.seatLocation}</div>
                      </div>
                    </td>

                    {/* Today's Session Status */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3 px-4"
                    >
                      {isPresent && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present · {student.checkInTime}</span>
                        </div>
                      )}
                      {isProxy && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950 border border-red-700 text-red-300 font-bold text-[11px] animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          <span>Proxy Alert</span>
                        </div>
                      )}
                      {isAbsent && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Absent (Period 1)</span>
                        </div>
                      )}
                      {isLate && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late · {student.checkInTime}</span>
                        </div>
                      )}
                    </td>

                    {/* AI Confidence */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3 px-4"
                    >
                      <div className="w-28">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className={isProxy ? 'text-red-400 font-bold' : 'text-slate-300'}>
                            {student.confidence > 0 ? `${student.confidence.toFixed(1)}%` : '—'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isProxy
                                ? 'bg-red-500'
                                : student.confidence >= 95
                                ? 'bg-emerald-500'
                                : student.confidence > 0
                                ? 'bg-amber-500'
                                : 'bg-slate-700'
                            }`}
                            style={{ width: `${Math.max(student.confidence, 4)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Overall Attendance */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3 px-4 font-mono tabular-nums"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isLowAttendance ? 'text-red-400 font-bold' : 'text-slate-200'
                          }`}
                        >
                          {student.overallAttendancePct.toFixed(1)}%
                        </span>
                        {isLowAttendance && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-800/80 text-[10px] text-red-300">
                            &lt;75%
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Automated Multi-Channel Trigger Status */}
                    <td
                      onClick={() => {
                        if (isAbsent && onOpenNotifications) onOpenNotifications();
                        else onSelectStudent(student);
                      }}
                      className="py-3 px-4"
                    >
                      {isAbsent ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/70 border border-red-800/60 text-[10px] font-mono text-red-300 font-semibold">
                          <Send className="w-3 h-3 text-red-400" />
                          <span>SMS/Email Dispatched</span>
                        </div>
                      ) : isProxy ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-[10px] font-mono text-amber-300 font-semibold">
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          <span>Dean Alert Sent</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">
                          Auto-logged (Pass)
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendParentAlert(student, 'whatsapp');
                          }}
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 border border-transparent hover:border-emerald-800/60 transition-colors cursor-pointer"
                          title={`Resend instant alert to parent (${student.parentName})`}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(student);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
