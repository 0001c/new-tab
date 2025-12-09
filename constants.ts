import { InteractionStyle, SearchEngine, Shortcut } from './types';

export const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', urlTemplate: 'https://www.google.com/search?q=', icon: 'google' },
  { id: 'bing', name: 'Bing', urlTemplate: 'https://www.bing.com/search?q=', icon: 'bing' },
  { id: 'duckduckgo', name: 'DuckDuckGo', urlTemplate: 'https://duckduckgo.com/?q=', icon: 'search' },
  { id: 'youtube', name: 'YouTube', urlTemplate: 'https://www.youtube.com/results?search_query=', icon: 'youtube' },
];

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: '1', title: 'YouTube', url: 'https://youtube.com' },
  { id: '2', title: 'GitHub', url: 'https://github.com' },
  { id: '3', title: 'Gmail', url: 'https://mail.google.com' },
  { id: '4', title: 'Twitter', url: 'https://twitter.com' },
];

export const WALLPAPERS = [
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070', // Dark Mountains
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072', // Space/Tech
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=2070', // Minimal Alpine
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070', // Fluid Liquid
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=2070', // Abstract Gradient
];

export const THEME_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#64748b', // Slate
];

export const DEFAULT_SETTINGS = {
  wallpaper: WALLPAPERS[0],
  wallpaperType: 'url' as const,
  themeColor: '#3b82f6',
  interactionStyle: InteractionStyle.FLUID,
  blurStrength: 'high' as const,
  engineId: 'google',
  defaultAIModel: 'QWEN' as const,
};
