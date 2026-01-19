
import React, { useState } from 'react';
import { 
  Code, 
  Eye, 
  Download, 
  Copy, 
  Play, 
  Check, 
  Terminal, 
  Package, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Layout, 
  Monitor, 
  Loader2, 
  Rocket,
  Wand2,
  Box,
  Compass
} from 'lucide-react';
import { buildWebsite } from '../services/aiService';

declare const JSZip: any;

const WebBuilderView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'relaying' | 'building' | 'reviewing' | 'idle'>('idle');
  const [view, setView] = useState<'editor' | 'preview'>('editor');
  const [copied, setCopied] = useState(false);
  const isAr = document.documentElement.lang === 'ar';

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const finalizedCode = await buildWebsite(prompt, (p) => setPhase(p));
      setCode(finalizedCode);
      setView('preview');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setPhase('idle');
    }
  };

  const handleDownloadZip = async () => {
    if (!code || !JSZip) return;
    const zip = new JSZip();
    zip.file("index.html", code);
    zip.file("README.txt", `Website Project generated via Teacher AI Web Studio.\nBuild Request: ${prompt}\nGenerated on: ${new Date().toISOString()}`);
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Project_Archive_${Date.now()}.zip`;
    link.click();
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10 py-6 md:py-12 px-4 md:px-8 animate-in fade-in duration-700">
      
      {/* Studio Header */}
      <div className={`flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-white/5 pb-12 ${isAr ? 'lg:flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-6 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
          <div className="w-20 h-20 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center border border-indigo-500/20 shadow-2xl group transition-all hover:scale-105">
            <Layout className="w-10 h-10 text-indigo-400 group-hover:rotate-6 transition-transform" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
              {isAr ? 'استوديو بناء الويب' : 'Web Architecture.'}
            </h1>
            <div className={`flex items-center gap-3 mt-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">
                {isAr ? 'محرك التصميم العصبي الموحد' : 'Unified Neural Design Core'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {code && (
             <button 
               onClick={handleDownloadZip} 
               className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all flex items-center gap-3 group"
             >
                <Package className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'تصدير المشروع' : 'Export Project'}</span>
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Input Interface */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl h-full flex flex-col justify-between group transition-all hover:border-white/10">
            <div className="space-y-10">
              <div className={`flex items-center gap-4 text-indigo-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">{isAr ? 'تخطيط المشروع' : 'PROJECT SCOPE'}</h3>
              </div>
              
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={isAr ? "صف رؤيتك للموقع... (مثال: منصة فنية حديثة)" : "Define your digital vision... (e.g. A dark futuristic tech portfolio)"}
                  className={`w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-xl md:text-2xl text-white placeholder:text-slate-800 min-h-[350px] resize-none ${isAr ? 'text-right' : 'text-left'}`}
                  dir={isAr ? 'rtl' : 'ltr'}
                />
                <div className="absolute bottom-6 right-6 opacity-10 group-focus-within:opacity-40 transition-opacity">
                  <Box className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="mt-12 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white font-black py-6 md:py-8 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all shadow-[0_20px_60px_rgba(79,70,229,0.3)] active:scale-[0.98] group"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <span className="text-[10px] uppercase tracking-[0.5em] animate-pulse">{isAr ? 'جاري البناء' : 'Building Engine'}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-2xl uppercase tracking-tighter">{isAr ? 'بدء البناء الذكي' : 'Execute Build'}</span>
                  </div>
                  <span className="text-[9px] font-bold opacity-40 uppercase tracking-[0.4em]">{isAr ? 'توليد كامل بنظام عالي الدقة' : 'Full-Stack High Fidelity Generation'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content & Viewport */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-[2rem] border border-white/5 backdrop-blur-xl">
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => setView('editor')} 
                className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'editor' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                {isAr ? 'كود المصدر' : 'Source Code'}
              </button>
              <button 
                onClick={() => setView('preview')} 
                className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'preview' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                {isAr ? 'معاينة حية' : 'Live Preview'}
              </button>
            </div>
            
            <div className={`hidden md:flex items-center gap-4 px-8 border-white/5 ${isAr ? 'border-r' : 'border-l'}`}>
              <Monitor className="w-4 h-4 text-slate-600" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural SDK v16.0</span>
                <span className="text-[7px] text-emerald-500/60 font-black uppercase tracking-widest">Production Ready</span>
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-[4rem] overflow-hidden h-[70vh] relative shadow-[0_50px_100px_rgba(0,0,0,0.6)] group">
            {loading && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-indigo-600 blur-[100px] opacity-20 animate-pulse" />
                  <div className="w-32 h-32 border-4 border-indigo-500/10 rounded-full flex items-center justify-center">
                     <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <Wand2 className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 animate-bounce" />
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                     <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                       {phase === 'relaying' && (isAr ? 'تحليل المخطط المعماري' : 'Analyzing Blueprint')}
                       {phase === 'building' && (isAr ? 'جاري بناء الشيفرة' : 'Assembling Components')}
                       {phase === 'reviewing' && (isAr ? 'المراجعة والتدقيق النهائي' : 'Final Polishing')}
                     </h3>
                     <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                       {isAr ? 'المحرك العصبي يقوم بالبناء الآن' : 'Neural Core is Synthesizing Interface'}
                     </p>
                   </div>
                   
                   <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0s]" />
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              </div>
            )}

            {view === 'editor' ? (
              <div className="h-full relative bg-[#0a0a0c]">
                <div className="absolute top-6 left-10 flex gap-2">
                   <div className="w-3 h-3 bg-red-500/40 rounded-full" />
                   <div className="w-3 h-3 bg-yellow-500/40 rounded-full" />
                   <div className="w-3 h-3 bg-emerald-500/40 rounded-full" />
                </div>
                <pre className="p-16 text-sm md:text-xl font-mono text-indigo-300/80 overflow-auto h-full scrollbar-none selection:bg-indigo-500/30" dir="ltr">
                  {code || `/* ${isAr ? 'بانتظار تعليمات البناء من المحرك...' : 'Awaiting digital instructions...'} */`}
                </pre>
              </div>
            ) : (
              <iframe
                title="Viewport Preview"
                className="w-full h-full bg-white"
                srcDoc={code || `<html><body style="background:#050505;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><p style="color:#222;font-family:sans-serif;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:10px;opacity:0.2;">${isAr ? 'منصة العرض جاهزة' : 'VIEWPORT READY'}</p></body></html>`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebBuilderView;
