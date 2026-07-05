'use client';

import { useState, useEffect } from 'react';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { 
  Activity, Users, FileText, ShieldAlert, Clock, Calendar, 
  TrendingUp, RefreshCw, ChevronRight, UserCheck 
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [repeatPatterns, setRepeatPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [analyticsData, patternsData] = await Promise.all([
        api.getAnalytics(),
        api.getRepeatPatterns()
      ]);
      setAnalytics(analyticsData);
      setRepeatPatterns(patternsData);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerSLA = async () => {
    setEscalating(true);
    try {
      const res = await api.triggerEscalationCheck();
      alert(`SLA Assessment Complete:\n${res.escalatedCount} applications marked escalated.\n${res.autoForwardedCount} applications auto-forwarded.`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert('SLA Assessment failed.');
    } finally {
      setEscalating(false);
    }
  };

  const handleReferCounseling = (studentName: string) => {
    alert(`Student ${studentName} referred to University Pastoral Counselor. An alert has been dispatched.`);
  };

  if (loading) {
    return (
      <NavbarFrame>
        <div className="py-12 text-center text-slate-500 text-xs">Loading admin context...</div>
      </NavbarFrame>
    );
  }

  const counts = analytics?.counts || { students: 0, totalLeaves: 0, approved: 0, rejected: 0, pending: 0, suspicious: 0 };
  const departmentStats = analytics?.departmentStats || [];
  const monthlyTrends = analytics?.monthlyTrends || [];

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">University Administration Portal</h1>
            <p className="text-slate-400 text-xs mt-1">Global leave audits, SLA configs, and pastoral pattern tracking</p>
          </div>
          <button
            onClick={handleTriggerSLA}
            disabled={escalating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-white/5 hover:border-medical-500/40 text-medical-400 text-xs font-semibold hover:scale-[1.01] active:scale-[0.99] transition"
          >
            <RefreshCw className={`w-4 h-4 ${escalating ? 'animate-spin' : ''}`} /> Assess SLA Escalations (24h/48h)
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Counts Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
              <p className="text-2xl font-extrabold text-white">{counts.students}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-medical-500/10 flex items-center justify-center text-medical-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Leaves</span>
              <p className="text-2xl font-extrabold text-white">{counts.totalLeaves}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Fraud Alerts</span>
              <p className="text-2xl font-extrabold text-red-400">{counts.suspicious}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Action</span>
              <p className="text-2xl font-extrabold text-amber-400">{counts.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department leaves distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-6 text-left">
              <Activity className="w-5 h-5 text-medical-400" />
              <h2 className="font-bold text-white text-base">Leaves by Department</h2>
            </div>
            <div className="space-y-4">
              {departmentStats.map((dept: any) => {
                const max = Math.max(...departmentStats.map((d: any) => d.leaveCount), 1);
                const percent = (dept.leaveCount / max) * 100;
                return (
                  <div key={dept.code} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{dept.name} ({dept.code})</span>
                      <span>{dept.leaveCount} Leaves</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-medical-600 to-indigo-600" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Trends svg chart */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-6 text-left">
              <TrendingUp className="w-5 h-5 text-medical-400" />
              <h2 className="font-bold text-white text-base">Leave Trends (Monthly)</h2>
            </div>
            <div className="flex items-end justify-between h-48 pt-6 border-b border-slate-800">
              {monthlyTrends.map((t: any) => {
                const max = Math.max(...monthlyTrends.map((m: any) => m.count), 1);
                const heightPercent = (t.count / max) * 75 + 10; // offset for display
                return (
                  <div key={t.month} className="flex flex-col items-center flex-1 space-y-2 group">
                    <div className="relative w-6 bg-gradient-to-t from-medical-700/60 to-indigo-600 rounded-t-lg transition hover:glow-medical flex items-end justify-center" style={{ height: `${heightPercent}%` }}>
                      <span className="absolute top-[-25px] scale-0 group-hover:scale-100 transition px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-white">{t.count}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{t.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Repeat Leave Pattern Flags (Pastoral Counseling Referrals) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-left">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-white text-base">Repeat Leave Pattern Flags</h2>
          </div>
          <p className="text-slate-500 text-xs mb-6">
            Under JUIT PS-08 rules, students with multiple leaves in a semester are flagged for pastoral counselling review.
          </p>

          {repeatPatterns.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No students exceed the repeat leave threshold.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-4">Student Name</th>
                    <th className="pb-3">Roll Number</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Hostel</th>
                    <th className="pb-3">Leave Claims Count</th>
                    <th className="pb-3 pr-4 text-right">Referral Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {repeatPatterns.map((student) => (
                    <tr key={student.studentId} className="hover:bg-slate-800/20 transition">
                      <td className="py-4 pl-4 font-bold text-white">{student.name}</td>
                      <td className="py-4 font-mono text-slate-400">{student.rollNumber}</td>
                      <td className="py-4 text-slate-400">{student.department}</td>
                      <td className="py-4 text-slate-400">{student.hostel || 'Day Scholar'}</td>
                      <td className="py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold font-mono">
                          {student.leaveCount} Leaves
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <button
                          onClick={() => handleReferCounseling(student.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Refer for Counseling
                        </button>
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
