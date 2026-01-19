
import React from 'react';
import { MessageSquare, BookOpen, Mic, PenTool, Star, Globe } from 'lucide-react';
import { AppTab } from '../types';

interface HomeViewProps {
  setActiveTab: (tab: AppTab) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const isAr = document.documentElement.lang === 'ar';

  const t = isAr ? {
    badge: 'تيتشر AI 2.5 الاحترافي',
    h1: 'العقل الرقمي الذكي.',
    h2: 'نظام تعليمي موحد.',
    desc: 'شريكك الذكي للتعليم والإنتاجية. المساعدة في الواجبات، إنشاء الملفات، والتفاعل الصوتي اللحظي عبر المحركات العصبية المتطورة.',
    btnChat: 'ابدأ المحادثة',
    btnSettings: 'الإعدادات',
    core: 'القدرات الأساسية',
    feat1: 'المعلم (المحادثة)',
    feat1d: 'العقل المدبر للتحليل والحلول الذكية.',
    feat2: 'الواجبات العبقرية',
    feat2d: 'حل المسائل المعقدة عبر تقنيات OCR المتقدمة.',
    feat3: 'البحث العالمي',
    feat3d: 'اكتشاف الحقائق عبر محرك البحث الذكي.',
    feat4: 'اتصال صوتي',
    feat4d: 'تحدث مع المعلم بأي لغة بطلاقة تامة.'
  } : {
    badge: 'Teacher AI 2.5 Elite',
    h1: 'Teacher AI Core.',
    h2: 'Unified Learning System.',
    desc: 'Your intelligent partner for education and productivity. Help with homework, document creation, and real-time voice interaction powered by Neural Engines.',
    btnChat: 'Start Chatting',
    btnSettings: 'Settings',
    core: 'Core Capabilities',
    feat1: 'Teacher (Chat)',
    feat1d: 'The main neural brain for reasoning and smart solutions.',
    feat2: 'Homework Expert',
    feat2d: 'Solve complex problems using advanced OCR technology.',
    feat3: 'Web Intelligence',
    feat3d: 'Discover real-time facts with the smart discovery tool.',
    feat4: 'Voice Pipeline',
    feat4d: 'Speak to Teacher AI in any language fluently.'
  };

  const features = [
    { id: 'chat', title: t.feat1, desc: t.feat1d, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 'homework', title: t.feat2, desc: t.feat2d, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { id: 'web-intelligence', title: t.feat3, desc: t.feat3d, icon: Globe, color: "text-amber-400", bg: "bg-amber-400/10" },
    { id: 'voice', title: t.feat4, desc: t.feat4d, icon: Mic, color: "text-purple-400", bg: "bg-purple-400/10" }
  ];

  return (
    <div className="flex flex-col items-center justify-center pt-8 md:pt-16 pb-16 animate-in fade-in duration-1000 px-4">
      <div className="mb-6 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20">
        <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
        <span className="text-[9px] font-black tracking-[0.2em] text-blue-400 uppercase">{t.badge}</span>
      </div>

      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{t.h1}</h1>
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tighter">{t.h2}</h1>
        <p className="max-w-lg mx-auto text-slate-500 text-sm md:text-lg font-medium mt-6 leading-relaxed">{t.desc}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-24 w-full sm:w-auto">
        <button onClick={() => setActiveTab('chat')} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-blue-500 active:scale-95">{t.btnChat} <MessageSquare className="w-5 h-5" /></button>
        <button onClick={() => setActiveTab('settings')} className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all">{t.btnSettings}</button>
      </div>

      <div className="w-full max-w-5xl space-y-8">
        <div className="flex items-center gap-4 justify-center">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-800"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{t.core}</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-800"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div 
              key={i} 
              onClick={() => setActiveTab(f.id as AppTab)}
              className="bg-[#0f172a]/40 border border-white/5 p-6 rounded-[1.25rem] text-center space-y-4 hover:border-blue-500/30 transition-all cursor-pointer group"
            >
              <div className={`p-3 rounded-lg ${f.bg} inline-block group-hover:scale-110 transition-transform`}><f.icon className={`w-6 h-6 ${f.color}`} /></div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
