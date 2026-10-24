/**
 * pages/admin/AnalyticsReports.tsx
 * Comprehensive Dataset Analytics & Cohort Statistical Breakdown.
 * Distinctly separates baseline UCI dataset analysis from platform user metrics.
 */

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Download,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

export const AnalyticsReports: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      setAnalytics(res);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await api.exportStudentsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aether_cohort_analytics_${new Date().toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <CardSkeleton rows={6} />;
  }

  const gradeDist = analytics?.grade_distribution || [];
  const studyData = analytics?.study_time_breakdown || [];
  const corrData = analytics?.correlations_with_grade || [];
  const absenceData = analytics?.absence_scatter_sample || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <LineChart size={14} className="text-purple-400" />
            Empirical Population Distributions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cohort Analytics & Dataset Visualizations
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            In-depth statistical breakdown of the real 395-student Portuguese mathematics cohort. 
            All insights derive directly from ground-truth baseline observations.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all disabled:opacity-50"
        >
          <Download size={14} /> Export Dataset Summary (CSV)
        </button>
      </div>

      {/* ── Distinct Labeling Banner ── */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-purple-400" />
          <b>Provenance Notice:</b> Data below represents the <b>UCI Student Performance Dataset (395 records)</b>, 
          strictly separated from dynamic platform registered users.
        </span>
        <button onClick={loadAnalytics} className="text-purple-400 hover:text-white flex items-center gap-1">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Visualizations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Grade Distribution */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Final Mathematics Grade Distribution (G3)</h3>
              <p className="text-xs text-slate-400">Total student counts across 0 to 20 grade mark scale</p>
            </div>
            <BarChart3 size={18} className="text-purple-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDist} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="grade" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400">
            Note the zero-grade spike (38 students) representing students who dropped the course or missed the final examination.
          </p>
        </div>

        {/* Chart 2: Study Time Breakdown */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Study Time Allocation vs Mean Grade</h3>
              <p className="text-xs text-slate-400">Comparison of average grade achievement across brackets</p>
            </div>
            <Clock size={18} className="text-indigo-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bracket" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 20]} stroke="#64748b" fontSize={11} ticks={[0, 5, 10, 15, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="mean_grade" name="Mean Grade" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="median_grade" name="Median Grade" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400">
            Median grade rises consistently from 10.0 to 12.0 points as weekly study increases to 5+ hours.
          </p>
        </div>

        {/* Chart 3: Absences vs Final Grade Scatter */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">School Absences vs Final Grade (G3)</h3>
              <p className="text-xs text-slate-400">Scatter sample showing chronic absenteeism risk</p>
            </div>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="absences" name="Absences" stroke="#64748b" fontSize={11} />
                <YAxis type="number" dataKey="G3" name="Final Grade" domain={[0, 20]} stroke="#64748b" fontSize={11} />
                <ZAxis type="number" dataKey="failures" range={[40, 160]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Scatter name="Students" data={absenceData} fill="#f43f5e" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400">
            Bubble size reflects past class failures. Students with multiple failures and elevated absences cluster in low grade bands.
          </p>
        </div>

        {/* Chart 4: Correlation Matrix List */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Pearson Correlations with Target Grade (G3)</h3>
              <p className="text-xs text-slate-400">Ground-truth linear correlation coefficient rankings</p>
            </div>
            <span className="text-xs text-purple-300 font-bold">Pearson r</span>
          </div>

          <div className="space-y-3 pt-2">
            {corrData.map((c: any, i: number) => {
              const isPos = c.correlation >= 0;
              const absVal = Math.abs(c.correlation);
              return (
                <div key={i} className="text-xs">
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300 font-mono">{c.feature}</span>
                    <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                      {c.correlation > 0 ? `+${c.correlation.toFixed(3)}` : c.correlation.toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, absVal * 260)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
