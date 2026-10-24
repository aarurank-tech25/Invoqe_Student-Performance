/**
 * pages/AdminLoginPage.tsx
 * Dedicated Administrative Governance Sign In with distinct visual treatment.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        throw new Error('Access Denied: This account does not possess administrative privileges.');
      }
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@aether.edu');
    setPassword('AdminPass123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#060a12] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-purple-600 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-electric-purple flex items-center justify-center text-white shadow-xl shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <ShieldCheck size={26} />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight">AETHER</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
              GOVERNANCE
            </span>
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Administrative Sign In</h2>
        <p className="text-xs text-slate-400 mt-1">Authorized personnel only: Deans, Department Heads, and Academic Advisors</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl bg-[#0a0f1d]/85">
          {/* Quick Demo Admin Credentials Fill Button */}
          <div className="mb-6 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <KeyRound size={13} className="text-purple-400" />
                <span className="text-xs font-bold text-purple-200">Demo Admin Account</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">admin@aether.edu / AdminPass123!</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              Fill Demo
            </button>
          </div>

          {/* Security Notice */}
          <div className="mb-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            🛡️ <b>Security Enforcement:</b> Administrative roles are seeded strictly via server configuration. Public student registration cannot grant administrative authority.
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Administrator Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aether.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1628] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Secret Passphrase</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0e1628] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Admin Session
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Student Redirect */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Are you a student looking for your portal? <b>Student Login</b>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
