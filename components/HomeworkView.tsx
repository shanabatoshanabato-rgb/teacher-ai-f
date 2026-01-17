
import React, { useState, useRef } from 'react';
import { 
  Calculator, 
  Atom, 
  Beaker, 
  Dna, 
  Scroll, 
  Languages, 
  BookOpen, 
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Smile,
  GraduationCap,
  Zap,
  ArrowRight,
  X
} from 'lucide-react';
import { askTeacher } from '../services/aiService';

const HomeworkView: React.FC = () => {
  const [subject, setSubject] = useState('math');
  const [style, setStyle] = useState('tutorFriendly');
  const [question, setQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    { id: 'math', label: 'math', icon: Calculator },
    { id: 'physics', label: 'physics', icon: Atom },
    { id: 'chemistry', label: 'chemistry', icon: Beaker },
    { id: 'science', label: 'science', icon: Dna },
    { id: 'history', label: 'history', icon: Scroll },
    { id: 'arabic', label: 'arabic', icon: Languages },
    { id: 'english', label: 'english', icon: BookOpen },
  ];

  const tutorStyles = [
    { id: 'tutorFriendly', label: 'tutorFriendly', icon: Smile },
    { id: 'tutorStrict', label: 'tutorStrict', icon: GraduationCap },
    { id: 'tutorGenius', label: 'tutorGenius', icon: Zap },
  ];

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

  const handleSolve = async () => {
    if (!question.trim() && !selectedImage) return;
    setLoading(true);
    setSolution(null);
    
    const stylePrompt = style === 'tutorFriendly' ? "Explain as a friendly tutor." : 
                       style === 'tutorStrict' ? "Be very precise and strict about logic." : 
                       "Provide the most advanced and genius-level explanation.";

    const prompt = `Solve this ${subject} question. Subject: ${subject}. Question: ${question}. Style: ${stylePrompt}. If an image is provided, analyze the handwritten or diagrammatic content.`;
    
    const res = await askTeacher(prompt, selectedImage || undefined, "You are a professional educational tutor. Break down solutions into clear steps.");
    
    setSolution(res);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">Homework</h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium uppercase tracking-widest">Vision Solver</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Controls */}
        <div className="lg:col-span-4 space-y-10">
          {/* Subjects */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">SUBJECT</h3>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((s) => {
                const Icon = s.icon;
                const isActive = subject === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSubject(s.id)}
                    className={`
                      flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all duration-300
                      ${isActive 
                        ? 'bg-[#1e293b]/40 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]' 
                        : 'bg-[#111827]/40 border-white/5 hover:border-white/10'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />
                    <span className={`text-xs font-bold ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tutor Style */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">TUTOR STYLE</h3>
            <div className="space-y-3">
              {tutorStyles.map((t) => {
                const Icon = t.icon;
                const isActive = style === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setStyle(t.id)}
                    className={`
                      w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
                      ${isActive 
                        ? 'bg-[#1e293b]/40 border-indigo-500/50' 
                        : 'bg-[#111827]/40 border-white/5 hover:border-white/10'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />
                    <span className={`text-xs font-bold ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Problem Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            
            {/* Image Preview inside TextArea area */}
            <div className="relative group">
              {selectedImage && (
                <div className="absolute top-4 right-4 z-20 animate-in zoom-in-95 duration-300">
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Homework" 
                      className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl border-2 border-indigo-500 shadow-2xl rotate-3"
                    />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your homework problem here, or attach a photo for me to read it..."
                className="w-full min-h-[300px] bg-[#030712]/40 border border-white/5 rounded-3xl p-10 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-lg md:text-xl leading-relaxed text-slate-200 placeholder:text-slate-700 resize-none transition-all"
              />
              
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-30 gap-4">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                  <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs">AI Analyzing...</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-6 py-4 bg-[#111827] border rounded-2xl font-bold text-sm transition-all w-full sm:w-auto ${selectedImage ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
              >
                <ImageIcon className="w-5 h-5" />
                {selectedImage ? 'Change Photo' : 'Attach Photo'}
              </button>
              
              <button
                onClick={handleSolve}
                disabled={loading || (!question.trim() && !selectedImage)}
                className="flex-1 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                <span className="text-lg">Solve Homework</span>
              </button>
            </div>
          </div>

          {/* Solution Result Card */}
          {solution && (
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 animate-in fade-in slide-in-from-top-6 duration-700">
              <div className="flex items-center gap-3 mb-8 text-indigo-400">
                <div className="p-2 bg-indigo-600/20 rounded-xl">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Neural Solution</h3>
              </div>
              <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed space-y-6 text-base md:text-lg">
                {solution.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('-') || line.match(/^\d\./) ? 'pl-6 border-l-2 border-indigo-500/20 bg-indigo-500/5 p-4 rounded-r-xl' : ''}>
                    {line}
                  </p>
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
