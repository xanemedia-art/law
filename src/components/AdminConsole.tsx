import React, { useState, useEffect } from 'react';
import { Users, Scale, FileText, ToggleLeft, ToggleRight, ShieldAlert, ShieldCheck, DollarSign, RefreshCw, Star, Ban, Check, ArrowLeft, History } from 'lucide-react';
import { User, LawyerProfile } from '../types';

interface AdminConsoleProps {
  onBack: () => void;
  currentUser: User | null;
}

export default function AdminConsole({ onBack, currentUser }: AdminConsoleProps) {
  const [metrics, setMetrics] = useState<any>({
    totalClients: 0,
    totalLawyers: 0,
    totalRevenue: 0,
    commissionRevenue: 0,
    consultationCount: 0
  });
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      setMetrics(data.metrics);
      setLawyers(data.lawyerProfiles || []);
      setAllUsers(data.users || []);
      setWithdrawals(data.withdrawals || []);
      setAuditLogs(data.auditLogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(false);
    }
  };

  const handleBlockUser = async (id: string, isBlocked: boolean) => {
    setActioning(true);
    try {
      const res = await fetch("/api/admin/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBlocked })
      });
      const data = await res.json();
      if (data.success) {
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(false);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    setActioning(true);
    try {
      const res = await fetch("/api/admin/approve-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId: id })
      });
      const data = await res.json();
      if (data.success) {
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-12 h-12 text-indigo-700 animate-spin mx-auto mb-4" />
        <span className="font-mono text-slate-500 text-sm">Loading SaaS Operations Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-slate-100 p-2 rounded-lg transition-colors border border-slate-200 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-black text-2xl text-slate-900 leading-none flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" /> Admin Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">Manage credentials audits, customer billing commissions splits, and settlement logs</p>
          </div>
        </div>

        <button 
          onClick={fetchMetrics}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-white" /> Refresh Dashboard
        </button>
      </div>

      {/* METRICS CORE DASH */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4.5 mb-8">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Net Consultations</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-1 block">{metrics.consultationCount || 0}</span>
          <span className="text-[10px] text-emerald-600 block mt-1">✓ Across Chat, Audio, Video</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Client Base</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-1 block">{metrics.totalClients || 0}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Citizens registered</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Advocates Enrolled</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-1 block">{metrics.totalLawyers || 0}</span>
          <span className="text-[10px] text-indigo-600 block mt-1">&bull; credential verification pending</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gross Client Billings</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-indigo-600 mt-1 block">₹{metrics.totalRevenue || 0}</span>
          <span className="text-[10px] text-slate-400 block mt-1">100% simulated volume</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs bg-indigo-50/50 border-indigo-100">
          <span className="block text-indigo-700 text-[10px] font-bold uppercase tracking-wider">Platform Take (20%)</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-emerald-600 mt-1 block">₹{metrics.commissionRevenue || 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Transparent SaaS Split Commission</span>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LAWYER BOARD AND ONBOARDING CREDENTIALS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-display font-extrabold text-slate-900 text-base mb-6 flex items-center justify-between">
              <span>Enrollment Credentials Verification</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-bold">Requires audit compliance</span>
            </h2>

            <div className="space-y-4">
              {lawyers.map((lawyer) => (
                <div key={lawyer.userId} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <strong className="block text-slate-900">{lawyer.name}</strong>
                    <span className="block text-xs text-indigo-600 font-bold">{lawyer.barCouncilNumber} &bull; {lawyer.stateBarCouncil}</span>
                    <span className="block text-[11px] text-slate-500 mt-1.5 italic font-medium">Exp: {lawyer.experienceYears} Years &bull; Mobile: {lawyer.mobile} &bull; PAN: {lawyer.pan}</span>
                    <p className="text-xs text-slate-500 bg-white p-2 border border-slate-150 rounded-lg mt-2 line-clamp-2">{lawyer.bio}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {lawyer.verificationStatus !== 'approved' ? (
                      <button 
                        onClick={() => handleVerifyLawyer(lawyer.userId, 'approved')}
                        disabled={actioning}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm cursor-pointer"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-55 text-emerald-800 px-2 rounded flex items-center gap-1 border border-emerald-100"><Check className="w-3.5 h-3.5" /> Approved</span>
                    )}

                    {lawyer.verificationStatus !== 'suspended' && (
                      <button 
                        onClick={() => handleVerifyLawyer(lawyer.userId, 'suspended')}
                        disabled={actioning}
                        className="bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg border border-slate-150 cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}

                    {lawyer.verificationStatus !== 'rejected' && lawyer.verificationStatus !== 'approved' && (
                      <button 
                        onClick={() => handleVerifyLawyer(lawyer.userId, 'rejected')}
                        disabled={actioning}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2 px-3 rounded-lg border border-rose-150 cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* USER MANAGEMENT */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-display font-extrabold text-slate-900 text-base mb-6">User Base Ledger & Blocks</h2>
            
            <div className="space-y-3.5">
              {allUsers.map((usr) => (
                <div key={usr.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="block font-display text-slate-900">{usr.name}</strong>
                    <span className="text-[11px] text-slate-450 block mt-0.5">{usr.email} &bull; {usr.mobile} &bull; Type: <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 rounded">{usr.role}</span></span>
                  </div>

                  <button
                    onClick={() => handleBlockUser(usr.id, !usr.isBlocked)}
                    disabled={actioning}
                    className={`py-1.5 px-3 rounded-lg font-bold border transition-all text-xs cursor-pointer ${
                      usr.isBlocked 
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-100'
                    }`}
                  >
                    {usr.isBlocked ? 'Blocked' : 'Block User'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SECURE PENDING WITHDRAWALS & LIVE AUDIT STREAMS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* SECURE PENDING BANK PAYOUTS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h2 className="font-display font-extrabold text-slate-900 text-base mb-4">Pending Bank Withdrawals</h2>
            
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <span className="text-xs text-slate-400 block italic leading-normal">No pending bank withdrawal operations found.</span>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-indigo-650">{w.lawyerName}</span>
                      <span className="text-emerald-700">₹{w.amount}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100">
                      <div>A/CHolder: <strong>{w.bankHolderName}</strong></div>
                      <div>A/CNo: <strong>{w.bankAccountNumber}</strong></div>
                      <div>IFSC Code: <strong>{w.ifscCode}</strong></div>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                      <span className={`text-[10px] uppercase font-bold py-0.5 px-1.5 rounded ${w.status === 'pending' ? 'bg-amber-55 text-amber-800' : 'bg-emerald-55 text-emerald-800'}`}>
                        {w.status}
                      </span>

                      {w.status === 'pending' && (
                        <button 
                          onClick={() => handleApproveWithdrawal(w.id)}
                          disabled={actioning}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1.5 px-2.5 rounded-md cursor-pointer"
                        >
                          Settle Payout
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECURITY AUDIT STREAM LOGS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h2 className="font-display font-extrabold text-slate-900 text-base mb-2 flex items-center gap-1.5"><History className="w-4.5 h-4.5" /> Security Audit Stream</h2>
            <p className="text-[10px] text-slate-550 mb-4 uppercase tracking-wide font-semibold">Continuous event trace logging active</p>

            <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-[10px] border-b border-slate-100 pb-2.5 last:border-0">
                  <span className="block font-mono text-slate-450">{new Date(log.timestamp).toISOString()}</span>
                  <strong className="block text-slate-800 mt-0.5 font-sans tracking-wide">{log.action}</strong>
                  <p className="text-slate-500 font-mono text-[9px] truncate bg-slate-50 p-1.5 rounded mt-0.5">{JSON.stringify(log.details)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
