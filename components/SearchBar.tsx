import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Command, ArrowRight, Loader2, Globe, X } from 'lucide-react';
import { SearchMode, SearchEngine, InteractionStyle } from '../types';
import { SEARCH_ENGINES } from '../constants';

interface SearchBarProps {
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  style: InteractionStyle;
  themeColor: string;
  engineId: string;
  setEngineId: (id: string) => void;
  onSearch: (query: string, mode: SearchMode) => void;
  isAiLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  mode,
  setMode,
  style,
  themeColor,
  engineId,
  setEngineId,
  onSearch,
  isAiLoading
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeEngine = SEARCH_ENGINES.find(e => e.id === engineId) || SEARCH_ENGINES[0];

  // Simulating suggestions (In a real app, you might fetch these from a proxy)
  useEffect(() => {
    if (query.trim().length > 0 && isFocused && mode === SearchMode.WEB) {
      // Mock suggestions
      const mocks = [
        `${query} news`,
        `${query} wiki`,
        `${query} images`,
        `${query} reddit`,
        `best ${query} 2024`
      ];
      setSuggestions(mocks);
    } else {
      setSuggestions([]);
    }
  }, [query, isFocused, mode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, mode);
      setIsFocused(false);
    }
  };

  // Styles based on settings
  const getContainerStyle = () => {
    if (style === InteractionStyle.TECH) {
      return `border-2 border-cyan-500/50 bg-black/90 shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-none font-mono`;
    }
    if (style === InteractionStyle.MINIMAL) {
      return `bg-white border border-gray-200 shadow-lg rounded-xl text-gray-800`;
    }
    // Fluid
    return `bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full text-white`;
  };

  const getFocusStyle = () => {
    if (!isFocused) return '';
    if (style === InteractionStyle.TECH) return 'shadow-[0_0_25px_cyan] border-cyan-400';
    if (style === InteractionStyle.MINIMAL) return 'ring-2 ring-gray-100 border-gray-300';
    return 'bg-white/20 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.2)]';
  };

  const getModalStyle = () => {
    if (style === InteractionStyle.TECH) {
      return `bg-black border border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] text-cyan-500 font-mono rounded-none`;
    }
    if (style === InteractionStyle.MINIMAL) {
      return `bg-white border border-gray-200 shadow-2xl rounded-2xl text-gray-900`;
    }
    return `bg-gray-900/90 backdrop-blur-xl border border-white/10 text-white rounded-3xl shadow-2xl`;
  };

  const textColor = style === InteractionStyle.MINIMAL ? 'text-gray-900' : 'text-white';
  const placeholderColor = style === InteractionStyle.MINIMAL ? 'placeholder-gray-400' : 'placeholder-white/50';

  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto z-40 transition-all duration-300">
        
        {/* Mode Switcher */}
        <div className="absolute -top-12 left-0 right-0 flex justify-center gap-4 mb-4">
          <button
            onClick={() => setMode(SearchMode.WEB)}
            className={`flex items-center gap-2 px-4 py-2 transition-all ${style === InteractionStyle.FLUID ? 'rounded-full' : 'rounded-none'} ${
              mode === SearchMode.WEB 
                ? `bg-white text-black font-semibold shadow-lg scale-105` 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Globe size={16} />
            <span>Web Search</span>
          </button>
          <button
            onClick={() => setMode(SearchMode.AI)}
            className={`flex items-center gap-2 px-4 py-2 transition-all ${style === InteractionStyle.FLUID ? 'rounded-full' : 'rounded-none'} ${
              mode === SearchMode.AI 
                ? `bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30 scale-105` 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles size={16} />
            <span>Ask AI</span>
          </button>
        </div>

        {/* Main Input Bar */}
        <form 
          onSubmit={handleSubmit}
          className={`relative flex items-center h-16 px-4 transition-all duration-300 ${getContainerStyle()} ${getFocusStyle()}`}
        >
          {/* Engine Selector (Web Mode Only) */}
          {mode === SearchMode.WEB && (
            <div className="mr-2">
              <button 
                type="button" 
                onClick={() => setIsEngineModalOpen(true)}
                className={`p-2 rounded-lg opacity-80 hover:opacity-100 hover:bg-white/10 transition-all ${textColor}`}
                title="Change Search Engine"
              >
                {/* Simplified Icons */}
                {activeEngine.id === 'google' && <span className="font-bold text-lg">G</span>}
                {activeEngine.id === 'bing' && <span className="font-bold text-lg">b</span>}
                {activeEngine.id === 'duckduckgo' && <span className="font-bold text-lg">D</span>}
                {activeEngine.id === 'youtube' && <span className="font-bold text-lg">Y</span>}
              </button>
            </div>
          )}

          {/* AI Icon */}
          {mode === SearchMode.AI && (
            <div className="mr-3 animate-pulse-slow">
              <Sparkles className="text-pink-400" />
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={mode === SearchMode.WEB ? `Search ${activeEngine.name} or type a URL` : "Ask anything..."}
            className={`flex-1 bg-transparent border-none outline-none h-full text-lg px-2 ${textColor} ${placeholderColor}`}
            autoFocus
          />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAiLoading ? (
              <Loader2 className="animate-spin text-purple-400" />
            ) : (
              query && (
                <button 
                  type="submit"
                  className={`p-2 rounded-full transition-colors ${
                    style === InteractionStyle.MINIMAL ? 'bg-gray-100 hover:bg-gray-200 text-black' : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <ArrowRight size={20} />
                </button>
              )
            )}
            <div className={`hidden md:flex items-center gap-1 text-xs opacity-40 ml-2 border border-current rounded px-1.5 py-0.5 ${textColor}`}>
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {isFocused && suggestions.length > 0 && mode === SearchMode.WEB && (
          <div 
            ref={dropdownRef}
            className={`absolute top-full left-0 right-0 mt-2 overflow-hidden z-30 animate-slide-up origin-top ${
              style === InteractionStyle.TECH 
                ? 'bg-black/95 border border-cyan-500/30 rounded-none' 
                : style === InteractionStyle.MINIMAL
                ? 'bg-white border border-gray-100 rounded-lg shadow-xl'
                : 'bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl'
            }`}
          >
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(s);
                  onSearch(s, mode);
                }}
                className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${
                  style === InteractionStyle.MINIMAL 
                    ? 'text-gray-700 hover:bg-gray-50' 
                    : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                <Search size={14} className="opacity-50" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Engine Selection Modal */}
      {isEngineModalOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsEngineModalOpen(false)}
        >
          <div 
            className={`w-full max-w-sm p-6 animate-slide-up ${getModalStyle()}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Select Search Engine</h3>
              <button 
                onClick={() => setIsEngineModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="opacity-70 hover:opacity-100" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {SEARCH_ENGINES.map(e => (
                <button
                  key={e.id}
                  onClick={() => {
                    setEngineId(e.id);
                    setIsEngineModalOpen(false);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                    engineId === e.id 
                      ? `border-[${themeColor}] bg-[${themeColor}]/10 ring-1 ring-[${themeColor}]`
                      : 'border-transparent hover:bg-white/5'
                  } ${style === InteractionStyle.TECH ? 'rounded-none' : ''}`}
                  style={{ 
                    borderColor: engineId === e.id ? themeColor : 'transparent',
                    backgroundColor: engineId === e.id ? `${themeColor}1A` : undefined // 1A is 10% opacity hex
                  }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${
                    style === InteractionStyle.MINIMAL ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-white'
                  }`}>
                    {e.id === 'google' && 'G'}
                    {e.id === 'bing' && 'b'}
                    {e.id === 'duckduckgo' && 'D'}
                    {e.id === 'youtube' && 'Y'}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-lg">{e.name}</span>
                    <span className={`text-xs ${style === InteractionStyle.MINIMAL ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new URL(e.urlTemplate).hostname}
                    </span>
                  </div>
                  {engineId === e.id && (
                    <div className="ml-auto w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;