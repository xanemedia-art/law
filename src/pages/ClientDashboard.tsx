import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Search, SlidersHorizontal, Star, MessageSquare, PhoneCall, Video, Wallet, ArrowLeft, RefreshCw, Layers, Check, ShieldCheck, History, Sparkles, Sun, Moon, LogOut, LayoutDashboard, Calendar, Compass, Shield, Plus, FolderOpen, Upload, FileText } from 'lucide-react';
import { User, Consultation, STATE_DISTRICTS, Case, CaseDocument } from '../types';


interface ClientDashboardProps {
  currentUser: User | null;
  onInitiateSession: (lawyerId: string, type: 'chat' | 'voice' | 'video') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function ClientDashboard({ currentUser, onInitiateSession, theme, onToggleTheme }: ClientDashboardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  // Local state
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'wallet' | 'cases'>('search');

  // Case states
  const [cases, setCases] = useState<Case[]>([]);
  const [fetchingCases, setFetchingCases] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseCategory, setCaseCategory] = useState('Criminal Law');
  const [submittingCase, setSubmittingCase] = useState(false);

  // Doc uploads & expansion
  const [docUploadNames, setDocUploadNames] = useState<Record<string, string>>({});
  const [uploadingDoc, setUploadingDoc] = useState<Record<string, boolean>>({});
  const [expandedVault, setExpandedVault] = useState<Record<string, boolean>>({});


  // Filtering states
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [priceMax, setPriceMax] = useState<number>(150);
  const [minExp, setMinExp] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);

  // Toggle filter visibility
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Recharge modal state
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeVal, setRechargeVal] = useState('500');
  const [depositing, setDepositing] = useState(false);

  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const categories = [
    "Criminal Law", "Civil Law", "Divorce", "Family Law", 
    "Property Law", "Corporate Law", "Labour Law", "Tax Law", 
    "Consumer Law", "Cyber Law", "Startup Law"
  ];

  const languages = [
    "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati",
    "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Kashmiri",
    "Konkani", "Manipuri"
  ];

  const handleFilterStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('');
  };

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedCategory) q.append('category', selectedCategory);
      if (selectedLanguage) q.append('language', selectedLanguage);
      if (selectedState) q.append('state', selectedState);
      if (selectedDistrict) q.append('district', selectedDistrict);
      if (priceMax) q.append('priceMax', priceMax.toString());
      if (minExp) q.append('experienceMin', minExp.toString());
      if (minRating) q.append('rating', minRating.toString());

      const res = await fetch(`/api/lawyers?${q.toString()}`);
      const data = await res.json();
      let list = data.lawyers || [];

      // Manual text query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        list = list.filter((l: any) => 
          l.name.toLowerCase().includes(query) || 
          l.bio.toLowerCase().includes(query) ||
          l.categories.some((c: string) => c.toLowerCase().includes(query))
        );
      }
      setLawyers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/wallet/${currentUser.id}`);
      const data = await res.json();
      setWalletBalance(data.balance || 0);
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConsultationHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/consultations/history/${currentUser.id}`);
      const data = await res.json();
      setConsultations(data.consultations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCases = async () => {
    if (!currentUser) return;
    setFetchingCases(true);
    try {
      const res = await fetch(`/api/cases?clientId=${currentUser.id}`);
      const data = await res.json();
      setCases(data.cases || []);
    } catch (e) {
      console.error("Error fetching cases", e);
    } finally {
      setFetchingCases(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchWallet();
    fetchConsultationHistory();
    fetchCases();
  }, [currentUser]);


  useEffect(() => {
    fetchLawyers();
  }, [selectedCategory, selectedLanguage, selectedState, selectedDistrict, priceMax, minExp, minRating, searchQuery]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || submittingCase || !caseTitle || !caseDescription || !caseCategory) return;

    setSubmittingCase(true);
    try {
      const res = await fetch("/api/cases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: currentUser.id,
          clientName: currentUser.name,
          title: caseTitle,
          description: caseDescription,
          category: caseCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Case consultation request posted successfully! It is now listed on the Open Cases Board for verified advocates.");
        setCaseTitle('');
        setCaseDescription('');
        setCaseCategory('Criminal Law');
        fetchCases();
      } else {
        alert("Failed to post case request: " + data.error);
      }
    } catch (err: any) {
      alert("Error creating case request: " + err.message);
    } finally {
      setSubmittingCase(false);
    }
  };

  const handleUploadDoc = async (caseId: string) => {
    const docName = docUploadNames[caseId]?.trim();
    if (!docName) {
      alert("Please specify a document name.");
      return;
    }

    setUploadingDoc(prev => ({ ...prev, [caseId]: true }));
    try {
      const res = await fetch("/api/cases/upload-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          name: docName,
          url: `https://example.com/mock-vault-docs/${encodeURIComponent(docName)}.pdf`,
          uploadedBy: 'client'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Document "${docName}" uploaded successfully to case folder!`);
        setDocUploadNames(prev => ({ ...prev, [caseId]: '' }));
        fetchCases();
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error uploading document: " + err.message);
    } finally {
      setUploadingDoc(prev => ({ ...prev, [caseId]: false }));
    }
  };

  const handleRazorpayDeposit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!currentUser || depositing || !rechargeVal || Number(rechargeVal) <= 0) return;

    setDepositing(true);
    const orderId = `rzp_test_ord_${Math.random().toString(36).substring(2, 11)}`;
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: Number(rechargeVal),
          rzpOrderId: orderId
        })
      });
      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.balance);
        setTransactions(prev => [data.transaction, ...prev]);
        setRechargeOpen(false);
        alert(`Wallet charged successfully with ₹${rechargeVal}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDepositing(false);
    }
  };

  const handleOpenReviewModal = (consultationId: string) => {
    setSelectedConsultationId(consultationId);
    setReviewRating(5);
    setReviewFeedback('');
    setReviewOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultationId || submittingReview) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: selectedConsultationId,
          rating: reviewRating,
          feedback: reviewFeedback
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("Thank you for your feedback! Review registered successfully.");
        setReviewOpen(false);
        fetchConsultationHistory();
        fetchLawyers();
      }
    } catch (err: any) {
      alert("Failed submitting review: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-55 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row font-sans selection:bg-amber-500/20">
      
      {/* SIDEBAR NAVBAR */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 z-30 h-auto md:h-screen p-6">
        <div className="space-y-8">
          {/* Logo & Platform Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-2 rounded-xl shadow-md">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="font-display font-black text-base tracking-tight block leading-none text-slate-900 dark:text-white">LEGALTALK</span>
                <span className="text-[9px] font-bold tracking-widest text-amber-500 block uppercase font-mono mt-0.5">Client Portal</span>
              </div>
            </div>
            {/* Quick theme toggler in sidebar */}
            <button
              onClick={onToggleTheme}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('search'); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'search' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <Compass className="w-4 h-4" />
              <span>Search Advocates</span>
            </button>
            <button
              onClick={() => { setActiveTab('history'); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'history' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Consultations</span>
            </button>
            <button
              onClick={() => { setActiveTab('wallet'); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'wallet' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet Ledger</span>
            </button>
            <button
              onClick={() => { setActiveTab('cases'); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'cases' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <Layers className="w-4 h-4" />
              <span>Case Boards</span>
            </button>

            <Link
              to="/ai-assistant"
              className="px-4 py-3 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50 flex items-center gap-2.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-550" />
              <span>AI Statutory Assistant</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Sidebar Footer */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-slate-700 shrink-0">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-bold text-slate-800 dark:text-white truncate">{currentUser?.name}</strong>
              <span className="block text-[9px] font-mono text-slate-455 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">{currentUser?.role}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onToggleTheme}
              className="hidden md:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 cursor-pointer shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("currentUser");
                window.location.href = "/login";
              }}
              className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-rose-650 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto space-y-8">
        
        {/* TOP METADATA BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white leading-none capitalize">{activeTab} Panel</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Manage consultations, discover bar-certified advocates, and seek AI insights.</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { fetchWallet(); fetchConsultationHistory(); fetchLawyers(); }}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* 2. BENTO STATS GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Wallet Bento */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full transform translate-x-10 -translate-y-10"></div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wallet Balance</span>
                <Wallet className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-3xl font-display font-black text-amber-400 block">₹{walletBalance.toFixed(2)}</span>
              <span className="block text-[10px] text-slate-400 mt-2">Post-limit rates: ₹10/min call, ₹5 flat chat</span>
            </div>
            <button 
              onClick={() => setRechargeOpen(true)}
              className="text-slate-955 bg-amber-500 hover:bg-amber-400 font-bold py-2.5 px-4 rounded-xl transition-all text-xs mt-4 block text-center cursor-pointer border border-amber-400"
            >
              + Add Funds (Mock Gateway)
            </button>
          </motion.div>

          {/* Free Call Mins Bento */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-white rounded-3xl p-6 shadow-md border border-indigo-900/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Free Calls Limit</span>
                <PhoneCall className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="text-3xl font-display font-black text-white block">
                {currentUser?.freeCallMinutesRemaining ?? 0} Mins
              </span>
              <p className="text-[10px] text-indigo-200 mt-2 leading-relaxed">
                Every client receives 2 minutes of free audio and video consultation credits.
              </p>
            </div>
          </motion.div>

          {/* Free Chat Bento */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-955 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Free Chat Sessions</span>
                <MessageSquare className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-3xl font-display font-black text-amber-400 block">
                {currentUser?.freeChatsRemaining ?? 0} Chats
              </span>
              <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
                Every new client receives 10 free text chat sessions to resolve inquiries.
              </p>
            </div>
          </motion.div>
        </div>

        {/* 3. DYNAMIC CONTENT SPLIT PANELS */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid lg:grid-cols-4 gap-8"
            >
              {/* Collapsible Filters */}
              {filtersOpen && (
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-fit space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="font-display font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Filter Advocates
                    </h2>
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedLanguage('');
                        setSelectedState('');
                        setSelectedDistrict('');
                        setMinExp(0);
                        setPriceMax(150);
                        setMinRating(0);
                        setSearchQuery('');
                      }}
                      className="text-indigo-650 dark:text-indigo-400 text-xs font-semibold hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Search query bar */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Bio/Name</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search keywords..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Specialty Practice */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Practice Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-white"
                    >
                      <option value="">-- All Categories --</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-white"
                    >
                      <option value="">-- Any Language --</option>
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Location State */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">State Council</label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleFilterStateChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-white"
                    >
                      <option value="">-- Any State --</option>
                      {Object.keys(STATE_DISTRICTS).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location District */}
                  {selectedState && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Practice District</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">-- Any District --</option>
                        {(STATE_DISTRICTS[selectedState] || []).map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Max Price slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Price / Min</label>
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 rounded">₹{priceMax}/m</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="150" 
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-indigo-650 dark:accent-indigo-400"
                    />
                                  {/* Rating selection hidden for BCI Compliance */}      </div>
                </div>
              )}

              {/* Advocates list */}
              <div className={`${filtersOpen ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFiltersOpen(!filtersOpen)}
                      className="p-2 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-655 dark:text-slate-350">
                      Advocates found: <strong className="text-slate-900 dark:text-white font-mono">{lawyers.length}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Registry Active
                  </span>
                </div>

                {loading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2].map((n) => (
                      <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-56 animate-pulse space-y-4" />
                    ))}
                  </div>
                ) : lawyers.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                    <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="font-display font-extrabold text-slate-800 dark:text-white text-base">No matching advocates found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1.5">
                      Adjust your location or maximum consulting pricing limit.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {lawyers.map((lawyer) => (
                      <div 
                        key={lawyer.userId} 
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg relative flex flex-col justify-between premium-card transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-750 dark:text-blue-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-blue-100 dark:border-blue-900">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> State Bar Certified
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${lawyer.isOnline ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${lawyer.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                              {lawyer.isOnline ? 'Online' : 'Away'}
                            </span>
                          </div>

                          <div className="flex gap-4">
                            <img 
                              src={lawyer.avatarUrl} 
                              alt={lawyer.name} 
                              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-50 dark:border-slate-800 shadow-sm shrink-0" 
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display font-bold text-slate-900 dark:text-white leading-none truncate">{lawyer.name}</h3>
                              <span className="block text-[9px] text-indigo-650 dark:text-indigo-400 mt-1 font-mono">{lawyer.barCouncilNumber}</span>
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{lawyer.experienceYears} Yrs Exp &bull; {lawyer.languages.join(', ')}</span>
                            </div>
                          </div>

                          <div className="my-3 flex flex-wrap gap-1">
                            {lawyer.categories.map((c: string) => (
                              <span key={c} className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {c}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-slate-555 dark:text-slate-455 line-clamp-2 leading-relaxed mb-4">
                            {lawyer.bio}
                          </p>
                        </div>

                        <div>
                          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-3 mb-4 grid grid-cols-2 gap-2 text-xs border border-slate-150 dark:border-slate-850">
                            <div>
                              <span className="block text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase">Experience</span>
                              <span className="block text-slate-850 dark:text-white font-bold mt-0.5">{lawyer.experienceYears} Years</span>
                            </div>
                            <div>
                              <span className="block text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase">Metered rate</span>
                              <span className="block text-slate-800 dark:text-white font-bold mt-0.5">₹{lawyer.chatPricePerMinute}/min</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => onInitiateSession(lawyer.userId, 'chat')}
                              disabled={!lawyer.isOnline}
                              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${lawyer.isOnline ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-150 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-550 hover:text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Chat</span>
                            </button>
                            <button
                              onClick={() => onInitiateSession(lawyer.userId, 'voice')}
                              disabled={!lawyer.isOnline}
                              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${lawyer.isOnline ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-150 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-550 hover:text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                            >
                              <PhoneCall className="w-4 h-4" />
                              <span>Voice</span>
                            </button>
                            <button
                              onClick={() => onInitiateSession(lawyer.userId, 'video')}
                              disabled={!lawyer.isOnline}
                              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${lawyer.isOnline ? 'bg-rose-50 dark:bg-rose-955/40 border-rose-150 dark:border-rose-900 text-rose-700 dark:text-rose-455 hover:bg-rose-600 dark:hover:bg-rose-550 hover:text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                            >
                              <Video className="w-4 h-4" />
                              <span>Video</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm"
            >
              <h2 className="font-display font-extrabold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-650" /> Consultation Session Records
              </h2>

              {consultations.length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs italic">
                  No legal consultations logged in this sandbox environment.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-655 dark:text-slate-350 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500">
                        <th className="py-3 px-2">Advocate</th>
                        <th className="py-3 px-2">Mode</th>
                        <th className="py-3 px-2">Duration</th>
                        <th className="py-3 px-2">Billed Cost</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultations.map((c) => (
                        <tr key={c.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                          <td className="py-3.5 px-2 font-bold text-slate-805 dark:text-white">{c.lawyerName}</td>
                          <td className="py-3.5 px-2 capitalize font-semibold">{c.type}</td>
                          <td className="py-3.5 px-2">{c.totalMinutes || 0} min</td>
                          <td className="py-3.5 px-2 font-mono font-bold text-slate-805 dark:text-white">₹{c.totalCost || 0}</td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                              c.status === 'active' ? 'bg-emerald-50 text-emerald-705 border border-emerald-100' :
                              c.status === 'completed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            {c.status === 'active' && (
                              <button
                                onClick={() => navigate(`/session/${c.id}`)}
                                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                              >
                                Enter Room
                              </button>
                            )}
                            {c.status === 'completed' && (
                              <button
                                onClick={() => handleOpenReviewModal(c.id)}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-1 rounded text-[10px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Rate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h2 className="font-display font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" /> Wallet Transactions Ledger
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check sandbox deposit status and metered charges history.</p>
              </div>

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 italic text-xs">No transactions logged. Use deposit gateway to top up.</div>
                ) : (
                  transactions.map((tx, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="block text-slate-800 dark:text-white font-bold">{tx.description}</strong>
                        <span className="text-[10px] text-slate-450 dark:text-slate-550 block mt-1 font-mono">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className={`block font-mono font-black text-sm ${tx.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 capitalize">{tx.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'cases' && (
            <motion.div
              key="cases"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* TOP ACTIONS AND POST CASE FORM */}
              <div className="grid md:grid-cols-3 gap-8">
                {/* Post New Case Request Card */}
                <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-fit space-y-4">
                  <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                    <span>Post Case Consultation</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    List a case description on the Open Cases Board. Verified advocates can inspect details and accept representation.
                  </p>

                  <form onSubmit={handleCreateCase} className="space-y-4 pt-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Case Category</label>
                      <select
                        value={caseCategory}
                        onChange={(e) => setCaseCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white cursor-pointer"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Case Title / Topic</label>
                      <input 
                        type="text"
                        value={caseTitle}
                        onChange={(e) => setCaseTitle(e.target.value)}
                        placeholder="e.g. Property boundary encroachment"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Detailed Description</label>
                      <textarea
                        rows={5}
                        value={caseDescription}
                        onChange={(e) => setCaseDescription(e.target.value)}
                        placeholder="Provide background context, dates of incident, specific claims, statutory laws involved, etc."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white font-sans font-medium"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingCase}
                      className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer text-xs"
                    >
                      {submittingCase ? "Listing Case Request..." : "Submit to Open Case Board"}
                    </button>
                  </form>
                </div>

                {/* Active Case Folders List */}
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-slate-900 dark:text-white text-base">Your Active Case Folders</h3>
                    <button
                      onClick={fetchCases}
                      className="text-xs font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reload
                    </button>
                  </div>

                  {fetchingCases ? (
                    <div className="text-center py-12 text-slate-400">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                      <span>Loading case folders...</span>
                    </div>
                  ) : cases.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
                      <FolderOpen className="w-12 h-12 text-slate-350 mx-auto" />
                      <h4 className="font-display font-bold text-slate-800 dark:text-white text-sm">No Legal Case Boards Active</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Post a detailed consultation request to list your case on our verified advocate boards. Once accepted, you can securely share documents.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cases.map((c: any) => {
                        const isVaultExpanded = !!expandedVault[c.id];
                        const docNameVal = docUploadNames[c.id] || '';

                        return (
                          <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <span className="text-[9px] font-mono font-bold tracking-widest text-amber-500 uppercase">{c.category}</span>
                                <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{c.title}</h4>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[9px] ${
                                c.status === 'searching' ? 'bg-amber-55 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60' :
                                c.status === 'ongoing' ? 'bg-emerald-55 text-emerald-700 dark:bg-emerald-955/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60' : 
                                'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {c.status === 'searching' ? 'Seeking Representation' : c.status === 'ongoing' ? 'Ongoing Consultation' : 'Closed'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-medium bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                              {c.description}
                            </p>

                            {c.status === 'ongoing' && (
                              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-350 font-bold bg-indigo-50/50 dark:bg-indigo-955/15 px-4 py-2.5 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span>Assigned Advocate: <strong className="text-indigo-650 dark:text-indigo-400">Adv. {c.lawyerName}</strong></span>
                              </div>
                            )}

                            {/* COLLAPSIBLE VAULT TRAY */}
                            <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                              <button
                                onClick={() => setExpandedVault(prev => ({ ...prev, [c.id]: !isVaultExpanded }))}
                                className="text-xs font-bold text-slate-700 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 flex items-center gap-2 cursor-pointer"
                              >
                                <FolderOpen className="w-4 h-4 text-amber-500" />
                                <span>Case Documents Vault ({c.documents?.length || 0} Files)</span>
                                <span className="text-[10px] text-slate-400 font-normal">({isVaultExpanded ? 'Click to collapse' : 'Click to expand'})</span>
                              </button>

                              {isVaultExpanded && (
                                <div className="mt-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl space-y-4 animate-fadeIn">
                                  {/* List documents */}
                                  {(!c.documents || c.documents.length === 0) ? (
                                    <p className="text-xs text-slate-455 italic">No files uploaded to this vault yet.</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {c.documents.map((doc: any) => (
                                        <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-xs">
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <div className="min-w-0">
                                              <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</span>
                                              <span className="block text-[9px] text-slate-400 mt-0.5">
                                                Uploaded by {doc.uploadedBy === 'client' ? 'You' : 'Advocate'} &bull; {new Date(doc.uploadedAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                          <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-850 px-2.5 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 shrink-0"
                                          >
                                            View PDF
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Upload inline form */}
                                  <div className="border-t border-slate-200/60 dark:border-slate-800 pt-4 space-y-3">
                                    <h5 className="font-display font-bold text-xs text-slate-700 dark:text-slate-300">Upload Important Case Document</h5>
                                    <div className="flex gap-2 text-xs">
                                      <input
                                        type="text"
                                        value={docNameVal}
                                        onChange={(e) => setDocUploadNames(prev => ({ ...prev, [c.id]: e.target.value }))}
                                        placeholder="Document Name (e.g. Aadhaar Card, FIR Copy, Sale Deed)"
                                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUploadDoc(c.id)}
                                        disabled={uploadingDoc[c.id]}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                      >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>{uploadingDoc[c.id] ? "Uploading..." : "Upload"}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </main>

      {/* RAZORPAY MOCK DIALOG */}
      {rechargeOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative">
            <div className="bg-blue-600 text-white p-4 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase">Razorpay Sandbox</span>
                <span className="font-display font-medium text-sm">Secured payment portal</span>
              </div>
              <button onClick={() => setRechargeOpen(false)} className="text-white/80 hover:text-white">&times;</button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recharge Amount (INR)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {["100", "500", "1000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRechargeVal(preset)}
                      className={`py-2 px-3 border rounded-xl text-sm font-semibold transition-all cursor-pointer ${rechargeVal === preset ? 'bg-blue-50 dark:bg-blue-950/45 border-blue-605 text-blue-700 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={rechargeVal}
                  onChange={(e) => setRechargeVal(e.target.value)}
                  placeholder="Custom amount in Rupees (₹)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-455">
                <div className="flex justify-between font-semibold">
                  <span>Merchant:</span>
                  <span className="text-slate-800 dark:text-white">LegalTalk India</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 font-bold text-slate-900 dark:text-white">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 dark:text-blue-400">₹{Number(rechargeVal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleRazorpayDeposit}
                disabled={depositing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer border border-blue-550"
              >
                {depositing ? "Initiating transaction gateway..." : "Simulate Razorpay Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL DIALOG */}
      {reviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitReview} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-lg mb-2">Submit Internal Quality Review</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Your rating helps the administration monitor quality control internally. Reviews are private and never displayed publicly.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Advocate rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-205 dark:text-slate-800'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Written review</label>
                <textarea 
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Describe your session experience, clarify legal points resolved, etc..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-2xl p-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white font-sans font-medium"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-705 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
