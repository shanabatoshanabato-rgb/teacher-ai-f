
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles, BrainCircuit, Globe, Radio, ShieldCheck, Zap } from 'lucide-react';
import { runVoiceOrchestrator, generateSpeech } from '../services/aiService';

const VoiceView: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'researching' | 'synthesizing'>('idle');
  const [voice, setVoice] = useState<'Adam' | 'Sara'>('Adam');
  
  const recognitionRef = useRef<any>(null);
  const isAr = document.documentElement.lang === 'ar';

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        handleVoiceFlow(text);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel();
      setIsListening(true);
      recognitionRef.current.lang = isAr ? 'ar-SA' : 'en-US';
      recognitionRef.current?.start();
    }
  };

  const handleVoiceFlow = async (text: string) => {
    setIsProcessing(true);
    try {
      const finalAnswer = await runVoiceOrchestrator(text, (p: any) => setPhase(p));
      await generateSpeech(finalAnswer, voice);
    } catch (error) {
      console.error("Voice flow error:", error);
    } finally {
      setIsProcessing(false);
      setPhase('idle');
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-between relative overflow-hidden bg-[#050505] p-6">
      
      {/* Top Protocol Bar */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 z-10">
        <div className="flex gap-2 bg-[#111827]/80 p-1.5 rounded-2xl border border-white/5 backdrop-blur-2xl shadow-2xl">
          <button onClick={() => setVoice('Adam')} className={`px-10 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase ${voice === 'Adam' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
            {isAr ? 'نبرة ذكر' : 'Smart Adam'}
          </button>
          <button onClick={() => setVoice('Sara')} className={`px-10 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase ${voice === 'Sara' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
            {isAr ? 'نبرة أنثى' : 'Smart Sara'}
          </button>
        </div>
        
        <div className="flex items-center gap-4 opacity-30 grayscale pointer-events-none">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[9px] font-black uppercase tracking-[0.4em]">{isAr ? 'بروتوكول صوتي آمن' : 'Voice Security Protocol Enabled'}</span>
        </div>
      </div>

      {/* Main Core Interface */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="relative group">
          <div className={`absolute inset-0 bg-indigo-600 blur-[180px] rounded-full transition-all duration-1000 pointer-events-none 
            ${isListening ? 'scale-150 opacity-40 bg-red-600' : isProcessing ? 'scale-125 opacity-30 animate-pulse' : 'scale-75 opacity-10'}`}
          />
          
          <button 
            onClick={toggleListening}
            disabled={isProcessing}
            className={`
              relative w-56 h-56 md:w-96 md:h-96 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl z-20 overflow-hidden
              ${isListening 
                ? 'bg-red-500 scale-105 shadow-[0_0_120px_rgba(239,68,68,0.4)]' 
                : isProcessing 
                  ? 'bg-black border-4 border-indigo-500/20 shadow-[0_0_100px_rgba(79,70,229,0.2)]' 
                  : 'bg-[#111827] hover:bg-indigo-600 shadow-[0_0_100px_rgba(79,70,229,0.3)] hover:scale-105 border-4 border-white/5'
              }
            `}
          >
            {isProcessing ? (
              <div className="relative flex flex-col items-center justify-center h-full w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-48 h-48 md:w-72 md:h-72 border-2 border-indigo-500/10 rounded-full animate-ping" />
                   <div className="absolute w-full h-full border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                
                <div className="z-30 flex flex-col items-center gap-6">
                  {phase === 'analyzing' && <BrainCircuit className="w-20 h-20 text-indigo-400 animate-pulse" />}
                  {phase === 'researching' && <Globe className="w-20 h-20 text-emerald-400 animate-spin" />}
                  {phase === 'synthesizing' && <Radio className="w-20 h-20 text-blue-400 animate-bounce" />}
                </div>
              </div>
            ) : isListening ? (
              <div className="flex flex-col items-center gap-4">
                 <MicOff className="w-24 h-24 text-white animate-pulse" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <Mic className="w-24 h-24 text-white transition-transform duration-500 group-hover:scale-110" />
                <Zap className="w-6 h-6 text-indigo-400 opacity-40 animate-pulse" />
              </div>
            )}
          </button>
        </div>

        {/* Intelligence Status Display */}
        <div className="mt-24 h-16 flex flex-col items-center justify-center text-center px-8">
          {isProcessing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0s]" />
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <h3 className="text-white font-black tracking-[0.4em] uppercase text-sm md:text-xl">
                {phase === 'analyzing' && (isAr ? 'تحليل المحرك الذكي' : 'Smart Protocol Active')}
                {phase === 'researching' && (isAr ? 'البحث عن بيانات محدثة' : 'Searching Real-time Stream')}
                {phase === 'synthesizing' && (isAr ? 'صياغة الرد الصوتي' : 'Synthesizing Response')}
              </h3>
            </div>
          ) : isListening ? (
            <div className="space-y-2">
              <p className="text-red-400 font-black tracking-[0.6em] uppercase text-xs animate-pulse">
                {isAr ? 'الاستماع للمدخلات...' : 'Listening to Input...'}
              </p>
              <div className="flex gap-1 justify-center">
                 {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-3 bg-red-500 animate-[bounce_0.8s_ease-in-out_infinite]" style={{animationDelay: `${i*0.1}s`}}></div>)}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-600 font-black tracking-[0.5em] uppercase text-[10px]">
                {isAr ? 'نظام المعلم الذكي جاهز' : 'Teacher AI Voice Hub Ready'}
              </p>
              <p className="text-[8px] text-slate-800 font-bold uppercase tracking-widest leading-relaxed">
                 {isAr ? 'اضغط على القلب الذكي للبدء' : 'Initiate via the Smart Core'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Meta */}
      <div className="pb-12 flex items-center justify-center gap-12 opacity-20 pointer-events-none transition-all">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? 'ذكاء صناعي متكامل' : 'Unified Intelligence'}</span>
        </div>
        <div className="w-1 h-1 bg-white/20 rounded-full" />
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? 'توليد صوتي فائق' : 'HD Voice Synthesis'}</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceView;
