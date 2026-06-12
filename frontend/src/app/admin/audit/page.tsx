'use client';

import { useState, useEffect } from 'react';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { ScrollText, ShieldAlert, Monitor, Clock } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const list = await api.getAuditLogs();
        setLogs(list);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch system audit logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('REJECT')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (action.includes('APPROVE') || action.includes('CONDONE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (action.includes('SLA')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  const parseDetails = (detailsStr: string) => {
    try {
      const parsed = JSON.parse(detailsStr);
      return Object.entries(parsed)
        .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`)
        .join(', ');
    } catch {
      return detailsStr;
    }
  };

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Security & Condonation Audit Trail</h1>
          <p className="text-slate-400 text-xs mt-1">Immutable registry of approvals, certificate reviews, and attendance condonations</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Audit Log Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6 text-left">
            <ScrollText className="w-5 h-5 text-medical-400" />
            <h2 className="font-bold text-white text-base">Audit Trail Register ({logs.length} events)</h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading audit registers...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No audit logs recorded in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-4">Timestamp</th>
                    <th className="pb-3">Responsible User</th>
                    <th className="pb-3">Action Type</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3 pr-4 text-right">Terminal IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-4 pl-4 font-mono text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-4 font-bold text-white">
                        {log.user?.name}
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[8px] font-bold uppercase">{log.user?.role}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 truncate max-w-[280px] text-slate-400" title={parseDetails(log.details)}>{parseDetails(log.details)}</td>
                      <td className="py-4 pr-4 text-right font-mono text-slate-500 flex items-center justify-end gap-1.5"><Monitor className="w-3.5 h-3.5" /> {log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </NavbarFrame>
  );
}
