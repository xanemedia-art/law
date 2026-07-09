import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Search, Sparkles, MessageSquare, PhoneCall, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import { User } from '../types';

interface ClientExperienceProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function ClientExperience({ currentUser, theme, onToggleTheme }: ClientExperienceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const problemStatements = [
    {
      title: "Mutual Consent Divorce",
      act: "Hindu Marriage Act, Sec 13B",
      desc: "Navigating marital separations can be emotionally draining. We help streamline mutual consent applications with clear counsel on custody, maintenance, and waiting periods."
    },
    {
      title: "Property & Title Disputes",
      act: "Transfer of Property Act, 1882",
      desc: "Unclear title deeds, unauthorized encroachment, and family partitions block asset wealth. Connect with land-registration advocates to review sale deeds and ownership chains."
    },
    {
      title: "Consumer Rights & Deficiencies",
      act: "Consumer Protection Act, 2019",
      desc: "Filing complaints against corporate services, defective merchandise, or financial fraud. Get advice on legal notices and drafting complaints for consumer forums."
    },
    {
      title: "BNS Criminal & Vehicular Homicide",
      act: "Bharatiya Nyaya Sanhita, Sec 106",
      desc: "Accidents and hit-and-run charges carry harsh penalties under the new BNS framework. Fast access to bail counsel and defense representation is critical."
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

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 overflow-x-hidden">
      
      {/* 1. LUXURY GLASSMAPPED NAVIGATION */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-amber-500/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-2.5 rounded-xl shadow-lg border border-amber-400/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white block leading-none">LEGALTALK</span>
              <span className="text-[9px] font-bold tracking-widest text-amber-500 block mt-1 uppercase font-mono">India</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <a href="#problems" className="hover:text-amber-500 dark:hover:text-amber-450 transition-colors">Problem Areas</a>
            <a href="#pricing" className="hover:text-amber-500 dark:hover:text-amber-450 transition-colors">Pricing & Fees</a>
            <Link to="/advocates" className="text-amber-600 dark:text-amber-500 hover:text-amber-500 transition-colors">For Advocates</Link>
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
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Active: <strong className="text-slate-800 dark:text-white">{currentUser.name}</strong></span>
                <button 
                  onClick={() => {
                    if (currentUser.role === 'client') navigate('/client');
                    else if (currentUser.role === 'lawyer') navigate('/lawyer');
                    else navigate('/hidden-admin-portal');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs px-5.5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Enter Portal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold px-4 py-2.5 transition-all">Sign In</Link>
                <Link 
                  to="/register" 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs px-5.5 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. ELEGANT HERO SECTION */}
      <section className="relative py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-955/60 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 font-semibold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 font-mono"
        >
          <Sparkles className="w-3.5 h-3.5" /> Premium Citizen Legal Support
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6 max-w-4xl"
        >
          Legal Counsel That Is <span className="bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent italic font-serif font-normal">Immediate</span> and Clear
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-455 max-w-xl mx-auto leading-relaxed mb-10"
        >
          No complex jargon or hidden retainer fees. Connect instantly with verified Advocates or check your legal options using our AI Index.
        </motion.p>

        {/* BENTO SEARCH BAR */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full mx-auto mb-16 relative z-10"
        >
          <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl shadow-2xl border border-slate-200 dark:border-amber-500/20 flex items-center gap-2 group focus-within:border-amber-500/50 transition-all">
            <div className="flex-1 flex items-center pl-3 gap-2.5">
              <Search className="w-5 h-5 text-slate-400 dark:text-amber-500/70 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search advocate practice areas, state bar councils, or describe your case..."
                className="w-full text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 bg-transparent py-2.5"
              />
            </div>
            <button 
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 shrink-0"
            >
              Search Registry
            </button>
          </form>
        </motion.div>
      </section>

      {/* 3. PROBLEM AREAS SECTION */}
      <section id="problems" className="bg-white dark:bg-slate-900/50 py-20 border-y border-slate-200 dark:border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">Understand Your Legal Standing</h2>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-mono uppercase tracking-widest font-bold">Bridging the gap to legal clarity</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {problemStatements.map((item, idx) => (
              <div key={idx} className="bg-slate-100 dark:bg-slate-950/80 p-8 rounded-3xl border border-slate-200 dark:border-amber-500/10 shadow-lg hover:border-amber-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white leading-tight">{item.title}</h3>
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-955/80 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded uppercase">{item.act}</span>
                  </div>
                  <p className="text-xs text-slate-605 dark:text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-500">Need specific advice?</span>
                  <Link to="/client" className="text-amber-600 dark:text-amber-500 hover:text-amber-500 font-bold flex items-center gap-1 transition-all">
                    Consult an Advocate <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC PRICING AND FEE TIER SECTION */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">Transparent, Dynamic Billing</h2>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-mono uppercase tracking-widest font-bold">Only pay for what you consume</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* FREE onboarding TIER CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-amber-500/20 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-955 text-[9px] font-bold tracking-wider px-3 py-1 uppercase rounded-bl-xl font-mono">
              Welcome Bonus
            </div>
            <div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">New Client Starter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Automatic signup grants to test the legal waters</p>
              
              <div className="my-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 p-2 rounded-xl">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-white text-lg leading-tight">2 Minutes Free Calls</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Applies to Video and Voice lines</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 p-2 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-white text-lg leading-tight">10 Free Chat Messages</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Quick statutory answers and referrals</span>
                  </div>
                </div>
              </div>
            </div>

            <Link 
              to="/register" 
              className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs uppercase tracking-wider py-4 rounded-xl text-center transition-all block cursor-pointer"
            >
              Sign Up & Claim Bonus
            </Link>
          </div>

          {/* PAID METERED TIER CARD */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-205 dark:border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/10 transition-all">
            <div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">Metered Live Rates</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Second-by-second billing from your top-up wallet</p>
              
              <div className="my-8 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">Live Calling (Voice/Video)</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-mono text-base">₹10 <span className="text-xs font-normal text-slate-500">/ min</span></strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">Statutory Case Chats</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-mono text-base">₹5 <span className="text-xs font-normal text-slate-500">/ flat session</span></strong>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">Verification Compliance Audit</span>
                  </div>
                  <strong className="text-emerald-600 dark:text-emerald-500 text-xs">Included</strong>
                </div>
              </div>
            </div>

            <Link 
              to="/login" 
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl text-center transition-all block border border-slate-200 dark:border-slate-800"
            >
              Access Wallet Dashboard
            </Link>
          </div>

        </div>
      </section>

      {/* 5. QUICK DUAL ACTION HERO LINKS */}
      <section className="bg-slate-100/50 dark:bg-slate-900/30 py-16 border-t border-slate-200 dark:border-amber-500/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white mb-4">Immediate Diagnostic Support</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">Not sure which legal category applies? Query our AI index for rapid statutory summaries instantly.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/ai-assistant" 
              className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-amber-500 animate-pulse" /> Consult AI Assistant
            </Link>
            <Link 
              to="/client" 
              className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              Book Advocate Live
            </Link>
          </div>
        </div>
      </section>

      {/* 6. PREMIUM FOOTER */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-500 py-12 text-center px-4 font-mono text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-black text-sm tracking-widest">
            <Scale className="w-4 h-4 text-amber-550" /> LEGALTALK INDIA
          </div>
          <span>&copy; {new Date().getFullYear()} LegalTalk India Private Limited. All Rights Reserved.</span>
          <div className="flex gap-4 font-sans font-bold text-slate-500 dark:text-slate-450">
            <Link to="/advocates" className="hover:text-amber-500 dark:hover:text-white transition-colors">Advocate Registry</Link>
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
