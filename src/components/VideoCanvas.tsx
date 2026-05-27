import React, { useState, useEffect, useRef } from 'react';
import { Project, Scene, TextOverlay, Sticker } from '../types';
import { Play, Pause, RotateCw, PlusCircle, AlignCenter, Text, Sparkles, Smile, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoCanvasProps {
  project: Project;
  currentSceneId: string;
  onSelectScene: (id: string) => void;
  onUpdateScene: (sceneId: string, updated: Partial<Scene>) => void;
  language: 'it' | 'en' | 'es' | 'fr';
}

const FONT_PRESETS = [
  { value: 'Inter, sans-serif', name: 'Clean Sans' },
  { value: '"Space Grotesk", sans-serif', name: 'Tech Bold' },
  { value: '"Playfair Display", serif', name: 'Vintage Editorial' },
  { value: '"JetBrains Mono", monospace', name: 'Brutalist Code' },
];

const ANIMATION_PRESETS = [
  { value: 'none', name: 'Statico' },
  { value: 'bounce', name: 'Rimbalzo' },
  { value: 'fade', name: 'Dissolvenza' },
  { value: 'slide-up', name: 'Scivola Sù' },
  { value: 'zoom-in', name: 'Zoom In' },
];

const EMOJI_STICKERS = ["🔥", "✨", "💥", "👑", "🚀", "🍕", "💯", "🎉", "💡", "⚠️", "🎮", "🌟"];

export default function VideoCanvas({
  project,
  currentSceneId,
  onSelectScene,
  onUpdateScene,
  language
}: VideoCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Calculate cumulative scene timestamps
  // sceneTimes represents pairs of [start, end] for each scene index
  const sceneTimeRanges: { sceneId: string; start: number; end: number }[] = [];
  let accumTime = 0;
  project.scenes.forEach((scene) => {
    sceneTimeRanges.push({
      sceneId: scene.id,
      start: accumTime,
      end: accumTime + scene.duration,
    });
    accumTime += scene.duration;
  });

  const totalDuration = accumTime;

  // Find the scene corresponding to the current playbackTime
  const activeSceneIndex = sceneTimeRanges.findIndex(
    (range) => playbackTime >= range.start && playbackTime < range.end
  );
  
  const activeSceneId = activeSceneIndex >= 0 
    ? sceneTimeRanges[activeSceneIndex].sceneId 
    : project.scenes[project.scenes.length - 1]?.id;

  const activeScene = project.scenes.find((s) => s.id === activeSceneId) || project.scenes[0];

  useEffect(() => {
    if (activeSceneId && activeSceneId !== currentSceneId && isPlaying) {
      onSelectScene(activeSceneId);
    }
  }, [activeSceneId, isPlaying]);

  // Playback Loop Animation using requestAnimationFrame for accuracy
  const animatePlayback = (time: number) => {
    if (previousTimeRef.current !== null) {
      const delta = (time - previousTimeRef.current) / 1000;
      setPlaybackTime((prev) => {
        const nextTime = prev + delta;
        if (nextTime >= totalDuration) {
          setIsPlaying(false);
          return 0; // Reset on loop/terminate
        }
        return nextTime;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animatePlayback);
  };

  useEffect(() => {
    if (isPlaying) {
      previousTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animatePlayback);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setPlaybackTime(0);
    setIsPlaying(false);
    onSelectScene(project.scenes[0]?.id);
  };

  // Scene texts / stickers edits helpers
  const handleAddText = () => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: language === 'it' ? 'NUOVA SCRITTA' : 'DOUBLE CLICK TO EDIT',
      x: 50,
      y: 40 + (activeScene.texts.length * 10) % 40,
      color: '#ffffff',
      fontSize: 28,
      fontFamily: '"Space Grotesk", sans-serif',
      animation: 'fade',
    };
    onUpdateScene(activeScene.id, {
      texts: [...activeScene.texts, newText],
    });
    setSelectedTextId(newText.id);
  };

  const handleAddSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      type: 'emoji',
      value: emoji,
      x: 30 + (activeScene.stickers.length * 15) % 50,
      y: 50,
      scale: 1.5,
    };
    onUpdateScene(activeScene.id, {
      stickers: [...activeScene.stickers, newSticker],
    });
    setSelectedStickerId(newSticker.id);
  };

  const handleUpdateText = (id: string, updatedParams: Partial<TextOverlay>) => {
    const updatedTexts = activeScene.texts.map((t) =>
      t.id === id ? { ...t, ...updatedParams } : t
    );
    onUpdateScene(activeScene.id, { texts: updatedTexts });
  };

  const handleDeleteText = (id: string) => {
    const filtered = activeScene.texts.filter((t) => t.id !== id);
    onUpdateScene(activeScene.id, { texts: filtered });
    setSelectedTextId(null);
  };

  const handleUpdateSticker = (id: string, updatedParams: Partial<Sticker>) => {
    const updatedStickers = activeScene.stickers.map((s) =>
      s.id === id ? { ...s, ...updatedParams } : s
    );
    onUpdateScene(activeScene.id, { stickers: updatedStickers });
  };

  const handleDeleteSticker = (id: string) => {
    const filtered = activeScene.stickers.filter((s) => s.id !== id);
    onUpdateScene(activeScene.id, { stickers: filtered });
    setSelectedStickerId(null);
  };

  // Find active subtitle
  const activeSubtitle = project.subtitles.find(
    (sub) => playbackTime >= sub.start && playbackTime <= sub.end
  );

  // Dynamic filter string computation based on Preset Selected
  const getFilterStyle = (filter: string) => {
    switch (filter) {
      case 'glitch':
        return 'contrast-[1.6] hue-rotate-15 saturate-200';
      case 'blur':
        return 'blur-[3px] brightness-95';
      case 'noir':
        return 'grayscale contrast-125 brightness-90';
      case 'cyberpunk':
        return 'hue-rotate-[140deg] saturate-[2.5] contrast-[1.2] brightness-105';
      case 'neon':
        return 'hue-rotate-60 invert-[0.05] brightness-110 saturate-150';
      case 'film':
        return 'contrast-[1.1] brightness-[0.95] sepia-[0.15] animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-100/40 flex flex-col items-center gap-5">
      {/* 9:16 vertical smartphone frame workspace container */}
      <div className="relative w-72 md:w-80 aspect-[9/16] bg-black rounded-[42px] border-[10px] border-indigo-950 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col justify-between">
        
        {/* Smartphone top camera pill */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>

        {/* Video stream viewport */}
        <div className="relative flex-1 overflow-hidden z-20 flex flex-col justify-between p-4"
          style={{
            backgroundImage: activeScene.image ? `url(${activeScene.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: !activeScene.image ? activeScene.backgroundColor.includes('gradient') ? 'transparent' : activeScene.backgroundColor : 'transparent',
            background: !activeScene.image && activeScene.backgroundColor.includes('gradient') ? activeScene.backgroundColor : undefined
          }}
        >
          {/* Active scene filter overlay rendering */}
          {activeScene.filter !== 'none' && (
            <div className={`absolute inset-0 pointer-events-none z-15 select-none transition-all duration-300 mix-blend-screen opacity-70 ${getFilterStyle(activeScene.filter)}`} />
          )}

          {/* Glitch CRT Lines layer if Glitch filter is active */}
          {activeScene.filter === 'glitch' && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent scale-y-[3] h-2 pointer-events-none z-20 animate-bounce" />
          )}

          {/* Sparkly Cyber Ambient or Neon Ambient glows */}
          {activeScene.filter === 'cyberpunk' && (
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-fuchsia-600/30 to-transparent pointer-events-none z-10 animate-pulse" />
          )}

          {/* Video Scene Track progression indicator */}
          <div className="absolute top-6 left-4 right-4 flex gap-1 z-30">
            {project.scenes.map((scene, i) => {
              const range = sceneTimeRanges[i];
              let progress = 0;
              if (playbackTime >= range.end) progress = 100;
              else if (playbackTime >= range.start && playbackTime < range.end) {
                progress = ((playbackTime - range.start) / scene.duration) * 100;
              }
              return (
                <div key={scene.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Active text overlays layer */}
          <div className="absolute inset-0 z-25 pointer-events-auto">
            <AnimatePresence>
              {activeScene.texts.map((text) => {
                const isSelected = selectedTextId === text.id;
                
                // Motion dynamic animations mapping
                const variants = {
                  none: { opacity: 1, scale: 1, y: 0 },
                  bounce: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 1.2 } },
                  fade: { opacity: [0, 1], transition: { duration: 0.8 } },
                  'slide-up': { y: [20, 0], opacity: [0, 1], transition: { duration: 0.6 } },
                  'zoom-in': { scale: [0.7, 1.1, 1], opacity: [0, 1], transition: { duration: 0.7 } }
                };

                return (
                  <motion.div
                    key={text.id}
                    variants={variants}
                    animate={text.animation}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTextId(text.id);
                      setSelectedStickerId(null);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${text.x}%`,
                      top: `${text.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontFamily: text.fontFamily,
                      color: text.color,
                      fontSize: `${text.fontSize}px`,
                      textShadow: '0 4px 10px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.95)',
                    }}
                    className={`cursor-pointer px-2 py-1 rounded-md max-w-[90%] text-center break-words font-extrabold tracking-tight duration-150 select-none ${
                      isSelected ? 'ring-2 ring-indigo-400 bg-black/40' : 'hover:bg-white/10'
                    }`}
                  >
                    {text.text}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Render Active stickers/emojis */}
            {activeScene.stickers.map((stk) => {
              const isSelected = selectedStickerId === stk.id;
              return (
                <div
                  key={stk.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStickerId(stk.id);
                    setSelectedTextId(null);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${stk.x}%`,
                    top: `${stk.y}%`,
                    fontSize: `${stk.scale * 24}px`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))',
                  }}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-indigo-500 rounded-lg p-1 bg-black/30' : 'hover:scale-110'
                  }`}
                >
                  {stk.value}
                </div>
              );
            })}
          </div>

          {/* Subtitles Overlay bottom section ("sistema di sottotitoli automatici") */}
          <div className="absolute bottom-10 left-4 right-4 z-30 flex justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {activeSubtitle ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-black/90 border border-indigo-500/30 backdrop-blur-md text-yellow-300 font-sans tracking-tight font-black text-xs px-3.5 py-1.5 rounded-2xl text-center shadow-lg uppercase max-w-[90%] break-words"
                >
                  {activeSubtitle.text}
                </motion.div>
              ) : (
                null
              )}
            </AnimatePresence>
          </div>

          {/* Smartphone bottom indicators bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-40"></div>
        </div>

      </div>

      {/* Embedded Video Timeline play controls */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between bg-indigo-50/50 p-2 border border-indigo-100/30 rounded-2xl w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white cursor-pointer hover:scale-105 transition-all shadow-md shadow-indigo-100"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white text-white" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 bg-white border border-indigo-100 hover:bg-slate-50 text-slate-700 rounded-full shadow-sm cursor-pointer transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right flex flex-col items-end pr-2">
            <span className="text-[10px] font-mono font-extrabold text-indigo-650 text-indigo-600 uppercase">
              {isPlaying ? 'Live Streaming' : 'Pausa'}
            </span>
            <span className="text-xs font-mono font-extrabold text-slate-800">
              {playbackTime.toFixed(2)}s / {totalDuration.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Multi-layered Customizer for clicked Elements */}
      <div className="w-full border-t border-indigo-50 pt-3">
        {selectedTextId ? (
          (() => {
            const activeText = activeScene.texts.find((t) => t.id === selectedTextId);
            if (!activeText) return null;
            return (
              <div className="bg-slate-50 p-4 rounded-2xl border border-indigo-100/40 flex flex-col gap-3 font-sans shadow-sm">
                <div className="flex items-center justify-between pb-1.5 border-b border-indigo-50/70">
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1 uppercase tracking-wide">
                    <Text className="w-3.5 h-3.5" />
                    {language === 'it' ? 'Modifica Testo' : 'Edit Text Overlay'}
                  </span>
                  <button
                    onClick={() => handleDeleteText(activeText.id)}
                    className="p-1 rounded bg-white hover:bg-pink-100 hover:text-pink-600 text-slate-400 border border-indigo-100 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block">{language === 'it' ? 'Scrivi Testo' : 'Label'}</span>
                  <input
                    type="text"
                    value={activeText.text}
                    onChange={(e) => handleUpdateText(activeText.id, { text: e.target.value })}
                    className="w-full bg-white border border-indigo-100 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1">{language === 'it' ? 'Carattere font' : 'Font Family'}</span>
                    <select
                      value={activeText.fontFamily}
                      onChange={(e) => handleUpdateText(activeText.id, { fontFamily: e.target.value })}
                      className="w-full bg-white border border-indigo-100 rounded-xl p-1.5 text-xs text-slate-805 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      {FONT_PRESETS.map((f) => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1">{language === 'it' ? 'Animazione' : 'Animation'}</span>
                    <select
                      value={activeText.animation}
                      onChange={(e) => handleUpdateText(activeText.id, { animation: e.target.value as any })}
                      className="w-full bg-white border border-indigo-100 rounded-xl p-1.5 text-xs text-slate-805 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      {ANIMATION_PRESETS.map((a) => (
                        <option key={a.value} value={a.value}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Position coordinates sliders */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mb-1">
                      <span>X: {activeText.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeText.x}
                      onChange={(e) => handleUpdateText(activeText.id, { x: parseInt(e.target.value) })}
                      className="w-full h-1 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mb-1">
                      <span>Y: {activeText.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeText.y}
                      onChange={(e) => handleUpdateText(activeText.id, { y: parseInt(e.target.value) })}
                      className="w-full h-1 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1">{language === 'it' ? 'Grandezza' : 'Text Size'}</span>
                    <input
                      type="number"
                      min="12"
                      max="60"
                      value={activeText.fontSize}
                      onChange={(e) => handleUpdateText(activeText.id, { fontSize: parseInt(e.target.value) || 20 })}
                      className="w-full bg-white border border-indigo-100 rounded-xl p-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1">{language === 'it' ? 'Colore' : 'Color hex'}</span>
                    <input
                      type="color"
                      value={activeText.color}
                      onChange={(e) => handleUpdateText(activeText.id, { color: e.target.value })}
                      className="w-full h-8 bg-transparent border border-indigo-100 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            );
          })()
        ) : selectedStickerId ? (
          (() => {
            const activeStk = activeScene.stickers.find((s) => s.id === selectedStickerId);
            if (!activeStk) return null;
            return (
              <div className="bg-slate-50 p-4 rounded-2xl border border-indigo-100/40 flex flex-col gap-3 font-sans shadow-sm">
                <div className="flex items-center justify-between pb-1.5 border-b border-indigo-50/70">
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1 uppercase tracking-wide">
                    <Smile className="w-3.5 h-3.5" />
                    {language === 'it' ? 'Modifica Sticker' : 'Edit Sticker'}
                  </span>
                  <button
                    onClick={() => handleDeleteSticker(activeStk.id)}
                    className="p-1 rounded bg-white hover:bg-pink-105 hover:bg-pink-100 hover:text-pink-600 text-slate-400 border border-indigo-100 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">X: {activeStk.x}%</span>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeStk.x}
                      onChange={(e) => handleUpdateSticker(activeStk.id, { x: parseInt(e.target.value) })}
                      className="w-full h-1 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Y: {activeStk.y}%</span>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeStk.y}
                      onChange={(e) => handleUpdateSticker(activeStk.id, { y: parseInt(e.target.value) })}
                      className="w-full h-1 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{language === 'it' ? 'Scala Dimensioni' : 'Scale multiplier'} ({activeStk.scale}x)</span>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={activeStk.scale}
                    onChange={(e) => handleUpdateSticker(activeStk.id, { scale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            );
          })()
        ) : (
          <div className="grid grid-cols-2 gap-3 text-center pb-1 font-sans">
            {/* Standard inserts selectors if nothing is selected */}
            <button
              onClick={handleAddText}
              className="py-3 px-4 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl text-xs text-indigo-950 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-center gap-2 font-bold shadow-sm shadow-indigo-50/40 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              {language === 'it' ? 'Scritta Testo' : 'Insert Text'}
            </button>

            <div className="relative group">
              <button
                className="w-full py-3 px-4 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl text-xs text-indigo-950 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-center gap-2 font-bold shadow-sm shadow-indigo-50/40 active:scale-95"
              >
                <Smile className="w-4 h-4 text-pink-500 animate-pulse" />
                {language === 'it' ? 'Aggiungi Sticker' : 'Insert Sticker'}
              </button>
              <div className="absolute bottom-full left-0 right-0 hidden group-hover:block bg-white border border-indigo-100 p-2.5 rounded-2xl shadow-xl z-50 mb-2.5 max-h-36 overflow-y-auto">
                <div className="grid grid-cols-4 gap-1.5">
                  {EMOJI_STICKERS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddSticker(emoji)}
                      className="p-1 hover:bg-indigo-50 rounded-xl text-base cursor-pointer transition-colors active:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
