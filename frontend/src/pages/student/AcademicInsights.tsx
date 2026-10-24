/**
 * pages/student/AcademicInsights.tsx
 * Interactive student insights: empirical study time dynamics, absence impact,
 * correlation factors, and correlation vs. causation analysis.
 */

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Brain,
  Clock,
  AlertTriangle,
  HelpCircle,
  BarChart2,
  CheckCircle2,
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

export const AcademicInsights: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For insights, load the analytics endpoints
    api.getAdminAnalytics()
      .then(res => setAnalytics(res))
      .catch(() => {
        // Fallback default sample data if not admin
        setAnalytics({
          study_time_breakdown: [
            { bracket: '< 2 hours', mean_grade: 10.05, median_grade: 10.0, student_count: 105 },
            { bracket: '2 to 5 hours', mean_grade: 10.17, median_grade: 11.0, student_count: 198 },
            { bracket: '5 to 10 hours', mean_grade: 11.40, median_grade: 12.0, student_count: 65 },
            { bracket: '> 10 hours', mean_grade: 11.26, median_grade: 12.0, student_count: 27 },
          ],
          correlations_with_grade: [
            { feature: 'failures', correlation: -0.360 },
            { feature: 'Medu', correlation: 0.218 },
            { feature: 'Fedu', correlation: 0.152 },
            { feature: 'studytime', correlation: 0.098 },
            { feature: 'Walc', correlation: -0.052 },
            { feature: 'absences', correlation: 0.034 },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <CardSkeleton rows={6} />;
  }

  const studyData = analytics?.study_time_breakdown || [];
  const corrData = analytics?.correlations_with_grade?.slice(0, 8) || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Brain size={14} className="text-indigo-400" />
          Empirical Research & Behavioral Modeling
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Academic Insights & Feature Influence
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
          Examine the statistical relationships between study allocations, attendance habits, 
          and final exam achievement derived from the real Portuguese secondary mathematics cohort.
        </p>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time vs Mean Grade */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Study Time vs Final Grade</h3>
              <p className="text-xs text-slate-400">Mean grade achievement per weekly study allocation bracket</p>
            </div>
            <Clock size={18} className="text-indigo-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bracket" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 20]} stroke="#64748b" fontSize={11} ticks={[0, 5, 10, 15, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="mean_grade" name="Mean Grade (G3)" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
            💡 <b>Insight:</b> Moving from &lt;2 hours to 5–10 hours per week correlates with a steady increase in median performance. Beyond 10 hours, gains plateau without structured guidance.
          </div>
        </div>

        {/* Top Feature Correlations with G3 */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Feature Correlations with Grade (r)</h3>
              <p className="text-xs text-slate-400">Pearson correlation with final examination grade (G3)</p>
            </div>
            <TrendingUp size={18} className="text-purple-400" />
          </div>

          <div className="space-y-3 pt-2">
            {corrData.map((item: any, i: number) => {
              const isPos = item.correlation >= 0;
              const absVal = Math.abs(item.correlation);
              const labelMap: Record<string, string> = {
                failures: 'Past Class Failures',
                Medu: "Mother's Education Level",
                Fedu: "Father's Education Level",
                studytime: 'Weekly Study Investment',
                Walc: 'Weekend Alcohol Consumption',
                absences: 'Total School Absences',
                age: 'Student Age',
                goout: 'Going Out Frequency',
              };
              return (
                <div key={i} className="text-xs">
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">{labelMap[item.feature] || item.feature}</span>
                    <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                      {item.correlation > 0 ? `+${item.correlation.toFixed(3)}` : item.correlation.toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, absVal * 250)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
            ⚠️ <b>Negative Drivers:</b> Prior failure history is the single strongest negative indicator (r ≈ -0.36), illustrating cumulative conceptual deficit.
          </div>
        </div>
      </div>

      {/* ── Correlation vs. Causation Analysis ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Critical Scientific Distinction: Correlation vs. Causation</h3>
            <span className="text-xs text-slate-400">Interpreting Machine Learning in Educational Settings</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          While machine learning algorithms detect strong statistical patterns among student attributes, 
          <b> correlation does not demonstrate direct cause-and-effect</b>. A high absence count, for example, 
          may stem from chronic transportation issues, physical health challenges, or familial obligations rather than simple disinterest.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-300 mb-1">Contextual Advising</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Academic advisors should review student circumstances holistically rather than making assumptions based solely on risk flags.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-300 mb-1">Targeted Skill Bridges</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prior failures indicate prerequisite gaps in algebra or geometry that require diagnostic tutoring before new syllabus material.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-300 mb-1">Environmental Support</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Family and school resources must be paired with student motivation to create sustained academic turnaround.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
