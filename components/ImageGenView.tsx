
import React, { useState } from 'react';
import { Image as ImageIcon, Download, RefreshCcw, Wand2, Search, Maximize2 } from 'lucide-react';
import { generateImage } from '../services/aiService';

const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ratios = [
    { id: '1:1', label: 'Square' },
    { id: '16:9', label: 'Wide' },
    { id: '9:16', label: 'Story' },
    { id: '4:3', label: 'Standard' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const url = await generateImage(prompt, aspectRatio);
    setImageUrl(url);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="bg-[#111827]/60 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -z-10"></div>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 text-indigo-400">
            <div className="bg-indigo-600/20 p-3 rounded-2xl">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-none mb-1">Visual Studio</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Neural Image Generation</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="صف الصورة التي تريد إنشاؤها بالتفصيل..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 resize-none text-right font-arabic"
                dir="rtl"
              />
              
              <div className="flex flex-wrap gap-2">
                {ratios.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${aspectRatio === r.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    {r.label} ({r.id})
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="md:w-48 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl flex flex-col items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/30 group"
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest animate-pulse">Painting...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] uppercase tracking-widest">Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Improved Image Display Container */}
      <div className="bg-black/60 border border-white/5 rounded-[3rem] overflow-hidden min-h-[500px] flex items-center justify-center relative shadow-2xl group">
        {loading ? (
          <div className="flex flex-col items-center gap-8 text-center px-6">
            <div className="relative">
              <div className="w-32 h-32 border-2 border-indigo-500/10 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center blur-sm animate-pulse"></div>
                <ImageIcon className="w-10 h-10 text-indigo-400 absolute animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Visualizing Concepts</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Assembling neural patterns...</p>
            </div>
          </div>
        ) : imageUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-[#050505] p-4 md:p-10">
            <div className="relative max-w-full max-h-[80vh] shadow-[0_0_100px_rgba(79,70,229,0.1)] rounded-2xl overflow-hidden border border-white/10">
              <img 
                src={imageUrl} 
                alt="Generated Art" 
                className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center p-8 gap-4 backdrop-blur-[2px]">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = `teacher-ai-${Date.now()}.png`;
                    link.click();
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-transform hover:scale-105 active:scale-95"
                >
                  <Download className="w-5 h-5" /> Download HD
                </button>
                <button 
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 backdrop-blur-md transition-transform hover:scale-105"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 opacity-20">
            <div className="p-8 border-2 border-dashed border-white/10 rounded-full">
              <ImageIcon className="w-20 h-20" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.4em]">Ready for Creation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenView;
