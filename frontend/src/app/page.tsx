'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Activity, Shield, FileText, Clock, Award, Users, 
  ArrowRight, Check, Plus, Minus, CheckCircle, 
  Brain, FileSpreadsheet, Lock, ChevronRight, Stethoscope,
  Home as HomeIcon, GraduationCap, School, CheckCircle2, Sparkles, Building2,
  Sun, Moon
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    if (savedTheme === 'light') {
      setDarkMode(false);
      html.classList.remove('dark');
    } else {
      setDarkMode(true);
      html.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

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
    <div className={`min-h-screen relative overflow-x-hidden ${darkMode ? 'dark bg-[#050908] text-slate-100' : 'bg-[#f8fafc] text-slate-900'} font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300 pb-16`}>
      
      {/* Background ambient lighting - Subtle & Restrained */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[160px] pointer-events-none z-0" />

      {/* TOP BAR: Official JUIT University Header Bar */}
      <div className={`w-full ${darkMode ? 'bg-[#080D0C] border-zinc-800/80' : 'bg-slate-900 text-white'} border-b py-3 px-6 relative z-30 transition-colors`}>
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          {/* University Branding Title & Emblem Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 p-0.5 border border-zinc-800 flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#0E1614] flex items-center justify-center font-bold text-emerald-400 text-lg border border-emerald-500/20">
                JUIT
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                  JAYPEE UNIVERSITY OF INFORMATION TECHNOLOGY
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  NAAC A+ ACCREDITED
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs ${darkMode ? 'text-slate-400' : 'text-slate-300'} font-medium mt-0.5`}>
                Waknaghat, Solan (H.P.) 173234 &bull; Doctor Green Medical Webportal (PS-08 Condonation System)
              </p>
            </div>
          </div>

          {/* Quick Stats & Accreditation Seals */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-zinc-900/90 border-zinc-800 text-slate-300' : 'bg-slate-800 text-slate-100'}`}>
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Min. Attendance: <strong className="text-white">80% Criteria</strong></span>
            </div>
            <div className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-zinc-900/90 border-zinc-800 text-slate-300' : 'bg-slate-800 text-slate-100'}`}>
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Academic Ordinance <strong className="text-white">PS-08 Compliant</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className={`font-extrabold text-lg tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              MedLeave <span className="text-emerald-400">Portal</span>
            </span>
            <span className={`text-[9px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'} tracking-wider uppercase`}>JUIT Waknaghat</span>
          </div>
        </div>
        
        {/* Navigation links */}
        <nav className={`hidden md:flex items-center gap-8 text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <Link href="/" className="text-emerald-400 font-bold hover:text-emerald-300 transition">Home</Link>
          <a href="#how-it-works" className="hover:text-white transition">Workflow Timeline</a>
          <a href="#features" className="hover:text-white transition">Core Features</a>
          <a href="#faqs" className="hover:text-white transition">FAQs</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </nav>

        {/* Theme Toggle & Auth actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition ${darkMode ? 'border-zinc-800 bg-zinc-900/80 text-amber-400 hover:bg-zinc-800' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}
            title="Switch theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <Link
            href="/login"
            className={`px-5 py-2.5 text-xs font-bold transition border rounded-xl ${darkMode ? 'text-slate-200 border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:text-white' : 'text-slate-900 border-slate-300 hover:bg-slate-50'}`}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-950/20"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Heading, Description & Action Buttons */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${darkMode ? 'bg-zinc-900/90 border-zinc-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-900'} border text-xs font-bold tracking-wide`}>
              <Stethoscope className="w-4 h-4 text-emerald-400" /> JUIT Waknaghat &bull; Doctor Green Medical System
            </div>
            
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Medical Leave & <br />
              Attendance Condonation <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Made Simple & Digital
              </span>
            </h1>
            
            <p className={`text-sm sm:text-base leading-relaxed max-w-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Submit medical leave, get certificates verified with Gemini AI visual OCR, and let approved leave flow straight through to attendance — one system, every stage tracked.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/register"
                className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-emerald-950/20 flex items-center gap-2"
              >
                Apply for Medical Leave <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className={`px-7 py-3.5 rounded-xl border text-xs font-bold transition ${darkMode ? 'bg-zinc-900/90 border-zinc-800 text-slate-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'}`}
              >
                Track Application
              </Link>
            </div>

            {/* Role Pills */}
            <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap gap-3 text-xs font-semibold">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-zinc-900/80 border-zinc-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                <GraduationCap className="w-4 h-4 text-emerald-400" /> Students
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-zinc-900/80 border-zinc-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                <Stethoscope className="w-4 h-4 text-teal-400" /> Health Centre
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-zinc-900/80 border-zinc-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                <HomeIcon className="w-4 h-4 text-emerald-400" /> Hostel Wardens
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-zinc-900/80 border-zinc-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                <Users className="w-4 h-4 text-teal-400" /> Faculty & HOD
              </span>
            </div>
          </div>

          {/* Middle Column: Hero Image with Neutral Frame */}
          <div className="lg:col-span-4 flex items-center justify-center relative py-4">
            <div className="w-72 h-72 bg-emerald-500/5 blur-[100px] rounded-full absolute z-0 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-[440px] rounded-3xl p-2.5 bg-zinc-900/90 border border-zinc-800 shadow-2xl transform hover:scale-[1.01] transition duration-300">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-inner border border-zinc-800">
                <Image
                  src="/hero_clipboard.png"
                  alt="Medical Leave Portal on Laptop Desk with Stethoscope and Certificate"
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Live Status Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/90 border border-zinc-800 backdrop-blur-md flex items-center gap-2 text-[10px] font-bold text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live University Medical Portal
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: "How an application moves" Workflow Card */}
          <div className="lg:col-span-3">
            <div className={`glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4 text-left shadow-2xl ${darkMode ? 'bg-[#0B1110]/95' : 'bg-white/95'}`}>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className={`font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Clock className="w-4 h-4 text-emerald-400" /> How An Application Moves
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                  PS-08 Flow
                </span>
              </div>
              
              <div className="space-y-3">
                {workflowSteps.map((s) => {
                  const IconComp = s.icon;
                  return (
                    <div key={s.step} className={`p-3 rounded-2xl border transition flex gap-3 items-center ${darkMode ? 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700' : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'}`}>
                      <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        <IconComp className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{s.title}</h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${darkMode ? 'bg-zinc-800 text-slate-300' : 'bg-slate-200 text-slate-800'}`}>
                            {s.badge}
                          </span>
                        </div>
                        <p className={`text-[10px] leading-snug mt-0.5 truncate ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Core Portal Features</h2>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Designed for JUIT PS-08 attendance condonation specifications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`glass-panel p-6 rounded-3xl border border-zinc-800/80 space-y-4 hover:border-emerald-500/30 transition ${darkMode ? 'bg-[#0B1110]/80' : 'bg-white'}`}>
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>AI Document Verification</h3>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Instantly extracts doctor details, diagnosis, rest days, and evaluates authenticity to flag altered or forged certificates.
            </p>
          </div>

          <div className={`glass-panel p-6 rounded-3xl border border-zinc-800/80 space-y-4 hover:border-emerald-500/30 transition ${darkMode ? 'bg-[#0B1110]/80' : 'bg-white'}`}>
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-teal-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Smart Approval Routing</h3>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Applications are automatically routed sequentially: Health Centre Doctor &bull; Hostel Warden &bull; Faculty Condonation.
            </p>
          </div>

          <div className={`glass-panel p-6 rounded-3xl border border-zinc-800/80 space-y-4 hover:border-emerald-500/30 transition ${darkMode ? 'bg-[#0B1110]/80' : 'bg-white'}`}>
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>SLA-Based Processing</h3>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Strict 24h and 48h turnaround timers prevent delays, triggering automatic notifications and escalations.
            </p>
          </div>

          <div className={`glass-panel p-6 rounded-3xl border border-zinc-800/80 space-y-4 hover:border-emerald-500/30 transition ${darkMode ? 'bg-[#0B1110]/80' : 'bg-white'}`}>
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-teal-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>One-Click Condonation</h3>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Teaching faculty can review student certificate details and condone class absences with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faqs" className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-12 relative z-10">
        <div className="text-center mb-10 space-y-2">
          <h2 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Frequently Asked Questions</h2>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Find answers to common questions about JUIT attendance & condonation rules.</p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className={`rounded-2xl border transition ${darkMode ? 'bg-[#0B1110]/80 border-zinc-800/80' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className={`w-full px-6 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold ${darkMode ? 'text-slate-200 hover:text-white hover:bg-zinc-900/40' : 'text-slate-900 hover:bg-slate-50'} transition`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center text-xs font-bold border border-zinc-700">
                      {idx + 1}
                    </span>
                    {faq.question}
                  </span>
                  {isOpen ? <Minus className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Plus className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </button>
                
                {isOpen && (
                  <div className={`px-6 pb-4 text-xs leading-relaxed border-t pt-3 ${darkMode ? 'border-zinc-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className={`w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-12 border-t text-xs relative z-10 flex flex-col items-center justify-center gap-4 text-center pb-8 ${darkMode ? 'border-zinc-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
        <div className="flex flex-wrap gap-8 font-semibold">
          <a href="https://www.juit.ac.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Official University Website</a>
          <a href="https://www.juit.ac.in/contact-us" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Academic Help Desk</a>
          <a href="#how-it-works" className="hover:text-white transition">Condonation Rules</a>
        </div>
        <p className="text-[11px]">
          Jaypee University of Information Technology, Waknaghat, P.O. Waknaghat, Teh Kandaghat, Distt. Solan (H.P.) - 173234
        </p>
        <span className="text-[10px] font-medium">
          &copy; {new Date().getFullYear()} JUIT Waknaghat. Medical Leave & Attendance Condonation Webportal.
        </span>
      </footer>

    </div>
  );
}
