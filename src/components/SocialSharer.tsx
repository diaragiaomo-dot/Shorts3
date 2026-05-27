import React, { useState } from 'react';
import { Download, Share2, Youtube, Flame, Check, HelpCircle, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface SocialSharerProps {
  project: Project;
  language: 'it' | 'en' | 'es' | 'fr';
}

export default function SocialSharer({ project, language }: SocialSharerProps) {
  const [exportType, setExportType] = useState<'video' | 'audio'>('video');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [optimizedTitle, setOptimizedTitle] = useState('');
  const [optimizedDesc, setOptimizedDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFile, setExportedFile] = useState<string | null>(null);

  // Auto generated captions / tags using current project metadata
  const handleGenerateSocialCaps = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Crea un titolo virale accattivante di massimo 50 caratteri, una breve descrizione e 5 hashtags specifici per un video YouTube Shorts/Instagram Reels basato su questo script: "${project.scriptText || 'Video editor di Shorts'}"`
        })
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const parsedText = data.text || '';
      // Parse output with easy-split fallback
      const hashtags = parsedText.match(/#[a-zA-Z0-9_]+/g) || ['#shorts', '#reels', '#viral', '#viralcreator'];
      setGeneratedTags(hashtags);
      setOptimizedTitle(project.name || "Video Shorts di Impatto!");
      setOptimizedDesc(parsedText.slice(0, 150) + "...");
    } catch (e) {
      // Fallback
      setOptimizedTitle(`🚀 ${project.name || 'Shorts'} (Max 40s)`);
      setOptimizedDesc(`Video Shorts di tendenza creato con AI Creator! #shorts #viral`);
      setGeneratedTags(['#shorts', '#viral', '#reels', '#trending']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'avi' | 'mp3') => {
    setIsExporting(true);
    setExportedFile(null);
    
    setTimeout(() => {
      // Create mockup download link
      const fakeContent = `YouTube Shorts exported content of: ${project.name}. Format: ${format}`;
      const blob = new Blob([fakeContent], { type: format === 'avi' ? 'video/avi' : 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setIsExporting(false);
      setExportedFile(format === 'avi' ? 'REEL_SHORT.avi' : 'SOUNDTRACK.mp3');
    }, 2200);
  };

  const handleDirectShare = (platform: string) => {
    alert(`[Simulazione Condivisione] Lo short "${project.name}" è stato formattato ed è pronto per essere inviato direttamente a ${platform}! I tag e il titolo ottimizzati sono stati copiati.`);
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-100/40 flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-indigo-50 pb-2.5">
        <Share2 className="w-5 h-5 text-indigo-600 animate-pulse" />
        <h3 className="font-extrabold text-indigo-950 text-sm uppercase tracking-wide">
          {language === 'it' ? 'Esporta e Ottimizza Social' : 'Export and Share'}
        </h3>
      </div>

      {/* Export download configurations */}
      <div>
        <span className="text-xs text-slate-500 font-bold block mb-2">
          {language === 'it' ? '1. Seleziona Formato Esportazione' : '1. Choose Export Formats'}
        </span>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setExportType('video')}
            className={`flex-1 py-2 border rounded-xl font-sans text-xs font-bold cursor-pointer transition-all active:scale-95 ${
              exportType === 'video'
                ? 'border-indigo-400 bg-indigo-50/50 text-indigo-700 shadow-sm'
                : 'border-indigo-100 bg-slate-50/20 text-slate-600 hover:bg-white hover:text-indigo-600'
            }`}
          >
            🎬 Video Reel (AVI)
          </button>
          <button
            onClick={() => setExportType('audio')}
            className={`flex-1 py-2 border rounded-xl font-sans text-xs font-bold cursor-pointer transition-all active:scale-95 ${
              exportType === 'audio'
                ? 'border-indigo-400 bg-indigo-50/50 text-indigo-700 shadow-sm'
                : 'border-indigo-100 bg-slate-50/20 text-slate-600 hover:bg-white hover:text-indigo-600'
            }`}
          >
            🎵 Audio Solo (MP3)
          </button>
        </div>

        {isExporting ? (
          <div className="py-4 bg-slate-50 border border-indigo-100 rounded-2xl flex flex-col items-center justify-center gap-2">
            <span className="w-6 h-6 border-2 border-indigo-605 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs text-indigo-600 font-bold italic animate-pulse">
              {language === 'it' ? "Rendering audio/video ottimizzato..." : "Optimized Social compilation rendering..."}
            </span>
          </div>
        ) : (
          <button
            onClick={() => handleDownload(exportType === 'video' ? 'avi' : 'mp3')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-2xl cursor-pointer shadow-md shadow-indigo-100 hover:scale-102 transition-transform flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            {language === 'it' ? `Esporta adesso in ${exportType === 'video' ? 'AVI' : 'MP3'}` : `Export to ${exportType === 'video' ? 'AVI' : 'MP3'} now`}
          </button>
        )}

        {exportedFile && (
          <div className="p-2 border border-emerald-100 bg-emerald-50/70 text-emerald-800 rounded-2xl text-[11px] font-sans font-bold text-center mt-2.5 flex items-center justify-center gap-1.5 animate-bounce shadow-sm shadow-emerald-50">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{language === 'it' ? `Scaricato con successo: ${exportedFile}!` : `Successfully downloaded ${exportedFile}!`}</span>
          </div>
        )}
      </div>

      {/* Social intelligence tools */}
      <div className="border-t border-indigo-50 pt-3 flex flex-col gap-3 font-sans">
        <div className="flex justify-between items-center">
          <span className="text-xs text-indigo-950 font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            {language === 'it' ? 'AI Ottimizzazione Metadati' : 'AI Metadata Optimizer'}
          </span>
          <button
            onClick={handleGenerateSocialCaps}
            disabled={isLoading}
            className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 hover:text-indigo-700 hover:scale-102 flex items-center gap-0.5 cursor-pointer disabled:opacity-40 transition-transform"
          >
            <Sparkles className="w-3 h-3 animate-pulse text-indigo-600" />
            {language === 'it' ? 'Ottimizza' : 'Optimize'}
          </button>
        </div>

        {isLoading ? (
          <div className="py-2 flex items-center gap-1.5 justify-center text-xs text-slate-500 italic">
            <span className="w-3 h-3 border border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Generazione metadati...</span>
          </div>
        ) : (
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-indigo-100/40 flex flex-col gap-2.5 shadow-sm">
            <div>
              <span className="text-[9px] text-indigo-605 text-indigo-700 uppercase font-bold block mb-0.5">{language === 'it' ? 'MIGLIOR TITOLO SHORTS' : 'VIRAL HOOK TITLE'}</span>
              <p className="text-xs text-slate-800 font-extrabold italic">"{optimizedTitle || (language === 'it' ? 'Genera titoli accattivanti cliccando sopra!' : 'Generate captions with AI')}"</p>
            </div>
            
            {optimizedDesc && (
              <div>
                <span className="text-[9px] text-indigo-700 uppercase font-bold block mb-0.5">{language === 'it' ? 'DESCRIZIONE CONSIGLIATA' : 'DESCRIPTION'}</span>
                <p className="text-[10px] text-slate-600 leading-normal font-medium">{optimizedDesc}</p>
              </div>
            )}

            {generatedTags.length > 0 && (
              <div>
                <span className="text-[9px] text-indigo-700 uppercase font-bold block mb-1">HASHTAGS CONSIGLIATI</span>
                <div className="flex flex-wrap gap-1">
                  {generatedTags.map((tag, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 bg-white border border-indigo-50 shadow-sm rounded-lg font-mono font-bold text-indigo-600 lowercase">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Direct publishing buttons */}
      <div className="border-t border-indigo-50 pt-3">
        <span className="text-xs text-slate-500 font-bold block mb-2 flex items-center gap-1">
          <Youtube className="w-4 h-4 text-red-500" />
          {language === 'it' ? '2. Condividi sulle Piattaforme' : '2. Share Direct to Platforms'}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleDirectShare('YouTube Shorts')}
            className="py-2 px-2.5 bg-slate-50 hover:bg-white border border-indigo-100 hover:border-red-500 rounded-xl text-[10px] text-slate-700 transition-all uppercase font-sans font-bold cursor-pointer text-center shadow-sm hover:scale-102 active:scale-95"
          >
            Shorts
          </button>
          <button
            onClick={() => handleDirectShare('TikTok')}
            className="py-2 px-2.5 bg-slate-50 hover:bg-white border border-indigo-100 hover:border-teal-500 rounded-xl text-[10px] text-slate-700 transition-all uppercase font-sans font-bold cursor-pointer text-center shadow-sm hover:scale-102 active:scale-95"
          >
            TikTok
          </button>
          <button
            onClick={() => handleDirectShare('Instagram Reels')}
            className="py-2 px-2.5 bg-slate-50 hover:bg-white border border-indigo-100 hover:border-pink-500 rounded-xl text-[10px] text-slate-700 transition-all uppercase font-sans font-bold cursor-pointer text-center shadow-sm hover:scale-102 active:scale-95"
          >
            Reels
          </button>
        </div>
      </div>
    </div>
  );
}
