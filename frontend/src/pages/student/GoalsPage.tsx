/**
 * pages/student/GoalsPage.tsx
 * Student study goal tracking, creation, completion toggling, and weekly study schedule planner.
 */

import React, { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudyGoal } from '../../types';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Mathematics');
  const [newHours, setNewHours] = useState(4.0);
  const [newDueDate, setNewDueDate] = useState('');

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleToggleGoal = async (goal: StudyGoal) => {
    try {
      const updated = await api.updateGoal(goal.id, { completed: !goal.completed });
      setGoals(goals.map(g => (g.id === goal.id ? updated : g)));
    } catch (err: any) {
      alert(err.message || 'Failed to update goal');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createGoal({
        title: newTitle,
        category: newCategory,
        target_hours: newHours,
        due_date: newDueDate || undefined,
      });
      setGoals([created, ...goals]);
      setShowAddModal(false);
      setNewTitle('');
      setNewDueDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to create goal');
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalHours = goals.reduce((acc, g) => acc + g.target_hours, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Target size={14} className="text-indigo-400" />
            Adaptive Academic Goal Planning
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Goals & Weekly Study Planner
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Set deliberate practice targets, log weekly study allocations, and track conceptual milestones before examinations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} /> Add Study Goal
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Target size={22} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Goals</span>
            <span className="text-2xl font-black text-white">{goals.length}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Completed Milestones</span>
            <span className="text-2xl font-black text-emerald-400">{completedCount}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Target Study Hours</span>
            <span className="text-2xl font-black text-purple-300">{totalHours.toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      {/* ── Goals List & Weekly Cadence Planner ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Goals List */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Active Academic Goals ({goals.length - completedCount})</h3>
            <span className="text-xs text-slate-400">Click circle to toggle completion</span>
          </div>

          {loading ? (
            <CardSkeleton rows={4} />
          ) : goals.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No study goals created yet. Click "+ Add Study Goal" above to create your first milestone.
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    g.completed
                      ? 'bg-slate-900/40 border-white/5 opacity-60'
                      : 'glass-card border-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => handleToggleGoal(g)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                    >
                      {g.completed ? <CheckCircle size={20} className="text-emerald-400" /> : <Circle size={20} />}
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold text-white ${g.completed ? 'line-through text-slate-400' : ''}`}>
                        {g.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300">
                          {g.category}
                        </span>
                        <span>{g.target_hours} hrs dedicated</span>
                        {g.due_date && <span>Due: {g.due_date}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Weekly Schedule Cadence */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <Calendar size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-white">Recommended Weekly Plan</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Structured weekly study cadences correlate with higher exam retention without fatigue:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="font-bold text-indigo-300 block mb-0.5">Mon & Wed (60 min each):</span>
                <span className="text-slate-400">Review class notes & foundational homework exercises.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="font-bold text-purple-300 block mb-0.5">Friday (90 min):</span>
                <span className="text-slate-400">Timed practice exam questions on algebraic functions.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="font-bold text-emerald-300 block mb-0.5">Saturday (60 min):</span>
                <span className="text-slate-400">Peer study group or review clinic for difficult problem sets.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-slate-500">
            * Recommended study plans are empirical guidance and do not guarantee specific outcomes.
          </div>
        </div>
      </div>

      {/* ── Add Goal Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Study Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Trigonometric Functions"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Exam Practice">Exam Practice</option>
                    <option value="Homework">Homework</option>
                    <option value="Clinic / Tutoring">Clinic / Tutoring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
