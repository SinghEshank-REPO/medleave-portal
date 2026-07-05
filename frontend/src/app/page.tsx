'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Activity, Shield, FileText, Clock, Award, Users, 
  ArrowRight, Check, Plus, Minus, CheckCircle, 
  Brain, FileSpreadsheet, Lock, ChevronRight 
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is the minimum attendance requirement at JUIT Waknaghat?",
      answer: "According to the academic ordinances of JUIT Waknaghat, students are required to maintain a minimum of 75% attendance in each course (Lectures, Tutorials, and Practical Labs) to be eligible to sit for the end-semester examinations."
    },
    {
      question: "How does the PS-08 Condonation policy work?",
      answer: "The JUIT PS-08 policy provides credit relief for students with shortfalls due to severe medical conditions. Once medical leave is verified and approved, it generates targeted class absences which can be condoned by respective teaching faculty members."
    },
    {
      question: "How does the AI verify certificates?",
      answer: "The built-in AI engine reads uploaded certificates to extract patient name, clinic/hospital (such as IGMC Solan), doctor names, and recommended rest days. It runs heuristics to check signature authenticity and name matches to flag suspicious requests."
    },
    {
      question: "What happens if I miss the SLA deadline?",
      answer: "Reviewers have specific SLA deadlines (24h for Health Center/Warden, 48h for Faculty). If a deadline lapses, the application is automatically approved and forwarded to the next stage."
    },
    {
      question: "Where can I get support or report an issue?",
      answer: "Jaypee University of Information Technology is located in Waknaghat, Solan, Himachal Pradesh, 173234. For portal troubleshooting or policy clarifications, students can contact the Academic Registrar's office or post comments in their dashboard."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#060813] text-slate-100 font-sans selection:bg-medical-500 selection:text-white pb-16">
      
      {/* Background radial soft ambient glows */}
      <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[2%] w-[700px] h-[700px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[2%] w-[650px] h-[650px] rounded-full bg-violet-600/5 blur-[170px] pointer-events-none z-0" />

      {/* Header / Navbar */}
      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-medical-500 to-indigo-500 flex items-center justify-center glow-medical">
            <Activity className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            MedLeave Portal
          </span>
        </div>
        
        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-400">
          <Link href="/" className="text-white hover:text-white transition">Home</Link>
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="#faqs" className="hover:text-white transition">FAQs</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="px-6 py-2.5 text-sm font-bold text-slate-350 hover:text-white transition border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-xl animate-fade-in"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-medical-600 to-indigo-600 text-white hover:opacity-90 transition glow-medical shadow-lg shadow-medical-950/20"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section Spotlight Grid */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column: Heading and Description */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-medical-500/10 border border-medical-500/20 text-medical-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-medical-400" /> JUIT Waknaghat PS-08 Condonation System
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight leading-[1.1] text-white">
              Medical Leave & <br />
              Condonation <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
              Submit medical leaves, verify certificates with AI, and manage condonations through a streamlined, transparent, and secure platform.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4.5 rounded-xl bg-gradient-to-r from-medical-600 to-indigo-600 text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-medical-950/20 flex items-center gap-2"
              >
                Apply for Medical Leave <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4.5 rounded-xl bg-[#0e1021] border border-white/5 hover:bg-[#161a35] text-white text-sm font-bold transition"
              >
                Track Application
              </Link>
            </div>
          </div>

          {/* Middle Column: clipboard 3D mockup asset (Sized up substantially) */}
          <div className="lg:col-span-4 flex items-center justify-center relative py-6">
            <div className="w-96 h-96 bg-medical-500/10 blur-[100px] rounded-full absolute z-0 pointer-events-none" />
            <div className="relative z-10 w-full max-w-[420px] aspect-square flex items-center justify-center animate-float-1">
              <Image
                src="/hero_clipboard.png"
                alt="3D Medical Clipboard and Shield icon asset"
                width={420}
                height={420}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Column: Core Features Panel (Larger paddings & sizes) */}
          <div className="lg:col-span-3">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 text-left shadow-xl">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest border-b border-white/5 pb-3">
                Core Features
              </h3>
              
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
                    <Brain className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">AI Document Verification</h4>
                    <p className="text-xs text-slate-500 leading-normal mt-1">Instantly extract and verify medical details from certificates using AI OCR.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
                    <Clock className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">Smart Approval Flow</h4>
                    <p className="text-xs text-slate-500 leading-normal mt-1">Applications are routed to the right approvers automatically.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
                    <Shield className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">SLA-Based Processing</h4>
                    <p className="text-xs text-slate-500 leading-normal mt-1">Ensures timely approvals and reduces delays with SLA monitoring.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
                    <Award className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">One-Click Condonation</h4>
                    <p className="text-xs text-slate-500 leading-normal mt-1">Faculty can approve or reject class condonations with a single click.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <a href="#how-it-works" className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-400 hover:text-medical-300 transition">
                  View All Features <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Horizontal Highlights Section (Taller cards & larger fonts) */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          
          <div className="glass-panel p-8 rounded-2xl border border-white/5 flex gap-5 text-left glow-hover w-full items-center">
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm lg:text-base font-bold text-white">Paperless Process</h4>
              <p className="text-xs text-slate-500 leading-normal mt-1">Go completely digital and save time.</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 flex gap-5 text-left glow-hover w-full items-center">
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm lg:text-base font-bold text-white">Faster Turnaround</h4>
              <p className="text-xs text-slate-500 leading-normal mt-1">Quick routing and approvals to reduce waiting time.</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 flex gap-5 text-left glow-hover w-full items-center">
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm lg:text-base font-bold text-white">Secure & Reliable</h4>
              <p className="text-xs text-slate-500 leading-normal mt-1">Your data is protected with enterprise-grade security.</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 flex gap-5 text-left glow-hover w-full items-center">
            <div className="w-12 h-12 rounded-xl bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm lg:text-base font-bold text-white">Transparent Workflow</h4>
              <p className="text-xs text-slate-500 leading-normal mt-1">Track every step and stay informed in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Larger workflow steps) */}
      <section id="how-it-works" className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-20 relative z-10 text-center">
        <div className="max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">How It Works</h2>
          <p className="text-slate-500 text-sm leading-normal">A simple 4-step process from request to condonation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative w-full">
          
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-medical-500/20 z-0 pointer-events-none" />

          {/* Step 1 */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5 relative z-10 flex flex-col items-center text-center space-y-5 w-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#0a0f24] border border-white/5 text-medical-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-medical-500 text-[#060813] font-bold text-xs flex items-center justify-center ring-4 ring-[#060813]">
                1
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm lg:text-base">Submit Request</h3>
              <p className="text-xs text-slate-505 leading-relaxed mt-2.5 max-w-[240px] mx-auto">
                Submit your medical leave request and upload the required documents.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5 relative z-10 flex flex-col items-center text-center space-y-5 w-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#0a0f24] border border-white/5 text-medical-400 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-medical-500 text-[#060813] font-bold text-xs flex items-center justify-center ring-4 ring-[#060813]">
                2
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm lg:text-base">AI Verification</h3>
              <p className="text-xs text-slate-505 leading-relaxed mt-2.5 max-w-[240px] mx-auto">
                Our AI engine scans and verifies your certificate and extracts key details.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5 relative z-10 flex flex-col items-center text-center space-y-5 w-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#0a0f24] border border-white/5 text-medical-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-medical-500 text-[#060813] font-bold text-xs flex items-center justify-center ring-4 ring-[#060813]">
                3
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm lg:text-base">Sequential Review</h3>
              <p className="text-xs text-slate-505 leading-relaxed mt-2.5 max-w-[240px] mx-auto">
                The request is reviewed by the Health Centre, Warden, and Faculty.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5 relative z-10 flex flex-col items-center text-center space-y-5 w-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#0a0f24] border border-white/5 text-medical-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-medical-500 text-[#060813] font-bold text-xs flex items-center justify-center ring-4 ring-[#060813]">
                4
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm lg:text-base">Condonation</h3>
              <p className="text-xs text-slate-505 leading-relaxed mt-2.5 max-w-[240px] mx-auto">
                Once approved, your leave is condoned and you're notified instantly.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Built for Every Role Section */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-16 relative z-10 text-center">
        <div className="max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Built for Every Role</h2>
          <p className="text-slate-500 text-sm leading-normal">Role-based tools to simplify work for everyone.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Students column */}
          <div className="glass-panel p-10 rounded-3xl border border-white/5 space-y-6 text-left glow-hover w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-medical-500/20 to-indigo-500/10 flex items-center justify-center text-medical-400">
                <Award className="w-6.5 h-6.5" />
              </div>
              <h3 className="font-extrabold text-white text-base lg:text-lg">For Students</h3>
            </div>
            <ul className="space-y-4 text-sm lg:text-base text-slate-400">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Apply for medical leave</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Track application status</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Get real-time updates</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>View attendance impact</span>
              </li>
            </ul>
          </div>

          {/* Faculty column */}
          <div className="glass-panel p-10 rounded-3xl border border-white/5 space-y-6 text-left glow-hover w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-medical-500/20 to-indigo-500/10 flex items-center justify-center text-medical-400">
                <Users className="w-6.5 h-6.5" />
              </div>
              <h3 className="font-extrabold text-white text-base lg:text-lg">For Faculty</h3>
            </div>
            <ul className="space-y-4 text-sm lg:text-base text-slate-400">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Review and approve requests</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Verify documents instantly</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>SLA monitoring & alerts</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Quick condonation decisions</span>
              </li>
            </ul>
          </div>

          {/* Admin column */}
          <div className="glass-panel p-10 rounded-3xl border border-white/5 space-y-6 text-left glow-hover w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-medical-500/20 to-indigo-500/10 flex items-center justify-center text-medical-400">
                <Shield className="w-6.5 h-6.5" />
              </div>
              <h3 className="font-extrabold text-white text-base lg:text-lg">For Administration</h3>
            </div>
            <ul className="space-y-4 text-sm lg:text-base text-slate-400">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Dashboard & analytics</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>SLA & policy management</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>Audit logs & reports</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-medical-400 flex-shrink-0" />
                <span>System configuration</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-20 relative z-10">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm leading-normal">Find answers to common questions about the condonation system.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl border border-white/5 bg-[#0a0f24]/50 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-sm lg:text-base font-bold text-white hover:bg-white/5 transition"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <Minus className="w-4 h-4 text-medical-400" /> : <Plus className="w-4 h-4 text-slate-500" />}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5 text-xs lg:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Center-Aligned Copyright Footer */}
      <footer id="contact" className="w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-20 border-t border-slate-900 text-xs lg:text-sm text-slate-500 relative z-10 flex flex-col items-center justify-center gap-4 text-center pb-8">
        <div className="flex gap-8 text-slate-400 font-semibold mb-1">
          <a href="https://www.juit.ac.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">University Website</a>
          <a href="https://www.juit.ac.in/contact-us" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Help Desk</a>
        </div>
        <span>&copy; {new Date().getFullYear()} Jaypee University of Information Technology. All rights reserved.</span>
      </footer>

    </div>
  );
}
