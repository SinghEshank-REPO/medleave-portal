'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { FileText, Plus, CheckCircle2, Clock, XCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

export default function StudentDashboard() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [leavesList, attendanceStats] = await Promise.all([
          api.getLeaves(),
          api.getAttendanceStats()
        ]);
        setLeaves(leavesList);
        setAttendance(attendanceStats);
      } catch (err: any) {
        console.error(err);
        setError('Failed to retrieve dashboard details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactNode> = {
      APPROVED: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">Approved</span>,
      REJECTED: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase">Rejected</span>,
      CLARIFICATION_REQUESTED: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">Clarification Req</span>,
      PENDING_HEALTH_CENTRE: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">At Health Centre</span>,
      PENDING_WARDEN: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase">At Warden</span>,
      PENDING_FACULTY: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase">At Faculty</span>
    };
    return badges[status] || <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[10px] font-bold uppercase">{status}</span>;
  };

  const approvedLeaves = leaves.filter(l => l.status === 'APPROVED');
  const pendingLeaves = leaves.filter(l => ['PENDING_HEALTH_CENTRE', 'PENDING_WARDEN', 'PENDING_FACULTY'].includes(l.status));

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Dashboard</h1>
            <p className="text-slate-400 text-xs mt-1">Review your attendance condonation figures and leave requests</p>
          </div>
          <Link
            href="/student/apply"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-medical-600 to-indigo-600 hover:from-medical-500 hover:to-indigo-500 text-white text-xs font-semibold hover:scale-[1.01] transition active:scale-[0.99] glow-medical"
          >
            <Plus className="w-4 h-4" /> Apply For Medical Leave
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Dashboard Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims</span>
              <p className="text-3xl font-extrabold text-white">{leaves.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 flex items-center justify-center text-medical-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Leaves</span>
              <p className="text-3xl font-extrabold text-emerald-400">{approvedLeaves.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
              <p className="text-3xl font-extrabold text-cyan-400">{pendingLeaves.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Attendance Condonation Mapping Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-medical-400" />
            <h2 className="font-bold text-white text-base">Course-wise Attendance & Condonation Impact</h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Computing attendance statistics...</div>
          ) : attendance.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No course enrollments discovered.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendance.map((c) => {
                const meetsCriteria = c.condonedAttendance >= 75;
                const wasDeficient = c.rawAttendance < 75;
                return (
                  <div key={c.courseCode} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-medical-400 font-mono tracking-wider bg-medical-500/10 px-2 py-0.5 rounded">{c.courseCode}</span>
                        <h4 className="text-xs font-bold text-white mt-1.5 truncate max-w-[150px]">{c.courseName}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500">{c.credits} Credits</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Raw Attendance */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Raw Attendance</span>
                          <span>{c.rawAttendance}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-500 transition-all" style={{ width: `${c.rawAttendance}%` }} />
                        </div>
                      </div>

                      {/* Condoned Attendance */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                          <span className="flex items-center gap-1">Condoned Attendance <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">+{c.condonedAbsences} classes</span></span>
                          <span className="text-white">{c.condonedAttendance}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${meetsCriteria ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${c.condonedAttendance}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Status flags */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-slate-500">Classes: {c.present}/{c.totalClasses}</span>
                      {wasDeficient && meetsCriteria ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded">Condoned to Safe (&gt;=75%)</span>
                      ) : meetsCriteria ? (
                        <span className="text-slate-400 font-medium bg-slate-800/40 px-2 py-0.5 rounded">Safe Attendance</span>
                      ) : (
                        <span className="text-red-400 font-bold bg-red-500/5 px-2 py-0.5 rounded flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Still Deficient</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leave Applications History */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-medical-400" />
            <h2 className="font-bold text-white text-base">Leave Applications Log</h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Retrieving applications...</div>
          ) : leaves.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No leave applications discovered. Click the button above to apply.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-4">Application ID</th>
                    <th className="pb-3">Leave Dates</th>
                    <th className="pb-3">Illness Category</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Review State</th>
                    <th className="pb-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/20 transition group">
                      <td className="py-4 pl-4 font-mono text-slate-400 group-hover:text-white">#{l.id.substring(0, 8)}</td>
                      <td className="py-4 font-medium text-white">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 uppercase tracking-wider text-[10px] font-bold text-medical-400">{l.category.replace(/_/g, ' ')}</td>
                      <td className="py-4 truncate max-w-[200px] text-slate-400">{l.reason}</td>
                      <td className="py-4">{getStatusBadge(l.status)}</td>
                      <td className="py-4 pr-4 text-right">
                        <Link
                          href={`/student/leave/${l.id}`}
                          className="px-3 py-1.5 rounded-lg border border-white/5 hover:border-medical-500/40 hover:bg-medical-500/10 text-medical-400 font-medium transition"
                        >
                          View Details
                        </Link>
                      </td>
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
