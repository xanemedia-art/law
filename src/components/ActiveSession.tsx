import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, PhoneCall, Video, Send, CheckCircle, ShieldAlert, AlertTriangle, Play, Pause, HandMetal, Scale, Award, HeartHandshake, RefreshCw } from 'lucide-react';
import { User, Consultation, ConsultationMessage } from '../types';

interface ActiveSessionProps {
  session: Consultation;
  currentUser: User | null;
  onSessionEnded: () => void;
}

export default function ActiveSession({ session, currentUser, onSessionEnded }: ActiveSessionProps) {
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [clientBalance, setClientBalance] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const isClient = currentUser?.role === 'client';
  const myUserId = currentUser?.id || '';
  const myUserName = currentUser?.name || 'Anonymous User';

  // Tick the Billing Engine every 10 seconds to simulate a minute tick in fast-speed mode for demonstration!
  // We'll write this so that every 10 seconds, it calls the backend's minute-based billing endpoint. This represents
  // a fully functional billing engine that is easily testable! Let's display a status explaining this to the user.
  useEffect(() => {
    fetchMessages();
    fetchWallet();

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/consultations/bill-minute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consultationId: session.id })
        });
        const data = await res.json();
        
        if (data.exhausted) {
          clearInterval(interval);
          alert("Wallet balance exhausted! This legal consultation session has been automatically terminated under system rules.");
          onSessionEnded();
        } else if (data.success) {
          setMinutes(data.totalMinutes);
          setClientBalance(data.clientBalance);
        }
      } catch (err) {
        console.error("Billing engine tick failed", err);
      }
    }, 12000); // Ticks every 12 seconds representing 1 dynamic minute for testing!

    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/consultations/messages/${session.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWallet = async () => {
    if (!session.clientId) return;
    try {
      const res = await fetch(`/api/wallet/${session.clientId}`);
      const data = await res.json();
      setClientBalance(data.balance);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await fetch("/api/consultations/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: session.id,
          senderId: myUserId,
          senderName: myUserName,
          text: inputText
        })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        setInputText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm("Are you sure you want to conclude this legal consultation? The remaining wallet balance will be unlocked.")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/consultations/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId: session.id })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Session completed. Total duration: ${data.session.totalMinutes} minutes.\nGross Cost: ₹${data.session.totalCost}\nSplit breakdown credited to Advocate: ₹${data.session.lawyerReceipt}`);
        onSessionEnded();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-6 py-6 font-sans">
      
      {/* 1. TOP DYNAMIC STATS OVERVIEW */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className={`w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping`}></span>
          <div>
            <span className="block text-xs text-slate-400 font-mono">Dynamic Interaction Channel Active &bull; ID: {session.id}</span>
            <span className="text-base font-display font-extrabold text-slate-205">
              Client: <strong className="text-indigo-400">{session.clientName}</strong> &bull; Lawyer: <strong className="text-indigo-400">{session.lawyerName}</strong>
            </span>
          </div>
        </div>

        {/* Dynamic ticking meter details */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-850 p-2.5 rounded-xl text-center border border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold block">Rate</span>
            <span className="text-sm font-black text-amber-400 font-mono">₹{session.ratePerMinute}/min</span>
          </div>
          <div className="bg-slate-850 p-2.5 rounded-xl text-center border border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold block">Duration</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{minutes || session.totalMinutes || 1} min</span>
          </div>
          <div className="bg-slate-850 p-2.5 rounded-xl text-center border border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold block">Wallet Balance</span>
            <span className="text-sm font-black text-rose-400 font-mono">₹{clientBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. CHAT PANEL & WEBCAM MULTIMEDIA MATRIX CONTAINER */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* VIDEO WEB CAM & MULTIMEDIA PANEL */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative min-h-[50vh]">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono tracking-wide text-slate-400">Communication Mode: <strong className="text-indigo-400 uppercase">{session.type} Channel</strong></span>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-800 p-1 rounded">Secured RTC Feed</span>
          </div>

          {/* ACTIVE FEED RENDERER */}
          {session.type === 'video' ? (
            <div className="flex-1 grid grid-cols-2 gap-4 my-6 items-center">
              
              {/* Clients webcam display mimic */}
              <div className="aspect-video bg-slate-850 rounded-2xl relative overflow-hidden border border-slate-800">
                {isCamOff ? (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-500">Camera Active (Paused)</div>
                ) : (
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350" alt="Client video feed placeholder" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                )}
                <span className="absolute bottom-3 left-3 bg-slate-950/65 text-slate-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono">You (Client)</span>
              </div>

              {/* Advocates webcam display mimic */}
              <div className="aspect-video bg-slate-850 rounded-2xl relative overflow-hidden border border-slate-800 animate-pulse">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=350" alt="Lawyer video feed placeholder" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-slate-950/65 text-slate-205 text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono">{session.lawyerName}</span>
              </div>

            </div>
          ) : session.type === 'voice' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4">
              <div className="w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-400/20 animate-pulse">
                <PhoneCall className="w-10 h-10" />
              </div>
              <div>
                <strong className="block text-slate-100">Audio Voice Conversation Active</strong>
                <span className="block text-xs text-slate-400 mt-1">Speaker, Microphone & Agora dynamic channels initialized.</span>
              </div>
              <div className="flex gap-1.5 items-center justify-center">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((bar, i) => (
                  <span 
                    key={i} 
                    className="w-1.5 bg-indigo-500 rounded-full animate-bounce" 
                    style={{ 
                      height: `${bar * 5}px`, 
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4 bg-slate-950/30 border border-slate-850 p-6 rounded-2xl">
              <div className="w-16 h-16 bg-blue-500/15 text-blue-400 rounded-full flex items-center justify-center border border-blue-400/15">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <strong className="block text-slate-100">Live Chat Consultation Active</strong>
                <span className="block text-xs text-slate-400 mt-1">Type in real-time on the right messaging panel to interact with {session.lawyerName}.</span>
              </div>
            </div>
          )}

          {/* DYNAMIC SETTINGS COMPLIANCE CARD */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2 mb-6">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
            <span><strong>Billing engine speeds:</strong> For staging demonstration, 1 simulated minute ticks every 12 seconds instead of 60. Check wallet balance deductions!</span>
          </div>

          {/* CONTROLLER ROW */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 flex-wrap gap-4">
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`py-2 px-4.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isMuted 
                    ? 'bg-amber-600/20 border-amber-600/40 text-amber-500' 
                    : 'bg-slate-800 border-slate-750 text-slate-300 hover:bg-slate-755'
                }`}
              >
                {isMuted ? 'Unmute Mic' : 'Mute Microphone'}
              </button>
              {session.type === 'video' && (
                <button 
                  onClick={() => setIsCamOff(!isCamOff)}
                  className={`py-2 px-4.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isCamOff 
                      ? 'bg-amber-600/20 border-amber-600/40 text-amber-500' 
                      : 'bg-slate-800 border-slate-750 text-slate-300 hover:bg-slate-755'
                  }`}
                >
                  {isCamOff ? 'Start Camera' : 'Turn Off Cam'}
                </button>
              )}
            </div>

            <button 
              onClick={handleEndSession}
              disabled={loading}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              {loading ? "Ending and calculating splits..." : "End Legal Consultation Session"}
            </button>

          </div>

        </div>

        {/* SECURE REALTIME REPLIES MESSAGING COLUMN */}
        <div className="lg:col-span-5 bg-white border border-slate-205 rounded-3xl p-5 flex flex-col justify-between min-h-[50vh] shadow-xs">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <span className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-indigo-600" /> Real-time Workspace Chat</span>
            <button onClick={fetchMessages} className="text-slate-400 hover:text-indigo-600"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>

          {/* CHAT DISPLAY LEDGER */}
          <div className="flex-1 overflow-y-auto max-h-[35vh] space-y-4 pr-1 mb-4">
            {messages.length === 0 ? (
              <span className="text-xs text-slate-400 italic block text-center mt-12">Type a legal message to start connection...</span>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex gap-2 text-xs ${m.senderId === myUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-xl p-3 border leading-relaxed ${
                    m.senderId === myUserId 
                      ? 'bg-indigo-600 text-white border-indigo-650 rounded-tr-none' 
                      : 'bg-slate-50 text-slate-800 border-slate-150 rounded-tl-none'
                  }`}>
                    <strong className="block text-[10px] opacity-75 mb-0.5">{m.senderName}</strong>
                    <span className="block font-sans">{m.text}</span>
                    <span className="block text-[8px] opacity-50 font-mono mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT FORM FIELD */}
          <form onSubmit={sendMessage} className="flex gap-1.5">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message to advocate here..."
              className="flex-1 bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
            <button 
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 shrink-0 cursor-pointer text-xs font-bold"
            >
              Send
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
