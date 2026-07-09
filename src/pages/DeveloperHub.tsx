import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Check, ArrowLeft, Copy, Download, RefreshCw } from 'lucide-react';

export default function DeveloperHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'migration' | 'supabase' | 'razorpay' | 'vercel' | 'checklist'>('migration');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'migration' as const, label: 'PostgreSQL Migration', desc: 'Active Database Schema SQL' },
    { id: 'supabase' as const, label: 'Supabase Guide', desc: 'Database & Auth Setup' },
    { id: 'razorpay' as const, label: 'Razorpay Guide', desc: 'Payment Gateway Integration' },
    { id: 'vercel' as const, label: 'Vercel Deployment Guide', desc: 'Direct Cloud Deployment' },
    { id: 'checklist' as const, label: 'Production Checklist', desc: 'Security & UI Launch Checklist' }
  ];

  const fetchGuide = async (tab: typeof activeTab) => {
    setLoading(true);
    setCopied(false);
    try {
      if (tab === 'migration') {
        const res = await fetch("/supabase/migrations/20260605000000_init_legaltalk_india.sql");
        const text = await res.text();
        setContent(text);
      } else {
        const res = await fetch(`/api/docs/${tab}`);
        const text = await res.text();
        setContent(text);
      }
    } catch (e: any) {
      setContent(`Failed to fetch instructions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuide(activeTab);
  }, [activeTab]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isSql = activeTab === 'migration';
    const blob = new Blob([content], { type: isSql ? 'text/sql' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isSql ? '20260605000000_init_legaltalk_india.sql' : `${activeTab.toUpperCase()}_SETUP_GUIDE.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-205">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="hover:bg-slate-100 p-2 rounded-lg transition-colors border border-slate-200 text-slate-655"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-black text-2xl text-slate-905 leading-none flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-650" /> SaaS Developer Deployment Suite
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">View, download, and copy production databases, variables, and compliance manuals</p>
          </div>
        </div>
        <Link 
          to="/"
          className="bg-slate-905 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-all shadow"
        >
          Back to Portal Home
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* ACTION TABS PANEL */}
        <div className="lg:col-span-1 space-y-2">
          <span className="block text-slate-450 font-bold text-[10px] uppercase tracking-wider mb-3">Resource Index</span>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full p-4.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-center ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                  : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm font-bold leading-tight font-display">{tab.label}</span>
              <span className={`block text-[11px] mt-1 ${activeTab === tab.id ? 'text-indigo-150' : 'text-slate-400'}`}>{tab.desc}</span>
            </button>
          ))}

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4.5 mt-8 space-y-1.5 text-xs text-slate-600 leading-normal">
            <span className="font-bold text-slate-800 block mb-1">Git Repository Exports</span>
            <div>All guides and schemas reside permanently inside your target directory:</div>
            <ul className="list-disc pl-4 space-y-1 mt-2 text-[11px] font-mono select-all bg-white p-2 border rounded-lg">
              <li>/supabase/migrations/...sql</li>
              <li>/docs/SUPABASE_SETUP_GUIDE.md</li>
              <li>/docs/RAZORPAY_SETUP_GUIDE.md</li>
              <li>/docs/VERCEL_DEPLOYMENT_GUIDE.md</li>
              <li>/docs/PRODUCTION_CHECKLIST.md</li>
            </ul>
          </div>
        </div>

        {/* CODE VIEW COMPONENT */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between">
          
          {/* Action Row */}
          <div className="bg-slate-50 border-b border-slate-150 py-3 px-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-xs font-bold text-slate-600">
                {activeTab === 'migration' ? '20260605000000_init_legaltalk_india.sql' : `${activeTab.toUpperCase()}_COMPLIANCE.md`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="bg-slate-905 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Content reader */}
          <div className="flex-1 p-6 overflow-auto max-h-[60vh] min-h-[45vh] bg-slate-950 font-mono text-xs text-slate-200 select-text leading-relaxed">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-450 italic">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mr-2" /> Synching file structure...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{content}</pre>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
