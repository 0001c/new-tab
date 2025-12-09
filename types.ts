export enum SearchMode {
  WEB = 'WEB',
  AI = 'AI'
}

export enum InteractionStyle {
  FLUID = 'FLUID',   // Rounded, soft shadows, blur, apple-esque
  TECH = 'TECH',     // Sharp, neon, monospaced, cyberpunk-lite
  MINIMAL = 'MINIMAL' // Clean, flat, subtle, zen
}

export interface SearchEngine {
  id: string;
  name: string;
  urlTemplate: string; // e.g., "https://www.google.com/search?q="
  icon: string; // Lucid icon name or custom svg path
}

export interface Shortcut {
  id: string;
  title: string;
  url: string;
}

export interface AppSettings {
  wallpaper: string; // URL
  wallpaperType: 'url' | 'upload';
  themeColor: string; // Hex code
  interactionStyle: InteractionStyle;
  blurStrength: 'none' | 'low' | 'high';
  engineId: string;
}