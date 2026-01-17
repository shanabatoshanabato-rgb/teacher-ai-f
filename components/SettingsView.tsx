
import React, { useState } from 'react';
import { 
  Zap, 
  Globe, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  Cloud
} from 'lucide-react';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const SettingsView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  const [testingAll, setTestingAll] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({
    'GROQ_API_KEY': 'idle',
    'OPENAI_API_KEY': 'idle',
    'SERP_API_KEY': 'idle',
    'NANO_BANANA_KEY': 'idle',
    'ELEVENLABS_API_KEY': 'idle'
  });

  const toggleLanguage = (lang: 'en' | 'ar') => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('teacher_ui_lang', lang);
    window.location.reload();
  };

  const testApi = async (name: string) => {
    setStatuses(prev => ({ ...prev, [name]: 'testing' }));
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Check if the key exists in process.env
    const isConfigured = !!process.env[name];
    setStatuses(prev => ({ ...prev, [name]: isConfigured ? 'success' : 'error' }));
  };

  const testAll = async () => {
    setTestingAll(true);
    for (const key of Object.keys(statuses)) {
      await testApi(key);
    }
    setTestingAll(false);
  };

  const t = isAr ? {
    title: 'تكوين النظام السحابي',
    infra: 'ربط مفاتيح Vercel',
    validate: 'تحديث حالة المفاتيح',
    lang: 'اللغة الحالية',
    ready: 'المفاتيح متصلة سحابياً',
    admin: 'لوحة التحكم السحابية',
    desc: 'يتعرف النظام تلقائياً على المفاتيح التي أضفتها في لوحة تحكم Vercel.'
  } : {
    title: 'Cloud Configuration',
    infra: 'Vercel Key Integration',
    validate: 'Refresh Key Status',
    lang: 'System Language',
    ready: 'Keys Connected via Cloud',
    admin: 'Cloud Admin Panel',
    desc: 'The system automatically recognizes keys added to your Vercel project dashboard.'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-1/3 space-y-5">
          <div className="bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-8 text-center backdrop-blur-xl">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/10 text-white">
                <Cloud className="w-10 h-10" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white mb-2">{t.admin}</h2>
            <div className="flex items-center justify-center gap-2 mb-8">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">{t.ready}</p>
            </div>
            
            <button 
              onClick={testAll}
              disabled={testingAll}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20"
            >
              {testingAll ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : t.validate}
            </button>
          </div>

          <div className="bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className={`flex items-center gap-3 mb-6 text-xs font-black text-white uppercase tracking-wider ${isAr ? 'flex-row-reverse' : ''}`}>
              <Globe className="w-5 h-5 text-blue-400" /> {t.lang}
            </div>
            <div className="flex p-1.5 bg-black/40 rounded-2xl gap-1.5 border border-white/5">
              <button onClick={() => toggleLanguage('en')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${!isAr ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>ENGLISH</button>
              <button onClick={() => toggleLanguage('ar')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${isAr ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>العربية</button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div className="bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <div className={`flex items-center gap-4 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Key className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-black text-white">{t.infra}</h3>
            </div>
            <p className={`text-slate-500 text-sm mb-10 ${isAr ? 'text-right' : 'text-left'}`}>{t.desc}</p>

            <div className="grid grid-cols-1 gap-4">
              {Object.keys(statuses).map((name) => (
                <div key={name} className={`flex items-center justify-between p-5 bg-black/40 border rounded-3xl transition-all ${isAr ? 'flex-row-reverse' : ''} ${statuses[name] === 'success' ? 'border-emerald-500/40 bg-emerald-500/5' : statuses[name] === 'error' ? 'border-red-500/40 bg-red-500/5' : 'border-white/5'}`}>
                  <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                    <div className={`p-3 rounded-xl ${statuses[name] === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">{name}</h4>
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Vercel Environment Variable</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statuses[name] === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {statuses[name] === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
                    <button onClick={() => testApi(name)} className="p-3 rounded-xl border border-white/10 text-blue-400 hover:bg-white/5 transition-all">
                      {statuses[name] === 'testing' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    </button>
                  </div>
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
