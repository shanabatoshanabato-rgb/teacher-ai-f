
import React, { useState, useRef } from 'react';
import { 
  Calculator, Atom, Beaker, Dna, Scroll, Languages, BookOpen, Image as ImageIcon,
  Sparkles, Loader2, Smile, GraduationCap, Zap, ArrowRight, X, ScanSearch
} from 'lucide-react';
import { askTeacher } from '../services/aiService';

const HomeworkView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  const [subject, setSubject] = useState('math');
  const [style, setStyle] = useState('tutorFriendly');
  const [question, setQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = isAr ? [
    { id: 'math', label: 'رياضيات', icon: Calculator },
    { id: 'physics', label: 'فيزياء', icon: Atom },
    { id: 'chemistry', label: 'كيمياء', icon: Beaker },
    { id: 'science', label: 'علوم', icon: Dna },
    { id: 'history', label: 'تاريخ', icon: Scroll },
    { id: 'arabic', label: 'لغة عربية', icon: Languages },
    { id: 'english', label: 'لغة إنجليزية', icon: BookOpen },
  ] : [
    { id: 'math', label: 'math', icon: Calculator },
    { id: 'physics', label: 'physics', icon: Atom },
    { id: 'chemistry', label: 'chemistry', icon: Beaker },
    { id: 'science', label: 'science', icon: Dna },
    { id: 'history', label: 'history', icon: Scroll },
    { id: 'arabic', label: 'arabic', icon: Languages },
    { id: 'english', label: 'english', icon: BookOpen },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!question.trim() && !selectedImage) return;
    setLoading(true);
    setSolution(null);
    
    const stylePrompt = style === 'tutorFriendly' ? "Explain as a friendly tutor." : style === 'tutorStrict' ? "Be very precise and strict about logic." : "Provide the most advanced explanation.";
    const subjectPrompt = `Subject: ${subject}. Solve step-by-step.`;
    
    const res = await askTeacher(
      question || (isAr ? "قم بحل هذه المسألة الموجودة في الصورة." : "Solve this problem from the image."),
      selectedImage || undefined,
      `You are a Teacher AI Homework Expert. ${subjectPrompt} Style: ${stylePrompt}`
    );
    
    setSolution(res);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">{isAr ? 'الواجبات' : 'Homework'}</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-blue-500/50"></div>
          <p className="text-blue-500 text-sm md:text-xl font-black uppercase tracking-[0.4em]">{isAr ? 'مساعد الحل بالذكاء الاصطناعي' : 'OCR Vision Solver'}</p>
          <div className="h-px w-12 bg-blue-500/50"></div>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-start ${isAr ? 'rtl' : 'ltr'}`}>
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#111827]/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ${isAr ? 'text-right' : ''}`}>{isAr ? 'المادة الدراسية' : 'SUBJECT'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((s) => {
                const Icon = s.icon;
                const isActive = subject === s.id;
                return (
                  <button key={s.id} onClick={() => setSubject(s.id)} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${isActive ? 'bg-blue-600/20 border-blue-500 shadow-xl text-blue-400' : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#111827]/60 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative">
            <div className="relative group">
              {selectedImage && (
                <div className="absolute top-0 right-0 z-20 animate-in zoom-in-95 duration-300 transform rotate-2">
                  <div className="relative">
                    <img src={selectedImage} alt="OCR Preview" className="w-48 h-48 object-contain rounded-3xl border-4 border-blue-600 shadow-2xl bg-black" />
                    <div className="absolute -bottom-3 -left-3 bg-blue-600 p-2 rounded-xl text-white shadow-xl">
                      <ScanSearch className="w-5 h-5" />
                    </div>
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-4 -right-4 bg-red-500 text-white p-2.5 rounded-full shadow-2xl hover:bg-red-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={isAr ? "اكتب سؤالك هنا، أو ارفع صورة للمسألة ليقوم المعلم باستخراج النص وحله..." : "Type your question, or upload a photo for Teacher AI to OCR and solve..."}
                className={`w-full min-h-[350px] bg-black/40 border border-white/5 rounded-[2rem] p-8 md:p-12 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xl md:text-3xl leading-relaxed text-slate-100 placeholder:text-slate-800 resize-none transition-all ${isAr ? 'text-right' : 'text-left'}`}
                dir={isAr ? 'rtl' : 'ltr'}
              />
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center z-30 gap-6">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                  <span className="text-blue-400 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">{isAr ? 'جاري تحليل الصورة والبيانات...' : 'Neural OCR & Solving...'}</span>
                </div>
              )}
            </div>

            <div className={`flex flex-col sm:flex-row gap-5 mt-8 ${isAr ? 'flex-row-reverse' : ''}`}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-8 py-5 bg-black/60 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-all">
                <ImageIcon className="w-5 h-5" />
                {isAr ? 'رفع صورة (OCR)' : 'Upload Photo (OCR)'}
              </button>
              <button onClick={handleSolve} disabled={loading || (!question.trim() && !selectedImage)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/30">
                <Sparkles className="w-5 h-5" />
                <span className="text-xl uppercase tracking-widest">{isAr ? 'حل الواجب' : 'Solve Homework'}</span>
              </button>
            </div>
          </div>

          {solution && (
            <div className="bg-[#111827]/40 border border-blue-500/20 rounded-[3rem] p-10 md:p-16 animate-in fade-in slide-in-from-top-6 duration-1000 shadow-2xl">
              <div className={`flex items-center gap-4 mb-10 text-blue-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="p-3 bg-blue-600/20 rounded-2xl"><ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} /></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">{isAr ? 'الحل التعليمي المفصل' : 'Step-by-Step Educational Solution'}</h3>
              </div>
              <div className={`prose prose-invert max-w-none text-slate-100 text-lg md:text-2xl leading-relaxed ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
                {solution.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkView;
