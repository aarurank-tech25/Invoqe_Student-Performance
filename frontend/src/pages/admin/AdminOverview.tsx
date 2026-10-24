/**
 * pages/admin/AdminOverview.tsx
 * Administrative Governance Dashboard featuring platform-wide KPIs,
 * real UCI benchmark statistics, champion model evaluation, and performance segment breakdown.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Sparkles,
  BarChart3,
  Binary,
  ShieldCheck,
  TrendingUp,
  Download,
  AlertTriangle,
  RefreshCw,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminOverviewStats } from '../../types';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminOverview();
      setStats(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin overview metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <CardSkeleton rows={6} />;
  }

  if (error || !stats) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-red-400 text-sm mb-4">{error || 'Unable to retrieve administrative metrics'}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-purple-600 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  // Segments pie chart data
  const segmentData = Object.entries(stats.performance_segments || {}).map(([name, val]) => ({
    name,
    value: val,
  }));
  const COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-purple-400" />
            Institutional Governance & Model Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrative Intelligence Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Real-time monitoring of registered student cohorts, automated inference volume, 
            and held-out test benchmarks for production ML models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/students"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            Manage Students Directory
          </Link>
        </div>
      </div>

      {/* ── 4 Top KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3 text-xs font-bold uppercase">
            <span>Registered Students</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total_students}</div>
          <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
            {stats.active_students_count} active accounts on platform
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3 text-xs font-bold uppercase">
            <span>Inference Predictions</span>
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total_predictions}</div>
          <div className="mt-2 text-[11px] text-purple-300 font-semibold">
            Zero interim grade leakage
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3 text-xs font-bold uppercase">
            <span>Average Forecast</span>
            <TrendingUp size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.average_predicted_grade > 0 ? `${stats.average_predicted_grade} / 20` : '—'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across all platform student runs
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center justify-between text-purple-300 mb-3 text-xs font-bold uppercase">
            <span>Champion Model</span>
            <Award size={16} className="text-purple-400" />
          </div>
          <div className="text-base font-extrabold text-white truncate">{stats.champion_model_name}</div>
          <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
            RMSE: {stats.champion_rmse} · R²: {stats.champion_r2}
          </div>
        </div>
      </div>

      {/* ── Mid Row: Performance Segments & Reference Dataset ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Segments */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Student Prediction Segments</h3>
              <p className="text-xs text-slate-400">Distribution of generated predictions across performance bands</p>
            </div>
            <BarChart3 size={18} className="text-purple-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="h-48 w-full flex items-center justify-center">
              {segmentData.some(s => s.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={segmentData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {segmentData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-500">No predictions logged yet</span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {segmentData.map((seg, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-300 font-medium">{seg.name}</span>
                  </div>
                  <span className="font-extrabold text-white">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real UCI Dataset Baseline Context */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Empirical Dataset Provenance</h3>
              <p className="text-xs text-slate-400">Cortez & Silva (2008) UCI Machine Learning Repository</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              student-mat.csv
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The machine learning engine is trained and evaluated against real-world secondary mathematics records 
            collected from two Portuguese schools. Below are the ground-truth baseline parameters:
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Cohort Size</span>
              <span className="text-xl font-black text-white mt-1 block">{stats.dataset_students_count}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Observed Mean</span>
              <span className="text-xl font-black text-sky-400 mt-1 block">{stats.dataset_mean_grade}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Pass Rate</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">{stats.dataset_pass_rate}%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Full behavioral distributions:</span>
            <Link to="/admin/analytics" className="font-bold text-purple-400 hover:text-white transition-colors">
              Open Cohort Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
