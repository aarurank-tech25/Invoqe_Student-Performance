/**
 * pages/student/PredictPage.tsx
 * Interactive AI Prediction Studio with persona presets, multi-section form,
 * real-time scikit-learn inference, gauge outcome, and PDF export.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  User,
  Home,
  Heart,
  ArrowRight,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { PredictionInputPayload, PredictionResponse } from '../../types';
import { GradeGauge } from '../../components/ui/GradeGauge';

const PRESETS: Record<string, PredictionInputPayload> = {
  'Median Student': {
    school: 'GP', sex: 'F', age: 17, address: 'U', famsize: 'GT3', Pstatus: 'T',
    Medu: 2, Fedu: 2, Mjob: 'other', Fjob: 'other', reason: 'course', guardian: 'mother',
    traveltime: 1, studytime: 2, failures: 0, schoolsup: 'no', famsup: 'yes', paid: 'no',
    activities: 'no', nursery: 'yes', higher: 'yes', internet: 'yes', romantic: 'no',
    famrel: 4, freetime: 3, goout: 3, Dalc: 1, Walc: 1, health: 3, absences: 4
  },
  'High Achiever': {
    school: 'GP', sex: 'F', age: 16, address: 'U', famsize: 'LE3', Pstatus: 'T',
    Medu: 4, Fedu: 4, Mjob: 'teacher', Fjob: 'services', reason: 'reputation', guardian: 'mother',
    traveltime: 1, studytime: 4, failures: 0, schoolsup: 'no', famsup: 'yes', paid: 'yes',
    activities: 'yes', nursery: 'yes', higher: 'yes', internet: 'yes', romantic: 'no',
    famrel: 5, freetime: 2, goout: 2, Dalc: 1, Walc: 1, health: 5, absences: 2
  },
  'At-Risk Student': {
    school: 'MS', sex: 'M', age: 18, address: 'R', famsize: 'GT3', Pstatus: 'A',
    Medu: 1, Fedu: 1, Mjob: 'at_home', Fjob: 'other', reason: 'course', guardian: 'other',
    traveltime: 3, studytime: 1, failures: 2, schoolsup: 'yes', famsup: 'no', paid: 'no',
    activities: 'no', nursery: 'no', higher: 'no', internet: 'no', romantic: 'yes',
    famrel: 2, freetime: 4, goout: 5, Dalc: 3, Walc: 4, health: 2, absences: 16
  },
  'Diligent Underdog': {
    school: 'GP', sex: 'M', age: 17, address: 'R', famsize: 'GT3', Pstatus: 'T',
    Medu: 1, Fedu: 1, Mjob: 'other', Fjob: 'other', reason: 'home', guardian: 'mother',
    traveltime: 2, studytime: 3, failures: 1, schoolsup: 'no', famsup: 'yes', paid: 'yes',
    activities: 'yes', nursery: 'yes', higher: 'yes', internet: 'yes', romantic: 'no',
    famrel: 4, freetime: 2, goout: 2, Dalc: 1, Walc: 1, health: 4, absences: 4
  }
};

export const PredictPage: React.FC = () => {
  const [formData, setFormData] = useState<PredictionInputPayload>(PRESETS['Median Student']);
  const [activePreset, setActivePreset] = useState<string>('Median Student');
  const [activeTab, setActiveTab] = useState<'academic' | 'demographics' | 'family' | 'lifestyle'>('academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handlePresetSelect = (name: string) => {
    setActivePreset(name);
    setFormData(PRESETS[name]);
    setError(null);
  };

  const handleFieldChange = (field: keyof PredictionInputPayload, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setActivePreset('Custom Profile');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.createPrediction(formData);
      setResult(res);
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('prediction-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Inference execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (predictionId: number) => {
    setDownloadingPdf(true);
    try {
      const blob = await api.downloadPredictionPdf(predictionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AETHER_Evaluation_Report_#${predictionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to download PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={14} className="text-indigo-400" />
          Real-Time Machine Learning Inference Studio
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Predict My Final Mathematics Performance
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
          Configure your baseline educational, environmental, and behavioral predictors. 
          The backend applies standard scaling and Random Forest inference to calculate your projected grade point.
        </p>

        {/* Anti-Leakage Badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl w-fit">
          <CheckCircle2 size={14} />
          <b>Zero Data Leakage:</b> Interim grades G1 and G2 are completely excluded from predictive features.
        </div>
      </div>

      {/* ── Quick-Load Presets ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Load Persona Preset</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.keys(PRESETS).map(name => (
            <button
              key={name}
              type="button"
              onClick={() => handlePresetSelect(name)}
              className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex flex-col justify-between ${
                activePreset === name
                  ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'glass-card border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              <span>{name}</span>
              <span className="text-[10px] text-slate-500 font-normal mt-1">Click to apply</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Configuration Form ── */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        {/* Form Category Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 border-b border-white/10 gap-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'academic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={15} /> 1. Academic & Study Habits
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demographics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'demographics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={15} /> 2. Student Demographics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'family' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home size={15} /> 3. Family & Environment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lifestyle')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'lifestyle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={15} /> 4. Lifestyle & Health
          </button>
        </div>

        {/* Tab 1: Academic Habits */}
        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Weekly Study Time
              </label>
              <select
                value={formData.studytime}
                onChange={(e) => handleFieldChange('studytime', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1: &lt; 2 hours per week</option>
                <option value={2}>2: 2 to 5 hours per week</option>
                <option value={3}>3: 5 to 10 hours per week</option>
                <option value={4}>4: &gt; 10 hours per week</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">Study dedication outside regular school class hours.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total School Absences (Days)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={formData.absences}
                  onChange={(e) => handleFieldChange('absences', Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="w-12 text-center py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  {formData.absences} d
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Top predictor of mathematics retention deficit.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Past Class Failures (0–3)
              </label>
              <input
                type="number"
                min={0}
                max={3}
                value={formData.failures}
                onChange={(e) => handleFieldChange('failures', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">0 indicates no prior course failures.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Extra School Support (Tutoring)
              </label>
              <select
                value={formData.schoolsup}
                onChange={(e) => handleFieldChange('schoolsup', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paid Extra Classes
              </label>
              <select
                value={formData.paid}
                onChange={(e) => handleFieldChange('paid', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Aspiration for Higher Education
              </label>
              <select
                value={formData.higher}
                onChange={(e) => handleFieldChange('higher', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="yes">Yes (Aspires to College/University)</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Demographics */}
        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">School</label>
              <select
                value={formData.school}
                onChange={(e) => handleFieldChange('school', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="GP">Gabriel Pereira (GP)</option>
                <option value="MS">Mousinho da Silveira (MS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
              <select
                value={formData.sex}
                onChange={(e) => handleFieldChange('sex', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age ({formData.age} yrs)</label>
              <input
                type="range"
                min={15}
                max={22}
                value={formData.age}
                onChange={(e) => handleFieldChange('age', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Address Zone</label>
              <select
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="U">Urban (U)</option>
                <option value="R">Rural (R)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Family Size</label>
              <select
                value={formData.famsize}
                onChange={(e) => handleFieldChange('famsize', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="GT3">&gt; 3 Members (GT3)</option>
                <option value="LE3">≤ 3 Members (LE3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Parents Cohabitation</label>
              <select
                value={formData.Pstatus}
                onChange={(e) => handleFieldChange('Pstatus', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="T">Living Together (T)</option>
                <option value="A">Apart (A)</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 3: Family & Support */}
        {activeTab === 'family' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mother's Education</label>
              <select
                value={formData.Medu}
                onChange={(e) => handleFieldChange('Medu', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>0: None</option>
                <option value={1}>1: Primary (4th Grade)</option>
                <option value={2}>2: 5th–9th Grade</option>
                <option value={3}>3: Secondary Education</option>
                <option value={4}>4: Higher Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Father's Education</label>
              <select
                value={formData.Fedu}
                onChange={(e) => handleFieldChange('Fedu', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>0: None</option>
                <option value={1}>1: Primary (4th Grade)</option>
                <option value={2}>2: 5th–9th Grade</option>
                <option value={3}>3: Secondary Education</option>
                <option value={4}>4: Higher Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mother's Job</label>
              <select
                value={formData.Mjob}
                onChange={(e) => handleFieldChange('Mjob', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="other">Other</option>
                <option value="services">Services</option>
                <option value="at_home">At Home</option>
                <option value="teacher">Teacher</option>
                <option value="health">Health</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Father's Job</label>
              <select
                value={formData.Fjob}
                onChange={(e) => handleFieldChange('Fjob', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="other">Other</option>
                <option value="services">Services</option>
                <option value="at_home">At Home</option>
                <option value="teacher">Teacher</option>
                <option value="health">Health</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Family Educational Support</label>
              <select
                value={formData.famsup}
                onChange={(e) => handleFieldChange('famsup', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Legal Guardian</label>
              <select
                value={formData.guardian}
                onChange={(e) => handleFieldChange('guardian', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 4: Lifestyle & Health */}
        {activeTab === 'lifestyle' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Home Internet Access</label>
              <select
                value={formData.internet}
                onChange={(e) => handleFieldChange('internet', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">In a Romantic Relationship</label>
              <select
                value={formData.romantic}
                onChange={(e) => handleFieldChange('romantic', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Going Out with Friends ({formData.goout}/5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.goout}
                onChange={(e) => handleFieldChange('goout', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weekend Alcohol Intake ({formData.Walc}/5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.Walc}
                onChange={(e) => handleFieldChange('Walc', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Health Status ({formData.health}/5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.health}
                onChange={(e) => handleFieldChange('health', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quality of Family Relations ({formData.famrel}/5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.famrel}
                onChange={(e) => handleFieldChange('famrel', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Pipeline: ColumnTransformer (OHE + Scaler) → Random Forest
          </span>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} /> Compute Machine Learning Forecast
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── PREDICTION RESULTS SECTION ── */}
      {result && (
        <div id="prediction-results" className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Inference Complete</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Projected Examination Outcome</h3>
            </div>
            <button
              onClick={() => handleDownloadPdf(result.id)}
              disabled={downloadingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all disabled:opacity-50"
            >
              {downloadingPdf ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FileText size={15} /> Download PDF Evaluation Report
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Visual Gauge */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Estimated Score (G3)</span>
              <GradeGauge score={result.predicted_grade} size={230} />
              <div className="text-xs text-slate-400 mt-2">
                Expected Band: <b className="text-white">{result.confidence_low} – {result.confidence_high} points</b>
              </div>
            </div>

            {/* Performance Tiering Card */}
            <div className="md:col-span-2 glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {result.performance_category}
                </span>
              </div>

              <h4 className="text-xl font-extrabold text-white">
                Projected Mark: <span className="text-indigo-400">{result.predicted_grade}</span> / 20.0
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                This prediction represents a statistical estimate derived from 30 verified behavioral, lifestyle, 
                and academic indicators. Evaluated via Random Forest regression on Portuguese secondary education cohorts.
              </p>

              {/* Personalized Advice */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-400 block mb-2">Tailored Academic Advice:</span>
                {result.recommendations.map((rec: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      rec.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/25 text-slate-300'
                        : rec.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-slate-300'
                        : 'bg-indigo-500/10 border-indigo-500/25 text-slate-300'
                    }`}
                  >
                    <b className="text-white block mb-0.5">{rec.title}</b>
                    <span className="text-slate-400">{rec.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ethical AI Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed">
            ⚠️ <b>Ethical Guidance Notice:</b> Predictive estimations are intended solely to provide proactive academic 
            mentorship and targeted tutoring. They do not constitute deterministic outcomes or human judgments.
          </div>
        </div>
      )}
    </div>
  );
};
