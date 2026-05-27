import React, { useState } from 'react';
import { Scene, VideoFilter, SceneTransition } from '../types';
import { Plus, Trash, Clock, Image, Palette, Film, Sparkles, Wand2 } from 'lucide-react';

interface TimelineProps {
  scenes: Scene[];
  currentSceneId: string;
  onSelectScene: (id: string) => void;
  onUpdateScene: (sceneId: string, updated: Partial<Scene>) => void;
  onAddScene: () => void;
  onRemoveScene: (sceneId: string) => void;
  language: 'it' | 'en' | 'es' | 'fr';
}

const FILTER_PRESETS: { value: VideoFilter; name: string; style: string }[] = [
  { value: 'none', name: 'Original', style: 'bg-slate-800' },
  { value: 'glitch', name: 'Glitch Chromatic', style: 'bg-purple-900 border-purple-500 text-purple-200' },
  { value: 'blur', name: 'Soft Focus', style: 'bg-sky-950 border-sky-600 text-sky-200' },
  { value: 'noir', name: 'Noir Vintage', style: 'bg-zinc-900 border-zinc-500 text-zinc-300' },
  { value: 'cyberpunk', name: 'Cyber Neon', style: 'bg-pink-950 border-pink-600 text-pink-200' },
  { value: 'neon', name: 'Glow Lime', style: 'bg-emerald-950 border-emerald-500 text-emerald-200' },
  { value: 'film', name: 'Analog Grain', style: 'bg-amber-950 border-amber-600 text-amber-200' },
];

const TRANSITION_PRESETS: { value: SceneTransition; name: string }[] = [
  { value: 'none', name: 'Taglio Diretto' },
  { value: 'fade', name: 'Dissolvenza' },
  { value: 'slide-left', name: 'Scivolamento' },
  { value: 'zoom-in', name: 'Zoom Progressivo' },
];

const COLOR_PRESETS = [
  'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', // Deep Space
  'linear-gradient(135deg, #120c1f, #1a0f30, #2b1055)', // Cosmic Twilight
  'linear-gradient(135deg, #1a0f12, #3c0c1b, #4a121a)', // Ruby Blood
  'linear-gradient(135deg, #051411, #0b2e27, #153c35)', // Emerald Forest
  '#090d16', // Slate Pitch Black
  '#dc2626', // Flame Red
  '#d97706', // Gold Amber
  '#2563eb', // Electric Royal Blue
];

export default function Timeline({
  scenes,
  currentSceneId,
  onSelectScene,
  onUpdateScene,
  onAddScene,
  onRemoveScene,
  language
}: TimelineProps) {
  const currentScene = scenes.find(s => s.id === currentSceneId) || scenes[0];
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute total duration of standard active scenes
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const remainingSeconds = Math.max(0, 40 - totalDuration);

  const handleDurationChange = (sceneId: string, val: number) => {
    // Make sure we don't exceed 40s in total
    const sceneToUpdate = scenes.find(s => s.id === sceneId);
    if (!sceneToUpdate) return;
    const previousDuration = sceneToUpdate.duration;
    const targetWithNoLimits = totalDuration - previousDuration + val;

    if (targetWithNoLimits > 40) {
      // clip it to the maximum remaining allowed to remain <= 40s
      const allowedMax = 40 - (totalDuration - previousDuration);
      if (allowedMax > 0.5) {
        onUpdateScene(sceneId, { duration: allowedMax });
      }
    } else {
      onUpdateScene(sceneId, { duration: Math.max(1, val) });
    }
  };

  const handleGenerateAIImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      if (!res.ok) throw new Error("Server generate image error");
      const data = await res.json();
      if (data.imageUrl) {
        onUpdateScene(currentScene.id, { 
          image: data.imageUrl,
          imageName: `AI: ${aiPrompt}` 
        });
        setAiPrompt('');
      }
    } catch (e) {
      alert("Impossibile generare l'immagine con IA. Assicurati che le API key siano configurate.");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateScene(currentScene.id, {
          image: reader.result as string,
          imageName: file.name
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-100/40 flex flex-col gap-4">
      {/* Capped 40 Seconds Tracker Progress bar */}
      <div>
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-bold">
          <span className="flex items-center gap-1.5 text-indigo-950 font-extrabold text-[11px] uppercase tracking-wide">
            <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
            {language === 'it' ? 'DURATA REEL' : 'REEL DURATION'}: {totalDuration.toFixed(1)}s / 40.0s
          </span>
          <span className={`text-[11px] font-bold ${remainingSeconds === 0 ? 'text-pink-500 animate-pulse' : 'text-slate-400'}`}>
            {remainingSeconds > 0 
              ? `-${remainingSeconds.toFixed(1)}s ${language === 'it' ? 'rimanenti' : 'left'}` 
              : `LIMITE RAGGIUNTO! (Max 40s)`}
          </span>
        </div>
        <div className="w-full bg-slate-50 rounded-full h-3.5 p-0.5 overflow-hidden border border-indigo-100/30">
          <div 
            className="flex h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (totalDuration / 40) * 100)}%`,
              background: totalDuration > 35 ? 'linear-gradient(90deg, #6366f1, #ec4899)' : 'linear-gradient(90deg, #6366f1, #818cf8)'
            }}
          />
        </div>
      </div>

      {/* Visual Scenes Strip timeline */}
      <div>
        <h4 className="text-indigo-950 font-black text-xs mb-2 tracking-wide uppercase font-sans">
          {language === 'it' ? 'SEQUENZA SCENE' : 'SCENE STRIP'}
        </h4>
        <div className="flex gap-2.5 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-indigo-100">
          {scenes.map((scene, index) => {
            const isActive = scene.id === currentSceneId;
            return (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className={`relative flex-shrink-0 w-28 h-20 rounded-2xl border p-2 flex flex-col justify-between transition-all select-none cursor-pointer shadow-sm ${
                  isActive 
                    ? 'border-indigo-400 bg-indigo-50/50 shadow-md ring-2 ring-indigo-450 ring-indigo-300' 
                    : 'border-slate-100 bg-slate-50/30 hover:border-indigo-100 hover:bg-white'
                }`}
              >
                {/* Scene badge header */}
                <div className="flex justify-between items-center">
                  <span className="bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                    S#{index + 1}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 flex items-center gap-0.5 bg-white border border-indigo-50 px-1.5 py-0.5 rounded-lg shadow-sm">
                    <Clock className="w-2.5 h-2.5 text-indigo-500" />
                    {scene.duration}s
                  </span>
                </div>

                {/* Background visual snippet preview */}
                <div 
                  className="absolute inset-0 rounded-2xl -z-10 opacity-30 brightness-[0.9] border border-transparent"
                  style={{ 
                    backgroundImage: scene.image ? `url(${scene.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: !scene.image ? scene.backgroundColor.includes('gradient') ? 'transparent' : scene.backgroundColor : 'transparent',
                    background: !scene.image && scene.backgroundColor.includes('gradient') ? scene.backgroundColor : undefined
                  }}
                />

                {/* Mini scene visual triggers representation */}
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] font-sans text-slate-800 truncate font-extrabold bg-white/70 px-1 rounded">
                    {scene.texts[0]?.text || "Nessun testo"}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-indigo-700 bg-white/70 px-1 rounded mt-0.5">
                    <span className="truncate max-w-[50px] font-mono font-bold capitalize">{scene.filter}</span>
                    <span className="text-pink-500 font-mono font-bold">{scene.transition === 'none' ? '' : '⇄'}</span>
                  </div>
                </div>

                {/* Remove button if multiple scenes */}
                {scenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveScene(scene.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-white shadow-md p-1 hover:bg-pink-500 hover:text-white cursor-pointer text-slate-400 rounded-full border border-indigo-150 transition-colors"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Scene button */}
          <button
            onClick={onAddScene}
            disabled={totalDuration >= 40}
            className="flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-500">{language === 'it' ? 'Aggiungi' : 'Add Scene'}</span>
          </button>
        </div>
      </div>

      {/* Editor controls for selected scene */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-indigo-50 pt-4">
        {/* Left Column: Scene Properties & Design */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
            <label className="text-xs font-bold text-indigo-950">
              {language === 'it' ? 'Durata Scena Corrente' : 'Current Scene Duration'}: {currentScene.duration}s
            </label>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={currentScene.duration}
            onChange={(e) => handleDurationChange(currentScene.id, parseFloat(e.target.value))}
            className="w-full h-1.5 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />

          {/* Sfondi custom e caricamenti */}
          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'it' ? 'Sfondo e Colore' : 'Background and Styles'}
            </span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {COLOR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => onUpdateScene(currentScene.id, { backgroundColor: preset, image: undefined, imageName: undefined })}
                  style={{ background: preset.includes('gradient') ? preset : undefined, backgroundColor: !preset.includes('gradient') ? preset : undefined }}
                  className={`w-6 h-6 rounded-lg cursor-pointer border hover:scale-110 shadow-sm transition-transform ${
                    currentScene.backgroundColor === preset && !currentScene.image
                      ? 'border-indigo-550 border-indigo-500 ring-2 ring-indigo-300 scale-105' 
                      : 'border-slate-200'
                  }`}
                />
              ))}

              <button
                onClick={triggerUpload}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-indigo-100 text-[10px] text-slate-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Image className="w-3 h-3 text-indigo-600" />
                {language === 'it' ? 'Carica Foto' : 'Upload Img'}
              </button>
            </div>
          </div>

          {/* AI Image Creator backdrop section */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-indigo-100/40 shadow-sm">
            <span className="text-[11px] text-indigo-950 font-bold block mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
              {language === 'it' ? 'Generatore Sfondo IA' : 'AI Image generator (9:16)'}
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={language === 'it' ? "Es: Città cyberpunk sommersa" : "E.g. neon space nebula"}
                className="flex-1 bg-white border border-indigo-100/40 rounded-xl px-2.5 py-1 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
              />
              <button
                onClick={handleGenerateAIImage}
                disabled={isGenerating || !aiPrompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 hover:scale-102 cursor-pointer transition-all disabled:opacity-40 text-white rounded-xl px-3 py-1.5 text-[10px] whitespace-nowrap font-sans font-bold flex items-center justify-center gap-1 shadow-md shadow-indigo-100 active:scale-95"
              >
                {isGenerating ? (
                  <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                {language === 'it' ? 'Crea' : 'Generate'}
              </button>
            </div>
            {currentScene.imageName && (
              <span className="text-[9px] text-indigo-700 font-mono block mt-1.5 truncate font-extrabold">
                📺 {language === 'it' ? 'Sfondo attivo' : 'Active background'}: {currentScene.imageName}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Visual Filters (effects) & Transitions of selected scene */}
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1.5 flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'it' ? 'Filtri Effetti Pronti' : 'Ready Effects / Filters'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {FILTER_PRESETS.map((p) => {
                const isActive = currentScene.filter === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => onUpdateScene(currentScene.id, { filter: p.value })}
                    className={`py-1.5 px-2.5 border text-[11px] font-sans capitalize rounded-xl cursor-pointer transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? 'border-indigo-400 bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100' 
                        : 'border-indigo-100 bg-slate-50/20 text-slate-600 hover:border-indigo-2000 hover:bg-white'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1.5 flex items-center gap-1 uppercase tracking-wide">
              {language === 'it' ? 'Transizioni in Entrata' : 'Trigger Entry Transitions'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {TRANSITION_PRESETS.map((t) => {
                const isActive = currentScene.transition === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => onUpdateScene(currentScene.id, { transition: t.value })}
                    className={`py-1.5 px-2 border text-[10px] font-sans font-bold rounded-xl cursor-pointer transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? 'border-indigo-400 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                        : 'border-indigo-100 bg-slate-50/20 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
