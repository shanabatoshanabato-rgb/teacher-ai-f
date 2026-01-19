
import React, { useState } from 'react';
import { 
  FileText, 
  Presentation, 
  Download, 
  Loader2, 
  Sparkles, 
  FileType as FileTypeIcon,
  Layers,
  Type,
  Image as ImageIcon,
  FileBox,
  Globe
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
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
          <div className="p-3 bg-blue-600/20 rounded-2xl">
            <FileBox className="text-blue-400 w-8 h-8" />
          </div>
          {isAr ? 'مصنع ملفات المعلم' : 'Teacher Doc Factory'}
        </h2>
        <p className="text-slate-400 text-lg font-medium">{isAr ? 'أنشئ عروض تقديمية وأبحاث احترافية بذكاء المعلم الآلي.' : 'Create premium files using Neural AI core brain.'}</p>
      </div>

      <div className="bg-[#111827]/60 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl space-y-10">
        
        <div className="space-y-4">
          <label className={`text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 ml-1 ${isAr ? 'text-right block' : ''}`}>{isAr ? '1. الموضوع' : '1. Subject'}</label>
          <div className="relative group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={isAr ? "مثال: تاريخ الأهرامات، مستقبل الذكاء الاصطناعي..." : "e.g. History of Pyramids, Future of AI..."}
              className={`w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-xl placeholder:text-slate-700 ${isAr ? 'text-right' : 'text-left'}`}
              dir={isAr ? 'rtl' : 'ltr'}
            />
            <Sparkles className={`absolute ${isAr ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 w-6 h-6 text-slate-700 group-focus-within:text-blue-500 transition-colors`} />
          </div>
        </div>

        <div className="space-y-4">
          <label className={`text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 ml-1 ${isAr ? 'text-right block' : ''}`}>{isAr ? '2. التنسيق' : '2. Format'}</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFileType('ppt')}
              className={`flex items-center justify-center gap-4 py-6 rounded-2xl border transition-all ${fileType === 'ppt' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
            >
              <Presentation className="w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">{isAr ? 'باوربوينت' : 'PowerPoint'}</span>
            </button>
            <button
              onClick={() => setFileType('doc')}
              className={`flex items-center justify-center gap-4 py-6 rounded-2xl border transition-all ${fileType === 'doc' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
            >
              <FileText className="w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">{isAr ? 'وورد' : 'Word'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className={`text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 ml-1 ${isAr ? 'text-right block' : ''}`}>{isAr ? '3. المعايير' : '3. Logic Parameters'}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fileType === 'ppt' ? (
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{isAr ? 'الشرائح' : 'Slides'}</span>
                  </div>
                  <span className="font-black text-white text-lg">{numSlides}</span>
                </div>
                <input type="range" min="3" max="30" value={numSlides} onChange={(e) => setNumSlides(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
            ) : (
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Type className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{isAr ? 'الكلمات' : 'Words'}</span>
                  </div>
                  <span className="font-black text-white text-lg">{wordCount}</span>
                </div>
                <input type="range" min="100" max="3000" step="100" value={wordCount} onChange={(e) => setWordCount(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
            )}

            <div 
              onClick={() => setIncludeWebData(!includeWebData)} 
              className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${includeWebData ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 opacity-60'}`}
            >
              <Globe className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'تضمين بيانات من الويب' : 'Include Web Data'}</span>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full relative overflow-hidden flex items-center justify-center gap-4 text-white font-black py-8 rounded-3xl transition-all active:scale-[0.98] shadow-2xl bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 disabled:opacity-40"
          >
            {isGenerating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Download className="w-8 h-8" />}
            <div className={`flex flex-col items-start ${isAr ? 'text-right' : 'text-left'}`}>
              <span className="text-xl leading-none uppercase tracking-tighter">{isAr ? 'إنشاء الملف الآن' : `Generate ${fileType.toUpperCase()}`}</span>
              <span className="text-[10px] opacity-70 uppercase tracking-[0.3em] font-medium">{isAr ? 'تفعيل المحرك العصبي' : 'Activating Neural Engine'}</span>
            </div>
          </button>
        </div>

        {error && (
          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-sm font-bold animate-in slide-in-from-top-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesView;
