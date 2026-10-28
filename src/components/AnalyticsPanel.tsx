import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart2,
  TrendingUp,
  Brain,
  Filter,
  RefreshCw,
  X,
  Activity,
  Sliders,
  Wrench,
  Camera,
  Cpu,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { SystemLog, HeatmapDay, Student, BiometricAccuracyPoint } from '../types/attendance';
import { BIOMETRIC_ACCURACY_30D } from '../data/mockData';

interface AnalyticsPanelProps {
  logs: SystemLog[];
  heatmapDays: HeatmapDay[];
  students: Student[];
  accuracyData?: BiometricAccuracyPoint[];
  onTriggerExport: (format: 'csv' | 'pdf', range: string) => void;
  isExporting: boolean;
  exportProgress: number;
  onCalibrationComplete?: (message: string) => void;
}

// Custom Glassmorphic Tooltip for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomAccuracyTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: BiometricAccuracyPoint = payload[0].payload;
    const isAnomaly = data.anomalyDetected || data.avgConfidence < data.calibrationBaseline;

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2 z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-white font-mono">{data.fullDate}</span>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
              isAnomaly
                ? 'bg-red-950 text-red-300 border border-red-700'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {isAnomaly ? 'CALIBRATION DRIFT' : 'NOMINAL'}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mean Confidence:</span>
            <span className={`font-bold text-sm ${isAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
              {data.avgConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Range (Min–Max):</span>
            <span className="text-slate-300">
              {data.minConfidence.toFixed(1)}% – {data.maxConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Threshold Baseline:</span>
            <span className="text-slate-300">{data.calibrationBaseline.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Sensor Drift:</span>
            <span className={data.calibrationDrift < 0 ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
              {data.calibrationDrift > 0 ? `+${data.calibrationDrift.toFixed(2)}%` : `${data.calibrationDrift.toFixed(2)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Camera Node:</span>
            <span className="text-slate-200">{data.camera}</span>
          </div>
        </div>

        {data.calibrationNote && (
          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-300 leading-snug">
            <span className="font-semibold text-red-400">Diag: </span>
            {data.calibrationNote}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  logs,
  heatmapDays,
  students,
  accuracyData = BIOMETRIC_ACCURACY_30D,
  onTriggerExport,
  isExporting,
  exportProgress,
  onCalibrationComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'heatmap' | 'accuracy' | 'insights'>('accuracy');
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(heatmapDays[26]); // Oct 27 (Today)
  const [logFilter, setLogFilter] = useState<'all' | 'proxy' | 'scan' | 'system'>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportRange, setExportRange] = useState<'today' | 'week' | 'month'>('today');

  // Accuracy View Controls
  const [selectedCamera, setSelectedCamera] = useState<string>('ALL');
  const [showRangeArea, setShowRangeArea] = useState<boolean>(true);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [recalibrationNotice, setRecalibrationNotice] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  const lowAttendanceStudents = students.filter((s) => s.overallAttendancePct < 75);

  // Filter accuracy data based on selected camera if needed
  const chartData = accuracyData;

  // 30-Day Accuracy Stats calculations
  const avg30D = (
    chartData.reduce((acc, p) => acc + p.avgConfidence, 0) / chartData.length
  ).toFixed(1);
  const minConfidenceRecorded = Math.min(...chartData.map((p) => p.minConfidence)).toFixed(1);
  const anomaliesCount = chartData.filter((p) => p.anomalyDetected).length;

  const handleStartExport = () => {
    onTriggerExport(exportFormat, exportRange);
    setShowExportModal(false);
  };

  // Run Hardware Auto-Calibration Routine
  const handleRunCalibration = () => {
    setIsCalibrating(true);
    setRecalibrationNotice('Executing multi-point optical zero-point realignment and CMOS shutter desync sweep...');

    setTimeout(() => {
      setIsCalibrating(false);
      setRecalibrationNotice(
        'Calibration Routine Completed: Optical sensor exposure baseline synchronized to 98.9% with 0.00% zero-drift.'
      );
      if (onCalibrationComplete) {
        onCalibrationComplete('Optical Sensor CAM-01 auto-calibrated successfully.');
      }
    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header with Tabs & Export Button */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Working Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('accuracy')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'accuracy'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-red-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-red-500" />
            <span>Biometric Accuracy (30D)</span>
            {anomaliesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'daily'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Daily Log ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'heatmap'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Monthly Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'insights'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Insights & Risk</span>
          </button>
        </div>

        {/* Functional Export Report Button */}
        <button
          onClick={() => setShowExportModal(true)}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-xl shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
              <span>Generating ({exportProgress}%)...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-red-400" />
              <span>Export Report (PDF/Excel)</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar during Export */}
      {isExporting && (
        <div className="w-full bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-3">
          <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-200 shadow-sm shadow-red-500"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-semibold text-red-400 tabular-nums">
            {exportProgress}% Packaging records...
          </span>
        </div>
      )}

      {/* Tab: Biometric Accuracy (Recharts 30-Day Trend & Calibration Diagnostic) */}
      {activeTab === 'accuracy' && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top KPI Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-xs">30-Day Mean Confidence</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">{avg30D}%</span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">+3.3% vs base</span>
              </div>
              <span className="text-[10px] text-slate-500">Benchmark: 95.0% min</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-xs">Lowest Confidence Dip</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-red-400">
                  {minConfidenceRecorded}%
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  OCT 14
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Fluorescent flicker desync</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-xs">Hardware Drift Index</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  0.01%
                </span>
                <span className="text-[11px] font-mono text-slate-400">σ = 0.14</span>
              </div>
              <span className="text-[10px] text-slate-500">Zero-drift status: Nominal</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-xs">Calibration State</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-bold text-emerald-400">Calibrated & Locked</span>
              </div>
              <span className="text-[10px] text-slate-500">Sensor focal plane: Auto-synced</span>
            </div>
          </div>

          {/* Interactive Chart Controls & Calibration Anomaly Callout */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 font-medium">Camera Sensor:</span>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="ALL">CAM-01 (Advanced Networks Lab - West)</option>
                  <option value="CAM-02">CAM-02 (Cloud Computing Center)</option>
                  <option value="CAM-03">CAM-03 (Signal Processing Lab)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRangeArea(!showRangeArea)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    showRangeArea
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {showRangeArea ? '✓ Min-Max Spread Area' : '○ Line Only'}
                </button>
              </div>
            </div>

            {/* Run Auto-Calibration Button */}
            <button
              onClick={handleRunCalibration}
              disabled={isCalibrating}
              className="flex items-center gap-2 px-3.5 py-1.5 font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isCalibrating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Calibrating Sensors...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Run Hardware Re-Calibration</span>
                </>
              )}
            </button>
          </div>

          {/* Recalibration Notice Banner if triggered */}
          {recalibrationNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{recalibrationNotice}</span>
              </div>
              <button
                onClick={() => setRecalibrationNotice(null)}
                className="text-emerald-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Anomaly Detection Highlight Banner */}
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/60 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-200">
                Identified Optical Calibration Incident (Oct 13 – Oct 15):
              </span>
              <p className="text-red-300/90 mt-0.5 leading-relaxed">
                CMOS exposure desync & 120Hz overhead lighting harmonic flicker caused a temporary 4.8% confidence dip below the 95.0% threshold. The issue was traced to lens barrel smudging and IR emitter degradation. Restored to 98.8% via auto-recalibration routine on Oct 16.
              </p>
            </div>
          </div>

          {/* Recharts 30-Day Trend Chart */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h5 className="text-sm font-semibold text-white">
                  Daily Biometric Recognition Confidence & Hardware Calibration Trend (Past 30 Days)
                </h5>
                <p className="text-xs text-slate-400">
                  Continuous 3D face verification telemetry mapped against the 95.0% calibration tolerance boundary.
                </p>
              </div>

              {/* Chart Legend Badges */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-red-500 rounded-full" />
                  <span className="text-slate-300">Mean Confidence (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 border-dashed" />
                  <span className="text-slate-400">Min Confidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-red-400 border-dashed" />
                  <span className="text-red-400">95.0% Threshold</span>
                </div>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 15, right: 15, bottom: 5, left: -10 }}
                >
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    opacity={0.35}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    interval={2}
                  />

                  <YAxis
                    domain={[86, 100]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(v) => `${v}%`}
                  />

                  <Tooltip content={<CustomAccuracyTooltip />} />

                  {/* Calibration Anomaly Shaded Band (Oct 13 to Oct 15) */}
                  <ReferenceArea
                    x1="Oct 13"
                    x2="Oct 15"
                    fill="#ef4444"
                    fillOpacity={0.15}
                    stroke="#ef4444"
                    strokeOpacity={0.4}
                    strokeDasharray="3 3"
                  />

                  {/* 95.0% Hardware Calibration Warning Threshold */}
                  <ReferenceLine
                    y={95.0}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Warning Baseline (95.0%)',
                      fill: '#f87171',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />

                  {/* 98.0% Optimal AI Verification Target */}
                  <ReferenceLine
                    y={98.0}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: 'Optimal Target (98.0%)',
                      fill: '#34d399',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />

                  {/* Optional Min-Max Range Fill */}
                  {showRangeArea && (
                    <Area
                      type="monotone"
                      dataKey="minConfidence"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      fill="url(#spreadGradient)"
                      name="Min Confidence Spread"
                    />
                  )}

                  {/* Primary Average Confidence Line */}
                  <Area
                    type="monotone"
                    dataKey="avgConfidence"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    fill="url(#accuracyGradient)"
                    dot={{ r: 2.5, fill: '#dc2626', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
                    name="Mean Confidence"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hardware Sub-System Calibration Matrix */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-red-500" />
              <span>Camera Optical Sub-System Calibration Health</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400">Lens Element Vignetting</span>
                <div className="text-base font-bold font-mono text-emerald-400">0.04 EV</div>
                <p className="text-[10px] text-slate-500">Normal range &lt;0.15 EV (Clean)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400">IR Illuminator (850nm)</span>
                <div className="text-base font-bold font-mono text-emerald-400">99.8% Power</div>
                <p className="text-[10px] text-slate-500">12/12 LED banks fully calibrated</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400">Rolling Shutter Skew</span>
                <div className="text-base font-bold font-mono text-emerald-400">1.2ms</div>
                <p className="text-[10px] text-slate-500">Phase-locked with 60Hz room lighting</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400">Sensor Thermal Operating Temp</span>
                <div className="text-base font-bold font-mono text-white">34.8°C</div>
                <p className="text-[10px] text-slate-500">Thermal drift limit: &lt;55.0°C</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Daily Log */}
      {activeTab === 'daily' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              Chronological Audit Trail · Live Events
            </span>

            {/* Quick Log Filter Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  logFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLogFilter('proxy')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  logFilter === 'proxy' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-slate-400 hover:text-red-400'
                }`}
              >
                Proxy Only
              </button>
              <button
                onClick={() => setLogFilter('scan')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  logFilter === 'scan' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Scans
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const isProxy = log.type === 'proxy';
              const isScan = log.type === 'scan';
              const isOverride = log.type === 'override';

              return (
                <div
                  key={log.id}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs transition-colors ${
                    isProxy
                      ? 'bg-red-950/30 border-red-800/80 text-red-100'
                      : isOverride
                      ? 'bg-amber-950/20 border-amber-800/60 text-amber-100'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isProxy && <ShieldAlert className="w-4 h-4 text-red-400" />}
                      {isScan && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isOverride && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {!isProxy && !isScan && !isOverride && <Clock className="w-4 h-4 text-slate-400" />}
                    </div>

                    <div>
                      <p className="font-medium leading-relaxed">{log.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        <span>Room: {log.room}</span>
                        {log.studentRoll && (
                          <>
                            <span>·</span>
                            <span>Roll: {log.studentRoll}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {log.timestamp}
                    </span>
                    <div className="mt-0.5">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          isProxy
                            ? 'bg-red-600 text-white'
                            : isScan
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.badge}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="p-4 sm:p-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-white">October 2026 Attendance Heatmap</h4>
              <p className="text-xs text-slate-400">Click any day to view session analytics.</p>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-800" title="&lt;80% / Off" />
                <span className="w-3 h-3 rounded bg-amber-600/70" title="80-89%" />
                <span className="w-3 h-3 rounded bg-emerald-600/70" title="90-94%" />
                <span className="w-3 h-3 rounded bg-emerald-500" title="&ge;95%" />
              </div>
              <span>More (95%+)</span>
            </div>
          </div>

          {/* 31-Day Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-[11px] font-mono text-slate-500 pb-1">
                {day}
              </div>
            ))}

            {heatmapDays.map((day) => {
              const isSelected = selectedDay?.date === day.date;
              const hasPassed = day.rate > 0;
              const isHigh = day.rate >= 95;
              const isGood = day.rate >= 90 && day.rate < 95;
              const isModerate = day.rate > 0 && day.rate < 90;

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  className={`relative p-2 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-red-500 border-red-500 bg-slate-800'
                      : 'hover:border-slate-600 hover:scale-[1.02]'
                  } ${
                    !hasPassed
                      ? 'bg-slate-950/40 border-slate-800/40 opacity-40'
                      : isHigh
                      ? 'bg-emerald-950/60 border-emerald-800/80'
                      : isGood
                      ? 'bg-emerald-950/40 border-emerald-900/60'
                      : isModerate
                      ? 'bg-amber-950/40 border-amber-800/60'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {day.dayNumber}
                    </span>
                    {day.isToday && (
                      <span className="text-[9px] font-bold px-1 rounded bg-red-600 text-white font-mono">
                        NOW
                      </span>
                    )}
                  </div>

                  <div className="mt-1">
                    <span className="text-[11px] font-mono tabular-nums font-bold text-slate-100">
                      {hasPassed ? `${day.rate.toFixed(1)}%` : '—'}
                    </span>
                  </div>

                  {day.proxies > 0 && (
                    <div className="mt-0.5">
                      <span className="text-[9px] font-mono text-red-400 font-semibold">
                        {day.proxies} proxy
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Details Card */}
          {selectedDay && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-slate-400">Detailed Day Snapshot</span>
                <h5 className="text-sm font-bold text-white mt-0.5">
                  {selectedDay.dayOfWeek}, {selectedDay.date} {selectedDay.isToday && '(Today)'}
                </h5>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-400">Attendance:</span>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {selectedDay.rate > 0 ? `${selectedDay.rate.toFixed(1)}%` : 'Pending'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Present Count:</span>
                  <p className="font-mono font-bold text-white text-sm">
                    {selectedDay.presentCount} / {selectedDay.totalCount}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Biometric Anomalies:</span>
                  <p className="font-mono font-bold text-red-400 text-sm">
                    {selectedDay.proxies} flagged
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: AI Insights & Anomaly Predictions */}
      {activeTab === 'insights' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Insight Card 1 */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Attendance Threshold Risk</span>
              </div>
              <h5 className="text-xl font-bold font-mono tabular-nums text-white">
                {lowAttendanceStudents.length} Students
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lowAttendanceStudents.map((s) => s.name).join(', ')} are currently below the university mandatory 75% attendance criterion.
              </p>
            </div>

            {/* Insight Card 2 */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>Proxy Hotspot Zone</span>
              </div>
              <h5 className="text-xl font-bold font-mono text-white">Row D (Back Left)</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                78% of biometric anomalies and screen spoofs originate in Row D Seats 12–16 due to partial ceiling camera occlusion.
              </p>
            </div>

            {/* Insight Card 3 */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <Brain className="w-4 h-4" />
                <span>Model Confidence Score</span>
              </div>
              <h5 className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                98.7% Avg Match
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                DeepFace neural model verified 58 student facial landmarks with average latency of 14ms and zero false negatives.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <div>
                <span className="text-xs font-semibold text-white">
                  Automated Faculty Recommendation:
                </span>
                <p className="text-xs text-slate-400">
                  Switch CAM-01 secondary lens angle by 12° to reduce blind spot at Row D. Automated WhatsApp warnings queued for parents of students below 75%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Configuration Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowExportModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white">Smart Attendance Report Builder</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Choose Export Format:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    exportFormat === 'csv'
                      ? 'border-red-500 bg-red-950/30 text-white'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-1" />
                  <p className="text-xs font-bold">Excel (.csv)</p>
                  <p className="text-[11px] text-slate-400">Complete raw student matrix</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('pdf')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    exportFormat === 'pdf'
                      ? 'border-red-500 bg-red-950/30 text-white'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-5 h-5 text-red-400 mb-1" />
                  <p className="text-xs font-bold">PDF Executive Audit</p>
                  <p className="text-[11px] text-slate-400">Dean & HOD signing sheet</p>
                </button>
              </div>
            </div>

            {/* Date range selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Reporting Time Horizon:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['today', 'week', 'month'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setExportRange(range)}
                    className={`py-2 text-xs font-medium rounded-lg border capitalize transition-colors ${
                      exportRange === range
                        ? 'border-red-500 bg-red-600 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range === 'today' ? 'Today' : range === 'week' ? 'Past 7 Days' : 'Full Month'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExport}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Generate & Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
