
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Image as ImageIcon, 
  Sparkles,
  X,
  Scan,
  Globe,
  BrainCircuit
} from 'lucide-react';
import { runChatAgent } from '../services/aiService';
import { ChatMessage } from '../types';

const ChatView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'ocr' | 'thinking' | 'searching'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, phase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const currentImage = selectedImage;
    const currentInput = input;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      image: currentImage || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);

    try {
      if (currentImage) setPhase('ocr');
      else setPhase('thinking');

      const response = await runChatAgent(currentInput, currentImage || undefined);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isAr ? 'عذراً، المحرك واجه خطأ.' : 'System encountered an error.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setPhase('idle');
    }
  };

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] overflow-hidden">
      {/* Messaging Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-10 lg:px-20 py-4 md:py-6 space-y-4 md:space-y-6 scrollbar-none bg-gradient-to-b from-[#0a0a0c] to-black">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-1000">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-indigo-600 blur-[80px] opacity-20 animate-pulse"></div>
                <div className="relative bg-[#111827] border border-white/10 p-8 rounded-[3rem] shadow-2xl">
                  <BrainCircuit className="w-16 h-16 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                {isAr ? 'شات المعلم' : 'Teacher Chat.'}
              </h2>
              <p className="text-slate-500 max-w-xl text-sm md:text-xl font-medium leading-relaxed px-4 opacity-60">
                {isAr ? 'نظام تعليمي متكامل مدعوم بالأنظمة الذكية المتطورة. تحليل صور فوري وبحث استنتاجي.' : 'A unified educational system driven by high-performance AI cores. Featuring instant OCR and deductive research capabilities.'}
              </p>
            </div>
          ) : (
            <div className="w-full space-y-8 pb-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 md:gap-5 w-full max-w-[98%] md:max-w-[90%] ${msg.role === 'user' ? (isAr ? 'flex-row' : 'flex-row-reverse') : (isAr ? 'flex-row-reverse' : 'flex-row')}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border transition-all ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-white/10 text-indigo-400'}`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col gap-3 max-w-full" dir={isArabic(msg.content) ? 'rtl' : 'ltr'}>
                      {msg.image && (
                        <div className="bg-black/40 p-3 rounded-3xl border border-white/5 inline-block shadow-2xl">
                          <img src={msg.image} alt="Upload" className="max-w-xs md:max-w-xl rounded-2xl object-contain max-h-[400px]" />
                        </div>
                      )}
                      {msg.content && (
                        <div className={`p-5 md:p-8 rounded-[2rem] text-sm md:text-xl leading-relaxed shadow-2xl border transition-all ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-400 text-white rounded-tr-none' : 'bg-[#0f172a]/95 backdrop-blur-xl text-slate-100 rounded-tl-none border-white/5'}`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Status Indicators */}
              {phase !== 'idle' && (
                <div className={`flex ${isAr ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-5 items-start ${isAr ? 'flex-row' : 'flex-row'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 shadow-2xl">
                      <Bot className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="bg-[#0f172a]/95 p-6 rounded-[2rem] rounded-tl-none border border-white/5 flex flex-col gap-3 min-w-[200px] shadow-2xl">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isAr ? 'flex-row-reverse' : ''}`}>
                        {phase === 'ocr' && <><Scan className="w-3 h-3 text-emerald-400 animate-spin" /> <span className="text-emerald-400">{isAr ? 'جاري المسح الضوئي الذكي' : 'Intelligent OCR Scanning'}</span></>}
                        {phase === 'thinking' && <><BrainCircuit className="w-3 h-3 text-indigo-400 animate-pulse" /> <span className="text-indigo-400">{isAr ? 'تحليل المحرك الذكي' : 'AI Processing'}</span></>}
                        {phase === 'searching' && <><Globe className="w-3 h-3 text-blue-400 animate-spin" /> <span className="text-blue-400">{isAr ? 'اكتشاف بيانات الويب' : 'Web Context Discovery'}</span></>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Console */}
      <div className="flex-shrink-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-4 pb-6 md:pb-10 px-4 md:px-12 z-40">
        <div className="max-w-4xl mx-auto relative">
          {selectedImage && (
            <div className="absolute bottom-full mb-8 left-0 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="relative group">
                <img src={selectedImage} alt="Preview" className="w-28 h-28 md:w-48 md:h-48 object-cover rounded-[2.5rem] border-4 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)]" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-4 -right-4 bg-red-500 text-white p-3 rounded-full shadow-2xl hover:bg-red-600 transition-all hover:scale-110">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          <div className="relative flex items-center bg-[#0a0a0c]/98 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-2 md:p-3 group transition-all duration-500 hover:border-white/20 focus-within:border-indigo-500/50 focus-within:ring-8 focus-within:ring-indigo-500/5">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className={`p-4 transition-all hover:scale-110 shrink-0 ${selectedImage ? 'text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}
              title="Upload Image"
            >
              <ImageIcon className="w-7 h-7 md:w-8 md:h-8" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isAr ? "اسأل المعلم، أو ارفع صورة لتحليلها..." : "Ask Teacher Chat, or upload an image..."}
              className={`flex-1 bg-transparent py-4 md:py-6 px-4 md:px-8 focus:outline-none text-lg md:text-2xl text-slate-100 placeholder:text-slate-800 font-medium ${isAr ? 'text-right' : 'text-left'}`}
              dir={isAr ? 'rtl' : 'ltr'}
            />
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={handleSend} 
                disabled={(!input.trim() && !selectedImage) || phase !== 'idle'} 
                className="flex items-center gap-4 px-6 md:px-12 py-4 md:py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl transition-all disabled:opacity-30 active:scale-95 shadow-2xl shadow-indigo-600/40 group overflow-hidden relative"
              >
                {phase !== 'idle' ? <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                <span className="hidden md:inline text-xs uppercase tracking-[0.3em] font-black">{isAr ? 'إرسال' : 'Send'}</span>
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 opacity-20 pointer-events-none">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Smart Core v16.0</span>
            </div>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Scan className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Vision Logic Enabled</span>
            </div>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Universal Grounding</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
