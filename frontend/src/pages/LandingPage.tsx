/**
 * pages/LandingPage.tsx
 * Premium Enterprise SaaS landing page for AETHER Student Intelligence.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Brain,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  Database,
  Award,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { GradeGauge } from '../components/ui/GradeGauge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-electric-purple/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
            <Sparkles size={14} className="text-indigo-400" />
            AI-Driven Academic Intelligence Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Every Student Has Potential.{' '}
            <span className="text-gradient-primary">Discover What Comes Next.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            AETHER predicts secondary school final exam outcomes prior to examinations using behavioral and demographic factors — allowing proactive academic guidance and early intervention without interim mark leakage.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5 transition-all text-sm"
            >
              Explore Student Portal
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/admin-login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 transition-all text-sm"
            >
              <ShieldCheck size={16} className="text-purple-400" />
              Admin Sign In
            </Link>
          </div>

          {/* ── Interactive Dashboard Preview Card ── */}
          <div className="max-w-5xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 text-left relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Live Evaluation Model Preview</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Student Intelligence & Risk Matrix</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Model Status: Operational
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Zero Data Leakage
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Left Gauge Box */}
              <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Simulated Outcome (G3)</span>
                <GradeGauge score={15.4} size={210} />
                <p className="text-xs text-slate-400 mt-2">Predicted Range: <b>12.4 – 18.4</b> (± 3.0 MAE)</p>
              </div>

              {/* Center Predictive Drivers */}
              <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Key Predictive Attributes</span>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <span className="text-slate-400">Weekly Study Time</span>
                      <span className="font-semibold text-white">5–10 hrs / week</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <span className="text-slate-400">Total Absences</span>
                      <span className="font-semibold text-emerald-400">2 days (Low)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <span className="text-slate-400">Past Class Failures</span>
                      <span className="font-semibold text-white">0 failures</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <span className="text-slate-400">Higher Education Ambition</span>
                      <span className="font-semibold text-indigo-400">Yes (Active)</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Inputs strictly isolated from interim marks G1 and G2.
                </div>
              </div>

              {/* Right Actionable Advice */}
              <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">AI Academic Recommendations</span>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border-l-2 border-emerald-400 text-slate-300">
                      <b className="text-emerald-400 block">Excellence Trajectory:</b> Student is maintaining top quartile study consistency.
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 border-l-2 border-indigo-400 text-slate-300">
                      <b className="text-indigo-400 block">Exam Strategy:</b> Complete collegiate math problem sets under timed conditions.
                    </div>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="mt-4 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all"
                >
                  Run Your Own Student Simulation <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE CAPABILITIES ── */}
      <section id="features" className="py-24 bg-midnight-900/50 border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">Designed for Educational Impact</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Enterprise AI Architecture Built for High School & College Success
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Moving beyond post-mortem exam grading. AETHER equips schools and students with transparent, interpretable machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel rounded-2xl p-6 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Predictive Grade Modeling</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Estimates final mathematical proficiency on a 0–20 scale with clear confidence intervals and zero data leakage.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <Brain size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Explainable AI Insights</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Inspect which behavioral factors (absences, study habits, parental involvement) drive predictive outcomes.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Actionable Study Plans</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dynamic goal setting, weekly study scheduling, and tailored suggestions to turn predictive insights into progress.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Administrative Governance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dedicated admin analytics, cohort performance segmentation, secure audit logs, and instant student roster exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">End-to-End Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              How AETHER Transforms Data into Academic Support
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="glass-panel rounded-2xl p-8 relative">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-6">01</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-5">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Profile & Habit Input</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Students and counselors configure relevant academic habits, study allocations, and attendance indicators across 4 intuitive cards.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-8 relative">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-6">02</span>
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-5">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ensemble Pipeline Inference</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The Python backend applies One-Hot Encoding, StandardScaler normalization, and Random Forest inference to project outcomes.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-8 relative">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-6">03</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-5">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Personalized Guidance & PDF</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive visual score gauge, performance tiering, customized study guidance, and download an official PDF evaluation report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ML ARCHITECTURE & MODEL LAB ── */}
      <section id="ml-lab" className="py-24 bg-midnight-900/50 border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">Rigorous Empirical Evaluation</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                Evaluated on 79 Unseen Students via 20% Held-Out Test Set
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Unlike simple classification demos, AETHER treats grade prediction as a rigorous regression problem on the Portuguese secondary education dataset (Cortez & Silva, 2008).
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300"><b>Random Forest Champion:</b> Lowest test-set RMSE (3.802) and highest variance explained (R² = 0.295).</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300"><b>Zero Data Leakage:</b> Interim grades G1 and G2 are strictly excluded to ensure true pre-exam forecasting.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300"><b>Unbiased Benchmarks:</b> Tested against Linear Regression and Decision Tree regressors with no fabricated metrics.</p>
                </div>
              </div>

              <Link
                to="/admin-login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                Inspect ML Model Lab in Admin View <ChevronRight size={14} />
              </Link>
            </div>

            {/* Model Comparison Table Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h4 className="text-base font-bold text-white">Model Evaluation Leaderboard</h4>
                <span className="text-xs text-slate-400">Held-Out Test Set</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Random Forest Regressor</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-300">CHAMPION</span>
                    </div>
                    <span className="text-xs text-slate-400">Ensemble Bagging (100 Trees)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400">RMSE: 3.802</span>
                    <span className="text-xs text-slate-400 block">MAE: 3.000 · R²: 0.295</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">Linear Regression</span>
                    <span className="text-xs text-slate-400 block">Baseline Parametric Model</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-300">RMSE: 4.196</span>
                    <span className="text-xs text-slate-500 block">MAE: 3.395 · R²: 0.141</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">Decision Tree Regressor</span>
                    <span className="text-xs text-slate-400 block">Single Tree Architecture</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-300">RMSE: 4.844</span>
                    <span className="text-xs text-slate-500 block">MAE: 3.646 · R²: -0.145</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESPONSIBLE AI & ETHICS ── */}
      <section id="ethics" className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-6">
            <Lock size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Our Responsible AI & Privacy Commitment
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mx-auto mb-8">
            Predictions generated by AETHER are statistical estimates derived from historical cohorts, not deterministic verdicts. 
            Machine learning in educational institutions must always empower students with targeted resources rather than track or penalize them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-card rounded-2xl p-5">
              <h4 className="text-sm font-bold text-indigo-300 mb-1">Correlation ≠ Causation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Features like absences and going out are statistical correlates; addressing them requires understanding systemic student circumstances.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h4 className="text-sm font-bold text-indigo-300 mb-1">Supportive, Never Punitive</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Risk alerts are reserved for educational counselors and students to coordinate tutoring and wellness resources early.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h4 className="text-sm font-bold text-indigo-300 mb-1">Strict Isolation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based access controls guarantee that students cannot view peer predictions or access administrative governance tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-auto border-t border-white/5 bg-midnight-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-white text-sm">AETHER</span>
            <span>·</span>
            <span>Student Intelligence & Success Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Student Portal</Link>
            <Link to="/admin-login" className="hover:text-white transition-colors">Admin Portal</Link>
            <a href="https://archive.ics.uci.edu/dataset/320/student+performance" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              UCI ML Dataset
            </a>
          </div>
          <div>
            Built with React, Vite, TypeScript, Tailwind CSS, FastAPI, and Scikit-Learn.
          </div>
        </div>
      </footer>
    </div>
  );
};
