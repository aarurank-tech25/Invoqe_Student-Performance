/**
 * pages/admin/StudentManagement.tsx
 * Administrative student directory: Search, filter, pagination, status toggling,
 * prediction history inspector, and CSV roster export.
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Clock,
  Shield,
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminStudentItem, PredictionRecord } from '../../types';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Status toggle confirmation modal
  const [confirmStudent, setConfirmStudent] = useState<AdminStudentItem | null>(null);

  // Detail drawer for viewing student prediction history
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentItem | null>(null);
  const [studentPredictions, setStudentPredictions] = useState<PredictionRecord[]>([]);
  const [loadingPreds, setLoadingPreds] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStudents(page, pageSize, search);
      setStudents(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, search]);

  const handleToggleStatus = async () => {
    if (!confirmStudent) return;
    try {
      await api.toggleStudentStatus(confirmStudent.id);
      setStudents(students.map(s => s.id === confirmStudent.id ? { ...s, is_active: !s.is_active } : s));
      setConfirmStudent(null);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleInspectStudent = async (student: AdminStudentItem) => {
    setSelectedStudent(student);
    setLoadingPreds(true);
    try {
      const preds = await api.getStudentPredictionsForAdmin(student.id);
      setStudentPredictions(preds);
    } catch {
      setStudentPredictions([]);
    } finally {
      setLoadingPreds(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await api.exportStudentsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aether_students_${new Date().toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Users size={14} className="text-purple-400" />
            Student Cohort Management Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Registered Student Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            View student profiles, review authorized evaluation logs, manage account status, and export certified rosters.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all disabled:opacity-50"
        >
          {exporting ? (
            <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Download size={14} /> Export Student Roster (CSV)
            </>
          )}
        </button>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by student name or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
          <span>Total Records: <b className="text-white">{total}</b></span>
          <button
            onClick={loadStudents}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Table Section ── */}
      {loading ? (
        <TableSkeleton cols={6} rows={6} />
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1122] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Student Name & ID</th>
                  <th className="py-3.5 px-5 font-semibold">School</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold">Target Goal</th>
                  <th className="py-3.5 px-5 font-semibold">Forecasts</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 font-bold flex items-center justify-center flex-shrink-0">
                          {student.full_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{student.full_name}</span>
                          <span className="text-[11px] text-slate-400">{student.email} · {student.student_id_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-300">{student.school}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        student.is_active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {student.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-white">
                      {student.target_grade ? `${student.target_grade} / 20` : '—'}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-indigo-400">{student.prediction_count}</span>
                      {student.latest_predicted_grade && (
                        <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                          (Latest: {student.latest_predicted_grade})
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInspectStudent(student)}
                          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          History
                        </button>
                        <button
                          onClick={() => setConfirmStudent(student)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                            student.is_active
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {student.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {Math.max(1, totalPages)}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-800 text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-800 text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Toggle Confirmation Modal ── */}
      <ConfirmModal
        isOpen={!!confirmStudent}
        title={confirmStudent?.is_active ? 'Deactivate Student Account' : 'Reactivate Student Account'}
        message={`Are you certain you wish to ${confirmStudent?.is_active ? 'deactivate' : 'reactivate'} access for ${confirmStudent?.full_name} (${confirmStudent?.email})?`}
        confirmLabel={confirmStudent?.is_active ? 'Deactivate Account' : 'Activate Account'}
        isDestructive={confirmStudent?.is_active}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmStudent(null)}
      />

      {/* ── Student Prediction History Drawer ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">{selectedStudent.full_name} — Prediction Archive</h3>
                <span className="text-xs text-slate-400">{selectedStudent.email} · {selectedStudent.school}</span>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {loadingPreds ? (
                <div className="text-center py-8 text-slate-400">Loading student assessment logs...</div>
              ) : studentPredictions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">This student has not executed any predictions yet.</div>
              ) : (
                studentPredictions.map((pred) => (
                  <div key={pred.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Assessment #{pred.id}</span>
                      <span className="text-slate-400 text-[11px]">{pred.created_at.substring(0, 10)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Predicted Mark:</span>
                      <span className="font-extrabold text-indigo-400 text-sm">{pred.predicted_grade} / 20</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                        {pred.performance_category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
