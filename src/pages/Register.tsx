import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Users, Award, Mail, Phone, User as UserIcon, MapPin, Globe, ShieldAlert, RefreshCw, Sun, Moon } from 'lucide-react';
import { STATE_DISTRICTS } from '../types';

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

interface RegisterProps {
  onRegisterSuccess: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Register({ onRegisterSuccess, theme, onToggleTheme }: RegisterProps) {
  const [role, setRole] = useState<'client' | 'lawyer' | 'admin'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // General fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('English');
  const [invitationCode, setInvitationCode] = useState('');

  // OTP simulation flow
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  // Lawyer specific fields
  const [barNumber, setBarNumber] = useState('');
  const [stateBar, setStateBar] = useState('Delhi Bar Council');
  const [practiceState, setPracticeState] = useState('Delhi');
  const [practiceDistrict, setPracticeDistrict] = useState('New Delhi');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [experience, setExperience] = useState('5');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<string[]>(['Divorce', 'Property Law']);
  const [languagesList, setLanguagesList] = useState<string[]>(['English', 'Hindi']);

  // Lawyer Academic / KYC certificates
  const [llbGraduationYear, setLlbGraduationYear] = useState('');
  const [llbUniversity, setLlbUniversity] = useState('');
  const [barAssociationName, setBarAssociationName] = useState('');
  const [placeOfPractice, setPlaceOfPractice] = useState('');
  const [enrollmentCertFile, setEnrollmentCertFile] = useState<string>('');
  const [copFile, setCopFile] = useState<string>('');
  const [llbCertFile, setLlbCertFile] = useState<string>('');

  const handleStateChange = (state: string) => {
    setPracticeState(state);
    const districts = STATE_DISTRICTS[state] || [];
    setPracticeDistrict(districts[0] || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !mobile) {
      setError('Please fill out all basic contact fields.');
      return;
    }

    if (role === 'admin' && !invitationCode) {
      setError('An admin invitation code is required.');
      return;
    }

    if (role === 'client' && !otpSent) {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(mockOtp);
      setOtpSent(true);
      alert(`[SIMULATION] Verification SMS sent to +91 ${mobile}.\nUse OTP Code: ${mockOtp}`);
      return;
    }

    setLoading(true);

    try {
      if (role === 'client') {
        if (enteredOtp !== otpCode) {
          setError('Invalid OTP code. Please enter the simulated verification code.');
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email,
            mobile,
            role: 'client',
            city,
            language
          })
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          alert("Registration successful! You have been granted 2 free calling minutes and 10 free chats.");
          onRegisterSuccess();
          navigate('/login');
        }
      } else if (role === 'admin') {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email,
            mobile,
            role: 'admin',
            city,
            invitationCode
          })
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          alert("Admin account registered successfully!");
          onRegisterSuccess();
          navigate('/login');
        }
      } else {
        if (!barNumber) {
          setError('Bar Council Enrolment ID is required.');
          setLoading(false);
          return;
        }

        const res = await fetch("/api/lawyers/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            mobile,
            barCouncilNumber: barNumber,
            stateBarCouncil: stateBar,
            aadhaar: 'Pending',
            pan: 'Pending',
            bio: bio || "Verified Professional Advocate registered under State Bar council guidelines.",
            experienceYears: Number(experience) || 3,
            languages: languagesList || ["English"],
            categories: categories || ["General Legal Guidance"],
            chatPrice: 20,
            voicePrice: 30,
            videoPrice: 40,
            practiceState,
            practiceDistrict,
            llbGraduationYear: 2020,
            llbUniversity: 'Pending',
            barAssociationName: 'Pending',
            placeOfPractice: 'Pending',
            enrollmentCertificateUrl: "https://example.com/certs/enrollment-cert.pdf",
            copUrl: "https://example.com/certs/cop.pdf",
            llbCertificateUrl: "https://example.com/certs/llb-degree.pdf"
          })
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          alert("Advocate registration submitted! Sandbox access approved. You will need to pay the ₹1200 annual subscription upon login.");
          onRegisterSuccess();
          navigate('/login');
        }
      }
    } catch (err: any) {
      setError("Server communications failure: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleToggleLanguage = (lang: string) => {
    setLanguagesList(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden grid md:grid-cols-12 my-6 relative"
      >
        {/* LEFT COMPLIANCE BANNER */}
        <div className="md:col-span-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-955 text-white p-8 flex flex-col justify-between relative overflow-hidden border-r border-slate-855">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full translate-x-4 -translate-y-4"></div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/10 text-amber-400 p-2.5 rounded-xl border border-white/10 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight block leading-none">LEGALTALK</span>
              <span className="text-[9px] font-bold tracking-widest text-amber-500 block uppercase font-mono mt-1">India</span>
            </div>
          </div>

          <div className="my-8 space-y-4">
            <h2 className="font-display font-extrabold text-2xl leading-tight">
              Indian Bar Council Adherence
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              We enforce strict compliance measures. Advocate registrations require Aadhaar/PAN audits before verification certificates are issued.
            </p>
          </div>

          <div className="bg-indigo-900/30 border border-slate-850 p-3.5 rounded-xl text-[10px] text-slate-350 flex items-start gap-2 leading-relaxed font-medium">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-550 shrink-0 mt-0.5" />
            <span>Sandbox system. Use test identifiers only. Do not input production credentials.</span>
          </div>
        </div>

        {/* RIGHT FORM CONTAINER */}
        <div className="md:col-span-8 p-8 sm:p-10 flex flex-col justify-between space-y-6 relative">
          
          {/* Floating theme toggle */}
          <div className="absolute top-6 right-6">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div>
            <h1 className="font-display font-black text-3xl text-slate-950 dark:text-white mb-1.5">Create Account</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">Choose your portal pathway and fill the registry details.</p>

            {/* ROLE PICKER */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-6 border border-slate-200/50 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRole('client');
                  setOtpSent(false);
                  setError('');
                }}
                className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  role === 'client' 
                    ? 'text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-800' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {role === 'client' && (
                  <motion.div 
                    layoutId="registerRoleTab" 
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-205/20 dark:border-slate-800 -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Users className="w-3.5 h-3.5" />
                <span>Client</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('lawyer');
                  setError('');
                }}
                className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  role === 'lawyer' 
                    ? 'text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-800' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {role === 'lawyer' && (
                  <motion.div 
                    layoutId="registerRoleTab" 
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-205/20 dark:border-slate-800 -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Award className="w-3.5 h-3.5" />
                <span>Advocate</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setError('');
                }}
                className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  role === 'admin' 
                    ? 'text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-800' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {role === 'admin' && (
                  <motion.div 
                    layoutId="registerRoleTab" 
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-205/20 dark:border-slate-800 -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Scale className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-400 text-xs rounded-2xl p-3.5 mb-5 font-bold"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-slate-805 dark:text-slate-200">
              {/* BASIC FIELDS */}
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">Full Legal Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400"><UserIcon className="w-4.5 h-4.5" /></span>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adv. Rohan Gupta"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400"><Mail className="w-4.5 h-4.5" /></span>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rohan@gmail.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">Mobile Contact Phone</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400"><Phone className="w-4.5 h-4.5" /></span>
                    <input 
                      type="text" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>
                {otpSent && role === 'client' ? (
                  <div className="sm:col-span-2 space-y-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-2xl">
                    <div className="text-xs text-indigo-950 dark:text-indigo-305 font-medium">
                      <span className="font-bold block mb-1">Simulated OTP Authentication Triggered!</span>
                      A simulation code was dispatched to <strong>+91 {mobile}</strong>. Enter it below to authorize.
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">6-Digit OTP Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-center font-bold tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-650/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {role === 'client' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">City / Region</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3.5 text-slate-400"><MapPin className="w-4.5 h-4.5" /></span>
                          <input 
                            type="text" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Delhi"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium" 
                          />
                        </div>
                      </div>
                    )}

                    {role === 'admin' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">Admin Invitation Code</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3.5 text-slate-400"><ShieldAlert className="w-4.5 h-4.5" /></span>
                          <input 
                            type="text" 
                            value={invitationCode}
                            onChange={(e) => setInvitationCode(e.target.value)}
                            placeholder="e.g. ADM-INV-123456"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-bold" 
                            required 
                          />
                        </div>
                      </div>
                    )}

                    {role === 'lawyer' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">Practice Experience (Years)</label>
                        <input 
                          type="number" 
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl px-4.5 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium" 
                          required 
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* DYNAMIC LAWYER/CLIENT SPECIFIC SECTIONS */}
              {!otpSent && (
                <AnimatePresence mode="wait">
                  {role === 'client' && (
                    <motion.div
                      key="client-lang"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden text-left"
                    >
                      <label className="block text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">Preferred Language</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-slate-400"><Globe className="w-4.5 h-4.5" /></span>
                        <input 
                          type="text" 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          placeholder="e.g. Hindi, English"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium" 
                        />
                      </div>
                    </motion.div>
                  )}                  {role === 'lawyer' && (
                    <motion.div
                       key="lawyer-credentials"
                       initial={{ opacity: 0, y: 15 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 15 }}
                       className="space-y-4 border-t border-slate-150 dark:border-slate-800 pt-4 text-left"
                    >
                      <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Bar Registry Details:</span>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-550 dark:text-slate-400 mb-1.5">Bar Council Enrolment ID</label>
                          <input 
                            type="text" 
                            value={barNumber}
                            onChange={(e) => setBarNumber(e.target.value)}
                            placeholder="e.g. D/1042/2012"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium" 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-550 dark:text-slate-400 mb-1.5">State Bar Council</label>
                          <select 
                            value={stateBar}
                            onChange={(e) => setStateBar(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium cursor-pointer"
                          >
                            {STATE_BAR_COUNCILS.map(council => (
                              <option key={council} value={council}>{council}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-550 dark:text-slate-400 mb-1.5">Practice State Location</label>
                          <select 
                            value={practiceState}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium cursor-pointer"
                          >
                            {Object.keys(STATE_DISTRICTS).map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-550 dark:text-slate-400 mb-1.5">Practice District</label>
                          <select 
                            value={practiceDistrict}
                            onChange={(e) => setPracticeDistrict(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 transition-all text-slate-800 dark:text-white font-medium cursor-pointer"
                          >
                            {(STATE_DISTRICTS[practiceState] || []).map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-850 dark:border-slate-200"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : role === 'client' && otpSent ? (
                  "Verify OTP & Register"
                ) : (
                  "Submit Onboarding Registry"
                )}
              </button>

            </form>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-805 pt-4 font-semibold">
            <Link to="/" className="hover:text-indigo-605 dark:hover:text-indigo-400 transition-colors">Back Home</Link>
            <div>
              <span>Already registered? </span>
              <Link to="/login" className="text-indigo-605 dark:text-indigo-400 font-bold hover:underline">Log In</Link>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
