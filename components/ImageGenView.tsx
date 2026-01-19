
import React, { useState } from 'react';
import { Image as ImageIcon, Download, RefreshCcw, Wand2, Maximize2 } from 'lucide-react';
import { generateImage } from '../services/aiService';

const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isAr = document.documentElement.lang === 'ar';

  const ratios = [
    { id: '1:1', label: isAr ? 'مربع' : 'Square' },
    { id: '16:9', label: isAr ? 'عريض' : 'Wide' },
    { id: '9:16', label: isAr ? 'طولي' : 'Portrait' },
    { id: '4:3', label: isAr ? 'كلاسيكي' : 'Standard' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const url = await generateImage(prompt, aspectRatio);
    setImageUrl(url);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      <div className="bg-[#111827]/60 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 blur-[100px] -z-10"></div>
        
        <div className="flex flex-col gap-6">
          <div className={`flex items-center gap-4 text-yellow-400 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
            <div className="bg-yellow-400/20 p-3 rounded-2xl">
              <ImageIcon className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-none mb-1">{isAr ? 'نانو بنانا (الرسم)' : 'Nano Banana'}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{isAr ? 'محرك توليد الصور' : 'Neural Image Engine'}</p>
            </div>
          </div>

          <div className={`flex flex-col md:flex-row gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1 space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isAr ? "صف الصورة التي تتخيلها بدقة..." : "Describe the image you want Nano Banana to create..."}
                className={`w-full bg-black/40 border border-white/5 rounded-2xl p-6 h-32 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-slate-200 resize-none text-sm md:text-base ${isAr ? 'text-right' : 'text-left'}`}
                dir={isAr ? 'rtl' : 'ltr'}
              />
              
              <div className={`flex flex-wrap gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                {ratios.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${aspectRatio === r.id ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    {r.label} ({r.id})
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="md:w-48 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl flex flex-col items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-yellow-500/20 group py-6 md:py-0"
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest animate-pulse">{isAr ? 'يرسم...' : 'Painting...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] uppercase tracking-widest">{isAr ? 'توليد' : 'Generate'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Improved Image Display Container with fixed aspect logic */}
      <div className="bg-black/60 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden min-h-[400px] md:min-h-[600px] flex items-center justify-center relative shadow-2xl group">
        {loading ? (
          <div className="flex flex-col items-center gap-8 text-center px-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-yellow-500/10 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-yellow-400 animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-white">{isAr ? 'جاري بناء النمط العصبي' : 'Visualizing Concepts'}</h3>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">{isAr ? 'نانو بنانا يعمل الآن...' : 'Nano Banana Engine Active...'}</p>
            </div>
          </div>
        ) : imageUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-[#050505] p-2 md:p-10">
            <div className="relative max-w-full max-h-[80vh] shadow-[0_0_100px_rgba(234,179,8,0.1)] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt="Generated Art" 
                className="max-w-full max-h-[75vh] object-contain animate-in zoom-in-95 duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center p-4 md:p-8 gap-3 backdrop-blur-[2px]">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = `nano-banana-${Date.now()}.png`;
                    link.click();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl"
                >
                  <Download className="w-4 h-4" /> {isAr ? 'تحميل' : 'Download'}
                </button>
                <button 
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 backdrop-blur-md transition-transform"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 opacity-20">
            <div className="p-8 border-2 border-dashed border-white/10 rounded-full">
              <ImageIcon className="w-12 h-12 md:w-20 md:h-20 text-yellow-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">{isAr ? 'نانو بنانا جاهز' : 'Nano Banana Ready'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenView;
