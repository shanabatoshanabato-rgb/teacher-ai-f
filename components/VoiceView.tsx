
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles, User, Bot, VolumeX } from 'lucide-react';
import { askVoiceTeacher, generateSpeech } from '../services/aiService';

const VoiceView: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voice, setVoice] = useState<'Adam' | 'Sara'>('Adam');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use Web Speech API for STT
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; 

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceInput(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };
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
      recognitionRef.current.lang = /[\u0600-\u06FF]/.test(transcript) ? 'ar-SA' : 'en-US';
      recognitionRef.current?.start();
    }
  };

  const handleVoiceInput = async (text: string) => {
    setIsProcessing(true);
    try {
      // Use the advanced voice-optimized orchestrator
      const response = await askVoiceTeacher(text);
      setAiResponse(response);
      
      // Generate TTS with ElevenLabs
      const url = await generateSpeech(response, voice);
      if (url) {
        setAudioUrl(url);
      }
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col items-center justify-center p-8">
      {/* Voice Selection */}
      <div className="absolute top-32 right-10 flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
        <button 
          onClick={() => setVoice('Adam')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${voice === 'Adam' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
        >
          ADAM (M)
        </button>
        <button 
          onClick={() => setVoice('Sara')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${voice === 'Sara' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
        >
          SARA (F)
        </button>
      </div>

      {/* Main Visualizer */}
      <div className="relative mb-20">
        <div className={`absolute inset-0 bg-indigo-600 blur-[100px] opacity-20 transition-all duration-1000 ${isListening ? 'scale-150' : 'scale-100'}`}></div>
        
        <button 
          onClick={toggleListening}
          disabled={isProcessing}
          className={`
            relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
            ${isListening 
              ? 'bg-red-500 scale-110 shadow-red-500/40 ring-8 ring-red-500/10' 
              : isProcessing 
                ? 'bg-slate-800' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/40 ring-8 ring-indigo-500/10'
            }
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-16 h-16 text-white" />
          ) : (
            <Mic className="w-16 h-16 text-white" />
          )}

          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-10 [animation-delay:0.5s]"></div>
            </>
          )}
        </button>
      </div>

      {/* Interaction Feedback */}
      <div className="w-full space-y-8 text-center max-w-2xl">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
            {isListening ? 'Listening to your voice...' : isProcessing ? 'Teacher AI is reasoning...' : 'Tap to start conversation'}
          </p>
          
          {transcript && (
            <div className="flex items-center justify-center gap-4 bg-white/5 border border-white/5 p-6 rounded-[2rem] animate-in fade-in slide-in-from-bottom-2">
              <User className="w-5 h-5 text-slate-500 shrink-0" />
              <p className="text-slate-300 font-medium leading-relaxed italic" dir="auto">"{transcript}"</p>
            </div>
          )}

          {aiResponse && (
            <div className="flex items-center justify-center gap-4 bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4">
              <Bot className="w-6 h-6 text-indigo-400 shrink-0" />
              <div className="space-y-3">
                <p className="text-white text-lg font-bold leading-relaxed" dir="auto">{aiResponse}</p>
                {audioUrl && (
                  <div className="flex items-center justify-center gap-2 text-indigo-400">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Speaking...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" onEnded={() => setAudioUrl(null)} />}

      {!transcript && !aiResponse && !isListening && (
        <div className="mt-12 flex gap-8">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Volume2 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Neural Audio</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Reasoning</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-40">
            <VolumeX className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Clear Voice</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceView;
