'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Activity, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login({ email, password });
      
      // Fetch user profile to route correctly
      const profile = await api.me();
      
      const role = profile.role;
      if (role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (role === 'FACULTY') {
        router.push('/faculty/dashboard');
      } else if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        // FACULTY, HOD, WARDEN, MED_OFFICER all use the unified Approver Dashboard
        router.push('/approver/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      {/* Background Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-500 to-indigo-500 flex items-center justify-center glow-medical">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">MedLeave Portal</span>
          </Link>
          <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Log In</h2>
          
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@juit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-medical-500/60 focus:ring-1 focus:ring-medical-500/30 transition placeholder-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-medium text-medical-400 hover:text-medical-300">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-medical-500/60 focus:ring-1 focus:ring-medical-500/30 transition placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-medical-600 to-indigo-600 hover:from-medical-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-55 disabled:pointer-events-none glow-medical mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Enter Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Mock Login helpers */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <Link href="/register" className="text-xs font-bold text-medical-400 hover:text-medical-300">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Demo Accounts Panel */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 mt-6 space-y-2 text-xs">
          <p className="font-semibold text-slate-400 text-center">Quick Demo Credentials (Password: password123)</p>
          <div className="grid grid-cols-2 gap-2 text-slate-500">
            <div>Student: <span className="text-slate-300 font-mono">student@juit.ac.in</span></div>
            <div>Medical Off: <span className="text-slate-300 font-mono">doctor@juit.ac.in</span></div>
            <div>Warden: <span className="text-slate-300 font-mono">warden@juit.ac.in</span></div>
            <div>Faculty (OS): <span className="text-slate-300 font-mono">prof.os@juit.ac.in</span></div>
            <div>HOD (CSE): <span className="text-slate-300 font-mono">hod.cse@juit.ac.in</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
