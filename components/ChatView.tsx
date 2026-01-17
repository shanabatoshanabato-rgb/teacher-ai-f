
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Image as ImageIcon, 
  Sparkles,
  Mic,
  X
} from 'lucide-react';
import { askTeacher } from '../services/aiService';
import { ChatMessage } from '../types';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
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

    const response = await askTeacher(currentInput || "What's in this image?", currentImage || undefined);
    
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
      
      {/* Messages Scrollable Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-20 py-4 md:py-6 space-y-4 md:space-y-6 scroll-smooth scrollbar-none bg-gradient-to-b from-[#0a0a0c] to-black"
      >
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-1000">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-indigo-600 blur-[40px] opacity-15 animate-pulse"></div>
                <div className="relative bg-[#111827] border border-white/10 p-4 md:p-6 rounded-[2rem] shadow-xl">
                  <Sparkles className="w-6 h-6 md:w-10 md:h-10 text-indigo-500" />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter leading-none">Neural Core.</h2>
              <p className="text-slate-500 max-w-md text-sm md:text-lg font-medium leading-relaxed px-4">
                مرحباً بك. يمكنك إرسال نصوص أو صور لتحليلها.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4 md:space-y-6 pb-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`flex gap-3 md:gap-4 w-full max-w-[98%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg border transition-all ${
                      msg.role === 'user' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-white/10 text-indigo-400'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    <div 
                      className="flex flex-col gap-2 max-w-full"
                      dir={isArabic(msg.content) ? 'rtl' : 'ltr'}
                    >
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Uploaded content" 
                          className="max-w-xs md:max-w-md rounded-2xl border border-white/10 shadow-2xl mb-1 object-cover max-h-[300px]"
                        />
                      )}
                      {msg.content && (
                        <div className={`p-3 md:p-5 rounded-[1rem] md:rounded-[1.25rem] text-sm md:text-base lg:text-lg leading-relaxed shadow-lg border transition-all ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 border-indigo-400 text-white rounded-tr-none' 
                            : 'bg-[#0f172a]/95 backdrop-blur-xl text-slate-100 rounded-tl-none border-white/5'
                        }`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0 text-indigo-400">
                      <Bot className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="bg-[#0f172a]/95 backdrop-blur-xl p-3 md:p-5 rounded-[1rem] md:rounded-[1.25rem] rounded-tl-none border border-white/5 flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Footer */}
      <div className="flex-shrink-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-1 pb-4 md:pb-6 px-4 md:px-10 z-40">
        <div className="max-w-4xl mx-auto relative">
          
          {/* Image Preview Above Input */}
          {selectedImage && (
            <div className="absolute bottom-full mb-4 left-0 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="relative group">
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-2xl border-2 border-indigo-500 shadow-2xl" 
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="relative flex items-center bg-[#0a0a0c]/98 border border-white/10 rounded-xl md:rounded-2xl shadow-xl p-1 md:p-1.5 group transition-all duration-300 hover:border-white/20">
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 md:p-3 transition-all hover:scale-110 shrink-0 ${selectedImage ? 'text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}
            >
              <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isArabic(input) ? "اسأل تيتشر AI أو اشرح الصورة..." : "Ask Teacher AI or explain the image..."}
              className={`
                flex-1 bg-transparent py-2.5 md:py-3.5 px-3 md:px-5
                focus:outline-none transition-all text-sm md:text-base lg:text-lg text-slate-100 placeholder:text-slate-800
                ${isArabic(input) ? 'text-right' : 'text-left'}
              `}
              dir={isArabic(input) ? 'rtl' : 'ltr'}
            />

            <div className="flex items-center gap-1 md:gap-2 pr-1 md:pr-2">
              <button className="hidden sm:block p-2 text-slate-600 hover:text-indigo-400 transition-all">
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isTyping}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg md:rounded-xl transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-indigo-600/30"
              >
                {isTyping ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
                <span className="hidden md:inline text-[10px] md:text-xs uppercase tracking-widest font-black">إرسال</span>
              </button>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[7px] font-black text-slate-800 uppercase tracking-[0.6em]">Vision Engine Active | v4.3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
