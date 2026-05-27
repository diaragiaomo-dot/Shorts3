import React, { useState, useEffect } from 'react';
import { Project, Scene, Subtitle, AudioConfig } from './types';
import Timeline from './components/Timeline';
import VoiceAssistant from './components/VoiceAssistant';
import AudioLayerManager from './components/AudioLayerManager';
import VideoCanvas from './components/VideoCanvas';
import AIPresenter from './components/AIPresenter';
import SocialSharer from './components/SocialSharer';
import { 
  Sparkles, 
  Save, 
  Cloud, 
  CloudLightning, 
  Languages, 
  Volume2, 
  Layers, 
  Plus, 
  Trash2, 
  HelpCircle, 
  FileEdit,
  Youtube,
  RefreshCw,
  MessageCircle,
  FileText
} from 'lucide-react';

const LANGUAGE_LABEL = {
  it: {
    title: "MoviShorts Studio AI",
    sub: "Montatore Rapido di Shorts & Reels con AI",
    newProj: "Nuovo Short",
    noProj: "Nessun Progetto",
    saveStatus: "Sincronizzato Cloud",
    saving: "Salvataggio...",
    saveBtn: "Salva Stato",
    generateSubsBtn: "Genera Sottotitoli Multilingua IA",
    subsSuccess: "Sottotitoli Sincronizzati!",
    scriptTitle: "Copione & Dialoghi Attivi",
    scriptPlaceholder: "Scrivi o incolla i dialoghi qui per generare i sottotitoli...",
    infoTitle: "Info Limite Shorts",
    infoDetail: "I video Shorts e Reels richiedono un formato verticale 9:16 e una durata rigorosamente inferiore a 40 secondi. Il nostro editor bloccherà la timeline per garantirti il rispetto dei termini di caricamente sociale.",
    sceneCount: "Scene totali",
    deleteAsk: "Vuoi eliminare questo progetto?",
  },
  en: {
    title: "MoviShorts AI Studio",
    sub: "Rapid Video Shorts & Reels Assembler",
    newProj: "New Project",
    noProj: "No Project Current",
    saveStatus: "Cloud Synced",
    saving: "Cloud Syncing...",
    saveBtn: "Save Backup",
    generateSubsBtn: "Generate Multilingual AI Subtitles",
    subsSuccess: "Subtitles Synced!",
    scriptTitle: "Active Video Screenplay",
    scriptPlaceholder: "Enter dialogues or narration script here to align automated timers...",
    infoTitle: "Shorts Constraints Info",
    infoDetail: "Social Shorts and Reels utilize high-contrast vertical formatting capped at 40 seconds maximum duration. Our system caps timing constraints to guarantee immediate publishing eligibility.",
    sceneCount: "Total Scenes",
    deleteAsk: "Do you want to delete this project?",
  },
  es: {
    title: "MoviShorts Studio AI",
    sub: "Editor Rápido de Shorts con Inteligencia Artificial",
    newProj: "Nuevo Reel",
    noProj: "No hay proyecto",
    saveStatus: "Sincronizado",
    saving: "Trabajando...",
    saveBtn: "Guardar Copia",
    generateSubsBtn: "Generar Subtítulos Multilingües",
    subsSuccess: "¡Subtítulos Listos!",
    scriptTitle: "Guión y Diálogos Activos",
    scriptPlaceholder: "Escribe tus diálogos aquí para calcular subtítulos automáticos...",
    infoTitle: "Límites de duración",
    infoDetail: "Los shorts y Reels de Instagram exigen formato 9:16 de máximo 40 segundos. Nuestro editor recortará los clips excedentes automáticamente.",
    sceneCount: "Escenas totales",
    deleteAsk: "¿Deseas eliminar este proyecto?",
  },
  fr: {
    title: "MoviShorts Studio IA",
    sub: "Montage de Shorts et Reels par Équipe IA",
    newProj: "Nouveau Short",
    noProj: "Aucun Projet",
    saveStatus: "Synchronisé",
    saving: "Sauvegarde en cours...",
    saveBtn: "Sauvegarder",
    generateSubsBtn: "Générer Sous-titres Multilingues",
    subsSuccess: "Sous-titres configurés!",
    scriptTitle: "Scénario du Court Métrage",
    scriptPlaceholder: "Saisissez les dialogues pour générer les sous-titres automatiques...",
    infoTitle: "Limites de format",
    infoDetail: "Les formats publicitaires Shorts et Reels requièrent un format vertical 9:16 limité rigoureusement à 40 secondes de lecture.",
    sceneCount: "Nombre de scènes",
    deleteAsk: "Voulez-vous supprimer ce projet?",
  }
};

const DEFAULT_PROJECTS = (lang: 'it' | 'en' | 'es' | 'fr'): Project[] => [
  {
    id: 'proj-ita-1',
    name: lang === 'it' ? 'Il Mio Primo Short' : 'My First Short Reel',
    duration: 15,
    scenes: [
      {
        id: 'scene-1',
        duration: 5,
        backgroundColor: 'linear-gradient(135deg, #120c1f, #1a0f30, #2b1055)',
        filter: 'cyberpunk',
        transition: 'none',
        texts: [
          {
            id: 'txt-1',
            text: lang === 'it' ? 'MONTAGGIO RAPIDO' : 'RAPID ASSEMBLY',
            x: 50,
            y: 35,
            color: '#ffffff',
            fontSize: 28,
            fontFamily: '"Space Grotesk", sans-serif',
            animation: 'bounce'
          },
          {
            id: 'txt-2',
            text: lang === 'it' ? 'Generato con Intelligenza Artificiale' : 'Powered by Gemini AI',
            x: 50,
            y: 50,
            color: '#10b981',
            fontSize: 16,
            fontFamily: '"JetBrains Mono", monospace',
            animation: 'none'
          }
        ],
        stickers: [
          { id: 'st-1', type: 'emoji', value: '✨', x: 50, y: 70, scale: 2 }
        ]
      },
      {
        id: 'scene-2',
        duration: 5,
        backgroundColor: 'linear-gradient(135deg, #1a0f12, #3c0c1b, #4a121a)',
        filter: 'glitch',
        transition: 'fade',
        texts: [
          {
            id: 'txt-3',
            text: lang === 'it' ? 'EFFETTI PRONTI!' : 'HOT EFFECTS!',
            x: 50,
            y: 45,
            color: '#f59e0b',
            fontSize: 32,
            fontFamily: '"Space Grotesk", sans-serif',
            animation: 'zoom-in'
          }
        ],
        stickers: [
          { id: 'st-2', type: 'emoji', value: '💯', x: 50, y: 75, scale: 1.5 }
        ]
      },
      {
        id: 'scene-3',
        duration: 5,
        backgroundColor: '#090d16',
        filter: 'none',
        transition: 'slide-left',
        texts: [
          {
            id: 'txt-4',
            text: lang === 'it' ? 'Esporta in Avi e MP3' : 'Export AVI & MP3',
            x: 50,
            y: 40,
            color: '#38bdf8',
            fontSize: 24,
            fontFamily: '"JetBrains Mono", monospace',
            animation: 'slide-up'
          }
        ],
        stickers: []
      }
    ],
    subtitles: [
      { id: 'sub-1', start: 0.2, end: 4.5, text: lang === 'it' ? 'Benvenuti su MoviShorts Studio!' : 'Welcome to MoviShorts Studio!', language: lang },
      { id: 'sub-2', start: 5.0, end: 9.5, text: lang === 'it' ? 'Un editor integrato con effetti pronti' : 'Full integrated editor with ready filters', language: lang },
      { id: 'sub-3', start: 10.0, end: 14.8, text: lang === 'it' ? 'Esporta e ottimizza per tutti i social!' : 'Export and optimize for all major socials!', language: lang }
    ],
    audio: {
      backgroundVolume: 60,
      voiceVolume: 80,
      micVolume: 100,
      backgroundTrackId: 'lofi'
    },
    scriptText: lang === 'it'
      ? 'Benvenuti su MoviShorts Studio! Un editor integrato con effetti pronti all\'uso. Esporta e ottimizza per tutti i social!'
      : 'Welcome to MoviShorts Studio! Full integrated editor with ready filters. Export and optimize for all major socials!',
    language: lang,
    updatedAt: new Date().toISOString()
  }
];

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<'it' | 'en' | 'es' | 'fr'>('it');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [currentSceneId, setCurrentSceneId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isLoadingSubtitles, setIsLoadingSubtitles] = useState(false);
  const [alertText, setAlertText] = useState<string | null>(null);

  const t = LANGUAGE_LABEL[selectedLanguage] || LANGUAGE_LABEL.it;

  // Load projects from cloud DB on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          setCurrentProjectId(data.projects[0].id);
          setCurrentSceneId(data.projects[0].scenes[0]?.id || '');
        } else {
          // Initialize DB with default templates
          const defaults = DEFAULT_PROJECTS(selectedLanguage);
          setProjects(defaults);
          setCurrentProjectId(defaults[0].id);
          setCurrentSceneId(defaults[0].scenes[0].id);
          await saveProjectToCloud(defaults[0]);
        }
      }
    } catch (e) {
      // Offline fallback
      const defaults = DEFAULT_PROJECTS(selectedLanguage);
      setProjects(defaults);
      setCurrentProjectId(defaults[0].id);
      setCurrentSceneId(defaults[0].scenes[0].id);
    } finally {
      setIsSyncing(false);
    }
  };

  const activeProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  useEffect(() => {
    if (activeProject && !currentSceneId) {
      setCurrentSceneId(activeProject.scenes[0]?.id || '');
    }
  }, [activeProject, currentSceneId]);

  // Saves project to server API for cloud sync
  const saveProjectToCloud = async (proj: Project) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: proj })
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      console.warn("Could not synchronize to server cloud db (will remain local in frame state).");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProject = (updatedFields: Partial<Project>) => {
    if (!activeProject) return;
    const updated = { ...activeProject, ...updatedFields, updatedAt: new Date().toISOString() };
    const newProjects = projects.map((p) => p.id === activeProject.id ? updated : p);
    setProjects(newProjects);
    saveProjectToCloud(updated);
  };

  const handleSelectScene = (sceneId: string) => {
    setCurrentSceneId(sceneId);
  };

  const handleUpdateScene = (sceneId: string, updatedSceneParams: Partial<Scene>) => {
    if (!activeProject) return;
    const updatedScenes = activeProject.scenes.map((s) => {
      if (s.id === sceneId) {
        return { ...s, ...updatedSceneParams };
      }
      return s;
    });

    // Recompute total duration up to 40 seconds
    const totalDuration = updatedScenes.reduce((sum, sc) => sum + sc.duration, 0);
    handleUpdateProject({ scenes: updatedScenes, duration: Math.min(40, totalDuration) });
  };

  const handleAddScene = () => {
    if (!activeProject) return;
    // Calculate current total duration
    const currentTotal = activeProject.scenes.reduce((sum, s) => sum + s.duration, 0);
    if (currentTotal >= 40) return;

    // determine default duration for next scene so it fits <= 40
    const desiredDuration = Math.min(5, 40 - currentTotal);
    if (desiredDuration < 1) return;

    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      duration: desiredDuration,
      backgroundColor: '#0f172a',
      filter: 'none',
      transition: 'none',
      texts: [],
      stickers: []
    };

    const updatedScenes = [...activeProject.scenes, newScene];
    handleUpdateProject({ 
      scenes: updatedScenes, 
      duration: currentTotal + desiredDuration 
    });
    setCurrentSceneId(newScene.id);
  };

  const handleRemoveScene = (sceneId: string) => {
    if (!activeProject || activeProject.scenes.length <= 1) return;
    const filteredScenes = activeProject.scenes.filter((s) => s.id !== sceneId);
    const newTotal = filteredScenes.reduce((sum, s) => sum + s.duration, 0);
    
    // Select first scene if removed item is active
    if (currentSceneId === sceneId) {
      setCurrentSceneId(filteredScenes[0].id);
    }
    handleUpdateProject({ scenes: filteredScenes, duration: newTotal });
  };

  const handleCreateNewProject = () => {
    const id = `proj-${Date.now()}`;
    const newProj: Project = {
      id,
      name: `${t.newProj} #${projects.length + 1}`,
      duration: 5,
      scenes: [
        {
          id: `sc-init-${Date.now()}`,
          duration: 5,
          backgroundColor: 'linear-gradient(135deg, #120c1f, #1a0f30, #2b1055)',
          filter: 'none',
          transition: 'none',
          texts: [
            {
              id: `text-init-${Date.now()}`,
              text: selectedLanguage === 'it' ? 'NUOVA CLIP SHORTS' : 'NEW SHORTS REEL',
              x: 50,
              y: 40,
              color: '#ffffff',
              fontSize: 28,
              fontFamily: '"Space Grotesk", sans-serif',
              animation: 'fade'
            }
          ],
          stickers: []
        }
      ],
      subtitles: [],
      audio: {
        backgroundVolume: 50,
        voiceVolume: 80,
        micVolume: 100,
        backgroundTrackId: 'lofi'
      },
      scriptText: selectedLanguage === 'it' ? 'Inizia lo Short con un impatto travolgente!' : 'Start your brand new vertical Short video!',
      language: selectedLanguage,
      updatedAt: new Date().toISOString()
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    setCurrentProjectId(id);
    setCurrentSceneId(newProj.scenes[0].id);
    saveProjectToCloud(newProj);
  };

  const handleDeleteProject = (projId: string) => {
    if (projects.length <= 1) return;
    if (window.confirm(t.deleteAsk)) {
      const remaining = projects.filter((p) => p.id !== projId);
      setProjects(remaining);
      setCurrentProjectId(remaining[0].id);
      setCurrentSceneId(remaining[0].scenes[0]?.id || '');
      
      fetch(`/api/projects/${projId}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  // Automated Timeline generator from AI screenwriter tab
  const handleApplyAIScript = (scriptData: { title: string; scriptIdea: string; tags: string[]; scenes: any[] }) => {
    if (!activeProject) return;

    // Format new scenes and limit sum to 40 seconds
    let totalSecs = 0;
    const formattedScenes = scriptData.scenes.map((scene: any, i) => {
      let dur = scene.duration || 5;
      if (totalSecs + dur > 40) {
        dur = Math.max(1, 40 - totalSecs);
      }
      totalSecs += dur;

      // Ensure scene structure matches exactly
      return {
        id: `ai-scene-${i}-${Date.now()}`,
        duration: dur,
        backgroundColor: scene.backgroundColor || '#120c1f',
        filter: scene.filter || 'none',
        transition: scene.transition || 'none',
        texts: scene.textOverlay ? [
          {
            id: `ai-text-${i}-${Date.now()}`,
            text: scene.textOverlay,
            x: 50,
            y: 40,
            color: '#ffffff',
            fontSize: 26,
            fontFamily: '"Space Grotesk", sans-serif',
            animation: 'zoom-in' as any
          }
        ] : [],
        stickers: []
      } as Scene;
    });

    handleUpdateProject({
      name: scriptData.title || activeProject.name,
      scenes: formattedScenes,
      duration: Math.min(40, totalSecs),
      scriptText: scriptData.scriptIdea || activeProject.scriptText,
    });
    
    if (formattedScenes.length > 0) {
      setCurrentSceneId(formattedScenes[0].id);
    }
  };

  // Timed interactive subtitle system sync
  const handleGenerateAutomatedSubtitles = async () => {
    if (!activeProject || !activeProject.scriptText.trim()) return;
    setIsLoadingSubtitles(true);
    setAlertText(null);

    try {
      const res = await fetch('/api/ai/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptText: activeProject.scriptText,
          totalDuration: activeProject.duration,
          language: selectedLanguage === 'it' ? 'Italiano' : selectedLanguage === 'es' ? 'Español' : selectedLanguage === 'fr' ? 'Français' : 'English'
        })
      });

      if (!res.ok) throw new Error("Subtitles request failed");
      const data = await res.json();
      
      if (data.subtitles && data.subtitles.length > 0) {
        // Map raw results to typed Subtitle data
        const mapped: Subtitle[] = data.subtitles.map((sub: any, i: number) => ({
          id: `sub-gen-${i}-${Date.now()}`,
          start: sub.start,
          end: sub.end,
          text: sub.text,
          language: selectedLanguage
        }));

        handleUpdateProject({ subtitles: mapped });
        setAlertText(t.subsSuccess);
        setTimeout(() => setAlertText(null), 3000);
      }
    } catch (e) {
      alert("Errore durante la trascrizione automatica. Riprova.");
    } finally {
      setIsLoadingSubtitles(false);
    }
  };

  // Convert natural language commands from SpeechAssistant
  const handleApplyVoiceCommands = (commands: any[], feedbackText: string) => {
    if (!activeProject) return;

    let updatedScenes = [...activeProject.scenes];
    const targetSceneIndex = updatedScenes.findIndex((s) => s.id === currentSceneId);
    if (targetSceneIndex < 0) return;

    commands.forEach((c) => {
      const action = c.action;
      const args = c.args || {};

      if (action === "addText" && args.text) {
        const newTxt = {
          id: `txtv-${Date.now()}-${Math.floor(Math.random()*100)}`,
          text: args.text,
          x: 50,
          y: 45,
          color: args.color || '#ffffff',
          fontSize: args.fontSize || 28,
          fontFamily: args.fontFamily || '"Space Grotesk", sans-serif',
          animation: args.animation || 'fade'
        };
        updatedScenes[targetSceneIndex].texts.push(newTxt);
      }

      else if (action === "setFilter" && args.filter) {
        updatedScenes[targetSceneIndex].filter = args.filter;
      }

      else if (action === "setBackground" && args.color) {
        updatedScenes[targetSceneIndex].backgroundColor = args.color;
        // remove active static background image when changing theme colors
        updatedScenes[targetSceneIndex].image = undefined;
        updatedScenes[targetSceneIndex].imageName = undefined;
      }

      else if (action === "addSticker" && args.value) {
        const newStk = {
          id: `stkv-${Date.now()}`,
          type: args.type || 'emoji',
          value: args.value,
          x: 50,
          y: 50,
          scale: 1.5
        };
        updatedScenes[targetSceneIndex].stickers.push(newStk);
      }

      else if (action === "setDuration" && args.duration) {
        updatedScenes[targetSceneIndex].duration = Math.max(1, Math.min(15, args.duration));
      }

      else if (action === "addScene") {
        const currentSum = updatedScenes.reduce((sum, s) => sum + s.duration, 0);
        if (currentSum < 40) {
          updatedScenes.push({
            id: `scv-${Date.now()}`,
            duration: Math.min(5, 40 - currentSum),
            backgroundColor: '#090d16',
            filter: 'none',
            transition: 'none',
            texts: [],
            stickers: []
          });
        }
      }
    });

    const newDuration = updatedScenes.reduce((sum, s) => sum + s.duration, 0);
    handleUpdateProject({ scenes: updatedScenes, duration: Math.min(40, newDuration) });
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center font-sans pr-4 pl-4 text-center">
        <UploadCloudPulse />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-800 flex flex-col font-sans select-none antialiased selection:bg-indigo-500/30 selection:text-white pb-10">
      
      {/* Top Application Header bar */}
      <header className="border-b border-indigo-100 bg-white/95 px-4 py-3 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-0 z-50 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-slate-900 text-base md:text-lg font-sans flex items-center gap-1.5">
              {t.title} 
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-pink-500 text-white rounded-lg shadow-sm shadow-pink-100">PRO VERSION</span>
            </h1>
            <p className="text-xs text-slate-500 font-sans font-medium tracking-tight">
              {t.sub}
            </p>
          </div>
        </div>

        {/* Action center header */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Synchronized status display indicator */}
          <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-semibold ${
            isSaving 
              ? 'border-orange-200 bg-orange-50 text-orange-700' 
              : 'border-green-200 bg-green-50 text-green-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="font-sans text-[10px] tracking-wide font-bold uppercase">
              {isSaving ? t.saving : t.saveStatus}
            </span>
          </div>

          {/* Core Language Localization Flag selectors */}
          <div className="relative flex items-center bg-indigo-50 border border-indigo-100/80 px-2.5 py-0.5 rounded-full text-xs gap-1.5">
            <Languages className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const ln = e.target.value as any;
                setSelectedLanguage(ln);
              }}
              className="bg-transparent border-none text-slate-800 py-1 pl-1 pr-1 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="it" className="bg-white">Italiano (IT)</option>
              <option value="en" className="bg-white">English (EN)</option>
              <option value="es" className="bg-white">Español (ES)</option>
              <option value="fr" className="bg-white">Français (FR)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main workspace dynamic grid layouts */}
      <main className="flex-1 w-full max-w-8xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Grid Pane: Multi projects lists, script prompts, and instructions details (3 columns) */}
        <section className="lg:col-span-3 flex flex-col gap-6 h-full">
          
          {/* Projects Synchronizer side lists */}
          <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-100/50">
            <div className="flex items-center justify-between mb-3 border-b border-indigo-50 pb-2.5">
              <span className="text-indigo-950 font-black uppercase text-xs tracking-wider flex items-center gap-1.5 font-sans">
                <Layers className="w-4 h-4 text-indigo-500" />
                {selectedLanguage === 'it' ? 'I Miei Progetti' : 'My Cloud Projects'}
              </span>
              <button
                onClick={handleCreateNewProject}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-sans font-bold cursor-pointer flex items-center gap-1 shadow-md shadow-indigo-200 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.newProj}
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-thin">
              {projects.map((proj) => {
                const isActive = proj.id === currentProjectId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setCurrentProjectId(proj.id);
                      setCurrentSceneId(proj.scenes[0]?.id || '');
                    }}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isActive 
                        ? 'border-indigo-400 bg-indigo-50/50 text-indigo-950' 
                        : 'border-slate-105 border-slate-100 bg-slate-50/30 text-slate-600 hover:bg-indigo-50/20'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="text-xs font-bold truncate text-slate-800">{proj.name}</span>
                      <span className="text-[9px] text-slate-450 font-mono tracking-wide mt-0.5 uppercase">
                        {proj.scenes.length} {selectedLanguage === 'it' ? 'Sceneggiature' : 'Scenes'} • {proj.duration.toFixed(1)}s
                      </span>
                    </div>

                    {projects.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(proj.id);
                        }}
                        className="p-1.5 rounded-full bg-slate-100 hover:bg-pink-500 hover:text-white text-slate-400 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Web search trendy and Script write section */}
          <AIPresenter 
            onApplyScript={handleApplyAIScript} 
            language={selectedLanguage} 
          />

          {/* Automated Subtitle transcription settings */}
          <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-105 shadow-indigo-100/50 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
              <span className="text-indigo-950 font-black uppercase text-xs tracking-wider flex items-center gap-1.5 font-sans">
                <FileEdit className="w-4 h-4 text-indigo-500" />
                {t.scriptTitle}
              </span>
            </div>

            <textarea
              value={activeProject?.scriptText || ''}
              onChange={(e) => handleUpdateProject({ scriptText: e.target.value })}
              placeholder={t.scriptPlaceholder}
              className="w-full h-24 bg-indigo-50/50 border border-indigo-100/40 text-slate-800 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs font-sans placeholder-slate-400 max-h-36 resize-none"
            />

            <button
              onClick={handleGenerateAutomatedSubtitles}
              disabled={isLoadingSubtitles || !activeProject?.scriptText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-full shadow-md shadow-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoadingSubtitles ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              )}
              {t.generateSubsBtn}
            </button>

            {alertText && (
              <div className="border border-green-200 bg-green-50 text-emerald-700 text-center py-2 rounded-2xl text-xs font-semibold shadow-sm animate-bounce">
                {alertText}
              </div>
            )}
          </div>
        </section>

        {/* Central Grid Pane: Vertical mobile screen Video Canvas (4 columns) */}
        <section className="lg:col-span-5 flex justify-center">
          <VideoCanvas
            project={activeProject}
            currentSceneId={currentSceneId}
            onSelectScene={handleSelectScene}
            onUpdateScene={handleUpdateScene}
            language={selectedLanguage}
          />
        </section>

        {/* Right Grid Pane: Timeline tracks, audio layered mixer, social optimization templates, and voice controls (5 columns) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Integrated voice communications console panel */}
          <VoiceAssistant
            currentSceneIndex={activeProject?.scenes.findIndex((s) => s.id === currentSceneId) || 0}
            onApplyCommands={handleApplyVoiceCommands}
            language={selectedLanguage}
          />

          {/* Integrated Timelines strip customizer */}
          <Timeline
            scenes={activeProject?.scenes || []}
            currentSceneId={currentSceneId}
            onSelectScene={handleSelectScene}
            onUpdateScene={handleUpdateScene}
            onAddScene={handleAddScene}
            onRemoveScene={handleRemoveScene}
            language={selectedLanguage}
          />

          {/* Audio levels track mixers */}
          <AudioLayerManager
            audio={activeProject?.audio || { backgroundVolume: 50, voiceVolume: 80, micVolume: 100, backgroundTrackId: 'lofi' }}
            onUpdateAudio={(audioArgs) => {
              if (!activeProject) return;
              handleUpdateProject({ audio: { ...activeProject.audio, ...audioArgs } });
            }}
            language={selectedLanguage}
          />

          {/* Optimized social sharing and Avi exports panel */}
          <SocialSharer
            project={activeProject}
            language={selectedLanguage}
          />

          {/* Helpful terms list and limits details */}
          <div className="bg-white border border-indigo-100 rounded-3xl p-4 shadow-sm shadow-indigo-100/35 flex items-start gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-2xl text-pink-500 shadow-sm shadow-indigo-50">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-slate-900 font-extrabold text-xs tracking-tight">{t.infoTitle}</h4>
              <p className="text-[10px] text-slate-500 font-medium font-sans mt-1 leading-normal">
                {t.infoDetail}
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

function UploadCloudPulse() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center p-3.5 bg-indigo-100 rounded-full shadow-lg shadow-indigo-100/40">
        <CloudLightning className="w-8 h-8 text-indigo-600 animate-pulse" />
        <span className="absolute inset-0 rounded-full border-2 border-indigo-300 scale-150 animate-ping"></span>
      </div>
      <div>
        <h4 className="text-slate-900 font-extrabold text-sm">Caricamento MoviShorts Studio...</h4>
        <p className="text-xs text-slate-500 mt-1">Recupero e sincronizzazione database cloud in corso</p>
      </div>
    </div>
  );
}
