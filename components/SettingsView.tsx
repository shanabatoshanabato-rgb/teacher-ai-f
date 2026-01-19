
import React, { useState } from 'react';
import { 
  Globe, 
  Settings as SettingsIcon,
  Cpu,
  Lock,
  Unlock,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Languages
} from 'lucide-react';
import { getActiveKey } from '../services/aiService';

const ADMIN_PASSWORD = "TeacherAI_2025!";

const SettingsView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Key tracking state
  const [keys, setKeys] = useState({
    global: {
      serpapi: localStorage.getItem('teacher_global_serpapi') || '',
      openai: localStorage.getItem('teacher_global_openai') || '',
      eleven: localStorage.getItem('teacher_global_eleven') || '',
      deepai: localStorage.getItem('teacher_global_deepai') || '',
      groq: localStorage.getItem('teacher_global_groq') || '',
    },
    local: {
      serpapi: localStorage.getItem('teacher_local_serpapi') || '',
      openai: localStorage.getItem('teacher_local_openai') || '',
      eleven: localStorage.getItem('teacher_local_eleven') || '',
      deepai: localStorage.getItem('teacher_local_deepai') || '',
      groq: localStorage.getItem('teacher_local_groq') || '',
    }
  });

  const t = isAr ? {
    title: 'مركز تحكم المعلم الذكي',
    sub: 'إدارة المفاتيح والأداء العام للنظام.',
    lang: 'لغة الواجهة',
    core: 'نظام إدارة المفاتيح: Teacher AI Control Center',
    passLabel: 'كلمة مرور المشرف',
    unlock: 'فك تشفير لوحة التحكم',
    global: 'إعدادات النظام العامة',
    globalDesc: 'المفاتيح التي تشغل الموقع لجميع الزوار.',
    local: 'إعدادات المطور الخاصة',
    localDesc: 'تعمل على جهازك الحالي فقط للتجربة.',
    save: 'حفظ المفتاح',
    saved: 'تم الحفظ بنجاح',
    active: 'نشط الآن',
    sourceLabel: 'المصدر:',
    none: 'غير مفعل'
  } : {
    title: 'Teacher AI Control Center',
    sub: 'Manage keys and overall system performance.',
    lang: 'UI Language',
    core: 'Key Management: Teacher AI Control Center',
    passLabel: 'Admin Security Pass',
    unlock: 'Decrypt Admin Panel',
    global: 'Global System Config',
    globalDesc: 'Keys powering the production environment.',
    local: 'Local Developer Sandboxing',
    localDesc: 'Device-specific overrides for testing.',
    save: 'Apply & Save',
    saved: 'Key Saved Successfully',
    active: 'Active Now',
    sourceLabel: 'Source:',
    none: 'Not Set'
  };

  const keyDefinitions = [
    { id: 'serpapi', name: isAr ? 'محرك البحث (SerpAPI)' : 'Web Research (SerpAPI)' },
    { id: 'openai', name: isAr ? 'منطق اللغة العربية (OpenAI)' : 'Arabic Logic (OpenAI)' },
    { id: 'groq', name: isAr ? 'محرك البناء (High-Performance)' : 'Build Engine (High-Performance)' },
    { id: 'eleven', name: isAr ? 'تحويل النص لصوت (ElevenLabs)' : 'Voice Synthesis (ElevenLabs)' },
    { id: 'deepai', name: isAr ? 'محرك الصور (DeepAI)' : 'Visual Engine (DeepAI)' }
  ];

  const handleLang = (l: string) => {
    localStorage.setItem('teacher_ui_lang', l);
    // Refresh to apply language and RTL/LTR
    window.location.reload();
  };

  const saveKey = (type: 'global' | 'local', id: string) => {
    const val = (keys as any)[type][id];
    localStorage.setItem(`teacher_${type}_${id}`, val);
    setSaveStatus(id);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleKeyChange = (type: 'global' | 'local', id: string, val: string) => {
    setKeys(prev => ({
      ...prev,
      [type]: { ...prev[type], [id]: val }
    }));
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-[#111827]/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl text-center space-y-8">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Teacher AI</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.passLabel}</p>
          </div>
          <input 
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && passwordInput === ADMIN_PASSWORD && setIsAdmin(true)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-center text-xl font-black tracking-widest focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
            placeholder="••••••••"
          />
          <button 
            onClick={() => passwordInput === ADMIN_PASSWORD && setIsAdmin(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 uppercase tracking-widest text-sm"
          >
            <Unlock className="w-5 h-5" />
            {t.unlock}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-500 space-y-12">
      {/* Header */}
      <div className="bg-[#111827]/40 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className={`flex items-center gap-6 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
          <div className="p-6 bg-indigo-600/20 rounded-[2rem] border border-indigo-500/30 shadow-xl">
            <ShieldCheck className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">{t.title}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">{t.core}</p>
          </div>
        </div>

        {/* Language Toggles */}
        <div className="flex flex-col items-center gap-3">
           <div className={`flex items-center gap-2 text-indigo-400 mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
             <Languages className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">{t.lang}</span>
           </div>
           <div className="flex gap-2 p-2 bg-white/5 rounded-[1.5rem] border border-white/5 shadow-inner">
            <button onClick={() => handleLang('en')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${!isAr ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>English</button>
            <button onClick={() => handleLang('ar')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${isAr ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>العربية</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Global Configuration */}
        <div className="bg-[#111827]/40 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-xl">
          <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <Globe className="w-6 h-6 text-indigo-400" />
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">{t.global}</h3>
          </div>
          <p className={`text-xs text-slate-500 font-medium leading-relaxed opacity-60 ${isAr ? 'text-right' : ''}`}>{t.globalDesc}</p>
          
          <div className="space-y-6">
            {keyDefinitions.map((k) => (
              <div key={`global-${k.id}`} className="space-y-3">
                <label className={`text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                   {k.name}
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <input 
                      type={showKeyId === `global-${k.id}` ? 'text' : 'password'}
                      value={keys.global[k.id as keyof typeof keys.global]}
                      onChange={(e) => handleKeyChange('global', k.id, e.target.value)}
                      className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                      placeholder="Enter Key Path..."
                    />
                    <button 
                      onClick={() => setShowKeyId(showKeyId === `global-${k.id}` ? null : `global-${k.id}`)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                    >
                      {showKeyId === `global-${k.id}` ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button onClick={() => saveKey('global', k.id)} className={`px-5 rounded-2xl transition-all shadow-lg active:scale-90 flex items-center justify-center gap-2 ${saveStatus === k.id ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                    {saveStatus === k.id ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Sandboxing */}
        <div className="bg-[#111827]/40 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-xl">
          <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <SettingsIcon className="w-6 h-6 text-emerald-400" />
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">{t.local}</h3>
          </div>
          <p className={`text-xs text-slate-500 font-medium leading-relaxed opacity-60 ${isAr ? 'text-right' : ''}`}>{t.localDesc}</p>
          
          <div className="space-y-6">
            {keyDefinitions.map((k) => (
              <div key={`local-${k.id}`} className="space-y-3">
                <label className={`text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                   {k.name}
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <input 
                      type={showKeyId === `local-${k.id}` ? 'text' : 'password'}
                      value={keys.local[k.id as keyof typeof keys.local]}
                      onChange={(e) => handleKeyChange('local', k.id, e.target.value)}
                      className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      placeholder="Override Path..."
                    />
                    <button 
                      onClick={() => setShowKeyId(showKeyId === `local-${k.id}` ? null : `local-${k.id}`)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                    >
                      {showKeyId === `local-${k.id}` ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button onClick={() => saveKey('local', k.id)} className={`px-5 rounded-2xl transition-all shadow-lg active:scale-90 flex items-center justify-center gap-2 ${saveStatus === k.id ? 'bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                    {saveStatus === k.id ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center opacity-20">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Teacher AI System V16.0 / Admin Transactional Layer</p>
      </div>
    </div>
  );
};

export default SettingsView;
