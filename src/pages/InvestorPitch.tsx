import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Award, ShieldCheck, DollarSign, Wallet, ArrowLeft, ArrowRight, Play, Pause,
  RotateCcw, Sparkles, TrendingUp, ShieldAlert, CheckCircle2, Video, MessageSquare, PhoneCall, 
  RefreshCw, LogIn, FileText, Lock, BarChart3, HelpCircle, Activity, Globe, Check, Send, User, Laptop
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
    id: 'ai-bot-sandbox',
    title: 'Interactive AI Legal Bot',
    subtitle: 'Ask our Legal AI Assistant questions directly inside the presentation',
    accent: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'interactive-demo',
    title: 'Live 2-Device Sandbox Demo',
    subtitle: 'Connect client to lawyer live, or run the local metered call simulation',
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
  const [kycLawyerName, setKycLawyerName] = useState('Adv. Rajesh Kumar');
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [kycLog, setKycLog] = useState<string[]>(['Lawyer submitted LLB degree & COP certificate.']);

  // Interactive Live Call State
  const [mockCallState, setMockCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [mockWalletBalance, setMockWalletBalance] = useState(60);
  const [mockFreeMinutes, setMockFreeMinutes] = useState(2);
  const [callDuration, setCallDuration] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);

  // Interactive AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<any[]>([
    {
      role: 'assistant',
      text: "### Welcome to LegalTalk India AI Desk.\n\nI am your interactive legal assistant trained on Indian Penal Code, Civil Procedure, BNS, Marriage, and Tax bylaws. Type any question below or select a sample query to test my intelligence."
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sampleAiPrompts = [
    "What is the waiting period for Mutual Consent Divorce under Hindu Marriage Act?",
    "Explain Section 302 of the IPC and its bail criteria.",
    "What are the mandatory KYC documents required for advocates to practice online?"
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  // Auto-play effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, 9500);
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

  // AI Assistant submit handler
  const handleAiSubmit = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || aiPrompt;
    if (!query.trim() || aiLoading) return;

    setAiMessages(prev => [...prev, { role: 'user', text: query }]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const rawText = data.text || '';
      const escTag = '[ACTION_REQUIRED: ESCALATE_TO_LAWYER]';
      const cleanedText = rawText.replace(escTag, '').trim();

      setAiMessages(prev => [...prev, { role: 'assistant', text: cleanedText }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, { role: 'assistant', text: `### Connection Error\n\nApologies, the legal model could not be connected. Details: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

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
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-55 border border-amber-250/30 rounded-full px-3 py-1 text-xs font-semibold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 " />
            <span>Investor Sandbox Active</span>
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
        <div className="bg-white/95 border border-amber-100/40 rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-950/5 relative min-h-[530px] flex flex-col justify-between backdrop-blur-xl">
          
          {/* Progress Bar */}
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
                        className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer border border-amber-400"
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
                          <span className="block text-[10px] text-slate-445 uppercase font-black tracking-wider font-mono">{m.metric}</span>
                          <span className="block text-2xl font-display font-black text-amber-600">{m.value}</span>
                          <span className="block text-[10px] text-slate-505 leading-normal font-medium">{m.desc}</span>
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
                                <span className="block text-[9px] text-slate-455 uppercase font-mono">LTV : CAC Ratio</span>
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

                {/* 9. INTERACTIVE AI LEGAL BOT SLIDE */}
                {SLIDES[currentSlideIndex].id === 'ai-bot-sandbox' && (
                  <div className="space-y-4 text-left">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Live Responsive Assistant</span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-1">
                        {SLIDES[currentSlideIndex].subtitle}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-12 gap-6 items-stretch pt-1">
                      
                      {/* Left: Quick Prompts selection */}
                      <div className="md:col-span-4 flex flex-col justify-between bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                        <div className="space-y-4">
                          <h3 className="font-display font-black text-[10px] tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-655" />
                            <span>Sample Queries</span>
                          </h3>
                          <div className="space-y-2.5">
                            {sampleAiPrompts.map((p, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAiSubmit(undefined, p)}
                                disabled={aiLoading}
                                className="w-full text-left bg-slate-50 hover:bg-amber-50/50 hover:border-amber-400/40 border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-700 leading-snug transition-all cursor-pointer"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="text-[10px] text-indigo-900 bg-indigo-50 border border-indigo-150 p-3 rounded-xl mt-4 leading-normal font-medium">
                          <strong>Note:</strong> Fully responsive, connected directly to Google GenAI capabilities with localized Indian judicial guidelines.
                        </div>
                      </div>

                      {/* Right: AI Chatbot Box */}
                      <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between h-[320px] shadow-sm relative overflow-hidden">
                        
                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                          {aiMessages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${msg.role === 'user' ? 'bg-slate-250 text-slate-800 font-bold' : 'bg-amber-600 text-white'}`}>
                                {msg.role === 'user' ? 'U' : <Scale className="w-3 h-3" />}
                              </div>
                              <div className={`max-w-md rounded-xl p-3 leading-relaxed ${msg.role === 'user' ? 'bg-amber-100 text-slate-900' : 'bg-slate-50 border border-slate-150 text-slate-800'}`}>
                                {msg.text.split('\n\n').map((para: string, pIdx: number) => {
                                  if (para.startsWith('###')) {
                                    return <h4 key={pIdx} className="font-bold text-slate-900 mt-2 mb-1">{para.replace('###', '').trim()}</h4>;
                                  }
                                  if (para.startsWith('*') || para.startsWith('-')) {
                                    return (
                                      <ul key={pIdx} className="list-disc pl-4 my-1 space-y-0.5">
                                        {para.split('\n').map((item, itemIdx) => (
                                          <li key={itemIdx}>{item.replace(/^[\s*-]+/, '').trim()}</li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                  return <p key={pIdx} className="my-1">{para}</p>;
                                })}
                              </div>
                            </div>
                          ))}
                          {aiLoading && (
                            <div className="flex gap-2 items-center text-slate-400 italic">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleAiSubmit} className="border-t border-slate-150 p-2 flex gap-2 bg-slate-50/50">
                          <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ask any legal doubt here..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                            disabled={aiLoading}
                          />
                          <button
                            type="submit"
                            disabled={aiLoading}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-2.5 rounded-xl transition-colors cursor-pointer border border-amber-400"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>

                    </div>
                  </div>
                )}

                {/* 10. INTERACTIVE DEMO / DEVICE LOGINS SLIDE */}
                {SLIDES[currentSlideIndex].id === 'interactive-demo' && (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">Live Multi-Device Demo</span>
                        <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-1">
                          Test client-lawyer chat live on 2 devices
                        </h2>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-6 pt-1">
                      
                      {/* Left: Device Login instructions & Credentials */}
                      <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                        <div className="space-y-3">
                          <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-amber-600" />
                            <span>Investor Demo Credentials</span>
                          </h3>
                          <p className="text-xs text-slate-550 leading-relaxed font-medium">
                            To showcase real-time communication, open this app on **two separate devices** (or in private/incognito tabs) and log in:
                          </p>

                          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-250 uppercase font-mono">Device 1: Client</span>
                              <div className="font-mono text-[10px] text-slate-700 mt-1.5 space-y-1">
                                <div>Email: <strong className="text-slate-900">client@demo.in</strong></div>
                                <div>Wallet: <strong className="text-emerald-700">₹500</strong></div>
                                <div>Pass: <span className="text-slate-400">any value</span></div>
                              </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-250 uppercase font-mono">Device 2: Lawyer</span>
                              <div className="font-mono text-[10px] text-slate-700 mt-1.5 space-y-1">
                                <div>Email: <strong className="text-slate-900">advocate@demo.in</strong></div>
                                <div>Status: <strong className="text-emerald-600">Online</strong></div>
                                <div>Pass: <span className="text-slate-400">any value</span></div>
                              </div>
                            </div>
                          </div>

                          <ol className="space-y-1.5 text-[11px] text-slate-500 list-decimal pl-4 pt-1 font-medium">
                            <li>Log Device 1 in as Client, Device 2 in as Lawyer.</li>
                            <li>On Device 1, find <strong className="text-slate-800">Adv. Rajesh Kumar</strong> in the directory and click "Chat".</li>
                            <li>Device 2 will receive a live ringer notification to join the chat session.</li>
                          </ol>
                        </div>

                        <div className="bg-amber-50 border border-amber-200/50 p-3.5 rounded-xl text-[10px] text-amber-900 leading-normal font-semibold">
                          No setup required! These sandbox logins are automatically pre-seeded in the database for instant, zero-friction investor validation.
                        </div>
                      </div>

                      {/* Right: Real-Time Local Billing Simulator (Backup Option) */}
                      <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <Video className="w-4 h-4 text-amber-600" />
                            <span>Quick Metered Billing Simulator</span>
                          </h3>

                          {mockCallState === 'idle' && (
                            <div className="text-center py-4 space-y-2">
                              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-450">
                                <PhoneCall className="w-4.5 h-4.5" />
                              </div>
                              <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-normal font-medium">
                                Simulate client-lawyer connection directly on this screen. Charges ₹10/min after free limits.
                              </p>
                              <button 
                                onClick={startMockCall}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all border border-amber-400"
                              >
                                Trigger Simulation
                              </button>
                            </div>
                          )}

                          {mockCallState === 'calling' && (
                            <div className="text-center py-6 space-y-2">
                              <span className="block w-2 h-2 bg-amber-500 rounded-full animate-ping mx-auto" />
                              <strong className="block text-[10px] text-amber-605 font-mono uppercase tracking-widest">Connecting Peer...</strong>
                            </div>
                          )}

                          {mockCallState === 'active' && (
                            <div className="bg-slate-50 border border-amber-100 p-3 rounded-xl space-y-2.5 text-xs">
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="flex items-center gap-1 text-emerald-600 font-bold uppercase">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                  <span>Simulated call</span>
                                </span>
                                <span className="font-mono text-slate-500">Duration: {callDuration}s ({Math.floor(callDuration/2)}m)</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                <div className="bg-white border border-slate-200 p-2 rounded-lg">
                                  <span className="block text-[8px] text-slate-400 uppercase font-mono">Free Minutes</span>
                                  <strong className="block font-mono text-emerald-650">{mockFreeMinutes} min left</strong>
                                </div>
                                <div className="bg-white border border-slate-200 p-2 rounded-lg">
                                  <span className="block text-[8px] text-slate-400 uppercase font-mono">Client Wallet</span>
                                  <strong className="block font-mono text-slate-800">₹{mockWalletBalance}</strong>
                                </div>
                              </div>

                              <button 
                                onClick={stopMockCall}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] py-1.5 rounded-lg cursor-pointer"
                              >
                                End Session
                              </button>
                            </div>
                          )}

                          {mockCallState === 'ended' && (
                            <div className="bg-slate-50 p-3 rounded-xl text-center space-y-1.5 border border-slate-200 text-xs">
                              <CheckCircle2 className="w-6 h-6 text-emerald-550 mx-auto" />
                              <strong className="block text-slate-850 text-xs">Session Logged</strong>
                              <span className="block text-[9px] text-slate-505 leading-relaxed font-medium">
                                Client billed <strong>₹{totalCharged}</strong>. Advocate earns 80% split (₹{totalCharged * 0.80}).
                              </span>
                              <button 
                                onClick={resetMockCall}
                                className="text-amber-605 hover:text-amber-700 hover:underline flex items-center gap-1 justify-center mx-auto font-bold text-[10px]"
                              >
                                <RotateCcw className="w-3 h-3" /> Retry simulation
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-[9px] text-slate-400 pt-2 border-t border-slate-100 font-medium">
                          Agora RTC web hooks are registered to trigger database billing updates dynamically upon session status changes.
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 11. INVESTMENT ASK SLIDE */}
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
