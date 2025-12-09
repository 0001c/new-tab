import React, { useState, useEffect } from 'react';
import { Settings, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import SearchBar from './components/SearchBar';
import QuickLinks from './components/QuickLinks';
import SettingsPanel from './components/SettingsPanel';
import ChatInterface from './components/ChatInterface';
import { AppSettings, InteractionStyle, SearchMode, Shortcut, ChatMessage } from './types';
import { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS, SEARCH_ENGINES } from './constants';
import { askGemini } from './services/geminiService';

const App: React.FC = () => {
  // State initialization with localStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nexus_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const saved = localStorage.getItem('nexus_shortcuts');
    return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  });

  // View State: 'dashboard' or 'chat'
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat'>('dashboard');
  
  const [searchMode, setSearchMode] = useState<SearchMode>(SearchMode.WEB);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // AI State
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiModalExpanded, setIsAiModalExpanded] = useState(false);
  
  // Chat History for transition
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('nexus_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nexus_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  // Handle Search
  const handleSearch = async (query: string, mode: SearchMode) => {
    setCurrentQuery(query);
    if (mode === SearchMode.WEB) {
      const engine = SEARCH_ENGINES.find(e => e.id === settings.engineId) || SEARCH_ENGINES[0];
      // Check if query is URL
      const isUrl = /^(http|https):\/\/[^ "]+$/.test(query) || /^www\.[^ "]+$/.test(query) || (query.includes('.') && !query.includes(' '));
      if (isUrl) {
        window.location.href = query.startsWith('http') ? query : `https://${query}`;
      } else {
        window.location.href = `${engine.urlTemplate}${encodeURIComponent(query)}`;
      }
    } else {
      // AI Mode
      setIsAiModalOpen(true);
      setIsAiModalExpanded(false);
      setIsAiLoading(true);
      setAiResponse(null);
      
      const response = await askGemini(query);
      
      setAiResponse(response);
      setIsAiLoading(false);
      
      // Store history in case user wants to switch to chat view
      setChatHistory([
        { role: 'user', text: query },
        { role: 'model', text: response }
      ]);
    }
  };

  const switchToChat = () => {
    setIsAiModalOpen(false);
    setCurrentView('chat');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Dynamic Styles for Background
  const getBackgroundStyle = () => {
    return {
      backgroundImage: `url(${settings.wallpaper})`,
      filter: settings.interactionStyle === InteractionStyle.MINIMAL ? 'none' : 'brightness(0.7)'
    };
  };

  // Overlay for readability
  const getOverlayClass = () => {
    if (settings.interactionStyle === InteractionStyle.MINIMAL) {
      return 'bg-white/90';
    }
    if (settings.interactionStyle === InteractionStyle.TECH) {
      return 'bg-black/60 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.1)_0%,_transparent_70%)]';
    }
    return 'bg-black/30 backdrop-blur-sm';
  };

  // Render Full Chat View
  if (currentView === 'chat') {
    return (
      <div className={`relative min-h-screen w-full flex flex-col ${settings.interactionStyle === InteractionStyle.TECH ? 'font-mono' : 'font-sans'}`}>
        <div className="fixed inset-0 bg-cover bg-center -z-20" style={getBackgroundStyle()} />
        <div className={`fixed inset-0 -z-10 ${getOverlayClass()}`} />
        <ChatInterface 
          initialMessages={chatHistory} 
          onBack={() => setCurrentView('dashboard')}
          settings={settings}
        />
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className={`relative min-h-screen w-full overflow-hidden flex flex-col ${settings.interactionStyle === InteractionStyle.TECH ? 'font-mono' : 'font-sans'}`}>
      
      {/* Background Layer */}
      <div className="fixed inset-0 bg-cover bg-center transition-all duration-700 ease-in-out -z-20" style={getBackgroundStyle()} />
      <div className={`fixed inset-0 -z-10 transition-colors duration-500 ${getOverlayClass()}`} />

      {/* Header / Top Right Controls */}
      <div className="absolute top-0 right-0 p-6 z-50 flex gap-4">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className={`p-3 rounded-full transition-all duration-300 hover:rotate-90 ${
            settings.interactionStyle === InteractionStyle.MINIMAL 
              ? 'bg-white shadow-md text-gray-800' 
              : 'bg-black/20 backdrop-blur-md text-white hover:bg-white/20'
          }`}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center gap-12 animate-fade-in">
          
          {/* Greeting / Clock */}
          <div className={`text-center transition-colors ${settings.interactionStyle === InteractionStyle.MINIMAL ? 'text-gray-800' : 'text-white'}`}>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-2 opacity-90">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-lg opacity-70 font-light">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <SearchBar 
            mode={searchMode} 
            setMode={setSearchMode} 
            style={settings.interactionStyle}
            themeColor={settings.themeColor}
            engineId={settings.engineId}
            setEngineId={(id) => updateSettings({ engineId: id })}
            onSearch={handleSearch}
            isAiLoading={isAiLoading}
          />

          <QuickLinks 
            shortcuts={shortcuts} 
            setShortcuts={setShortcuts} 
            style={settings.interactionStyle}
            themeColor={settings.themeColor}
          />

        </div>
      </main>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        updateSettings={updateSettings}
      />

      {/* AI Result Modal */}
      {isAiModalOpen && (
        <div 
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in ${isAiModalExpanded ? 'p-0' : 'p-4'}`}
          onClick={() => setIsAiModalOpen(false)}
        >
          <div 
            className={`flex flex-col overflow-hidden animate-slide-up transition-all duration-300 ${
              settings.interactionStyle === InteractionStyle.MINIMAL 
                ? 'bg-white shadow-2xl text-gray-900' 
                : 'bg-gray-900/90 backdrop-blur-xl border border-white/10 text-white'
            } ${isAiModalExpanded ? 'w-full h-full rounded-none border-none' : 'w-full max-w-3xl max-h-[80vh] rounded-3xl'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200/10 shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Gemini AI Response
              </h3>
              <div className="flex gap-2">
                 {/* Chat Mode Button */}
                 {!isAiLoading && (
                   <button 
                     onClick={switchToChat}
                     className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 hover:text-purple-200 rounded-full transition-colors border border-purple-500/30"
                     title="Continue in Chat"
                   >
                      <MessageSquare size={16} />
                      <span className="hidden sm:inline">Continue Chat</span>
                   </button>
                 )}
                 <button 
                   onClick={() => setIsAiModalExpanded(!isAiModalExpanded)} 
                   className="p-2 hover:bg-white/10 rounded-full transition-colors"
                   title={isAiModalExpanded ? "Minimize" : "Maximize"}
                 >
                    {isAiModalExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                 </button>
                 <button 
                  onClick={() => setIsAiModalOpen(false)} 
                  className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 leading-relaxed">
              {isAiLoading ? (
                 <div className="flex flex-col items-center justify-center h-48 gap-4 opacity-70">
                   <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-sm font-medium animate-pulse">Thinking...</p>
                 </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {/* Simple rendering of text with line breaks */}
                  {aiResponse?.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 min-h-[1em]">{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;