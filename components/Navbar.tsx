
import React, { useState } from 'react';
import { 
  MessageSquare, 
  BookOpen, 
  PenTool, 
  Layout, 
  FileText, 
  Image as ImageIcon, 
  Settings as SettingsIcon,
  Sparkles,
  Mic,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAr = document.documentElement.lang === 'ar';

  const navItems = [
    { id: 'chat', label: isAr ? 'المعلم (Teacher AI)' : 'Teacher AI', icon: MessageSquare },
    { id: 'voice', label: isAr ? 'صوت' : 'Voice', icon: Mic },
    { id: 'homework', label: isAr ? 'الواجبات' : 'Homework', icon: BookOpen },
    { id: 'web-intelligence', label: isAr ? 'البحث الذكي' : 'Search', icon: Globe },
    { id: 'writer', label: isAr ? 'الكاتب' : 'Writer', icon: PenTool },
    { id: 'web-builder', label: isAr ? 'بناء الويب' : 'Web Builder', icon: Layout },
    { id: 'files', label: isAr ? 'ملفات' : 'Files', icon: FileText },
    { id: 'images', label: isAr ? 'صور' : 'Images', icon: ImageIcon },
    { id: 'settings', label: isAr ? 'الإعدادات' : 'Settings', icon: SettingsIcon },
  ];

  const handleTabClick = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-4 md:px-6 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => handleTabClick('home')}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-white text-black' : 'bg-indigo-600 text-white'}`}>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-lg md:text-xl font-bold text-white">Teacher AI</span>
          </div>

          <div className="hidden xl:flex items-center gap-1 bg-white/5 p-1 rounded-2xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as AppTab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="xl:hidden p-2 text-slate-300 hover:text-white transition-colors">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`xl:hidden fixed inset-0 z-40 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-[280px] bg-[#0a0a0c] border-l border-white/10 p-6 pt-24 flex flex-col gap-2 transition-transform duration-300 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleTabClick(item.id as AppTab)} 
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
