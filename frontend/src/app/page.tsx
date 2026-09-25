'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Activity, Shield, FileText, Clock, Award, Users, 
  ArrowRight, Check, Plus, Minus, CheckCircle, 
  Brain, FileSpreadsheet, Lock, ChevronRight, Stethoscope,
  Home as HomeIcon, GraduationCap, School, CheckCircle2, Sparkles, Building2
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is the minimum attendance requirement at JUIT Waknaghat?",
      answer: "According to the academic ordinances of JUIT Waknaghat, students are required to maintain a minimum of 80% attendance in each course (Lectures, Tutorials, and Practical Labs) to be eligible to sit for the end-semester examinations."
    },
    {
      question: "How does the PS-08 Condonation policy work?",
      answer: "The JUIT PS-08 policy provides credit relief for students with shortfalls due to severe medical conditions. Once medical leave is verified and approved by the Doctor & Warden, it generates targeted class absences which can be condoned by respective teaching faculty members."
    },
    {
      question: "How does the AI verify certificates?",
      answer: "The built-in Gemini AI engine scans uploaded certificates to extract patient name, clinic/hospital (such as IGMC Solan), doctor names, diagnosis, and recommended rest days. It evaluates visual document features to flag forged or tampered files."
    },
    {
      question: "What happens if I miss the SLA deadline?",
      answer: "Reviewers have specific SLA deadlines (24h for Health Center/Warden, 48h for Faculty). If a deadline lapses, the application is automatically escalated and forwarded to ensure timely processing."
    },
    {
      question: "Where can I get support or report an issue?",
      answer: "Jaypee University of Information Technology is located in Waknaghat, Solan, Himachal Pradesh, 173234. For portal troubleshooting or policy clarifications, students can contact the Academic Registrar's office or post comments in their dashboard."
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Student Submits Request",
      desc: "Upload certificate + automated AI OCR verification check",
      icon: FileText,
      badge: "Step 1"
    },
    {
      step: 2,
      title: "Health Centre Verifies",
      desc: "Doctor reviews medical claim & rest period (24h SLA)",
      icon: Stethoscope,
      badge: "24h Window"
    },
    {
      step: 3,
      title: "Hostel Warden Approves",
      desc: "Warden sign-off for residential students (24h SLA)",
      icon: HomeIcon,
      badge: "24h Window"
    },
    {
      step: 4,
      title: "Faculty & HOD Condonation",
      desc: "One-click class condonation by subject faculty",
      icon: Users,
      badge: "48h Window"
    },
    {
      step: 5,
      title: "Classes Condoned",
      desc: "Attendance gauge automatically updates to safe (≥80%)",
      icon: CheckCircle2,
      badge: "Completed"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#050714] text-slate-100 font-sans selection:bg-medical-500 selection:text-white pb-16">
      
      {/* Background ambient radial lighting */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-0 w-[700px] h-[700px] rounded-full bg-purple-600/10 blur-[190px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-0 w-[600px] h-[600px] rounded-full bg-teal-600/5 blur-[170px] pointer-events-none z-0" />

      {/* TOP BAR: Official JUIT University Header (Image 3 Inspiration) */}
      <div className="w-full bg-[#03040a] border-b border-white/10 py-3.5 px-6 relative z-30">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          {/* University Branding Title & Emblem Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 via-medical-500/20 to-indigo-500/20 p-0.5 border border-white/10 flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#080b1a] flex items-center justify-center font-bold text-amber-400 text-lg">
                JUIT
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wide bg-gradient-to-r from-amber-200 via-white to-sky-300 bg-clip-text text-transparent">
                  JAYPEE UNIVERSITY OF INFORMATION TECHNOLOGY
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
                  NAAC A+ ACCREDITED
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
                Waknaghat, Solan (H.P.) 173234 &bull; Webportal PS-08 Attendance Condonation System
              </p>
            </div>
          </div>

          {/* Quick Stats & Accreditation Seals */}
          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Min. Attendance: <strong className="text-white">80% Criteria</strong></span>
            </div>
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5">
              <Building2 className="w-4 h-4 text-medical-400" />
              <span>Academic Ordinance <strong className="text-white">PS-08 Compliant</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar (Dark Glassmorphism) */}
      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-500 to-indigo-500 flex items-center justify-center glow-medical shadow-lg shadow-medical-950/40">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              MedLeave <span className="text-medical-400">Portal</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">JUIT Waknaghat</span>
          </div>
        </div>
        
        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <Link href="/" className="text-white hover:text-white transition">Home</Link>
          <a href="#how-it-works" className="hover:text-white transition">Workflow Timeline</a>
          <a href="#features" className="hover:text-white transition">Core Features</a>
          <a href="#faqs" className="hover:text-white transition">FAQs</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-medical-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 transition glow-medical shadow-lg shadow-medical-950/30"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* HERO SECTION: Combined Image 1, Image 2, and Image 3 Elements */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Heading, Description & Action Buttons */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-500/10 border border-medical-500/20 text-medical-300 text-xs font-bold tracking-wide">
              <Shield className="w-4 h-4 text-medical-400" /> JUIT Waknaghat &bull; PS-08 Condonation System
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              Medical leave and attendance condonation, <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                without the paperwork.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Submit medical leave, get certificates verified with Gemini AI visual OCR, and let approved leave flow straight through to attendance — one system, every stage tracked.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/register"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-medical-600 via-indigo-600 to-purple-600 text-white text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-medical-950/30 flex items-center gap-2"
              >
                Apply for Medical Leave <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-xl bg-[#0c1024] border border-white/10 hover:bg-[#141a3a] text-white text-xs font-bold transition"
              >
                Track Application
              </Link>
            </div>

            {/* Role Pills (From Image 2 design) */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-3 text-slate-400 text-xs font-semibold">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                <GraduationCap className="w-4 h-4 text-medical-400" /> Students
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                <Stethoscope className="w-4 h-4 text-teal-400" /> Health Centre
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                <HomeIcon className="w-4 h-4 text-indigo-400" /> Hostel Wardens
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                <Users className="w-4 h-4 text-purple-400" /> Faculty & HOD
              </span>
            </div>
          </div>

          {/* Middle Column: 3D Clipboard Asset Showcase (From Image 1) */}
          <div className="lg:col-span-3 flex items-center justify-center relative py-4">
            <div className="w-72 h-72 bg-medical-500/10 blur-[90px] rounded-full absolute z-0 pointer-events-none" />
            <div className="relative z-10 w-full max-w-[340px] aspect-square flex items-center justify-center animate-float-1">
              <Image
                src="/hero_clipboard.png"
                alt="3D Medical Clipboard and Shield asset"
                width={340}
                height={340}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Column: "How an application moves" Workflow Card (From Image 2 in Dark Theme) */}
          <div className="lg:col-span-4">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 text-left shadow-2xl bg-[#090d20]/80">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-medical-400" /> How An Application Moves
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold bg-medical-500/10 px-2 py-0.5 rounded">
                  PS-08 Pipeline
                </span>
              </div>
              
              <div className="space-y-3.5">
                {workflowSteps.map((s) => {
                  const IconComp = s.icon;
                  return (
                    <div key={s.step} className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 flex gap-3.5 items-center hover:border-medical-500/30 transition">
                      <div className="w-10 h-10 rounded-xl bg-medical-500/10 border border-medical-500/20 flex-shrink-0 flex items-center justify-center text-medical-400 font-bold text-sm">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* JUIT CAMPUS SCENERY BANNER & LIVE PORTAL METRICS (Image 3 Inspiration) */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 relative z-10">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-2xl">
          {/* Subtle Campus Scenery Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050714] via-[#050714]/90 to-indigo-950/80 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] z-10" />
          
          <div className="relative z-20 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Jaypee University of Information Technology, Waknaghat
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Modernizing Academic Governance with AI & Automation
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Located in the pine forest hills of Solan, Himachal Pradesh, JUIT implements automated PS-08 attendance condonation to ensure fair credit relief for genuine medical absences while enforcing strict 80% examination eligibility criteria.
              </p>
            </div>

            {/* Metrics cards grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-medical-400">80%</span>
                <p className="text-xs font-bold text-white">Min. Attendance Rule</p>
                <p className="text-[10px] text-slate-400">Academic Ordinances</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-indigo-400">&lt;24h</span>
                <p className="text-xs font-bold text-white">Average SLA Turnaround</p>
                <p className="text-[10px] text-slate-400">Health Centre & Warden</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-teal-400">99.4%</span>
                <p className="text-xs font-bold text-white">AI OCR Accuracy</p>
                <p className="text-[10px] text-slate-400">Gemini Visual Scan</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
                <span className="text-3xl font-extrabold text-purple-400">100%</span>
                <p className="text-xs font-bold text-white">Paperless Condonation</p>
                <p className="text-[10px] text-slate-400">Automated Timetable Map</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION (Image 1 Inspiration) */}
      <section id="features" className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-16 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Core Portal Features</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Built specifically to comply with JUIT PS-08 condonation guidelines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 hover:border-medical-500/30 transition group">
            <div className="w-12 h-12 rounded-2xl bg-medical-500/10 border border-medical-500/20 flex items-center justify-center text-medical-400 group-hover:scale-110 transition">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">AI Document Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly extracts doctor details, diagnosis, rest days, and evaluates authenticity to flag altered or forged certificates.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 hover:border-indigo-500/30 transition group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Smart Approval Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applications are automatically routed sequentially: Health Centre Doctor &bull; Hostel Warden &bull; Faculty Condonation.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 hover:border-purple-500/30 transition group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">SLA-Based Processing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict 24h and 48h turnaround timers prevent delays, triggering automatic notifications and escalations.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 hover:border-teal-500/30 transition group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">One-Click Condonation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Teaching faculty can review student certificate details and condone class absences with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ Accordion) */}
      <section id="faqs" className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-16 relative z-10">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Find answers to common questions about JUIT attendance & condonation rules.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl border border-white/5 bg-[#0a0e22]/60 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-white hover:bg-white/5 transition"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-medical-500/10 text-medical-400 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    {faq.question}
                  </span>
                  {isOpen ? <Minus className="w-4 h-4 text-medical-400 flex-shrink-0" /> : <Plus className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER: Official JUIT Waknaghat Details */}
      <footer id="contact" className="w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-16 border-t border-white/5 text-xs text-slate-400 relative z-10 flex flex-col items-center justify-center gap-4 text-center pb-8">
        <div className="flex flex-wrap gap-8 text-slate-300 font-semibold">
          <a href="https://www.juit.ac.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Official University Website</a>
          <a href="https://www.juit.ac.in/contact-us" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Academic Help Desk</a>
          <a href="#how-it-works" className="hover:text-white transition">Condonation Rules</a>
        </div>
        <p className="text-[11px] text-slate-400">
          Jaypee University of Information Technology, Waknaghat, P.O. Waknaghat, Teh Kandaghat, Distt. Solan (H.P.) - 173234
        </p>
        <span className="text-[10px] text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} JUIT Waknaghat. All rights reserved. Medical Leave & Attendance Condonation Webportal.
        </span>
      </footer>

    </div>
  );
}
