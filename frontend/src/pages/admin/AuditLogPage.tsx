/**
 * pages/admin/AuditLogPage.tsx
 * Security and Administrative Audit Event Logging.
 */

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  User,
  Activity,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(60);
      setLogs(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert size={14} className="text-purple-400" />
            Security & Governance Compliance Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrative Audit & System Activity
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Immutable system activity log recording logins, inference runs, account status changes, and roster exports.
          </p>
        </div>

        <button
          onClick={loadAudit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all"
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* ── Audit Table ── */}
      {loading ? (
        <TableSkeleton cols={5} rows={8} />
      ) : logs.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-500">
          No audit log events recorded yet.
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1122] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-5 font-semibold">Actor Email</th>
                  <th className="py-3.5 px-5 font-semibold">Action</th>
                  <th className="py-3.5 px-5 font-semibold">Target Entity</th>
                  <th className="py-3.5 px-5 font-semibold">Event Details</th>
                  <th className="py-3.5 px-5 font-semibold text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => {
                  let actionBadge = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (log.action.includes('LOGIN')) actionBadge = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
                  if (log.action.includes('PREDICTION')) actionBadge = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
                  if (log.action.includes('TOGGLE')) actionBadge = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  if (log.action.includes('EXPORT')) actionBadge = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-600" />
                          <span>{log.timestamp.substring(0, 10)}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp.substring(11, 19)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-medium text-white">{log.actor_email}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-300">{log.resource_type}</td>
                      <td className="py-4 px-5 text-slate-400 max-w-xs truncate" title={log.details || ''}>
                        {log.details || '—'}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-[11px] text-slate-500">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
