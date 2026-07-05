'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { 
  ArrowLeft, FileText, CheckCircle2, Clock, XCircle, AlertCircle, 
  Send, ShieldCheck, Calendar, Download, MessageSquare 
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentLeaveDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const [leave, setLeave] = useState<any>(null);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);

  const loadLeaveDetails = async () => {
    try {
      const data = await api.getLeaveDetails(id);
      setLeave(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch leave details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveDetails();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommentLoading(true);
    try {
      await api.addComment(id, commentContent);
      setCommentContent('');
      await loadLeaveDetails(); // refresh details with new comment
    } catch (err: any) {
      console.error(err);
      alert('Failed to send comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const reportData = await api.getReport(id);
      setReport(reportData);
      
      // Simple print mock
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      console.error(err);
      alert('Failed to download report.');
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      APPROVED: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      REJECTED: 'text-red-400 border-red-500/20 bg-red-500/5',
      CLARIFICATION_REQUESTED: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      PENDING_HEALTH_CENTRE: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      PENDING_WARDEN: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
      PENDING_FACULTY: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
    };
    return colors[status] || 'text-slate-400 border-slate-500/20 bg-slate-500/5';
  };

  const doc = leave.documents[0];
  const ai = doc?.aiAnalysis;

  return (
    <NavbarFrame>
      {/* Printable Report Overlay (Hidden by default, shown during window.print()) */}
      {report && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-10 z-50 overflow-y-auto text-sm space-y-6">
          <div className="text-center pb-4 border-b border-black">
            <h1 className="text-xl font-bold">{report.title}</h1>
            <p className="text-xs text-gray-500 mt-1">Leave Condonation Verification Slip</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Student Name:</strong> {report.studentName}</div>
            <div><strong>Roll Number:</strong> {report.rollNumber}</div>
            <div><strong>Department:</strong> {report.department}</div>
            <div><strong>Hostel Block:</strong> {report.hostel}</div>
            <div><strong>Medical Leave Dates:</strong> {report.dateRange}</div>
            <div><strong>Illness Category:</strong> {report.illnessCategory}</div>
          </div>
          <div>
            <strong>Medical Reason:</strong>
            <p className="p-2 border rounded mt-1 bg-gray-50">{report.reason}</p>
          </div>
          <div>
            <strong>Approvals Completed:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Health Centre Status: {report.healthCentreStatus}</li>
              <li>Hostel Warden Status: {report.wardenStatus}</li>
              <li>Faculty Status: {report.facultyStatus}</li>
            </ul>
          </div>
          <div>
            <strong>Condoned Classes Summary:</strong>
            <table className="w-full border-collapse mt-2 border text-xs">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-2 border text-left">Course</th>
                  <th className="p-2 border text-left">Date</th>
                  <th className="p-2 border text-left">Slot</th>
                  <th className="p-2 border text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.missedClasses.map((mc: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 border">{mc.courseCode} ({mc.courseName})</td>
                    <td className="p-2 border">{mc.date}</td>
                    <td className="p-2 border">{mc.slot}</td>
                    <td className="p-2 border text-right font-bold">{mc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-8 flex justify-between text-xs">
            <div>Prepared Date: {new Date().toLocaleDateString()}</div>
            <div>System Verified Certificate Signature: {ai?.id?.substring(0,8) || 'N/A'}</div>
          </div>
        </div>
      )}

      <div className="space-y-6 print:hidden">
        {/* Back Link */}
        <div className="flex justify-between items-center">
          <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          {leave.status === 'APPROVED' && (
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-white/5 hover:border-medical-500/40 text-medical-400 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" /> Print Approval Slip
            </button>
          )}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Center: Details & Comments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${getStatusColor(leave.status)}`}>
                  {leave.status.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: #{leave.id.substring(0, 8)}</span>
              </div>

              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Medical Leave: {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                </h1>
                <div className="flex items-center gap-2 text-slate-400 text-xs mt-1.5 uppercase font-bold tracking-wider">
                  <Calendar className="w-4 h-4 text-medical-400" /> Category: {leave.category.replace(/_/g, ' ')}
                </div>
              </div>

              {leave.isProxy && (
                <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/30 text-xs">
                  <span className="font-semibold text-slate-400">Proxy submission details: </span>
                  <span className="text-white">Submitted by {leave.proxyName} ({leave.proxyRelationship})</span>
                </div>
              )}

              <div className="space-y-1.5 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason Details</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{leave.reason}</p>
              </div>

              {leave.remarks && (
                <div className="p-4 rounded-xl border border-white/5 bg-amber-500/5 text-amber-400 text-xs leading-normal">
                  <strong>Latest Approver Remark:</strong> {leave.remarks}
                </div>
              )}

              {leave.status === 'CLARIFICATION_REQUESTED' && (
                <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-amber-400 leading-normal">
                    <span className="font-bold block mb-1">Clarification Requested by Approver</span>
                    Please reply in the comment thread below or update your details, then click "Re-submit" to return it to the University Health Centre.
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await api.reviewLeave(id, 'APPROVE', 'Clarification submitted by student.');
                        alert('Your application has been re-submitted for review.');
                        await loadLeaveDetails();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.message || 'Failed to re-submit.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-950/20 whitespace-nowrap self-start sm:self-center"
                  >
                    Re-Submit for Review
                  </button>
                </div>
              )}
            </div>

            {/* Mapped Missed Classes Condonation List */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-white text-sm mb-4">Mapped Class Absences ({leave.missedClasses.length})</h3>
              {leave.missedClasses.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">No lecture timetable slots fell during this leave period.</div>
              ) : (
                <div className="space-y-2.5">
                  {leave.missedClasses.map((mc: any) => (
                    <div key={mc.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/40 border border-white/5">
                      <div>
                        <span className="text-[10px] font-bold text-medical-400 font-mono tracking-wider">{mc.course.code}</span>
                        <h5 className="text-xs font-bold text-white mt-1">{mc.course.name}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(mc.date).toLocaleDateString()} &bull; {mc.slotName}</p>
                      </div>
                      <div>
                        {mc.status === 'CONDONED' ? (
                          <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-1 rounded-full uppercase">Condoned</span>
                        ) : mc.status === 'REJECTED' ? (
                          <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-2 py-1 rounded-full uppercase">Rejected</span>
                        ) : (
                          <span className="text-slate-500 text-[10px] font-semibold bg-slate-800 px-2 py-1 rounded-full uppercase">Pending Approved</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clarification & Commenting Center */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-medical-400" />
                Comments & Clarifications Thread
              </h3>

              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-2">
                {leave.comments.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">No comments recorded. Use the box below to ask questions or clarify details.</div>
                ) : (
                  leave.comments.map((c: any) => {
                    const isSelf = c.user.id === leave.student.userId;
                    return (
                      <div key={c.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isSelf ? 'bg-medical-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                          {c.content}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 pl-1">
                          {c.user.name} &bull; {new Date(c.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-3 pt-3 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Type a comment or response..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-medical-500"
                />
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="px-4 py-3 rounded-xl bg-medical-600 hover:bg-medical-500 text-white flex items-center justify-center transition active:scale-95 disabled:opacity-50"
                  title="Send comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: AI Analysis & Sequential Timeline */}
          <div className="space-y-6">
            {/* Sequential Timeline Progress Tracker */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
              <h3 className="font-bold text-white text-sm pb-3 border-b border-slate-800/60">Sequential Condonation Path</h3>
              
              <div className="space-y-6 relative pl-6 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {/* 1. Health Centre */}
                <div className="relative">
                  <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center ring-4 ring-[#0a0f1d] ${leave.healthCentreApproved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h5 className="font-bold text-white">University Health Centre</h5>
                    <p className="text-[10px] text-slate-500">Status: {leave.healthCentreApproved ? 'Approved/Verified' : 'Review Pending'}</p>
                  </div>
                </div>

                {/* 2. Warden */}
                {leave.student.isResidential && (
                  <div className="relative">
                    <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center ring-4 ring-[#0a0f1d] ${leave.wardenApproved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <h5 className="font-bold text-white">Hostel Warden ({leave.student.hostelName})</h5>
                      <p className="text-[10px] text-slate-500">Status: {leave.wardenApproved ? 'Approved' : 'Pending Review'}</p>
                    </div>
                  </div>
                )}

                {/* 3. Faculty */}
                <div className="relative">
                  <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center ring-4 ring-[#0a0f1d] ${leave.facultyApproved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h5 className="font-bold text-white">Faculty</h5>
                    <p className="text-[10px] text-slate-500">Status: {leave.facultyApproved ? 'Fully Approved' : 'Pending Review'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI OCR Verification Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-medical-400" />
                  AI OCR Verification
                </h3>
                {ai && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ai.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {ai.status}
                  </span>
                )}
              </div>

              {!ai ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-center text-slate-500 text-[11px] leading-relaxed">
                  <Clock className="w-5 h-5 text-medical-400 animate-spin mx-auto mb-2" />
                  AI analysis is executing in the background. Refresh in a few seconds...
                </div>
              ) : (
                <div className="space-y-3.5 text-xs text-left">
                  <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-800/60">
                    <div>
                      <p className="text-slate-500 text-[10px]">Patient Name</p>
                      <p className="font-semibold text-white mt-0.5 truncate">{ai.patientName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">Doctor Name</p>
                      <p className="font-semibold text-white mt-0.5 truncate">{ai.doctorName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-800/60">
                    <div>
                      <p className="text-slate-500 text-[10px]">Hospital / Clinic</p>
                      <p className="font-semibold text-white mt-0.5 truncate">{ai.hospitalName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">AI Rest Recommendation</p>
                      <p className="font-semibold text-white mt-0.5">{ai.restDays ? `${ai.restDays} Days` : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pb-2.5 border-b border-slate-800/60">
                    <p className="text-slate-500 text-[10px]">Extracted Diagnosis</p>
                    <p className="font-semibold text-white mt-0.5">{ai.diagnosis || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[10px]">Authenticity Confidence</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${ai.confidenceScore > 0.75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${ai.confidenceScore * 100}%` }} />
                      </div>
                      <span className="font-bold text-white text-[11px] font-mono">{(ai.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Suspicion triggers if any */}
                  {ai.status === 'SUSPICIOUS' && (
                    <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 space-y-1 text-[11px] leading-relaxed">
                      <p className="font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Suspicious Triggers Flagged:</p>
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

            {/* Document Preview File Box */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3.5">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-medical-400" />
                Certificate Attachment
              </h3>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300 truncate max-w-[120px]" title={doc.originalName}>{doc.originalName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{doc.fileType}</span>
                </div>
                <a
                  href={doc.fileUrl.startsWith('/') ? `http://localhost:5000${doc.fileUrl}` : doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg border border-white/5 hover:border-medical-500/40 hover:bg-medical-500/10 text-medical-400 font-semibold flex items-center justify-center gap-2 transition"
                >
                  View Original Document
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavbarFrame>
  );
}
