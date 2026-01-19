
import React, { useState } from 'react';
import { Image as ImageIcon, Download, RefreshCcw, Wand2, Maximize2, Palette, Info } from 'lucide-react';
import { generateImage } from '../services/aiService';

const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isAr = document.documentElement.lang === 'ar';

  const styles = isAr ? [
    { id: 'realistic', label: 'واقعي', desc: 'صور عالية الدقة وواقعية' },
    { id: 'cartoon', label: 'كارتون', desc: 'رسومات كرتونية ملونة' },
    { id: 'anime', label: 'أنمي', desc: 'نمط الرسوم المتحركة اليابانية' },
    { id: 'digital-art', label: 'فن رقمي', desc: 'رسومات رقمية عصرية' },
    { id: 'cyberpunk', label: 'سايبر بانك', desc: 'نمط مستقبلي مضيء' },
  ] : [
    { id: 'realistic', label: 'Realistic', desc: 'High-detail photographic output' },
    { id: 'cartoon', label: 'Cartoon', desc: 'Colorful cartoon characters' },
    { id: 'anime', label: 'Anime', desc: 'Japanese animation style' },
    { id: 'digital-art', label: 'Digital Art', desc: 'Modern digital painting' },
    { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon futuristic aesthetics' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);
    try {
      const url = await generateImage(prompt, selectedStyle);
      setImageUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-10 px-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="p-4 bg-yellow-500/20 rounded-[2rem] border border-yellow-500/20 shadow-xl shadow-yellow-500/10">
            <Palette className="w-10 h-10 text-yellow-400" />
          </div>
          <div className={`text-left ${isAr ? 'text-right' : ''}`}>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              {isAr ? 'مولد الصور (deAPI)' : 'Image Gen (deAPI)'}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">
              {isAr ? 'وضعية التوليد البصري الفائق' : 'Strict Image Generation Mode'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Style & Controls */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <div className="bg-[#111827]/60 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl space-y-8">
            <div className={`flex items-center gap-2 text-yellow-400 ${isAr ? 'flex-row-reverse' : ''}`}>
              <ImageIcon className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-widest">{isAr ? 'تخصيص النمط' : 'STYLE PRESETS'}</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${isAr ? 'text-right flex-row-reverse' : ''} ${selectedStyle === s.id ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/20' : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20'}`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${selectedStyle === s.id ? 'bg-black/10' : 'bg-white/5'}`}>
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`font-black text-[11px] uppercase tracking-wider ${selectedStyle === s.id ? 'text-black' : 'text-slate-200'}`}>{s.label}</p>
                    <p className={`text-[9px] font-medium leading-tight mt-1 ${selectedStyle === s.id ? 'text-black/60' : 'text-slate-600'}`}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className={`flex items-center gap-2 text-slate-600 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Info className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{isAr ? 'معلومات النظام' : 'SYSTEM INFO'}</span>
              </div>
              <p className={`text-[8px] text-slate-700 font-medium leading-relaxed ${isAr ? 'text-right' : ''}`}>
                {isAr ? 'يتم التوليد حصرياً عبر deAPI. لا يتم استخدام أي محركات نصية أخرى لضمان السرعة والدقة البصرية.' : 'Powered strictly by deAPI. No text dependencies or web search involved for maximum visual performance.'}
              </p>
            </div>
          </div>
        </div>

        {/* Prompt & Display */}
        <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
          <div className="bg-[#111827]/60 border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[120px] -z-10"></div>
            
            <div className="space-y-8">
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={isAr ? "صف المشهد البصري الذي تريده... (مثال: مدينة مستقبلية عند الغروب)" : "Describe your visual concept... (e.g. A futuristic city at sunset with neon lights)"}
                  className={`w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 md:p-10 focus:outline-none focus:ring-4 focus:ring-yellow-500/10 transition-all text-xl md:text-3xl text-white placeholder:text-slate-800 min-h-[220px] resize-none ${isAr ? 'text-right' : 'text-left'}`}
                  dir={isAr ? 'rtl' : 'ltr'}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 text-black font-black py-6 md:py-8 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-yellow-500/30 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCcw className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] uppercase tracking-[0.4em] animate-pulse">{isAr ? 'جاري الرسم...' : 'Generating Art...'}</span>
                  </div>
                ) : (
                  <>
                    <Wand2 className="w-8 h-8" />
                    <span className="text-2xl md:text-3xl uppercase tracking-tighter">{isAr ? 'توليد الصورة الآن' : 'Generate Image Now'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Display */}
          <div className="bg-black/60 border border-white/5 rounded-[3.5rem] overflow-hidden min-h-[500px] flex items-center justify-center relative shadow-2xl group border-dashed border-white/10">
            {loading ? (
              <div className="flex flex-col items-center gap-8 text-center px-10">
                <div className="relative">
                  <div className="w-32 h-32 border-2 border-yellow-500/10 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-yellow-500 animate-bounce" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">{isAr ? 'بناء الأنماط البصرية' : 'Sculpting Visuals'}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">{isAr ? 'محرك deAPI يعمل الآن...' : 'deAPI Engine Orchestrating...'}</p>
                </div>
              </div>
            ) : imageUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] p-6 md:p-12">
                <div className="relative group/img max-w-full shadow-[0_0_100px_rgba(234,179,8,0.15)] rounded-3xl overflow-hidden border border-white/10">
                  <img 
                    src={imageUrl} 
                    alt="deAPI Generated Art" 
                    className="max-w-full max-h-[70vh] object-contain animate-in zoom-in-95 duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-all flex items-end justify-center p-10 gap-4 backdrop-blur-[2px]">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `teacher-ai-gen-${Date.now()}.png`;
                        link.click();
                      }}
                      className="flex items-center gap-3 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl transition-transform hover:scale-105"
                    >
                      <Download className="w-5 h-5" /> {isAr ? 'تحميل الصورة' : 'Download Image'}
                    </button>
                    <button 
                      onClick={() => window.open(imageUrl, '_blank')}
                      className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 backdrop-blur-md transition-all hover:scale-105"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 opacity-20 text-center px-10">
                <div className="p-10 border-2 border-dashed border-white/10 rounded-full">
                  <Palette className="w-16 h-16 md:w-24 md:h-24 text-yellow-500" />
                </div>
                <div className="space-y-2">
                   <p className="text-sm md:text-xl font-black uppercase tracking-[0.4em] text-yellow-500">{isAr ? 'استوديو الصور' : 'Visual Studio'}</p>
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{isAr ? 'بانتظار تعليمات الرسم من deAPI' : 'Awaiting instructions for deAPI engine'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenView;
