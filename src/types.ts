export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  fontSize: number; // in pixels
  fontFamily: string;
  animation: 'fade' | 'bounce' | 'slide-up' | 'zoom-in' | 'none';
}

export interface Sticker {
  id: string;
  type: 'emoji' | 'icon' | 'graphic';
  value: string; // emoji char or lucide icon name
  x: number; // percentage 0-100
  y: number; // percentage 0-100;
  scale: number;
}

export type VideoFilter = 'none' | 'glitch' | 'blur' | 'noir' | 'cyberpunk' | 'neon' | 'film';
export type SceneTransition = 'none' | 'fade' | 'slide-left' | 'zoom-in';

export interface Scene {
  id: string;
  duration: number; // duration in seconds
  backgroundColor: string;
  image?: string; // image source base64 or url
  imageName?: string;
  texts: TextOverlay[];
  stickers: Sticker[];
  filter: VideoFilter;
  transition: SceneTransition;
}

export interface Subtitle {
  id: string;
  text: string;
  start: number; // in seconds
  end: number; // in seconds
  language: string;
}

export interface AudioConfig {
  backgroundVolume: number; // 0-100
  voiceVolume: number; // 0-100
  micVolume: number; // 0-100
  backgroundTrackId: string; // 'lofi' | 'pop' | 'cyber' | 'none'
  micRecordingBlobUrl?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'document';
  url: string; // object URL or data URL
  size: string;
  contentSnippet?: string; // Preview snippet from document parsed
}

export interface Project {
  id: string;
  name: string;
  duration: number; // max 40 seconds
  scenes: Scene[];
  subtitles: Subtitle[];
  audio: AudioConfig;
  scriptText: string;
  language: 'it' | 'en' | 'es' | 'fr';
  updatedAt: string;
}

export interface BackgroundTrack {
  id: string;
  name: string;
  url: string;
  genre: string;
}

export interface TrendTopic {
  title: string;
  summary: string;
  source: string;
  tags: string[];
}
