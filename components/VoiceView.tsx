
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles } from 'lucide-react';
import { askVoiceTeacher, generateSpeech } from '../services/aiService';

const VoiceView: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
        handleVoiceInput(text);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel(); // Stop any current speech
      setIsListening(true);
      // Auto-detect lang based on system setting or previous input
      recognitionRef.current.lang = isAr ? 'ar-SA' : 'en-US';
      recognitionRef.current?.start();
    }
  };

  const handleVoiceInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await askVoiceTeacher(text);
      // Native TTS plays automatically in aiService
      await generateSpeech(response, voice);
    } catch (error) {
      console.error("Voice processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-between relative overflow-hidden bg-[#050505]">
      
      {/* Voice Selection - Top */}
      <div className="w-full flex justify-center pt-8 z-10">
        <div className="flex gap-2 bg-[#111827]/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl">
          <button onClick={() => setVoice('Adam')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase ${voice === 'Adam' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{isAr ? 'صوت ذكر' : 'Male'}</button>
          <button onClick={() => setVoice('Sara')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase ${voice === 'Sara' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{isAr ? 'صوت أنثى' : 'Female'}</button>
        </div>
      </div>

      {/* Main Neural Core Visualizer - Center */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="relative group flex flex-col items-center justify-center">
          {/* Ambient Glow */}
          <div className={`absolute inset-0 bg-indigo-600 blur-[120px] rounded-full transition-all duration-1000 pointer-events-none ${isListening ? 'scale-150 opacity-30' : isProcessing ? 'scale-125 opacity-20' : 'scale-75 opacity-10'}`}></div>
          
          <button 
            onClick={toggleListening}
            disabled={isProcessing}
            className={`
              relative w-48 h-48 md:w-80 md:h-80 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl z-20
              ${isListening 
                ? 'bg-red-500 scale-105 shadow-[0_0_80px_rgba(239,68,68,0.4)]' 
                : isProcessing 
                  ? 'bg-[#0f172a] border-4 border-indigo-500/50 animate-pulse' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_60px_rgba(79,70,229,0.3)] hover:scale-105'
              }
            `}
          >
            {isProcessing ? (
              <div className="relative flex flex-col items-center gap-4">
                <Loader2 className="w-20 h-20 md:w-32 md:h-32 text-indigo-400 animate-spin" />
              </div>
            ) : isListening ? (
              <MicOff className="w-20 h-20 md:w-32 md:h-32 text-white animate-pulse" />
            ) : (
              <Mic className="w-20 h-20 md:w-32 md:h-32 text-white group-hover:scale-110 transition-transform duration-500" />
            )}

            {/* Ripple Effect when Listening */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-[ping_2s_ease-out_infinite]"></div>
                <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-[ping_2s_ease-out_infinite_0.5s]"></div>
              </>
            )}
          </button>
        </div>

        {/* Status Text Indicator */}
        <div className="mt-16 h-10 flex items-center justify-center">
          {isProcessing ? (
            <p className="text-indigo-400 font-black tracking-[0.5em] uppercase text-xs md:text-sm animate-pulse">{isAr ? 'جاري معالجة الصوت...' : 'Processing Voice...'}</p>
          ) : isListening ? (
            <p className="text-red-400 font-black tracking-[0.5em] uppercase text-xs md:text-sm animate-pulse">{isAr ? 'أستمع إليك...' : 'Listening...'}</p>
          ) : (
            <p className="text-slate-600 font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">{isAr ? 'اضغط للتحدث' : 'Tap to Speak'}</p>
          )}
        </div>
      </div>
      
      {/* Footer Branding - Bottom */}
      <div className="pb-10 flex gap-8 opacity-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">{isAr ? 'محرك المعلم العصبي' : 'Teacher AI Neural'}</span>
        </div>
        <div className="w-px h-4 bg-white/20"></div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">{isAr ? 'صوت مباشر' : 'Live Audio'}</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceView;
