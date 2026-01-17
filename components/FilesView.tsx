
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
  Check,
  FileBox
} from 'lucide-react';
import { generatePPT, generateDOC } from '../services/fileService';

const FilesView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [fileType, setFileType] = useState<'ppt' | 'doc'>('ppt');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Parameters
  const [numSlides, setNumSlides] = useState(5);
  const [wordCount, setWordCount] = useState(1000);
  const [includeImages, setIncludeImages] = useState(true);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError('');
    
    try {
      if (fileType === 'ppt') {
        await generatePPT(topic, numSlides, includeImages);
      } else {
        await generateDOC(topic, wordCount, includeImages);
      }
    } catch (e) {
      setError('An error occurred while generating the file. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
          <div className="p-3 bg-indigo-600/20 rounded-2xl">
            <FileBox className="text-indigo-400 w-8 h-8" />
          </div>
          Document Factory
        </h2>
        <p className="text-slate-400 text-lg font-medium">Create premium presentations and professional research papers with neural intelligence.</p>
      </div>

      <div className="bg-[#111827]/60 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl space-y-10">
        
        {/* Step 1: Subject */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 ml-1">1. Research Subject</label>
          <div className="relative group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Artificial Intelligence in Healthcare, The Great Pyramids..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xl placeholder:text-slate-700"
            />
            <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
          </div>
        </div>

        {/* Step 2: File Type Selection */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 ml-1">2. Select Document Format</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFileType('ppt')}
              className={`
                flex items-center justify-center gap-4 py-6 rounded-2xl border transition-all
                ${fileType === 'ppt' ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.1)]' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}
              `}
            >
              <Presentation className="w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">PowerPoint PPTX</span>
            </button>
            <button
              onClick={() => setFileType('doc')}
              className={`
                flex items-center justify-center gap-4 py-6 rounded-2xl border transition-all
                ${fileType === 'doc' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)]' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}
              `}
            >
              <FileText className="w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">Word DOCX</span>
            </button>
          </div>
        </div>

        {/* Step 3: Dynamic Configuration */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 ml-1">3. Neural Parameters</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Conditional Slider */}
            {fileType === 'ppt' ? (
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Slide Count</span>
                  </div>
                  <span className="font-black text-white text-lg">{numSlides}</span>
                </div>
                <input 
                  type="range" min="3" max="50" step="1" 
                  value={numSlides} 
                  onChange={(e) => setNumSlides(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-widest">Recommended: 10-15 slides</p>
              </div>
            ) : (
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Type className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Word Limit</span>
                  </div>
                  <span className="font-black text-white text-lg">{wordCount}</span>
                </div>
                <input 
                  type="range" min="100" max="4000" step="100" 
                  value={wordCount} 
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-widest">Max capacity: 4,000 words</p>
              </div>
            )}

            {/* Visuals Toggle */}
            <div 
              onClick={() => setIncludeImages(!includeImages)}
              className={`
                p-6 rounded-3xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group
                ${includeImages ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-white/5 border-white/5 text-slate-500 opacity-60'}
              `}
            >
              <div className="relative">
                <ImageIcon className={`w-8 h-8 transition-transform group-hover:scale-110 ${includeImages ? 'text-indigo-400' : 'text-slate-600'}`} />
                {includeImages && <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#111827] animate-pulse" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Include AI Visuals</span>
              {includeImages && <span className="text-[8px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-in fade-in">Active</span>}
            </div>
          </div>
        </div>

        {/* Unified Generation Button */}
        <div className="pt-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className={`
              w-full relative overflow-hidden flex items-center justify-center gap-4 text-white font-black py-8 rounded-3xl transition-all active:scale-[0.98] shadow-2xl
              ${fileType === 'ppt' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'}
              disabled:opacity-40 disabled:grayscale
            `}
          >
            {isGenerating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Download className="w-8 h-8" />}
            <div className="flex flex-col items-start text-left">
              <span className="text-xl leading-none uppercase tracking-tighter">Generate {fileType === 'ppt' ? 'Presentation' : 'Document'}</span>
              <span className="text-[10px] opacity-70 uppercase tracking-[0.3em] font-medium">Deploying Puter AI Engine</span>
            </div>
            
            {/* Visual scan effect when generating */}
            {isGenerating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            )}
          </button>
        </div>

        {error && (
          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-sm font-bold flex items-center justify-center gap-3 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            {error}
          </div>
        )}
      </div>

      {/* Modern Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Sparkles, title: "Neural Logic", desc: "Structured hierarchical data architecture" },
          { icon: ImageIcon, title: "Visual Assets", desc: "Automated search via SerpAPI integration" },
          { icon: FileTypeIcon, title: "Pro Templates", desc: "Premium formatting ready for production" },
        ].map((item, i) => (
          <div key={i} className="bg-[#111827]/40 p-8 rounded-[2.5rem] border border-white/5 text-center group hover:bg-indigo-600/5 hover:border-indigo-500/20 transition-all duration-700">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/5 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <item.icon className="w-7 h-7 text-indigo-400" />
            </div>
            <h4 className="font-black text-white mb-2 uppercase tracking-[0.2em] text-xs">{item.title}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesView;
