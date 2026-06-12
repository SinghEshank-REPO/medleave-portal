'use client';

import { useState, useEffect } from 'react';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { CheckSquare, CheckCircle, XCircle, FileText, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function FacultyDashboard() {
  const [pendingClasses, setPendingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const handleCondonation = async (id: string, action: 'CONDONE' | 'REJECT') => {
    setActionLoadingId(id);
    try {
      await api.condoneClass(id, action);
      // Remove class from queue state
      setPendingClasses((prev) => prev.filter((item) => item.id !== id));
      alert(`Class absence has been successfully ${action.toLowerCase()}d.`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Action failed.');
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
            Review and condone class-level absences covered by approved student medical leaves
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
              {pendingClasses.map((item) => (
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
                        <span className="text-white font-semibold">{item.leaveApplication.student.user.name}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Roll Number:</span>
                        <span className="text-white font-mono">{item.leaveApplication.student.rollNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Date of Absence:</span>
                        <span className="text-white font-semibold">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Medical leave context */}
                    <div className="text-xs text-slate-400 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Approved Medical Leave Reason:</span>
                      <p className="p-2 border border-white/5 rounded-lg bg-slate-900/60 leading-relaxed max-h-20 overflow-y-auto italic">
                        "{item.leaveApplication.reason}"
                      </p>
                    </div>
                  </div>

                  {/* One-Click Action buttons */}
                  <div className="flex gap-3 pt-3 border-t border-slate-800/60 text-xs">
                    <button
                      onClick={() => handleCondonation(item.id, 'REJECT')}
                      disabled={actionLoadingId === item.id}
                      className="flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleCondonation(item.id, 'CONDONE')}
                      disabled={actionLoadingId === item.id}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-4 h-4" /> Condone Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NavbarFrame>
  );
}
