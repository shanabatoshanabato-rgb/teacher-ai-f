
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Radio, ShieldCheck, User, UserCircle, WifiOff, Square } from 'lucide-react';
import { runPuterAgent, puterVoice, stopPuterVoice } from '../services/puterCore';

const VoiceView: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'listening' | 'thinking' | 'synthesizing'>('idle');
  
  const [selectedVoice, setSelectedVoice] = useState<string>('nova'); 
  
  const [transcript, setTranscript] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [sessionLang, setSessionLang] = useState<'ar' | 'en'>(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  
  const recognitionRef = useRef<any>(null);
  const isCurrentAr = sessionLang === 'ar';

  const voices = [
    { id: 'nova', labelAr: 'سارة', labelEn: 'Sara', gender: 'female' },
    { id: 'onyx', labelAr: 'آدم', labelEn: 'Adam', gender: 'male' },
  ];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(text);
        
        if (event.results[0].isFinal) {
          handleVoiceFlow(text);
        }
      };
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setPhase('listening');
        setTranscript('');
        setErrorStatus(null);
        handleStopVoice();
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (phase === 'listening') setPhase('idle');
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setPhase('idle');
        if (event.error === 'network') {
          setErrorStatus(isCurrentAr ? "خطأ في الشبكة" : "Network Error");
        }
      };
    }
  }, [sessionLang, isCurrentAr, phase]);

  const handleStopVoice = () => {
    stopPuterVoice();
    setIsAiSpeaking(false);
    if (phase === 'synthesizing') setPhase('idle');
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorStatus(null);
      handleStopVoice();
      
      recognitionRef.current.lang = sessionLang === 'ar' ? 'ar-SA' : 'en-US';
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("STT Start Error:", e);
      }
    }
  };

  const handleVoiceFlow = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setPhase('thinking');
    
    try {
      const response = await runPuterAgent(
        text, 
        undefined, 
        (p: any) => setPhase('thinking'), 
        sessionLang, 
        true
      );
      
      setPhase('synthesizing');
      setIsAiSpeaking(true);
      await puterVoice(response.text, selectedVoice);
      
    } catch (e) { 
      console.error("Voice Flow Error:", e);
      setErrorStatus(isCurrentAr ? "فشل المعالجة" : "Processing Failed");
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col items-center justify-center relative overflow-hidden bg-[#050505] p-6">
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className={`w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] transition-all duration-1000 ${isListening ? 'scale-150 opacity-40 bg-red-600/10' : isProcessing ? 'scale-125 opacity-30 animate-pulse' : 'scale-100'}`}></div>
      </div>

      <div className="z-20 text-center space-y-8 max-w-2xl w-full flex flex-col items-center">
        {errorStatus && (
          <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errorStatus}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="text-indigo-400 font-black tracking-[0.4em] uppercase text-[10px]">Advanced Voice Core</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.4]">
            {isCurrentAr ? 'الوضع الصوتي' : 'Voice Mode'}
          </h1>
        </div>

        <div className="flex flex-col gap-4 w-full items-center">
          <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex gap-1">
            <button onClick={() => setSessionLang('ar')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sessionLang === 'ar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>العربية</button>
            <button onClick={() => setSessionLang('en')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sessionLang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>English</button>
          </div>
        </div>

        <div className="relative flex items-center justify-center py-6 gap-6">
          <button 
            onClick={toggleListening} 
            disabled={isProcessing} 
            className={`group relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl z-30 ${
              isListening ? 'bg-red-600 shadow-red-500/40' : isProcessing ? 'bg-indigo-600 shadow-indigo-500/40 animate-pulse' : 'bg-[#111827] border-4 border-white/5 hover:border-indigo-500/30'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-16 h-16 text-white animate-spin" />
            ) : isListening ? (
              <MicOff className="w-16 h-16 text-white animate-pulse" />
            ) : (
              <Mic className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
            )}
            
            {(isListening || isProcessing) && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                <div className="absolute -inset-8 rounded-full border border-white/5 animate-pulse delay-100"></div>
              </>
            )}
          </button>

          {isAiSpeaking && (
             <button 
               onClick={handleStopVoice}
               className="absolute -right-24 md:-right-32 bottom-12 p-6 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-500 rounded-full shadow-2xl transition-all active:scale-90 group flex flex-col items-center gap-2"
             >
                <Square className="w-8 h-8 fill-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isCurrentAr ? 'إيقاف' : 'STOP'}</span>
             </button>
          )}
        </div>

        <div className="w-full min-h-[160px] flex flex-col gap-4 px-4">
          {transcript && (
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl animate-in fade-in shadow-xl backdrop-blur-md">
               <div className="flex items-center gap-2 mb-2 opacity-40">
                  <User className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{isCurrentAr ? 'صوتك' : 'YOUR VOICE'}</span>
               </div>
               <p className={`text-slate-200 text-lg font-medium leading-[1.4] ${isCurrentAr ? 'text-right' : 'text-left'}`} dir={isCurrentAr ? 'rtl' : 'ltr'}>
                 {transcript}
               </p>
            </div>
          )}

          {(isProcessing || phase === 'synthesizing') && (
            <div className="flex justify-center items-center gap-4 py-4 animate-in fade-in">
              <div className="flex gap-1 items-end h-12">
                <div className="w-2 bg-indigo-500 rounded-full animate-voice-bar-1 h-6"></div>
                <div className="w-2 bg-indigo-500 rounded-full animate-voice-bar-2 h-10"></div>
                <div className="w-2 bg-indigo-500 rounded-full animate-voice-bar-3 h-8"></div>
                <div className="w-2 bg-indigo-500 rounded-full animate-voice-bar-4 h-4"></div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-3">
               {isListening && <Radio className="w-4 h-4 text-red-500 animate-pulse" />}
               <p className={`text-xl font-black uppercase tracking-tighter ${isListening ? 'text-red-500' : 'text-white'}`}>
                  {phase === 'listening' ? (isCurrentAr ? 'جاري الاستماع...' : 'LISTENING...') :
                   phase === 'thinking' ? (isCurrentAr ? 'جاري التفكير...' : 'THINKING...') :
                   phase === 'synthesizing' ? (isCurrentAr ? 'جاري التحدث...' : 'SPEAKING...') :
                   (isCurrentAr ? 'اضغط للتحدث' : 'TAP TO START')}
               </p>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {voices.map((v) => (
            <button 
              key={v.id} 
              onClick={() => setSelectedVoice(v.id)} 
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest border transition-all ${selectedVoice === v.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl scale-110' : 'bg-black/40 border-white/10 text-slate-500 hover:text-white'}`}
            >
              {v.gender === 'female' ? <User className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
              {isCurrentAr ? v.labelAr : v.labelEn}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes voice-bar {
          0%, 100% { height: 4px; }
          50% { height: 100%; }
        }
        .animate-voice-bar-1 { animation: voice-bar 0.6s infinite ease-in-out; }
        .animate-voice-bar-2 { animation: voice-bar 0.8s infinite ease-in-out; }
        .animate-voice-bar-3 { animation: voice-bar 0.7s infinite ease-in-out; }
        .animate-voice-bar-4 { animation: voice-bar 0.9s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default VoiceView;
