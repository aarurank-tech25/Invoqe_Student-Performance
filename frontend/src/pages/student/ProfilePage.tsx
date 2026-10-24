/**
 * pages/student/ProfilePage.tsx
 * Student profile view, permitted attribute editing, and security credentials status.
 */

import React, { useEffect, useState } from 'react';
import {
  User,
  School,
  Target,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudentProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable form state
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [targetGrade, setTargetGrade] = useState(15.0);
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentProfile();
      setProfile(data);
      setFullName(data.full_name || '');
      setSchool(data.school || 'Gabriel Pereira (GP)');
      setAcademicYear(data.academic_year || 'Secondary Year 2');
      setTargetGrade(data.target_grade || 15.0);
      setPhone(data.phone || '');
      setBio(data.bio || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateStudentProfile({
        full_name: fullName,
        school,
        academic_year: academicYear,
        target_grade: Number(targetGrade),
        phone,
        bio,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CardSkeleton rows={6} />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <User size={14} className="text-indigo-400" />
          Student Account & Profile Settings
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Personal Profile & Preferences
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
          Manage your verified demographic details, academic enrollment credentials, and target GPA benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-center pb-6 border-b border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-3 shadow-xl shadow-indigo-600/25">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <h3 className="text-lg font-bold text-white">{profile?.full_name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{profile?.email}</p>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                ID: {profile?.student_id_number || `STU-${profile?.id}`}
              </div>
            </div>

            <div className="space-y-3 pt-6 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <School size={16} className="text-indigo-400" />
                <span>{profile?.school}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-purple-400" />
                <span>{profile?.academic_year}</span>
              </div>
              <div className="flex items-center gap-3">
                <Target size={16} className="text-emerald-400" />
                <span>Target Grade Goal: <b>{profile?.target_grade} / 20.0</b></span>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-sky-400" />
                <span>Account Status: <b className="text-emerald-400">Active</b></span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-8 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={15} /> Sign Out of AETHER
          </button>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-white mb-6 pb-3 border-b border-white/10">
            Edit Permitted Profile Attributes
          </h3>

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Enrolled School</label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Gabriel Pereira (GP)">Gabriel Pereira (GP)</option>
                  <option value="Mousinho da Silveira (MS)">Mousinho da Silveira (MS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Grade Goal (0–20)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Bio / Career Aspirations</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly state your university ambitions or areas of academic interest..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
