'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import NavbarFrame from '@/components/NavbarFrame';
import { api, getAssetUrl } from '@/lib/api';
import { 
  Users, CheckCircle2, FileText, Calendar, ExternalLink, 
  X, ShieldCheck, Search, Info, AlertCircle 
} from 'lucide-react';

export default function HodDashboard() {
  const searchParams = useSearchParams();
  const highlightLeaveId = searchParams.get('leaveId');

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected leave detail modal
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

  useEffect(() => {
    async function loadLeaves() {
      try {
        const list = await api.getLeaves();
        setLeaves(list);

        if (highlightLeaveId) {
          const match = list.find((l: any) => l.id === highlightLeaveId);
          if (match) setSelectedLeave(match);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load department student leaves.');
      } finally {
        setLoading(false);
      }
    }
    loadLeaves();
  }, [highlightLeaveId]);

  const filteredLeaves = leaves.filter((l) => {
    const query = searchQuery.toLowerCase();
    const name = l.student?.user?.name?.toLowerCase() || '';
    const roll = l.student?.rollNumber?.toLowerCase() || '';
    const status = l.status?.toLowerCase() || '';
    return name.includes(query) || roll.includes(query) || status.includes(query);
  });

  const approvedLeavesCount = leaves.filter((l) => l.status === 'APPROVED').length;

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Students Approved & Leave Records</h1>
          <p className="text-slate-400 text-xs mt-1">
            HOD Department Monitoring Dashboard &bull; Read-only student medical leave records & notifications
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Dashboard Stat Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Department Leaves</span>
              <p className="text-3xl font-extrabold text-white">{leaves.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 flex items-center justify-center text-medical-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Leaves</span>
              <p className="text-3xl font-extrabold text-emerald-400">{approvedLeavesCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Students Approved Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white text-base">Students Approved & Processed List</h2>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name or roll..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-medical-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading department student leaves...</div>
          ) : filteredLeaves.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No student leave records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-4">Student Name</th>
                    <th className="pb-3">Roll Number</th>
                    <th className="pb-3">Approved Leave Period</th>
                    <th className="pb-3">Illness Reason</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-4 text-right">Student Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredLeaves.map((l) => {
                    const isApproved = l.status === 'APPROVED';
                    const isRejected = l.status === 'REJECTED';
                    return (
                      <tr key={l.id} className="hover:bg-slate-800/20 transition group">
                        <td className="py-4 pl-4 font-semibold text-white">
                          {l.student?.user?.name}
                          {l.isProxy && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-bold uppercase">Proxy</span>}
                        </td>
                        <td className="py-4 font-mono text-slate-400">{l.student?.rollNumber}</td>
                        <td className="py-4 font-medium text-emerald-400">
                          {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 truncate max-w-[180px] text-slate-400">{l.reason}</td>
                        <td className="py-4">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase">
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                              In Review
                            </span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <button
                            onClick={() => setSelectedLeave(l)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-medical-500/40 hover:bg-medical-500/10 text-medical-400 font-semibold transition"
                          >
                            View Details
                          </button>
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

      {/* Full Student Details Modal for HOD */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-medical-500/10 flex items-center justify-center text-medical-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Student Approved Leave Details</h3>
                  <p className="text-xs text-slate-400">Department Monitoring Record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Student Header Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Student Name</span>
                  <p className="text-white font-bold text-sm mt-0.5">{selectedLeave.student?.user?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Roll Number</span>
                  <p className="text-medical-400 font-mono font-bold text-sm mt-0.5">{selectedLeave.student?.rollNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Approved Leave Dates</span>
                  <p className="text-emerald-400 font-bold text-xs mt-0.5">
                    {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Department</span>
                  <p className="text-white font-medium mt-0.5">{selectedLeave.student?.department?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Residential Hostel</span>
                  <p className="text-white font-medium mt-0.5">
                    {selectedLeave.student?.isResidential ? selectedLeave.student?.hostelName : 'Day Scholar'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Illness Category</span>
                  <p className="text-amber-400 font-bold uppercase text-[10px] mt-0.5">
                    {selectedLeave.category?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Leave Reason */}
              <div className="space-y-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Reason Given for Leave:</span>
                <p className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-slate-200 leading-relaxed italic">
                  "{selectedLeave.reason}"
                </p>
              </div>

              {/* Proxy Info if proxy */}
              {selectedLeave.isProxy && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Proxy Submission Info:
                  </div>
                  <div>Submitted by: <span className="font-semibold text-white">{selectedLeave.proxyName}</span> ({selectedLeave.proxyRelationship})</div>
                </div>
              )}

              {/* Approval Trail */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Approval Log:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Doctor (Health Centre): Approved
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Warden Approval: Approved
                  </div>
                </div>
              </div>

              {/* Certificates Attached */}
              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Medical Certificate Documents:</span>
                {selectedLeave.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLeave.documents.map((doc: any) => {
                      const fileUrl = getAssetUrl(doc.fileUrl);
                      const ai = doc.aiAnalysis;
                      return (
                        <div key={doc.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-medical-400" />
                              <span className="text-white font-medium">{doc.originalName || 'Medical Certificate'}</span>
                            </div>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-medical-500/10 border border-medical-500/20 text-medical-400 hover:bg-medical-500/20 transition font-bold text-[10px] inline-flex items-center gap-1"
                            >
                              View Certificate <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {ai && (
                            <div className="p-2 rounded-lg bg-slate-950/40 text-[10px] space-y-1 text-slate-300">
                              <div className="flex justify-between">
                                <span>Doctor/Hospital Extracted:</span>
                                <span className="text-white font-semibold">{ai.doctorName} ({ai.hospitalName})</span>
                              </div>
                              <div className="flex justify-between">
                                <span>AI Visual Scan Score:</span>
                                <span className="text-emerald-400 font-mono font-bold">{Math.round((ai.confidenceScore || 0) * 100)}/100</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-slate-500 italic p-3 border border-white/5 rounded-xl text-center">No certificate files attached.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </NavbarFrame>
  );
}
