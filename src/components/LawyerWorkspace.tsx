import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, Sparkles, Sliders, ToggleLeft, ToggleRight, DollarSign, Wallet, Star, FileText, ArrowLeft, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { User, LawyerProfile, STATE_DISTRICTS } from '../types';

const STATE_BAR_COUNCILS = [
  "Andhra Pradesh Bar Council",
  "Assam, Nagaland, Mizoram, Arunachal Pradesh & Sikkim Bar Council",
  "Bihar Bar Council",
  "Chhattisgarh Bar Council",
  "Delhi Bar Council",
  "Gujarat Bar Council",
  "Himachal Pradesh Bar Council",
  "Jammu & Kashmir Bar Council",
  "Jharkhand Bar Council",
  "Karnataka Bar Council",
  "Kerala Bar Council",
  "Madhya Pradesh Bar Council",
  "Maharashtra & Goa Bar Council",
  "Manipur Bar Council",
  "Meghalaya Bar Council",
  "Odisha Bar Council",
  "Punjab & Haryana Bar Council",
  "Rajasthan Bar Council",
  "Tamil Nadu & Puducherry Bar Council",
  "Telangana Bar Council",
  "Tripura Bar Council",
  "Uttar Pradesh Bar Council",
  "Uttarakhand Bar Council",
  "West Bengal Bar Council"
];

interface LawyerWorkspaceProps {
  onBack: () => void;
  currentUser: User | null;
}

export default function LawyerWorkspace({ onBack, currentUser }: LawyerWorkspaceProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Profile forms
  const [chatPrice, setChatPrice] = useState<string>('20');
  const [voicePrice, setVoicePrice] = useState<string>('30');
  const [videoPrice, setVideoPrice] = useState<string>('40');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  
  // Registration form state for dynamic signups!
  const [registrationMode, setRegistrationMode] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regBarNumber, setRegBarNumber] = useState('');
  const [regStateBar, setRegStateBar] = useState('Delhi Bar Council');
  const [regPracticeState, setRegPracticeState] = useState('Delhi');
  const [regPracticeDistrict, setRegPracticeDistrict] = useState('New Delhi');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regExp, setRegExp] = useState('5');
  const [regLanguages, setRegLanguages] = useState<string[]>(['English', 'Hindi']);
  const [regCategories, setRegCategories] = useState<string[]>(['Divorce', 'Property Law']);

  const handleStateChange = (state: string) => {
    setRegPracticeState(state);
    const districts = STATE_DISTRICTS[state] || [];
    setRegPracticeDistrict(districts[0] || '');
  };

  // Withdrawal form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawHolder, setWithdrawHolder] = useState('');
  const [withdrawAcc, setWithdrawAcc] = useState('');
  const [withdrawIfsc, setWithdrawIfsc] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Wallet
  const [lawyerWallet, setLawyerWallet] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lawyers`);
      const data = await res.json();
      
      const found = data.lawyers.find((l: any) => l.userId === currentUser.id);
      if (found) {
        setProfile(found);
        setChatPrice(found.chatPricePerMinute.toString());
        setVoicePrice(found.voicePricePerMinute.toString());
        setVideoPrice(found.videoPricePerMinute.toString());
        setIsOnline(found.isOnline);
        setBio(found.bio);
        setRegistrationMode(false);
      } else {
        // No profile found - need to trigger registration mode!
        setRegistrationMode(true);
        setRegFullName(currentUser.name);
        setRegEmail(currentUser.email);
        setRegMobile(currentUser.mobile);
      }
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
      setLawyerWallet(data.balance || 0);
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchWallet();
  }, [currentUser]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regBarNumber || !regAadhaar || !regPan) {
      alert("Please fill in all mandatory legal document details.");
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch("/api/lawyers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          mobile: regMobile,
          barCouncilNumber: regBarNumber,
          stateBarCouncil: regStateBar,
          aadhaar: regAadhaar,
          pan: regPan,
          bio: regBio,
          experienceYears: Number(regExp),
          languages: regLanguages,
          categories: regCategories,
          chatPrice: 20,
          voicePrice: 30,
          videoPrice: 40,
          practiceState: regPracticeState,
          practiceDistrict: regPracticeDistrict
        })
      });
      const data = await res.json();
      if (data.error) {
        alert("Registration failed: " + data.error);
      } else {
        alert("Registration submitted! Credentials are now pending review with system administrator. Default access is approved for testing.");
        setRegistrationMode(false);
        fetchProfile();
      }
    } catch (err: any) {
      alert("Failed submitting profile: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/lawyers/update-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          chatPrice,
          voicePrice,
          videoPrice,
          isOnline,
          bio
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Your profile pricing rates & availability have been updated successfully!");
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);

    const amt = Number(withdrawAmount);
    if (!withdrawAmount || amt <= 0 || isNaN(amt)) {
      setWithdrawError("Specify a valid numerical withdrawal amount.");
      return;
    }

    if (amt > lawyerWallet) {
      setWithdrawError(`Insufficient balance! Your earnings are ₹${lawyerWallet}, you cannot request ₹${amt}`);
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch("/api/lawyers/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          amount: amt,
          bankHolderName: withdrawHolder,
          bankAccountNumber: withdrawAcc,
          ifscCode: withdrawIfsc
        })
      });
      const data = await res.json();
      if (data.error) {
        setWithdrawError(data.error);
      } else {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        setWithdrawHolder('');
        setWithdrawAcc('');
        setWithdrawIfsc('');
        fetchWallet();
      }
    } catch (err: any) {
      setWithdrawError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-12 h-12 text-indigo-650 animate-spin mx-auto mb-4" />
        <span className="font-mono text-slate-500 text-sm">Consulting Advocate Credentials database...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. BACK CONTROLS HEADER */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-slate-100 p-2 rounded-lg transition-colors border border-slate-200 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-black text-xl text-slate-900 leading-none">Attorney Workspace</h1>
            <p className="text-xs text-slate-500 mt-1">Configure profile details, pricing, and split payouts</p>
          </div>
        </div>
        <span className="font-mono text-xs text-slate-400">Authenticated: {currentUser?.name}</span>
      </div>

      {/* 2. REGISTRATION MODE CAPTURE SCREEN */}
      {registrationMode ? (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10">
          
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase font-display select-none">Registration Portal</span>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-3">Bar Enrolment & Onboarding</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              To activate consulting voice/video lines, Indian Bar rules mandate manual filing of state bar enrolment certificates, Aadhaar number, and PAN registrations.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Full Legal Name</label>
                <input 
                  type="text" 
                  value={regFullName} 
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">E-mail Address</label>
                <input 
                  type="email" 
                  value={regEmail} 
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Bar Council Enrolment Number</label>
                <input 
                  type="text" 
                  value={regBarNumber}
                  onChange={(e) => setRegBarNumber(e.target.value)}
                  placeholder="e.g. D/1042/2012" 
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">State Bar Council Location</label>
                <select 
                  value={regStateBar} 
                  onChange={(e) => setRegStateBar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {STATE_BAR_COUNCILS.map(council => (
                    <option key={council} value={council}>{council}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Practice State Location</label>
                <select 
                  value={regPracticeState} 
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {Object.keys(STATE_DISTRICTS).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Practice District</label>
                <select 
                  value={regPracticeDistrict} 
                  onChange={(e) => setRegPracticeDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {(STATE_DISTRICTS[regPracticeState] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">12-Digit Aadhaar ID Card Number</label>
                <input 
                  type="text" 
                  minLength={12} 
                  maxLength={12} 
                  value={regAadhaar}
                  onChange={(e) => setRegAadhaar(e.target.value)}
                  placeholder="e.g. 543292104561" 
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Permanent Account Number (PAN)</label>
                <input 
                  type="text" 
                  minLength={10} 
                  maxLength={10} 
                  value={regPan}
                  onChange={(e) => setRegPan(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F" 
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Practicing Experience (Years)</label>
                <input 
                  type="number" 
                  value={regExp} 
                  onChange={(e) => setRegExp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Mobile Contact Phone</label>
                <input 
                  type="text" 
                  value={regMobile} 
                  onChange={(e) => setRegMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Detailed Practice Biography (Bio)</label>
              <textarea 
                rows={3} 
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="List courtroom details, administrative specializations, high profile achievements..."
                className="w-full bg-slate-50 border border-slate-350 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-900">
              <ShieldAlert className="w-5.5 h-5.5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5">Verification Compliance:</strong> LegalTalk India enforces a 20% commission on matches made. By registering, you authorize audits of state enrolments and agree to transparent ledger splits.
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={updating}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Submit Registration Package
              </button>
              <button 
                type="button" 
                onClick={onBack}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl transition-all border border-slate-200"
              >
                Cancel
              </button>
            </div>

          </form>

        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* PROFILE STATISTICAL SCOREBOARDS COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Professional Card Display */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex gap-4">
                <img 
                  src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150"} 
                  alt={currentUser?.name} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50" 
                />
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-lg leading-tight">{currentUser?.name}</h3>
                  <span className="block text-xs text-indigo-600 font-semibold">{profile?.barCouncilNumber}</span>
                  
                  {/* VERIFICATION BADGE */}
                  <span className={`inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded-full mt-2 border ${
                    profile?.verificationStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    profile?.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    Status: {profile?.verificationStatus}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 mt-6 pt-6 space-y-2.5 text-xs text-slate-550">
                <div className="flex justify-between">
                  <span>State Registry:</span>
                  <strong className="text-slate-800">{profile?.stateBarCouncil}</strong>
                </div>
                {profile?.practiceState && (
                  <div className="flex justify-between">
                    <span>Practice Area:</span>
                    <strong className="text-slate-800">{profile?.practiceDistrict}, {profile?.practiceState}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Practice Exp:</span>
                  <strong className="text-slate-800">{profile?.experienceYears} Years</strong>
                </div>
                <div className="flex justify-between">
                  <span>Languages:</span>
                  <strong className="text-slate-800">{profile?.languages.join(', ')}</strong>
                </div>
              </div>
            </div>

            {/* Dashboard earnings panel */}
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-3xl p-6 shadow-lg border border-indigo-950 flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-4 translate-y-4"></div>
              
              <div className="flex justify-between items-start">
                <div className="bg-white/10 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-indigo-200" />
                </div>
                <span className="text-xs text-indigo-200 font-mono">Commission: 20% Net Platform Fee</span>
              </div>

              <div>
                <span className="block text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">Your Total Split Earnings</span>
                <span className="text-3xl font-display font-black text-amber-300">₹{lawyerWallet.toFixed(2)}</span>
                <span className="block text-[10px] text-indigo-200 mt-1">Pending approval requests do not affect totals.</span>
              </div>
            </div>

            {/* Other stats grids */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
                <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Public Stars</span>
                <span className="text-xl font-display font-bold text-slate-800 mt-1.5 flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-current text-amber-400" /> {profile?.rating || '5.0'}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">From {profile?.reviewCount || 0} chats</span>
              </div>
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
                <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">All Bookings</span>
                <span className="text-2xl font-display font-black text-indigo-600 mt-1.5 block">
                  {profile?.reviewCount + 1 || 4}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">Completed Interactions</span>
              </div>
            </div>

          </div>

          {/* ACTIVE MANAGEMENT CONTROLS MODULE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pricing details change form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display font-extrabold text-slate-900 text-base mb-6 flex items-center gap-1.5">
                <Sliders className="w-5 h-5 text-indigo-600" /> Availability & Charging Rates
              </h2>

              <form onSubmit={handleUpdateSettings} className="space-y-6">
                
                {/* Available switches */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <strong className="block text-sm text-slate-900">Configure Availability Channel</strong>
                    <span className="block text-xs text-slate-500 mt-0.5">Toggle online so customers can search and call you.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOnline(!isOnline)}
                    className="text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
                  >
                    {isOnline ? (
                      <ToggleRight className="w-14 h-14" />
                    ) : (
                      <ToggleLeft className="w-14 h-14 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Chat Price (Per Minute)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 font-semibold text-sm">₹</span>
                      <input 
                        type="number" 
                        value={chatPrice}
                        onChange={(e) => setChatPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-350 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Audio Voice (Per Minute)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 font-semibold text-sm">₹</span>
                      <input 
                        type="number" 
                        value={voicePrice}
                        onChange={(e) => setVoicePrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-350 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">HD Video (Per Minute)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 font-semibold text-sm">₹</span>
                      <input 
                        type="number" 
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-350 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Modify Advocate Bio</label>
                  <textarea 
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={updating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  {updating ? "Syncing Workspace..." : "Commit Price & Status Changes"}
                </button>

              </form>

            </div>

            {/* WALLET WITHDRAWALS PANELS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display font-extrabold text-slate-900 text-base mb-2 flex items-center gap-1.5">
                <Wallet className="w-5 h-5 text-indigo-600" /> Payout Requests
              </h2>
              <p className="text-xs text-slate-500 mb-6">Receive earnings directly into your registered Indian Bank Account.</p>

              <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                
                {withdrawSuccess && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Withdrawal request submitted successfully! Funds will credit within 24 working hours.</span>
                  </div>
                )}

                {withdrawError && (
                  <div className="bg-rose-50 border border-rose-250 text-rose-850 text-xs rounded-xl p-3">
                    {withdrawError}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Desired Payout Amount (INR)</label>
                    <input 
                      type="number" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Bank Holder Name</label>
                    <input 
                      type="text" 
                      value={withdrawHolder}
                      onChange={(e) => setWithdrawHolder(e.target.value)}
                      placeholder="As per bank passbook"
                      className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Account Number</label>
                    <input 
                      type="text" 
                      value={withdrawAcc}
                      onChange={(e) => setWithdrawAcc(e.target.value)}
                      placeholder="e.g. 918210452310"
                      className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Bank IFSC Code</label>
                    <input 
                      type="text" 
                      value={withdrawIfsc}
                      onChange={(e) => setWithdrawIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0000142"
                      className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={updating}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Initiate Secure Bank Transfer
                </button>

              </form>

              {/* Transaction list ledger */}
              <div className="border-t border-slate-150 mt-8 pt-6 space-y-3">
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Accounting Statement Logs</span>
                <div className="space-y-2">
                  {transactions.length === 0 ? (
                    <span className="text-xs text-slate-400 italic block leading-relaxed">No accounting logs available securely.</span>
                  ) : (
                    transactions.map((tx, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <strong className="block text-slate-800 uppercase font-mono text-[10px]">{tx.type} &bull; <span className="text-slate-400 font-normal">{tx.id}</span></strong>
                          <span className="block text-[11px] text-slate-500 mt-1">{tx.description}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                        <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
