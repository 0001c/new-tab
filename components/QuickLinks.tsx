import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Globe, Trash2 } from 'lucide-react';
import { Shortcut, InteractionStyle, PresetShortcut } from '../types';
import presetShortcuts from '../data/presetshortcut.json';
import gsap from 'gsap';

interface QuickLinksProps {
  shortcuts: Shortcut[];
  setShortcuts: (shortcuts: Shortcut[]) => void;
  style: InteractionStyle;
  themeColor: string;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ shortcuts, setShortcuts, style, themeColor }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filteredPresetShortcuts, setFilteredPresetShortcuts] = useState<PresetShortcut[]>([]);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  
  // 获取所有分类
  const categories = ['ALL', ...Array.from(new Set(presetShortcuts.map((item: PresetShortcut) => item.category)))];
  
  // 过滤预设网站
  useEffect(() => {
    let filtered = presetShortcuts;
    
    // 按分类过滤
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((item: PresetShortcut) => item.category === selectedCategory);
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter((item: PresetShortcut) => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 按流行度排序
    filtered = [...filtered].sort((a: PresetShortcut, b: PresetShortcut) => b.popularity - a.popularity);
    
    // 如果不是动画过程中，直接更新
    if (!isAnimating) {
      setFilteredPresetShortcuts(filtered);
    }
  }, [searchTerm, selectedCategory, isAnimating]);

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  };

  const handleAddPresetShortcut = (preset: PresetShortcut) => {
    // 检查是否已经存在相同的网站
    const isDuplicate = shortcuts.some(shortcut => {
      // 标准化URL进行比较
      const normalizeUrl = (url: string) => {
        let normalizedUrl = url.toLowerCase();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = 'https://' + normalizedUrl;
        }
        return normalizedUrl;
      };
      
      return normalizeUrl(shortcut.url) === normalizeUrl(preset.url);
    });
    
    if (isDuplicate) {
      // 如果网站已存在，显示提示信息
      setShowDuplicateAlert(true);
      setTimeout(() => setShowDuplicateAlert(false), 3000);
      return;
    }
    
    const newShortcut: Shortcut = {
      id: Date.now().toString(),
      title: preset.title,
      url: preset.url
    };
    
    setShortcuts([...shortcuts, newShortcut]);
    setIsAdding(false);
    setSearchTerm('');
    setSelectedCategory('ALL');
  };
  
  const handleAdd = () => {
    if (!newLink.url) return;
    
    let formattedUrl = newLink.url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
    }
    
    // 检查是否已经存在相同的网站
    const isDuplicate = shortcuts.some(shortcut => {
      // 标准化URL进行比较
      const normalizeUrl = (url: string) => {
        let normalizedUrl = url.toLowerCase();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = 'https://' + normalizedUrl;
        }
        return normalizedUrl;
      };
      
      return normalizeUrl(shortcut.url) === normalizeUrl(formattedUrl);
    });
    
    if (isDuplicate) {
      // 如果网站已存在，显示提示信息
      setShowDuplicateAlert(true);
      setTimeout(() => setShowDuplicateAlert(false), 3000);
      return;
    }

    const newItem: Shortcut = {
      id: Date.now().toString(),
      title: newLink.title || newLink.url,
      url: formattedUrl,
    };
    setShortcuts([...shortcuts, newItem]);
    setIsAdding(false);
    setNewLink({ title: '', url: '' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShortcuts(shortcuts.filter(s => s.id !== id));
  };
  
  // 分类切换动画处理
  const handleCategoryChange = (newCategory: string) => {
    if (newCategory === selectedCategory || isAnimating) return;
    
    setIsAnimating(true);
    
    // 1. 确定需要隐藏和显示的卡片
    const cardsToHide: string[] = [];
    const cardsToShow: string[] = [];
    
    presetShortcuts.forEach((preset: PresetShortcut) => {
      if (selectedCategory === 'ALL' || preset.category === selectedCategory) {
        // 这些是当前显示的卡片
        if (newCategory !== 'ALL' && preset.category !== newCategory) {
          // 不是新分类的卡片需要隐藏
          cardsToHide.push(preset.id);
        }
      } else if (newCategory === 'ALL' || preset.category === newCategory) {
        // 这些是新分类需要显示的卡片
        cardsToShow.push(preset.id);
      }
    });
    
    // 2. 隐藏不需要的卡片
    const hideAnimations = cardsToHide.map(id => {
      const card = cardRefs.current.get(id);
      if (card) {
        return gsap.to(card, {
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
          ease: 'power2.inOut'
        });
      }
      return Promise.resolve();
    });
    
    // 3. 等待隐藏动画完成后显示新卡片
    Promise.all(hideAnimations).then(() => {
      // 更新分类
      setSelectedCategory(newCategory);
      
      // 4. 显示新卡片
      setTimeout(() => {
        const showAnimations = cardsToShow.map(id => {
          const card = cardRefs.current.get(id);
          if (card) {
            return gsap.fromTo(card, 
              { opacity: 0, scale: 0.8, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
          }
          return Promise.resolve();
        });
        
        // 5. 等待显示动画完成
        Promise.all(showAnimations).then(() => {
          setIsAnimating(false);
        });
      }, 50); // 小延迟以确保DOM已更新
    });
  };
  // 获取容器样式
  const getContainerStyle = () => {
    if (style === InteractionStyle.TECH) {
      return `border-2 bg-black/90 shadow-[0_0_30px_${themeColor}] rounded-none font-mono text-white placeholder-white/50`;
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
  const buttonClass = style === InteractionStyle.FLUID ? 'rounded-2xl' : style === InteractionStyle.MINIMAL ? 'rounded-lg' : 'rounded-none';
  const containerClass = style === InteractionStyle.TECH ? 'bg-black/80 border border-cyan-900/50' : style === InteractionStyle.MINIMAL ? 'bg-white/80 shadow-sm border border-gray-200' : 'bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20';
  const textClass = style === InteractionStyle.MINIMAL ? 'text-gray-800' : 'text-white';
  const iconClass = style === InteractionStyle.MINIMAL ? 'text-gray-600' : 'text-gray-200';
  
  // Apply theme color to specific elements
  const getAddButtonStyle = () => {
    if (style === InteractionStyle.TECH) {
      return { borderColor: themeColor };
    }
    return {};
  };
  
  const getAddModalStyle = () => {
    if (style === InteractionStyle.TECH) {
      return { borderColor: themeColor };
    }
    return {};
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {shortcuts.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className={`group relative flex flex-col items-center justify-center p-4 gap-3 transition-all duration-200 hover:scale-105 ${getContainerStyle()} ${buttonClass}`}
          >
            {/* Icon Container */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${getFocusStyle()}`}>
              <img 
                src={getFavicon(link.url)} 
                alt={link.title} 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe className={`hidden w-5 h-5 ${iconClass}`} />
            </div>
            <span className={`text-xs font-medium truncate w-full text-center ${textClass}`}>
              {link.title}
            </span>
            <button
              onClick={(e) => handleDelete(link.id, e)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </a>
        ))}

        {/* Add Button */}
        <button
          onClick={() => setIsAdding(true)}
          className={`flex flex-col items-center justify-center p-4 gap-3 transition-all opacity-60 hover:opacity-100 hover:scale-105 ${getContainerStyle()} ${buttonClass}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-dashed ${getContainerStyle()}`} style={getAddButtonStyle()}>
            <Plus className={iconClass} />
          </div>
          <span className={`text-xs font-medium ${textClass}`}>Add Shortcut</span>
        </button>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={() => {
          setIsAdding(false);
          setSearchTerm('');
          setSelectedCategory('ALL');
        }}>
          {/* Modal Content */}
          <div 
            className={`w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up ${getContainerStyle()} ${buttonClass}`}
            style={getAddModalStyle()}
            onClick={e => e.stopPropagation()}
          >
            {/* Duplicate Alert */}
            {showDuplicateAlert && (
              <div className="absolute top-4 right-4 left-4 z-10 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>该网站已经存在于您的快捷方式中！</span>
                </div>
              </div>
            )}
            
            <div className={`p-6 border-b ${getFocusStyle()}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${textClass}`}>Add Shortcut</h3>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setSearchTerm('');
                    setSelectedCategory('ALL');
                  }}
                  className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${iconClass}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search Box */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search websites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-white placeholder-white/50 ${getContainerStyle()} ${getFocusStyle()}`}
                  style={{ outline: 'none', boxShadow: `0 0 0 2px ${getFocusStyle()}` }}
                />
              </div>
              
              {/* Category Selection */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? `bg-[${themeColor}] text-white ${getContainerStyle()} ` : `${getFocusStyle()}`}`}
                    disabled={isAnimating}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Preset Websites List */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={containerRef}>
                {filteredPresetShortcuts.map((preset) => {
                  // 检查网站是否已经添加
                  const isAdded = shortcuts.some(shortcut => {
                    const normalizeUrl = (url: string) => {
                      let normalizedUrl = url.toLowerCase();
                      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
                        normalizedUrl = 'https://' + normalizedUrl;
                      }
                      return normalizedUrl;
                    };
                    
                    return normalizeUrl(shortcut.url) === normalizeUrl(preset.url);
                  });
                  
                  return (
                    <div
                      key={preset.id}
                      ref={(el) => {
                        if (el) {
                          cardRefs.current.set(preset.id, el);
                        } else {
                          cardRefs.current.delete(preset.id);
                        }
                      }}
                      onClick={() => !isAdded && handleAddPresetShortcut(preset)}
                      className={`${getContainerStyle()} border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative ${isAdded ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isAdded && (
                      <div className={`absolute top-2 right-2 bg-[${themeColor}] text-white text-xs px-2 py-1 rounded-full flex items-center ${getContainerStyle()}`}>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        已添加
                      </div>
                    )}
                      <div className="flex items-center mb-2">
                        <img
                          src={getFavicon(preset.url)}
                          alt=""
                          className="w-6 h-6 mr-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextElement = target.nextElementSibling as HTMLElement;
                            if (nextElement) nextElement.classList.remove('hidden');
                          }}
                        />
                        <Globe className="hidden w-6 h-6 mr-2 text-gray-400" />
                        <h4 className={`font-medium truncate ${textClass}`}>{preset.title}</h4>
                      </div>
                      <p className={`text-sm mb-2 line-clamp-2 ${getComputedStyle}`}>
                        {preset.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 text-white rounded-lg hover:opacity-90 dark:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getContainerStyle()}`} style={{ backgroundColor: themeColor }}>
                          {preset.category}
                        </span>
                        <span className={`text-xs ${style === InteractionStyle.MINIMAL ? 'text-gray-500' : 'text-gray-400'}`}>
                          Popularity: {preset.popularity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredPresetShortcuts.length === 0 && (
                <div className={`text-center py-8 ${style === InteractionStyle.MINIMAL ? 'text-gray-500' : 'text-gray-400'}`}>
                  No matching websites found
                </div>
              )}
            </div>
            
            {/* Custom Add Area */}
            <div className={`p-6 border-t ${style === InteractionStyle.TECH ? 'border-cyan-500/50' : style === InteractionStyle.MINIMAL ? 'border-gray-200' : 'border-white/10'}`}>
              <div className={`text-sm mb-3 ${style === InteractionStyle.MINIMAL ? 'text-gray-600' : 'text-gray-400'}`}>
                Or manually add a custom website:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Website title"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${getContainerStyle()} ${getFocusStyle()}`}
                  style={{ outline: 'none', boxShadow: `0 0 0 2px ${getContainerStyle()}` }}
                />
                <input
                  type="text"
                  placeholder="Website URL (e.g. youtube.com)"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${getContainerStyle()} ${getFocusStyle()}`}
                  style={{ outline: 'none', boxShadow: `0 0 0 2px ${getContainerStyle()}` }}
                />
                <button
                  onClick={handleAdd}
                  disabled={!newLink.url}
                  className={`px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  style={{ backgroundColor: themeColor }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickLinks;
