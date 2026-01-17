
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles, User, Bot, VolumeX, Ghost } from 'lucide-react';
import { askVoiceTeacher, generateSpeech } from '../services/aiService';

const VoiceView: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceOnly, setIsVoiceOnly] = useState(false); // STS Mode Toggle
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voice, setVoice] = useState<'Adam' | 'Sara'>('Adam');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
        setTranscript(text);
        handleVoiceInput(text);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setAiResponse('');
      setAudioUrl(null);
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
      setAiResponse(response);
      
      const url = await generateSpeech(response, voice);
      if (url) setAudioUrl(url);
    } catch (error) {
      console.error("Voice processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col items-center justify-center p-8 relative">
      
      {/* Voice Controls */}
      <div className="absolute top-10 right-0 left-0 flex justify-center gap-4">
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <button onClick={() => setVoice('Adam')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${voice === 'Adam' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ADAM</button>
          <button onClick={() => setVoice('Sara')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${voice === 'Sara' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>SARA</button>
        </div>
        
        <button 
          onClick={() => setIsVoiceOnly(!isVoiceOnly)} 
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all text-[10px] font-black tracking-widest ${isVoiceOnly ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
        >
          {isVoiceOnly ? <Ghost className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isAr ? (isVoiceOnly ? 'وضع التحدث المباشر' : 'عرض النص') : (isVoiceOnly ? 'STS MODE' : 'SHOW TEXT')}
        </button>
      </div>

      {/* Neural Core Visualizer */}
      <div className="relative mb-20 group">
        <div className={`absolute inset-0 bg-blue-600 blur-[120px] opacity-20 transition-all duration-1000 ${isListening || isProcessing ? 'scale-150 opacity-40' : 'scale-100'}`}></div>
        
        <button 
          onClick={toggleListening}
          disabled={isProcessing}
          className={`
            relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
            ${isListening 
              ? 'bg-red-500 scale-110 shadow-red-500/40' 
              : isProcessing 
                ? 'bg-slate-900 border-2 border-blue-500/50' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/40'
            }
          `}
        >
          {isProcessing ? (
            <div className="relative">
              <Loader2 className="w-20 h-20 text-blue-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-300 animate-pulse" />
              </div>
            </div>
          ) : isListening ? (
            <MicOff className="w-20 h-20 text-white animate-pulse" />
          ) : (
            <Mic className="w-20 h-20 text-white group-hover:scale-110 transition-transform" />
          )}

          {isListening && (
            <div className="absolute inset-0 rounded-full border-8 border-red-500/20 animate-ping"></div>
          )}
        </button>
      </div>

      {/* Communication Feed */}
      {!isVoiceOnly && (
        <div className="w-full space-y-6 text-center max-w-2xl">
          {transcript && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] animate-in fade-in slide-in-from-bottom-2">
              <p className="text-slate-400 font-medium italic" dir="auto">"{transcript}"</p>
            </div>
          )}

          {aiResponse && (
            <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4">
              <p className="text-white text-xl font-bold leading-relaxed" dir="auto">{aiResponse}</p>
              {audioUrl && (
                <div className="mt-4 flex items-center justify-center gap-2 text-blue-400">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'المعلم يتحدث...' : 'Teacher is speaking...'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isVoiceOnly && isProcessing && (
        <div className="mt-10 text-center animate-pulse">
          <p className="text-blue-500 font-black tracking-[0.5em] uppercase text-xs">Processing Voice Link...</p>
        </div>
      )}

      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" onEnded={() => setAudioUrl(null)} />}
      
      <div className="mt-12 flex gap-10 opacity-30">
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Neural STS</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Volume2 className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">ElevenLabs Core</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceView;
