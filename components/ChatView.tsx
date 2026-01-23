
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Bot, Loader2, Image as ImageIcon, X, 
  BrainCircuit, MessageSquare, Plus, Trash2, Edit3, 
  ChevronLeft, ChevronRight, Check, Search, Settings2, MoreHorizontal, LayoutPanelLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { runPuterAgent } from '../services/puterCore';
import { ChatMessage, ChatSession } from '../types';

const ChatView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  
  // States for session management
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('teacher_ai_chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem('teacher_ai_chat_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed[0].id : null;
    }
    return null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Input states
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem('teacher_ai_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [sessions, activeSessionId, isProcessing]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const messages = activeSession ? activeSession.messages : [];

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: isAr ? 'محادثة جديدة' : 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveTitle = (id: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, title: editTitle } : s));
    setEditingSessionId(null);
  };

  const deleteMessage = (msgId: string) => {
    if (!activeSessionId) return;
    setSessions(sessions.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: s.messages.filter(m => m.id !== msgId) };
      }
      return s;
    }));
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.slice(0, 30) || (isAr ? 'محادثة جديدة' : 'New Chat'),
        messages: [],
        timestamp: Date.now(),
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
      currentSessionId = newSession.id;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? input.slice(0, 30) : s.title }
        : s
    ));

    const currentInput = input;
    const currentImg = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsProcessing(true);

    try {
      const response = await runPuterAgent(currentInput, currentImg || undefined, undefined, 'ar', true);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
      };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: isAr ? "⚠️ عذراً، فشل المحرك الشامل في الاستجابة." : "⚠️ Master Core failed to respond.",
        timestamp: Date.now(),
      };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#050507] overflow-hidden relative">
      
      {/* Sidebar - Smooth Reveal */}
      <aside 
        className={`sidebar-transition relative z-40 flex flex-col bg-[#0a0a0c] border-x border-white/5 shadow-2xl overflow-visible ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'}`}
      >
        <div className="flex flex-col h-full w-80">
          {/* New Chat Header */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <button 
              onClick={createNewChat}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 group overflow-hidden relative"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isAr ? 'محادثة جديدة' : 'NEW CONVERSATION'}</span>
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
            {sessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between overflow-hidden ${activeSessionId === session.id ? 'bg-indigo-600/15 border-indigo-500/40' : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <MessageSquare size={14} className={activeSessionId === session.id ? 'text-indigo-400' : 'text-slate-600'} />
                  {editingSessionId === session.id ? (
                    <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => saveTitle(session.id)} onKeyDown={(e) => e.key === 'Enter' && saveTitle(session.id)} className="bg-transparent text-white outline-none border-b border-indigo-500 text-xs flex-1 py-1" />
                  ) : (
                    <span className={`text-[11px] font-bold truncate ${activeSessionId === session.id ? 'text-white' : 'text-slate-500'}`}>
                      {session.title}
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-1 transition-all ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button onClick={(e) => startEditing(session, e)} className="p-2 hover:text-indigo-400 text-slate-600 transition-colors rounded-lg"><Edit3 size={12} /></button>
                  <button onClick={(e) => deleteSession(session.id, e)} className="p-2 hover:text-red-500 text-slate-600 transition-colors rounded-lg"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-white/5 bg-white/[0.01]">
             <div className="flex items-center gap-3 opacity-30">
                <Settings2 size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest">{isAr ? 'مركز التحكم الشامل' : 'MASTER CONTROL CENTER'}</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Floating Toggle "Handle" - الموضع الجديد المحسن */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-2.5 bg-[#111827] border border-white/10 text-indigo-400 hover:text-white transition-all shadow-2xl hover:bg-indigo-600/20 sidebar-handle ${isSidebarOpen ? (isAr ? 'right-[320px] rounded-r-xl' : 'left-[320px] rounded-l-xl') : (isAr ? 'right-0 rounded-l-xl' : 'left-0 rounded-r-xl')}`}
      >
        {isAr ? (isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />) : (isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-32 xl:px-64 py-12 space-y-10 scrollbar-none">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-12">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-10 animate-pulse"></div>
                <div className="relative p-8 bg-indigo-600/10 rounded-[3rem] border border-indigo-500/20 shadow-2xl">
                   <BrainCircuit className="w-16 h-16 text-indigo-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{isAr ? 'المعلم الشامل' : 'Master Tutor.'}</h2>
                <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed max-w-md mx-auto">{isAr ? 'نظام تعليمي متطور يعتمد على أحدث تقنيات المعرفة والذكاء الشامل.' : 'Advanced educational system built for deep logical reasoning and master synthesis.'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                 {[
                   { t: "اشرح لي نظرية فيثاغورس", e: "Explain Pythagoras" },
                   { t: "تاريخ دولة الإمارات", e: "History of UAE" },
                   { t: "حل معادلة رياضية", e: "Solve Equation" },
                   { t: "قواعد اللغة الإنجليزية", e: "Grammar Basics" }
                 ].map((item, i) => (
                   <button key={i} onClick={() => setInput(item.t)} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] text-[11px] font-black uppercase text-slate-400 hover:border-indigo-500/40 hover:text-white hover:bg-white/[0.05] transition-all text-center">
                      {isAr ? item.t : item.e}
                   </button>
                 ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                <div className={`flex gap-6 max-w-[85%] relative ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <button onClick={() => deleteMessage(msg.id)} className={`absolute -top-3 ${msg.role === 'user' ? '-left-10' : '-right-10'} p-3 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                    <Trash2 size={16} />
                  </button>

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-2xl ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-400' : 'bg-[#0a0a0c] border-white/10 text-indigo-400'}`}>
                    {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={24} />}
                  </div>

                  <div className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.image && <img src={msg.image} className="max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl" alt="Attachment" />}
                    <div className={`px-8 py-6 rounded-[2.5rem] border prose prose-invert max-w-none shadow-2xl text-lg md:text-xl leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600/15 border-indigo-500/30' : 'bg-[#0a0a0c] border-white/5'}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start animate-in fade-in duration-500">
              <div className="bg-[#0a0a0c] border border-white/5 px-8 py-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{isAr ? 'جاري التحليل الشامل...' : 'CONSULTING MASTER CORE...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Improved Input Bar */}
        <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/5">
          <div className="max-w-5xl mx-auto relative">
            {selectedImage && (
              <div className="absolute bottom-[calc(100%+20px)] left-0 animate-in slide-in-from-bottom-2">
                <div className="relative group">
                  <img src={selectedImage} className="w-32 h-32 object-cover rounded-3xl border-2 border-indigo-500 shadow-2xl" alt="Preview" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl hover:scale-110"><X size={14} /></button>
                </div>
              </div>
            )}
            
            <div className="flex items-center bg-[#0a0a0c] border border-white/10 rounded-[3rem] p-3 shadow-2xl transition-all focus-within:border-indigo-500/50 group">
              <button onClick={() => fileInputRef.current?.click()} className="p-5 text-slate-600 hover:text-indigo-400 transition-colors rounded-full"><ImageIcon size={24} /></button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader();
                  r.onloadend = () => setSelectedImage(r.result as string);
                  r.readAsDataURL(f);
                }
              }} />
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isAr ? "اكتب سؤالك هنا للمحرك الشامل..." : "Type your question for the Master Core..."} className={`flex-1 bg-transparent py-5 px-6 text-white outline-none placeholder:text-slate-800 text-xl md:text-2xl ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'} />
              <button onClick={handleSend} disabled={isProcessing || (!input.trim() && !selectedImage)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-5 rounded-[2.5rem] disabled:opacity-20 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 group/btn">
                <Send size={24} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="mt-4 flex justify-center opacity-20">
               <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">
                  {isAr ? 'مدعوم بنظام الذكاء المنطقي الشامل' : 'POWERED BY MASTER LOGIC EMULATOR'}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
