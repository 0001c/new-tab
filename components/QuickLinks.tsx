import React, { useState } from 'react';
import { Plus, X, Globe, Trash2 } from 'lucide-react';
import { Shortcut, InteractionStyle } from '../types';

interface QuickLinksProps {
  shortcuts: Shortcut[];
  setShortcuts: (shortcuts: Shortcut[]) => void;
  style: InteractionStyle;
  themeColor: string;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ shortcuts, setShortcuts, style, themeColor }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  };

  const handleAdd = () => {
    if (!newLink.url) return;
    
    let formattedUrl = newLink.url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
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

  const buttonClass = style === InteractionStyle.FLUID ? 'rounded-2xl' : style === InteractionStyle.MINIMAL ? 'rounded-lg' : 'rounded-none';
  const containerClass = style === InteractionStyle.TECH ? 'bg-black/80 border border-cyan-900/50' : style === InteractionStyle.MINIMAL ? 'bg-white/80 shadow-sm border border-gray-200' : 'bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20';
  const textClass = style === InteractionStyle.MINIMAL ? 'text-gray-800' : 'text-white';
  const iconClass = style === InteractionStyle.MINIMAL ? 'text-gray-600' : 'text-gray-200';

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {shortcuts.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className={`group relative flex flex-col items-center justify-center p-4 gap-3 transition-all duration-200 hover:scale-105 ${containerClass} ${buttonClass}`}
          >
            <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden`}>
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
          className={`flex flex-col items-center justify-center p-4 gap-3 transition-all opacity-60 hover:opacity-100 hover:scale-105 ${containerClass} ${buttonClass}`}
        >
          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-dashed ${style === InteractionStyle.MINIMAL ? 'border-gray-400' : 'border-white/30'}`}>
            <Plus className={iconClass} />
          </div>
          <span className={`text-xs font-medium ${textClass}`}>Add Shortcut</span>
        </button>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAdding(false)}>
          <div 
            className={`w-full max-w-sm p-6 space-y-4 animate-slide-up ${style === InteractionStyle.MINIMAL ? 'bg-white' : 'bg-gray-900 border border-white/10'} ${buttonClass}`}
            onClick={e => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold ${textClass}`}>Add Shortcut</h3>
            <input
              type="text"
              placeholder="Title (e.g. YouTube)"
              value={newLink.title}
              onChange={e => setNewLink({ ...newLink, title: e.target.value })}
              className={`w-full p-3 bg-transparent border rounded-lg focus:outline-none ${style === InteractionStyle.MINIMAL ? 'border-gray-300 text-gray-900' : 'border-white/20 text-white'}`}
            />
            <input
              type="text"
              placeholder="URL (e.g. youtube.com)"
              value={newLink.url}
              onChange={e => setNewLink({ ...newLink, url: e.target.value })}
              className={`w-full p-3 bg-transparent border rounded-lg focus:outline-none ${style === InteractionStyle.MINIMAL ? 'border-gray-300 text-gray-900' : 'border-white/20 text-white'}`}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsAdding(false)} className={`px-4 py-2 text-sm ${textClass} hover:opacity-70`}>Cancel</button>
              <button 
                onClick={handleAdd}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-transform active:scale-95`}
                style={{ backgroundColor: themeColor }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickLinks;
