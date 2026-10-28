import React, { useState, useEffect } from 'react';
import {
  Scan,
  AlertTriangle,
  Eye,
  Camera,
  Maximize2,
  Minimize2,
  Zap,
  CheckCircle,
  Bell,
  RefreshCw,
  Flame,
  UserCheck
} from 'lucide-react';
import { Classroom, BoundingBoxTarget, Student } from '../types/attendance';

interface CameraSimulatorProps {
  currentClassroom: Classroom;
  allClassrooms: Classroom[];
  onSelectClassroom: (classroom: Classroom) => void;
  boundingBoxes: BoundingBoxTarget[];
  isScanning: boolean;
  onStartScan: () => void;
  onSimulateProxy: () => void;
  anomalyActive: boolean;
  onResolveAnomaly: () => void;
  onDispatchProctor: () => void;
  onNotifyParentAnomaly: (studentName: string) => void;
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const CameraSimulator: React.FC<CameraSimulatorProps> = ({
  currentClassroom,
  allClassrooms,
  onSelectClassroom,
  boundingBoxes,
  isScanning,
  onStartScan,
  onSimulateProxy,
  anomalyActive,
  onResolveAnomaly,
  onDispatchProctor,
  onNotifyParentAnomaly,
  students,
  onSelectStudent,
}) => {
  const [showHud, setShowHud] = useState(true);
  const [thermalMode, setThermalMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);

  // Live real-time clock for CCTV timestamp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 8)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sequential lock-on animation during scan
  useEffect(() => {
    if (isScanning) {
      let idx = 0;
      const interval = setInterval(() => {
        setActiveBoxIndex(idx % boundingBoxes.length);
        idx++;
      }, 450);
      return () => {
        clearInterval(interval);
        setActiveBoxIndex(null);
      };
    } else {
      setActiveBoxIndex(null);
    }
  }, [isScanning, boundingBoxes.length]);

  const flaggedBox = boundingBoxes.find((b) => b.isFlagged);

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Camera Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-4.5"></span>
            <span className="text-xs font-bold tracking-wider text-red-500 font-mono">REC</span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          {/* Camera switcher buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {allClassrooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectClassroom(room)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  currentClassroom.id === room.id
                    ? 'bg-red-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {room.code}
              </button>
            ))}
          </div>

          <span className="hidden xl:inline-block text-xs text-slate-400 font-mono">
            {currentClassroom.cameraName}
          </span>
        </div>

        {/* Action buttons: Start Scan & Simulate Proxy */}
        <div className="flex items-center gap-2">
          {/* Start AI Scan Button */}
          <button
            onClick={onStartScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isScanning
                ? 'bg-red-950/80 text-red-300 border border-red-700/60 cursor-wait'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Faces...</span>
              </>
            ) : (
              <>
                <Scan className="w-3.5 h-3.5" />
                <span>Start Live AI Scan</span>
              </>
            )}
          </button>

          {/* Simulate Proxy Detection Button */}
          <button
            onClick={onSimulateProxy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/60 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Proxy Alert</span>
          </button>

          {/* Thermal / IR Depth View Toggle */}
          <button
            onClick={() => setThermalMode(!thermalMode)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              thermalMode
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle IR Depth / Liveness view"
            aria-label="Toggle IR Liveness view"
          >
            <Flame className="w-4 h-4" />
          </button>

          {/* HUD Bounding Box Toggle */}
          <button
            onClick={() => setShowHud(!showHud)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showHud
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Bounding Box HUD"
            aria-label="Toggle Bounding Box HUD"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Fullscreen Expand */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
            title="Expand view"
            aria-label="Expand view"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main CCTV Camera Viewport */}
      <div
        className={`relative w-full overflow-hidden bg-black select-none ${
          isFullscreen ? 'h-[75vh]' : 'h-[360px] sm:h-[440px] md:h-[500px]'
        }`}
      >
        {/* Classroom Feed Image */}
        <img
          src={currentClassroom.cctvImage}
          alt={`Live CCTV Classroom feed of ${currentClassroom.name}`}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-300 ${
            thermalMode
              ? 'filter invert hue-rotate-180 contrast-125 saturate-200'
              : 'brightness-95 contrast-105'
          }`}
        />

        {/* Subtle CCTV lens barrel & vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_center,_transparent_50%,_rgba(0,0,0,0.6)_100%]"></div>

        {/* Laser Sweep Scanner Line during AI scan */}
        {isScanning && (
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] animate-scanline pointer-events-none z-20">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-red-950/90 border border-red-500/80 text-[10px] font-mono text-red-200 font-bold tracking-widest uppercase">
              DEEPFACE NEURAL SCANNING · 30 FPS
            </div>
          </div>
        )}

        {/* Top CCTV Telemetry HUD */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none text-xs font-mono text-slate-200 z-10">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-white">{currentClassroom.code} · {currentClassroom.activeFeedName}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              BITRATE: 4.8 Mbps · CODEC: H.265/HEVC · LATENCY: 12ms
            </div>
          </div>

          <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-right space-y-0.5">
            <div className="font-semibold text-white tabular-nums">{currentTime}</div>
            <div className="text-[11px] text-emerald-400">
              OPTICAL LIVENESS: {thermalMode ? 'IR THERMAL' : 'RGB-D 3D'} ACTIVE
            </div>
          </div>
        </div>

        {/* Bottom CCTV Status Strip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs font-mono text-slate-200 z-10">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3">
            <span className="text-slate-400">SECTOR:</span>
            <span className="text-white font-semibold">DESKS A1–D16</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">DETECTED:</span>
            <span className="text-emerald-400 font-semibold">{boundingBoxes.length} FACES</span>
          </div>

          <div className="hidden sm:flex bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">NEURAL ACCEL: TENSOR-RT ENGINE</span>
          </div>
        </div>

        {/* Dynamic Bounding Boxes */}
        {showHud &&
          boundingBoxes.map((box, index) => {
            const isProxy = box.isFlagged || box.status === 'proxy';
            const isActiveScan = activeBoxIndex === index;
            const student = students.find((s) => s.id === box.studentId);

            return (
              <div
                key={box.id}
                onClick={() => {
                  if (student) onSelectStudent(student);
                }}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className={`absolute transition-all duration-300 cursor-pointer group z-20 ${
                  isProxy
                    ? 'border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                    : isActiveScan
                    ? 'border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-105'
                    : 'border-2 border-emerald-400/90 shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:border-white hover:scale-105'
                }`}
              >
                {/* HUD Corner Brackets */}
                <div
                  className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${
                    isProxy ? 'border-red-400' : 'border-emerald-300'
                  }`}
                />
                <div
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${
                    isProxy ? 'border-red-400' : 'border-emerald-300'
                  }`}
                />
                <div
                  className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${
                    isProxy ? 'border-red-400' : 'border-emerald-300'
                  }`}
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${
                    isProxy ? 'border-red-400' : 'border-emerald-300'
                  }`}
                />

                {/* Floating Tag over Bounding Box */}
                <div
                  className={`absolute -top-7 left-0 right-0 flex items-center justify-between px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all shadow-md ${
                    isProxy
                      ? 'bg-red-600 text-white font-bold'
                      : isActiveScan
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-black/80 text-emerald-300 border border-emerald-500/40 group-hover:bg-slate-900 group-hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[80px] font-sans font-semibold">
                    {box.studentName.split(' ')[0]}
                  </span>
                  <span className="tabular-nums font-bold">
                    {isProxy ? '42.1%' : isActiveScan ? '98.9%' : `${box.confidence.toFixed(1)}%`}
                  </span>
                </div>

                {/* Bottom Status Indicator */}
                <div
                  className={`absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded text-[9px] font-mono tracking-tight uppercase whitespace-nowrap ${
                    isProxy
                      ? 'bg-red-950/90 text-red-300 border border-red-600'
                      : 'bg-slate-950/80 text-emerald-400 border border-emerald-600/40'
                  }`}
                >
                  {isProxy ? 'PROXY ANOMALY' : box.status}
                </div>

                {/* Center Reticle on Hover / Scan */}
                {(isActiveScan || isProxy) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className={`w-4 h-4 border border-dashed rounded-full ${
                        isProxy ? 'border-red-400 animate-spin' : 'border-amber-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Visual Anomaly Alert Banner (Prominent Banner when anomaly is detected) */}
      {anomalyActive && (
        <div className="p-4 bg-gradient-to-r from-red-950/90 via-red-900/80 to-slate-950 border-t border-red-700/80 animate-in slide-in-from-top-2">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/50 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    CRITICAL PROXY ALERT: 2D Screen Biometric Spoofing Detected
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500 text-white font-bold uppercase">
                    SEAT D-14
                  </span>
                </div>
                <p className="mt-1 text-xs text-red-200/90 max-w-2xl leading-relaxed">
                  Facial Match confidence dropped to <span className="font-mono font-bold text-white">42.1%</span> for student{' '}
                  <span className="font-semibold text-white">Rohan Verma (Roll #22CS089)</span>. Liveness depth sensor flagged flat 2D reflection with infrared reflectance mismatch (smartphone screen presentation detected).
                </p>
              </div>
            </div>

            {/* Banner Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={onDispatchProctor}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Dispatch Proctor</span>
              </button>

              <button
                onClick={() => onNotifyParentAnomaly('Rohan Verma')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span>Send Dean & Parent Alert</span>
              </button>

              <button
                onClick={onResolveAnomaly}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer hover:bg-white/5"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
