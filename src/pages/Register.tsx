import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Award, Mail, Phone, User as UserIcon, MapPin, 
  Globe, ShieldAlert, RefreshCw, Sun, Moon, Lock, ArrowRight, 
  CheckCircle2, Sparkles, KeyRound 
} from 'lucide-react';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const [experience, setExperience] = useState('5');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<string[]>(['Divorce', 'Property Law']);
  const [languagesList, setLanguagesList] = useState<string[]>(['English', 'Hindi']);

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

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
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
      setEnteredOtp(mockOtp); // Auto-fill for convenience
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
            language,
            password
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
            invitationCode,
            password
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
            password,
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

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex items-center justify-center p-3 sm:p-6 font-sans relative overflow-x-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 90 }}
        className="max-w-4xl w-full liquid-glass-elevated rounded-3xl border border-slate-200/80 dark:border-amber-500/20 shadow-2xl overflow-hidden grid md:grid-cols-12 relative my-6"
      >
        {/* LEFT COMPLIANCE & REWARD BANNER */}
        <div className="md:col-span-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
          
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-2xl border border-amber-400/30 shadow-md">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-tight block leading-none text-white">
                  LEGALTALK
                </span>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 block uppercase font-mono mt-1">
                  Onboarding Registry
                </span>
              </div>
            </div>

            <div className="my-6 space-y-3">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl leading-tight text-white">
                Verified Legal Protocol.
              </h2>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Advocates undergo Bar Council verification. Citizens receive an automatic welcome package on registration.
              </p>
            </div>

            {/* WELCOME BONUS GRANT CALLOUT */}
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-xs text-amber-200 space-y-1.5 mb-4">
              <span className="font-bold flex items-center gap-1.5 text-amber-300 text-xs font-mono uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Citizen Welcome Grant:
              </span>
              <p className="text-[11px] text-slate-200">
                • <strong>2 Minutes Free</strong> Advocate Video/Voice Calling
              </p>
              <p className="text-[11px] text-slate-200">
                • <strong>10 Free Queries</strong> via AI Case Assistant
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Sandbox system. Test identifiers and simulated OTP enabled.</span>
          </div>
        </div>

        {/* RIGHT FORM CONTAINER */}
        <div className="md:col-span-8 p-6 sm:p-10 flex flex-col justify-between space-y-6 relative bg-white/40 dark:bg-slate-900/40">
          
          {/* Floating theme toggle */}
          <div className="absolute top-6 right-6">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-850 transition-all cursor-pointer text-slate-700 dark:text-slate-300 shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-950 dark:text-white mb-1">
              Create Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Choose your profile type to initialize your workspace.
            </p>

            {/* ROLE PICKER TABS */}
            <div className="grid grid-cols-3 gap-1.5 p-1 liquid-glass rounded-2xl mb-6">
              {[
                { id: 'client' as const, label: 'Citizen', icon: Users },
                { id: 'lawyer' as const, label: 'Advocate', icon: Award },
                { id: 'admin' as const, label: 'Admin', icon: Scale }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRole(item.id);
                    setOtpSent(false);
                    setError('');
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                    role === item.id 
                      ? 'text-slate-950 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {role === item.id && (
                    <motion.div 
                      layoutId="registerRoleActiveTab" 
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-amber-500/20 -z-10 shadow-xs"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-3.5 h-3.5 text-amber-500" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs rounded-2xl p-3.5 mb-5 font-bold"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
              {/* BASIC CONTACT ROW */}
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === 'lawyer' ? "Adv. Priya Sharma" : "Priya Sharma"}
                      className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* MOBILE PHONE & REGION */}
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Mobile Contact Phone
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>

                {role === 'client' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      City / Region
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                      />
                    </div>
                  </div>
                )}

                {role === 'lawyer' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Practice Experience (Years)
                    </label>
                    <input 
                      type="number" 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full liquid-glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                )}

                {role === 'admin' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Admin Invitation Code
                    </label>
                    <input 
                      type="text" 
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      placeholder="e.g. ADM-INV-123456"
                      className="w-full liquid-glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-bold" 
                      required 
                    />
                  </div>
                )}
              </div>

              {/* SIMULATED OTP CARD FOR CLIENTS */}
              {otpSent && role === 'client' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3 liquid-glass-card p-5 rounded-2xl border-amber-500/30"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      Simulated Verification SMS Sent to +91 {mobile}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(otpCode)}
                      className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded hover:bg-amber-500/20 cursor-pointer"
                    >
                      Auto-Fill Code ({otpCode})
                    </button>
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter 6-Digit Code"
                    className="w-full liquid-glass-input rounded-xl px-4 py-3 text-center text-sm font-mono font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500"
                    required
                  />
                </motion.div>
              )}

              {/* PASSWORDS */}
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* ADVOCATE BAR COUNCIL CREDENTIALS */}
              {role === 'lawyer' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-left"
                >
                  <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    State Bar Council Credentials:
                  </span>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                        Enrolment ID
                      </label>
                      <input 
                        type="text" 
                        value={barNumber}
                        onChange={(e) => setBarNumber(e.target.value)}
                        placeholder="e.g. D/1042/2012"
                        className="w-full liquid-glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                        State Bar Council
                      </label>
                      <select 
                        value={stateBar}
                        onChange={(e) => setStateBar(e.target.value)}
                        className="w-full liquid-glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                      >
                        {STATE_BAR_COUNCILS.map(council => (
                          <option key={council} value={council} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {council}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                        Practice State Location
                      </label>
                      <select 
                        value={practiceState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full liquid-glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                      >
                        {Object.keys(STATE_DISTRICTS).map(st => (
                          <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                        Practice District
                      </label>
                      <select 
                        value={practiceDistrict}
                        onChange={(e) => setPracticeDistrict(e.target.value)}
                        className="w-full liquid-glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                      >
                        {(STATE_DISTRICTS[practiceState] || []).map(dist => (
                          <option key={dist} value={dist} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CLIENT LANGUAGE SELECTION */}
              {role === 'client' && !otpSent && (
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Consultation Language Preference
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Globe className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g. Hindi, English"
                      className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                    />
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider py-4 rounded-2xl transition-all shadow-md shadow-amber-500/20 mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : role === 'client' && otpSent ? (
                  <>
                    <span>Authorize OTP & Claim Free Minutes</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Submit {role === 'client' ? 'Citizen' : role === 'lawyer' ? 'Advocate' : 'Admin'} Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FOOTER NAVIGATION */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80 pt-4 font-semibold">
            <Link to="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
              ← Return Home
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] font-sans text-slate-500 dark:text-slate-400">
              <span>Built By</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full tracking-wide">
                Xane Media
              </span>
            </div>
            <div>
              <span>Already registered? </span>
              <Link to="/login" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

