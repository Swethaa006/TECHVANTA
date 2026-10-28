import React, { useState } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  FileText
} from 'lucide-react';
import { Student, AttendanceStatus, Classroom } from '../types/attendance';

interface ManualOverrideModalProps {
  isOpen: boolean;
  initialTab?: 'override' | 'enroll';
  onClose: () => void;
  students: Student[];
  allClassrooms: Classroom[];
  onApplyOverride: (
    studentId: string,
    newStatus: AttendanceStatus,
    reason: string,
    proctorName: string
  ) => void;
  onEnrollStudent: (newStudent: Student) => void;
}

export const ManualOverrideModal: React.FC<ManualOverrideModalProps> = ({
  isOpen,
  initialTab = 'override',
  onClose,
  students,
  allClassrooms,
  onApplyOverride,
  onEnrollStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'override' | 'enroll'>(initialTab);

  // Tab 1: Override State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [overrideStatus, setOverrideStatus] = useState<AttendanceStatus>('present');
  const [overrideReason, setOverrideReason] = useState<string>(
    'Faculty Exemption / Official Duty (OD)'
  );
  const [proctorName, setProctorName] = useState<string>('Prof. S. Ranganathan');
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  // Tab 2: Enroll State
  const [newName, setNewName] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newDept, setNewDept] = useState('CSE-A');
  const [newSeat, setNewSeat] = useState('Row 2, Seat B-11');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    '/src/assets/images/student_avatar_male_one_1793163122575.jpg'
  );
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    onApplyOverride(selectedStudentId, overrideStatus, overrideReason, proctorName);
    onClose();
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newName.trim() || !newRollNo.trim() || !newParentPhone.trim()) {
      setFormError('Please fill out student name, roll number, and parent phone.');
      return;
    }

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: newName.trim(),
      rollNo: newRollNo.trim().toUpperCase(),
      department: newDept,
      section: 'Sec A',
      avatar: selectedAvatar,
      status: 'present',
      confidence: 98.6,
      overallAttendancePct: 95.0,
      seatLocation: newSeat,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      parentName: newParentName || 'Parent/Guardian',
      parentPhone: newParentPhone,
      parentEmail: newParentEmail || `${newRollNo.toLowerCase()}@parents.edu`,
      studentEmail: newStudentEmail || `${newRollNo.toLowerCase()}@university.edu`,
      spoofRisk: 'none',
      history: [
        {
          date: new Date().toISOString().slice(0, 10),
          day: 'Today',
          status: 'present',
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          camera: 'CAM-01',
          confidence: 98.6,
        },
      ],
    };

    onEnrollStudent(newStudent);
    onClose();
  };

  const targetStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {activeTab === 'override' ? (
              <UserCheck className="w-5 h-5 text-red-500" />
            ) : (
              <UserPlus className="w-5 h-5 text-red-500" />
            )}
            <h3 className="text-base font-bold text-white">
              {activeTab === 'override' ? 'Proctor Attendance Override' : 'Enroll New Student Profile'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('override')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'override'
                ? 'border-red-500 text-white bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Manual Override
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enroll')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'enroll'
                ? 'border-red-500 text-white bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Enroll New Student
          </button>
        </div>

        {/* Tab 1 Form: Manual Override */}
        {activeTab === 'override' && (
          <form onSubmit={handleOverrideSubmit} className="p-6 space-y-4 text-xs">
            {/* Student selection */}
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Select Student:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.rollNo} - {std.name} ({std.department} · {std.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Target student current status summary */}
            {targetStudent && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px]">Current Status</span>
                  <p className="font-semibold text-white capitalize">{targetStudent.status}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">AI Confidence</span>
                  <p className="font-mono text-emerald-400 font-semibold">{targetStudent.confidence}%</p>
                </div>
              </div>
            )}

            {/* Status Selection Buttons */}
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">New Attendance Status:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['present', 'absent', 'late'] as AttendanceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOverrideStatus(st)}
                    className={`py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                      overrideStatus === st
                        ? st === 'present'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : st === 'late'
                          ? 'bg-amber-950 border-amber-500 text-amber-300'
                          : 'bg-red-950 border-red-500 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Dropdown */}
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Administrative Override Reason:</label>
              <select
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="Faculty Exemption / Official Duty (OD)">Faculty Exemption / Official Duty (OD)</option>
                <option value="Medical Mask / Occlusion Verification">Medical Mask / Facial Occlusion Verification</option>
                <option value="False Positive Proxy Reset">False Positive Proxy Anomaly Reset</option>
                <option value="Approved University Sports Representative">Approved University Sports Representative</option>
                <option value="Medical Leave Certificate Submitted">Medical Leave Certificate Submitted</option>
              </select>
            </div>

            {/* Authorizing Proctor / Faculty */}
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Authorizing Faculty Signature:</label>
              <input
                type="text"
                value={proctorName}
                onChange={(e) => setProctorName(e.target.value)}
                placeholder="Faculty / Proctor Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Status Override</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2 Form: Enroll New Student */}
        {activeTab === 'enroll' && (
          <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
            {formError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Avatar picker */}
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Student Biometric Photo:</label>
              <div className="flex items-center gap-3">
                {[
                  '/src/assets/images/student_avatar_male_one_1793163122575.jpg',
                  '/src/assets/images/student_avatar_female_one_1793163122394.jpg',
                  '/src/assets/images/student_avatar_male_two_1793163122804.jpg',
                ].map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(img)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      selectedAvatar === img
                        ? 'border-red-500 ring-2 ring-red-500/50 scale-105'
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Avatar" className="w-12 h-12 object-cover" />
                  </button>
                ))}
                <span className="text-[11px] text-slate-400">
                  Select facial recognition reference embedding
                </span>
              </div>
            </div>

            {/* Name & Roll No */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sundaram"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">University Roll No *</label>
                <input
                  type="text"
                  placeholder="e.g. 22CS144"
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                />
              </div>
            </div>

            {/* Department & Seat */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  {allClassrooms.map((cls) => (
                    <option key={cls.id} value={cls.code}>
                      {cls.code} ({cls.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">Assigned Seat</label>
                <input
                  type="text"
                  placeholder="e.g. Row 3, Seat C-05"
                  value={newSeat}
                  onChange={(e) => setNewSeat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            </div>

            {/* Parent Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. K. Sundaram"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">Parent WhatsApp / Phone *</label>
                <input
                  type="text"
                  placeholder="+91 98400 12345"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                />
              </div>
            </div>

            {/* Email addresses */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Parent Email</label>
                <input
                  type="email"
                  placeholder="parent@domain.com"
                  value={newParentEmail}
                  onChange={(e) => setNewParentEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">Student Email</label>
                <input
                  type="email"
                  placeholder="student@univ.edu"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll into Biometric System</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
