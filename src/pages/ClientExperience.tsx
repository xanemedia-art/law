import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Search, Sparkles, MessageSquare, PhoneCall, Video, 
  ShieldCheck, ArrowRight, Sun, Moon, Menu, X, Zap, Award, Clock, Lock 
} from 'lucide-react';
import { User } from '../types';
import { openAIChat } from '../components/AIAssistant';

interface ClientExperienceProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function ClientExperience({ currentUser, theme, onToggleTheme }: ClientExperienceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const quickFilterChips = [
    "Mutual Consent Divorce",
    "Property Title Verification",
    "BNS Criminal Bail",
    "Cheque Bounce Sec 138",
    "Consumer Rights Refund",
    "Cyber Crime / Fraud"
  ];

  const problemStatements = [
    {
      title: "Mutual Consent Divorce",
      act: "Hindu Marriage Act, Sec 13B",
      desc: "Navigating marital separations can be emotionally draining. Get clear counsel on child custody, mutual alimony structures, 6-month cooling period waivers, and court proceedings."
    },
    {
      title: "Property & Title Verification",
      act: "Transfer of Property Act, 1882",
      desc: "Prevent fraudulent land deals with comprehensive 30-year Encumbrance Certificate (EC) audit, Khata transfer compliance, and verified mutation deed scrutiny."
    },
    {
      title: "Anticipatory & Regular Bail",
      act: "Bharatiya Nagarik Suraksha Sanhita (BNSS)",
      desc: "Facing police interrogation or potential arrest? Consult criminal defense advocates for immediate 24/7 drafting of Section 482 quashing petitions and anticipatory bail."
    },
    {
      title: "Cheque Bounce Defense & Notices",
      act: "Negotiable Instruments Act, Sec 138",
      desc: "Strict 30-day statutory notice requirements for dishonored cheques. Recover dues swiftly or defend against frivolous summons with verified trial advocates."
    },
    {
      title: "Consumer Rights & Fraud Refunds",
      act: "Consumer Protection Act, 2019",
      desc: "Resolve unfair trade practices, insurance claim denials, defective vehicles, and unauthorized debit charges before District & State Consumer Commissions."
    },
    {
      title: "Wrongful Termination & Notice Pay",
      act: "Industrial Disputes & State Shops Acts",
      desc: "Protect your career against illegal PIP terminations, withheld severance, PF settlement delays, and unfair non-compete clauses under Indian labour jurisprudence."
    }
  ];

  const consultationChannels = [
    {
      icon: Video,
      title: "Live Video Counsel",
      rate: "₹10 / min",
      badge: "Face-to-Face",
      desc: "Confidential, encrypted 1-on-1 video consultations. Share documents, court notices, and agreements live.",
      action: "Start Video Session",
      link: "/client"
    },
    {
      icon: PhoneCall,
      title: "Private Voice Dispatch",
      rate: "₹10 / min",
      badge: "Ultra Low Latency",
      desc: "Quick, discreet phone calls with verified advocates without revealing your personal phone number.",
      action: "Connect Over Call",
      link: "/client"
    },
    {
      icon: MessageSquare,
      title: "Statutory Case Chat",
      rate: "₹5 / flat query",
      badge: "File Reviews",
      desc: "Send legal notices, contracts, and case summaries for structured written legal opinions within hours.",
      action: "Initiate Case Chat",
      link: "/client"
    },
    {
      icon: Sparkles,
      title: "AI Statutory Triage",
      rate: "Free & Instant",
      badge: "XANE AI",
      desc: "24/7 preliminary case classification, section lookups under BNS/IPC, and advocate escalation.",
      action: "Launch Free AI Triage",
      isAI: true
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/client');
    }
  };

  const handleChipClick = (chip: string) => {
    setSearchQuery(chip);
    navigate(`/client?search=${encodeURIComponent(chip)}`);
  };

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
                  India • Citizen Portal
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <a href="#channels" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Channels</a>
            <a href="#problems" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Practice Areas</a>
            <a href="#pricing" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Pricing & Fees</a>
            <button 
              type="button"
              onClick={() => openAIChat()}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 normal-case cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Legal Assistant
            </button>
            <Link to="/advocates" className="text-slate-700 dark:text-slate-200 hover:text-amber-500 transition-colors">For Advocates</Link>
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
                  Enter Portal
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-bold px-3.5 py-2 transition-all rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
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
                <a 
                  href="#channels" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  Consultation Channels
                </a>
                <a 
                  href="#problems" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  Practice Areas
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  Pricing & Wallet Top-up
                </a>
                <button 
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAIChat();
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2 text-left cursor-pointer w-full"
                >
                  <Sparkles className="w-4 h-4" /> AI Legal Assistant (Free)
                </button>
                <Link 
                  to="/advocates" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  For Advocates & Chambers
                </Link>
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
                      if (currentUser.role === 'client') navigate('/client');
                      else if (currentUser.role === 'lawyer') navigate('/lawyer');
                      else navigate('/hidden-admin-portal');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl transition-all text-center"
                  >
                    Enter Workspace ({currentUser.name})
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="liquid-glass text-center py-2.5 rounded-xl font-bold text-xs"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-center py-2.5 rounded-xl font-bold text-xs"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. LUMINOUS HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        
        {/* Subtle Pill Tag */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 liquid-glass-pill px-4 py-1.5 rounded-full mb-6 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200 font-mono">
            Direct Bar-Council Access • Powered by XANE AI
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-slate-950 dark:text-white tracking-tight leading-[1.08] mb-6 max-w-4xl"
        >
          Legal Counsel That Is{' '}
          <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent italic font-serif font-normal">
            Immediate
          </span>
          , Verified & Fair.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          No opaque retainers or endless courtroom corridors. Connect directly with licensed advocates in under 60 seconds over encrypted video, phone, or instant statutory chat.
        </motion.p>

        {/* Dynamic Live Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-3xl mx-auto mb-10"
        >
          <div className="liquid-glass p-3 sm:p-4 rounded-2xl text-center">
            <span className="block font-display font-black text-lg sm:text-2xl text-slate-900 dark:text-white">100%</span>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Bar Verified</span>
          </div>
          <div className="liquid-glass p-3 sm:p-4 rounded-2xl text-center border-amber-500/20">
            <span className="block font-display font-black text-lg sm:text-2xl text-amber-600 dark:text-amber-400">&lt; 45s</span>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Mean Response</span>
          </div>
          <div className="liquid-glass p-3 sm:p-4 rounded-2xl text-center">
            <span className="block font-display font-black text-lg sm:text-2xl text-emerald-600 dark:text-emerald-400">₹0 Fee</span>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">No Brokerage</span>
          </div>
        </motion.div>

        {/* Liquid Glass Search Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl w-full mx-auto mb-6 relative z-10"
        >
          <form 
            onSubmit={handleSearchSubmit} 
            className="liquid-glass-elevated p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-amber-500/25 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 group focus-within:border-amber-500/60 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all shadow-xl"
          >
            <div className="flex-1 flex items-center pl-3 gap-3">
              <Search className="w-5 h-5 text-slate-400 dark:text-amber-400 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search practice areas, state bar councils, or describe your case..."
                className="w-full text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 bg-transparent py-2.5"
              />
            </div>
            <button 
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer shadow-md shadow-amber-500/20 shrink-0 flex items-center justify-center gap-2"
            >
              <span>Search Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Filter Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Popular:</span>
            {quickFilterChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="liquid-glass-pill px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer text-[11px]"
              >
                {chip}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. INTERACTIVE CONSULTATION CHANNELS */}
      <section id="channels" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Communication Rails
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white mt-3">
            Choose Your Counsel Mode
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Every session is end-to-end confidential and automatically billed by the minute or flat query.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consultationChannels.map((chan, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -4 }}
              className="liquid-glass-card p-6 rounded-3xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <chan.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg liquid-glass">
                    {chan.badge}
                  </span>
                </div>

                <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-1">
                  {chan.title}
                </h3>
                <div className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm mb-3">
                  {chan.rate}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {chan.desc}
                </p>
              </div>

              {chan.isAI ? (
                <button
                  type="button"
                  onClick={() => openAIChat()}
                  className="w-full py-2.5 px-4 rounded-xl liquid-glass group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-800 dark:text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{chan.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  to={chan.link || "/client"}
                  className="w-full py-2.5 px-4 rounded-xl liquid-glass group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-800 dark:text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{chan.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. PROBLEM AREAS MATRIX */}
      <section id="problems" className="py-16 liquid-glass-elevated border-y border-slate-200/60 dark:border-amber-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Statutory Advisory
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white mt-3">
              Common Legal Dilemmas Solved
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Get grounded, actionable opinions under relevant Indian Codes and Acts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {problemStatements.map((item, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -3 }}
                className="liquid-glass-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </h3>
                    <span className="self-start text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase">
                      {item.act}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Need specific review?</span>
                  <Link 
                    to={`/client?search=${encodeURIComponent(item.title)}`}
                    className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 transition-all"
                  >
                    <span>Find Specialists</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENT PRICING & WALLET TOP-UP */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Razorpay Secured Billing
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white mt-3">
            Simple, Metered Pay-As-You-Go
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            No long commitments. Recharge any amount and talk to advocates at crystal clear per-minute rates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* FREE WELCOME BONUS CARD */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group border-amber-500/30">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-mono font-extrabold tracking-wider px-3.5 py-1.5 uppercase rounded-bl-2xl">
              Welcome Bonus
            </div>
            <div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                New Citizen Starter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero friction sign-up bonus to test advocate calling immediately.
              </p>
              
              <div className="my-8 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl liquid-glass">
                  <div className="bg-amber-500/15 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-white text-base leading-tight">
                      2 Free Consultation Minutes
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Valid for any verified advocate video or voice call
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl liquid-glass">
                  <div className="bg-amber-500/15 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-white text-base leading-tight">
                      10 Free Chat Inquiries
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Case summary referrals & statutory triage
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Link 
              to="/register" 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider py-4 rounded-2xl text-center transition-all block shadow-lg shadow-amber-500/20"
            >
              Sign Up & Claim Welcome Minutes
            </Link>
          </div>

          {/* METERED LIVE RATES CARD */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Transparent Top-Up Rates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time wallet balance deducting second-by-second only during active calls.
              </p>
              
              <div className="my-8 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <Video className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Live Video Counsel</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-mono text-sm">₹10 <span className="text-[11px] text-slate-500 font-normal">/ min</span></strong>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Private Voice Dispatch</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-mono text-sm">₹10 <span className="text-[11px] text-slate-500 font-normal">/ min</span></strong>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Statutory Case Chat</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-mono text-sm">₹5 <span className="text-[11px] text-slate-500 font-normal">/ flat</span></strong>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Credentials & BCI Audit</span>
                  </div>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">Included (Free)</strong>
                </div>
              </div>
            </div>

            <Link 
              to="/login" 
              className="liquid-glass hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider py-4 rounded-2xl text-center transition-all block border border-slate-300/60 dark:border-slate-700/60"
            >
              Access Wallet & Top-Up
            </Link>
          </div>

        </div>
      </section>

      {/* 6. AI ASSISTANT PROMPT CTA BANNER */}
      <section className="liquid-glass-elevated py-16 border-t border-slate-200/60 dark:border-amber-500/15">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-4">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mb-3">
            Have an Immediate Legal Question?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8">
            Instant statutory breakdown, procedural timelines, and advocate recommendations powered by XANE AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              type="button"
              onClick={() => openAIChat()}
              className="liquid-glass text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm border border-slate-300/50 dark:border-slate-700/60 hover:border-amber-500/40 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Launch AI Assistant</span>
            </button>
            <Link 
              to="/client" 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Connect With Live Advocate</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. PREMIUM GLASS FOOTER */}
      <footer className="liquid-glass-elevated border-t border-slate-200/60 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 py-12 text-center px-4 font-mono text-[11px] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-black text-sm tracking-widest">
            <Scale className="w-4 h-4 text-amber-500" /> LEGALTALK INDIA
          </div>
          <div className="flex items-center gap-1.5 font-sans text-slate-500 dark:text-slate-400">
            <span>Built By</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full tracking-wide">
              Xane Media
            </span>
          </div>
          <span>&copy; {new Date().getFullYear()} LegalTalk India Private Limited. All Rights Reserved.</span>
          <div className="flex gap-4 font-sans font-bold">
            <Link to="/advocates" className="hover:text-amber-500 transition-colors">Advocate Chambers</Link>
            {currentUser?.role === 'admin' && (
              <Link to="/hidden-admin-portal" className="text-amber-500 hover:underline">Admin Console</Link>
            )}
          </div>
        </div>
      </footer>

      {/* FLOATING INVESTOR BADGE */}
      <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
        <Link 
          to="/pitch"
          className="flex items-center gap-2 liquid-glass-pill py-2.5 px-4 rounded-full text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-indigo-500/30 hover:border-indigo-500 shadow-xl transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>Interactive Investor Deck ↗</span>
        </Link>
      </div>

    </div>
  );
}
