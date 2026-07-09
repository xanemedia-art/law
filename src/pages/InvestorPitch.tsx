import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Award, ShieldCheck, DollarSign, Wallet, ArrowLeft, ArrowRight, Play, Pause,
  RotateCcw, Sparkles, TrendingUp, ShieldAlert, CheckCircle2, Video, MessageSquare, PhoneCall, 
  RefreshCw, LogIn, FileText, Lock, BarChart3, HelpCircle, Activity, Globe, Check
} from 'lucide-react';

const SLIDES = [
  {
    id: 'cover',
    title: 'LEGALTALK INDIA',
    subtitle: 'The Ubiquitous Legal Advisory Infrastructure',
    tagline: 'Scaling access to justice for 1.4 billion citizens through metered micro-consultations and certified, audit-ready virtual chambers.',
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'problem',
    title: 'The Systemic Crisis',
    subtitle: 'India\'s Judicial Friction Demands a Pre-Litigation Solution',
    metrics: [
      { value: '5 Crore+', label: 'Pending Cases in Courts', detail: 'Creating massive gridlock; early-stage metered advisory filters out frivolous disputes before they enter courts.' },
      { value: '320+ Days', label: 'Average Time to Locate Counsel', detail: 'Opaque directories lead to extreme search friction and lost client hours.' },
      { value: '70%+', label: 'Unadvised Disputes', detail: 'Citizens compromise on critical rights due to fear of hidden retainers and upfront costs.' }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'market-opportunity',
    title: 'Market Size & Growth TAM',
    subtitle: 'Digitization of a Multi-Billion Dollar Sector',
    points: [
      {
        title: '₹25,000 Crore ($3.1B) Market',
        desc: 'The total Indian addressable legal services market, projected to grow at an 11.2% CAGR through 2030, driven by digital transactions.'
      },
      {
        title: '1.5 Million Registered Advocates',
        desc: 'A massive supplier base seeking modern digital distribution, client acquisition portals, and structured payment tools.'
      },
      {
        title: 'Mobile First Penetration',
        desc: 'With 800M+ smartphone users, on-demand metered consultations can instantly serve Tier 2, Tier 3, and rural demographics.'
      }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'product-depth',
    title: 'Product Deep-Dive',
    subtitle: 'Three Interlocking Workspaces built for India',
    roles: [
      {
        name: 'The Client Portal',
        features: ['OTP Mobile Authentication', '2 Min Free Audio/Video Trial Hook', 'Bento Search Directory with specialty matching', 'Real-time billing indicators']
      },
      {
        name: 'The Advocate Chambers',
        features: ['SaaS Rate & Schedule Configuration', 'Document Upload Portal (Degree, COP)', '₹1200/Year subscription lock', 'Direct wallet payout request ledgers']
      },
      {
        name: 'The Admin Center',
        features: ['Credential verification approvals', 'Secure invitation code generator', 'Platform transaction audit logs', 'Escrow liquidity ledger tracking']
      }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'compliance',
    title: 'BCI Compliance & Safety',
    subtitle: 'Designed Specifically to Adhere to BCI Regulations',
    compliances: [
      {
        rule: 'BCI Rule 36 Compliance',
        desc: 'We enforce a pure, passive directory indexing system. We do not solicit, advertise, or promote individual lawyers, complying fully with legal advertising restrictions.'
      },
      {
        rule: 'Rigorous Credentials Audit',
        desc: 'No lawyer can go online without uploading their LLB Degree Certificate, State Bar Council Enrollment Card, and Certificate of Practice (COP) for Admin review.'
      },
      {
        rule: 'Data Security & NDA Protocols',
        desc: 'Agora video/audio channels are end-to-end encrypted. Document uploads are stored in secure, access-controlled vaults.'
      }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'impact-report',
    title: 'Social & Systemic Impact Report',
    subtitle: 'How LegalTalk India Reshapes the Legal Landscape',
    points: [
      {
        title: 'Diverting Backlog via Pre-Litigation Counsel',
        desc: 'By providing instant, affordable ₹10/min metered consultations, we empower citizens to resolve disputes through mediation and legal notifications before entering courts.'
      },
      {
        title: 'Economic Empowerment of Young Lawyers',
        desc: 'Fresh law graduates gain immediate access to client consultation streams, breaking the traditional nepotism barrier and earning sustainable virtual salaries.'
      },
      {
        title: 'Democratization of Legal Literacy',
        desc: 'Our informational AI assistant index gives citizens free general guidance on Hindu Marriage Act, Transfer of Property Act, and Bharatiya Nyaya Sanhita (BNS) guidelines.'
      }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'investor-security',
    title: 'Investor Security & Unit Economics',
    subtitle: 'Why Our Business Model represents a High-Moat Engine',
    metrics: [
      { metric: 'Rake Rate', value: '20% commission', desc: 'Sustained transactional marketplace margins.' },
      { metric: 'LTV : CAC Ratio', value: '4.8x projected', desc: 'Low customer acquisition cost via digital pre-litigation queries.' },
      { metric: 'Payback Period', value: '2.4 Months', desc: 'Rapid marketing amortization per client.' },
      { metric: 'Annual Recurring SaaS', value: '₹1200 / Lawyer', desc: 'Predictable baseline revenue covering cloud maintenance.' }
    ],
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'financial-sandbox',
    title: 'Interactive Financial Modeler',
    subtitle: 'Play with Real-time Volumes & 3-Year Revenue Projections',
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'interactive-demo',
    title: 'Interactive Prototype Sandbox',
    subtitle: 'Test our metered billing engine, KYC flow, and transaction logs',
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'investment-ask',
    title: 'The Road Ahead & Investment Ask',
    subtitle: 'Partnering to Unlock India\'s Legal Tech Revolution',
    milestones: [
      { year: 'Phase 1: Foundation', goal: 'Verify first 10,000 Advocates across 5 target states. Deploy WebRTC metered call optimizations.' },
      { year: 'Phase 2: Growth Scale', goal: 'Integrate automated legal notice drafting and API layers for small businesses. Target 100,000 consultations/month.' },
      { year: 'Phase 3: Ubiquity', goal: 'Expand vernacular speech-to-text systems. Scale MRR to ₹10 Crore/month with a presence in all 28 states.' }
    ],
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
  const [dailyCalls, setDailyCalls] = useState(1500); // call minutes per day
  const [dailyChats, setDailyChats] = useState(2500); // chats per day
  const [activeAdvocates, setActiveAdvocates] = useState(1200); // subscription lawyers
  const [cacValue, setCacValue] = useState(150); // CAC in INR
  
  // Interactive KYC State
  const [kycLawyerName, setKycLawyerName] = useState('Adv. Ananya Sen');
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [kycLog, setKycLog] = useState<string[]>(['Lawyer submitted LLB degree & COP certificate.']);

  // Interactive Live Call State
  const [mockCallState, setMockCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [mockWalletBalance, setMockWalletBalance] = useState(60);
  const [mockFreeMinutes, setMockFreeMinutes] = useState(2);
  const [callDuration, setCallDuration] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);

  // Auto-play effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, 8500);
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
          
          // Every simulated minute (represented as every 2 seconds for visual demo speed)
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
  const platformCallRev = (dailyCalls * 10 * 30) * 0.20; // 20% platform rake on ₹10/min calls
  const platformChatRev = (dailyChats * 5 * 30) * 0.20; // 20% platform rake on ₹5/chat
  const platformSaaSRev = (activeAdvocates * 1200) / 12; // Monthly SaaS subscriptions revenue
  const totalMonthlyPlatformRev = platformCallRev + platformChatRev + platformSaaSRev;
  const advocateTotalMonthlyEarnings = ((dailyCalls * 10 * 30) + (dailyChats * 5 * 30)) * 0.80;
  
  // Advanced Projections Metrics
  const estimatedAnnualRunRate = totalMonthlyPlatformRev * 12;
  const ltvValue = (10 * 120) * 0.20 + 350; // Mock calculation based on user transactions
  const ltvToCacRatio = (ltvValue / cacValue).toFixed(1);

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
    setMockWalletBalance(60);
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
            <span>Interactive Deck V2.0</span>
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
        <div className="bg-white/95 border border-amber-100/40 rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-950/5 relative min-h-[510px] flex flex-col justify-between backdrop-blur-xl">
          
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
                      <span>THE LEGAL TECH REVOLUTION</span>
                    </motion.div>
                    
                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-slate-900 leading-none">
                      {SLIDES[currentSlideIndex].title}
                    </h1>
                    
                    <p className="text-lg sm:text-xl font-bold text-amber-605 font-serif italic">
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
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">The Crisis & Market Pain</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].metrics?.map((m, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 relative hover:border-amber-500/40 hover:shadow-lg transition-all flex flex-col justify-between">
                          <div>
                            <span className="block text-3xl font-display font-black text-amber-655">{m.value}</span>
                            <span className="block text-xs font-bold text-slate-800 mt-1">{m.label}</span>
                            <p className="text-xs text-slate-500 leading-relaxed mt-2 font-medium">{m.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. MARKET OPPORTUNITY SLIDE */}
                {SLIDES[currentSlideIndex].id === 'market-opportunity' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Total Addressable Market</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].points?.map((p, idx) => (
                        <div key={idx} className="bg-white border border-slate-205 p-6 rounded-2xl space-y-3 relative hover:border-amber-500/40 hover:shadow-lg transition-all flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-50 rounded-tr-2xl rounded-bl-3xl flex items-center justify-center font-bold text-amber-600 font-mono text-sm border-l border-b border-slate-205/80">
                            0{idx + 1}
                          </div>
                          <h3 className="font-bold text-base text-slate-900 pr-6 mt-2">{p.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PRODUCT DEPTH SLIDE */}
                {SLIDES[currentSlideIndex].id === 'product-depth' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Product Architecture</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].roles?.map((r, idx) => (
                        <div key={idx} className="bg-white border border-slate-205 p-6 rounded-2xl space-y-4 hover:border-amber-500/40 transition-all flex flex-col">
                          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">{r.name}</h3>
                          <ul className="space-y-2 flex-1">
                            {r.features.map((f, fIdx) => (
                              <li key={fIdx} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                                <span className="text-amber-500 shrink-0 mt-0.5">✔</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. COMPLIANCE SLIDE */}
                {SLIDES[currentSlideIndex].id === 'compliance' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Legality & Integrity</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].compliances?.map((c, idx) => (
                        <div key={idx} className="bg-white border border-slate-205 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition-all shadow-sm">
                          <div className="flex items-center gap-2 text-amber-600">
                            <ShieldCheck className="w-5 h-5" />
                            <strong className="text-xs uppercase font-mono tracking-wider">{c.rule}</strong>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium pt-1">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. IMPACT REPORT SLIDE */}
                {SLIDES[currentSlideIndex].id === 'impact-report' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Systemic & Social Impact</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].points?.map((p, idx) => (
                        <div key={idx} className="bg-white border border-slate-205 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition-all shadow-sm flex flex-col justify-between">
                          <div className="space-y-2">
                            <h3 className="font-bold text-sm text-slate-800 font-serif italic">{p.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. INVESTOR SECURITY SLIDE */}
                {SLIDES[currentSlideIndex].id === 'investor-security' && (
                  <div className="grid md:grid-cols-12 gap-8 items-center text-left">
                    <div className="md:col-span-5 space-y-4">
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Safe Partner Infrastructure</span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
                        Secured Payouts & Audit Trails
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Every rupee passing through our embedded wallets is logged in an immutable database ledger. Platforms fees are held in secure escrow templates before lawyer settlement, protecting investor capital from compliance risks.
                      </p>
                      
                      <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3">
                        <Lock className="w-5 h-5 text-amber-655 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">Non-Custodial Design</strong>
                          <span className="block text-[10px] text-slate-500 leading-relaxed font-medium mt-0.5">We avoid holding platform liquidity; billing checks are processed instantly upon WebRTC session completions.</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 grid grid-cols-2 gap-4">
                      {SLIDES[currentSlideIndex].metrics?.map((m, idx) => (
                        <div key={idx} className="bg-white border border-slate-205 p-5 rounded-2xl space-y-2 shadow-sm">
                          <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider font-mono">{m.metric}</span>
                          <span className="block text-2xl font-display font-black text-amber-600">{m.value}</span>
                          <span className="block text-[10px] text-slate-500 leading-normal font-medium">{m.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. FINANCIAL MODELER SLIDE */}
                {SLIDES[currentSlideIndex].id === 'financial-sandbox' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Real-time Revenue Projections</span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-6 pt-2">
                      {/* Left: Input parameters */}
                      <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                          <span>Input Volume Modeler</span>
                        </h3>
                        
                        <div className="space-y-4 text-xs">
                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-slate-500 font-semibold">Daily Consult Minutes (Calls)</span>
                              <strong className="text-slate-850 font-mono">{dailyCalls.toLocaleString()} min</strong>
                            </div>
                            <input 
                              type="range" 
                              min="500" 
                              max="30000" 
                              step="500"
                              value={dailyCalls}
                              onChange={(e) => setDailyCalls(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-slate-500 font-semibold">Daily Chats Handled</span>
                              <strong className="text-slate-850 font-mono">{dailyChats.toLocaleString()} chats</strong>
                            </div>
                            <input 
                              type="range" 
                              min="500" 
                              max="30000" 
                              step="500"
                              value={dailyChats}
                              onChange={(e) => setDailyChats(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-slate-500 font-semibold">Active Subscribed Advocates</span>
                              <strong className="text-slate-850 font-mono">{activeAdvocates.toLocaleString()} advocates</strong>
                            </div>
                            <input 
                              type="range" 
                              min="200" 
                              max="20000" 
                              step="200"
                              value={activeAdvocates}
                              onChange={(e) => setActiveAdvocates(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-slate-500 font-semibold">Customer Acquisition Cost (CAC)</span>
                              <strong className="text-slate-850 font-mono text-amber-700">₹{cacValue}</strong>
                            </div>
                            <input 
                              type="range" 
                              min="50" 
                              max="800" 
                              step="25"
                              value={cacValue}
                              onChange={(e) => setCacValue(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Projections Table & Charts */}
                      <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-amber-600" />
                            <span>Monthly Projections & Cohorts</span>
                          </h3>

                          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <span className="block text-[9px] text-slate-450 uppercase font-mono">Monthly Platform Rev (Net)</span>
                                <strong className="block font-mono text-amber-750 text-sm">₹{Math.round(totalMonthlyPlatformRev).toLocaleString()}</strong>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <span className="block text-[9px] text-slate-450 uppercase font-mono">Annualized Run Rate (ARR)</span>
                                <strong className="block font-mono text-slate-800 text-sm">₹{Math.round(estimatedAnnualRunRate).toLocaleString()}</strong>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <span className="block text-[9px] text-slate-450 uppercase font-mono">LTV : CAC Ratio</span>
                                <strong className="block font-mono text-emerald-650 text-sm">{ltvToCacRatio}x</strong>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <span className="block text-[9px] text-slate-455 uppercase font-mono">Lawyers Share (80%)</span>
                                <strong className="block font-mono text-slate-800 text-sm">₹{Math.round(advocateTotalMonthlyEarnings).toLocaleString()}</strong>
                              </div>
                            </div>

                            {/* 3-Year Projection Graph Preview (SVG) */}
                            <div className="pt-2">
                              <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider mb-2 text-left">3-Year Platform Net Revenue Growth curve</span>
                              <div className="h-16 w-full bg-white border border-slate-200 rounded-lg relative overflow-hidden flex items-end p-1">
                                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                                  <path 
                                    d={`M 0 30 Q 30 ${30 - (totalMonthlyPlatformRev/450000)} 60 ${30 - (totalMonthlyPlatformRev/200000)} T 100 ${30 - (totalMonthlyPlatformRev/100000)}`}
                                    fill="none" 
                                    stroke="url(#goldGradient)" 
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                  <defs>
                                    <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#d97706" />
                                      <stop offset="100%" stopColor="#f59e0b" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <div className="absolute top-1 left-2 text-[9px] font-mono text-slate-400">Y1: {Math.round(estimatedAnnualRunRate/100000).toLocaleString()}L</div>
                                <div className="absolute top-1 right-2 text-[9px] font-mono text-amber-700 font-bold">Y3: {Math.round((estimatedAnnualRunRate*4.2)/100000).toLocaleString()}L</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. INTERACTIVE DEMO SLIDE */}
                {SLIDES[currentSlideIndex].id === 'interactive-demo' && (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Live Interactive Demo</span>
                        <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-1">
                          Test our Metered Billing Engine & KYC Approval flow
                        </h2>
                      </div>
                    </div>

                    {/* TWO PLAYGROUND MODULES */}
                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      
                      {/* Module B: Real-Time Metered Billing Simulator */}
                      <div className="bg-white border border-slate-205 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
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
                                Client has <strong>2 free minutes</strong> and a <strong>₹60 wallet</strong>. Call costs ₹10/min after free limits.
                              </p>
                              <button 
                                onClick={startMockCall}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-all border border-amber-400"
                              >
                                Trigger Mock Call
                              </button>
                            </div>
                          )}

                          {mockCallState === 'calling' && (
                            <div className="text-center py-8 space-y-2">
                              <span className="block w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping mx-auto" />
                              <strong className="block text-xs text-amber-605 font-mono uppercase tracking-widest mt-2">Connecting Peer...</strong>
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
                              <CheckCircle2 className="w-8 h-8 text-emerald-550 mx-auto" />
                              <strong className="block text-slate-850">Call Disconnected</strong>
                              <span className="block text-[10px] text-slate-500 leading-relaxed font-medium">
                                Wallet debited by <strong>₹{totalCharged}</strong>. Advocate receives 80% split (₹{totalCharged * 0.80}) into virtual chambers account.
                              </span>
                              <button 
                                onClick={resetMockCall}
                                className="mt-2 text-amber-605 hover:text-amber-700 hover:underline flex items-center gap-1 justify-center mx-auto font-bold"
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
                      <div className="bg-white border border-slate-205 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
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
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-[10px] py-2 rounded-lg cursor-pointer transition-colors"
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

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-[9px] text-slate-500 h-20 overflow-y-auto space-y-1.5 font-mono">
                          <span className="block font-bold text-slate-455 mb-1">AUDIT LOG:</span>
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

                {/* 10. INVESTMENT ASK SLIDE */}
                {SLIDES[currentSlideIndex].id === 'investment-ask' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">The Ask & Milestones</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      {SLIDES[currentSlideIndex].milestones?.map((m, idx) => (
                        <div key={idx} className="bg-white border border-slate-205 p-6 rounded-2xl space-y-3 relative hover:border-amber-500/40 hover:shadow-lg transition-all flex flex-col justify-between">
                          <div>
                            <strong className="block text-amber-705 font-mono text-xs uppercase tracking-wider">{m.year}</strong>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-3">{m.goal}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Deck Nav Controls */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-6">
            <span className="text-xs text-slate-500 font-bold font-mono">
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
          <span className="text-amber-605 font-mono font-semibold">Confidential Pitch deck and Live sandbox system.</span>
        </div>
        <div className="flex gap-4 font-semibold">
          <Link to="/" className="text-slate-500 hover:text-amber-600 transition-colors">Client Site</Link>
          <Link to="/advocates" className="text-slate-500 hover:text-amber-600 transition-colors">Advocate Site</Link>
        </div>
      </footer>

    </div>
  );
}
