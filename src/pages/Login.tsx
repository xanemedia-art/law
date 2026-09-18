import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Shield, Users, Award, Mail, Lock, RefreshCw, Sun, Moon, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  allUsers: User[];
  onLogin: (user: User) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Login({ allUsers, onLogin, theme, onToggleTheme }: LoginProps) {
  const [role, setRole] = useState<'client' | 'lawyer' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const defaultDemoUsers: User[] = [
    { id: "u-client-demo", role: "client", name: "Demo Client", email: "client@demo.in", mobile: "9876543210" },
    { id: "u-lawyer-demo", role: "lawyer", name: "Adv. Rajesh Kumar", email: "advocate@demo.in", mobile: "9988776655" },
    { id: "u-admin-1", role: "admin", name: "Suresh Gupta", email: "admin@legaltalk.in", mobile: "9900001122" }
  ];

  const effectiveUsers = allUsers && allUsers.length > 0 ? allUsers : defaultDemoUsers;
  const filteredUsers = effectiveUsers.filter(u => u.role === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email address is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Authentication failed. Please check credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        onLogin(data.user);
        if (data.user.role === 'client') navigate('/client');
        else if (data.user.role === 'lawyer') navigate('/lawyer');
        else if (data.user.role === 'admin') navigate('/hidden-admin-portal');
      }
    } catch (err: any) {
      setError('Authentication server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: User) => {
    setError('');
    const defaultPassword = user.role === 'admin' ? 'admin123' : 'password123';
    setEmail(user.email);
    setPassword(defaultPassword);
    setRole(user.role);

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: defaultPassword, role: user.role })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Please enter this account password.');
        setLoading(false);
        return;
      }

      if (data.user) {
        onLogin(data.user);
        if (data.user.role === 'client') navigate('/client');
        else if (data.user.role === 'lawyer') navigate('/lawyer');
        else if (data.user.role === 'admin') navigate('/hidden-admin-portal');
      }
    } catch (err: any) {
      setError('Login failed: ' + err.message);
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
        className="max-w-4xl w-full liquid-glass-elevated rounded-3xl border border-slate-200/80 dark:border-amber-500/20 shadow-2xl overflow-hidden grid md:grid-cols-12 relative my-4"
      >
        {/* LEFT BRAND PROMO COLUMN */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80">
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-2xl border border-amber-400/30 shadow-md">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tight block leading-none text-white">
                  LEGALTALK
                </span>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 block uppercase font-mono mt-1">
                  India Portal
                </span>
              </div>
            </div>

            <div className="my-8 sm:my-10 space-y-4">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight text-white">
                Legal Access in <span className="text-amber-400 font-serif italic">Real Time</span>.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect directly with Bar-verified advocates or consult our XANE AI statutory intelligence engine.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Live Razorpay Wallet Integration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>24/7 AI Statutory Triage & Citations</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>State Bar Council Verified Rosters</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Unified Multi-Role Portal</span>
            <span className="text-emerald-400 font-bold">● Operational</span>
          </div>
        </div>

        {/* RIGHT FORM AND DEMO ACCOUNTS BLOCK */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 relative bg-white/40 dark:bg-slate-900/40">
          
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
              Sign In
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Select your role and enter your registered credentials.
            </p>

            {/* ROLE PICKER TABS */}
            <div className="grid grid-cols-3 gap-1.5 p-1 liquid-glass rounded-2xl mb-6">
              {[
                { id: 'client' as const, label: 'Citizen', icon: Users },
                { id: 'lawyer' as const, label: 'Advocate', icon: Award },
                { id: 'admin' as const, label: 'Admin', icon: Shield }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRole(item.id);
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
                      layoutId="loginActiveRoleTab" 
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
                className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs rounded-2xl p-3.5 mb-5 font-bold flex items-center gap-2"
              >
                <span>{error}</span>
              </motion.div>
            )}

            {/* CREDENTIAL FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Registered Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`Enter ${role} email address`}
                    className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                    required 
                  />
                </div>
              </div>

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
                    placeholder="Enter password"
                    className="w-full liquid-glass-input rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all text-slate-900 dark:text-white font-medium" 
                    required 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-md shadow-amber-500/20 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>Enter {role === 'client' ? 'Citizen' : role === 'lawyer' ? 'Chambers' : 'Admin'} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 1-CLICK DEMO SANDBOX PANEL */}
          <div className="liquid-glass rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                ⚡ 1-Click Sandbox Logins ({role}):
              </span>
              <span className="text-[10px] font-mono text-amber-500 font-semibold">Test Mode</span>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <span className="text-xs text-slate-400 italic font-mono block text-center py-2">
                  No {role} accounts found. Register a new one!
                </span>
              ) : (
                filteredUsers.map((u) => (
                  <motion.button
                    key={u.id}
                    type="button"
                    whileHover={{ x: 2 }}
                    onClick={() => handleQuickLogin(u)}
                    className="w-full liquid-glass hover:border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-left cursor-pointer transition-all group"
                  >
                    <div>
                      <strong className="block text-slate-800 dark:text-white font-bold group-hover:text-amber-500 transition-colors">
                        {u.name}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {u.email}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                      Quick Log
                    </span>
                  </motion.button>
                ))
              )}
            </div>
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
              <span>Don't have an account? </span>
              <Link to="/register" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

