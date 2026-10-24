/**
 * components/layout/StudentLayout.tsx
 * Authenticated Student Portal shell with modern responsive sidebar.
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  FileText,
  Target,
  User,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', to: '/portal', icon: LayoutDashboard, end: true },
    { label: 'Predict Performance', to: '/portal/predict', icon: Sparkles },
    { label: 'Academic Insights', to: '/portal/insights', icon: TrendingUp },
    { label: 'My Reports & PDF', to: '/portal/reports', icon: FileText },
    { label: 'Goals & Study Plan', to: '/portal/goals', icon: Target },
    { label: 'Profile & Settings', to: '/portal/profile', icon: User },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col md:flex-row text-slate-100">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-midnight-900 border-r border-white/5 p-5 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-electric-purple flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">AETHER</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                STUDENT
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Success Intelligence</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">Student Portal</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={17} />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={13} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* Switch to Admin if user has admin role */}
        {user?.role === 'admin' && (
          <div className="mb-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <Shield size={14} />
              Switch to Admin Portal
            </button>
          </div>
        )}

        {/* User Card */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-midnight-900 border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap size={18} />
          </div>
          <span className="font-extrabold text-white text-base">AETHER</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-midnight-900 border-b border-white/5 p-4 space-y-2 animate-fade-in">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">{user?.full_name}</span>
            <button onClick={handleSignOut} className="text-xs font-semibold text-red-400 flex items-center gap-1">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
