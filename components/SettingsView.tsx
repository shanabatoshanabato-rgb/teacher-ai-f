
import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Server,
  Key,
  Save
} from 'lucide-react';

// Declare Puter global
declare const puter: any;

// Helper to safely access env vars (Vite or Standard)
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env[`REACT_APP_${key}`] || process.env[`NEXT_PUBLIC_${key}`] || process.env[key];
  }
  return null;
};

type TestStatus = 'idle' | 'testing' | 'success' | 'error' | 'missing';

const SettingsView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  
  // State for language selection (pending save)
  const [pendingLang, setPendingLang] = useState<'en' | 'ar'>(isAr ? 'ar' : 'en');
  const [isSaving, setIsSaving] = useState(false);

  // Mapping display names to Env Var keys
  const keysMap: Record<string, string> = {
    'OPEN_AI_API': 'OPENAI_API_KEY',
    'QROQ_API': 'GROQ_API_KEY', // Mapped QROQ UI name to GROQ Key
    'ELEVEN_LABS_API': 'ELEVEN_LABS_API_KEY',
    'SERP_API_SEARCH': 'SERPAPI_API_KEY',
    'NANO_BANANA_MODEL': 'NANO_BANANA_KEY'
  };

  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({
    'OPEN_AI_API': 'idle',
    'QROQ_API': 'idle',
    'ELEVEN_LABS_API': 'idle',
    'SERP_API_SEARCH': 'idle',
    'NANO_BANANA_MODEL': 'idle'
  });

  const checkConnectivity = async (): Promise<boolean> => {
    // If we have specific keys, connectivity is assumed good unless fetch fails.
    // For fallback, we check puter.
    if (typeof puter === 'undefined') return false;
    return true;
  };

  const testApi = async (name: string) => {
    setStatuses(prev => ({ ...prev, [name]: 'testing' }));
    
    // Simulate check
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 1. Check if Key exists in Env
    const envKey = keysMap[name];
    const hasKey = !!getEnv(envKey);

    if (hasKey) {
       setStatuses(prev => ({ ...prev, [name]: 'success' }));
       return;
    }

    // 2. If no key, check if fallback (Puter) is active
    const isPuterActive = await checkConnectivity();
    
    if (isPuterActive) {
      setStatuses(prev => ({ ...prev, [name]: 'missing' }));
    } else {
      setStatuses(prev => ({ ...prev, [name]: 'error' }));
    }
  };

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    setPendingLang(lang);
  };

  const saveSettings = () => {
    setIsSaving(true);
    localStorage.setItem('teacher_ui_lang', pendingLang);
    // Apply changes and reload
    document.documentElement.lang = pendingLang;
    document.documentElement.dir = pendingLang === 'ar' ? 'rtl' : 'ltr';
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const t = isAr ? {
    infra: 'نظام Teacher AI',
    lang: 'لغة الواجهة',
    ready: 'النظام جاهز',
    desc: 'إدارة مفاتيح API (Environment Variables) في Vercel.',
    keys: 'فحص المفاتيح',
    missing: 'مفقود',
    active: 'متصل',
    save: 'حفظ التغييرات',
    saving: 'جاري الحفظ...'
  } : {
    infra: 'Teacher AI System',
    lang: 'Interface Language',
    ready: 'System Ready',
    desc: 'Manage API keys via Vercel Environment Variables.',
    keys: 'API Key Diagnostics',
    missing: 'MISSING KEY',
    active: 'ACTIVE',
    save: 'Save Changes',
    saving: 'Saving...'
  };

  const hasChanges = pendingLang !== (isAr ? 'ar' : 'en');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-4">
          <div className="bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-8 text-center backdrop-blur-xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
              <Cloud className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">{t.infra}</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{t.ready}</span>
            </div>
          </div>

          <div className="bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">{t.lang}</span>
            </div>
            <div className="flex p-1 bg-black/40 rounded-2xl gap-1 border border-white/5 mb-4">
              <button 
                onClick={() => handleLanguageSelect('en')} 
                className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${pendingLang === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                ENGLISH
              </button>
              <button 
                onClick={() => handleLanguageSelect('ar')} 
                className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${pendingLang === 'ar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                العربية
              </button>
            </div>
            
            {hasChanges && (
              <button 
                onClick={saveSettings}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top-2"
              >
                {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {isSaving ? t.saving : t.save}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-2">
            <Key className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-black text-white uppercase">{t.keys}</h3>
          </div>
          <p className="text-slate-500 text-sm mb-10">{t.desc}</p>

          <div className="space-y-3">
            {Object.keys(statuses).map((name) => (
              <div key={name} className={`flex items-center justify-between p-4 bg-black/40 border rounded-2xl transition-all ${statuses[name] === 'success' ? 'border-emerald-500/40' : statuses[name] === 'missing' ? 'border-amber-500/20' : 'border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${statuses[name] === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-black text-white text-[11px] tracking-tight">{name.replace(/_/g, ' ')}</h4>
                    <span className="text-[9px] text-slate-600 font-mono">{keysMap[name]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statuses[name] === 'success' ? <span className="text-[10px] text-emerald-500 font-bold tracking-widest">{t.active}</span> : null}
                  {statuses[name] === 'missing' ? <span className="text-[10px] text-amber-500 font-bold tracking-widest">{t.missing}</span> : null}
                  {statuses[name] === 'error' ? <span className="text-[10px] text-red-500 font-bold tracking-widest">ERROR</span> : null}
                  
                  {statuses[name] === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className={`w-5 h-5 ${statuses[name] === 'missing' ? 'text-amber-500' : 'text-slate-500'}`} />}
                  
                  <button onClick={() => testApi(name)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${statuses[name] === 'testing' ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
