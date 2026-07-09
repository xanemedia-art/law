import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Users, MessageSquare, ArrowRight, Search, Sparkles, Award, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function LandingPage({ currentUser, allUsers, onSelectUser }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/client');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* 1. DEMO PORTAL IDENTITY SWITCHER BANNER */}
      <div className="bg-slate-950 text-white/90 text-xs py-2 px-4 flex flex-wrap justify-between items-center border-b border-slate-800/60 z-50 relative">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[9px] py-0.5 px-2 rounded uppercase tracking-wider font-display">
            Sandbox Panel
          </span>
          <span className="text-slate-400 hidden sm:inline font-medium">
            Toggle sandbox identity switcher below to simulate specific dashboard permissions instantly:
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
          <span className="text-slate-400 font-mono text-[11px]">Active Identity:</span>
          <select 
            value={currentUser?.id || ""} 
            onChange={(e) => {
              const selected = allUsers.find(u => u.id === e.target.value);
              if (selected) {
                onSelectUser(selected);
              }
            }}
            className="bg-slate-900 text-amber-400 font-bold text-xs rounded border border-slate-750 py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer transition-all hover:bg-slate-850"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="text-white bg-slate-900">
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. PREMIUM HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-amber-400 p-2.5 rounded-xl shadow-md border border-slate-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-2xl tracking-tight text-slate-950 block leading-none">LEGALTALK</span>
              <span className="text-[10px] font-bold tracking-widest text-amber-600 block mt-1 uppercase font-mono">India</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 hidden sm:inline">User: <strong className="text-slate-800">{currentUser.name}</strong></span>
                <button 
                  onClick={() => {
                    if (currentUser.role === 'client') navigate('/client');
                    else if (currentUser.role === 'lawyer') navigate('/lawyer');
                    else navigate('/admin');
                  }}
                  className="bg-slate-955 hover:bg-slate-850 text-white font-bold text-xs px-5.5 py-3 rounded-xl transition-all shadow-sm border border-slate-800 cursor-pointer"
                >
                  Enter Portal
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-5.5 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO & BENTO SEARCH AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center relative">
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Premium Legal Consultation Suite
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-slate-950 tracking-tight leading-[1.1] mb-6"
          >
            India's Elite Advocate <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent italic font-medium">Marketplace</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed"
          >
            Resolve complex legal issues with our AI Assistant, or connect with Bar Council-verified advocates billed dynamically second-by-second.
          </motion.p>
        </div>

        {/* BENTO SEARCH BAR */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl w-full mx-auto mb-16 relative"
        >
          <form onSubmit={handleSearchSubmit} className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-2 group transition-all focus-within:ring-4 focus-within:ring-indigo-550/10">
            <div className="flex-1 flex items-center pl-3 gap-2.5">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search practice areas, legal terms, or ask AI assistant..."
                className="w-full text-slate-800 text-sm focus:outline-none placeholder-slate-400 bg-transparent py-2.5"
              />
            </div>
            <button 
              type="submit"
              className="bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0 border border-slate-800"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* DUAL PATHWAYS & AI ASSISTANT BENTO GRID */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full"
        >
          {/* CLIENT PORTAL PATHWAY */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group premium-card"
          >
            <div>
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-650 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h2 className="font-display font-bold text-slate-950 text-2xl mb-3">Client Workspace</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-8">
                Consult state Bar verified legal advocates, manage top-up sandboxed wallets, and view seconds-based billing ledgers.
              </p>
            </div>
            <Link 
              to="/client"
              className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-wider py-4 px-5 rounded-xl transition-all text-center flex items-center justify-center gap-2 border border-slate-800 shadow-sm"
            >
              Consult Advocates <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

          {/* LAWYER PORTAL PATHWAY */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group premium-card"
          >
            <div>
              <div className="bg-amber-50 border border-amber-100 text-amber-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-5.5 h-5.5" />
              </div>
              <h2 className="font-display font-bold text-slate-950 text-2xl mb-3">Advocate Workspace</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-8">
                Complete credentials verification, configure dynamic minute pricing, toggle availability state, and withdraw earned payouts.
              </p>
            </div>
            <Link 
              to="/lawyer"
              className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-wider py-4 px-5 rounded-xl transition-all text-center flex items-center justify-center gap-2 border border-slate-800 shadow-sm"
            >
              Advocate Registry <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

          {/* AI ASSISTANT DIRECT CTA CARD */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group border border-slate-800"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-6 translate-x-6"></div>
            <div>
              <div className="bg-white/10 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/15">
                <MessageSquare className="w-5.5 h-5.5 text-indigo-300 animate-pulse" />
              </div>
              <h2 className="font-display font-bold text-white text-2xl mb-3">AI Legal Index</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-8">
                Query general rights context, Indian statutory guidelines, and procedural overviews before scheduling video sessions.
              </p>
            </div>
            <Link 
              to="/ai-assistant"
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-bold uppercase tracking-wider py-4 px-5 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-md border border-amber-500/20"
            >
              Ask AI Assistant <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

        </motion.div>
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-slate-955 border-t border-slate-900 text-slate-400 py-10 text-center px-4 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-white font-display font-black text-sm tracking-widest">
            <Scale className="w-4 h-4 text-amber-550" /> LEGALTALK INDIA
          </div>
          <span>&copy; {new Date().getFullYear()} LegalTalk India Private Limited. All Rights Reserved.</span>
          <div className="flex gap-4 font-sans font-bold">
            {currentUser?.role === 'admin' && (
              <Link to="/admin" className="text-amber-405 hover:text-amber-300 transition-colors">Admin Console</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
