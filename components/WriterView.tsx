
import React, { useState } from 'react';
import { 
  Check, 
  Type, 
  FileText, 
  Languages, 
  Sparkles, 
  Copy, 
  Trash2,
  Loader2,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { runWriterAgent } from '../services/aiService';

type WriterMode = 'grammar' | 'correction' | 'paragraph' | 'arabic';

const WriterView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  const [inputs, setInputs] = useState<Record<WriterMode, string>>({
    grammar: '',
    correction: '',
    paragraph: '',
    arabic: ''
  });
  
  const [results, setResults] = useState<Record<WriterMode, string>>({
    grammar: '',
    correction: '',
    paragraph: '',
    arabic: ''
  });

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<WriterMode>('grammar');
  const [copied, setCopied] = useState(false);

  const modes = isAr ? [
    { id: 'grammar', label: 'مصحح القواعد', icon: Check, dep: 'Puter' },
    { id: 'correction', label: 'تصحيح الكلمات', icon: Type, dep: 'Puter' },
    { id: 'paragraph', label: 'إنشاء فقرات', icon: FileText, dep: 'Puter' },
    { id: 'arabic', label: 'الإعراب (نحو)', icon: Languages, dep: 'OpenAI' },
  ] : [
    { id: 'grammar', label: 'Grammar Fixer', icon: Check, dep: 'Puter' },
    { id: 'correction', label: 'Word Correction', icon: Type, dep: 'Puter' },
    { id: 'paragraph', label: 'Paragraph Gen', icon: FileText, dep: 'Puter' },
    { id: 'arabic', label: 'Arabic Parsing (إعراب)', icon: Languages, dep: 'OpenAI' },
  ];

  const currentText = inputs[mode];
  const currentResult = results[mode];

  const handleInputChange = (val: string) => {
    setInputs(prev => ({ ...prev, [mode]: val }));
  };

  const handleAction = async () => {
    if (!currentText.trim()) return;
    setLoading(true);
    setResults(prev => ({ ...prev, [mode]: '' }));
    
    try {
      const res = await runWriterAgent(mode, currentText);
      setResults(prev => ({ ...prev, [mode]: res }));
    } catch (e) {
      setResults(prev => ({ ...prev, [mode]: isAr ? "حدث خطأ في المعالجة." : "Processing error." }));
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentInput = () => {
    setInputs(prev => ({ ...prev, [mode]: '' }));
    setResults(prev => ({ ...prev, [mode]: '' }));
  };

  const copyToClipboard = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 md:py-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{isAr ? 'استوديو الكتابة' : 'Writer Studio.'}</h1>
        <p className="text-slate-500 font-medium text-xs md:text-base">{isAr ? 'مركز معالجة النصوص الذكي المعتمد على محركات Puter و OpenAI' : 'Intelligent text processing hub powered by Puter & OpenAI'}</p>
      </div>

      {/* Mode Tabs */}
      <div className={`flex flex-wrap justify-center gap-2 md:gap-3 px-2 ${isAr ? 'flex-row-reverse' : ''}`}>
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as WriterMode);
                setCopied(false);
              }}
              className={`
                relative flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 text-[10px] md:text-xs font-bold uppercase tracking-wider
                ${isActive 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/20 scale-105' 
                  : 'bg-[#0f172a] border-white/5 text-slate-500 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <div className="flex flex-col items-start">
                <span>{m.label}</span>
                <span className={`text-[8px] opacity-50 ${isActive ? 'text-white' : 'text-slate-600'}`}>{m.dep}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Area */}
      <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8">
        <div className="space-y-4">
          <div className={`flex items-center justify-between px-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              {mode === 'arabic' ? 'OPENAI NEURAL (ARABIC)' : 'PUTER NEURAL (STUDIO)'}
            </label>
            {currentText && (
              <button 
                onClick={clearCurrentInput}
                className="flex items-center gap-1.5 text-slate-600 hover:text-red-400 transition-colors text-[9px] font-black uppercase tracking-widest"
              >
                <Trash2 className="w-3 h-3" /> {isAr ? 'تصفية' : 'Clear'}
              </button>
            )}
          </div>
          
          <div className="relative group">
            <textarea
              value={currentText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                mode === 'grammar' ? (isAr ? 'أدخل نصاً لتصحيح الأخطاء والقواعد...' : 'Enter text for grammar correction...') :
                mode === 'arabic' ? (isAr ? 'أدخل جملة عربية للإعراب الكامل...' : 'Enter an Arabic sentence for full parsing...') :
                mode === 'correction' ? (isAr ? 'أدخل نصاً لتصحيح الإملاء وتحسين المفردات...' : 'Enter text for spelling and vocabulary correction...') :
                (isAr ? 'أدخل فكرة أو مسودة لإنشاء فقرة منظمة...' : 'Enter an idea to generate a coherent paragraph...')
              }
              className={`
                w-full min-h-[200px] md:min-h-[280px] bg-black/40 border border-white/5 rounded-[2rem] p-8 md:p-10 
                focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm md:text-2xl leading-relaxed text-slate-100
                placeholder:text-slate-800 resize-none
                ${isAr ? 'text-right' : 'text-left'}
                ${mode === 'arabic' ? 'font-arabic' : ''}
              `}
              dir={isAr ? 'rtl' : 'ltr'}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center z-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <Zap className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
                    {mode === 'arabic' ? (isAr ? 'تواصل مع OpenAI...' : 'Connecting OpenAI...') : (isAr ? 'معالجة Puter...' : 'Puter Processing...')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={loading || !currentText.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98] text-sm md:text-xl uppercase tracking-widest"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {modes.find(m => m.id === mode)?.label}
        </button>

        {/* Result Area */}
        {currentResult && (
          <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-6 duration-700">
            <div className={`flex items-center justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                {isAr ? 'المعالجة النهائية' : 'Final Synthesis'}
              </span>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النتيجة' : 'Copy Result')}
              </button>
            </div>
            <div 
              className={`p-8 md:p-12 bg-[#050505] rounded-[2rem] border border-white/5 text-slate-100 text-sm md:text-2xl leading-relaxed whitespace-pre-wrap shadow-inner ${isAr ? 'text-right' : 'text-left'}`}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {currentResult}
            </div>
          </div>
        )}
      </div>

      {/* Footer System Branding */}
      <div className="flex items-center justify-center gap-8 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">Puter Core Orchestrator</span>
        </div>
        <div className="w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">OpenAI Grammar Pipeline</span>
        </div>
      </div>
    </div>
  );
};

export default WriterView;
