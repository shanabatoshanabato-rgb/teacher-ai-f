
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Loader2, BookOpen, Sparkles, Brain, X, Headphones, Info, Layers, Zap, ShieldCheck, Search, ChevronRight, PlayCircle, Languages, GraduationCap, WifiOff, Globe, CheckCircle2, HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { runPuterAgent, puterVoice } from '../services/puterCore';

type SessionPhase = 'config' | 'loading' | 'active' | 'quiz';

const TeacherUAEView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [phase, setPhase] = useState<SessionPhase>('config');
  const [sessionLang, setSessionLang] = useState<'ar' | 'en'>(isAr ? 'ar' : 'en');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // تتبع حالة الحوار التعليمي
  const [interactionState, setInteractionState] = useState<'explaining' | 'waiting_for_feedback' | 'quiz_mode'>('explaining');

  const recognitionRef = useRef<any>(null);

  const grades = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // تم إضافة مادة العلوم هنا
  const subjectsList = sessionLang === 'ar' 
    ? ['اللغة العربية', 'التربية الإسلامية', 'العلوم', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'الدراسات الاجتماعية', 'علوم الحاسوب']
    : ['Arabic', 'Islamic Education', 'Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'Computer Science'];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        if (event.results[event.results.length - 1].isFinal) {
          const result = event.results[event.results.length - 1][0].transcript;
          processInteraction(result);
        }
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setErrorStatus(null);
        setTranscript('');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (e: any) => {
        setIsListening(false);
        if (e.error === 'no-speech') {
          console.warn("UAE Teacher AI: Silence detected.");
        } else if (e.error === 'network') {
          setErrorStatus(sessionLang === 'ar' ? "فشل الاتصال: تأكد من الإنترنت" : "Connection Failed: Check Internet");
        } else {
          console.error("UAE Teacher AI Voice Error:", e.error);
        }
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [lessonContent, sessionLang, interactionState]);

  const handleFetchLesson = async () => {
    if (!grade || !subject || !chapter) return;
    setIsProcessing(true);
    setPhase('loading');
    
    const query = sessionLang === 'ar' 
      ? `قم بالدخول إلى منهاج الإمارات وجلب محتوى درس "${chapter}" مادة "${subject}" صف "${grade}". 
         ابدأ بالترحيب الحار بالطالب بلقب "بطل الإمارات". قدم ملخصاً استباقياً ذكياً للدرس. 
         قاعدة ذهبية: ممنوع استخدام أي كلمات إنجليزية في الرد، حتى رموز الرياضيات والأسس اشرحها بالعربية (مثل: ثلاثة أس اثنين بدل 3^2).
         في نهاية ردك، اسأل الطالب دائماً: "هل فهمت هذه النقاط الأساسية يا بطل؟"`
      : `Access UAE curriculum and fetch "${chapter}" in "${subject}", Grade "${grade}". 
         Welcome the student as "UAE Hero". Provide a smart summary. 
         End by asking: "Did you understand these key points, hero?"`;

    try {
      const res = await runPuterAgent(query, undefined, undefined, sessionLang, true, 
        sessionLang === 'ar' 
          ? "أنت 'المعلم الإماراتي الذكي'. تخصصك منهاج الإمارات. لغتك هي العربية الفصحى الصافية. ممنوع الإنجليزية نهائياً حتى في الرموز. بعد كل شرح اسأل عن الفهم."
          : "You are 'Smart UAE Tutor'. After every explanation, verify understanding.");
      
      setLessonContent(res.text);
      setAiResponse(res.text);
      setInteractionState('waiting_for_feedback');
      setPhase('active');
      setSessionActive(true);
      
      await puterVoice(res.text);
    } catch (e) {
      console.error(e);
      setAiResponse(sessionLang === 'ar' ? "عذراً، فشل جلب البيانات الرسمية للمنهاج." : "Failed to fetch official lesson data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processInteraction = async (userSpeech: string) => {
    if (!userSpeech.trim()) return;
    setIsProcessing(true);
    
    let promptPrefix = "";
    let systemInstruction = `
      ROLE: UAE Official Curriculum Tutor.
      SESSION CONTEXT: Grade ${grade}, Subject ${subject}, Topic ${chapter}.
      ACCESSED CONTENT: ${lessonContent}.
      STRICT LANGUAGE RULE: If language is Arabic, NEVER use English words or symbols in the text to ensure pure Arabic speech output. 
      STRICT FLOW RULE:
      1. If the user didn't understand (e.g., "ما فهمت", "أعد الشرح", "no"): Re-explain using simpler analogies, stories, or basic examples. End with "هل هذا أوضح الآن؟".
      2. If the user understood (e.g., "فهمت", "واضح", "yes"): Congratulate them as a hero and ask: "هل تود أن أختبر معلوماتك بسؤال سريع؟".
      3. If the user agrees to a quiz (e.g., "نعم", "موافق", "اختبرني"): Ask a specific multiple-choice or short answer question about the lesson. Give motivating feedback:
         - Correct: "بطل! إجابة مذهلة."
         - Incorrect: "مش مشكلة، كلنا بنغلط ونتعلم. الإجابة الصحيحة هي... لأن..."
    `;

    try {
      const res = await runPuterAgent(userSpeech, undefined, undefined, sessionLang, false, systemInstruction);
      setAiResponse(res.text);
      await puterVoice(res.text);
      
      const text = res.text.toLowerCase();
      if (text.includes("اختبر") || text.includes("سؤال")) {
        setInteractionState('quiz_mode');
      } else if (text.includes("فهمت") || text.includes("واضح")) {
        setInteractionState('waiting_for_feedback');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorStatus(null);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      
      if (recognitionRef.current) {
        recognitionRef.current.lang = sessionLang === 'ar' ? 'ar-SA' : 'en-US';
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Mic start failed", e);
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 100);
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-1000">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-6 bg-emerald-600/10 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl relative group">
           <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors animate-pulse"></div>
           <ShieldCheck className="w-16 h-16 text-emerald-400 relative z-10" />
        </div>
        <div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-tight">Teacher AI UAE.</h1>
          <p className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">
            {sessionLang === 'ar' ? 'منهاج وزارة التربية والتعليم • سراج' : 'UAE MINISTRY CURRICULUM • SERAJ'}
          </p>
        </div>
      </div>

      {!sessionActive ? (
        <div className="bg-[#111827]/60 border border-white/10 rounded-[3.5rem] p-10 md:p-16 shadow-2xl space-y-12 backdrop-blur-3xl relative overflow-hidden">
          <div className="flex flex-col items-center gap-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <Globe className="w-3 h-3" />
                {sessionLang === 'ar' ? 'لغة الجلسة التعليمية' : 'SESSION LANGUAGE'}
             </label>
             <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex gap-1">
                <button onClick={() => setSessionLang('ar')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sessionLang === 'ar' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>العربية</button>
                <button onClick={() => setSessionLang('en')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sessionLang === 'en' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>English</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-4 flex items-center gap-2">
                <Layers className="w-3 h-3" />
                {sessionLang === 'ar' ? 'اختر الصف الدراسي' : 'CHOOSE GRADE'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {grades.map(g => (
                  <button key={g} onClick={() => setGrade(g)} className={`p-4 rounded-2xl border transition-all font-black text-sm ${grade === g ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-4 flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                {sessionLang === 'ar' ? 'اختر المادة العلمية' : 'SELECT SUBJECT'}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {subjectsList.map(s => (
                  <button key={s} onClick={() => setSubject(s)} className={`p-4 rounded-2xl border text-right transition-all font-bold text-sm ${subject === s ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-black/40 border-white/5 text-slate-400 hover:text-white'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-4 flex items-center gap-2">
              <Search className="w-3 h-3" />
              {sessionLang === 'ar' ? 'عنوان الوحدة أو موضوع الدرس' : 'CHAPTER TITLE / TOPIC'}
            </label>
            <input type="text" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder={sessionLang === 'ar' ? "مثال: القوى والحركة" : "e.g. Force and Motion"} className={`w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 text-2xl text-white outline-none focus:border-emerald-500 transition-all ${sessionLang === 'ar' ? 'text-right' : 'text-left'}`} dir={sessionLang === 'ar' ? 'rtl' : 'ltr'} />
          </div>

          <button onClick={handleFetchLesson} disabled={!grade || !subject || !chapter || isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white font-black py-10 rounded-[3rem] text-3xl uppercase shadow-2xl flex items-center justify-center gap-4 transition-transform active:scale-95">
            {isProcessing ? <Loader2 className="w-10 h-10 animate-spin" /> : <Zap className="w-10 h-10 fill-current" />}
            {sessionLang === 'ar' ? 'ربط المنهاج وبدء الشرح الاستباقي' : 'SYNC & START PROACTIVE TEACHING'}
          </button>
        </div>
      ) : (
        <div className="bg-[#050505] border border-white/10 rounded-[4rem] p-12 shadow-2xl min-h-[850px] flex flex-col relative overflow-hidden backdrop-blur-xl">
           {errorStatus && (
             <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 px-8 py-4 rounded-full flex items-center gap-3 animate-bounce">
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-black text-xs uppercase tracking-widest">{errorStatus}</span>
             </div>
           )}

           <div className="absolute top-10 left-10 flex items-center gap-4">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                {interactionState === 'quiz_mode' ? (sessionLang === 'ar' ? 'وضع الاختبار النشط' : 'QUIZ MODE ACTIVE') : (sessionLang === 'ar' ? 'جلسة شرح المنهاج' : 'MINISTRY LESSON SESSION')}
              </span>
           </div>
           
           <button onClick={() => setSessionActive(false)} className="absolute top-10 right-10 p-5 bg-white/5 rounded-[1.5rem] text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>

           <div className="flex-1 flex flex-col items-center justify-between w-full pt-20 pb-8">
              <div className="flex flex-col items-center gap-8">
                 <div className={`w-56 h-56 md:w-72 md:h-72 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${isListening ? 'border-red-500 bg-red-500/5 scale-110 shadow-lg' : isProcessing ? 'border-emerald-500 bg-emerald-500/5 animate-pulse' : 'border-white/10 bg-white/5 shadow-inner'}`}>
                    {interactionState === 'quiz_mode' ? <GraduationCap className="w-24 h-24 md:w-32 md:h-32 text-indigo-400" /> : <Headphones className={`w-24 h-24 md:w-32 md:h-32 transition-colors ${isListening ? 'text-red-500' : 'text-emerald-400'}`} />}
                 </div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-center">
                   {isProcessing ? (sessionLang === 'ar' ? 'جاري التحليل والربط...' : 'ANALYZING...') : isListening ? (sessionLang === 'ar' ? 'تفضل بطلنا، أنا أسمعك' : 'GO AHEAD HERO, I AM LISTENING') : (sessionLang === 'ar' ? `ندرس الآن: ${chapter}` : `Learning: ${chapter}`)}
                 </h2>
              </div>

              <div className="w-full max-w-4xl space-y-8">
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 min-h-[120px] flex items-center justify-center shadow-inner relative group">
                    <p className={`text-slate-400 text-2xl font-medium italic text-center ${sessionLang === 'ar' ? 'text-right w-full font-arabic' : ''}`} dir={sessionLang === 'ar' ? 'rtl' : 'ltr'}>
                       {transcript || (sessionLang === 'ar' ? "تحدث لإخباري بمدى فهمك أو للإجابة على السؤال..." : "Talk to tell me your feedback or answer...")}
                    </p>
                 </div>

                 {aiResponse && !isListening && (
                   <div className="bg-emerald-600/10 border border-emerald-500/20 p-12 rounded-[3.5rem] space-y-8 animate-in slide-in-from-bottom-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10"><Brain className="w-24 h-24 text-emerald-400" /></div>
                      <div className="flex items-start gap-8">
                        <div className={`p-5 rounded-2xl shrink-0 ${interactionState === 'quiz_mode' ? 'bg-indigo-600/20' : 'bg-emerald-600/20'}`}>
                          {interactionState === 'quiz_mode' ? <HelpCircle className="w-10 h-10 text-indigo-400" /> : <ShieldCheck className="w-10 h-10 text-emerald-400" />}
                        </div>
                        <div className={`text-emerald-100 font-medium text-2xl md:text-3xl leading-relaxed prose prose-emerald prose-invert max-w-none ${sessionLang === 'ar' ? 'text-right w-full font-arabic' : 'text-left'}`} dir={sessionLang === 'ar' ? 'rtl' : 'ltr'}>
                           <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{aiResponse}</ReactMarkdown>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-4 mt-6">
                        <div className="flex items-center gap-2 px-6 py-3 bg-black/30 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                          {sessionLang === 'ar' ? 'دقة المنهاج 100%' : 'CURRICULUM ACCURACY 100%'}
                        </div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="w-full flex flex-col items-center gap-8 pt-12">
                <button onClick={toggleMic} disabled={isProcessing} className={`w-36 h-36 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 z-50 ${isListening ? 'bg-red-500 shadow-red-500/40 rotate-12' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40'}`}>
                  {isListening ? <MicOff className="w-16 h-16 text-white" /> : <Mic className="w-16 h-16 text-white" />}
                </button>
                <span className="text-sm font-black text-slate-500 uppercase tracking-[0.5em]">{isListening ? (sessionLang === 'ar' ? 'الميكروفون نشط' : 'MIC ACTIVE') : (sessionLang === 'ar' ? 'انقر للمناقشة الصوتية مع المعلم' : 'TAP TO TALK TO TEACHER')}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherUAEView;
