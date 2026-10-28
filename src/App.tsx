/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { CameraSimulator } from './components/CameraSimulator';
import { RosterTable, RosterFilter } from './components/RosterTable';
import { StudentActionDrawer } from './components/StudentActionDrawer';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ManualOverrideModal } from './components/ManualOverrideModal';
import { ToastContainer } from './components/ToastContainer';
import { SessionMonitoringBar } from './components/SessionMonitoringBar';
import { DepartmentOverviewGrid } from './components/DepartmentOverviewGrid';
import { NotificationModal } from './components/NotificationModal';
import {
  Student,
  Classroom,
  BoundingBoxTarget,
  SystemLog,
  HeatmapDay,
  ToastMessage,
  AttendanceStatus,
  FacultyMember,
  NotificationPacket,
  SessionMonitoringState,
} from './types/attendance';
import {
  CLASSROOMS,
  INITIAL_STUDENTS,
  INITIAL_BOUNDING_BOXES,
  INITIAL_LOGS,
  MONTHLY_HEATMAP_DATA,
  FACULTY_ROSTER,
  INITIAL_NOTIFICATIONS,
  INITIAL_SESSION_STATE,
} from './data/mockData';
import { Shield, Sparkles, Video, Users, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Theme state: default dark mode
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Application Data States
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentClassroom, setCurrentClassroom] = useState<Classroom>(CLASSROOMS[0]);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBoxTarget[]>(INITIAL_BOUNDING_BOXES);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [heatmapDays, setHeatmapDays] = useState<HeatmapDay[]>(MONTHLY_HEATMAP_DATA);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Multi-Department & Faculty States
  const [facultyRoster, setFacultyRoster] = useState<FacultyMember[]>(FACULTY_ROSTER);
  const [notifications, setNotifications] = useState<NotificationPacket[]>(INITIAL_NOTIFICATIONS);
  const [sessionState, setSessionState] = useState<SessionMonitoringState>(INITIAL_SESSION_STATE);

  // Navigation & Filtering
  const [activeNav, setActiveNav] = useState<string>('monitor');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('CSE-A');
  const [activeFilter, setActiveFilter] = useState<RosterFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState<boolean>(false);
  const [overrideModalTab, setOverrideModalTab] = useState<'override' | 'enroll'>('override');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Simulator States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isScanningStart, setIsScanningStart] = useState<boolean>(false);
  const [isScanningEnd, setIsScanningEnd] = useState<boolean>(false);
  const [anomalyActive, setAnomalyActive] = useState<boolean>(true); // initially active on Rohan for demo
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toast Helper
  const showToast = (type: 'success' | 'alert' | 'info', title: string, description: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      description,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch Classroom / Department
  const handleSelectClassroom = (classroom: Classroom) => {
    setCurrentClassroom(classroom);
    setSelectedDepartment(classroom.code);
    showToast(
      'info',
      `Switched to ${classroom.code}`,
      `Streaming camera feed from ${classroom.cameraName}`
    );
  };

  // Currently assigned faculty for active room
  const currentFaculty =
    facultyRoster.find((f) => f.department === currentClassroom.code) || facultyRoster[0];

  // 1. Simulate Class Start Scan (First 10 Mins)
  const handleSimulateStartScan = () => {
    if (isScanningStart) return;
    setIsScanningStart(true);

    showToast(
      'info',
      'First 10-Min Session Scan Running',
      `Executing entrance face recognition sweep for ${currentClassroom.code} (${currentClassroom.name})...`
    );

    setTimeout(() => {
      setIsScanningStart(false);
      setSessionState((prev) => ({
        ...prev,
        startScanCompleted: true,
        startScanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      // Find absent students in this department and trigger automated SMS & Email packets
      const absentStudents = students.filter(
        (s) => s.department === currentClassroom.code && s.status === 'absent'
      );

      const newPackets: NotificationPacket[] = [];
      absentStudents.forEach((std) => {
        // SMS to Parent
        newPackets.push({
          id: `notif-sms-${Date.now()}-${std.id}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          channel: 'SMS',
          recipientType: 'Parent',
          recipientName: std.parentName,
          recipientContact: std.parentPhone,
          subject: `Automated Absence Alert: ${std.name} (${std.rollNo})`,
          message: `TechVanta Automated Alert: ${std.name} (${std.rollNo}) was marked ABSENT for ${currentFaculty.subjectCode} (${currentFaculty.subjectName}) during the First 10-Min face scan at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please ensure attendance compliance.`,
          status: 'delivered',
          triggerReason: 'Student Absenteeism',
          relatedEntity: std.rollNo,
        });

        // Email to Student
        newPackets.push({
          id: `notif-email-${Date.now()}-${std.id}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          channel: 'Email',
          recipientType: 'Student',
          recipientName: std.name,
          recipientContact: std.studentEmail,
          subject: `Absence Notice: Period 1 (${currentFaculty.subjectCode})`,
          message: `Dear ${std.name},\n\nYou were recorded as absent during the mandatory First 10-Min biometric scan in ${currentClassroom.name}.\n\nIf you believe this is in error or you have approved On-Duty (OD) authorization, report to ${currentFaculty.name} immediately.\n\nTechVanta Automated Monitoring Engine.`,
          status: 'delivered',
          triggerReason: 'Student Absenteeism',
          relatedEntity: std.rollNo,
        });
      });

      if (newPackets.length > 0) {
        setNotifications((prev) => [...newPackets, ...prev]);
      }

      // Add log
      const newLog: SystemLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'scan',
        message: `First 10-Min Scan completed for ${currentClassroom.code}. ${newPackets.length} automated parent SMS & student emails dispatched.`,
        room: currentClassroom.code,
        badge: 'AUTOMATION COMPLETE',
      };
      setLogs((prev) => [newLog, ...prev]);

      showToast(
        'success',
        'First 10-Min Scan & Absentee SMS Complete',
        `Authenticated classroom roster. Dispatched ${newPackets.length} automated alerts to parents and students.`
      );
    }, 1200);
  };

  // 2. Simulate Class End Verification (Last 10 Mins)
  const handleSimulateEndScan = () => {
    if (isScanningEnd) return;
    setIsScanningEnd(true);

    showToast(
      'info',
      'Last 10-Min Departure Verification Running',
      `Performing departure facial sweep in ${currentClassroom.code} to ensure attendance retention and detect early bunking...`
    );

    setTimeout(() => {
      setIsScanningEnd(false);
      setSessionState((prev) => ({
        ...prev,
        endScanCompleted: true,
        endScanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retentionRate: 98.4,
      }));

      // Log departure verification
      const newLog: SystemLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'scan',
        message: `Last 10-Min Departure Verification completed for ${currentClassroom.code}. Session Retention Rate: 98.4%. Cryptographic audit locked.`,
        room: currentClassroom.code,
        badge: 'SESSION SEALED',
      };
      setLogs((prev) => [newLog, ...prev]);

      showToast(
        'success',
        'Last 10-Min Verification Finalized',
        `Departure verification complete: 98.4% student retention verified. Zero early unauthorized departures.`
      );
    }, 1200);
  };

  // 3. Simulate Faculty No-Show (First 10 Mins Alert to HOD)
  const handleSimulateFacultyNoShow = () => {
    setFacultyRoster((prev) =>
      prev.map((f) =>
        f.id === currentFaculty.id ? { ...f, status: 'no_show', checkInTime: null } : f
      )
    );

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create Priority SMS & Email for HOD
    const hodSms: NotificationPacket = {
      id: `notif-hod-sms-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      channel: 'SMS',
      recipientType: 'HOD',
      recipientName: currentFaculty.hodName,
      recipientContact: currentFaculty.hodPhone,
      subject: `CRITICAL FACULTY NO-SHOW ALERT: ${currentFaculty.subjectCode}`,
      message: `[URGENT] TechVanta Alert: Assigned Faculty ${currentFaculty.name} has NOT arrived for ${currentFaculty.subjectCode} in ${currentClassroom.code} within first 10 minutes (${currentTime}). 62 students currently unattended. Automated proxy/substitute faculty dispatch recommended.`,
      status: 'delivered',
      triggerReason: 'Faculty No-Show',
      relatedEntity: currentFaculty.name,
    };

    const hodEmail: NotificationPacket = {
      id: `notif-hod-email-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      channel: 'Email',
      recipientType: 'HOD',
      recipientName: currentFaculty.hodName,
      recipientContact: currentFaculty.hodEmail,
      subject: `PRIORITY NOTICE: Faculty Absence Flagged - ${currentFaculty.subjectCode} - Period 1`,
      message: `Dear HOD,\n\nTechVanta automated surveillance has recorded a critical faculty no-show:\n\nFaculty Member: ${currentFaculty.name}\nSubject: ${currentFaculty.subjectCode} (${currentFaculty.subjectName})\nRoom: ${currentClassroom.name} (${currentClassroom.code})\nTime Window: 09:00 AM - 09:10 AM (Expired)\n\nPodium camera CAM-01 confirms faculty has not scanned in. Please assign an emergency proctor or notify academic affairs.\n\nTechVanta Institutional Automation System.`,
      status: 'delivered',
      triggerReason: 'Faculty No-Show',
      relatedEntity: currentFaculty.name,
    };

    setNotifications((prev) => [hodSms, hodEmail, ...prev]);

    // Log incident
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'alert',
      message: `🚨 CRITICAL FACULTY NO-SHOW: ${currentFaculty.name} did not check in within first 10 mins. Automated SMS & Email dispatched to HOD (${currentFaculty.hodName}).`,
      room: currentClassroom.code,
      badge: 'HOD ALERT SENT',
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(
      'alert',
      '🚨 Faculty No-Show Alert Triggered!',
      `10-minute timer breached. Automated urgent SMS & Email dispatched directly to ${currentFaculty.hodName}.`
    );
  };

  // 4. Simulate Faculty Late Arrival / Check-In
  const handleSimulateFacultyCheckIn = () => {
    const checkTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setFacultyRoster((prev) =>
      prev.map((f) =>
        f.id === currentFaculty.id ? { ...f, status: 'checked_in', checkInTime: checkTime } : f
      )
    );

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'override',
      message: `Faculty ${currentFaculty.name} checked in at podium at ${checkTime}. Faculty status set to Nominal.`,
      room: currentClassroom.code,
      badge: 'FACULTY CHECKED IN',
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(
      'success',
      'Faculty Checked In',
      `${currentFaculty.name} verified at ${currentClassroom.code} podium camera.`
    );
  };

  // Start Live AI Scan on Camera Feed
  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);

    showToast(
      'info',
      'AI Neural Scan Initiated',
      'Scanning classroom seating array for 3D facial biometric signatures...'
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;

      setStudents((prev) =>
        prev.map((s) => {
          if (s.status === 'proxy') return s;
          return {
            ...s,
            confidence: Math.min(99.8, Math.max(96.0, s.confidence + (Math.random() * 0.8 - 0.4))),
          };
        })
      );

      if (progress >= 6) {
        clearInterval(interval);
        setIsScanning(false);

        const newLog: SystemLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'scan',
          message: 'Bulk AI Face Scan completed: 58/62 students authenticated with >97% confidence',
          room: currentClassroom.code,
          badge: 'BATCH VERIFIED',
        };
        setLogs((prev) => [newLog, ...prev]);

        showToast(
          'success',
          'AI Facial Attendance Completed',
          'Logged present students in active session with 98.4% mean confidence.'
        );
      }
    }, 700);
  };

  // Simulate Proxy Detection
  const handleSimulateProxy = () => {
    setAnomalyActive(true);

    setBoundingBoxes((prev) =>
      prev.map((b) =>
        b.studentId === 'std-4'
          ? { ...b, isFlagged: true, status: 'proxy', confidence: 42.1 }
          : b
      )
    );

    setStudents((prev) =>
      prev.map((s) =>
        s.id === 'std-4'
          ? {
              ...s,
              status: 'proxy',
              confidence: 42.1,
              spoofRisk: 'critical',
              anomalyReason: 'Biometric Spoof: 2D Screen Reflection & Infrared Depth Mismatch (Phone photo scan detected)',
            }
          : s
      )
    );

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'proxy',
      message: '🚨 CRITICAL SPOOF: 2D screen presentation detected for Rohan Verma (22CS089) at Seat D-14',
      studentRoll: '22CS089',
      room: currentClassroom.code,
      badge: 'PROXY DETECTED',
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(
      'alert',
      '🚨 Proxy Anomaly Detected!',
      'Suspicious 2D smartphone screen photo reflection detected at Seat D-14 (Roll #22CS089).'
    );
  };

  // Resolve Anomaly
  const handleResolveAnomaly = () => {
    setAnomalyActive(false);
    setBoundingBoxes((prev) =>
      prev.map((b) => (b.studentId === 'std-4' ? { ...b, isFlagged: false } : b))
    );
    showToast('info', 'Anomaly Dismissed', 'Audit trail updated. Camera filter returned to normal.');
  };

  // Dispatch Proctor
  const handleDispatchProctor = () => {
    showToast(
      'alert',
      'Proctor Dispatched to Seat D-14',
      'Assistant Proctor notified via radio. Proceeding to Advanced Networks Lab Row D.'
    );

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'override',
      message: 'Physical proctor dispatched to Seat D-14 following biometric spoof alarm',
      studentRoll: '22CS089',
      room: currentClassroom.code,
      badge: 'PROCTOR DISPATCHED',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Send Parent Alert for Anomaly
  const handleNotifyParentAnomaly = (studentName: string) => {
    showToast(
      'alert',
      `Urgent Proxy Alert Sent to Parent`,
      `WhatsApp & SMS alert dispatched to Mr. Arvind Verma (+91 99620 44321): 'Attendance Anomaly detected for ${studentName} in CSE-A Lab 3'.`
    );

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'alert',
      message: `Automated WhatsApp Proxy Notice sent to parent of ${studentName}`,
      studentRoll: '22CS089',
      room: currentClassroom.code,
      badge: 'PARENT NOTIFIED',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Student Selection for Action Drawer
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  // Send Parent Alert from Drawer / Table
  const handleSendParentAlert = (
    student: Student,
    channel: 'whatsapp' | 'email',
    customNote?: string
  ) => {
    const isPresent = student.status === 'present';
    const isProxy = student.status === 'proxy';

    const statusText = isPresent
      ? `marked Present at ${student.checkInTime || '09:00 AM'}`
      : isProxy
      ? `flagged for a biometric proxy anomaly at Seat ${student.seatLocation}`
      : `marked Absent today`;

    const noteText = customNote ? ` Note: "${customNote}"` : '';

    if (channel === 'whatsapp') {
      showToast(
        'success',
        `WhatsApp Dispatched to ${student.parentName}`,
        `Message sent to ${student.parentPhone}: 'Attendance Update: ${student.name} (${student.rollNo}) is ${statusText}.${noteText}'`
      );
    } else {
      showToast(
        'success',
        `Official Email Notice Sent`,
        `Formal notification dispatched to ${student.parentEmail} and ${student.studentEmail}.`
      );
    }

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'alert',
      message: `Parent notification (${channel.toUpperCase()}) dispatched for ${student.name} (${student.rollNo})`,
      studentRoll: student.rollNo,
      room: student.department,
      badge: `${channel.toUpperCase()} DISPATCHED`,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Quick Toggle Status in Drawer / Table
  const handleUpdateStudentStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: newStatus,
            checkInTime:
              newStatus === 'present' || newStatus === 'late'
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : null,
            confidence: newStatus === 'present' ? 98.4 : newStatus === 'proxy' ? 42.1 : 0,
            spoofRisk: newStatus === 'proxy' ? 'critical' : 'none',
          };
        }
        return s;
      })
    );

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              checkInTime:
                newStatus === 'present' || newStatus === 'late'
                  ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : null,
              confidence: newStatus === 'present' ? 98.4 : newStatus === 'proxy' ? 42.1 : 0,
            }
          : null
      );
    }

    showToast(
      'info',
      'Attendance Record Updated',
      `Student status manually set to ${newStatus.toUpperCase()}.`
    );
  };

  // Manual Override from Modal
  const handleApplyOverride = (
    studentId: string,
    newStatus: AttendanceStatus,
    reason: string,
    proctorName: string
  ) => {
    handleUpdateStudentStatus(studentId, newStatus);

    const student = students.find((s) => s.id === studentId);
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'override',
      message: `Administrative Override by ${proctorName}: ${student?.name} set to ${newStatus.toUpperCase()} (${reason})`,
      studentRoll: student?.rollNo,
      room: student?.department || currentClassroom.code,
      badge: 'MANUAL OVERRIDE',
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(
      'success',
      'Faculty Override Applied',
      `${student?.name} marked as ${newStatus.toUpperCase()} by ${proctorName}.`
    );
  };

  // Enroll New Student
  const handleEnrollStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system',
      message: `New Student Biometrics Enrolled: ${newStudent.name} (${newStudent.rollNo}) in ${newStudent.department}`,
      studentRoll: newStudent.rollNo,
      room: newStudent.department,
      badge: 'ENROLLMENT',
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(
      'success',
      'Student Biometrically Enrolled',
      `${newStudent.name} (${newStudent.rollNo}) successfully added to active classroom database.`
    );
  };

  // Export Report Functionality
  const handleTriggerExport = (format: 'csv' | 'pdf', range: string) => {
    setIsExporting(true);
    setExportProgress(15);

    const step1 = setTimeout(() => setExportProgress(45), 350);
    const step2 = setTimeout(() => setExportProgress(78), 700);
    const step3 = setTimeout(() => {
      setExportProgress(100);

      const headers = [
        'Roll No',
        'Student Name',
        'Department',
        'Today Status',
        'Check-In Time',
        'AI Confidence (%)',
        'Overall Attendance (%)',
        'Seat Location',
        'Parent Name',
        'Parent Phone',
      ];

      const rows = students.map((s) => [
        `"${s.rollNo}"`,
        `"${s.name}"`,
        `"${s.department}"`,
        `"${s.status.toUpperCase()}"`,
        `"${s.checkInTime || 'N/A'}"`,
        `"${s.confidence.toFixed(1)}"`,
        `"${s.overallAttendancePct.toFixed(1)}"`,
        `"${s.seatLocation}"`,
        `"${s.parentName}"`,
        `"${s.parentPhone}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `techvanta_${currentClassroom.code}_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportProgress(0);

      showToast(
        'success',
        'Report Exported Successfully',
        `Generated ${format.toUpperCase()} attendance register with biometric audit trail.`
      );
    }, 1100);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Derived KPI figures
  const totalStudentsCount = students.length;
  const presentCount = students.filter((s) => s.status === 'present').length;
  const attendanceRate = totalStudentsCount > 0 ? (presentCount / totalStudentsCount) * 100 : 0;
  const proxyCount = students.filter((s) => s.status === 'proxy').length;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Bar Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenOverrideModal={(tab = 'override') => {
          setOverrideModalTab(tab);
          setIsOverrideModalOpen(true);
        }}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isScanning={isScanning}
        anomalyActive={anomalyActive}
        onOpenNotificationsModal={() => setIsNotificationModalOpen(true)}
        alertsCount={notifications.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Brand Kicker / Hero Context Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900/60 to-slate-900/40 border border-red-900/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  TechVanta Automated Attendance & Monitoring Engine
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                  ENTERPRISE v3.4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated First 10m & Last 10m verification sweeps across all branches with instant SMS/Email triggers for student absentees and faculty no-show alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-400">Classroom:</span>{' '}
              <span className="font-bold text-white">{currentClassroom.code}</span>
            </div>
            <div className="hidden sm:block text-slate-600">|</div>
            <div className="hidden sm:block">
              <span className="text-slate-400">Faculty:</span>{' '}
              <span className={currentFaculty.status === 'no_show' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {currentFaculty.name}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Automated Start & End Session Monitoring Bar (First 10 Mins & Last 10 Mins + Faculty HOD Alert) */}
        <section aria-label="Session Monitoring Bar">
          <SessionMonitoringBar
            currentClassroom={currentClassroom}
            faculty={currentFaculty}
            sessionState={sessionState}
            onSimulateStartScan={handleSimulateStartScan}
            onSimulateEndScan={handleSimulateEndScan}
            onSimulateFacultyNoShow={handleSimulateFacultyNoShow}
            onSimulateFacultyCheckIn={handleSimulateFacultyCheckIn}
            onOpenNotificationsModal={() => setIsNotificationModalOpen(true)}
            isScanningStart={isScanningStart}
            isScanningEnd={isScanningEnd}
            totalStudentsCount={totalStudentsCount}
            presentCount={presentCount}
          />
        </section>

        {/* 2. Centralized Multi-Department Real-Time Command Grid */}
        <section aria-label="Centralized Multi-Department Overview">
          <DepartmentOverviewGrid
            allClassrooms={CLASSROOMS}
            currentClassroom={currentClassroom}
            onSelectClassroom={handleSelectClassroom}
            facultyRoster={facultyRoster}
            students={students}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
            totalAlertsCount={notifications.length}
          />
        </section>

        {/* 3. Live KPI Cards */}
        <section aria-label="Key Performance Indicators">
          <KpiCards
            totalStudents={totalStudentsCount}
            presentCount={presentCount}
            attendanceRate={attendanceRate}
            proxyCount={proxyCount}
            activeClassroomsCount={CLASSROOMS.length}
            totalClassroomsCount={CLASSROOMS.length}
            activeFilter={activeFilter}
            onSelectFilter={(filter) => {
              setActiveFilter(filter);
              const el = document.getElementById('roster-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* 4. Live AI Face Recognition Simulator Feed */}
        <section id="camera-simulator-section" aria-label="AI Face Recognition Camera Feed">
          <CameraSimulator
            currentClassroom={currentClassroom}
            allClassrooms={CLASSROOMS}
            onSelectClassroom={handleSelectClassroom}
            boundingBoxes={boundingBoxes}
            isScanning={isScanning}
            onStartScan={handleStartScan}
            onSimulateProxy={handleSimulateProxy}
            anomalyActive={anomalyActive}
            onResolveAnomaly={handleResolveAnomaly}
            onDispatchProctor={handleDispatchProctor}
            onNotifyParentAnomaly={handleNotifyParentAnomaly}
            students={students}
            onSelectStudent={handleSelectStudent}
          />
        </section>

        {/* 5. Enterprise Student Attendance Roster & Multi-Filter System */}
        <section id="roster-section" aria-label="Student Attendance Roster">
          <RosterTable
            students={students}
            allClassrooms={CLASSROOMS}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={(dept) => {
              setSelectedDepartment(dept);
              const matchedRoom = CLASSROOMS.find((c) => c.code === dept);
              if (matchedRoom) setCurrentClassroom(matchedRoom);
            }}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectStudent={handleSelectStudent}
            onQuickToggleStatus={handleUpdateStudentStatus}
            onSendParentAlert={(student, channel) =>
              handleSendParentAlert(student, channel)
            }
            facultyRoster={facultyRoster}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
          />
        </section>

        {/* 6. Interactive Analytics & Smart Report Builder (with Recharts Biometric Accuracy 30D Trend) */}
        <section id="analytics-section" aria-label="Analytics and Reports">
          <AnalyticsPanel
            logs={logs}
            heatmapDays={heatmapDays}
            students={students}
            onTriggerExport={handleTriggerExport}
            isExporting={isExporting}
            exportProgress={exportProgress}
            onCalibrationComplete={(msg) =>
              showToast('success', 'Optical Sensor Calibrated', msg)
            }
          />
        </section>
      </main>

      {/* Automated Multi-Channel Alert Logs Modal (SMS & Email Outbox) */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
      />

      {/* Automated Student Action Drawer (Slide-Over) */}
      <StudentActionDrawer
        student={selectedStudent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSendAlert={handleSendParentAlert}
        onUpdateStatus={handleUpdateStudentStatus}
      />

      {/* Manual Override & Add Student Modal */}
      <ManualOverrideModal
        isOpen={isOverrideModalOpen}
        initialTab={overrideModalTab}
        onClose={() => setIsOverrideModalOpen(false)}
        students={students}
        allClassrooms={CLASSROOMS}
        onApplyOverride={handleApplyOverride}
        onEnrollStudent={handleEnrollStudent}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TechVanta</span>
            <span>·</span>
            <span>Enterprise Automated Attendance & Classroom Monitoring</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Automated SMS/Email Gateway Connected · ISO/IEC 30107-3 Liveness Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
