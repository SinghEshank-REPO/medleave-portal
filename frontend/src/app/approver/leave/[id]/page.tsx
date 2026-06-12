'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { 
  ArrowLeft, FileText, CheckCircle2, Clock, XCircle, AlertCircle, 
  Send, ShieldAlert, Calendar, Check, X, HelpCircle, MessageSquare 
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApproverLeaveReviewPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [leave, setLeave] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [commentContent, setCommentContent] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [profile, details] = await Promise.all([
        api.me(),
        api.getLeaveDetails(id)
      ]);
      setUser(profile);
      setLeave(details);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'CLARIFY') => {
    setActionLoading(true);
    try {
      await api.reviewLeave(id, action, remarks);
      alert(`Application has been successfully ${action.toLowerCase()}d.`);
      router.push('/approver/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommentLoading(true);
    try {
      await api.addComment(id, commentContent);
      setCommentContent('');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to send comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <NavbarFrame>
        <div className="py-12 text-center text-slate-500 text-xs">Loading application data...</div>
      </NavbarFrame>
    );
  }

  if (error || !leave) {
    return (
      <NavbarFrame>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{error || 'Leave application not found.'}</div>
      </NavbarFrame>
    );
  }

  const doc = leave.documents[0];
  const ai = doc?.aiAnalysis;
  const studentUser = leave.student?.user;

  // Highlight mismatches
  const nameMismatch = ai && studentUser && ai.patientName && !studentUser.name.toLowerCase().includes(ai.patientName.toLowerCase());

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Back Link */}
        <Link href="/approver/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header Title */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Review Leave Application</h1>
            <p className="text-slate-400 text-xs mt-1">
              Student: <span className="text-slate-200 font-medium">{studentUser?.name} ({leave.student?.rollNumber})</span> &bull; Status: {leave.status}
            </p>
          </div>
          {leave.isEscalated && (
            <span className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase animate-pulse">SLA Escalation Flagged</span>
          )}
        </div>

        {/* Layout: Main contents & Side inspection panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Center Columns: Document Review & Mapped classes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student metadata */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm">Student Demographics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-400">
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Roll Number</p>
                  <p className="font-semibold text-white mt-0.5">{leave.student?.rollNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Department</p>
                  <p className="font-semibold text-white mt-0.5">{leave.student?.department?.code}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Residential Status</p>
                  <p className="font-semibold text-white mt-0.5">{leave.student?.isResidential ? `Hostel: ${leave.student?.hostelName} (Room ${leave.student?.roomNumber})` : 'Day Scholar'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Parent Contact</p>
                  <p className="font-semibold text-white mt-0.5">{leave.student?.parentContact}</p>
                </div>
              </div>

              {leave.isProxy && (
                <div className="p-3 rounded-lg border border-white/5 bg-slate-900/30">
                  <span className="font-semibold text-slate-400">Proxy submission details: </span>
                  <span className="text-white">Submitted by {leave.proxyName} (Relationship: {leave.proxyRelationship})</span>
                </div>
              )}
            </div>

            {/* Document Viewer Frame */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-white text-sm flex justify-between items-center">
                <span>Certificate Attachment</span>
                <span className="text-xs text-slate-500 font-mono">Format: {doc?.fileType}</span>
              </h3>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 flex flex-col items-center">
                {doc?.fileType === 'PDF' ? (
                  <div className="w-full text-center py-8">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">PDF Document attachment uploaded.</p>
                    <a
                      href={doc.fileUrl.startsWith('/') ? `http://localhost:5000${doc.fileUrl}` : doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-medical-500/50 text-medical-400 rounded-lg text-xs font-semibold transition"
                    >
                      Open PDF in New Window
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    <img
                      src={doc?.fileUrl?.startsWith('/') ? `http://localhost:5000${doc.fileUrl}` : doc?.fileUrl}
                      alt="Medical certificate preview"
                      className="max-h-96 object-contain rounded border border-slate-800 mx-auto shadow-lg"
                    />
                    <a
                      href={doc?.fileUrl?.startsWith('/') ? `http://localhost:5000${doc.fileUrl}` : doc?.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 border border-slate-800 text-center rounded-lg hover:border-medical-500/40 text-medical-400 text-xs font-semibold block transition"
                    >
                      View Original Full-Scale Image
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Mapped Classes list */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
              <h3 className="font-bold text-white text-sm">Mapped Class Absences ({leave.missedClasses.length})</h3>
              {leave.missedClasses.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs">No lecture slots fell during this leave period.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {leave.missedClasses.map((mc: any) => (
                    <div key={mc.id} className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-medical-400 font-mono bg-medical-500/10 px-1.5 py-0.5 rounded">{mc.course.code}</span>
                        <h5 className="text-xs font-bold text-white mt-1.5 truncate">{mc.course.name}</h5>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(mc.date).toLocaleDateString()} &bull; {mc.slotName}</p>
                      </div>
                      <div className="text-right mt-2 pt-2 border-t border-slate-800/40">
                        <span className="text-[9px] uppercase font-bold text-slate-500">Status: {mc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments thread */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-medical-400" />
                Comments & Clarifications Thread
              </h3>

              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-2 text-xs">
                {leave.comments.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">No comments recorded. Type a response to ask the student for details.</div>
                ) : (
                  leave.comments.map((c: any) => {
                    const isSelf = c.user.id === user.id;
                    return (
                      <div key={c.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`p-3.5 rounded-2xl leading-relaxed ${isSelf ? 'bg-medical-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                          {c.content}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 pl-1">
                          {c.user.name} ({c.user.role}) &bull; {new Date(c.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-3 pt-3 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Ask for clarification or type reply..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-medical-500"
                />
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="px-4 py-3 rounded-xl bg-medical-600 hover:bg-medical-500 text-white flex items-center justify-center transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: AI verification panel & Decisions box */}
          <div className="space-y-6">
            
            {/* AI OCR Results */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-medical-400" />
                  AI OCR Findings
                </h3>
                {ai && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ai.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {ai.status}
                  </span>
                )}
              </div>

              {!ai ? (
                <div className="py-6 text-center text-slate-500 italic">No AI Analysis reports compiled.</div>
              ) : (
                <div className="space-y-3.5">
                  <div className="pb-2.5 border-b border-slate-800/60">
                    <p className="text-slate-500 text-[10px]">Patient Name Extracted</p>
                    <p className={`font-semibold mt-0.5 truncate ${nameMismatch ? 'text-red-400 font-bold' : 'text-white'}`}>{ai.patientName || 'N/A'}</p>
                    {nameMismatch && (
                      <p className="text-[10px] text-red-400 font-medium mt-1 bg-red-500/5 p-1.5 rounded border border-red-500/10 leading-normal flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Student name is "{studentUser.name}" but AI extracted patient name "{ai.patientName}". Mismatch detected.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-800/60">
                    <div>
                      <p className="text-slate-500 text-[10px]">Hospital</p>
                      <p className="font-semibold text-white mt-0.5 truncate">{ai.hospitalName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">Doctor</p>
                      <p className="font-semibold text-white mt-0.5 truncate">{ai.doctorName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pb-2.5 border-b border-slate-800/60">
                    <p className="text-slate-500 text-[10px]">Extracted Diagnosis</p>
                    <p className="font-semibold text-white mt-0.5">{ai.diagnosis || 'N/A'}</p>
                  </div>

                  <div className="pb-2.5 border-b border-slate-800/60">
                    <p className="text-slate-500 text-[10px]">Recommended Rest Days</p>
                    <p className="font-semibold text-white mt-0.5">{ai.restDays ? `${ai.restDays} Days` : 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[10px]">OCR Confidence Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${ai.confidenceScore > 0.75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${ai.confidenceScore * 100}%` }} />
                      </div>
                      <span className="font-bold text-white text-[10px] font-mono">{(ai.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {ai.status === 'SUSPICIOUS' && (
                    <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 space-y-1 text-[10px] leading-relaxed">
                      <p className="font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Suspicion Alerts:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {JSON.parse(ai.fraudAlerts || '[]').map((alert: string, idx: number) => (
                          <li key={idx}>{alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Decision Submission Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm">Submit Decision</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Remarks / Remarks history</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter approval details, reject reasons, or what clarification is required..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-medical-500 placeholder-slate-600 resize-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleAction('APPROVE')}
                  disabled={actionLoading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Approve Leave
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction('CLARIFY')}
                    disabled={actionLoading}
                    className="py-2.5 rounded-xl border border-slate-850 hover:bg-slate-800/40 text-slate-300 font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                  >
                    <HelpCircle className="w-4 h-4" /> Clarify
                  </button>
                  <button
                    onClick={() => handleAction('REJECT')}
                    disabled={actionLoading}
                    className="py-2.5 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </NavbarFrame>
  );
}
