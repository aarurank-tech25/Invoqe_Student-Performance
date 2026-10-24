/**
 * components/ui/GradeGauge.tsx
 * Visual SVG Semi-Circle Gauge for 0–20 Academic Grade Scale.
 */

import React from 'react';

interface GradeGaugeProps {
  score: number; // 0 to 20
  size?: number;
  showLabels?: boolean;
}

export const GradeGauge: React.FC<GradeGaugeProps> = ({ score, size = 240, showLabels = true }) => {
  const clampedScore = Math.max(0, Math.min(20, score));
  // Map 0..20 score to angle -180 deg to 0 deg
  const percentage = clampedScore / 20;
  const angle = -180 + percentage * 180;

  // Determine Tier and Theme Color
  let color = '#ef4444'; // Red (At Risk)
  let tier = 'At Risk';
  let badgeBg = 'bg-red-500/15 text-red-400 border-red-500/30';

  if (clampedScore >= 16) {
    color = '#10b981'; // Emerald
    tier = 'Distinction';
    badgeBg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (clampedScore >= 14) {
    color = '#38bdf8'; // Sky
    tier = 'Good';
    badgeBg = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  } else if (clampedScore >= 10) {
    color = '#f59e0b'; // Amber
    tier = 'Satisfactory';
    badgeBg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  const radius = 80;
  const strokeWidth = 14;
  const center = 100;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg width={size} height={size * 0.62} viewBox="0 0 200 125" className="overflow-visible">
        <defs>
          <linearGradient id="gaugeBgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Background Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Color Bands Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeBgGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Passing Threshold Marker at 10.0 (angle = -90 deg, top center x=100, y=20) */}
        <line
          x1="100"
          y1="10"
          x2="100"
          y2="28"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="2,2"
        />

        {/* Needle */}
        <g transform={`rotate(${angle} ${center} ${center})`}>
          <line
            x1={center}
            y1={center}
            x2={center - radius + 10}
            y2={center}
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <circle cx={center} cy={center} r="6" fill={color} />
          <circle cx={center} cy={center} r="2.5" fill="#090e1a" />
        </g>

        {/* Min / Max Tick Labels */}
        {showLabels && (
          <>
            <text x="20" y="118" fill="#64748b" fontSize="8" fontWeight="600" textAnchor="middle">0</text>
            <text x="100" y="7" fill="#94a3b8" fontSize="7" fontWeight="600" textAnchor="middle">PASS (10)</text>
            <text x="180" y="118" fill="#64748b" fontSize="8" fontWeight="600" textAnchor="middle">20</text>
          </>
        )}
      </svg>

      {/* Central Score readout */}
      <div className="text-center -mt-3">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-extrabold text-white tracking-tight">{clampedScore.toFixed(1)}</span>
          <span className="text-sm font-semibold text-slate-400">/ 20</span>
        </div>
        <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeBg}`}>
          {tier}
        </div>
      </div>
    </div>
  );
};
