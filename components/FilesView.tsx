
import React, { useState } from 'react';
import { 
  FileText, 
  Presentation, 
  Download, 
  Loader2, 
  Sparkles, 
  Layers,
  Type,
  FileBox,
  Globe,
  Settings2,
  Cpu
} from 'lucide-react';
import { generatePPT, generateDOC } from '../services/fileService';

const FilesView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  const [topic, setTopic] = useState('');
  const [fileType, setFileType] = useState<'ppt' | 'doc'>('ppt');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const [numSlides, setNumSlides] = useState(10);
  const [wordCount, setWordCount] = useState(1500);
  const [includeWebData, setIncludeWebData] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError('');
    
    try {
      if (fileType === 'ppt') {
        await generatePPT(topic, numSlides, includeWebData);
      } else {
        await generateDOC(topic, wordCount, includeWebData);
      }
    } catch (e: any) {
      setError(e.message || (isAr ? 'حدث خطأ أثناء إنشاء الملف.' : 'Error generating file.'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 md:py-12 px-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="p-4 bg-indigo-600/20 rounded-[2rem] shadow-xl shadow-indigo-600/10 border border-indigo-500/20">
            <FileBox className="text-indigo-400 w-10 h-10" />
          </div>
          <div className={`text-left ${isAr ? 'text-right' : ''}`}>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              {isAr ? 'مصنع الملفات العصبي' : 'Neural Doc Factory'}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              {isAr ? 'وضعية المستندات والعروض التقديمية' : 'Document & PowerPoint Mode'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl space-y-8">
            <div className={`flex items-center gap-2 text-indigo-400 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Settings2 className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-widest">{isAr ? 'إعدادات التوليد' : 'Generation Config'}</h3>
            </div>

            <div className="space-y-4">
              <label className={`text-[10px] font-black uppercase tracking-widest text-slate-500 block ${isAr ? 'text-right' : ''}`}>{isAr ? 'نوع الملف' : 'FILE TYPE'}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFileType('ppt')}
                  className={`flex flex-col items-center gap-3 py-6 rounded-2xl border transition-all ${fileType === 'ppt' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'}`}
                >
                  <Presentation className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">PPTX</span>
                </button>
                <button
                  onClick={() => setFileType('doc')}
                  className={`flex flex-col items-center gap-3 py-6 rounded-2xl border transition-all ${fileType === 'doc' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'}`}
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">DOCX</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className={`text-[10px] font-black uppercase tracking-widest text-slate-500 block ${isAr ? 'text-right' : ''}`}>
                {fileType === 'ppt' ? (isAr ? 'عدد الشرائح' : 'SLIDE COUNT') : (isAr ? 'طول المقال' : 'WORD COUNT')}
              </label>
              {fileType === 'ppt' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-white font-black text-xl">
                    <span className="text-indigo-400 text-xs">3</span>
                    <span>{numSlides}</span>
                    <span className="text-indigo-400 text-xs">30</span>
                  </div>
                  <input type="range" min="3" max="30" value={numSlides} onChange={(e) => setNumSlides(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-white font-black text-xl">
                    <span className="text-indigo-400 text-xs">500</span>
                    <span>{wordCount}</span>
                    <span className="text-indigo-400 text-xs">3k</span>
                  </div>
                  <input type="range" min="500" max="3000" step="100" value={wordCount} onChange={(e) => setWordCount(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              )}
            </div>

            <button 
              onClick={() => setIncludeWebData(!includeWebData)} 
              className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between group ${includeWebData ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-black/40 border-white/5 text-slate-600'}`}
            >
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Globe className={`w-5 h-5 transition-transform group-hover:rotate-12 ${includeWebData ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'تضمين بيانات الويب' : 'Auxiliary Web Data'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${includeWebData ? 'bg-indigo-500' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAr ? (includeWebData ? 'left-1' : 'right-1') : (includeWebData ? 'right-1' : 'left-1')}`}></div>
              </div>
            </button>
          </div>
        </div>

        {/* Topic Input Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#111827]/60 border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] -z-10"></div>
            
            <div className="space-y-8">
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">{isAr ? 'الموضوع والهدف' : 'TOPIC & OBJECTIVE'}</h3>
              </div>
              
              <div className="relative group">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={isAr ? "اشرح ما تريد إنتاجه بالتفصيل... (مثال: بحث عن تاريخ الفضاء)" : "Describe your document or presentation in detail... (e.g. A report on Quantum Computing history)"}
                  className={`w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 md:p-10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xl md:text-3xl text-white placeholder:text-slate-800 min-h-[250px] resize-none ${isAr ? 'text-right' : 'text-left'}`}
                  dir={isAr ? 'rtl' : 'ltr'}
                />
                <div className={`absolute bottom-8 ${isAr ? 'left-8' : 'right-8'} opacity-20 group-focus-within:opacity-100 transition-opacity`}>
                  <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black py-6 md:py-8 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all shadow-2xl shadow-indigo-600/20 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.5em] animate-pulse">{isAr ? 'المحرك العصبي يعمل' : 'Neural Engine Active'}</p>
                      <p className="text-[8px] opacity-60 uppercase tracking-widest mt-1">Puter (Brain) + SerpAPI (Visuals)</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <Download className="w-8 h-8" />
                      <span className="text-2xl md:text-3xl uppercase tracking-tighter">{isAr ? 'بدء التوليد الذكي' : 'Execute Intelligent Build'}</span>
                    </div>
                    <span className="text-[10px] opacity-70 uppercase tracking-[0.4em] font-medium">{isAr ? 'بناء ملفات عالية الجودة' : 'Premium Content Orchestration'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 text-center text-sm font-bold flex items-center justify-center gap-3 animate-in slide-in-from-top-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-10 flex items-center justify-center gap-10 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">Puter Core v6.0</span>
        </div>
        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">SerpAPI Auxiliary Active</span>
        </div>
        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">Office 365 Standards</span>
        </div>
      </div>
    </div>
  );
};

export default FilesView;
