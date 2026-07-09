import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Shield, Users, Award, Mail, Lock, RefreshCw, Sun, Moon } from 'lucide-react';
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

  const filteredUsers = allUsers.filter(u => u.role === role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
      if (found) {
        if (found.isBlocked) {
          setError('This account has been blocked by system administrators.');
          setLoading(false);
          return;
        }
        onLogin(found);
        setLoading(false);
        if (found.role === 'client') navigate('/client');
        else if (found.role === 'lawyer') navigate('/lawyer');
        else if (found.role === 'admin') navigate('/hidden-admin-portal');
      } else {
        setError(`No registered ${role} account found with that email in this sandbox.`);
        setLoading(false);
      }
    }, 500);
  };

  const handleQuickLogin = (user: User) => {
    if (user.isBlocked) {
      setError('This account has been blocked by system administrators.');
      return;
    }
    onLogin(user);
    if (user.role === 'client') navigate('/client');
    else if (user.role === 'lawyer') navigate('/lawyer');
    else if (user.role === 'admin') navigate('/hidden-admin-portal');
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden grid md:grid-cols-12 relative"
      >
        {/* LEFT PROMO BLOCK */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-955 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-amber-500/5 rounded-full translate-x-10 translate-y-10"></div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/10 text-amber-400 p-2.5 rounded-xl border border-white/10 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight block leading-none">LEGALTALK</span>
              <span className="text-[9px] font-bold tracking-widest text-amber-500 block uppercase font-mono mt-1">India Sandbox</span>
            </div>
          </div>

          <div className="my-8 space-y-4">
            <h2 className="font-display font-extrabold text-3xl leading-tight">
              Access the legal portal instantly.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Verify legal credentials, simulate Razorpay recharges, test minute-billing splits, or get automated insights.
            </p>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            Secure multi-role routed simulator.
          </div>
        </div>

        {/* RIGHT FORM AND QUICK SWITCHERS BLOCK */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6 relative">
          
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
            <h1 className="font-display font-black text-3xl text-slate-950 dark:text-white mb-1.5">Welcome Back</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">Choose your workspace portal path and sign in.</p>

            {/* ROLE PICKER */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-6 border border-slate-200/50 dark:border-slate-800">
              {[
                { id: 'client' as const, label: 'Client', icon: Users },
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
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                    role === item.id 
                      ? 'text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-800' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {role === item.id && (
                    <motion.div 
                      layoutId="activeRoleTab" 
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-205/20 dark:border-slate-800 -z-10 shadow-xs"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/50 text-rose-800 dark:text-rose-400 text-xs rounded-2xl p-3.5 mb-5 font-bold"
              >
                {error}
              </motion.div>
            )}

            {/* CREDENTIAL FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-405"><Mail className="w-4.5 h-4.5" /></span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`Enter ${role} email address`}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-slate-800 dark:text-white font-medium" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Security Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-405"><Lock className="w-4.5 h-4.5" /></span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (any value for testing)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-slate-800 dark:text-white font-medium" 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-850 dark:border-slate-200"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Access Portal"}
              </button>
            </form>
          </div>

          {/* SIMULATED ACCOUNTS ROSTER PANEL */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 font-mono">Sandbox Accounts (Click to log):</span>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic font-mono block text-center py-2">No custom {role} accounts found. Register one!</span>
              ) : (
                filteredUsers.map((u) => (
                  <motion.button
                    key={u.id}
                    type="button"
                    whileHover={{ x: 3 }}
                    onClick={() => handleQuickLogin(u)}
                    className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-left cursor-pointer transition-colors shadow-xs group"
                  >
                    <div>
                      <strong className="block text-slate-805 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-bold">{u.name}</strong>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono mt-0.5">{u.email}</span>
                    </div>
                    <span className="text-[9px] font-mono text-indigo-705 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/50 px-2 py-0.5 rounded font-black uppercase">Quick Log</span>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 font-semibold">
            <Link to="/" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Back Home</Link>
            <div>
              <span>Need an account? </span>
              <Link to="/register" className="text-indigo-605 dark:text-indigo-400 font-bold hover:underline">Register</Link>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
