import React from 'react';
import { Scale, Users, Shield, MessageSquare, PhoneCall, Video, Star, Award, HeartHandshake, CheckCircle, ArrowRight, ArrowDown } from 'lucide-react';
import { User, LawyerProfile } from '../types';

interface LandingPageProps {
  onStartConsultation: () => void;
  onOpenAssistant: () => void;
  onBecomeLawyer: () => void;
  onOpenAdmin: () => void;
  onOpenDeveloperHub: () => void;
  currentUser: User | null;
  onSelectUser: (user: User) => void;
  allUsers: User[];
  lawyerProfiles: any[];
}

export default function LandingPage({
  onStartConsultation,
  onOpenAssistant,
  onBecomeLawyer,
  onOpenAdmin,
  onOpenDeveloperHub,
  currentUser,
  onSelectUser,
  allUsers,
  lawyerProfiles
}: LandingPageProps) {

  const practiceAreas = [
    { title: "Criminal Law", desc: "Arrest, bail, complaints, IPC, CRPC", icon: Shield },
    { title: "Civil Law", desc: "Property disputes, contracts, injunctions", icon: Scale },
    { title: "Divorce & Family", desc: "Mutual consent, alimony, child custody", icon: Award },
    { title: "Property & Real Estate", desc: "Registration, landlord-tenant, RERA", icon: Scale },
    { title: "Corporate Law", desc: "Mergers, legal compliance, structures", icon: Scale },
    { title: "Labour & Employment", desc: "Wages, discrimination, safety disputes", icon: Users },
    { title: "Tax Law", desc: "GST audits, corporate tax filing, notices", icon: Shield },
    { title: "Consumer Law", desc: "Deficient service, fraud, refund requests", icon: ShareIcon },
    { title: "Cyber Law", desc: "Phishing, hacking, cyber-stalking defense", icon: Shield },
    { title: "Labour Law", desc: "Wages, discrimination, safety disputes", icon: Users },
    { title: "Startup Law", desc: "Incorporation, equity shares, IP rights", icon: Award }
  ];

  function ShareIcon(props: any) {
    return <Scale {...props} />
  }

  const approvedLawyers = lawyerProfiles.filter(l => l.verificationStatus === 'approved').slice(0, 3);

  const testifiers = [
    { name: "Siddharth Verma", role: "Business Owner", feedback: "LegalTalk India is a game changer. I got connected to a stellar corporate tax lawyer within 2 minutes and resolved our GST query cheaply." },
    { name: "Priya Rao", role: "Software Engineer", feedback: "The AI Legal Assistant answered all my core questions about tenancy law for free, and then I comfortably booked an advocate to draft the final rent deed." }
  ];

  const faqs = [
    { q: "Is talking to a lawyer on LegalTalk private?", a: "ABSOLUTELY. All chat sessions, voice channels, and webcam integrations are secured privately between the user and active state/bar verified lawyer." },
    { q: "How does the per-minute calling rates operate?", a: "Each lawyer sets their per-minute rate. When you click Connect, your wallet holds the session secure. Every minute you talk deducts from the balance. If you hang up early, you only pay for the exact seconds used!" },
    { q: "Can I review the lawyer's credentials beforehand?", a: "Yes, our team manually verifies the state Bar Council Enrolment, Aadhaar, PAN, and certificate of practice for every attorney before granting them active approved status." }
  ];

  return (
    <div id="landing-page" className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. TOP ANNOUNCEMENT BAR & USER ACTOR SIMULATOR */}
      <div className="bg-slate-900 text-white/90 text-sm py-2 px-4 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-bold text-xs py-0.5 px-1.5 rounded uppercase font-display">
            Demo Portal
          </span>
          <span className="text-slate-350 text-xs hidden sm:inline">
            Fast switcher: Toggle roles to test user, lawyer and admin flows immediately:
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
          <span className="text-xs text-slate-400 font-mono">Current Identity:</span>
          <select 
            value={currentUser?.id || ""} 
            onChange={(e) => {
              const selected = allUsers.find(u => u.id === e.target.value);
              if (selected) onSelectUser(selected);
            }}
            className="bg-slate-800 text-amber-400 font-medium text-xs rounded border border-slate-700 py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="text-white">
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. CHIC STICKY NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 block leading-none">LEGALTALK</span>
              <span className="text-xs font-semibold tracking-wider text-indigo-600 block mt-1 uppercase font-display">India</span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#practice-areas" className="hover:text-indigo-600 transition-colors">Practice Areas</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#top-lawyers" className="hover:text-indigo-600 transition-colors">Find Lawyers</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">Help & FAQ</a>
            
            {currentUser?.role === 'lawyer' && (
              <button onClick={onBecomeLawyer} className="text-teal-600 font-semibold hover:text-teal-700 transition-colors flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                <Award className="w-4 h-4" /> Attorney Workspace
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button onClick={onOpenAdmin} className="text-amber-600 font-semibold hover:text-amber-700 transition-colors flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <Shield className="w-4 h-4" /> Admin Console
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenDeveloperHub}
              className="text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3.5 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-slate-500" /> DB Migration & Setup
            </button>
            <button 
              onClick={onStartConsultation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-150 transition-all"
            >
              Consult Lawyer
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO UNIT with Airbnb aesthetic */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6 font-display">
                <Scale className="w-3.5 h-3.5" /> India's Elite Legal Marketplace
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight mb-6">
                Talk to Verified Lawyers <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">Anytime</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mb-8 leading-relaxed">
                Connect instantly with Bar Council-verified advocates via private dynamic Chat, Audio, or HD Video. On-demand minute billing with a 20% commission model.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button 
                  onClick={onStartConsultation}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-indigo-200 text-center transition-all flex items-center justify-center gap-2"
                >
                  Connect Instantly <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={onOpenAssistant}
                  className="bg-white hover:bg-slate-50 text-slate-850 font-semibold px-8 py-4 rounded-xl border border-slate-200 text-center transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-5 h-5 text-indigo-500 animate-pulse" /> Try AI Legal Assistant
                </button>
              </div>

              {/* Instant Social proof statistics banner */}
              <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-slate-100 max-w-lg">
                <div>
                  <span className="block text-2xl sm:text-3xl font-display font-extrabold text-slate-900">100%</span>
                  <span className="block text-xs text-slate-500 mt-1">Bar-Verified</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-display font-extrabold text-slate-900">₹10/min</span>
                  <span className="block text-xs text-slate-500 mt-1">Starts From</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-display font-extrabold text-slate-900">24/7</span>
                  <span className="block text-xs text-slate-500 mt-1">Live Online</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-indigo-100 rounded-3xl transform rotate-3 scale-95 blur-xs"></div>
              {/* Premium Hero Card mimicking the Astrotalk experience */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-800 font-display font-bold">Featured Attorneys</span>
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 3 Online Now
                  </span>
                </div>

                <div className="space-y-4">
                  {approvedLawyers.map((lawyer, i) => (
                    <div key={lawyer.userId} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${i === 0 ? 'bg-indigo-50/50 border-indigo-100 shadow-xs' : 'bg-slate-50/50 border-slate-100'}`}>
                      <img 
                        src={lawyer.avatarUrl} 
                        alt={lawyer.name} 
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" 
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block font-display font-bold text-sm text-slate-900 truncate">{lawyer.name}</span>
                        <span className="block text-xs text-slate-500 truncate">{lawyer.categories.join(', ')}</span>
                        <span className="block text-[11px] font-semibold text-slate-600 mt-0.5">Exp: {lawyer.experienceYears} Years</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 text-amber-500 justify-end mb-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold text-slate-800">{lawyer.rating}</span>
                        </div>
                        <span className="block text-xs font-semibold text-slate-900">₹{lawyer.chatPricePerMinute}/min</span>
                        <span className="block text-[10px] text-indigo-600 font-medium">Chat/Voice</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={onStartConsultation}
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  View All Active Advocates <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CHAT AI LEGAL ASSISTANT CTA CARD */}
      <section className="bg-slate-100 py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-700 to-violet-800 rounded-3xl text-white p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="space-y-4 max-w-2xl relative">
              <span className="bg-white/10 text-white font-bold text-[10px] tracking-wider px-3 py-1 rounded-full uppercase font-display">
                Instant Free Query Resolution
              </span>
              <h2 className="font-display font-extrabold text-3xl">AI Legal Assistant Desk</h2>
              <p className="text-white/80 leading-relaxed">
                Clarify complex legal terms, discover civil process frameworks, and gain constitutional rights insights prior to booking live lawyers. Includes a seamless one-click switch to verified legal partners.
              </p>
              <div className="flex items-center gap-2 text-xs text-indigo-200">
                <CheckCircle className="w-4 h-4 text-indigo-300" /> Ready for trademark, divorce, criminal framework inquiries
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 relative bg-indigo-900/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <button 
                onClick={onOpenAssistant}
                className="w-full md:w-auto bg-white hover:bg-slate-50 text-indigo-900 font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Launch AI Assistant Desk <ArrowRight className="w-5 h-5 text-indigo-600" />
              </button>
              <p className="text-center text-[10px] text-white/50 mt-2">
                "Not legal advice, informational context only"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRACTICE AREAS SECTION */}
      <section id="practice-areas" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-indigo-600 font-semibold text-xs tracking-wider uppercase font-display">Expertise Coverage</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2">Select by Legal Practice Specialty</h2>
          <p className="text-slate-500 max-w-xl mx-auto mt-3 mb-12">
            Speak to a lawyer specialized in any legal situation under Indian judicial guidelines.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {practiceAreas.map((area, i) => (
              <div 
                key={i} 
                onClick={onStartConsultation}
                className="p-6 bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-indigo-50/50 rounded-2xl border border-slate-150 transition-all text-left cursor-pointer group"
              >
                <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                  <area.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg">{area.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{area.desc}</p>
                <div className="text-indigo-600 font-medium text-xs mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  Consult Advocates <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-indigo-600 font-semibold text-xs tracking-wider uppercase font-display">Simple Protocol</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2">How LegalTalk Works</h2>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-16">
            Connecting and getting legal help takes 4 quick steps:
          </p>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Step lines background */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block z-0"></div>

            {[
              { num: "01", title: "Add Wallet Funds", desc: "Top up your wallet balance easily using pre-integrated online simulation modules.", icon: Scale },
              { num: "02", title: "Select a Lawyer", desc: "Browse specialized lawyers, filter by price, rating and state Bar certification.", icon: Users },
              { num: "03", title: "Initiate Session", desc: "Choose Chat, Voice, or HD Video. The billing system deducts funds second-by-second.", icon: MessageSquare },
              { num: "04", title: "Close & Payout", desc: "End session anytime. Platform captures the 20% commission; 80% split transfers instantly to the advocate.", icon: HeartHandshake }
            ].map((step, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-150 relative z-10 transition-all hover:shadow-lg">
                <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm mb-4 font-display">
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-slate-900 text-base mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ATTORNEY REGISTRATION CTA CARD */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="space-y-4 max-w-lg">
              <span className="text-slate-400 font-mono text-xs">JOIN THE NETWORK</span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl">Are you a Certified Legal Practitioner inside India?</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Onboard easily, set your own per-minute consulting prices for Chat, Audio, and Video channels, and withdraw split earnings cleanly. Earn transparent payouts with 20% platform charges.
              </p>
            </div>
            
            <button 
              onClick={onBecomeLawyer}
              className="w-full md:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Sign Up As Lawyer <Award className="w-5 h-5 text-indigo-200" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FAQ & ACCORDIONS */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-xs uppercase font-display">Q&A Corner</span>
            <h2 className="font-display font-extrabold text-3xl text-slate-900 mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-150 shadow-xs relative">
                <span className="block font-display font-bold text-slate-900 mb-2 leading-tight">Q: {faq.q}</span>
                <p className="text-xs text-slate-500 leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2">
            <div className="flex items-center gap-3 text-white">
              <Scale className="w-6 h-6 text-indigo-400" />
              <span className="font-display font-extrabold text-lg tracking-wider">LEGALTALK INDIA</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              LegalTalk India is a premier digital marketplace enabling citizens to connect instantly with verify state/bar counsel advocates. We are not a law firm and do not sell absolute legal solutions.
            </p>
          </div>
          <div>
            <span className="block text-white font-semibold text-sm mb-4 uppercase tracking-wider font-display">Application Roles</span>
            <ul className="space-y-2 text-xs">
              <li><button onClick={onStartConsultation} className="hover:text-white transition-colors">Client Space</button></li>
              <li><button onClick={onBecomeLawyer} className="hover:text-white transition-colors">Lawyer Workspace</button></li>
              <li><button onClick={onOpenAdmin} className="hover:text-white transition-colors">Administrator Access</button></li>
              <li><button onClick={onOpenDeveloperHub} className="hover:text-white transition-colors">Technical Developer Hub</button></li>
            </ul>
          </div>
          <div>
            <span className="block text-white font-semibold text-sm mb-4 uppercase tracking-wider font-display">Legal Compliance</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All transactions executed during testing are simulated sandbox balances. System matches Bar Council rules forbidding active attorney advertising.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} LegalTalk India Private Limited. All Rights Reserved.</span>
          <span>Designed under Indian Bar Council Guidelines.</span>
        </div>
      </footer>

    </div>
  );
}
