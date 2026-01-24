
import React from 'react';
import { 
  Star, PenTool, BookOpen, GraduationCap, ShieldCheck, 
  Library, Mic, FileText 
} from 'lucide-react';
import { AppTab } from '../types';

interface HomeViewProps {
  setActiveTab: (tab: AppTab) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const isAr = document.documentElement.lang === 'ar';

  const t = isAr ? {
    badge: 'المعلم الذكي - رفيقك التعليمي الأول',
    h1: 'المعلم الذكي.',
    h2: 'مستقبلك يبدأ هنا.',
    desc: 'منصة تعليمية متطورة تدعمك في رحلتك الدراسية بأحدث التقنيات لتجعل التعلم أسهل وأكثر متعة.',
    btnChat: 'ابدأ التعلم الآن',
    btnSettings: 'مركز التحكم',
    core: 'أنظمة المعلم الذكي',
    feat1: 'المحادثة',
    feat1d: 'نقاشات تعليمية تفاعلية.',
    feat2: 'منهاج الإمارات',
    feat2d: 'دراسة ذكية لمنهاج وزارة التربية.',
    feat3: 'استوديو الكتابة',
    feat3d: 'تصحيح، إعراب، وتطوير النصوص.',
    feat4: 'مساعد الواجبات',
    feat4d: 'حل وشرح المسائل بسهولة.',
    feat5: 'المكتبة الإسلامية',
    feat5d: 'علوم القرآن والفقه والحديث.',
    feat6: 'الوضع الصوتي',
    feat6d: 'تحدث وتفاعل مع المعلم بصوتك.',
    feat7: 'مصنع الملفات',
    feat7d: 'توليد ملفات PDF و PPT ذكية.'
  } : {
    badge: 'TEACHER AI - YOUR SMART STUDY COMPANION',
    h1: 'TEACHER AI.',
    h2: 'Your Future Starts Here.',
    desc: 'An advanced educational platform designed to support your study journey with the latest technology, making learning easier and more effective.',
    btnChat: 'Start Learning',
    btnSettings: 'Master Control',
    core: 'SMART TEACHER SYSTEMS',
    feat1: 'Chat',
    feat1d: 'Interactive educational discussions.',
    feat2: 'UAE Teacher',
    feat2d: 'AI-powered study for UAE standards.',
    feat3: 'Writer Studio',
    feat3d: 'Correction, parsing, and rewriting.',
    feat4: 'Homework AI',
    feat4d: 'Solve and explain problems easily.',
    feat5: 'Islamic Hub',
    feat5d: 'Quran, Fiqh, and Hadith studies.',
    feat6: 'Voice Mode',
    feat6d: 'Talk and interact via voice.',
    feat7: 'Doc Factory',
    feat7d: 'Generate smart PDF & PPT files.'
  };

  const features = [
    { id: 'chat', title: t.feat1, desc: t.feat1d, icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 'teacher-uae', title: t.feat2, desc: t.feat2d, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { id: 'writer', title: t.feat3, desc: t.feat3d, icon: PenTool, color: "text-amber-400", bg: "bg-amber-400/10" },
    { id: 'homework', title: t.feat4, desc: t.feat4d, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
    { id: 'islamic-hub', title: t.feat5, desc: t.feat5d, icon: Library, color: "text-teal-400", bg: "bg-teal-400/10" },
    { id: 'voice', title: t.feat6, desc: t.feat6d, icon: Mic, color: "text-rose-400", bg: "bg-rose-400/10" },
    { id: 'files', title: t.feat7, desc: t.feat7d, icon: FileText, color: "text-sky-400", bg: "bg-sky-400/10" }
  ];

  return (
    <div className="flex flex-col items-center justify-center pt-2 sm:pt-6 pb-20 animate-in fade-in duration-1000 px-4 max-w-screen-xl mx-auto overflow-visible">
      {/* Badge Section */}
      <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20">
        <Star className="w-3 h-3 text-indigo-500 fill-indigo-500" />
        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">{t.badge}</span>
      </div>

      {/* Main Heading Section */}
      <div className="text-center space-y-2 mb-10 w-full overflow-visible">
        <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.4] py-2 px-2 ${isAr ? 'tracking-normal' : 'tracking-tighter'}`}>
          {t.h1}
        </h1>
        <h2 className={`text-4xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent leading-[1.4] py-2 px-2 ${isAr ? 'tracking-normal' : 'tracking-tighter'}`}>
          {t.h2}
        </h2>
        <p className="max-w-xl mx-auto text-slate-500 text-sm sm:text-lg font-medium mt-4 leading-relaxed opacity-80 px-4">
          {t.desc}
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto px-6">
        <button onClick={() => setActiveTab('chat')} className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-sm">{t.btnChat}</button>
        <button onClick={() => setActiveTab('settings')} className="px-10 py-5 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-sm">{t.btnSettings}</button>
      </div>

      {/* Features Section - Updated Grid to accommodate more items */}
      <div className="w-full space-y-12">
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
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-[1.4]">{f.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-20 opacity-20 text-center">
         <span className="text-[8px] font-black uppercase tracking-[1em] text-slate-500">Teacher AI Optimized Core v5.2</span>
      </div>
    </div>
  );
};

export default HomeView;
