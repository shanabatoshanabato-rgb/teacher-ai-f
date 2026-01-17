
import React, { useState } from 'react';
import { Code, Eye, Download, Copy, Play, Check, Terminal } from 'lucide-react';
import { generateCode } from '../services/aiService';

const WebBuilderView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'editor' | 'preview'>('editor');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await generateCode(`Build a professional responsive component with the following requirement: ${prompt}. Use Tailwind CSS. Provide full code including imports if necessary.`);
    // Basic cleaning of markdown markers
    const cleaned = res.replace(/```(html|jsx|tsx|javascript|css)?/g, '').replace(/```/g, '').trim();
    setCode(cleaned);
    setLoading(false);
    setView('editor');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <div className="flex flex-col gap-4">
          <label className="text-indigo-400 font-bold uppercase tracking-wider text-xs">Project Description</label>
          <div className="flex gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A modern landing page for a coffee shop with dark mode and smooth animations..."
              className="flex-1 bg-white/10 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Terminal className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5" />}
              Build
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-black/40 p-2 rounded-2xl border border-white/5">
            <div className="flex gap-1">
              <button 
                onClick={() => setView('editor')}
                className={`px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${view === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Code className="w-4 h-4" /> Editor
              </button>
              <button 
                onClick={() => setView('preview')}
                className={`px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${view === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
            </div>
            <div className="flex gap-2 mr-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#0d0d0f] border border-white/5 rounded-3xl overflow-hidden relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-10">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-indigo-400 font-bold animate-pulse">Generating Source Code...</p>
                </div>
              </div>
            )}
            
            {view === 'editor' ? (
              <pre className="p-6 text-sm font-mono text-indigo-300 overflow-auto h-full scrollbar-thin">
                {code || '// Your generated code will appear here...'}
              </pre>
            ) : (
              <iframe
                title="Preview"
                className="w-full h-full bg-white rounded-2xl"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body>
                      ${code || '<div class="h-screen flex items-center justify-center text-slate-400">Generate some code to see the preview.</div>'}
                    </body>
                  </html>
                `}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              Build Capabilities
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Fully Responsive Design</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Tailwind CSS Integrated</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Modern React Components</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Interactive Elements</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> RTL/LTR Optimized</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-xs text-slate-500 leading-relaxed italic">
              "Teacher AI uses advanced reasoning to generate clean, production-ready code blocks tailored to your educational and professional needs."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebBuilderView;
