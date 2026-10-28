export type AttendanceStatus = 'present' | 'absent' | 'proxy' | 'late';

export interface AttendanceHistoryItem {
  date: string;
  day: string;
  status: AttendanceStatus;
  checkInTime?: string;
  camera?: string;
  confidence?: number;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  section: string;
  avatar: string;
  status: AttendanceStatus;
  confidence: number;
  overallAttendancePct: number;
  seatLocation: string;
  checkInTime: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentEmail: string;
  spoofRisk: 'none' | 'low' | 'suspicious' | 'critical';
  history: AttendanceHistoryItem[];
  anomalyReason?: string;
}

export interface BoundingBoxTarget {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  x: number; // percentage
  y: number; // percentage
  width: number;
  height: number;
  status: AttendanceStatus;
  confidence: number;
  isFlagged?: boolean;
  spoofType?: string;
}

export interface Classroom {
  id: string;
  code: string;
  name: string;
  department: string;
  section: string;
  cameraName: string;
  totalSeats: number;
  activeFeedName: string;
  cctvImage: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'scan' | 'proxy' | 'override' | 'alert' | 'system';
  message: string;
  studentRoll?: string;
  room: string;
  badge: string;
}

export interface HeatmapDay {
  date: string;
  dayNumber: number;
  dayOfWeek: string;
  rate: number;
  presentCount: number;
  totalCount: number;
  proxies: number;
  isToday?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'alert' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

export interface BiometricAccuracyPoint {
  date: string;
  dayNumber: number;
  fullDate: string;
  avgConfidence: number;
  minConfidence: number;
  maxConfidence: number;
  calibrationBaseline: number;
  calibrationDrift: number;
  anomalyDetected: boolean;
  camera: string;
  calibrationNote?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  avatar: string;
  department: string;
  subjectCode: string;
  subjectName: string;
  scheduledStartTime: string;
  roomCode: string;
  status: 'checked_in' | 'pending' | 'no_show';
  checkInTime: string | null;
  hodName: string;
  hodPhone: string;
  hodEmail: string;
}

export interface NotificationPacket {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'Email';
  recipientType: 'Parent' | 'Student' | 'HOD';
  recipientName: string;
  recipientContact: string;
  subject: string;
  message: string;
  status: 'delivered' | 'sending' | 'failed';
  triggerReason: 'Student Absenteeism' | 'Faculty No-Show' | 'Proxy Anomaly' | 'Early Departure' | 'Manual';
  relatedEntity: string;
}

export interface SessionMonitoringState {
  sessionStart: string;
  sessionEnd: string;
  phase: 'first_10_mins' | 'in_progress' | 'last_10_mins' | 'completed';
  startScanCompleted: boolean;
  endScanCompleted: boolean;
  startScanTime: string | null;
  endScanTime: string | null;
  earlyDeparturesCount: number;
  retentionRate: number;
}
