'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { ClipboardCheck, FileText, CheckCircle2, Clock, ShieldAlert, Calendar, ArrowRight } from 'lucide-react';

export default function ApproverDashboard() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, leavesList] = await Promise.all([
          api.me(),
          api.getLeaves()
        ]);
        setUser(profile);
        setLeaves(leavesList);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch approvals queue.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <NavbarFrame>
        <div className="py-12 text-center text-slate-500 text-xs">Loading queue context...</div>
      </NavbarFrame>
    );
  }

  const role = user?.role;
  let queueTitle = 'Approvals Queue';
  let filteredLeaves = [];

  // Filter queue items matching the specific role's pipeline stage
  if (role === 'MED_OFFICER') {
    queueTitle = 'Health Centre Verification Queue';
    filteredLeaves = leaves.filter((l) => l.status === 'PENDING_HEALTH_CENTRE');
  } else if (role === 'WARDEN') {
    queueTitle = `Hostel Warden (${user.warden?.hostelName}) Queue`;
    filteredLeaves = leaves.filter((l) => l.status === 'PENDING_WARDEN');
  } else if (role === 'ADVISOR') {
    queueTitle = `Faculty Advisor Queue (CSE Department)`;
    filteredLeaves = leaves.filter((l) => l.status === 'PENDING_ADVISOR');
  } else if (role === 'HOD') {
    queueTitle = 'Department HOD Approvals Dashboard';
    filteredLeaves = leaves.filter((l) => l.status === 'PENDING_ADVISOR'); // HOD can act on Advisor stage as well
  } else {
    filteredLeaves = leaves; // admin view
  }

  const suspiciousCount = filteredLeaves.filter(
    (l) => l.documents?.[0]?.aiAnalysis?.status === 'SUSPICIOUS'
  ).length;

  const urgentCount = filteredLeaves.filter((l) => l.isEscalated).length;

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{queueTitle}</h1>
          <p className="text-slate-400 text-xs mt-1">
            Role: {role?.replace(/_/g, ' ')} &bull; Inspect files and process student applications
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Dashboard Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leaves In Queue</span>
              <p className="text-3xl font-extrabold text-white">{filteredLeaves.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 flex items-center justify-center text-medical-400">
              <ClipboardCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suspicious Flares</span>
              <p className="text-3xl font-extrabold text-red-400">{suspiciousCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Urgent Escalations</span>
              <p className="text-3xl font-extrabold text-amber-400">{urgentCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Approval List Table */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-medical-400" />
            <h2 className="font-bold text-white text-base">Pending Action List</h2>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Excellent! No pending applications found in your queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-4">Student Name</th>
                    <th className="pb-3">Roll Number</th>
                    <th className="pb-3">Leave Dates</th>
                    <th className="pb-3">Illness Reason</th>
                    <th className="pb-3">AI Verify Score</th>
                    <th className="pb-3">Urgency</th>
                    <th className="pb-3 pr-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredLeaves.map((l) => {
                    const aiScore = l.documents?.[0]?.aiAnalysis?.confidenceScore;
                    const aiStatus = l.documents?.[0]?.aiAnalysis?.status;
                    return (
                      <tr key={l.id} className="hover:bg-slate-800/20 transition group">
                        <td className="py-4 pl-4 font-semibold text-white">
                          {l.student?.user?.name}
                          {l.isProxy && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-bold uppercase">Proxy</span>}
                        </td>
                        <td className="py-4 font-mono text-slate-400">{l.student?.rollNumber}</td>
                        <td className="py-4 font-medium">
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 truncate max-w-[150px] text-slate-400">{l.reason}</td>
                        <td className="py-4">
                          {aiScore !== undefined ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono font-bold ${aiStatus === 'SUSPICIOUS' ? 'text-red-400' : 'text-emerald-400'}`}>
                                {(aiScore * 100).toFixed(0)}%
                              </span>
                              <span className="text-[10px] text-slate-500">({aiStatus})</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-medium italic">Pending AI</span>
                          )}
                        </td>
                        <td className="py-4">
                          {l.isEscalated ? (
                            <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase text-[9px] animate-pulse">Escalated</span>
                          ) : (
                            <span className="text-slate-500 font-medium">Normal</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <Link
                            href={`/approver/leave/${l.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-medical-500/40 hover:bg-medical-500/10 text-medical-400 font-semibold transition"
                          >
                            Review <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </NavbarFrame>
  );
}
