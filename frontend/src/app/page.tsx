'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, FileText, Activity, Clock, Award, Users, CheckCircle2, ArrowRight, Laptop, BookOpen } from 'lucide-react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    const textToType = "Jaypee University Medical Leave Portal";
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(textToType.substring(0, index));
      index++;
      if (index > textToType.length) {
        clearInterval(interval);
        // Fade out splash screen after typing completes
        setTimeout(() => {
          setShowSplash(false);
        }, 800);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#0f172a] text-slate-100 font-sans">
      {/* Splash Loading Screen */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0f172a] py-24 transition-opacity duration-1000 ${showSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        {/* Top Spacer */}
        <div />

        {/* Pulsing Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-medical-500 to-cyan-400 flex items-center justify-center glow-medical animate-pulse relative z-10">
          <Activity className="w-10 h-10 text-white" />
        </div>

        {/* Bottom Typing Animation */}
        <div className="h-8 text-center relative z-10 px-6">
          <span className="font-extrabold text-base sm:text-lg tracking-widest text-slate-350 font-mono">
            {typedText}
            <span className="inline-block w-1.5 h-4.5 bg-medical-400 ml-1 animate-blink">|</span>
          </span>
        </div>
      </div>

      {/* Background Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-10" />

      {/* Background Medical Doctor Video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-35">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://v1.pinimg.com/videos/iht/expMp4/17/30/45/17304590bffd08af6dc302d72bee01cb_720w.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[#0f172a]/60" />
      </div>

      {/* Navbar (Stretched to extreme left/right corners) */}
      <header className="w-full px-8 md:px-16 py-6 flex items-center justify-between relative z-20 border-b border-white/5 bg-slate-900/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-500 to-cyan-400 flex items-center justify-center glow-medical">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-medical-400 bg-clip-text text-transparent">
            MedLeave Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.juit.ac.in/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-xl text-sm font-medium text-slate-350 hover:text-white transition border border-white/5 hover:border-white/10 hover:bg-white/5"
          >
            Contact Us
          </a>
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-medical-600 to-cyan-500 text-white hover:opacity-90 transition glow-medical"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section (Stretched layout to cover whole website width) */}
      <main className="relative z-20 px-8 md:px-16 w-full py-16 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-500/10 border border-medical-500/20 text-medical-400 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> JUIT Waknaghat PS-08 Condonation System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Jaypee University <br />
              <span className="bg-gradient-to-r from-medical-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Medical Leave Portal
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Digitize the entire condonation pipeline. Apply for medical leaves, upload certificates with instant AI OCR validation, route sequential approvals (Health Centre, Warden, Advisor), and condone class absences with one-click faculty integration.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-medical-600 to-cyan-500 text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-medical-950/20"
              >
                Apply for Medical Leave
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition"
              >
                Review Applications
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800 max-w-lg">
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-500 mt-1">Paperless Workflow</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">&lt; 24h</p>
                <p className="text-xs text-slate-500 mt-1">SLA Turnaround</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">99%</p>
                <p className="text-xs text-slate-500 mt-1">AI OCR Accuracy</p>
              </div>
            </div>
          </div>

          {/* Right Cards Grid Column (Larger sizes + Diagonally wave-staggered layout) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:py-8">
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/5 animate-float-1 glow-hover lg:-translate-y-6">
              <div className="w-12 h-12 rounded-xl bg-medical-500/20 flex items-center justify-center text-medical-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">1. Submit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit leaves yourself or request a Proxy (parents/guardians). Upload medical certificates in JPG or PDF.
              </p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/5 animate-float-2 glow-hover lg:translate-y-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">2. AI OCR Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI extracts patient name, diagnosis, clinic, and flags fraudulent alterations or name mismatches instantly.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/5 animate-float-3 glow-hover lg:-translate-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">3. Approval SLAs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sequential routing through Health Centre, Hostel Warden, and Advisor with automatic timeout escalations.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/5 animate-float-4 glow-hover lg:translate-y-12">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">4. One-Click Condonation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Teaching faculty receive targeted class mismatch alerts to approve condonations with a single click.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Section (Expanded full-width spacing) */}
      <section className="relative z-20 px-8 md:px-16 w-full py-24 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            A fully automated, sequential medical leave validation and condonation pipeline designed for colleges and universities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="glass-panel p-6 rounded-2xl relative space-y-4 border border-white/5 pt-10 glow-hover">
            <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-medical-500 flex items-center justify-center text-slate-950 font-extrabold text-xs glow-medical animate-pulse">
              1
            </div>
            <h3 className="font-bold text-white text-sm mt-2">Submit Request</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students or parents submit claims with date parameters and upload medical certificates. The system automatically reads the student's section timetable to map missed lectures, tutorials, and labs.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-6 rounded-2xl relative space-y-4 border border-white/5 pt-10 glow-hover">
            <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 font-extrabold text-xs">
              2
            </div>
            <h3 className="font-bold text-white text-sm mt-2">AI OCR Scans</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI engine performs instant OCR scans on the certificate, extracting diagnosing doctor, hospital details, and recommended rest days. Handwritten alterations or name mismatches raise suspicions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-6 rounded-2xl relative space-y-4 border border-white/5 pt-10 glow-hover">
            <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-slate-950 font-extrabold text-xs">
              3
            </div>
            <h3 className="font-bold text-white text-sm mt-2">Sequential Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applications route sequentially from Health Centre to Hostel Wardens and Faculty Advisors. Automatic SLA escalations ensure approvals are processed in a timely manner.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-6 rounded-2xl relative space-y-4 border border-white/5 pt-10 glow-hover">
            <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-slate-950 font-extrabold text-xs">
              4
            </div>
            <h3 className="font-bold text-white text-sm mt-2">Faculty Condonation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once fully approved by the advisor, teaching faculty members receive missed class condonation notifications on their dashboards, allowing them to condone absences with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* Key Benefits Section (Expanded spacing) */}
      <section className="relative z-20 px-8 md:px-16 w-full py-24 border-t border-slate-900 bg-slate-950/20">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Designed for Every Stakeholder
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            Simplifying communication, enhancing verification integrity, and keeping students focused on their academic progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-4 glow-hover">
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 flex items-center justify-center text-medical-400">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">For Students</h3>
            <ul className="space-y-3.5 text-xs text-slate-450 text-left">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-medical-400 flex-shrink-0 mt-0.5" />
                <span>Eliminate physical paper submissions and department visits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-medical-400 flex-shrink-0 mt-0.5" />
                <span>Track leave approval status and escalations in real-time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-medical-400 flex-shrink-0 mt-0.5" />
                <span>Watch raw vs. condoned attendance gauges live.</span>
              </li>
            </ul>
          </div>

          {/* Benefit 2 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-4 glow-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">For Faculty & Advisors</h3>
            <ul className="space-y-3.5 text-xs text-slate-450 text-left">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>One-click class-level condonation requests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Side-by-side AI OCR verification and doctor signature extracts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Clear commenting threads to request quick clarifications.</span>
              </li>
            </ul>
          </div>

          {/* Benefit 3 */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-4 glow-hover">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">For Administration</h3>
            <ul className="space-y-3.5 text-xs text-slate-450 text-left">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Full audit log tracking system actions and review decisions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Repeat leave alert flags indicating counseling referrals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Configurable SLA parameters and single-window timeouts.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="relative z-20 px-8 md:px-16 w-full py-24 border-t border-slate-900 bg-slate-950/40">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            Find answers to common questions about JUIT Waknaghat's medical leave and attendance condonation system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* FAQ 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2 text-left glow-hover">
            <h4 className="font-bold text-white text-sm">What is the minimum attendance requirement at JUIT Waknaghat?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              According to the academic ordinances of JUIT Waknaghat, students are required to maintain a minimum of <strong>75% attendance</strong> in each course (Lectures, Tutorials, and Practical Labs) to be eligible to sit for the end-semester examinations.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2 text-left glow-hover">
            <h4 className="font-bold text-white text-sm">How does the JUIT PS-08 Condonation policy work?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The JUIT PS-08 policy provides credit relief for students with shortfalls due to severe medical conditions. Once medical leave is verified and approved, it generates targeted class absences which can be condoned by respective teaching faculty members.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2 text-left glow-hover">
            <h4 className="font-bold text-white text-sm">What is the sequential review workflow for approvals?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Medical leaves undergo sequential checks: first, the <strong>University Health Centre</strong> verifies the certificate. Second, if the student resides in a hostel (like H-1, H-2), the <strong>Hostel Warden</strong> performs welfare checks. Finally, the <strong>Faculty Advisor</strong> gives the final approval.
            </p>
          </div>

          {/* FAQ 4 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2 text-left glow-hover">
            <h4 className="font-bold text-white text-sm">How does the AI OCR verify certificates?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The built-in AI engine reads uploaded certificates to extract patient name, clinic/hospital (such as IGMC Solan), doctor names, and recommended rest days. It runs heuristics to check signature authenticity and name matches to flag suspicious requests.
            </p>
          </div>

          {/* FAQ 5 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2 text-left glow-hover">
            <h4 className="font-bold text-white text-sm">What happens if a reviewer misses the JUIT SLA deadline?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reviewers have specific SLA deadlines (24h for Health Center/Warden, 48h for Advisor). If a deadline lapses, the application is flagged as <strong>isEscalated</strong> to notify administrators, and a double-window lapse auto-forwards the request to the next stage.
            </p>
          </div>

          {/* FAQ 6 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2 text-left glow-hover">
            <h4 className="font-bold text-white text-sm">Where can I locate the JUIT campus or contact support?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jaypee University of Information Technology is located in Waknaghat, Solan, Himachal Pradesh, 173234. For portal troubleshooting or policy clarifications, students can contact the Academic Registrar's office or post comments in their dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-8 md:px-16 py-8 text-center border-t border-slate-900 text-xs text-slate-500 relative z-20">
        &copy; {new Date().getFullYear()} Jaypee University of Information Technology. All rights reserved.
      </footer>
    </div>
  );
}
