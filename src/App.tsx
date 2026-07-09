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
import AIAssistant from './components/AIAssistant';
import InvestorPitch from './pages/InvestorPitch';
import { User } from './types';
import { RefreshCw } from 'lucide-react';

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
      className="min-h-screen bg-slate-50"
    >
      {children}
    </motion.div>
  );
}

interface AppRoutesProps {
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onLogin: (user: User) => void;
  onRegisterSuccess: () => void;
  onInitiateSession: (lawyerId: string, type: 'chat' | 'voice' | 'video') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function AppRoutes({
  currentUser,
  allUsers,
  onSelectUser,
  onLogin,
  onRegisterSuccess,
  onInitiateSession,
  theme,
  onToggleTheme
}: AppRoutesProps) {
  const location = useLocation();
  const RoutesComponent = Routes as any;

  return (
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
            <PageWrapper>
              <ClientDashboard 
                currentUser={currentUser} 
                onInitiateSession={onInitiateSession} 
                theme={theme}
                onToggleTheme={onToggleTheme}
              />
            </PageWrapper>
          } 
        />
        <Route 
          path="/lawyer" 
          element={
            <PageWrapper>
              <LawyerDashboard 
                currentUser={currentUser} 
                theme={theme}
                onToggleTheme={onToggleTheme}
              />
            </PageWrapper>
          } 
        />
        <Route 
          path="/hidden-admin-portal" 
          element={
            <PageWrapper>
              <AdminDashboard 
                currentUser={currentUser} 
                theme={theme}
                onToggleTheme={onToggleTheme}
              />
            </PageWrapper>
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
            <PageWrapper>
              <ActiveSession 
                currentUser={currentUser} 
                theme={theme}
                onToggleTheme={onToggleTheme}
              />
            </PageWrapper>
          } 
        />
        <Route 
          path="/ai-assistant" 
          element={
            <PageWrapper>
              <AIAssistant 
                onBack={() => window.history.back()} 
                onEscalate={() => window.location.href = '/client'} 
              />
            </PageWrapper>
          } 
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
      } else if (usersList.length > 0) {
        setCurrentUser(usersList[0]);
        localStorage.setItem("currentUser", JSON.stringify(usersList[0]));
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
        onRegisterSuccess={handleRegisterSuccess}
        onInitiateSession={handleInitiateSession}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </BrowserRouter>
  );
}
