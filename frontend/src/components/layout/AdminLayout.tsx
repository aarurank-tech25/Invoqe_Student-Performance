/**
 * components/layout/AdminLayout.tsx
 * Authenticated Administrator Portal shell with dedicated dark executive styling.
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  LineChart,
  Binary,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNav = [
    { label: 'Platform Overview', to: '/admin', icon: BarChart3, end: true },
    { label: 'Student Management', to: '/admin/students', icon: Users },
    { label: 'Cohort Analytics', to: '/admin/analytics', icon: LineChart },
    { label: 'ML Model Lab', to: '/admin/models', icon: Binary },
    { label: 'Audit & Security', to: '/admin/audit', icon: ShieldAlert },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col md:flex-row text-slate-100">
      {/* ── Admin Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#090e1a] border-r border-slate-800/80 p-5 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-electric-purple flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">AETHER</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ADMIN
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Platform Governance</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">Governance</p>
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={17} />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={13} className="opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* Switch to Student Portal */}
        <div className="mb-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => navigate('/portal')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition-colors"
          >
            <ExternalLink size={13} />
            Open Student Portal View
          </button>
        </div>

        {/* Admin User Card */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs flex-shrink-0">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-purple-300/80 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out of Admin"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#090e1a] border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="font-extrabold text-white text-base">AETHER ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#090e1a] border-b border-slate-800 p-4 space-y-2 animate-fade-in">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <button onClick={() => navigate('/portal')} className="text-xs text-indigo-400">Student Portal</button>
            <button onClick={handleSignOut} className="text-xs font-semibold text-red-400 flex items-center gap-1">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
