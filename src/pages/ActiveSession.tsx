import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  PhoneCall, 
  Video as VideoIcon, 
  RefreshCw, 
  ShieldAlert, 
  Sun, 
  Moon, 
  ArrowLeft,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { User, Consultation, ConsultationMessage, WebRTCSignal } from '../types';
import { getSupabaseClient } from '../lib/supabase';

interface ActiveSessionProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function ActiveSession({ currentUser, theme, onToggleTheme }: ActiveSessionProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [clientBalance, setClientBalance] = useState(0);
  const [freeCallMinutesRemaining, setFreeCallMinutesRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Audio/Video Hardware & WebRTC State
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'offline'>('connecting');
  const [mediaError, setMediaError] = useState<string | null>(null);

  // References
  const bottomRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const processedSignalsRef = useRef<Set<string>>(new Set());
  const iceCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const lastSignalTimeRef = useRef<string>(new Date(Date.now() - 60000).toISOString());

  const isClient = currentUser?.role === 'client';
  const myUserId = currentUser?.id || '';
  const myUserName = currentUser?.name || 'Anonymous User';

  // -------------------------------------------------------------
  // 1. SESSION FETCH & BILLING LOOP
  // -------------------------------------------------------------
  const fetchSession = async () => {
    if (!id) return;
    try {
      const res = await fetch('/api/consultations/session/' + id);
      if (!res.ok) throw new Error('Session could not be retrieved');
      const data = await res.json();
      setSession(data.session);
      setMinutes(data.session.totalMinutes || 0);
      setSessionLoading(false);
    } catch (err) {
      console.error(err);
      alert('Invalid or completed consultation room.');
      navigate('/');
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchSession();
  }, [id, currentUser]);

  const fetchWallet = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/wallet/' + session.clientId);
      const data = await res.json();
      setClientBalance(data.balance ?? 0);

      const uRes = await fetch('/api/auth/current');
      const uData = await uRes.json();
      const currentClient = uData.users?.find((u: any) => u.id === session.clientId);
      if (currentClient) {
        setFreeCallMinutesRemaining(currentClient.freeCallMinutesRemaining ?? 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchMessages();
    fetchWallet();

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/consultations/bill-minute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultationId: session.id })
        });
        const data = await res.json();
        if (data.exhausted) {
          clearInterval(interval);
          alert('Wallet balance exhausted! This legal consultation session has been terminated.');
          handleReturnToDashboard();
        } else if (data.success) {
          setMinutes(data.totalMinutes);
          setClientBalance(data.clientBalance);
          fetchWallet();
        }
      } catch (err) {
        console.error('Billing engine tick failed', err);
      }
    }, 12000); // 12 seconds = 1 simulated minute for testing

    return () => clearInterval(interval);
  }, [session]);

  // -------------------------------------------------------------
  // 2. REAL-TIME CHAT ENGINE (SUPABASE REALTIME + 2S POLLING FALLBACK)
  // -------------------------------------------------------------
  const playMessageChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const fetchMessages = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/consultations/messages/' + session.id);
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(prev => {
          const hasNewFromPeer = data.messages.some(
            (m: ConsultationMessage) => m.senderId !== myUserId && !prev.some(p => p.id === m.id)
          );
          if (hasNewFromPeer && prev.length > 0) {
            playMessageChime();
          }
          return data.messages;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!session) return;

    // Supabase Realtime Listener
    const supabase = getSupabaseClient();
    let supabaseChannel: any = null;

    if (supabase) {
      supabaseChannel = supabase
        .channel('consultation_messages:' + session.id)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultation_messages',
            filter: 'consultation_id=eq.' + session.id
          },
          (payload: any) => {
            const row = payload.new;
            if (row) {
              const newMsg: ConsultationMessage = {
                id: row.id,
                consultationId: row.consultation_id,
                senderId: row.sender_id,
                senderName: row.sender_name,
                text: row.text,
                timestamp: row.created_at
              };
              setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                if (newMsg.senderId !== myUserId) {
                  playMessageChime();
                }
                return [...prev, newMsg];
              });
            }
          }
        )
        .subscribe();
    }

    // High frequency 2-second polling fallback ensures messages arrive reliably even without Supabase
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !session) return;
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await fetch('/api/consultations/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: session.id,
          senderId: myUserId,
          senderName: myUserName,
          text: textToSend
        })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // 3. WEBRTC P2P CALL ENGINE (VIDEO & VOICE)
  // -------------------------------------------------------------
  // Helper: Create synthetic stream when physical webcam is locked by another tab on the same laptop
  const createSyntheticMedia = useCallback((name: string, isVideo: boolean): MediaStream => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 480);

      const grad = ctx.createRadialGradient(320, 200, 10, 320, 200, 200);
      grad.addColorStop(0, '#312e81');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      const t = Date.now() / 1000;
      const pulse = Math.sin(t * 3) * 8;
      ctx.beginPath();
      ctx.arc(320, 190, 72 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#4f46e5';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'LT';
      ctx.fillText(initials, 320, 190);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(name, 320, 295);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('● WEBRTC PEER CONNECTED (VIRTUAL FEED)', 320, 325);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Testing Mode (Hardware camera shared across tabs)', 320, 345);

      requestAnimationFrame(draw);
    };
    draw();

    const stream = canvas.captureStream(25);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        const dest = audioCtx.createMediaStreamDestination();
        gain.connect(dest);
        osc.start();
        dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      }
    } catch (e) {
      console.warn('Audio synthetic context error:', e);
    }

    return stream;
  }, []);

  // Send signaling packet (via HTTP + Supabase broadcast)
  const sendSignal = useCallback(async (type: WebRTCSignal['type'], payload: any) => {
    if (!session || !currentUser) return;
    const partnerId = isClient ? session.lawyerId : session.clientId;

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const channel = supabase.channel('webrtc:' + session.id);
        channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            consultationId: session.id,
            fromUserId: currentUser.id,
            toUserId: partnerId,
            type,
            payload
          }
        });
      }
    } catch (err) {
      // Supabase broadcast failure fallback
    }

    try {
      await fetch('/api/consultations/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: session.id,
          fromUserId: currentUser.id,
          toUserId: partnerId,
          type,
          payload
        })
      });
    } catch (err) {
      console.error('Signal transmission failed:', err);
    }
  }, [session, currentUser, isClient]);

  // Initialize WebRTC
  useEffect(() => {
    if (!session || session.type === 'chat') {
      setCallStatus('connected');
      return;
    }

    let isMounted = true;
    const isVideoMode = session.type === 'video';

    const initWebRTC = async () => {
      try {
        setCallStatus('connecting');

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: isVideoMode ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
            audio: true
          });
        } catch (mediaErr: any) {
          console.warn('Physical media capture unavailable or locked, falling back to synthetic test media:', mediaErr);
          setMediaError('Physical camera/mic in use or restricted. Running high-fidelity peer simulation stream.');
          stream = createSyntheticMedia(myUserName, isVideoMode);
        }

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && isVideoMode) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
          ]
        });
        pcRef.current = pc;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (isVideoMode && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {});
          }
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(() => {});
          }
          setCallStatus('connected');
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal('ice-candidate', event.candidate.toJSON());
          }
        };

        pc.onconnectionstatechange = () => {
          if (!isMounted) return;
          if (pc.connectionState === 'connected') {
            setCallStatus('connected');
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setCallStatus('reconnecting');
          }
        };

        if (isClient) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal('offer', offer);
        }

      } catch (err: any) {
        console.error('Failed to initialize WebRTC engine:', err);
        setCallStatus('failed');
      }
    };

    initWebRTC();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [session?.id, session?.type, isClient]);

  // -------------------------------------------------------------
  // 4. SIGNAL CONSUMER (HTTP POLLING + SUPABASE BROADCAST)
  // -------------------------------------------------------------
  const handleIncomingSignal = useCallback(async (sig: WebRTCSignal) => {
    const pc = pcRef.current;
    if (!pc || !sig || processedSignalsRef.current.has(sig.id)) return;
    processedSignalsRef.current.add(sig.id);

    try {
      if (sig.type === 'offer' && !isClient) {
        await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
        while (iceCandidatesQueueRef.current.length > 0) {
          const cand = iceCandidatesQueueRef.current.shift();
          if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal('answer', answer);
      } else if (sig.type === 'answer' && isClient) {
        await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
        while (iceCandidatesQueueRef.current.length > 0) {
          const cand = iceCandidatesQueueRef.current.shift();
          if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
      } else if (sig.type === 'ice-candidate' && sig.payload) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(sig.payload));
        } else {
          iceCandidatesQueueRef.current.push(sig.payload);
        }
      }
    } catch (sigErr) {
      console.error('Error handling WebRTC signal:', sigErr);
    }
  }, [isClient, sendSignal]);

  useEffect(() => {
    if (!session || session.type === 'chat') return;

    const supabase = getSupabaseClient();
    let channel: any = null;

    if (supabase) {
      channel = supabase.channel('webrtc:' + session.id);
      channel
        .on('broadcast', { event: 'signal' }, (event: any) => {
          const sig = event.payload;
          if (sig && sig.fromUserId !== myUserId) {
            handleIncomingSignal(sig);
          }
        })
        .subscribe();
    }

    const signalInterval = setInterval(async () => {
      try {
        const url = '/api/consultations/signals/' + session.id + '/' + myUserId + '?since=' + encodeURIComponent(lastSignalTimeRef.current);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.signals) && data.signals.length > 0) {
            for (const sig of data.signals) {
              await handleIncomingSignal(sig);
              if (sig.createdAt > lastSignalTimeRef.current) {
                lastSignalTimeRef.current = sig.createdAt;
              }
            }
          }
        }
      } catch (err) {
        // Polling transient error
      }
    }, 1200);

    return () => {
      clearInterval(signalInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [session, myUserId, handleIncomingSignal]);

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = isMuted;
    });
    setIsMuted(!isMuted);
  };

  const toggleCam = () => {
    if (!localStreamRef.current) return;
    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = isCamOff;
    });
    setIsCamOff(!isCamOff);
  };

  const handleReturnToDashboard = () => {
    if (currentUser?.role === 'client') {
      navigate('/client');
    } else if (currentUser?.role === 'lawyer') {
      navigate('/lawyer');
    } else {
      navigate('/');
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    if (!window.confirm('Are you sure you want to conclude this legal consultation? The remaining wallet balance will be unlocked.')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/consultations/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: session.id })
      });
      const data = await res.json();
      if (data.success) {
        alert('Session completed! Duration: ' + data.session.totalMinutes + ' mins. Gross Fee: ₹' + data.session.totalCost);
        handleReturnToDashboard();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <span className="font-mono text-slate-500 text-xs">Accessing secured legal video room...</span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-4 sm:p-8 font-sans">
      
      {/* Hidden audio element for remote audio stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {session.type !== 'chat' && freeCallMinutesRemaining === 1 && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-900 border border-rose-600 text-white text-xs font-bold px-4 py-3 rounded-2xl mb-4 text-center animate-pulse"
        >
          🚨 WARNING: Only 1 minute of free consultation remaining. Subsequent minutes will bill at ₹10/minute.
        </motion.div>
      )}

      {/* TOP HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleReturnToDashboard}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Consultation</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ₹0 WebRTC P2P
          </span>
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 1. TOP DYNAMIC STATS OVERVIEW */}
      <div className="bg-slate-900 border border-slate-850 text-white rounded-3xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping"></span>
          <div>
            <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Room ID: {session.id}</span>
            <span className="text-base font-display font-extrabold text-white mt-1 block">
              Client: <strong className="text-indigo-400">{session.clientName}</strong> &bull; Lawyer: <strong className="text-indigo-400">{session.lawyerName}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          {session.type !== 'chat' && freeCallMinutesRemaining > 0 && (
            <div className={`p-2.5 rounded-xl text-center border animate-pulse ${freeCallMinutesRemaining === 1 ? 'bg-rose-950 border-rose-700 text-rose-400' : 'bg-indigo-950 border-indigo-900 text-indigo-400'}`}>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Free Mins Left</span>
              <span className="text-sm font-black font-mono">{freeCallMinutesRemaining} Min</span>
            </div>
          )}
          <div className="bg-slate-850 p-2.5 rounded-xl text-center border border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Rate</span>
            <span className="text-sm font-black text-amber-400 font-mono">₹{session.ratePerMinute}/min</span>
          </div>
          <div className="bg-slate-850 p-2.5 rounded-xl text-center border border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Duration</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{minutes || 1} min</span>
          </div>
          <div className="bg-slate-850 p-2.5 rounded-xl text-center border border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Wallet Balance</span>
            <span className="text-sm font-black text-rose-400 font-mono font-bold">₹{clientBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. CHAT PANEL & WEBCAM MULTIMEDIA MATRIX CONTAINER */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* VIDEO WEB CAM & MULTIMEDIA PANEL */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-850 relative min-h-[52vh]">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-wide text-slate-300">Communication Channel: <strong className="text-indigo-400 uppercase">{session.type} Mode</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                callStatus === 'connected' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
              }`}>
                {callStatus === 'connected' ? '● PEER CONNECTED' : '○ CONNECTING PEER...'}
              </span>
            </div>
          </div>

          {mediaError && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-[11px] text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mediaError}</span>
            </div>
          )}

          {/* ACTIVE FEED RENDERER */}
          {session.type === 'video' ? (
            <div className="flex-1 grid sm:grid-cols-2 gap-4 my-6 items-center">
              
              {/* LOCAL FEED */}
              <div className="aspect-video bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover mirror ${isCamOff ? 'hidden' : 'block'}`} 
                />
                {isCamOff && (
                  <div className="flex flex-col items-center justify-center text-slate-500 text-xs font-mono p-4 text-center">
                    <VideoOff className="w-10 h-10 mb-2 text-slate-600" />
                    <span>Camera is turned off</span>
                  </div>
                )}
                <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-slate-200 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase font-mono border border-slate-750">
                  You ({myUserName})
                </span>
                {isMuted && (
                  <span className="absolute top-3 right-3 bg-rose-900/80 text-white text-[10px] p-1.5 rounded-full border border-rose-600">
                    <MicOff className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* REMOTE FEED */}
              <div className="aspect-video bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover block" 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs font-mono p-4 text-center -z-0 pointer-events-none">
                  <UserIcon className="w-10 h-10 mb-2 text-slate-700 animate-pulse" />
                  <span className="text-[11px] text-slate-400">Waiting for remote partner video...</span>
                  <span className="text-[10px] text-slate-600 mt-1">(Signaling via Google STUN & Realtime)</span>
                </div>
                <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-indigo-300 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase font-mono border border-indigo-900/60 z-10">
                  {isClient ? session.lawyerName : session.clientName}
                </span>
              </div>

            </div>
          ) : session.type === 'voice' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4">
              <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30 animate-pulse">
                <PhoneCall className="w-12 h-12" />
              </div>
              <div>
                <strong className="block text-lg text-slate-100">Encrypted Voice Chamber Active</strong>
                <span className="block text-xs text-slate-400 mt-1">
                  Connected with <strong className="text-indigo-400">{isClient ? session.lawyerName : session.clientName}</strong>
                </span>
              </div>
              <div className="flex gap-1.5 items-center justify-center h-10">
                {[1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((bar, i) => (
                  <span 
                    key={i} 
                    className="w-1.5 bg-indigo-500 rounded-full animate-bounce" 
                    style={{ 
                      height: `${bar * 6}px`, 
                      animationDelay: `${i * 120}ms`,
                      animationDuration: '0.9s'
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4 bg-slate-950/40 border border-slate-800/80 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center border border-blue-400/20">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <strong className="block text-slate-100 text-base">Live Legal Consultation Chat Active</strong>
                <span className="block text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Messages are sent over real-time channels with sub-second delivery. Use the right chat console.
                </span>
              </div>
            </div>
          )}

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2 mb-6">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
            <span><strong>Zero Rupees P2P Architecture:</strong> Direct WebRTC peer streams powered by Google Public STUN. 1 simulated billing minute ticks every 12 seconds in test mode.</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {session.type !== 'chat' && (
                <>
                  <button 
                    onClick={toggleMute}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isMuted ? 'bg-rose-950 border-rose-700 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                  </button>

                  {session.type === 'video' && (
                    <button 
                      onClick={toggleCam}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCamOff ? 'bg-amber-950 border-amber-700 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                      }`}
                    >
                      {isCamOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                      <span>{isCamOff ? 'Turn On Camera' : 'Turn Off Camera'}</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <button 
              onClick={handleEndSession}
              disabled={loading}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{loading ? 'Concluding...' : 'Conclude Consultation'}</span>
            </button>
          </div>

        </div>

        {/* SECURE REALTIME REPLIES MESSAGING COLUMN */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between min-h-[52vh] shadow-xs">
          
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
            <span className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> Realtime Messages ({messages.length})
            </span>
            <button 
              onClick={fetchMessages} 
              title="Refresh messages"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[38vh] space-y-3 pr-1 mb-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span className="text-xs italic block">No messages yet. Begin the legal consultation below.</span>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const isMe = m.senderId === myUserId;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      key={m.id || i} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-750 rounded-tl-none'
                      }`}>
                        <strong className={`block text-[10px] font-bold mb-1 ${isMe ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                          {m.senderName} {isMe && '(You)'}
                        </strong>
                        <span className="block font-sans whitespace-pre-wrap">{m.text}</span>
                        <span className={`block text-[9px] font-mono mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
              required
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 shrink-0 cursor-pointer text-xs font-bold transition-all shadow-md"
            >
              Send
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
