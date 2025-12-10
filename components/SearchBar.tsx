import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, X, Clock } from 'lucide-react';
import { InteractionStyle } from '../types';
import { SEARCH_ENGINES } from '../constants';

interface SearchBarProps {
  style: InteractionStyle;
  themeColor: string;
  engineId: string;
  setEngineId: (id: string) => void;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  style,
  themeColor,
  engineId,
  setEngineId,
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownStateRef = useRef<'history' | 'suggestions' | 'closed'>('closed');

  // 加载搜索历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存搜索历史记录
  const saveSearchHistory = (term: string) => {
    if (!term.trim()) return;
    
    const updatedHistory = [
      term,
      ...searchHistory.filter(item => item !== term)
    ].slice(0, 10);
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // 删除搜索历史记录
  const deleteSearchHistoryItem = (term: string) => {
    const updatedHistory = searchHistory.filter(item => item !== term);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // 清空搜索历史记录
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const activeEngine = SEARCH_ENGINES.find(e => e.id === engineId) || SEARCH_ENGINES[0];

  // Simulating suggestions (In a real app, you might fetch these from a proxy)
  useEffect(() => {
    if (query.trim().length > 0 && isFocused) {
      // Mock suggestions
      const mocks = [
        `${query} news`,
        `${query} wiki`,
        `${query} images`,
        `${query} reddit`,
        `best ${query} 2024`
      ];
      setSuggestions(mocks);
      dropdownStateRef.current = 'suggestions';
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      if (isFocused) {
        dropdownStateRef.current = 'history';
      } else {
        dropdownStateRef.current = 'closed';
      }
      setSelectedIndex(-1);
    }
  }, [query, isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // 键盘导航
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const isHistoryMode = dropdownStateRef.current === 'history';
    const isSuggestionsMode = dropdownStateRef.current === 'suggestions';
    const items = isHistoryMode ? searchHistory : suggestions;
    const itemCount = items.length;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => (prev < itemCount - 1 ? prev + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : itemCount - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < itemCount) {
        const selectedItem = items[selectedIndex];
        setQuery(selectedItem);
        onSearch(selectedItem);
        if (isHistoryMode) {
          // 重新排序历史记录
          saveSearchHistory(selectedItem);
        } else {
          // 添加到历史记录
          saveSearchHistory(selectedItem);
        }
        setIsFocused(false);
      } else if (query.trim()) {
        // 如果没有选中任何建议/历史记录，执行搜索
        onSearch(query);
        saveSearchHistory(query);
        setIsFocused(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      saveSearchHistory(query);
      setIsFocused(false);
    }
  };

  // 处理点击搜索建议
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    saveSearchHistory(suggestion);
    setIsFocused(false);
  };

  // 处理点击历史记录
  const handleHistoryClick = (term: string) => {
    setQuery(term);
    onSearch(term);
    // 重新排序历史记录
    saveSearchHistory(term);
    setIsFocused(false);
  };

  // Styles based on settings
  const getContainerStyle = () => {
    if (style === InteractionStyle.TECH) {
      return `border-2 bg-black/90 shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-none font-mono`;
    }
    if (style === InteractionStyle.MINIMAL) {
      return `bg-white border border-gray-200 shadow-lg rounded-xl text-gray-800`;
    }
    // Fluid
    return `bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full text-white`;
  };

  const getFocusStyle = () => {
    if (!isFocused) return '';
    if (style === InteractionStyle.TECH) return `shadow-[0_0_25px_${themeColor}]`;
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
        {/* Main Input Bar */}
        <form 
          onSubmit={handleSubmit}
          className={`relative flex items-center h-16 px-4 transition-all duration-300 ${getContainerStyle()} ${getFocusStyle()}`}
        >
          {/* Engine Selector */}
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

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${activeEngine.name} or type a URL`}
            className={`flex-1 bg-transparent border-none outline-none h-full text-lg px-2 ${textColor} ${placeholderColor}`}
            aria-autocomplete="both"
            aria-haspopup="listbox"
            aria-expanded={isFocused && (searchHistory.length > 0 || suggestions.length > 0)}
            aria-activedescendant={selectedIndex >= 0 ? `search-item-${selectedIndex}` : undefined}
          />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {query && (
              <button 
                type="submit"
                className={`p-2 rounded-full transition-colors ${
                  style === InteractionStyle.MINIMAL ? 'bg-gray-100 hover:bg-gray-200 text-black' : 'hover:bg-white/10 text-white'
                }`}
              >
                <ArrowRight size={20} />
              </button>
            )}
            <div className={`hidden md:flex items-center gap-1 text-xs opacity-40 ml-2 border border-current rounded px-1.5 py-0.5 ${textColor}`}>
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </form>

        {/* Suggestions/History Dropdown */}
        {isFocused && (searchHistory.length > 0 || suggestions.length > 0) && (
          <div 
            ref={dropdownRef}
            className={`absolute top-full left-0 right-0 mt-2 overflow-hidden z-30 animate-slide-up origin-top ${
              style === InteractionStyle.TECH 
                ? 'bg-black/95 border border-cyan-500/30 rounded-none' 
                : style === InteractionStyle.MINIMAL
                ? 'bg-white border border-gray-100 rounded-lg shadow-xl'
                : 'bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl'
            }`}
            role="listbox"
            aria-label={dropdownStateRef.current === 'history' ? 'Search History' : 'Search Suggestions'}
          >
            {/* 显示搜索历史记录 */}
            {query.trim() === '' && searchHistory.length > 0 && (
              <>
                <div className={`px-5 py-2 flex items-center justify-between ${textColor} text-sm font-medium opacity-70 border-b ${style === InteractionStyle.MINIMAL ? 'border-gray-100' : 'border-white/10'}`}>
                  <span>搜索历史</span>
                  <button 
                    onClick={clearSearchHistory}
                    className={`text-xs hover:opacity-100 transition-opacity ${
                      style === InteractionStyle.MINIMAL ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    清空
                  </button>
                </div>
                {searchHistory.map((term, idx) => (
                  <button
                    key={`history-${idx}`}
                    id={`search-item-${idx}`}
                    onClick={() => handleHistoryClick(term)}
                    className={`w-full text-left px-5 py-3 flex items-center justify-between gap-3 transition-colors ${
                      style === InteractionStyle.MINIMAL 
                        ? `text-gray-700 ${selectedIndex === idx ? 'bg-gray-50' : 'hover:bg-gray-50'}` 
                        : `text-gray-200 ${selectedIndex === idx ? 'bg-white/10' : 'hover:bg-white/10'}`
                    }`}
                    role="option"
                    aria-selected={selectedIndex === idx}
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="opacity-50" />
                      <span>{term}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSearchHistoryItem(term);
                      }}
                      className={`p-1 rounded-full hover:bg-white/10 transition-colors opacity-0 hover:opacity-100 ${
                        style === InteractionStyle.MINIMAL ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-200'
                      }`}
                      aria-label={`删除历史记录: ${term}`}
                    >
                      <X size={14} />
                    </button>
                  </button>
                ))}
              </>
            )}

            {/* 显示搜索建议 */}
            {query.trim() !== '' && suggestions.length > 0 && (
              <>
                <div className={`px-5 py-2 ${textColor} text-sm font-medium opacity-70 border-b ${style === InteractionStyle.MINIMAL ? 'border-gray-100' : 'border-white/10'}`}>
                  搜索建议
                </div>
                {suggestions.map((s, idx) => (
                  <button
                    key={`suggestion-${idx}`}
                    id={`search-item-${idx}`}
                    onClick={() => handleSuggestionClick(s)}
                    className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${
                      style === InteractionStyle.MINIMAL 
                        ? `text-gray-700 ${selectedIndex === idx ? 'bg-gray-50' : 'hover:bg-gray-50'}` 
                        : `text-gray-200 ${selectedIndex === idx ? 'bg-white/10' : 'hover:bg-white/10'}`
                    }`}
                    role="option"
                    aria-selected={selectedIndex === idx}
                  >
                    <Search size={14} className="opacity-50" />
                    <span>{s}</span>
                  </button>
                ))}
              </>
            )}
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