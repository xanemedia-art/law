import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Scale, Sparkles, Send, ArrowLeft, ShieldAlert, User, Star, ArrowRight, Search } from 'lucide-react';

interface AIAssistantProps {
  onBack: () => void;
  onEscalate: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  needsEscalation?: boolean;
}

export default function AIAssistant({ onBack, onEscalate }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "### Welcome to LegalTalk India AI Desk.\n\nI am your interactive legal assistant trained on Indian Penal Code, Civil Procedure, Bharatiya Nyaya Sanhita, Marriage, Tax, and Intellectual Property bylaws.\n\n*   **Rights Awareness**\n*   **Bylaw Clarification**\n*   **Terminology explanations**\n*   **Court action checklists**\n\n**CRITICAL REMINDER:** *This is informational guidance and not legal advice. Talk to a verified lawyer on our platform if you need formal legal advice!*"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { label: "Criminal IPC (Sec 302 rules)", text: "What is Section 302 of Indian Penal Code? Explain bail eligibility." },
    { label: "Divorce process under Hindu Marriage Act", text: "What runs the mutual consent divorce process under Hindu Law?" },
    { label: "Trademark application details", text: "Explain steps to register a trademark logo in India." },
    { label: "Tenant security refund guide", text: "Landlord won't return my deposit in Pune. What can I do under tenancy bylaws?" }
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      setMessages(prev => [...prev, { role: 'assistant', text: `### Error\n\nApologies, the legal model could not be connected. Details: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col min-h-[85vh]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="hover:bg-slate-100 p-2 rounded-lg transition-colors border border-slate-200 text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-indigo-600 text-white p-1 rounded">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="font-display font-bold text-xl text-slate-900">AI Legal Assistant Desk</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Automated research & rights guidance</p>
          </div>
        </div>

        <button 
          onClick={onEscalate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Scale className="w-4 h-4 text-white" /> Talk to a Verified Lawyer
        </button>
      </div>

      {/* COMPLIANCE ALERT CONTAINER */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3.5 mb-6 shadow-sm">
        <ShieldAlert className="w-5.5 h-5.5 text-indigo-700 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-bold">Constitutional Legal Notice:</span> This automated chat utilizes generative AI mechanisms. Under Section Guidelines of India, results represent informational legal guidance and **DO NOT** constitute binding legal advice. To initiate courtroom actions or resolve urgent complaints, escalate instantly to our verified consulting advocates using the button on the top right.
        </div>
      </div>

      {/* CHAT BUBBLE VIEW */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 mb-4 overflow-y-auto max-h-[50vh] min-h-[35vh] space-y-6">
        <AnimatePresence initial={false}>
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            key={i} 
            className="space-y-4"
          >
            <div className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-indigo-600 text-white p-1.5'}`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4.5 h-4.5" />}
              </div>
              
              <div className={`max-w-xl rounded-2xl p-4.5 leading-relaxed text-sm ${m.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-tr-none' : 'bg-slate-50 border border-slate-150 text-slate-850 rounded-tl-none font-sans'}`}>
                {m.text.split('\n\n').map((para, pIdx) => {
                  if (para.startsWith('*') || para.startsWith('-')) {
                    return (
                      <ul key={pIdx} className="list-disc pl-5 my-2 space-y-1 bg-slate-100/50 p-2.5 rounded-lg border border-slate-100">
                        {para.split('\n').map((item, itemIdx) => (
                          <li key={itemIdx}>{item.replace(/^[\s*-]+/, '').trim()}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (para.startsWith('###')) {
                    return <h3 key={pIdx} className="font-display font-semibold text-slate-900 text-base mt-3 mb-1.5">{para.replace('###', '').trim()}</h3>;
                  }
                  if (para.startsWith('**')) {
                    return <p key={pIdx} className="font-semibold text-slate-900 my-2">{para.replace(/\*\*/g, '').trim()}</p>;
                  }
                  return <p key={pIdx} className="my-2 text-slate-700">{para}</p>;
                })}
              </div>
            </div>
            
            {m.role === 'assistant' && i > 0 && !m.text.includes('Error') && !m.text.includes('Apologies') && (
              <div className="pl-12 max-w-xl animate-fade-in mb-2">
                <button 
                  type="button"
                  onClick={() => {
                    const userQuery = messages[i - 1]?.text || '';
                    const searchPrompt = `Search for similar court case judgements, case studies, and legal outcomes in India for: ${userQuery}`;
                    handleSubmit(undefined, searchPrompt);
                  }}
                  disabled={loading}
                  className={`inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-2 px-3.5 rounded-xl border border-indigo-200/60 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm hover:shadow'}`}
                >
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  Research Similar Cases & Outcomes
                </button>
              </div>
            )}

            {m.role === 'assistant' && m.needsEscalation && (
              <div className="pl-12 max-w-xl animate-fade-in">
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full translate-x-12 -translate-y-12 blur-xl pointer-events-none"></div>
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">System Recommendation</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-white leading-snug">Deep Case Analysis Required</h4>
                    <p className="text-xs text-slate-350 mt-1 leading-relaxed">
                      This query involves specific legal strategies. Connect with a verified state Bar advocate instantly starting at ₹10/min.
                    </p>
                  </div>
                  <button 
                    onClick={onEscalate}
                    className="relative z-10 w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    Consult a Verified Lawyer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-4 items-center pl-12">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></span>
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
            <span className="text-xs text-slate-400 font-mono italic">Consulting AI Knowledge Base...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* SAMPLE QUICK SUGGESTION PILLS */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Quick Legal Prompts:</label>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!loading) handleSubmit(undefined, s.text);
              }}
              className="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/80 rounded-xl py-2 px-3.5 text-xs text-indigo-700 font-medium transition-all text-left"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER ENTER INPUT FORM */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything (e.g. 'How can I register a trademark logo in India?' or 'What is IPC Section 302?')..."
          className="flex-1 bg-white border border-slate-350 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button 
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 flex items-center justify-center transition-all cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
      
    </div>
  );
}
