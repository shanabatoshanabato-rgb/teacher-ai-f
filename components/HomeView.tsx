
import React from 'react';
import { MessageSquare, BookOpen, Mic, PenTool, Star, Globe, Cpu, Layout, Library, GraduationCap, Brain, ShieldCheck } from 'lucide-react';
import { AppTab } from '../types';

interface HomeViewProps {
  setActiveTab: (tab: AppTab) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const isAr = document.documentElement.lang === 'ar';

  const t = isAr ? {
    badge: 'TEACHER AI - العقل التعليمي الشامل',
    h1: 'معلمك الشامل.',
    h2: 'قوة المعرفة.',
    desc: 'منصة تعليمية تدمج أحدث تقنيات البحث والذكاء الشامل لخدمة الطالب والباحث بدقة المحرك الرئيسي.',
    btnChat: 'ابدأ التعلم الآن',
    btnSettings: 'مركز التحكم',
    core: 'أنظمة Master الشاملة',
    feat1: 'المحاور الشامل',
    feat1d: 'نقاشات تعليمية عميقة ومنطقية.',
    feat2: 'منهاج الإمارات',
    feat2d: 'دراسة ذكية لمنهاج وزارة التربية.',
    feat3: 'استوديو الكتابة',
    feat3d: 'تصحيح، إعراب، وإعادة صياغة.',
    feat4: 'مساعد الواجبات',
    feat4d: 'حل وشرح المسائل عبر الصور.'
  } : {
    badge: 'TEACHER AI - INTEGRATED MASTER CORE',
    h1: 'MASTER TUTOR.',
    h2: 'Deep Logic.',
    desc: 'An advanced educational platform integrating master search and engineering in one ecosystem.',
    btnChat: 'Start Learning',
    btnSettings: 'Master Control',
    core: 'MASTER SYSTEMS',
    feat1: 'Master Tutor',
    feat1d: 'Deep educational discussions and logic.',
    feat2: 'UAE Curriculum',
    feat2d: 'AI-powered study for UAE standards.',
    feat3: 'Writer Studio',
    feat3d: 'Correction, parsing, and rewriting.',
    feat4: 'Homework AI',
    feat4d: 'Image-based solving and explanation.'
  };

  const features = [
    { id: 'chat', title: t.feat1, desc: t.feat1d, icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 'teacher-uae', title: t.feat2, desc: t.feat2d, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { id: 'writer', title: t.feat3, desc: t.feat3d, icon: PenTool, color: "text-amber-400", bg: "bg-amber-400/10" },
    { id: 'homework', title: t.feat4, desc: t.feat4d, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" }
  ];

  return (
    <div className="flex flex-col items-center justify-center pt-10 sm:pt-16 pb-16 animate-in fade-in duration-1000 px-4 max-w-screen-xl mx-auto">
      <div className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20">
        <Star className="w-3 h-3 text-indigo-500 fill-indigo-500" />
        <span className="text-[9px] font-black tracking-[0.2em] text-indigo-400 uppercase">{t.badge}</span>
      </div>

      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-tight">{t.h1}</h1>
        <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent tracking-tighter leading-tight">{t.h2}</h1>
        <p className="max-w-xl mx-auto text-slate-500 text-sm sm:text-lg font-medium mt-6 leading-relaxed opacity-60 px-4">{t.desc}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto px-6">
        <button onClick={() => setActiveTab('chat')} className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-sm">{t.btnChat}</button>
        <button onClick={() => setActiveTab('settings')} className="px-10 py-5 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-sm">{t.btnSettings}</button>
      </div>

      <div className="w-full space-y-10">
        <div className="flex items-center gap-4 justify-center">
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-white/10"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">{t.core}</span>
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-white/10"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                onClick={() => setActiveTab(f.id as AppTab)}
                className="bg-[#0a0a0c] border border-white/5 p-6 sm:p-8 rounded-[2rem] text-center space-y-6 hover:border-indigo-500/30 transition-all cursor-pointer group hover:bg-white/5"
              >
                <div className={`p-4 rounded-2xl ${f.bg} inline-block group-hover:scale-110 transition-transform`}><Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${f.color}`} /></div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{f.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-20 opacity-20">
         <span className="text-[8px] font-black uppercase tracking-[1em] text-slate-500">Master Core v5.2 Optimized</span>
      </div>
    </div>
  );
};

export default HomeView;
