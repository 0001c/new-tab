import { InteractionStyle, SearchEngine, Shortcut } from './types';

export const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', urlTemplate: 'https://www.google.com/search?q=', icon: 'google' },
  { id: 'bing', name: 'Bing', urlTemplate: 'https://www.bing.com/search?q=', icon: 'bing' },
  { id: 'duckduckgo', name: 'DuckDuckGo', urlTemplate: 'https://duckduckgo.com/?q=', icon: 'search' },
  { id: 'youtube', name: 'YouTube', urlTemplate: 'https://www.youtube.com/results?search_query=', icon: 'youtube' },
  { id: 'twitter', name: 'X', urlTemplate: 'https://x.com/search?q=', icon: 'twitter' },
  { id: 'github', name: 'GitHub', urlTemplate: 'https://github.com/search?q=', icon: 'github' },

];

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: '1', title: 'B站', url: 'https://www.bilibili.com' },
  { id: '2', title: 'GitHub', url: 'https://github.com' },
  { id: '3', title: '163邮箱', url: 'https://mail.163.com' },
  { id: '4', title: '52Pojie', url: 'https://www.52pojie.cn' },
  { id: '5', title: 'BizhiHui', url: 'https://www.bizhihui.com' },
  

];

export const WALLPAPERS = [
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070', // Dark Mountains
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072', // Space/Tech
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=2070', // Minimal Alpine
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070', // Fluid Liquid
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=2070', // Abstract Gradient
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2070', // Minimalistic Cityscape
  'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?cs=srgb&dl=pexels-suzyhazelwood-1629236.jpg&fm=jpg&w=6000&h=3376&_gl=1*16rvmm1*_ga*MTc1OTYwODI5LjE3NjUzNzc5NDU.*_ga_8JE65Q40S6*czE3NjUzNzc5NDUkbzEkZzEkdDE3NjUzNzc5NDckajU4JGwwJGgw',
  'https://images.pexels.com/photos/36487/above-adventure-aerial-air.jpg?cs=srgb&dl=pexels-bess-hamiti-83687-36487.jpg&fm=jpg&w=1920&h=1307&_gl=1*1wo8ppi*_ga*MTc1OTYwODI5LjE3NjUzNzc5NDU.*_ga_8JE65Q40S6*czE3NjUzNzc5NDUkbzEkZzEkdDE3NjUzNzgwMzEkajU3JGwwJGgw',
  'https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg',
  'https://images.pexels.com/photos/1646178/pexels-photo-1646178.jpeg',
  'https://images.pexels.com/photos/2775196/pexels-photo-2775196.jpeg',
  'https://images.pexels.com/photos/259915/pexels-photo-259915.jpeg',
  'https://s.panlai.com/zb_users/upload/2025/06/20250621184205175050252594020.jpg?x-oss-process=image/auto-orient,1/interlace,1/resize,m_fill,w_3840,h_2160',
  'https://s.panlai.com/upload/bizhihui_com_20231111165513169969291372319.jpg?x-oss-process=image/auto-orient,1/interlace,1/resize,m_fill,w_3840,h_2160'

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
