import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import SearchBar from './components/SearchBar';
import QuickLinks from './components/QuickLinks';
import SettingsPanel from './components/SettingsPanel';
import { AppSettings, InteractionStyle, Shortcut } from './types';
import { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS, SEARCH_ENGINES } from './constants';

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
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('nexus_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nexus_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  // Handle Search
  const handleSearch = async (query: string) => {
    const engine = SEARCH_ENGINES.find(e => e.id === settings.engineId) || SEARCH_ENGINES[0];
    // Check if query is URL
    const isUrl = /^(http|https):\/\/[^ "]+$/.test(query) || /^www\.[^ "]+$/.test(query) || (query.includes('.') && !query.includes(' '));
    if (isUrl) {
      window.location.href = query.startsWith('http') ? query : `https://${query}`;
    } else {
      window.location.href = `${engine.urlTemplate}${encodeURIComponent(query)}`;
    }
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
          <div className="text-center transition-colors" style={{ color: settings.interactionStyle === InteractionStyle.MINIMAL ? '#1f2937' : settings.themeColor }}>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-2 opacity-90">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-lg opacity-70 font-light" style={{ color: settings.interactionStyle === InteractionStyle.MINIMAL ? '#4b5563' : settings.themeColor }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <SearchBar 
            style={settings.interactionStyle}
            themeColor={settings.themeColor}
            engineId={settings.engineId}
            setEngineId={(id) => updateSettings({ engineId: id })}
            onSearch={handleSearch}
          />

          <QuickLinks 
            shortcuts={shortcuts} 
            setShortcuts={setShortcuts} 
            style={settings.interactionStyle}
            themeColor={settings.themeColor}
          />

        </div>
      </main>

      {/* Settings Panel - Only renders when open */}
      {isSettingsOpen && (
        <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-black/50 backdrop-blur-sm z-50 transform transition-transform duration-300 translate-x-0`}>
          <SettingsPanel 
            onClose={() => setIsSettingsOpen(false)} 
            settings={settings}
            onSettingsChange={updateSettings}
          />
        </div>
      )}
      {/* Background overlay - Only renders when settings panel is open */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;