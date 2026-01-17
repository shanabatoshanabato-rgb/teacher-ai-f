
import React, { useState } from 'react';
import { 
  Check, 
  Type, 
  FileText, 
  Languages, 
  Sparkles, 
  Copy, 
  Trash2,
  Loader2
} from 'lucide-react';
import { askTeacher, parseArabic } from '../services/aiService';

type WriterMode = 'grammar' | 'correction' | 'paragraph' | 'arabic';

const WriterView: React.FC = () => {
  // Use independent objects for each mode's input and results
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

  const modes = [
    { id: 'grammar', label: 'Grammar Fixer', icon: Check },
    { id: 'correction', label: 'Word Correction', icon: Type },
    { id: 'paragraph', label: 'Paragraph Gen', icon: FileText },
    { id: 'arabic', label: 'Grammar Expert (Arabic)', icon: Languages },
  ];

  const currentText = inputs[mode];
  const currentResult = results[mode];

  const handleInputChange = (val: string) => {
    setInputs(prev => ({ ...prev, [mode]: val }));
  };

  const handleAction = async () => {
    if (!currentText.trim()) return;
    setLoading(true);
    
    // Clear old result for this mode only
    setResults(prev => ({ ...prev, [mode]: '' }));
    
    let res = '';
    const systemPrompt = "You are a professional writing assistant. Be precise and high-quality.";
    
    try {
      if (mode === 'arabic') {
        res = await parseArabic(currentText);
      } else if (mode === 'grammar') {
        res = await askTeacher(`Fix all grammar and spelling errors in this text: "${currentText}". Provide only the fixed text.`, undefined, systemPrompt);
      } else if (mode === 'correction') {
        res = await askTeacher(`Correct the word usage and improve the vocabulary of this text: "${currentText}". Provide only the improved text.`, undefined, systemPrompt);
      } else if (mode === 'paragraph') {
        res = await askTeacher(`Expand this idea into a professional and well-structured paragraph: "${currentText}".`, undefined, systemPrompt);
      }
      
      setResults(prev => ({ ...prev, [mode]: res }));
    } catch (e) {
      setResults(prev => ({ ...prev, [mode]: "An error occurred. Please check your connection." }));
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
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Writer Studio.</h1>
        <p className="text-slate-500 font-medium text-xs md:text-base">Professional tools with independent workspaces</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          const hasContent = inputs[m.id as WriterMode].length > 0;

          return (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as WriterMode);
                setCopied(false);
              }}
              className={`
                relative flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl border transition-all duration-300 text-[10px] md:text-xs font-bold uppercase tracking-wider
                ${isActive 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-[#0f172a] border-white/5 text-slate-500 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-3 h-3 md:w-4 md:h-4" />
              {m.label}
              {hasContent && !isActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-[#050505]"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Studio Area */}
      <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
              {mode === 'arabic' ? 'مدخلات اللغة العربية' : `${mode.toUpperCase()} WORKSPACE`}
            </label>
            {currentText && (
              <button 
                onClick={clearCurrentInput}
                className="flex items-center gap-1.5 text-slate-600 hover:text-red-400 transition-colors text-[9px] font-black uppercase tracking-widest"
              >
                <Trash2 className="w-3 h-3" /> Clear Mode
              </button>
            )}
          </div>
          
          <div className="relative group">
            <textarea
              value={currentText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                mode === 'grammar' ? 'Enter text to fix grammar...' :
                mode === 'arabic' ? 'أدخل النص للإعراب التفصيلي...' :
                mode === 'correction' ? 'Enter text to improve vocabulary...' :
                'Enter your idea to expand into a paragraph...'
              }
              className={`
                w-full min-h-[180px] md:min-h-[220px] bg-[#030712]/50 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm md:text-base leading-relaxed text-slate-200
                placeholder:text-slate-800 resize-none
                ${mode === 'arabic' ? 'text-right font-arabic' : 'text-left'}
              `}
              dir={mode === 'arabic' ? 'rtl' : 'ltr'}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl md:rounded-3xl flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">AI Processing...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={loading || !currentText.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-xs md:text-sm uppercase tracking-widest"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {modes.find(m => m.id === mode)?.label}
        </button>

        {/* Result Area */}
        {currentResult && (
          <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Optimized Output
              </span>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest text-slate-400"
              >
                {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Result</>}
              </button>
            </div>
            <div 
              className={`p-5 md:p-6 bg-[#0a0a0c]/80 rounded-xl md:rounded-2xl border border-white/5 text-slate-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap shadow-inner ${mode === 'arabic' ? 'text-right' : 'text-left'}`}
              dir={mode === 'arabic' ? 'rtl' : 'ltr'}
            >
              {currentResult}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center opacity-30">
        <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.8em]">Independent Neural Segments | v4.2</p>
      </div>
    </div>
  );
};

export default WriterView;
