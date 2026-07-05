'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Activity, Mail, Lock, User, Loader2, ArrowRight, BookOpen, Home, HelpCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  // Basic Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  
  // Student Specific
  const [rollNumber, setRollNumber] = useState('');
  const [isResidential, setIsResidential] = useState(true);
  const [hostelName, setHostelName] = useState('H-1');
  const [roomNumber, setRoomNumber] = useState('');
  const [parentContact, setParentContact] = useState('');
  
  // Faculty Specific
  const [designation, setDesignation] = useState('');
  
  // Warden Specific
  const [wardenHostelName, setWardenHostelName] = useState('H-1');
  
  // Common
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments list
  useEffect(() => {
    async function loadDepts() {
      try {
        const list = await api.getDepartments();
        setDepartments(list);
        if (list.length > 0) {
          setDepartmentId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load departments, using mock fallback list:', err);
        // Fallback for offline load before seeding
        const mockDepts = [
          { id: 'cse-mock-id', name: 'Computer Science & Engineering', code: 'CSE' },
          { id: 'ece-mock-id', name: 'Electronics & Communication Engineering', code: 'ECE' }
        ];
        setDepartments(mockDepts);
        setDepartmentId(mockDepts[0].id);
      }
    }
    loadDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: any = {
      email,
      password,
      name,
      role,
      departmentId
    };

    if (role === 'STUDENT') {
      payload.rollNumber = rollNumber;
      payload.isResidential = isResidential;
      payload.hostelName = isResidential ? hostelName : null;
      payload.roomNumber = isResidential ? roomNumber : null;
      payload.parentContact = parentContact;
    } else if (role === 'WARDEN') {
      payload.wardenHostelName = wardenHostelName;
      // Wardens don't have departments, delete departmentId
      delete payload.departmentId;
    } else if (['FACULTY', 'HOD'].includes(role)) {
      payload.designation = designation;
    }

    try {
      await api.register(payload);
      
      // Redirect based on role
      if (role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (role === 'FACULTY') {
        router.push('/faculty/dashboard');
      } else {
        router.push('/approver/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Please review input fields.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 py-12">
      {/* Background Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-500 to-indigo-500 flex items-center justify-center glow-medical">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white font-sans">MedLeave Portal</span>
          </Link>
          <p className="text-slate-400 text-xs">Create your university medical condonation account</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-5 text-center">Register Account</h2>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="E.g. Aditya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 focus:ring-1 focus:ring-medical-500/30 transition placeholder-slate-600"
                />
              </div>
            </div>

            {/* Email & Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email (JUIT)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="student@juit.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 focus:ring-1 focus:ring-medical-500/30 transition placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 focus:ring-1 focus:ring-medical-500/30 transition placeholder-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portal Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-medical-500/60 transition"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Teaching Faculty</option>
                <option value="WARDEN">Hostel Warden</option>
                <option value="MED_OFFICER">Medical Officer (Health Centre)</option>
                <option value="HOD">Head of Department (HOD)</option>
              </select>
            </div>

            {/* Dynamic Section: Student Details */}
            {role === 'STUDENT' && (
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-3">
                <p className="font-semibold text-slate-400 text-xs">Student Registration Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Roll Number</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. 211023"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Parent Contact Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+919876543210"
                      value={parentContact}
                      onChange={(e) => setParentContact(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Hostel Residence</label>
                    <select
                      value={isResidential ? 'yes' : 'no'}
                      onChange={(e) => setIsResidential(e.target.value === 'yes')}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    >
                      <option value="yes">Residential Student</option>
                      <option value="no">Day Scholar</option>
                    </select>
                  </div>
                </div>

                {isResidential && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Hostel Block</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. H-1"
                        value={hostelName}
                        onChange={(e) => setHostelName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Room Number</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. 101"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Section: Faculty Details */}
            {['FACULTY', 'HOD'].includes(role) && (
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-3">
                <p className="font-semibold text-slate-400 text-xs">Faculty Assignment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Assistant Professor"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Section: Warden Details */}
            {role === 'WARDEN' && (
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-3">
                <p className="font-semibold text-slate-400 text-xs">Warden Supervision Area</p>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Supervised Hostel block</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. H-1"
                    value={wardenHostelName}
                    onChange={(e) => setWardenHostelName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-medical-600 to-indigo-600 hover:from-medical-500 hover:to-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-55 disabled:pointer-events-none glow-medical mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-500">Already registered? </span>
            <Link href="/login" className="text-xs font-bold text-medical-400 hover:text-medical-300">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
