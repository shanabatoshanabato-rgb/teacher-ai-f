
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
  Save,
  Edit2,
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ShieldAlert,
  Database
} from 'lucide-react';
import { API_KEYS, secureStorage } from '../services/aiService';

// Declare Puter global
declare const puter: any;

type TestStatus = 'idle' | 'testing' | 'success' | 'error' | 'missing';

const ADMIN_PASSWORD = "TeacherAI_2025!";

const SettingsView: React.FC = () => {
  const isAr = document.documentElement.lang === 'ar';
  
  const [pendingLang, setPendingLang] = useState<'en' | 'ar'>(isAr ? 'ar' : 'en');
  const [isSaving, setIsSaving] = useState(false);
  
  // Admin Lock State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  // State for Manual Key Entry
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [manualKeys, setManualKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<string | null>(null); 

  const keysMap: Record<string, { objKey: keyof typeof API_KEYS, storageKey: string }> = {
    'OPEN_AI_API': { objKey: 'OPENAI', storageKey: 'teacher_key_openai' },
    'QROQ_API': { objKey: 'GROQ', storageKey: 'teacher_key_groq' },
    'ELEVEN_LABS_API': { objKey: 'ELEVEN_LABS', storageKey: 'teacher_key_eleven' },
    'SERP_API_SEARCH': { objKey: 'SERPAPI', storageKey: 'teacher_key_serp' },
    'NANO_BANANA_MODEL': { objKey: 'NANO_BANANA', storageKey: 'teacher_key_nano' }
  };

  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({
    'OPEN_AI_API': 'idle',
    'QROQ_API': 'idle',
    'ELEVEN_LABS_API': 'idle',
    'SERP_API_SEARCH': 'idle',
    'NANO_BANANA_MODEL': 'idle'
  });

  useEffect(() => {
    // Only load keys and test if unlocked or partially for status check
    const loaded: Record<string, string> = {};
    Object.keys(keysMap).forEach(k => {
      const val = secureStorage.get(keysMap[k].storageKey);
      if (val) loaded[k] = val;
    });
    setManualKeys(loaded);
    
    // Auto-test on load (does not reveal keys, just status)
    Object.keys(keysMap).forEach(k => testApi(k));
  }, []);

  const checkConnectivity = async (): Promise<boolean> => {
    if (typeof puter === 'undefined') return false;
    return true;
  };

  const testApi = async (name: string) => {
    setStatuses(prev => ({ ...prev, [name]: 'testing' }));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const keyConfig = keysMap[name];
    const hasKey = !!API_KEYS[keyConfig.objKey];

    if (hasKey) {
       setStatuses(prev => ({ ...prev, [name]: 'success' }));
       return;
    }

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
    document.documentElement.lang = pendingLang;
    document.documentElement.dir = pendingLang === 'ar' ? 'rtl' : 'ltr';
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleManualKeySave = (name: string, value: string) => {
    const config = keysMap[name];
    secureStorage.save(config.storageKey, value);
    setManualKeys(prev => ({ ...prev, [name]: value }));
    setEditingKey(null);
    window.location.reload(); 
  };

  const handleClearKey = (name: string) => {
    const config = keysMap[name];
    secureStorage.remove(config.storageKey);
    setManualKeys(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
    window.location.reload();
  };

  const handleUnlock = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminUnlocked(true);
      setUnlockError(false);
      setPasswordInput('');
    } else {
      setUnlockError(true);
      setPasswordInput('');
    }
  };

  const t = isAr ? {
    infra: 'نظام Teacher AI',
    lang: 'لغة الواجهة',
    ready: 'النظام جاهز',
    desc: 'منطقة الإدارة المؤمنة. المفاتيح المخزنة هنا تعمل على هذا الجهاز فقط. لجعل المفاتيح عامة لكل المستخدمين، قم بإضافتها في ملف الكود المصدر (GLOBAL_SYSTEM_KEYS).',
    keys: 'محفظة المفاتيح (مشفرة)',
    missing: 'مفقود',
    active: 'آمن',
    system: 'نظام',
    local: 'محلي',
    save: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    manualInput: 'تعديل',
    enterKey: 'الصق مفتاح API السري هنا...',
    saveKey: 'تشفير وحفظ محلياً',
    cancel: 'إلغاء',
    lockedTitle: 'الإعدادات مقفلة',
    lockedDesc: 'هذه المنطقة محمية. يرجى إدخال كلمة مرور المسؤول للوصول إلى المفاتيح.',
    unlockBtn: 'فتح القفل',
    wrongPass: 'كلمة المرور غير صحيحة'
  } : {
    infra: 'Teacher AI System',
    lang: 'Interface Language',
    ready: 'System Ready',
    desc: 'Secured Admin Area. Keys stored here work on THIS DEVICE ONLY. To enable keys for all users, add them to the source code (GLOBAL_SYSTEM_KEYS).',
    keys: 'Key Vault (Encrypted)',
    missing: 'MISSING',
    active: 'SECURE',
    system: 'SYSTEM',
    local: 'LOCAL',
    save: 'Save Changes',
    saving: 'Saving...',
    manualInput: 'Edit',
    enterKey: 'Paste secret API Key here...',
    saveKey: 'Encrypt & Save Locally',
    cancel: 'Cancel',
    lockedTitle: 'Settings Locked',
    lockedDesc: 'This area is protected. Please enter the Admin Password to access keys.',
    unlockBtn: 'Unlock Settings',
    wrongPass: 'Incorrect Password'
  };

  const hasChanges = pendingLang !== (isAr ? 'ar' : 'en');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Column: Language & Status (Always Visible) */}
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

        {/* Right Column: Key Management (Locked) */}
        <div className="flex-1 bg-[#111827]/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
          
          <div className="flex items-center gap-4 mb-2 relative z-10">
            {isAdminUnlocked ? <Unlock className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6 text-blue-400" />}
            <h3 className="text-2xl font-black text-white uppercase">{t.keys}</h3>
          </div>
          <p className="text-slate-500 text-sm mb-10 relative z-10 leading-relaxed">{t.desc}</p>

          {!isAdminUnlocked ? (
            // LOCKED STATE
            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
                <ShieldAlert className="w-12 h-12 text-slate-500" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-lg font-bold text-white">{t.lockedTitle}</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">{t.lockedDesc}</p>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                <input 
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setUnlockError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="Password..."
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all text-center tracking-widest ${unlockError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                />
                <button 
                  onClick={handleUnlock}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95"
                >
                  {t.unlockBtn}
                </button>
                {unlockError && (
                  <p className="text-center text-red-400 text-[10px] font-bold animate-pulse">{t.wrongPass}</p>
                )}
              </div>
            </div>
          ) : (
            // UNLOCKED STATE
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {Object.keys(statuses).map((name) => {
                const isManual = !!manualKeys[name];
                const isSystem = statuses[name] === 'success' && !isManual;

                return (
                  <div key={name} className={`flex flex-col p-4 bg-black/40 border rounded-2xl transition-all ${statuses[name] === 'success' ? 'border-emerald-500/40' : statuses[name] === 'missing' ? 'border-amber-500/20' : 'border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statuses[name] === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
                          {statuses[name] === 'success' ? <ShieldCheck className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-black text-white text-[11px] tracking-tight">{name.replace(/_/g, ' ')}</h4>
                          <div className="flex items-center gap-2">
                            {isSystem && <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><Database className="w-2.5 h-2.5" /> {t.system}</span>}
                            {isManual && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><Key className="w-2.5 h-2.5" /> {t.local}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statuses[name] === 'success' ? <span className="text-[10px] text-emerald-500 font-bold tracking-widest">{t.active}</span> : null}
                        {statuses[name] === 'missing' ? <span className="text-[10px] text-amber-500 font-bold tracking-widest">{t.missing}</span> : null}
                        
                        {statuses[name] === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className={`w-5 h-5 ${statuses[name] === 'missing' ? 'text-amber-500' : 'text-slate-500'}`} />}
                        
                        <button onClick={() => setEditingKey(name)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white" title={t.manualInput}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {manualKeys[name] && (
                           <button onClick={() => handleClearKey(name)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                             <X className="w-3.5 h-3.5" />
                           </button>
                        )}
                      </div>
                    </div>

                    {/* Secure Edit Mode */}
                    {editingKey === name && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 animate-in slide-in-from-top-2 relative">
                        <div className="flex-1 relative">
                           <input 
                            type={showKey === name ? "text" : "password"}
                            placeholder={t.enterKey}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleManualKeySave(name, (e.target as HTMLInputElement).value);
                            }}
                          />
                          <button 
                            onClick={() => setShowKey(showKey === name ? null : name)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            {showKey === name ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => setEditingKey(null)}
                          className="px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-white"
                        >
                          {t.cancel}
                        </button>
                        <button 
                          onClick={(e) => {
                            const input = (e.currentTarget.previousElementSibling?.previousElementSibling?.querySelector('input') as HTMLInputElement);
                            handleManualKeySave(name, input.value);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-xl flex items-center gap-2"
                        >
                          <Lock className="w-3 h-3" />
                          {t.saveKey}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
