/**
 * components/ui/LoadingSkeleton.tsx
 * Reusable animated pulse skeleton component.
 */

import React from 'react';

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="glass-panel rounded-2xl p-6 animate-pulse">
    <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-700 rounded w-2/3 mb-6"></div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-slate-800/80 rounded w-full"></div>
      ))}
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ cols?: number; rows?: number }> = ({ cols = 5, rows = 5 }) => (
  <div className="glass-panel rounded-2xl p-4 animate-pulse overflow-hidden">
    <div className="flex gap-4 border-b border-slate-800 pb-3 mb-3">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-800 rounded flex-1"></div>
      ))}
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-5 bg-slate-800/60 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
