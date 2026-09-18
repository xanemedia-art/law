import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, ShieldAlert, Award, CreditCard, Landmark, ArrowRight, 
  Sun, Moon, Menu, X, CheckCircle2, ShieldCheck, Zap, DollarSign, Users, Briefcase
} from 'lucide-react';
import { User } from '../types';

interface AdvocateExperienceProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function AdvocateExperience({ currentUser, theme, onToggleTheme }: AdvocateExperienceProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [monthlyHours, setMonthlyHours] = useState(25); // Estimated consultation hours per month
  const [ratePerMinute, setRatePerMinute] = useState(15); // Rate in INR / min
  const navigate = useNavigate();

  // Calculated economics
  const totalMinutes = monthlyHours * 60;
  const grossMonthlyEarnings = totalMinutes * ratePerMinute;
  const agencyDeduction = grossMonthlyEarnings * 0.35; // 35% typical agency cut
  const legaltalkNetMonthly = grossMonthlyEarnings; // 100% payout to advocate
  const annualFlatFee = 1200; // Flat yearly directory registry fee

  const complianceSteps = [
    {
      step: "01",
      title: "Credentials Verification",
      desc: "Upload State Bar Council Enrollment ID, LLB degree certification, and Certificate of Practice (COP). Verified within 24 hours under Bar Council standards."
    },
    {
      step: "02",
      title: "Virtual Chambers Setup",
      desc: "Define your practice districts, state high courts, language preferences, consultation slots, and customized per-minute voice/video rates."
    },
    {
      step: "03",
      title: "Annual Directory Listing",
      desc: "Activate your profile across verified client searches with the flat ₹1,200 annual directory fee. No other subscription or hidden charges ever."
    },
    {
      step: "04",
      title: "100% Consultation Payout",
      desc: "Receive 100% of all client consultation earnings directly. Strictly compliant with BCI Rule 18 against legal fee-splitting and broker commissions."
    }
  ];

  const valuePillars = [
    {
      icon: Landmark,
      title: "100% Sovereign Payout",
      desc: "Under Bar Council of India Rule 18, advocates cannot split legal fees. You retain 100% of your earnings from all voice, video, and chat sessions."
    },
    {
      icon: CreditCard,
      title: "Flat ₹1,200 Annual Fee",
      desc: "Our sole monetization is an annual directory registry fee of ₹1,200. Zero commission percentages taken from any consultation."
    },
    {
      icon: ShieldCheck,
      title: "Strict BCI Rule 36 Adherence",
      desc: "No touting, no bidding, and no direct solicitations. Client discoveries are grounded in geographic jurisdiction, practice area, and language."
    },
    {
      icon: Zap,
      title: "Automated Telephony & Escrow",
      desc: "Real-time WebRTC and phone routing automatically tracks call minutes and releases funds seamlessly without billing follow-ups."
    }
  ];

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 overflow-x-hidden relative">
      
      {/* 1. LIQUID GLASS FLOATING NAVIGATION */}
      <header className="sticky top-0 z-50 liquid-glass-elevated border-b border-slate-200/60 dark:border-amber-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white p-2.5 rounded-2xl shadow-lg shadow-amber-500/25 border border-amber-400/40 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white block leading-none">
                  LEGALTALK
                </span>
                <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 block mt-1 uppercase font-mono">
                  Advocate Chambers • BCI Compliant
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Client Portal</Link>
            <a href="#economics" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Chambers Economics</a>
            <a href="#compliance" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Onboarding Checklist</a>
            <a href="#pillars" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">BCI Standards</a>
            <Link to="/pitch" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors font-extrabold flex items-center gap-1 normal-case">
              Investor Deck ↗
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-850 transition-all cursor-pointer text-slate-700 dark:text-slate-300 shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Auth CTAs */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">●</span> {currentUser.name}
                </span>
                <button 
                  onClick={() => {
                    if (currentUser.role === 'client') navigate('/client');
                    else if (currentUser.role === 'lawyer') navigate('/lawyer');
                    else navigate('/hidden-admin-portal');
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Enter Chambers
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-bold px-3.5 py-2 transition-all rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                >
                  Advocate Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Apply to Join
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200/70 dark:border-slate-800/80 liquid-glass-card px-4 py-5 space-y-4"
            >
              <div className="flex flex-col gap-3 font-semibold text-sm">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  Citizen Client Portal
                </Link>
                <a 
                  href="#economics" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  Chambers Economics
                </a>
                <a 
                  href="#compliance" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  Verification Checklist
                </a>
                <a 
                  href="#pillars" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  BCI Rules 36 & 18 Standards
                </a>
                <Link 
                  to="/pitch" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-500/10 transition-colors"
                >
                  Investor Pitch Deck ↗
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-col gap-2">
                {currentUser ? (
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (currentUser.role === 'lawyer') navigate('/lawyer');
                      else if (currentUser.role === 'client') navigate('/client');
                      else navigate('/hidden-admin-portal');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold py-3 rounded-xl transition-all text-center"
                  >
                    Open Workspace ({currentUser.name})
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="liquid-glass text-center py-2.5 rounded-xl font-bold text-xs"
                    >
                      Advocate Login
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-center py-2.5 rounded-xl font-bold text-xs"
                    >
                      Submit Application
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. DIGNIFIED HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 liquid-glass-pill px-4 py-1.5 rounded-full mb-6"
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200 font-mono">
            State Bar Council Verification System
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-slate-950 dark:text-white tracking-tight leading-[1.08] mb-6 max-w-4xl"
        >
          Build Your Virtual Practice With{' '}
          <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent italic font-serif font-normal">
            Complete Sovereignty
          </span>
          .
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Advocates suffer heavy revenue leakage, unpaid client calls, and commission-taking middlemen. LegalTalk gives you a digital chambers with automated per-minute billing and zero commission fees.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 z-10 w-full sm:w-auto">
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>Submit Verification Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            to="/login" 
            className="liquid-glass hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-2xl transition-all border border-slate-300/60 dark:border-slate-700/60 flex items-center justify-center"
          >
            Access Chambers Workspace
          </Link>
        </div>
      </section>

      {/* 3. INTERACTIVE CHAMBERS ECONOMICS CALCULATOR */}
      <section id="economics" className="py-20 liquid-glass-elevated border-y border-slate-200/60 dark:border-amber-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Financial Transparency
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white mt-3">
              Simulate Your Practice Earnings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              See the exact difference between LegalTalk’s 100% sovereign payout vs typical legal platforms.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Controls */}
            <div className="lg:col-span-6 liquid-glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <span>Practice Consultation Inputs</span>
              </h3>

              {/* Slider 1: Monthly Consultation Hours */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Monthly Online Counsel Time
                  </label>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                    {monthlyHours} Hours/mo ({totalMinutes} mins)
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="80" 
                  step="5"
                  value={monthlyHours}
                  onChange={(e) => setMonthlyHours(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>5 hrs (Part-Time)</span>
                  <span>40 hrs (Steady)</span>
                  <span>80 hrs (Active Chambers)</span>
                </div>
              </div>

              {/* Slider 2: Consultation Fee */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Your Metered Call Fee
                  </label>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                    ₹{ratePerMinute} / minute
                  </span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  step="5"
                  value={ratePerMinute}
                  onChange={(e) => setRatePerMinute(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>₹10/min</span>
                  <span>₹25/min</span>
                  <span>₹50/min (Senior Counsel)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl liquid-glass text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <span className="font-bold block text-slate-700 dark:text-slate-300">Monetization Structure:</span>
                <p>• ₹0 commission on client consultations.</p>
                <p>• Only flat ₹1,200 annual directory listing fee.</p>
              </div>
            </div>

            {/* Comparison Display */}
            <div className="lg:col-span-6 space-y-4">
              {/* LegalTalk Sovereign Chambers Card */}
              <div className="liquid-glass-card p-6 rounded-3xl border-2 border-emerald-500/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    LegalTalk Chambers (100% Payout)
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mb-1">
                  ₹{legaltalkNetMonthly.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-500 font-sans">/ month</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total annual earnings: ₹{(legaltalkNetMonthly * 12).toLocaleString('en-IN')} (minus single flat ₹1,200/yr registry)
                </p>
              </div>

              {/* Traditional Agency Card */}
              <div className="liquid-glass p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 opacity-80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full">
                    Broker / Agency Cut (-35%)
                  </span>
                  <span className="text-xs font-mono text-rose-500 font-bold">-₹{agencyDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="font-display font-bold text-2xl text-slate-600 dark:text-slate-400 mb-1">
                  ₹{(grossMonthlyEarnings - agencyDeduction).toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-500 font-sans">/ month</span>
                </div>
                <p className="text-xs text-slate-400">
                  Advocates lose over ₹{(agencyDeduction * 12).toLocaleString('en-IN')} every year in middlemen cuts.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. COMPLIANCE & ONBOARDING WORKFLOW */}
      <section id="compliance" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Onboarding Protocol
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white mt-3">
            Simple 4-Step Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Every advocate on LegalTalk is verified against State Bar Council enrollments.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {complianceSteps.map((step, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -4 }}
              className="liquid-glass-card p-6 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <span className="font-mono font-black text-2xl text-amber-500/80 mb-3 block">
                  {step.step}
                </span>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BCI Regulatory Notice */}
        <div className="liquid-glass-card border-amber-500/30 p-6 rounded-3xl mt-12 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">
            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <strong className="text-slate-950 dark:text-white">Statutory Bar Compliance:</strong> In accordance with Section 36 of the Advocates Act, 1961, we maintain zero advertising, no touting, and no comparative rankings. Search displays are strictly jurisdiction and language indexed.
            </p>
          </div>
        </div>
      </section>

      {/* 5. VALUE PILLARS SECTION */}
      <section id="pillars" className="py-20 liquid-glass-elevated border-t border-slate-200/60 dark:border-amber-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Core Principles
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white mt-3">
              Why Practicing Advocates Choose Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Designed around the dignity of the legal profession.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuePillars.map((pillar, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -3 }}
                className="liquid-glass-card p-6 rounded-3xl"
              >
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 w-fit mb-4">
                  <pillar.icon className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-slate-900 dark:text-white text-base mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ADVOCATE ONBOARDING CTA BANNER */}
      <section className="py-16 max-w-4xl mx-auto px-4 text-center">
        <div className="liquid-glass-card p-8 sm:p-12 rounded-3xl border-amber-500/30 space-y-6">
          <Award className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Ready to Set Up Your Virtual Chambers?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Join thousands of advocates across 24 State Bar Councils who manage metered client consultations safely and legally.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-2xl transition-all shadow-lg shadow-amber-500/20"
            >
              Start Verification Application
            </Link>
            <Link 
              to="/login" 
              className="liquid-glass text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-2xl transition-all border border-slate-300/60 dark:border-slate-700/60"
            >
              Existing Advocate Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 7. PREMIUM FOOTER */}
      <footer className="liquid-glass-elevated border-t border-slate-200/60 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 py-12 text-center px-4 font-mono text-[11px] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-black text-sm tracking-widest">
            <Scale className="w-4 h-4 text-amber-500" /> LEGALTALK INDIA • CHAMBERS
          </div>
          <div className="flex items-center gap-1.5 font-sans text-slate-500 dark:text-slate-400">
            <span>Built By</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full tracking-wide">
              Xane Media
            </span>
          </div>
          <span>&copy; {new Date().getFullYear()} LegalTalk India Private Limited. All Rights Reserved.</span>
          <div className="flex gap-4 font-sans font-bold text-slate-600 dark:text-slate-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">Client Portal</Link>
            <Link to="/pitch" className="hover:text-amber-500 transition-colors">Investor Pitch</Link>
            {currentUser?.role === 'admin' && (
              <Link to="/hidden-admin-portal" className="text-amber-500 hover:text-amber-400 transition-colors">Admin Console</Link>
            )}
          </div>
        </div>
      </footer>

      {/* FLOATING INVESTOR PITCH BADGE */}
      <div className="fixed bottom-6 left-6 z-40">
        <Link 
          to="/pitch"
          className="liquid-glass-card flex items-center gap-2.5 text-[11px] font-bold py-2.5 px-4 rounded-full border border-indigo-500/40 hover:border-indigo-400 shadow-xl transition-all text-slate-900 dark:text-white"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>Interactive Investor Pitch Deck ↗</span>
        </Link>
      </div>

    </div>
  );
}

