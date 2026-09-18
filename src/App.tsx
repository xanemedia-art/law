import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ClientExperience from './pages/ClientExperience';
import AdvocateExperience from './pages/AdvocateExperience';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ActiveSession from './pages/ActiveSession';
import DeveloperHub from './pages/DeveloperHub';
import AIAssistant, { openAIChat } from './components/AIAssistant';
import InvestorPitch from './pages/InvestorPitch';
import { User } from './types';
import { RefreshCw } from 'lucide-react';
import { fetchServerConfig } from './lib/supabase';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 }
};

const pageTransition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1] // Elegant easeOutExpo
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-indigo-500/20"
    >
      {/* Ambient Fluid Background Mesh Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 sm:w-[32rem] h-96 sm:h-[32rem] rounded-full bg-gradient-to-br from-indigo-500/15 via-sky-400/10 to-transparent blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -left-40 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-gradient-to-tr from-amber-500/12 via-indigo-400/10 to-transparent blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-40 right-1/4 w-80 sm:w-[30rem] h-80 sm:h-[30rem] rounded-full bg-gradient-to-t from-emerald-500/10 via-cyan-400/8 to-transparent blur-3xl animate-float-slow" />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

interface AppRoutesProps {
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onRegisterSuccess: () => void;
  onInitiateSession: (lawyerId: string, type: 'chat' | 'voice' | 'video') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function AIAssistantRedirect() {
  useEffect(() => {
    openAIChat();
  }, []);
  return <Navigate to="/" replace />;
}

function AppRoutes({
  currentUser,
  allUsers,
  onSelectUser,
  onLogin,
  onLogout,
  onRegisterSuccess,
  onInitiateSession,
  theme,
  onToggleTheme
}: AppRoutesProps) {
  const location = useLocation();
  const RoutesComponent = Routes as any;

  return (
    <>
      <AnimatePresence mode="wait">
        <RoutesComponent location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <PageWrapper>
                <ClientExperience 
                  currentUser={currentUser} 
                  theme={theme}
                  onToggleTheme={onToggleTheme}
                />
              </PageWrapper>
            } 
          />
          <Route 
            path="/advocates" 
            element={
              <PageWrapper>
                <AdvocateExperience 
                  currentUser={currentUser} 
                  theme={theme}
                  onToggleTheme={onToggleTheme}
                />
              </PageWrapper>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PageWrapper>
                <Login 
                  allUsers={allUsers} 
                  onLogin={onLogin} 
                  theme={theme}
                  onToggleTheme={onToggleTheme}
                />
              </PageWrapper>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PageWrapper>
                <Register 
                  onRegisterSuccess={onRegisterSuccess} 
                  theme={theme}
                  onToggleTheme={onToggleTheme}
                />
              </PageWrapper>
            } 
          />
          <Route 
            path="/client" 
            element={
              currentUser ? (
                <PageWrapper>
                  <ClientDashboard 
                    currentUser={currentUser} 
                    onInitiateSession={onInitiateSession} 
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/lawyer" 
            element={
              currentUser ? (
                <PageWrapper>
                  <LawyerDashboard 
                    currentUser={currentUser} 
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/hidden-admin-portal" 
            element={
              currentUser ? (
                <PageWrapper>
                  <AdminDashboard 
                    currentUser={currentUser} 
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dev-hub" 
            element={
              <PageWrapper>
                <DeveloperHub />
              </PageWrapper>
            } 
          />
          <Route 
            path="/session/:id" 
            element={
              currentUser ? (
                <PageWrapper>
                  <ActiveSession 
                    currentUser={currentUser} 
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/ai-assistant" 
            element={<AIAssistantRedirect />} 
          />
          <Route 
            path="/pitch" 
            element={
              <PageWrapper>
                <InvestorPitch 
                  theme={theme}
                  onToggleTheme={onToggleTheme}
                />
              </PageWrapper>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </RoutesComponent>
      </AnimatePresence>

      {/* Global Sticky In-Page AI Assistant Chat Box */}
      <AIAssistant onEscalate={() => { window.location.href = '/client'; }} />
    </>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const fetchInitialContext = async () => {
    try {
      await fetchServerConfig();
      const res = await fetch("/api/auth/current");
      const data = await res.json();
      const usersList = data.users || [];
      setAllUsers(usersList);
      
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const matched = usersList.find((u: User) => u.id === parsed.id);
        if (matched) {
          setCurrentUser(matched);
        } else {
          setCurrentUser(parsed);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("Context fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialContext();
  }, []);

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const handleRegisterSuccess = () => {
    fetchInitialContext();
  };

  const handleInitiateSession = async (lawyerId: string, type: 'chat' | 'voice' | 'video') => {
    if (!currentUser) return;
    
    try {
      const res = await fetch("/api/consultations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: currentUser.id,
          lawyerId,
          type
        })
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else if (data.session) {
        window.location.href = `/session/${data.session.id}`;
      }
    } catch (err: any) {
      alert("Failed to initiate communication channel: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center text-center p-8">
        <RefreshCw className="w-14 h-14 text-indigo-500 animate-spin mb-4" />
        <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">LEGALTALK INDIA</h2>
        <p className="text-xs text-slate-400 mt-2 font-mono">Initializing Indian Legal Marketplace Sandbox environment...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes 
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRegisterSuccess={handleRegisterSuccess}
        onInitiateSession={handleInitiateSession}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </BrowserRouter>
  );
}
