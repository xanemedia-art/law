import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Award, ShieldAlert, DollarSign, Wallet, Star, ArrowLeft, RefreshCw, Send, CheckCircle2, History, Sun, Moon, LogOut, LayoutDashboard, Compass, Calendar, Plus, FolderOpen, Upload, FileText, ShieldCheck } from 'lucide-react';
import { User, LawyerProfile, Consultation, STATE_DISTRICTS, Case } from '../types';


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

const LANGUAGES = [
  "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati",
  "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Kashmiri",
  "Konkani", "Manipuri"
];

const CATEGORIES = [
  "Criminal Law", "Civil Law", "Divorce", "Family Law", 
  "Property Law", "Corporate Law", "Labour Law", "Tax Law", 
  "Consumer Law", "Cyber Law", "Startup Law"
];


interface LawyerDashboardProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function LawyerDashboard({ currentUser, theme, onToggleTheme }: LawyerDashboardProps) {
  const navigate = useNavigate();

  // Profile data
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'history' | 'withdrawal'>('overview');

  // Forms rate configuration
  const [chatPrice, setChatPrice] = useState('20');
  const [voicePrice, setVoicePrice] = useState('30');
  const [videoPrice, setVideoPrice] = useState('40');
  const [isOnline, setIsOnline] = useState(false);
  const [bio, setBio] = useState('');

  // KYC details state
  const [kycUniversity, setKycUniversity] = useState('');
  const [kycGradYear, setKycGradYear] = useState('');
  const [kycBarAssociation, setKycBarAssociation] = useState('');
  const [kycPracticePlace, setKycPracticePlace] = useState('');
  const [kycEnrollmentCert, setKycEnrollmentCert] = useState('');
  const [kycCop, setKycCop] = useState('');
  const [kycLlbPdf, setKycLlbPdf] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycStep, setKycStep] = useState(1);

  // Subscription state
  const [submittingSub, setSubmittingSub] = useState(false);

  // Registration mode state (if user is lawyer role but has no profile yet)
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

  // Lawyer additional academic registration fields
  const [regLlbUniversity, setRegLlbUniversity] = useState('');
  const [regLlbGradYear, setRegLlbGradYear] = useState('');
  const [regBarAssociation, setRegBarAssociation] = useState('');
  const [regPlaceOfPractice, setRegPlaceOfPractice] = useState('');
  const [regEnrollmentCertFile, setRegEnrollmentCertFile] = useState('');
  const [regCopFile, setRegCopFile] = useState('');
  const [regLlbCertFile, setRegLlbCertFile] = useState('');

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

  // Wallet and central statements
  const [lawyerWallet, setLawyerWallet] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  // Case states
  const [cases, setCases] = useState<Case[]>([]);
  const [fetchingCases, setFetchingCases] = useState(false);
  const [acceptingCaseId, setAcceptingCaseId] = useState<string | null>(null);

  // Settings profile states
  const [settingsLanguages, setSettingsLanguages] = useState<string[]>([]);
  const [settingsCategories, setSettingsCategories] = useState<string[]>([]);

  // Document uploading & expansion
  const [docUploadNames, setDocUploadNames] = useState<Record<string, string>>({});
  const [uploadingDoc, setUploadingDoc] = useState<Record<string, boolean>>({});
  const [expandedVault, setExpandedVault] = useState<Record<string, boolean>>({});


  const fetchProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lawyers/profile/${currentUser.id}`);
      if (res.status === 404) {
        setRegistrationMode(true);
        setRegFullName(currentUser.name);
        setRegEmail(currentUser.email);
        setRegMobile(currentUser.mobile || '');
        return;
      }
      const data = await res.json();
      const found = data.profile;
      if (found) {
        setProfile(found);
        setChatPrice(found.chatPricePerMinute.toString());
        setVoicePrice(found.voicePricePerMinute.toString());
        setVideoPrice(found.videoPricePerMinute.toString());
        setIsOnline(found.isOnline);
        setBio(found.bio);
        setSettingsLanguages(found.languages || []);
        setSettingsCategories(found.categories || []);

        setKycUniversity(found.llbUniversity || '');
        setKycGradYear(found.llbGraduationYear ? found.llbGraduationYear.toString() : '');
        setKycBarAssociation(found.barAssociationName || '');
        setKycPracticePlace(found.placeOfPractice || '');
        setKycEnrollmentCert(found.enrollmentCertificateUrl || '');
        setKycCop(found.copUrl || '');
        setKycLlbPdf(found.llbCertificateUrl || '');
        
        setRegistrationMode(false);
      } else {
        setRegistrationMode(true);
        setRegFullName(currentUser.name);
        setRegEmail(currentUser.email);
        setRegMobile(currentUser.mobile || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletAndHistory = async () => {
    if (!currentUser) return;
    try {
      const resWallet = await fetch(`/api/wallet/${currentUser.id}`);
      const dataWallet = await resWallet.json();
      setLawyerWallet(dataWallet.balance || 0);
      setTransactions(dataWallet.transactions || []);

      const resHist = await fetch(`/api/consultations/history/${currentUser.id}`);
      const dataHist = await resHist.json();
      setConsultations(dataHist.consultations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCases = async () => {
    if (!currentUser) return;
    setFetchingCases(true);
    try {
      const res = await fetch(`/api/cases`);
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
    fetchProfile();
    fetchWalletAndHistory();
    fetchCases();
  }, [currentUser]);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regBarNumber || !regAadhaar || !regPan || !regLlbUniversity || !regLlbGradYear) {
      alert("Please fill in all academic and legal document details.");
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch("/api/lawyers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
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
          practiceDistrict: regPracticeDistrict,
          llbGraduationYear: Number(regLlbGradYear),
          llbUniversity: regLlbUniversity,
          barAssociationName: regBarAssociation,
          placeOfPractice: regPlaceOfPractice,
          enrollmentCertificateUrl: regEnrollmentCertFile || "https://example.com/certs/enrollment-cert.pdf",
          copUrl: regCopFile || "https://example.com/certs/cop.pdf",
          llbCertificateUrl: regLlbCertFile || "https://example.com/certs/llb-degree.pdf"
        })
      });
      const data = await res.json();
      if (data.error) {
        alert("Registration failed: " + data.error);
      } else {
        alert("Onboarding application submitted! Staging access approved. You must now activate your annual subscription.");
        setRegistrationMode(false);
        fetchProfile();
        fetchWalletAndHistory();
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
          chatPrice: Number(chatPrice),
          voicePrice: Number(voicePrice),
          videoPrice: Number(videoPrice),
          isOnline,
          bio,
          languages: settingsLanguages,
          categories: settingsCategories
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Advocate settings updated successfully!");
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptCase = async (caseId: string) => {
    if (!currentUser || acceptingCaseId) return;
    setAcceptingCaseId(caseId);
    try {
      const res = await fetch("/api/cases/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          lawyerId: currentUser.id,
          lawyerName: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("You have successfully accepted representation for this client case! It is now listed under your Ongoing Cases.");
        fetchCases();
      } else {
        alert("Failed to accept case: " + data.error);
      }
    } catch (e: any) {
      alert("Error accepting case: " + e.message);
    } finally {
      setAcceptingCaseId(null);
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
          uploadedBy: 'lawyer'
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


  const handlePaySubscription = async () => {
    if (!currentUser || submittingSub) return;
    setSubmittingSub(true);
    try {
      const res = await fetch("/api/lawyers/pay-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (data.success) {
        alert("Subscription fee of ₹1200 paid successfully! Your annual advocate profile is now active.");
        fetchProfile();
        fetchWalletAndHistory();
      } else {
        alert("Payment failed: " + data.error);
      }
    } catch (err: any) {
      alert("Subscription payment failed: " + err.message);
    } finally {
      setSubmittingSub(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmittingKyc) return;
    setIsSubmittingKyc(true);
    try {
      const res = await fetch("/api/lawyers/update-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          llbUniversity: kycUniversity,
          llbGraduationYear: Number(kycGradYear),
          barAssociationName: kycBarAssociation,
          placeOfPractice: kycPracticePlace,
          enrollmentCertificateUrl: kycEnrollmentCert || "https://example.com/mock-enrollment.pdf",
          copUrl: kycCop || "https://example.com/mock-cop.pdf",
          llbCertificateUrl: kycLlbPdf || "https://example.com/mock-llb.pdf"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("KYC Credentials uploaded successfully!");
        fetchProfile();
      } else {
        alert("Failed to submit KYC details: " + data.error);
      }
    } catch (err: any) {
      alert("Failed to upload KYC: " + err.message);
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const handleToggleSettingsCategory = (cat: string) => {
    setSettingsCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleToggleSettingsLanguage = (lang: string) => {
    setSettingsLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
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
        fetchWalletAndHistory();
      }
    } catch (err: any) {
      setWithdrawError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleCategory = (cat: string) => {
    setRegCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleToggleLanguage = (lang: string) => {
    setRegLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const isSubscriptionActive = () => {
    if (!profile?.subscriptionExpiresAt) return false;
    return new Date(profile.subscriptionExpiresAt).getTime() > Date.now();
  };

  const isKycCompleted = () => {
    return !!(
      profile?.llbUniversity &&
      profile?.llbGraduationYear &&
      profile?.barAssociationName &&
      profile?.placeOfPractice
    );
  };

  const handleToggleOnline = async () => {
    if (!isKycCompleted()) {
      alert("Please upload your Academic and KYC verification details before going online.");
      return;
    }
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    if (currentUser) {
      try {
        await fetch("/api/lawyers/update-prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            isOnline: nextStatus
          })
        });
      } catch (e) {
        console.error("Failed persisting online status", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <span className="font-mono text-slate-500 text-xs">Consulting Advocate Credentials database...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row font-sans selection:bg-amber-500/20">
      
      {/* SIDEBAR NAVBAR */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 z-30 h-auto md:h-screen p-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-2 rounded-xl shadow-md">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="font-display font-black text-base tracking-tight block leading-none text-slate-900 dark:text-white">LEGALTALK</span>
                <span className="text-[9px] font-bold tracking-widest text-amber-500 block uppercase font-mono mt-0.5">Chambers</span>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Chambers Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'settings' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <Compass className="w-4 h-4" />
              <span>Chambers Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'history' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Session History</span>
            </button>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'withdrawal' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'}`}
            >
              <Wallet className="w-4 h-4" />
              <span>Payout Ledger</span>
            </button>
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-slate-700 shrink-0">
              {currentUser?.name.charAt(0) || 'L'}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-bold text-slate-800 dark:text-white truncate">{currentUser?.name}</strong>
              <span className="block text-[9px] font-mono text-slate-455 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">Advocate</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onToggleTheme}
              className="hidden md:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 cursor-pointer shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("currentUser");
                window.location.href = "/login";
              }}
              className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-605 dark:text-slate-400 hover:text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto space-y-8">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white leading-none capitalize">{activeTab} Workspace</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Manage live rates, withdraw consultation earnings, and complete KYC qualifications.</p>
          </div>

          <button 
            onClick={() => { fetchProfile(); fetchWalletAndHistory(); }}
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {registrationMode ? (
          <div className="max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-805 p-8 space-y-6">
            <h2 className="font-display font-bold text-xl text-slate-905 dark:text-white">Register Virtual Chambers</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Full Legal Name</label>
                  <input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">State Bar Enrolment ID</label>
                  <input type="text" value={regBarNumber} onChange={(e) => setRegBarNumber(e.target.value)} placeholder="e.g. D/1042/2012" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Aadhaar Card (12-Digit)</label>
                  <input type="text" value={regAadhaar} onChange={(e) => setRegAadhaar(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">PAN Card (10-Digit)</label>
                  <input type="text" value={regPan} onChange={(e) => setRegPan(e.target.value.toUpperCase())} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">LLB Law School University</label>
                  <input type="text" value={regLlbUniversity} onChange={(e) => setRegLlbUniversity(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">LLB Graduation Year</label>
                  <input type="number" value={regLlbGradYear} onChange={(e) => setRegLlbGradYear(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" required />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer text-xs">
                Submit Credentials Onboarding
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 relative">
            
            {/* 1. ADMIN VERIFICATION BLOCKED OVERLAYS */}
            {profile?.verificationStatus && profile.verificationStatus !== 'approved' && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-45 rounded-3xl flex items-center justify-center p-4" style={{ minHeight: '550px' }}>
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                  {profile.verificationStatus === 'pending' && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-amber-50 dark:bg-amber-955/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900">
                        <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-500 animate-pulse" />
                      </div>
                      <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">Credentials Verification Pending</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Your professional advocate application is currently under administrative audit. An admin is verifying your State Bar enrolment credentials, LLB degree certificates, Aadhaar, and PAN records.
                      </p>
                      <div className="bg-slate-55 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 text-left text-xs space-y-2 text-slate-650 dark:text-slate-350">
                        <div><strong>Legal Name:</strong> {profile.name || currentUser?.name}</div>
                        <div><strong>Enrolment Number:</strong> {profile.barCouncilNumber}</div>
                        <div><strong>State Bar Council:</strong> {profile.stateBarCouncil}</div>
                        <div><strong>Place of Practice:</strong> {profile.placeOfPractice || "Pending"}</div>
                        <div><strong>University:</strong> {profile.llbUniversity} ({profile.llbGraduationYear})</div>
                      </div>
                      <p className="text-[10px] text-amber-605 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-955/10 py-2 rounded-lg border border-amber-100/40 dark:border-amber-900/40">
                        Your listing will go live automatically once verification is approved.
                      </p>
                    </div>
                  )}

                  {profile.verificationStatus === 'rejected' && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900">
                        <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                      </div>
                      <h3 className="font-display font-black text-xl text-rose-600">Verification Application Declined</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Unfortunately, the administrative team could not verify your submitted legal credentials. Your registration application has been rejected.
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Please verify that your bar council registrations are correct, or get in touch with our operations desk at <a href="mailto:support@legaltalk.in" className="text-indigo-655 font-bold hover:underline">support@legaltalk.in</a> to re-audit.
                      </p>
                    </div>
                  )}

                  {profile.verificationStatus === 'suspended' && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900">
                        <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-500 animate-bounce" />
                      </div>
                      <h3 className="font-display font-black text-xl text-rose-600">Advocate Chambers Suspended</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Your professional workspace and advocate listing have been suspended due to compliance reviews. You are restricted from accepting new client consultations.
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-455">
                        Please contact the central Bar Compliance supervisor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. SUBSCRIPTION BLOCKED OVERLAY */}
            {profile?.verificationStatus === 'approved' && !isSubscriptionActive() && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-40 rounded-3xl flex items-center justify-center p-4" style={{ minHeight: '400px' }}>
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center border border-slate-205 dark:border-slate-800">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900">
                    <Award className="w-8 h-8 text-amber-600 dark:text-amber-500 animate-pulse" />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-905 dark:text-white">Activate Professional Chambers</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                    Your profile requires an annual directory registry fee of <strong>₹1,200</strong> to list in search rosters and receive citizen consultations.
                  </p>
                  <p className="text-[10px] text-indigo-650 dark:text-indigo-400 mt-2 font-bold bg-indigo-50 dark:bg-indigo-950/45 py-2 px-3 rounded-lg border border-indigo-100/50 dark:border-indigo-900/50">
                    Chambers Balance: ₹{lawyerWallet.toFixed(2)}. The annual fee will be deducted directly. Recharge your wallet in the Payout Ledger tab if needed.
                  </p>
                  <button
                    onClick={handlePaySubscription}
                    disabled={submittingSub}
                    className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all mt-6 text-xs cursor-pointer"
                  >
                    {submittingSub ? "Processing..." : "Pay Annual Subscription (₹1,200)"}
                  </button>
                </div>
              </div>
            )}

            {/* STATS OVERVIEW CARDS */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm">
                <span className="block text-[10px] text-slate-400 uppercase font-black font-mono">Chambers Balance</span>
                <span className="block text-2xl font-display font-black text-slate-900 dark:text-white mt-1">₹{lawyerWallet.toFixed(2)}</span>
                <span className="block text-[9px] text-slate-400 mt-1.5">Net withdrawable consult revenue</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 p-6 rounded-3xl shadow-sm">
                <span className="block text-[10px] text-slate-400 uppercase font-black font-mono">Verified rating</span>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold text-slate-805 dark:text-white">{profile?.rating || 5}</span>
                  <span className="text-[10px] text-slate-400">({profile?.reviewCount || 0} reviews)</span>
                </div>
                <span className="block text-[9px] text-slate-400 mt-1.5">Calculated from history feedback</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 p-6 rounded-3xl shadow-sm">
                <span className="block text-[10px] text-slate-400 uppercase font-black font-mono">Chambers Status</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={handleToggleOnline}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isOnline ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOnline ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{isOnline ? "Online / Accept Calls" : "Away"}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 p-6 rounded-3xl shadow-sm">
                <span className="block text-[10px] text-slate-400 uppercase font-black font-mono">Subscription Active</span>
                <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {profile?.subscriptionExpiresAt ? `Expires ${new Date(profile.subscriptionExpiresAt).toLocaleDateString()}` : "Inactive"}
                </span>
                <span className="block text-[9px] text-slate-400 mt-1">Staging sandbox active license</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* KYC Required Block */}
                  {!isKycCompleted() && (
                    <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900 p-6 rounded-3xl space-y-4 animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white block text-sm">Academic and Practice Verification Needed</strong>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please provide your degree verification and regular place of practice to go online.</p>
                        </div>
                      </div>
                      <form onSubmit={handleKycSubmit} className="grid sm:grid-cols-2 gap-4 text-xs">
                        <input type="text" placeholder="LLB University" value={kycUniversity} onChange={(e) => setKycUniversity(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white" required />
                        <input type="number" placeholder="Graduation Year" value={kycGradYear} onChange={(e) => setKycGradYear(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white" required />
                        <input type="text" placeholder="Bar Association" value={kycBarAssociation} onChange={(e) => setKycBarAssociation(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white" required />
                        <input type="text" placeholder="Regular Place of Practice" value={kycPracticePlace} onChange={(e) => setKycPracticePlace(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white" required />
                        <button type="submit" className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                          Verify Academic KYC
                        </button>
                      </form>
                    </div>
                  )}

                  {/* CASE BOARDS WORKSPACE */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Ongoing Cases Panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="font-display font-black text-slate-905 dark:text-white text-sm flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                        <span>Ongoing Client Cases</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        These are active client cases you have accepted. You can share certificates, affidavits, and case files with the client.
                      </p>

                      {fetchingCases ? (
                        <div className="text-center py-6 text-slate-400">
                          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                          <span className="text-xs">Loading case folders...</span>
                        </div>
                      ) : cases.filter(c => c.lawyerId === currentUser?.id && c.status === 'ongoing').length === 0 ? (
                        <p className="text-xs text-slate-455 italic py-4">No active case representations currently assigned.</p>
                      ) : (
                        <div className="space-y-4">
                          {cases.filter(c => c.lawyerId === currentUser?.id && c.status === 'ongoing').map((c: any) => {
                            const isVaultExpanded = !!expandedVault[c.id];
                            const docNameVal = docUploadNames[c.id] || '';

                            return (
                              <div key={c.id} className="bg-slate-55 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <span className="text-[9px] font-mono font-bold tracking-widest text-amber-500 uppercase">{c.category}</span>
                                    <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs mt-0.5">{c.title}</h4>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5">Client: <strong>{c.clientName}</strong></span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                                  {c.description}
                                </p>

                                {/* COLLAPSIBLE VAULT TRAY */}
                                <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-3">
                                  <button
                                    onClick={() => setExpandedVault(prev => ({ ...prev, [c.id]: !isVaultExpanded }))}
                                    className="text-[10px] font-bold text-slate-700 dark:text-slate-355 hover:text-indigo-655 dark:hover:text-indigo-400 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Vault ({c.documents?.length || 0} Files)</span>
                                    <span className="text-[9px] text-slate-405 font-normal">({isVaultExpanded ? 'hide' : 'show'})</span>
                                  </button>

                                  {isVaultExpanded && (
                                    <div className="mt-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl space-y-3">
                                      {/* List documents */}
                                      {(!c.documents || c.documents.length === 0) ? (
                                        <p className="text-[10px] text-slate-400 italic">No files in this case vault yet.</p>
                                      ) : (
                                        <div className="space-y-1.5 font-medium">
                                          {c.documents.map((doc: any) => (
                                            <div key={doc.id} className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg flex items-center justify-between text-[11px] border border-slate-100 dark:border-slate-850">
                                              <div className="flex items-center gap-2 min-w-0">
                                                <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                <div className="min-w-0">
                                                  <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</span>
                                                  <span className="block text-[8px] text-slate-400">
                                                    By {doc.uploadedBy === 'lawyer' ? 'You' : 'Client'} &bull; {new Date(doc.uploadedAt).toLocaleDateString()}
                                                  </span>
                                                </div>
                                              </div>
                                              <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-850 px-2 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 shrink-0"
                                              >
                                                View PDF
                                              </a>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Upload doc form */}
                                      <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
                                        <h5 className="font-display font-bold text-[10px] text-slate-700 dark:text-slate-350">Upload Case Document</h5>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={docNameVal}
                                            onChange={(e) => setDocUploadNames(prev => ({ ...prev, [c.id]: e.target.value }))}
                                            placeholder="Document Title (e.g. Rejoinder, Written Submission)"
                                            className="flex-1 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-800 dark:text-white"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleUploadDoc(c.id)}
                                            disabled={uploadingDoc[c.id]}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-[10px] cursor-pointer flex items-center gap-1"
                                          >
                                            <Upload className="w-3 h-3" />
                                            <span>{uploadingDoc[c.id] ? "..." : "Upload"}</span>
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

                    {/* Open Case Requests Panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="font-display font-black text-slate-905 dark:text-white text-sm flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                        <span>Open Cases (People Seeking Representation)</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        These are citizen cases currently looking for a verified advocate. Click "Accept Representation" to add them to your active chambers.
                      </p>

                      {fetchingCases ? (
                        <div className="text-center py-6 text-slate-400">
                          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                          <span className="text-xs">Loading case board...</span>
                        </div>
                      ) : cases.filter(c => c.status === 'searching').length === 0 ? (
                        <p className="text-xs text-slate-455 italic py-4">No open case listings currently active in search boards.</p>
                      ) : (
                        <div className="space-y-4">
                          {cases.filter(c => c.status === 'searching').map((c: any) => {
                            return (
                              <div key={c.id} className="bg-slate-55 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <span className="text-[9px] font-mono font-bold tracking-widest text-amber-500 uppercase">{c.category}</span>
                                    <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs mt-0.5">{c.title}</h4>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5">Client Name: <strong>{c.clientName}</strong></span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                  {c.description}
                                </p>

                                <button
                                  type="button"
                                  onClick={() => handleAcceptCase(c.id)}
                                  disabled={acceptingCaseId === c.id}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>{acceptingCaseId === c.id ? "Accepting Representation..." : "Accept Representation"}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Incoming queues & updates summary */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">Live Metered Consultations Roster</h3>
                    {consultations.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">No metered consultations recorded in your sandbox chambers.</p>
                    ) : (
                      <div className="overflow-x-auto text-xs font-medium">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-850 font-bold text-slate-400">
                              <th className="py-2.5">Client Name</th>
                              <th className="py-2.5">Feed Mode</th>
                              <th className="py-2.5">Duration</th>
                              <th className="py-2.5">Earnings Share</th>
                              <th className="py-2.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {consultations.map(c => (
                              <tr key={c.id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                                <td className="py-3 font-bold text-slate-905 dark:text-white">{c.clientName}</td>
                                <td className="py-3 capitalize">{c.type}</td>
                                <td className="py-3">{c.totalMinutes || 0} min</td>
                                <td className="py-3 font-mono font-bold text-emerald-650">₹{c.lawyerReceipt || 0}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                    c.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                    c.status === 'completed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    {c.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}


              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl space-y-6">
                  <div>
                    <h3 className="font-display font-black text-slate-905 dark:text-white text-base">Chamber Profile & Consultation Rates</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your per-minute consultation fees, professional biography, and practice designations.</p>
                  </div>

                  <form onSubmit={handleUpdateSettings} className="space-y-6 text-xs">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Chat Price / Min (₹)</label>
                        <input type="number" value={chatPrice} onChange={(e) => setChatPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Voice Price / Min (₹)</label>
                        <input type="number" value={voicePrice} onChange={(e) => setVoicePrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Video Price / Min (₹)</label>
                        <input type="number" value={videoPrice} onChange={(e) => setVideoPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Advocate Bio Statement</label>
                      <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-slate-805 dark:text-white font-sans font-medium" required />
                    </div>

                    {/* Categories Selector */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase text-[9px] tracking-wider font-mono">Practice Categories</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map(cat => {
                          const isSelected = settingsCategories.includes(cat);
                          return (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => handleToggleSettingsCategory(cat)}
                              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-550 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Languages Selector */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase text-[9px] tracking-wider font-mono">Spoken Languages</label>
                      <div className="flex flex-wrap gap-1.5">
                        {LANGUAGES.map(lang => {
                          const isSelected = settingsLanguages.includes(lang);
                          return (
                            <button
                              type="button"
                              key={lang}
                              onClick={() => handleToggleSettingsLanguage(lang)}
                              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-550 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" disabled={updating} className="w-full bg-indigo-650 hover:bg-indigo-705 text-white font-bold py-3.5 rounded-xl cursor-pointer text-xs">
                      {updating ? "Saving Changes..." : "Save Chambers Settings"}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">Complete Consultation Records</h3>
                  {consultations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">No historical records logged.</p>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {consultations.map(c => (
                        <div key={c.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex justify-between items-center">
                          <div>
                            <strong className="block text-slate-800 dark:text-white font-bold">{c.clientName} ({c.type})</strong>
                            <span className="text-[10px] text-slate-400 dark:text-slate-550 block mt-1">{c.startedAt ? new Date(c.startedAt).toLocaleString() : "Staged session"}</span>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-emerald-600 font-mono">Earnings: ₹{c.lawyerReceipt || 0}</span>
                            <span className="text-[10px] text-slate-400">Total min: {c.totalMinutes || 0} mins</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'withdrawal' && (
                <motion.div key="withdrawal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-fit space-y-4">
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">Request Payout</h4>
                    <form onSubmit={handleWithdrawalRequest} className="space-y-3 text-xs">
                      {withdrawError && <div className="text-rose-600 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 p-2 rounded-lg font-bold">{withdrawError}</div>}
                      {withdrawSuccess && <div className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 p-2 rounded-lg font-bold">Withdrawal request logged successfully!</div>}
                      
                      <div>
                        <label className="block text-slate-400 mb-1">Amount to withdraw (₹)</label>
                        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="e.g. 1000" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Bank Holder Name</label>
                        <input type="text" value={withdrawHolder} onChange={(e) => setWithdrawHolder(e.target.value)} placeholder="Rohan Gupta" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Account Number</label>
                        <input type="text" value={withdrawAcc} onChange={(e) => setWithdrawAcc(e.target.value)} placeholder="1234567890" className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Bank IFSC Code</label>
                        <input type="text" value={withdrawIfsc} onChange={(e) => setWithdrawIfsc(e.target.value)} placeholder="HDFC0001234" className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-850 dark:text-white" required />
                      </div>
                      <button type="submit" disabled={updating} className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                        Request Payout
                      </button>
                    </form>
                  </div>

                  <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">Withdrawal History & Ledger</h4>
                    {transactions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">No payout transactions recorded in your ledger.</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {transactions.map((tx, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center">
                            <div>
                              <strong className="block text-slate-800 dark:text-white font-semibold">{tx.description}</strong>
                              <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(tx.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="block font-bold text-rose-600">-₹{tx.amount}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-mono">{tx.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </main>

    </div>
  );
}
