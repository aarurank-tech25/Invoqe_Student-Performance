/**
 * pages/admin/ModelLab.tsx
 * Machine Learning Evaluation Lab: Architectural Benchmarking (Linear Regression,
 * Decision Tree, Random Forest), test-set metrics (MAE, RMSE, R²), and feature importance.
 */

import React, { useEffect, useState } from 'react';
import {
  Binary,
  Award,
  Layers,
  HelpCircle,
  BarChart2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
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
  Legend,
} from 'recharts';

export const ModelLab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await api.getModelBenchmarks();
      setData(res);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  if (loading) {
    return <CardSkeleton rows={6} />;
  }

  const models = data?.models || [];
  const featImp = data?.feature_importances || [];
  const champion = data?.champion_model || 'Random Forest';

  const chartData = models.map((m: any) => ({
    name: m.model_name,
    MAE: m.mae,
    RMSE: m.rmse,
    'R² Score': m.r2,
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Binary size={14} className="text-purple-400" />
            Empirical Model Evaluation Lab
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Machine Learning Benchmarks & Explainability
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Evaluate candidate regression models trained on identical preprocessing pipelines 
            and tested on a strictly held-out 20% validation split (79 unseen students).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Champion: {champion}
          </span>
        </div>
      </div>

      {/* ── Leaderboard Table ── */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Test-Set Leaderboard (79 Unseen Students)</h3>
          </div>
          <span className="text-xs text-slate-400">Selected by Lowest Root Mean Squared Error (RMSE)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1122] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Model Architecture</th>
                <th className="py-3.5 px-5 font-semibold">MAE (Points)</th>
                <th className="py-3.5 px-5 font-semibold">RMSE (Points)</th>
                <th className="py-3.5 px-5 font-semibold">R² Explained Variance</th>
                <th className="py-3.5 px-5 font-semibold text-right">Production Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {models.map((m: any, i: number) => (
                <tr key={i} className={`hover:bg-slate-800/30 transition-colors ${m.is_champion ? 'bg-purple-950/20 font-bold' : ''}`}>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      {m.is_champion && <Award size={16} className="text-purple-400 flex-shrink-0" />}
                      <span className="text-white text-sm">{m.model_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-300">{m.mae.toFixed(3)}</td>
                  <td className="py-4 px-5 text-white font-extrabold">{m.rmse.toFixed(3)}</td>
                  <td className="py-4 px-5 text-slate-300">{m.r2.toFixed(3)}</td>
                  <td className="py-4 px-5 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      m.is_champion
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {m.is_champion ? 'Serving in Production' : 'Benchmarked Candidate'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Multi-Metric Comparison Chart & Rationale ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Comparative Evaluation Metrics</h3>
              <p className="text-xs text-slate-400">MAE, RMSE (lower is better) & R² Score (higher is better)</p>
            </div>
            <BarChart2 size={18} className="text-purple-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="MAE" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="R² Score" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Champion Selection Rationale Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Why Random Forest Won</h3>
              <Award size={18} className="text-purple-400" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Academic achievement involves complex non-linear combinations of family background, absenteeism, and study habits. 
              Here is how Random Forest outperformed alternative architectures:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <b className="text-purple-300 block mb-0.5">Ensemble Variance Reduction:</b>
                <span className="text-slate-400">Averages 100 decorrelated decision trees, mitigating high variance that caused the single Decision Tree to overfit (R² = -0.145).</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <b className="text-indigo-300 block mb-0.5">Non-Linear Interaction Capture:</b>
                <span className="text-slate-400">Unlike Linear Regression, Random Forest accurately maps threshold penalties (e.g., absence cliff after 8+ days).</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <b className="text-emerald-300 block mb-0.5">Robustness to Skew & Outliers:</b>
                <span className="text-slate-400">Resistant to student dropouts and zero-grade exam miss clusters without distorting weights.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500">
            Training split: 316 samples (80%) · Holdout test split: 79 samples (20%)
          </div>
        </div>
      </div>

      {/* ── Feature Importance Ranking ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Top Gini Feature Importances (Random Forest)</h3>
            <p className="text-xs text-slate-400">Relative contribution of transformed predictors to tree splits</p>
          </div>
          <Binary size={18} className="text-purple-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {featImp.map((item: any, i: number) => {
            const cleanName = item.feature.replace('num__', '').replace('cat__', '').replace('_', ' ');
            const pct = (item.importance * 100).toFixed(1);
            return (
              <div key={i} className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white capitalize">{cleanName}</span>
                  <span className="text-xs font-black text-purple-300">{pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, item.importance * 450)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Beginner Metric Guide ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={18} className="text-indigo-400" />
          <h3 className="text-base font-bold text-white">Beginner's Guide to Machine Learning Evaluation Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="glass-card rounded-xl p-4">
            <h4 className="font-bold text-indigo-400 text-sm mb-1">MAE (Mean Absolute Error)</h4>
            <p className="text-slate-400 leading-relaxed">
              The average raw error in grade points. An MAE of 3.00 indicates that predictions typically deviate by approximately 3 marks on the 0–20 scale.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h4 className="font-bold text-purple-400 text-sm mb-1">RMSE (Root Mean Squared Error)</h4>
            <p className="text-slate-400 leading-relaxed">
              Squares errors before averaging, penalizing large misses severely. Minimizing RMSE was chosen to prevent drastically miscategorizing vulnerable students.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h4 className="font-bold text-emerald-400 text-sm mb-1">R² (Coefficient of Determination)</h4>
            <p className="text-slate-400 leading-relaxed">
              Represents the proportion of grade variation explained by pre-exam demographic and lifestyle variables alone. R² ≈ 0.30 is strong given zero exam grade leakage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
