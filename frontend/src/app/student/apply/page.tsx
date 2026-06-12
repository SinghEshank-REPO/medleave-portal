'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { ArrowLeft, Upload, Loader2, FileText, CheckCircle } from 'lucide-react';

export default function ApplyLeavePage() {
  const router = useRouter();
  
  // State variables
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('FEVER_INFECTION');
  
  const [isProxy, setIsProxy] = useState(false);
  const [proxyName, setProxyName] = useState('');
  const [proxyRelationship, setProxyRelationship] = useState('Parent');
  
  const [startOption, setStartOption] = useState('FULL');
  const [endOption, setEndOption] = useState('FULL');
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    
    if (selectedFile.type && !allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF, PNG, and JPG files are allowed.');
      return false;
    } else if (!selectedFile.type && fileExtension && !allowedExtensions.includes(fileExtension)) {
      setError('Only PDF, PNG, and JPG files are allowed.');
      return false;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return false;
    }

    setError('');
    setFile(selectedFile);
    setFileName(selectedFile.name);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!file) {
      setError('Please upload a medical certificate (PDF/JPG/PNG).');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('reason', reason);
    formData.append('category', category);
    formData.append('isProxy', String(isProxy));
    
    if (isProxy) {
      formData.append('proxyName', proxyName);
      formData.append('proxyRelationship', proxyRelationship);
    }
    
    formData.append('startOption', startOption);
    formData.append('endOption', endOption);
    formData.append('certificate', file);

    try {
      await api.applyLeave(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit medical leave. Please try again.');
      setLoading(false);
    }
  };

  return (
    <NavbarFrame>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Submit Leave Application</h1>
          <p className="text-slate-400 text-xs mt-1">Submit your medical documentation to initiate the condonation pipeline</p>
        </div>

        {success ? (
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto glow-cyan">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Application Submitted!</h2>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Your leave request was received. The background AI is currently running OCR extraction, and approvals are routing. Redirecting...
            </p>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-sm text-slate-300">
              {/* Category & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nature of Illness</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 transition"
                  >
                    <option value="FEVER_INFECTION">Fever / Viral Infection</option>
                    <option value="INJURY">Physical Injury / Fracture</option>
                    <option value="CHRONIC">Chronic Condition Flare-up</option>
                    <option value="MENTAL_HEALTH">Mental Health / Exhaustion</option>
                    <option value="OTHER">Other medical emergency</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leave Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 transition"
                  />
                </div>
              </div>

              {/* End Date & Partial Day Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leave End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partial Day Constraints</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={startOption}
                      onChange={(e) => setStartOption(e.target.value)}
                      className="px-2 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none transition"
                      title="First day option"
                    >
                      <option value="FULL">First Day: Full Day</option>
                      <option value="AFTERNOON">First Day: Afternoon Only</option>
                    </select>
                    <select
                      value={endOption}
                      onChange={(e) => setEndOption(e.target.value)}
                      className="px-2 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none transition"
                      title="Last day option"
                    >
                      <option value="FULL">Last Day: Full Day</option>
                      <option value="MORNING">Last Day: Morning Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reason for Leave */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medical Reason & Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your sickness, recommendation from doctor, or hospitalization details..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 transition placeholder-slate-600 resize-none"
                />
              </div>

              {/* Proxy Submissions */}
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="proxyCheck"
                    checked={isProxy}
                    onChange={(e) => setIsProxy(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 text-medical-500 focus:ring-medical-500"
                  />
                  <label htmlFor="proxyCheck" className="text-xs font-semibold text-slate-300 select-none cursor-pointer">
                    This is a Proxy Submission (Submitted by Parent/Guardian/Peer)
                  </label>
                </div>

                {isProxy && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Submitter Name</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. Ramesh Sen"
                        value={proxyName}
                        onChange={(e) => setProxyName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Relationship</label>
                      <select
                        value={proxyRelationship}
                        onChange={(e) => setProxyRelationship(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      >
                        <option value="Parent">Parent</option>
                        <option value="Guardian">Local Guardian</option>
                        <option value="Peer">Fellow Student</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload Box */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medical Certificate (PDF/PNG/JPG)</label>
                <div className="flex justify-center items-center w-full">
                  <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                      isDragging
                        ? 'border-medical-500 bg-medical-500/10 scale-[1.01] shadow-lg shadow-medical-500/5'
                        : 'border-slate-800 hover:border-medical-500/50 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                      <Upload className={`w-8 h-8 mb-2 transition-all duration-300 ${isDragging ? 'text-medical-400 scale-110 animate-bounce' : 'text-slate-500 group-hover:text-medical-400'}`} />
                      {fileName ? (
                        <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5"><FileText className="w-4 h-4" /> {fileName}</p>
                      ) : isDragging ? (
                        <>
                          <p className="text-xs text-medical-400 font-semibold mb-1 animate-pulse">Drop the certificate here</p>
                          <p className="text-[10px] text-slate-500">Release to attach file</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-slate-400 font-semibold mb-1">Drag & Drop or Click to upload</p>
                          <p className="text-[10px] text-slate-500">PDF, PNG, JPG (Max 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-900">
                <Link
                  href="/student/dashboard"
                  className="flex-1 py-3 text-center rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-medium transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-medical-600 to-cyan-500 hover:from-medical-500 hover:to-cyan-400 text-white font-medium flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-55 glow-medical"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </NavbarFrame>
  );
}
