import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, MessageSquare, PhoneCall, Video, Wallet, ArrowLeft, RefreshCw, Layers, Check, ShieldCheck, History } from 'lucide-react';
import { User, LawyerProfile, STATE_DISTRICTS } from '../types';

interface LawyerMarketplaceProps {
  onBack: () => void;
  currentUser: User | null;
  onInitiateSession: (lawyerId: string, type: 'chat' | 'voice' | 'video') => void;
}

export default function LawyerMarketplace({ onBack, currentUser, onInitiateSession }: LawyerMarketplaceProps) {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [priceMax, setPriceMax] = useState<number>(150);
  const [minExp, setMinExp] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);

  const handleFilterStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('');
  };

  // Razorpay simulated state
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeVal, setRechargeVal] = useState<string>('500');
  const [depositing, setDepositing] = useState(false);

  const categories = [
    "Criminal Law", "Civil Law", "Divorce", "Family Law", 
    "Property Law", "Corporate Law", "Labour Law", "Tax Law", 
    "Consumer Law", "Cyber Law", "Startup Law"
  ];

  const languages = [
    "English",
    "Hindi",
    "Bengali",
    "Marathi",
    "Telugu",
    "Tamil",
    "Gujarati",
    "Urdu",
    "Kannada",
    "Odia",
    "Malayalam",
    "Punjabi",
    "Assamese",
    "Kashmiri",
    "Konkani",
    "Manipuri"
  ];

  const fetchProducts = async () => {
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
      setLawyers(data.lawyers || []);
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

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedLanguage, selectedState, selectedDistrict, priceMax, minExp, minRating]);

  useEffect(() => {
    fetchWallet();
  }, [currentUser]);

  const handleRazorpayDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || depositing || !rechargeVal || Number(rechargeVal) <= 0) return;

    setDepositing(true);
    const orderId = `rzp_test_ord_${Math.random().toString(36).substr(2, 9)}`;
    try {
      // Simulate Razorpay Gateway overlay success trigger
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDepositing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* WALLET SUMMARY BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full transform translate-x-10 -translate-y-10"></div>
        
        <div className="flex items-center gap-4 relative">
          <div className="bg-indigo-500/20 text-indigo-400 p-4 rounded-2xl border border-indigo-400/20">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Your Wallet Balance</span>
              <button onClick={fetchWallet} className="text-slate-400 hover:text-white transition-all"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            <span className="text-2xl sm:text-3xl font-display font-black text-amber-400">₹{walletBalance.toFixed(2)}</span>
            <span className="block text-xs text-slate-400 mt-1">Logged in as: <strong className="text-slate-200">{currentUser?.name}</strong> ({currentUser?.role})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setRechargeOpen(true)}
            className="flex-1 md:flex-none text-slate-950 bg-amber-400 hover:bg-amber-300 font-bold px-6 py-3.5 rounded-xl transition-all text-center text-sm shadow-lg shadow-amber-400/10 cursor-pointer"
          >
            + Recharge Wallet (Mock Razorpay)
          </button>
          <button 
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-5 py-3.5 rounded-xl text-sm transition-all"
          >
            Back Home
          </button>
        </div>
      </div>

      {/* RAZORPAY EMULATION SHEET MODAL */}
      {rechargeOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative">
            
            {/* Razorpay Banner Mimic */}
            <div className="bg-blue-600 text-white p-4 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase">Razorpay Checkout</span>
                <span className="font-display font-medium text-sm">Secured sandbox session</span>
              </div>
              <button onClick={() => setRechargeOpen(false)} className="text-white/80 hover:text-white">&times;</button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select / Enter INR Recharge Amount</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {["100", "500", "1000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRechargeVal(preset)}
                      className={`py-2 px-3 border rounded-xl text-sm font-semibold transition-all ${rechargeVal === preset ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={rechargeVal}
                  onChange={(e) => setRechargeVal(e.target.value)}
                  placeholder="Or enter custom amount in Rupees (₹)"
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-650">
                <div className="flex justify-between">
                  <span>Merchant Title:</span>
                  <strong className="text-slate-800">LegalTalk India</strong>
                </div>
                <div className="flex justify-between">
                  <span>Currency:</span>
                  <span>INR (₹)</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600">₹{Number(rechargeVal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleRazorpayDeposit}
                disabled={depositing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {depositing ? (
                  <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4 animate-spin" /> Fetching Payment gateway...</span>
                ) : (
                  <span>Simulate Payment Acceptance</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND GRID SPECIALTIES */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* FILTERS PANEL */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-h-[85vh] overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-600" /> Filters & Sort
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
              }}
              className="text-indigo-600 text-xs font-semibold hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Practice categories */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Practice Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
            >
              <option value="">-- All General Legal --</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

           {/* Languages */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
            >
              <option value="">-- Any Language --</option>
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* State Location */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">State Location</label>
            <select
              value={selectedState}
              onChange={(e) => handleFilterStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
            >
              <option value="">-- Any State --</option>
              {Object.keys(STATE_DISTRICTS).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* District Location */}
          {selectedState && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">District Location</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
              >
                <option value="">-- Any District --</option>
                {(STATE_DISTRICTS[selectedState] || []).map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price Max slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Max Price per Minute</label>
              <span className="text-xs font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-55/80 rounded">₹{priceMax}/min</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="150" 
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-450 font-bold">
              <span>₹10/min</span>
              <span>₹150/min</span>
            </div>
          </div>

          {/* Experience level */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Minimum Experience</label>
            <div className="grid grid-cols-4 gap-1">
              {[0, 5, 10, 20].map((exp) => (
                <button
                  key={exp}
                  onClick={() => setMinExp(exp)}
                  className={`py-1 rounded-lg text-xs font-semibold border transition-all ${minExp === exp ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100'}`}
                >
                  {exp === 0 ? 'Any' : `${exp}+ Yrs`}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Minimum Rating</label>
            <div className="grid grid-cols-4 gap-1">
              {[0, 4, 4.5, 4.8].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMinRating(rate)}
                  className={`py-1 rounded-lg text-xs font-semibold border transition-all ${minRating === rate ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100'}`}
                >
                  {rate === 0 ? 'Any' : `★${rate}`}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions list shortcut panel for client audit */}
          <div className="border-t border-slate-150 pt-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1"><History className="w-3.5 h-3.5" /> Recent Transactions</h3>
            <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <span className="text-[11px] text-slate-400 block italic leading-normal">No recent balance transitions logged.</span>
              ) : (
                transactions.slice(0, 4).map((tx, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <div className="flex justify-between items-center font-semibold text-slate-755">
                      <span className={`uppercase font-mono text-[9px] px-1 py-0.5 rounded ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{tx.type}</span>
                      <span className={tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}>
                        {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount}
                      </span>
                    </div>
                    <p className="text-slate-500 line-clamp-1">{tx.description}</p>
                    <span className="text-[9px] text-slate-400 block font-mono">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* LAWYERS DIRECTORY GRID */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="flex items-center justify-between bg-white border border-slate-150 rounded-2xl p-4.5 shadow-xs">
            <span className="text-sm font-semibold text-slate-600">
              Approved Advocates Found: <strong className="text-slate-900">{lawyers.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online Channels Active
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border rounded-2xl p-6 h-56 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
                </div>
              ))}
            </div>
          ) : lawyers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
              <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-display font-extrabold text-xl text-slate-950">No verified lawyers found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Try loosening your filters or selecting alternate practice areas. Verifications run regularly under Bar Rules.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
              {lawyers.map((lawyer) => (
                <div 
                  key={lawyer.userId} 
                  className="bg-white rounded-3xl p-6 border border-slate-200 transition-all hover:shadow-xl hover:shadow-indigo-50/20 relative flex flex-col justify-between"
                >
                  
                  {/* Verification Badge & Online details */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-blue-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> State Bar-Verified
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${lawyer.isOnline ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${lawyer.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {lawyer.isOnline ? 'Available' : 'Away'}
                    </span>
                  </div>

                  {/* Profile Layout */}
                  <div className="flex gap-4">
                    <img 
                      src={lawyer.avatarUrl} 
                      alt={lawyer.name} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50 shrink-0 shadow-sm" 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2 leading-tight truncate">
                        {lawyer.name}
                      </h3>
                      <p className="text-xs font-medium text-indigo-600 mt-1">{lawyer.barCouncilNumber}</p>
                      <p className="text-xs text-slate-500 mt-1 font-semibold">{lawyer.experienceYears} Years Exp &bull; {lawyer.languages.join(', ')}</p>
                      {lawyer.practiceState && (
                        <p className="text-xs text-slate-500 mt-1 font-semibold">Practice: <strong className="text-slate-800">{lawyer.practiceDistrict}, {lawyer.practiceState}</strong></p>
                      )}
                    </div>
                  </div>

                  {/* Practice Tags */}
                  <div className="my-4 flex flex-wrap gap-1">
                    {lawyer.categories.map((c: string) => (
                      <span key={c} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Bio brief */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {lawyer.bio}
                  </p>

                  {/* Ratings summary and price matrices */}
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-slate-400 font-medium text-[10px] uppercase">RATING</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="font-bold text-slate-800">{lawyer.rating}</span>
                        <span className="text-slate-400 font-medium">({lawyer.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium text-[10px] uppercase">Minute Pricing</span>
                      <span className="block text-slate-800 font-semibold mt-1">Starting ₹{lawyer.chatPricePerMinute}/min</span>
                    </div>
                  </div>

                  {/* Initiation Controls */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-center">Start On-Demand Session (Minute Deduction):</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => onInitiateSession(lawyer.userId, 'chat')}
                        disabled={!lawyer.isOnline}
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                          lawyer.isOnline 
                            ? 'bg-indigo-50 border-indigo-150 text-indigo-700 hover:bg-indigo-600 hover:text-white' 
                            : 'bg-slate-55/70 border-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        title="Chat Consult"
                      >
                        <MessageSquare className="w-4.5 h-4.5" />
                        <span>Chat (₹{lawyer.chatPricePerMinute}/m)</span>
                      </button>

                      <button 
                        onClick={() => onInitiateSession(lawyer.userId, 'voice')}
                        disabled={!lawyer.isOnline}
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                          lawyer.isOnline 
                            ? 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-600 hover:text-white' 
                            : 'bg-slate-55/70 border-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        title="Audio Consult"
                      >
                        <PhoneCall className="w-4.5 h-4.5" />
                        <span>Voice (₹{lawyer.voicePricePerMinute}/m)</span>
                      </button>

                      <button 
                        onClick={() => onInitiateSession(lawyer.userId, 'video')}
                        disabled={!lawyer.isOnline}
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                          lawyer.isOnline 
                            ? 'bg-rose-50 border-rose-150 text-rose-700 hover:bg-rose-600 hover:text-white' 
                            : 'bg-slate-55/70 border-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        title="Video Consult"
                      >
                        <Video className="w-4.5 h-4.5" />
                        <span>Video (₹{lawyer.videoPricePerMinute}/m)</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
