import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, ShieldAlert, Award, CreditCard, Landmark, ArrowRight, Sun, Moon } from 'lucide-react';
import { User } from '../types';

interface AdvocateExperienceProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function AdvocateExperience({ currentUser, theme, onToggleTheme }: AdvocateExperienceProps) {
  const navigate = useNavigate();

  const complianceSteps = [
    {
      title: "1. Legal Credentials Audit",
      desc: "Mandatory verification of LLB degree certificates, State Bar Council enrollment IDs, and Certificate of Practice (COP) validations to ensure complete BCI compliance."
    },
    {
      title: "2. Setting Up Virtual Chambers",
      desc: "Customise your bio, list state practice districts, configure consulting languages, and set your own metered voice/video calling rates."
    },
    {
      title: "3. Annual Registry Subscription",
      desc: "Pay the annual ₹1200 profile directory subscription fee to start listing in user searches and accept metered live client calls."
    },
    {
      title: "4. Professional Compensation",
      desc: "Receive 100% of your metered consultation fees directly. No fee splitting or commissions are charged on your counsel sessions."
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 overflow-x-hidden">
      
      {/* 1. NAVIGATION BAR */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-amber-500/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-2.5 rounded-xl shadow-lg border border-amber-400/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white block leading-none">LEGALTALK</span>
              <span className="text-[9px] font-bold tracking-widest text-amber-500 block mt-1 uppercase font-mono">Chambers</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400">
            <Link to="/" className="hover:text-amber-500 dark:hover:text-amber-450 transition-colors">Client Portal</Link>
            <a href="#compliance" className="hover:text-amber-500 dark:hover:text-amber-450 transition-colors">Onboarding Checklist</a>
            <a href="#economics" className="hover:text-amber-500 dark:hover:text-amber-450 transition-colors">Chambers Economics</a>
            <Link to="/pitch" className="text-indigo-600 dark:text-indigo-500 hover:text-indigo-500 transition-colors font-extrabold flex items-center gap-1 normal-case">Investor Deck ↗</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme switcher button */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-550 dark:text-slate-400 hidden sm:inline">Active: <strong className="text-slate-850 dark:text-white">{currentUser.name}</strong></span>
                <button 
                  onClick={() => {
                    if (currentUser.role === 'client') navigate('/client');
                    else if (currentUser.role === 'lawyer') navigate('/lawyer');
                    else navigate('/hidden-admin-portal');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs px-5.5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Workspace
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold px-4 py-2.5 transition-all">Sign In</Link>
                <Link 
                  to="/register" 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs px-5.5 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Onboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. DIGNIFIED HERO SECTION */}
      <section className="relative py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-955/60 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 font-semibold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 font-mono"
        >
          <Award className="w-3.5 h-3.5 text-amber-500" /> Advocate Registry and Virtual Chambers
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6 max-w-4xl"
        >
          Build Your Virtual Practice with <span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent italic font-serif font-normal">Sovereignty</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base sm:text-lg text-slate-655 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Advocates face severe billing leakage, client acquisition hurdles, and insecure collection systems. LegalTalk provides a verified metered workspace built specifically under state Bar policies.
        </motion.p>

        <div className="flex gap-4 z-10">
          <Link 
            to="/register" 
            className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl transition-all shadow-lg shadow-amber-500/10"
          >
            Submit Credentials Application
          </Link>
          <Link 
            to="/login" 
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
          >
            Access Chambers Workspace
          </Link>
        </div>
      </section>

      {/* 3. COMPLIANCE & CHECKLIST SECTION */}
      <section id="compliance" className="bg-white dark:bg-slate-900/50 py-20 border-y border-slate-200 dark:border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">Registry Onboarding Framework</h2>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-mono uppercase tracking-widest font-bold">Standardised verification workflows for advocates</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceSteps.map((step, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-amber-500/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-3">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 mt-12 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs max-w-3xl mx-auto">
            <div className="flex gap-3 items-center">
              <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-500 shrink-0" />
              <p className="text-black leading-relaxed">
                <strong>Bar Compliance Notice:</strong> Under Section 36 of the Advocates Act, 1961, we enforce strict review criteria. No advertising, solicitation, or direct endorsement claims are permitted on client-facing search rosters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ECONOMICS SECTION */}
      <section id="economics" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">Fair and Structured Chambers Economics</h2>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-mono uppercase tracking-widest font-bold">Virtual Chambers payout rules</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-205 dark:border-slate-800 text-center flex flex-col justify-between">
            <div>
              <Landmark className="w-8 h-8 text-amber-500 mx-auto mb-4" />
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">100% Payout</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Under BCI Rule 18, you receive 100% of all consultation fees earned from calls and text chats. The platform does not take any cut.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-205 dark:border-slate-800 text-center flex flex-col justify-between">
            <div>
              <CreditCard className="w-8 h-8 text-amber-500 mx-auto mb-4" />
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">Flat Annual Fee</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Monetization relies entirely on a flat directory registry fee of ₹1,200 per year. There are absolutely no transactional commissions.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-205 dark:border-slate-800 text-center flex flex-col justify-between">
            <div>
              <Scale className="w-8 h-8 text-amber-500 mx-auto mb-4" />
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">Strict BCI Compliance</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">We strictly enforce BCI Rule 36 and Rule 18 guidelines to ensure a legal, clean, and non-exploitative marketplace space.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-500 py-12 text-center px-4 font-mono text-[11px] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-black text-sm tracking-widest">
            <Scale className="w-4 h-4 text-amber-550" /> LEGALTALK INDIA
          </div>
          <span>&copy; {new Date().getFullYear()} LegalTalk India Private Limited. All Rights Reserved.</span>
          <div className="flex gap-4 font-sans font-bold text-slate-500 dark:text-slate-455">
            <Link to="/" className="hover:text-amber-500 dark:hover:text-white transition-colors">Client Portal</Link>
            {currentUser?.role === 'admin' && (
              <Link to="/hidden-admin-portal" className="text-amber-500 hover:text-amber-400 transition-colors">Admin Console</Link>
            )}
          </div>
        </div>
      </footer>
      {/* FLOATING INVESTOR BADGE */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link 
          to="/pitch"
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 dark:bg-slate-900/95 dark:hover:bg-slate-800 text-white text-[10px] font-bold py-2.5 px-4 rounded-full border border-indigo-500/30 hover:border-indigo-500 shadow-xl transition-all tracking-wide"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          <span>Interactive Investor Pitch Deck ↗</span>
        </Link>
      </div>
    </div>
  );
}
