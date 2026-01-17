
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import VoiceView from './components/VoiceView';
import HomeworkView from './components/HomeworkView';
import WriterView from './components/WriterView';
import WebBuilderView from './components/WebBuilderView';
import ImageGenView from './components/ImageGenView';
import SettingsView from './components/SettingsView';
import FilesView from './components/FilesView';
import WebIntelligenceView from './components/WebIntelligenceView';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView setActiveTab={setActiveTab} />;
      case 'chat': return <ChatView />;
      case 'voice': return <VoiceView />;
      case 'homework': return <HomeworkView />;
      case 'writer': return <WriterView />;
      case 'web-builder': return <WebBuilderView />;
      case 'images': return <ImageGenView />;
      case 'settings': return <SettingsView />;
      case 'files': return <FilesView />;
      case 'web-intelligence': return <WebIntelligenceView />;
      default: return <HomeView setActiveTab={setActiveTab} />;
    }
  };

  const isChat = activeTab === 'chat';

  return (
    <div className="h-screen flex flex-col bg-[#050505] overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 
          Locked Layout Strategy:
          - Non-chat views: Use standard scroll
          - Chat view: Locked height, internal scroll only
      */}
      <main className={`flex-1 relative flex flex-col overflow-hidden ${isChat ? 'mt-[60px] md:mt-[68px]' : 'mt-[72px] overflow-y-auto'}`}>
        <div className={`flex-1 flex flex-col ${isChat ? 'w-full h-full' : 'max-w-[1920px] mx-auto w-full px-4 md:px-10 pb-10'}`}>
          {renderContent()}
        </div>
      </main>

      {!isChat && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setActiveTab('voice')}
            className="p-4 md:p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-600/40 transition-transform hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-pulse"></div>
              <svg className="w-6 h-6 md:w-8 md:h-8 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
