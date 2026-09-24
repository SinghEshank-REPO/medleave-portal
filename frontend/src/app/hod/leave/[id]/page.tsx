'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import NavbarFrame from '@/components/NavbarFrame';
import { api, getAssetUrl } from '@/lib/api';
import { 
  ArrowLeft, FileText, Calendar, User, ShieldCheck, 
  ExternalLink, Info, CheckCircle2, Clock 
} from 'lucide-react';

export default function HodLeaveDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [leave, setLeave] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDetails() {
      try {
        const data = await api.getLeaveDetails(id);
        setLeave(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load leave details.');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <NavbarFrame>
        <div className="py-12 text-center text-slate-500 text-xs">Loading student leave record...</div>
      </NavbarFrame>
    );
  }

  if (error || !leave) {
    return (
      <NavbarFrame>
        <div className="space-y-4">
          <Link
            href="/hod/dashboard"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Students Approved
          </Link>
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error || 'Leave record not found.'}
          </div>
        </div>
      </NavbarFrame>
    );
  }

  const student = leave.student;

  return (
    <NavbarFrame>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Back Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href="/hod/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Students Approved List
          </Link>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved Record
          </span>
        </div>

        {/* Page Title Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 border border-medical-500/20 flex items-center justify-center text-medical-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{student?.user?.name}</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Roll Number: {student?.rollNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Approved Leave Dates</span>
              <p className="text-emerald-400 font-bold text-sm mt-0.5">
                {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Department</span>
              <p className="text-white font-semibold mt-0.5">{student?.department?.name}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Residential Hostel</span>
              <p className="text-white font-semibold mt-0.5">
                {student?.isResidential ? student?.hostelName : 'Day Scholar'}
              </p>
            </div>
          </div>
        </div>

        {/* Leave Reason Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Reason Given For Leave:</span>
          <p className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-slate-200 leading-relaxed italic text-xs">
            "{leave.reason}"
          </p>
        </div>

        {/* Proxy Details if proxy */}
        {leave.isProxy && (
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Submitted by Proxy:
            </span>
            <p className="text-slate-300">Name: <span className="text-white font-bold">{leave.proxyName}</span> ({leave.proxyRelationship})</p>
          </div>
        )}

        {/* Verification Status */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Sequential Verification Log:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Health Centre (Doctor): Verified & Approved
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Hostel Warden: Approved
            </div>
          </div>
        </div>

        {/* Certificates & Documents */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Uploaded Medical Certificate & Attachments:</span>
          {leave.documents?.length > 0 ? (
            <div className="space-y-3">
              {leave.documents.map((doc: any) => {
                const fileUrl = getAssetUrl(doc.fileUrl);
                const ai = doc.aiAnalysis;
                return (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-medical-400" />
                        <span className="text-white font-semibold">{doc.originalName || 'Medical Certificate'}</span>
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-medical-500/10 border border-medical-500/20 text-medical-400 hover:bg-medical-500/20 transition font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        View Attachment <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {ai && (
                      <div className="p-3 rounded-xl bg-slate-950/40 text-slate-300 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Doctor & Hospital Extracted:</span>
                          <span className="text-white font-semibold">{ai.doctorName} ({ai.hospitalName})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Authenticity Score:</span>
                          <span className="text-emerald-400 font-mono font-bold">{Math.round((ai.confidenceScore || 0) * 100)}/100</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic p-4 border border-white/5 rounded-xl text-center">No certificates attached.</div>
          )}
        </div>
      </div>
    </NavbarFrame>
  );
}
