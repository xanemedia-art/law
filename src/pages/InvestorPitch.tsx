import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Award, ShieldCheck, DollarSign, Wallet, ArrowLeft, ArrowRight, Play, Pause,
  RotateCcw, Sparkles, TrendingUp, ShieldAlert, CheckCircle2, Video, MessageSquare, PhoneCall, RefreshCw, LogIn
} from 'lucide-react';

const SLIDES = [
  {
    id: 'cover',
    title: 'LEGALTALK INDIA',
    subtitle: 'On-Demand Legal Consultation Marketplace',
    tagline: 'Scaling access to justice for 1.4 billion citizens through metered consultations and verified legal chambers.',
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'problem',
    title: 'The Massive Problem',
    subtitle: 'Indian Legal Access is Fragmented and Opaque',
    points: [
      {
        title: '5 Crore+ Pending Cases',
        desc: 'The Indian judiciary system is severely backlogged. Citizens need fast, early-stage legal counsel to resolve disputes before they escalate to courts.'
      },
      {
        title: 'Zero Price Transparency',
        desc: 'Consultation fees are opaque and unpredictable. Citizens fear starting conversations with advocates due to hidden charges and hourly bills.'
      },
      {
        title: 'Verification Chasm',
        desc: 'It is incredibly difficult for a citizen to instantly verify State Bar Council credentials and locate an advocate who specializes in their specific legal query.'
      }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'solution',
    title: 'The Solution: LegalTalk India',
    subtitle: 'The Ubiquitous Legal Advisory Infrastructure',
    points: [
      {
        title: 'On-Demand Metered Consultations',
        desc: 'Instant, real-time voice, video, and chat consultations billed per-minute. Zero friction, fully automated.'
      },
      {
        title: 'Rigorous KYC Verification',
        desc: 'Every advocate undergoes State Bar Council verification, degree uploads, and Aadhaar/PAN validation before appearing on the client roster.'
      },
      {
        title: 'Embedded Wallets',
        desc: 'Clients load funds dynamically. Automatic transaction ledger handles live per-minute deductions and advocate earnings distribution.'
      }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'tech',
    title: 'Disruptive Tech Architecture',
    subtitle: 'Engineered for Performance and Compliance',
    details: [
      { area: 'Communications', tech: 'WebRTC / Agora Voice & Video SDK' },
      { area: 'Database & Auth', tech: 'Supabase Postgres + Realtime replication + OTP logic' },
      { area: 'Compliance Audits', tech: 'Secure storage for LLB Degrees and Certificates of Practice (COP)' },
      { area: 'Billing Ledger', tech: 'Precision transactions ledger with a 20% platform rake / 80% advocate split' }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'business-model',
    title: 'A Profitable Marketplace Engine',
    subtitle: 'Double-Sided Revenue Streams',
    models: [
      {
        title: 'Client Transaction Commission',
        rate: '₹10/min for calls, ₹5/chat flat',
        detail: 'LegalTalk India keeps a 20% commission on all metered consultations. 80% goes to the advocates.'
      },
      {
        title: 'Advocate Annual SaaS Subscription',
        rate: '₹1,200/Year subscription fee',
        detail: 'Advocates pay a recurring yearly listing and workspace fee to host their virtual chambers and capture client consultation traffic.'
      },
      {
        title: 'Citizen Onboarding Hook',
        rate: '2 Mins Free Voice/Video, 10 Chats Free',
        detail: 'Sponsored onboarding tier to drive user acquisition. Costs are absorbed inside marketing parameters to build a sticky advisory loop.'
      }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'sandbox',
    title: 'Interactive Investor Sandbox',
    subtitle: 'Simulate Live Operations & Financial Flywheel',
    accent: 'from-amber-600 to-yellow-600'
  }
];

export default function InvestorPitch({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const navigate = useNavigate();

  // Auto-play presentation state
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Interactive Calculator State
  const [dailyCalls, setDailyCalls] = useState(1000); // call minutes per day
  const [dailyChats, setDailyChats] = useState(1500); // chats per day
  const [activeAdvocates, setActiveAdvocates] = useState(500); // subscription lawyers
  
  // Interactive KYC State
  const [kycLawyerName, setKycLawyerName] = useState('Adv. Ananya Sen');
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [kycLog, setKycLog] = useState<string[]>(['Lawyer submitted LLB degree & COP certificate.']);

  // Interactive Live Call State
  const [mockCallState, setMockCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [mockWalletBalance, setMockWalletBalance] = useState(50);
  const [mockFreeMinutes, setMockFreeMinutes] = useState(2);
  const [callDuration, setCallDuration] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);

  // Auto-play effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  // Metered call countdown simulator
  useEffect(() => {
    let timer: any = null;
    if (mockCallState === 'active') {
      timer = setInterval(() => {
        setCallDuration(prev => {
          const nextDur = prev + 1;
          
          // Every minute (simulated as every 2 seconds for visual demo speed)
          if (nextDur % 2 === 0) {
            setMockFreeMinutes(prevFree => {
              if (prevFree > 0) {
                return prevFree - 1;
              } else {
                // Charge ₹10/min from wallet
                setMockWalletBalance(prevWallet => {
                  const nextWallet = prevWallet - 10;
                  if (nextWallet <= 0) {
                    setMockCallState('ended');
                    clearInterval(timer);
                    return 0;
                  }
                  setTotalCharged(c => c + 10);
                  return nextWallet;
                });
                return 0;
              }
            });
          }
          return nextDur;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [mockCallState]);

  const handleNext = () => {
    setDirection(1);
    setCurrentSlideIndex(prev => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentSlideIndex(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const slideTransition = {
    x: { type: 'spring', stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 }
  };

  // Financial Calculations
  const calculatedPlatformCallRev = (dailyCalls * 10 * 30) * 0.20; // 20% platform rake on ₹10/min calls
  const calculatedPlatformChatRev = (dailyChats * 5 * 30) * 0.20; // 20% platform rake on ₹5/chat
  const calculatedPlatformSaaSRev = (activeAdvocates * 1200) / 12; // Monthly SaaS subscriptions revenue
  const totalMonthlyPlatformRev = calculatedPlatformCallRev + calculatedPlatformChatRev + calculatedPlatformSaaSRev;
  const advocateTotalMonthlyEarnings = ((dailyCalls * 10 * 30) + (dailyChats * 5 * 30)) * 0.80;

  const handleKycApprove = () => {
    setKycStatus('verified');
    setKycLog(prev => [...prev, 'Admin approved Aadhaar verification.', 'Virtual Chambers activated on Public Marketplace.']);
  };

  const handleKycReject = () => {
    setKycStatus('rejected');
    setKycLog(prev => [...prev, 'Verification failed: Inconsistent bar association enrollment number.']);
  };

  const handleKycReset = () => {
    setKycStatus('pending');
    setKycLog(['Lawyer submitted LLB degree & COP certificate.']);
  };

  const startMockCall = () => {
    setMockCallState('calling');
    setTimeout(() => {
      setMockCallState('active');
      setCallDuration(0);
      setTotalCharged(0);
    }, 1500);
  };

  const stopMockCall = () => {
    setMockCallState('ended');
  };

  const resetMockCall = () => {
    setMockCallState('idle');
    setMockWalletBalance(50);
    setMockFreeMinutes(2);
    setCallDuration(0);
    setTotalCharged(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFBF7] via-[#F7F5F0] to-[#EFECE6] text-slate-800 flex flex-col justify-between font-sans selection:bg-amber-500/25 overflow-x-hidden relative">
      
      {/* LUXE AMBIENT ORBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/5 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-amber-100/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm shadow-amber-900/5">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-500 hover:text-amber-600 transition-all p-2 rounded-lg hover:bg-amber-50/50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-2.5 rounded-xl shadow-md border border-amber-400/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-sm tracking-tight block leading-none text-slate-900">LEGALTALK</span>
              <span className="text-[8px] font-bold tracking-widest text-amber-600 block uppercase font-mono mt-0.5">Investor Deck</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-250/30 rounded-full px-3 py-1 text-xs font-semibold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Interactive Deck V1.0</span>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-full border border-slate-205 bg-white hover:bg-amber-50/30 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center relative z-10">
        
        {/* SLIDE CARD */}
        <div className="bg-white/95 border border-amber-100/40 rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-950/5 relative min-h-[490px] flex flex-col justify-between backdrop-blur-xl">
          
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 rounded-t-3xl overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentSlideIndex + 1) / SLIDES.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Slide Content */}
          <div className="flex-1 flex flex-col justify-center my-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ x: direction * 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -direction * 50, opacity: 0 }}
                transition={slideTransition}
                className="space-y-6"
              >
                {/* 1. COVER SLIDE */}
                {SLIDES[currentSlideIndex].id === 'cover' && (
                  <div className="text-center max-w-3xl mx-auto space-y-6">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/50 text-amber-850 px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-wide"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>REVOLUTIONIZING INDIAN LEGAL TECH</span>
                    </motion.div>
                    
                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-slate-900 leading-none">
                      {SLIDES[currentSlideIndex].title}
                    </h1>
                    
                    <p className="text-lg sm:text-xl font-bold text-amber-600 font-serif italic">
                      {SLIDES[currentSlideIndex].subtitle}
                    </p>
                    
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
                      {SLIDES[currentSlideIndex].tagline}
                    </p>

                    <div className="pt-6 flex justify-center gap-4">
                      <button 
                        onClick={handleNext}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer border border-amber-400"
                      >
                        <span>Start Pitch Deck</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. PROBLEM SLIDE */}
                {SLIDES[currentSlideIndex].id === 'problem' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">The Market Opportunity</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].points?.map((p, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 relative hover:border-amber-500/40 hover:shadow-lg transition-all">
                          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-50 rounded-tr-2xl rounded-bl-3xl flex items-center justify-center font-bold text-amber-600 font-mono text-sm border-l border-b border-slate-205/80">
                            0{idx + 1}
                          </div>
                          <h3 className="font-bold text-base text-slate-900 pr-6">{p.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SOLUTION SLIDE */}
                {SLIDES[currentSlideIndex].id === 'solution' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">The Disruptive Innovation</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].points?.map((p, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 relative hover:border-amber-500/40 hover:shadow-lg transition-all">
                          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-50 rounded-tr-2xl rounded-bl-3xl flex items-center justify-center font-bold text-amber-600 font-mono text-sm border-l border-b border-slate-205/80">
                            0{idx + 1}
                          </div>
                          <h3 className="font-bold text-base text-slate-900 pr-6">{p.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. TECH ARCHITECTURE SLIDE */}
                {SLIDES[currentSlideIndex].id === 'tech' && (
                  <div className="grid md:grid-cols-12 gap-8 items-center text-left">
                    <div className="md:col-span-5 space-y-4">
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Built for Scale</span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
                        Compliant & Secure Infrastructure
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        We avoid unverified legal advisors and messy fee setups. LegalTalk India acts as the technological infrastructure guaranteeing certified advocate verification and automatic metered microtransactions.
                      </p>
                      
                      <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">Bar Council Adherent</strong>
                          <span className="block text-[10px] text-slate-500 leading-relaxed font-medium mt-0.5">Fully aligned with Indian advocate marketing rules by offering directory index services without active solicitation.</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
                      <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">Technological Modules</h3>
                      <div className="space-y-3">
                        {SLIDES[currentSlideIndex].details?.map((d, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                            <span className="text-xs text-slate-655 font-semibold">{d.area}</span>
                            <span className="text-xs font-bold text-amber-700 font-mono bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/40">
                              {d.tech}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. BUSINESS MODEL SLIDE */}
                {SLIDES[currentSlideIndex].id === 'business-model' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Economics of LegalTalk</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        High Yield Revenue Channels
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].models?.map((m, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-sm">
                          <div className="space-y-3">
                            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wide">{m.title}</h3>
                            <span className="block text-xl font-display font-black text-amber-600">{m.rate}</span>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{m.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. INTERACTIVE SANDBOX SLIDE */}
                {SLIDES[currentSlideIndex].id === 'sandbox' && (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Live Interactive Demo</span>
                        <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-1">
                          {SLIDES[currentSlideIndex].subtitle}
                        </h2>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link to="/login" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-slate-200">
                          <LogIn className="w-3.5 h-3.5 text-slate-500" />
                          <span>Login Sandbox</span>
                        </Link>
                      </div>
                    </div>

                    {/* THREE PLAYGROUND MODULES */}
                    <div className="grid lg:grid-cols-12 gap-6 pt-2">
                      
                      {/* Module A: Financial Flywheel Calculator */}
                      <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                          <span>Platform Revenue Estimator</span>
                        </h3>
                        
                        <div className="space-y-3 text-xs">
                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-slate-500 font-medium">Daily Consult Minutes</span>
                              <strong className="text-slate-850 font-mono">{dailyCalls.toLocaleString()} min</strong>
                            </div>
                            <input 
                              type="range" 
                              min="100" 
                              max="10000" 
                              step="100"
                              value={dailyCalls}
                              onChange={(e) => setDailyCalls(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-slate-500 font-medium">Daily Chats Handled</span>
                              <strong className="text-slate-850 font-mono">{dailyChats.toLocaleString()} chats</strong>
                            </div>
                            <input 
                              type="range" 
                              min="100" 
                              max="10000" 
                              step="100"
                              value={dailyChats}
                              onChange={(e) => setDailyChats(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-slate-500 font-medium">Active Subscribed Advocates</span>
                              <strong className="text-slate-850 font-mono">{activeAdvocates.toLocaleString()} advocates</strong>
                            </div>
                            <input 
                              type="range" 
                              min="50" 
                              max="5000" 
                              step="50"
                              value={activeAdvocates}
                              onChange={(e) => setActiveAdvocates(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="border-t border-slate-150 pt-4 space-y-2 text-xs">
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Advocate Payouts (80%)</span>
                            <span className="font-bold font-mono text-slate-800">₹{advocateTotalMonthlyEarnings.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl">
                            <span className="font-bold text-amber-800 text-[10px] uppercase tracking-wider">Net Platform Revenue</span>
                            <span className="font-display font-black text-sm text-amber-600 font-mono">
                              ₹{Math.round(totalMonthlyPlatformRev).toLocaleString()}/mo
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Module B: Real-Time Metered Billing Simulator */}
                      <div className="lg:col-span-4 bg-white border border-slate-205 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <Video className="w-4 h-4 text-amber-600" />
                            <span>Metered Consultation Billing</span>
                          </h3>

                          {mockCallState === 'idle' && (
                            <div className="text-center py-6 space-y-3">
                              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                                <PhoneCall className="w-5 h-5" />
                              </div>
                              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                                Client has <strong>2 free minutes</strong> and a <strong>₹50 wallet</strong>. Call costs ₹10/min after free limits.
                              </p>
                              <button 
                                onClick={startMockCall}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-all border border-amber-400"
                              >
                                Trigger Mock Call
                              </button>
                            </div>
                          )}

                          {mockCallState === 'calling' && (
                            <div className="text-center py-8 space-y-2">
                              <span className="block w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping mx-auto" />
                              <strong className="block text-xs text-amber-600 font-mono uppercase tracking-widest mt-2">Connecting Peer...</strong>
                            </div>
                          )}

                          {mockCallState === 'active' && (
                            <div className="bg-slate-50 border border-amber-100 p-4 rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 text-emerald-600 font-semibold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                  <span>Live Stream</span>
                                </span>
                                <span className="font-mono text-slate-500">Duration: {callDuration}s (Simulated Min: {Math.floor(callDuration/2)}m)</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
                                  <span className="block text-[9px] text-slate-450 uppercase font-mono">Free Tier</span>
                                  <strong className="block font-mono text-emerald-650">{mockFreeMinutes} min left</strong>
                                </div>
                                <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
                                  <span className="block text-[9px] text-slate-450 uppercase font-mono">Wallet balance</span>
                                  <strong className="block font-mono text-slate-800">₹{mockWalletBalance}</strong>
                                </div>
                              </div>

                              <button 
                                onClick={stopMockCall}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2 rounded-lg cursor-pointer"
                              >
                                End Session
                              </button>
                            </div>
                          )}

                          {mockCallState === 'ended' && (
                            <div className="bg-slate-50 p-4 rounded-xl text-center space-y-2 border border-slate-200 text-xs">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                              <strong className="block text-slate-850">Call Disconnected</strong>
                              <span className="block text-[10px] text-slate-500 leading-relaxed font-medium">
                                Wallet debited by <strong>₹{totalCharged}</strong>. Advocate receives 80% split (₹{totalCharged * 0.80}) into virtual chambers account.
                              </span>
                              <button 
                                onClick={resetMockCall}
                                className="mt-2 text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 justify-center mx-auto font-bold"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Retry simulation
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-450 leading-relaxed pt-2 border-t border-slate-100 font-medium">
                          Agora SDK is fully integrated to bind metered billing to the actual channel connection timestamps.
                        </div>
                      </div>

                      {/* Module C: Interactive KYC Audit Flow */}
                      <div className="lg:col-span-4 bg-white border border-slate-205 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-655" />
                            <span>Advocate Credentials Registry</span>
                          </h3>

                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 text-xs text-left">
                            <div className="flex justify-between items-center">
                              <strong className="text-slate-800 font-bold">{kycLawyerName}</strong>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                kycStatus === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' :
                                'bg-rose-100 text-rose-800 border border-rose-250'
                              }`}>
                                {kycStatus}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 text-[10px] text-slate-600 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-slate-150">
                              <div>LLB: University of Delhi (2015)</div>
                              <div>Bar Enrolment No: D/4021/2015</div>
                              <div>KYC status: Aadhaar & PAN Match</div>
                            </div>

                            <div className="flex gap-2 pt-1.5">
                              {kycStatus === 'pending' ? (
                                <>
                                  <button 
                                    onClick={handleKycApprove}
                                    className="flex-1 bg-emerald-605 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 rounded-lg cursor-pointer transition-colors"
                                  >
                                    Approve Advocate
                                  </button>
                                  <button 
                                    onClick={handleKycReject}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-rose-600 border border-slate-200 font-bold text-[10px] py-2 rounded-lg cursor-pointer transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={handleKycReset}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-slate-200 transition-colors"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Re-trigger KYC Audit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-[9px] text-slate-500 h-24 overflow-y-auto space-y-1.5 font-mono">
                          <span className="block font-bold text-slate-400 mb-1">AUDIT LOG:</span>
                          {kycLog.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span className="text-amber-500">▶</span>
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Deck Nav Controls */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-6">
            <span className="text-xs text-slate-450 font-bold font-mono">
              SLIDE {currentSlideIndex + 1} OF {SLIDES.length}
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-55 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-55 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-amber-100/50 bg-white text-xs text-slate-500 z-20 shadow-sm shadow-amber-900/5">
        <div>
          <span>LegalTalk India On-Demand Advisory Marketplace. </span>
          <span className="text-amber-600 font-mono font-semibold">Confidential Pitch deck and Live sandbox system.</span>
        </div>
        <div className="flex gap-4 font-semibold">
          <Link to="/" className="text-slate-500 hover:text-amber-600 transition-colors">Client Site</Link>
          <Link to="/advocates" className="text-slate-500 hover:text-amber-600 transition-colors">Advocate Site</Link>
        </div>
      </footer>

    </div>
  );
}
