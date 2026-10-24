/**
 * pages/student/ReportsPage.tsx
 * Student Evaluation History and 1-Click Official PDF Report Downloads.
 */

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { PredictionRecord } from '../../types';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PredictionRecord | null>(null);
  const navigate = useNavigate();

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictionHistory();
      setReports(data);
    } catch {
      // error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      const blob = await api.downloadPredictionPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AETHER_Evaluation_Report_#${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error downloading PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <FileText size={14} className="text-indigo-400" />
          Certified Academic Evaluation Records
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Evaluation Reports & History
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
          Access your complete archive of AI-generated academic forecasts. Download high-resolution 
          PDF evaluation reports for academic counseling or personal portfolio records.
        </p>
      </div>

      {/* ── Content Table ── */}
      {loading ? (
        <TableSkeleton cols={5} rows={5} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Evaluation Reports Generated"
          description="You haven't run any AI performance evaluations yet. Run a prediction to generate your first certified report."
          actionText="Run First Prediction"
          onAction={() => navigate('/portal/predict')}
        />
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Generated Assessment History ({reports.length})</h3>
            <button
              onClick={loadReports}
              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Refresh Archive
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-5 font-semibold">Assessment ID</th>
                  <th className="py-3 px-5 font-semibold">Evaluation Date</th>
                  <th className="py-3 px-5 font-semibold">Predicted Mark</th>
                  <th className="py-3 px-5 font-semibold">Performance Tier</th>
                  <th className="py-3 px-5 font-semibold">Evaluator Engine</th>
                  <th className="py-3 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-white">#{report.id}</td>
                    <td className="py-4 px-5 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-500" />
                        <span>{report.created_at.substring(0, 10)}</span>
                        <span className="text-[10px] text-slate-500">{report.created_at.substring(11, 16)} UTC</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-extrabold text-white text-sm">
                      {report.predicted_grade.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 20</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {report.performance_category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400">{report.model_name}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRecord(report)}
                          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDownload(report.id)}
                          disabled={downloadingId === report.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50"
                        >
                          {downloadingId === report.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Download size={13} />
                              <span>PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detail Drawer / Modal ── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Assessment #{selectedRecord.id} Details</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Score Projection:</span>
                <span className="font-bold text-white">{selectedRecord.predicted_grade} / 20.0</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Confidence Band:</span>
                <span className="text-slate-200">{selectedRecord.confidence_low} – {selectedRecord.confidence_high} points</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Classification:</span>
                <span className="text-indigo-400 font-semibold">{selectedRecord.performance_category}</span>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 font-bold block mb-1.5">Recommendations:</span>
                <div className="space-y-1.5">
                  {selectedRecord.recommendations.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-indigo-500/10 border-l-2 border-indigo-400 text-slate-300">
                      <b className="text-white block">{r.title}</b>
                      <span className="text-slate-400 text-[11px]">{r.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDownload(selectedRecord.id)}
                className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Download size={14} /> Download Official PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
