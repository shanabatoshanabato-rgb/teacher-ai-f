
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
    { id: 'chat', label: isAr ? 'المحادثة' : 'Chat', icon: MessageSquare },
    { id: 'web-intelligence', label: isAr ? 'ذكاء الويب' : 'Web Intl', icon: Globe },
    { id: 'voice', label: isAr ? 'صوت' : 'Voice', icon: Mic },
    { id: 'homework', label: isAr ? 'الواجبات' : 'Homework', icon: BookOpen },
    { id: 'writer', label: isAr ? 'الكاتب' : 'Writer', icon: PenTool },
    { id: 'web-builder', label: isAr ? 'المطور' : 'Web Builder', icon: Layout },
    { id: 'files', label: isAr ? 'ملفات' : 'Files', icon: FileText },
    { id: 'images', label: isAr ? 'الصور' : 'Images', icon: ImageIcon },
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
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="xl:hidden p-2 text-slate-300">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`xl:hidden fixed inset-0 z-40 transition-all ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-64 bg-[#0a0a0c] p-6 flex flex-col gap-2 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleTabClick(item.id as AppTab)} className={`flex items-center gap-4 px-4 py-3 rounded-2xl ${activeTab === item.id ? 'bg-indigo-600/20 text-white' : 'text-slate-400'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
