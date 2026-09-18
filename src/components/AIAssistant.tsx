import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  User, 
  ArrowRight, 
  Search, 
  Copy, 
  Check, 
  RotateCcw,
  Bot,
  Gavel,
  ShieldCheck,
  X,
  Minus,
  Maximize2,
  ChevronDown
} from 'lucide-react';

export interface AIAssistantProps {
  onEscalate?: () => void;
  defaultOpen?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  needsEscalation?: boolean;
  copied?: boolean;
}

/**
 * Programmatic helper to open the sticky AI Assistant chat box anywhere in the app.
 */
export function openAIChat(prompt?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { prompt } }));
  }
}

export default function AIAssistant({ onEscalate, defaultOpen = false }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "### Welcome to LegalTalk India AI Desk\n\nI am your interactive legal guidance assistant, indexed on the **Bharatiya Nyaya Sanhita (BNS)**, **Indian Penal Code (IPC)**, **Code of Civil Procedure (CPC)**, **Hindu Marriage Act**, **Labour Regulations**, and **Consumer Rights Laws**.\n\n* **Statutory Rights Overview**\n* **Case Law Insights & Landmark Precedents**\n* **Notice Drafting Frameworks**\n* **Court Procedural Checklists**\n\n> **Important Disclaimer:** *This service provides informational guidance grounded in Indian statutory provisions and does not constitute formal legal counsel. For actionable courtroom filings or customized representation, consult a verified advocate on our platform.*"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const samplePrompts = [
    { label: "Notice Pay & Labour Laws", text: "What are my rights if my employer terminates me with zero notice and withholds Form 16 in Karnataka?" },
    { label: "Mutual Consent Divorce (HMA 13B)", text: "Explain the procedure, cooling-off period, and requirements for mutual consent divorce under Hindu Marriage Act Section 13B." },
    { label: "BNS Hit & Run (Sec 106)", text: "What are the penalties, bail conditions, and reporting requirements under Section 106 of Bharatiya Nyaya Sanhita (BNS)?" },
    { label: "Land Title Due Diligence", text: "What documents must be verified before buying immovable property under the Transfer of Property Act?" },
    { label: "Security Deposit Refund", text: "My landlord refuses to return my security deposit in Pune. What legal notice can I issue under Maharashtra Rent Control bylaws?" }
  ];

  // Listen for global open-ai-chat custom events
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
      if (customEvent.detail?.prompt) {
        handleSubmit(undefined, customEvent.detail.prompt);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    window.addEventListener('open-ai-chat', handleOpen);
    return () => window.removeEventListener('open-ai-chat', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen, isMinimized]);

  const handleSubmit = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || prompt;
    if (!query.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const rawText = data.text || '';
      const escTag = '[ACTION_REQUIRED: ESCALATE_TO_LAWYER]';
      const needsEscalation = rawText.includes(escTag);
      const cleanedText = rawText.replace(escTag, '').trim();

      setMessages(prev => [...prev, { role: 'assistant', text: cleanedText, needsEscalation }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `### Connection Notice\n\nApologies, we could not connect to the AI model. Details: ${err.message}\n\nPlease try asking again or talk directly to our verified advocates.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm("Start a new legal research session?")) {
      setMessages([
        {
          role: 'assistant',
          text: "### Welcome to LegalTalk India AI Desk\n\nWhat legal topic or scenario would you like to explore today? Type your question below or select from the quick prompts."
        }
      ]);
    }
  };

  const handleEscalateToAdvocate = () => {
    if (onEscalate) {
      onEscalate();
    } else {
      window.location.href = '/client';
    }
  };

  return (
    <>
      {/* 1. STICKY COLLAPSED TRIGGER BUTTON */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { 
            setIsOpen(true); 
            setIsMinimized(false); 
            setTimeout(() => inputRef.current?.focus(), 150);
          }}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 liquid-glass-elevated rounded-full p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 shadow-2xl shadow-indigo-600/30 border border-white/80 dark:border-indigo-500/40 hover:border-indigo-400 dark:hover:border-indigo-400 transition-all cursor-pointer group"
          aria-label="Open AI Legal Assistant"
          id="sticky-ai-chat-trigger"
        >
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
              <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>
          
          <div className="text-left hidden xs:block pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                Ask AI Assistant
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold block leading-tight">
              XANE AI • Free Triage
            </span>
          </div>
        </motion.button>
      )}

      {/* 2. STICKY EXPANDED / MINIMIZED IN-PAGE CHAT BOX */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : undefined
            }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed z-50 flex flex-col liquid-glass-elevated shadow-2xl shadow-slate-950/50 border border-white/80 dark:border-indigo-500/30 overflow-hidden
              ${isMinimized 
                ? 'bottom-5 right-5 sm:bottom-6 sm:right-6 w-[320px] sm:w-[380px] rounded-2xl' 
                : 'inset-x-2 bottom-2 top-14 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:max-w-[calc(100vw-3rem)] rounded-3xl h-[620px] max-h-[86vh]'
              }`}
            id="sticky-ai-chat-box"
          >
            {/* A. LIQUID GLASS CHAT HEADER */}
            <header className="p-3.5 sm:p-4 border-b border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-2 shrink-0 select-none">
              <div 
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                onClick={() => { if (isMinimized) setIsMinimized(false); }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      LegalTalk AI Desk
                    </h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium truncate">
                    XANE AI • Indian Statutory Triage
                  </p>
                </div>
              </div>

              {/* Header Window Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!isMinimized && (
                  <button
                    onClick={handleResetChat}
                    title="New Research Session"
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                    aria-label="Reset chat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setIsMinimized(prev => !prev)}
                  title={isMinimized ? "Expand" : "Minimize"}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* B. EXPANDED CONTENT VIEWPORT */}
            {!isMinimized && (
              <>
                {/* Statutory Advisory Notice */}
                <div className="px-3.5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">Informational guidance under Indian law. Not formal representation.</span>
                  </div>
                  <button 
                    onClick={handleEscalateToAdvocate}
                    className="font-bold underline hover:text-amber-950 dark:hover:text-amber-100 shrink-0 cursor-pointer"
                  >
                    Consult Lawyer
                  </button>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs sm:text-sm">
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        key={i} 
                        className="space-y-2.5"
                      >
                        <div className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {m.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                          )}
                          
                          <div className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs leading-relaxed transition-all shadow-xs ${
                            m.role === 'user' 
                              ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-indigo-600/15 font-medium' 
                              : 'liquid-glass text-slate-800 dark:text-slate-200 rounded-tl-xs ai-prose border border-white/60 dark:border-white/10'
                          }`}>
                            {m.role === 'user' ? (
                              <p className="whitespace-pre-wrap">{m.text}</p>
                            ) : (
                              <div>
                                {m.text.split('\n\n').map((para, pIdx) => {
                                  if (para.startsWith('*') || para.startsWith('-')) {
                                    return (
                                      <ul key={pIdx} className="space-y-1 my-2 pl-2">
                                        {para.split('\n').map((item, itemIdx) => (
                                          <li key={itemIdx} className="text-xs text-slate-700 dark:text-slate-300">
                                            {item.replace(/^[\s*-]+/, '').trim()}
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                  if (para.startsWith('###')) {
                                    return <h3 key={pIdx} className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm my-1">{para.replace('###', '').trim()}</h3>;
                                  }
                                  if (para.startsWith('####')) {
                                    return <h4 key={pIdx} className="font-bold text-slate-900 dark:text-white text-xs my-1">{para.replace('####', '').trim()}</h4>;
                                  }
                                  if (para.startsWith('>')) {
                                    return <blockquote key={pIdx} className="border-l-2 border-indigo-500 pl-2.5 py-1 my-2 italic text-[11px] text-slate-600 dark:text-slate-400 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-r-lg">{para.replace(/^>\s*/, '').trim()}</blockquote>;
                                  }
                                  if (para.startsWith('---')) {
                                    return <hr key={pIdx} className="border-slate-200 dark:border-slate-800 my-2" />;
                                  }
                                  if (para.startsWith('**') && para.endsWith('**')) {
                                    return <p key={pIdx} className="font-bold text-slate-900 dark:text-white my-1 text-xs">{para.replace(/\*\*/g, '').trim()}</p>;
                                  }
                                  return <p key={pIdx} className="my-1.5 text-xs text-slate-700 dark:text-slate-300">{para}</p>;
                                })}
                              </div>
                            )}

                            {/* Assistant Message Actions Toolbar */}
                            {m.role === 'assistant' && (
                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-500">
                                <span className="font-mono text-slate-400">Statutory Intel</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(m.text, i)}
                                  className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  {copiedIndex === i ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          {m.role === 'user' && (
                            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        
                        {/* Secondary Research Action */}
                        {m.role === 'assistant' && i > 0 && !m.text.includes('Connection Notice') && (
                          <div className="pl-9 max-w-[85%]">
                            <button 
                              type="button"
                              onClick={() => {
                                const userQuery = messages[i - 1]?.text || '';
                                const searchPrompt = `Search for similar High Court & Supreme Court judgements and case citations in India for: ${userQuery}`;
                                handleSubmit(undefined, searchPrompt);
                              }}
                              disabled={loading}
                              className="inline-flex items-center gap-1.5 liquid-glass-pill hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold py-1 px-2.5 rounded-lg transition-all touch-active cursor-pointer"
                            >
                              <Search className="w-3 h-3 text-indigo-500" />
                              Research Precedents & Citations
                            </button>
                          </div>
                        )}

                        {/* ADVOCATE INTERVENTION ESCALATION CARD */}
                        {m.role === 'assistant' && m.needsEscalation && (
                          <div className="pl-9 max-w-[95%]">
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-2xl p-4 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 border border-indigo-500/40 text-white shadow-lg space-y-2.5"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Gavel className="w-3 h-3" /> Advocate Recommended
                                </span>
                              </div>
                              <h4 className="font-display font-bold text-xs sm:text-sm text-white">
                                Case-Specific Legal Action
                              </h4>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                This matter involves statutory litigation. Connect with a State Bar verified advocate for confidential consultation.
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-slate-400 font-mono">From ₹10/min</span>
                                <button 
                                  onClick={handleEscalateToAdvocate}
                                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 touch-active cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Consult Advocate</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <div className="flex items-center gap-2 pl-9 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono italic">
                        Consulting XANE AI...
                      </span>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick Prompts Carousel */}
                <div className="px-3 py-2 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/40 dark:bg-slate-900/30 overflow-hidden shrink-0">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
                    {samplePrompts.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!loading) handleSubmit(undefined, s.text);
                        }}
                        className="liquid-glass-pill hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium py-1 px-2.5 rounded-lg transition-all touch-active shrink-0 cursor-pointer snap-start text-left whitespace-nowrap"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frosted Chat Input Bar */}
                <form 
                  onSubmit={handleSubmit} 
                  className="p-2.5 border-t border-slate-200/70 dark:border-white/10 bg-white/50 dark:bg-slate-900/70 backdrop-blur-md flex items-center gap-2 shrink-0"
                >
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask legal question (BNS, notice pay, bail)..."
                    className="flex-1 bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    disabled={loading}
                  />
                  <button 
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className={`bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl p-2 sm:px-3.5 sm:py-2 transition-all flex items-center justify-center gap-1 touch-active shrink-0 shadow-sm ${
                      loading || !prompt.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer shadow-indigo-500/20'
                    }`}
                    aria-label="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline font-bold text-xs">Send</span>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
