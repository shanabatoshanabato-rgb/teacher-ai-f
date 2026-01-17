
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Image as ImageIcon, 
  Sparkles,
  X
} from 'lucide-react';
import { askTeacher } from '../services/aiService';
import { ChatMessage } from '../types';

const ChatView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

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
    setIsTyping(true);

    const response = await askTeacher(currentInput || (isAr ? "ماذا يوجد في هذه الصورة؟" : "What is in this image?"), currentImage || undefined);
    
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-20 py-4 md:py-6 space-y-4 md:space-y-6 scrollbar-none bg-gradient-to-b from-[#0a0a0c] to-black">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-1000">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-600 blur-[60px] opacity-20 animate-pulse"></div>
                <div className="relative bg-[#111827] border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
                  <Sparkles className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter leading-none">{isAr ? 'محرك Puter الذكي.' : 'Puter Core.'}</h2>
              <p className="text-slate-500 max-w-md text-base md:text-xl font-medium leading-relaxed px-4">{isAr ? 'مرحباً بك في تيتشر AI. النظام يعمل الآن بمحرك Puter الأساسي للذكاء الاصطناعي.' : 'Welcome to Teacher AI. System is powered by Puter AI core engine.'}</p>
            </div>
          ) : (
            <div className="w-full space-y-6 pb-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-4 w-full max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? (isAr ? 'flex-row' : 'flex-row-reverse') : (isAr ? 'flex-row-reverse' : 'flex-row')}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border transition-all ${msg.role === 'user' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-white/10 text-blue-400'}`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col gap-2 max-w-full" dir={isArabic(msg.content) ? 'rtl' : 'ltr'}>
                      {msg.image && (
                        <div className="bg-black/40 p-2 rounded-2xl border border-white/5 inline-block">
                          <img src={msg.image} alt="Upload" className="max-w-xs md:max-w-md rounded-xl shadow-2xl object-contain max-h-[300px]" />
                        </div>
                      )}
                      {msg.content && (
                        <div className={`p-4 md:p-6 rounded-[1.5rem] text-sm md:text-lg leading-relaxed shadow-2xl border transition-all ${msg.role === 'user' ? 'bg-blue-600 border-blue-400 text-white rounded-tr-none' : 'bg-[#0f172a]/95 backdrop-blur-xl text-slate-100 rounded-tl-none border-white/5'}`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className={`flex ${isAr ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-4 ${isAr ? 'flex-row' : 'flex-row'}`}>
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-[#0f172a]/95 p-5 rounded-[1.5rem] rounded-tl-none border border-white/5 flex gap-2 items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-2 pb-6 px-4 md:px-10 z-40">
        <div className="max-w-4xl mx-auto relative">
          {selectedImage && (
            <div className="absolute bottom-full mb-6 left-0 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="relative group">
                <img src={selectedImage} alt="Preview" className="w-24 h-24 md:w-40 md:h-40 object-cover rounded-[2rem] border-4 border-blue-500 shadow-2xl" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-2xl hover:bg-red-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="relative flex items-center bg-[#0a0a0c]/98 border border-white/10 rounded-[2rem] shadow-2xl p-1.5 md:p-2 group transition-all duration-300 hover:border-white/20">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()} className={`p-3 md:p-4 transition-all hover:scale-110 shrink-0 ${selectedImage ? 'text-blue-400' : 'text-slate-600 hover:text-blue-400'}`}>
              <ImageIcon className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isAr ? "اسأل تيتشر AI أو اشرح الصورة..." : "Ask Teacher AI or explain the image..."}
              className={`flex-1 bg-transparent py-4 md:py-5 px-4 md:px-6 focus:outline-none text-base md:text-xl text-slate-100 placeholder:text-slate-800 ${isAr ? 'text-right' : 'text-left'}`}
              dir={isAr ? 'rtl' : 'ltr'}
            />
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
              <button onClick={handleSend} disabled={(!input.trim() && !selectedImage) || isTyping} className="flex items-center gap-3 px-6 md:px-10 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all disabled:opacity-30 active:scale-95 shadow-xl shadow-blue-600/30">
                {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] font-black">{isAr ? 'إرسال' : 'Send'}</span>
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-[8px] font-black text-slate-800 uppercase tracking-[0.6em]">Core: Puter AI | Specialized: Groq & OpenAI</p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
