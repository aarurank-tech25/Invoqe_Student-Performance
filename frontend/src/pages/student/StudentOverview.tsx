/**
 * pages/student/StudentOverview.tsx
 * Student Overview Dashboard featuring real-time grade gauge, historical trend,
 * strengths & areas for improvement, and quick action workflows.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudentOverviewData } from '../../types';
import { GradeGauge } from '../../components/ui/GradeGauge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const StudentOverview: React.FC = () => {
  const [data, setData] = useState<StudentOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStudentOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load student overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 bg-slate-800 rounded w-1/3 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={4} />
          <CardSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-red-400 text-sm mb-4">{error || 'Unable to retrieve overview'}</p>
        <button
          onClick={loadOverview}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const hasPrediction = data.predicted_grade !== null;
  const grade = data.predicted_grade || 0;
  const target = data.target_grade || 15.0;
  const gap = grade - target;

  // Chart data for recent predictions
  const trendData = data.recent_predictions.map((p, idx) => ({
    name: `Assess #${idx + 1}`,
    grade: p.predicted_grade,
    target: target,
    date: p.created_at.substring(0, 10),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            Student ID: {data.student_id} · {data.school}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {data.student_name}
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Here is your active mathematics trajectory forecast, recent predictive evaluations, and recommended focus areas.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/portal/predict"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
          >
            <Sparkles size={16} />
            Run New Prediction
          </Link>
        </div>
      </div>

      {/* ── Top Row: Gauge Card & Target Progress ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Score Gauge */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Prediction</span>
            <span className="text-xs text-indigo-400 font-semibold">{data.total_predictions} Total Runs</span>
          </div>

          {hasPrediction ? (
            <>
              <div className="py-2">
                <GradeGauge score={grade} size={230} />
              </div>
              <div className="w-full mt-2 pt-3 border-t border-white/5 text-xs text-slate-400">
                Confidence Band: <b className="text-white">{data.confidence_low} – {data.confidence_high} pts</b>
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <Sparkles size={36} className="text-indigo-400 mx-auto mb-3 opacity-60" />
              <p className="text-xs text-slate-300 font-semibold mb-3">No Predictions Yet</p>
              <Link
                to="/portal/predict"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
              >
                Compute First Prediction
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: Academic Progress & Target Alignment */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Goal Alignment</span>
              <Target size={16} className="text-indigo-400" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-400">Target Grade Goal</span>
                  <span className="text-white">{target.toFixed(1)} / 20</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (target / 20) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-400">Current Projected</span>
                  <span className="text-emerald-400">{hasPrediction ? `${grade.toFixed(1)} / 20` : '—'}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (grade / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
              {hasPrediction ? (
                gap >= 0 ? (
                  <span className="text-emerald-400 font-semibold">
                    ✓ You are tracking <b>+{gap.toFixed(1)} points</b> above your target benchmark!
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    ⚠️ Currently tracking <b>{Math.abs(gap).toFixed(1)} points</b> below target. Review recommended study habits below.
                  </span>
                )
              ) : (
                'Set your profile target grade and run a prediction to evaluate your trajectory.'
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
            <span>Active Study Goals: <b className="text-white">{data.active_goals_count}</b></span>
            <span>Completed: <b className="text-emerald-400">{data.completed_goals_count}</b></span>
          </div>
        </div>

        {/* Card 3: Strengths & Focus Areas */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnostic Profile</span>
              <TrendingUp size={16} className="text-indigo-400" />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Key Strengths</span>
                <div className="space-y-1.5">
                  {data.strengths.map((str, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Focus & Growth Areas</span>
                <div className="space-y-1.5">
                  {data.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/portal/goals"
            className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-300 hover:text-white pt-3 border-t border-white/5 transition-colors"
          >
            <span>Review & Update Study Plan</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Mid Row: Trajectory Trend Chart & Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Prediction Trajectory History</h3>
              <p className="text-xs text-slate-400">Score projections over time relative to target</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Scikit-Learn Random Forest</span>
          </div>

          {trendData.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 20]} stroke="#64748b" fontSize={11} ticks={[0, 5, 10, 15, 20]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="grade" name="Predicted Grade" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#gradeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-slate-500">
              Run multiple predictions over the semester to map your progress trajectory.
            </div>
          )}
        </div>

        {/* Actionable Recommendations List */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Latest Actionable Recommendations</h3>
              <Link to="/portal/insights" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore Insights →
              </Link>
            </div>

            <div className="space-y-3">
              {data.latest_recommendations && data.latest_recommendations.length > 0 ? (
                data.latest_recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      rec.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/25 text-slate-300'
                        : rec.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-slate-300'
                        : 'bg-indigo-500/10 border-indigo-500/25 text-slate-300'
                    }`}
                  >
                    <b className="text-white block mb-0.5">{rec.title}</b>
                    <span className="text-slate-400">{rec.detail}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-500">
                  Execute a prediction to receive personalized guidance tailored to your habits.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need an official evaluation certificate?</span>
            <Link to="/portal/reports" className="font-bold text-indigo-400 hover:text-white flex items-center gap-1">
              <FileText size={14} /> Download PDF Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
