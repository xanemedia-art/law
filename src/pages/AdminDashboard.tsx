import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Scale, ShieldCheck, RefreshCw, Check, ArrowLeft, Sun, Moon, FileText, Phone, Mail, Award, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { User } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function AdminDashboard({ currentUser, theme, onToggleTheme }: AdminDashboardProps) {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>({
    totalLawyers: 0,
    commissionRevenue: 0
  });
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState<any | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      setMetrics({
        totalLawyers: data.metrics.totalLawyers || 0,
        commissionRevenue: data.metrics.commissionRevenue || 0
      });
      setLawyers(data.lawyerProfiles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      alert("Unauthorized access: Admin console is restricted.");
      navigate('/');
      return;
    }
    fetchMetrics();
  }, [currentUser]);

  const handleVerifyLawyer = async (id: string, action: 'approved' | 'rejected' | 'suspended') => {
    setActioning(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (data.success) {
        // Update local list
        setLawyers(prev => prev.map(l => l.userId === id ? { ...l, verificationStatus: action } : l));
        // Update selected modal if open
        if (selectedLawyer && selectedLawyer.userId === id) {
          setSelectedLawyer(prev => prev ? { ...prev, verificationStatus: action } : null);
        }
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/50">
            <Check className="w-3 h-3" /> Approved
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-55 dark:bg-amber-955/20 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-900/55">
            <AlertTriangle className="w-3 h-3" /> Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455 border border-rose-150 dark:border-rose-900/40">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/40">
            <RefreshCw className="w-3 h-3 animate-spin" /> Pending Audit
          </span>
        );
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => 
    lawyer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lawyer.barCouncilNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lawyer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && lawyers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading advocate audits roster...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-6 sm:p-10 font-sans selection:bg-amber-500/20">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:bg-slate-100 dark:hover:bg-slate-900 p-2 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Chambers Command Center
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-455 mt-1 font-medium">Verify credentials, review graduation certifications, and approve advocate search visibility</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={fetchMetrics}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-xl">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="block text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider font-mono">Enrolled Advocates</span>
          <span className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white mt-0.5 block">{metrics.totalLawyers}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="block text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider font-mono">Subscription Registry SaaS</span>
          <span className="text-xl sm:text-2xl font-display font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">₹{metrics.commissionRevenue}</span>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search by advocate name, enrolment ID, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-650/10 focus:border-indigo-600 transition-all font-medium"
        />
      </div>

      {/* ADVOCATES LISTING GRID */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredLawyers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span className="text-xs">No registered advocates matching the query.</span>
          </div>
        ) : (
          filteredLawyers.map((lawyer) => (
            <div 
              key={lawyer.userId}
              onClick={() => setSelectedLawyer(lawyer)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-500/35 transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <strong className="block text-slate-900 dark:text-white font-black text-sm">{lawyer.name}</strong>
                  {getStatusBadge(lawyer.verificationStatus)}
                </div>
                
                <span className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{lawyer.barCouncilNumber}</span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{lawyer.stateBarCouncil}</span>
                <span className="block text-[9px] text-slate-400 mt-2">Exp: {lawyer.experienceYears} Years &bull; Mobile: {lawyer.mobile}</span>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between">
                <span>View legal dossier</span>
                <span className="text-indigo-600 font-bold hover:underline">&rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CLICKABLE ADVOCATE PROFILE DETAILS MODAL */}
      <AnimatePresence>
        {selectedLawyer && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh] relative space-y-6"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedLawyer(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex justify-between items-start gap-4 pr-8">
                <div>
                  <h3 className="font-display font-black text-lg text-slate-900 dark:text-white leading-none">{selectedLawyer.name}</h3>
                  <span className="text-xs text-slate-400 block mt-1">Advocate Dossier & Verification Board</span>
                </div>
                {getStatusBadge(selectedLawyer.verificationStatus)}
              </div>

              {/* Grid Info */}
              <div className="grid sm:grid-cols-2 gap-6 text-xs border-t border-slate-100 dark:border-slate-800 pt-6">
                
                {/* Section 1: Contact */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-indigo-650 dark:text-indigo-400">Contact Channels</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedLawyer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedLawyer.mobile}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Bar Details */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-indigo-650 dark:text-indigo-400">State Bar Enrolment</h4>
                  <div className="space-y-1">
                    <div>Enrolment ID: <strong className="font-mono text-slate-800 dark:text-white">{selectedLawyer.barCouncilNumber}</strong></div>
                    <div className="text-[11px] text-slate-500">{selectedLawyer.stateBarCouncil}</div>
                  </div>
                </div>

                {/* Section 3: Professional Details */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-indigo-650 dark:text-indigo-400">Practice Location & KYC</h4>
                  <div className="space-y-1 font-medium text-slate-650 dark:text-slate-350">
                    <div>Specialties: <span className="font-bold text-slate-800 dark:text-white">{selectedLawyer.categories?.join(', ') || 'General Legal'}</span></div>
                    <div>Location: <span>{selectedLawyer.practiceState || 'Pending'}, {selectedLawyer.practiceDistrict || 'Pending'}</span></div>
                    <div>Aadhaar: <span className="font-mono">{selectedLawyer.aadhaar}</span></div>
                    <div>PAN: <span className="font-mono uppercase">{selectedLawyer.pan}</span></div>
                  </div>
                </div>

                {/* Section 4: Academic Details */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-indigo-650 dark:text-indigo-400">Academic Credentials</h4>
                  <div className="space-y-1 font-medium text-slate-650 dark:text-slate-350">
                    <div>University: <span className="font-bold text-slate-805 dark:text-white">{selectedLawyer.llbUniversity || 'Pending Submission'}</span></div>
                    <div>Graduation: <span>{selectedLawyer.llbGraduationYear || 'Pending'}</span></div>
                    <div>Bar Association: <span>{selectedLawyer.barAssociationName || 'Pending'}</span></div>
                    <div>Place of Practice: <span>{selectedLawyer.placeOfPractice || 'Pending'}</span></div>
                  </div>
                </div>

              </div>

              {/* Bio Statement */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                <strong className="block text-[10px] uppercase font-mono text-slate-400 mb-1 font-bold">Specialist Statement</strong>
                {selectedLawyer.bio}
              </div>

              {/* Verification Certificate Links */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-indigo-650 dark:text-indigo-400">Uploaded Verification Certificates</h4>
                
                <div className="grid sm:grid-cols-3 gap-3">
                  <a 
                    href={selectedLawyer.enrollmentCertificateUrl || "https://example.com/certs/enrollment-cert.pdf"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 hover:border-indigo-500/30 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">Bar Enrolment Cert</span>
                  </a>
                  <a 
                    href={selectedLawyer.copUrl || "https://example.com/certs/cop.pdf"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 hover:border-indigo-500/30 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">COP Certificate</span>
                  </a>
                  <a 
                    href={selectedLawyer.llbCertificateUrl || "https://example.com/certs/llb-degree.pdf"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 hover:border-indigo-500/30 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">LLB Degree PDF</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                {selectedLawyer.verificationStatus !== 'approved' && (
                  <button 
                    onClick={() => handleVerifyLawyer(selectedLawyer.userId, 'approved')}
                    disabled={actioning}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm cursor-pointer border border-emerald-550 transition-all shrink-0"
                  >
                    Approve Verification
                  </button>
                )}

                {selectedLawyer.verificationStatus !== 'suspended' && (
                  <button 
                    onClick={() => handleVerifyLawyer(selectedLawyer.userId, 'suspended')}
                    disabled={actioning}
                    className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer transition-all shrink-0"
                  >
                    Suspend Chambers
                  </button>
                )}

                {selectedLawyer.verificationStatus !== 'rejected' && selectedLawyer.verificationStatus !== 'approved' && (
                  <button 
                    onClick={() => handleVerifyLawyer(selectedLawyer.userId, 'rejected')}
                    disabled={actioning}
                    className="bg-rose-50 dark:bg-rose-955/35 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-400 text-xs font-bold py-2 px-4 rounded-xl border border-rose-150 dark:border-rose-900/40 cursor-pointer transition-all shrink-0"
                  >
                    Reject Application
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
