
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Globe, 
  RefreshCw, 
  Server,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const SettingsView: React.FC = () => {
  const [testingAll, setTestingAll] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({
    'OPENAI API KEY': 'idle',
    'PUTER AI': 'idle',
    'SERPAPI': 'idle',
    'NANO BANANA API KEY': 'idle',
    'GROQ': 'idle',
    'ELEVENLABS': 'idle'
  });

  const [language, setLanguage] = useState<'en' | 'ar'>(
    document.documentElement.lang === 'ar' ? 'ar' : 'en'
  );

  const toggleLanguage = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('teacher_ui_lang', lang);
    // Reload to apply UI translations everywhere
    window.location.reload();
  };

  const testApi = async (name: string) => {
    setStatuses(prev => ({ ...prev, [name]: 'testing' }));
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let isConfigured = false;
    switch (name) {
      case 'OPENAI API KEY': isConfigured = !!process.env.OPENAI_API_KEY; break;
      case 'PUTER AI': isConfigured = true; break; // Puter is built-in
      case 'SERPAPI': isConfigured = !!process.env.SERP_API_KEY; break;
      case 'NANO BANANA API KEY': isConfigured = !!process.env.NANO_BANANA_KEY; break;
      case 'GROQ': isConfigured = !!process.env.GROQ_API_KEY; break;
      case 'ELEVENLABS': isConfigured = !!process.env.ELEVENLABS_API_KEY; break;
    }

    setStatuses(prev => ({ ...prev, [name]: isConfigured ? 'success' : 'error' }));
  };

  const testAll = async () => {
    setTestingAll(true);
    for (const key of Object.keys(statuses)) {
      await testApi(key);
    }
    setTestingAll(false);
  };

  const t = language === 'ar' ? {
    title: 'إعدادات النظام',
    infra: 'البنية التحتية',
    validate: 'فحص الاتصال',
    lang: 'اللغة الإقليمية',
    ready: 'النظام جاهز',
    admin: 'مدير تيتشر AI'
  } : {
    title: 'System Settings',
    infra: 'Infrastructure',
    validate: 'Validate',
    lang: 'Regional Language',
    ready: 'System Ready',
    admin: 'Teacher Admin'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-1/3 space-y-5">
          <div className="bg-[#111827]/40 border border-white/5 rounded-[2rem] p-6 text-center backdrop-blur-xl">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-3xl font-black shadow-2xl border-2 border-white/10">T</div>
            </div>
            <h2 className="text-xl font-black text-white mb-1">{t.admin}</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">{t.ready}</p>
            </div>
          </div>

          <div className="bg-[#111827]/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4 text-xs font-black text-white uppercase tracking-wider">
              <Globe className="w-4 h-4 text-indigo-400" /> {t.lang}
            </div>
            <div className="flex p-1 bg-black/40 rounded-xl gap-1 border border-white/5">
              <button onClick={() => toggleLanguage('en')} className={`flex-1 py-2 rounded-lg text-[9px] font-black ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>ENGLISH</button>
              <button onClick={() => toggleLanguage('ar')} className={`flex-1 py-2 rounded-lg text-[9px] font-black ${language === 'ar' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>العربية</button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 w-full">
          <div className="bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-black text-white">{t.infra}</h3>
              </div>
              <button onClick={testAll} disabled={testingAll} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full transition-all">
                {testingAll ? <RefreshCw className="w-3 h-3 animate-spin" /> : t.validate}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {Object.keys(statuses).map((name) => (
                <div key={name} className={`flex items-center justify-between p-4 bg-[#0a0a0c]/40 border rounded-[1.5rem] transition-all ${statuses[name] === 'success' ? 'border-emerald-500/30' : statuses[name] === 'error' ? 'border-red-500/30' : 'border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <Cpu className={`w-5 h-5 ${statuses[name] === 'success' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <h4 className="font-black text-white text-sm">{name}</h4>
                  </div>
                  <button onClick={() => testApi(name)} className="p-2 rounded-lg border border-white/5 text-indigo-400">
                    {statuses[name] === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
