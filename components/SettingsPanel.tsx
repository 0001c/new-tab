import React, { useRef } from 'react';
import { X, Check, Upload, Layout, Palette, Image as ImageIcon } from 'lucide-react';
import { AppSettings, InteractionStyle } from '../types';
import { WALLPAPERS, THEME_COLORS } from '../constants';

interface SettingsPanelProps {
  isOpen?: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  settings,
  onSettingsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSettingsChange({
          wallpaper: reader.result as string,
          wallpaperType: 'upload'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getStyleClasses = () => {
    switch (settings.interactionStyle) {
      case InteractionStyle.TECH:
        return 'bg-black/90 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] font-mono rounded-none';
      case InteractionStyle.MINIMAL:
        return 'bg-white text-gray-900 border border-gray-200 shadow-xl rounded-lg';
      case InteractionStyle.FLUID:
      default:
        return 'bg-gray-900/60 backdrop-blur-xl border border-white/10 text-white rounded-3xl shadow-2xl';
    }
  };

  const textColor = settings.interactionStyle === InteractionStyle.MINIMAL ? 'text-gray-900' : 'text-white';
  const subTextColor = settings.interactionStyle === InteractionStyle.MINIMAL ? 'text-gray-500' : 'text-gray-400';
  const sectionTitle = `text-sm font-bold uppercase tracking-wider mb-3 ${subTextColor}`;

  return (
      <div className={`relative w-full max-h-[85vh] overflow-hidden flex flex-col animate-slide-up ${getStyleClasses()} h-full`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${settings.interactionStyle === InteractionStyle.MINIMAL ? 'border-gray-100' : 'border-white/10'}`}>
          <h2 className={`text-xl font-semibold ${textColor} flex items-center gap-2`}>
             Customize Nexus
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${textColor}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Style Selection */}
          <section>
            <h3 className={sectionTitle}>Interaction Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: InteractionStyle.FLUID, name: 'Fluid', desc: 'Soft, rounded, blurred' },
                { id: InteractionStyle.TECH, name: 'Tech', desc: 'Sharp, neon, mono' },
                { id: InteractionStyle.MINIMAL, name: 'Minimal', desc: 'Clean, flat, airy' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => onSettingsChange({ interactionStyle: style.id })}
                  className={`relative p-4 text-left transition-all border ${
                    settings.interactionStyle === style.id
                      ? `border-[${settings.themeColor}] bg-[${settings.themeColor}]/10 ring-2 ring-[${settings.themeColor}]`
                      : `border-transparent hover:bg-white/5`
                  } ${settings.interactionStyle === InteractionStyle.FLUID ? 'rounded-2xl' : settings.interactionStyle === InteractionStyle.MINIMAL ? 'rounded-lg' : 'rounded-none'}`}
                >
                  <div className={`font-medium ${textColor}`}>{style.name}</div>
                  <div className={`text-xs ${subTextColor} mt-1`}>{style.desc}</div>
                  {settings.interactionStyle === style.id && (
                    <div className="absolute top-3 right-3 text-current">
                       <Check size={16} color={settings.themeColor} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Theme Color */}
          <section>
            <h3 className={sectionTitle}>Accent Color</h3>
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onSettingsChange({ themeColor: color })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    settings.themeColor === color ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {settings.themeColor === color && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </section>

          {/* Wallpaper */}
          <section>
            <h3 className={sectionTitle}>Background</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                 onClick={() => fileInputRef.current?.click()}
                 className={`aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed ${settings.interactionStyle === InteractionStyle.MINIMAL ? 'border-gray-300 hover:border-gray-400' : 'border-white/20 hover:border-white/40'} rounded-lg transition-colors group`}
              >
                <Upload size={20} className={subTextColor} />
                <span className={`text-xs font-medium ${subTextColor}`}>Upload</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </button>

              {WALLPAPERS.map((wp, idx) => (
                <button
                  key={idx}
                  onClick={() => onSettingsChange({ wallpaper: wp, wallpaperType: 'url' })}
                  className={`relative aspect-video rounded-lg overflow-hidden group border-2 transition-all ${
                    settings.wallpaper === wp ? `border-[${settings.themeColor}]` : 'border-transparent'
                  }`}
                  style={{ borderColor: settings.wallpaper === wp ? settings.themeColor : 'transparent' }}
                >
                  <img src={wp} alt="Wallpaper" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  {settings.wallpaper === wp && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Check className="text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
  );
};

export default SettingsPanel;
