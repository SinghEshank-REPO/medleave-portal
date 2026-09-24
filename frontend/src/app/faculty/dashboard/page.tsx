'use client';

import { useState, useEffect } from 'react';
import NavbarFrame from '@/components/NavbarFrame';
import { api, getAssetUrl } from '@/lib/api';
import { 
  CheckSquare, CheckCircle, Eye, Calendar, Clock, 
  FileText, ExternalLink, X, ShieldCheck, User, Brain, AlertCircle 
} from 'lucide-react';

export default function FacultyDashboard() {
  const [pendingClasses, setPendingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Review modal state
  const [reviewItem, setReviewItem] = useState<any | null>(null);

  // Success Toast / Modal State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCondonations = async () => {
    try {
      const list = await api.getPendingCondonations();
      setPendingClasses(list);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load pending condonation requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondonations();
  }, []);

  const handleCondone = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.condoneClass(id, 'CONDONE');
      // Remove class from queue state
      setPendingClasses((prev) => prev.filter((item) => item.id !== id));
      // Show exact requested pop up message
      setToastMessage("Attendence updated on webportal.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to condone class.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Faculty Condonation Panel</h1>
          <p className="text-slate-400 text-xs mt-1">
            Review student details and condone class-level absences covered by doctor & warden approved medical leaves
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Dashboard Queue Summary */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between max-w-sm">
          <div className="space-y-2 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absences Pending Review</span>
            <p className="text-3xl font-extrabold text-white">{pendingClasses.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-medical-500/10 flex items-center justify-center text-medical-400">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Condonations Queue Grid */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-medical-400" />
            <h2 className="font-bold text-white text-base">Condonation Requests Queue</h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Retrieving pending condonations...</div>
          ) : pendingClasses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Excellent! No pending condonations in your course sections.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingClasses.map((item) => {
                const leave = item.leaveApplication;
                const student = leave?.student;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-slate-800 transition duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3.5">
                      {/* Header info */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-medical-400 font-mono tracking-wider bg-medical-500/10 px-2 py-0.5 rounded">
                            {item.course.code}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1.5">{item.course.name}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {item.slotName}
                        </span>
                      </div>

                      {/* Student details */}
                      <div className="p-3 rounded-xl bg-slate-950/20 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-400">
                          <span>Student Name:</span>
                          <span className="text-white font-semibold">{student?.user?.name}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Roll Number:</span>
                          <span className="text-white font-mono">{student?.rollNumber}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Date of Absence:</span>
                          <span className="text-white font-semibold">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Leave Period:</span>
                          <span className="text-medical-400 font-medium">
                            {new Date(leave?.startDate).toLocaleDateString()} to {new Date(leave?.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Medical leave context */}
                      <div className="text-xs text-slate-400 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Medical Leave Reason:</span>
                        <p className="p-2 border border-white/5 rounded-lg bg-slate-900/60 leading-relaxed max-h-16 overflow-y-auto italic text-slate-300">
                          "{leave?.reason}"
                        </p>
                      </div>
                    </div>

                    {/* Action buttons: Review & Condone (No Reject option as requested) */}
                    <div className="flex gap-3 pt-3 border-t border-slate-800/60 text-xs">
                      <button
                        onClick={() => setReviewItem(item)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 border border-white/10 transition"
                      >
                        <Eye className="w-4 h-4 text-medical-400" /> Review Details
                      </button>
                      <button
                        onClick={() => handleCondone(item.id)}
                        disabled={actionLoadingId === item.id}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 transition glow-medical"
                      >
                        <CheckCircle className="w-4 h-4" /> Condone Class
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Details Modal */}
      {reviewItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-medical-500/10 flex items-center justify-center text-medical-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Student Leave Details</h3>
                  <p className="text-xs text-slate-400">Course: {reviewItem.course.code} - {reviewItem.course.name}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Student Overview */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Student Name</span>
                  <p className="text-white font-bold text-sm mt-0.5">{reviewItem.leaveApplication?.student?.user?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Roll Number</span>
                  <p className="text-medical-400 font-mono font-bold text-sm mt-0.5">{reviewItem.leaveApplication?.student?.rollNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Approved Leave Dates</span>
                  <p className="text-white font-medium mt-0.5">
                    {new Date(reviewItem.leaveApplication?.startDate).toLocaleDateString()} to {new Date(reviewItem.leaveApplication?.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Illness Category</span>
                  <p className="text-amber-400 font-bold uppercase text-[10px] mt-0.5">
                    {reviewItem.leaveApplication?.category?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Leave Reason Given */}
              <div className="space-y-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Student's Reason for Leave:</span>
                <p className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-slate-200 leading-relaxed italic">
                  "{reviewItem.leaveApplication?.reason}"
                </p>
              </div>

              {/* Approvals Trail Status */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Verification & Approval Status:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Health Centre (Doctor): Verified
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Warden Sign-off: Approved
                  </div>
                </div>
              </div>

              {/* Certificates Attached */}
              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Uploaded Medical Certificate & Documents:</span>
                {reviewItem.leaveApplication?.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {reviewItem.leaveApplication.documents.map((doc: any) => {
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
                              className="px-3 py-1 rounded-lg bg-medical-500/10 border border-medical-500/20 text-medical-400 hover:bg-medical-500/20 transition font-bold text-[10px] inline-flex items-center gap-1"
                            >
                              View Certificate <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {ai && (
                            <div className="p-2 rounded-lg bg-slate-950/40 text-[10px] space-y-1 text-slate-300">
                              <div className="flex justify-between">
                                <span>AI Extracted Doctor/Hospital:</span>
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
                  <div className="text-slate-500 italic p-3 border border-white/5 rounded-xl text-center">No certificates found.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5 gap-3">
              <button
                onClick={() => setReviewItem(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = reviewItem.id;
                  setReviewItem(null);
                  handleCondone(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Condone Class Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Dialog Alert for Condonation (Exact text: "Attendence updated on webportal.") */}
      {toastMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-emerald-500/30 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Action Completed</h3>
              <p className="text-sm font-semibold text-emerald-400 mt-2">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:opacity-90 transition text-xs"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </NavbarFrame>
  );
}
