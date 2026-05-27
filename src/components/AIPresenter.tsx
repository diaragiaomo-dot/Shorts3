import React, { useState } from 'react';
import { Sparkles, Send, Search, FileText, Globe, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project, Scene } from '../types';

interface AIPresenterProps {
  onApplyScript: (scriptData: { title: string; scriptIdea: string; tags: string[]; scenes: Scene[] }) => void;
  language: 'it' | 'en' | 'es' | 'fr';
}

interface TrendSearchResult {
  text: string;
  sources: { title: string; url: string }[];
}

export default function AIPresenter({ onApplyScript, language }: AIPresenterProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'docs'>('trends');
  
  // Real-time Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<TrendSearchResult | null>(null);

  // Document states
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [docSnippet, setDocSnippet] = useState('');
  const [docPrompt, setDocPrompt] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docSuccess, setDocSuccess] = useState(false);
  const [errMessage, setErrMessage] = useState<string | null>(null);

  // Handle Real-time web search with Grounding
  const handleTrendSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setErrMessage(null);
    setSearchResult(null);

    try {
      const res = await fetch('/api/search/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      if (!res.ok) throw new Error("Errore durante la ricerca. Riprova");
      const data = await res.json();
      setSearchResult({
        text: data.text,
        sources: data.sources || []
      });
    } catch (e: any) {
      setErrMessage(e.message || "Errore di ricerca");
    } finally {
      setSearchLoading(false);
    }
  };

  // Convert current Trends Search results into a script via AI
  const handleCreateScriptFromSearch = async () => {
    if (!searchResult) return;
    setSearchLoading(true);
    setErrMessage(null);
    try {
      const res = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Crea un video Shorts basato su queste informazioni sui trend correnti: ${searchResult.text}`,
          language
        })
      });
      if (!res.ok) throw new Error("Errore compilazione sceneggiatura");
      const data = await res.json();
      onApplyScript(data);
    } catch (e: any) {
      setErrMessage(e.message || "Impossibile compilare lo script");
    } finally {
      setSearchLoading(false);
    }
  };

  // Custom document drag-and-drop parsing logic
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processDocumentFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processDocumentFile(file);
    }
  };

  const processDocumentFile = (file: File) => {
    setUploadedDocName(file.name);
    setErrMessage(null);
    
    // Read snippet limit is basic for preview
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      // Slice snippet first 3000 chars to fit context nicely
      setDocSnippet(text.slice(0, 3000));
    };
    reader.readAsText(file);
  };

  // Generate Script from uploaded document structure
  const handleGenerateScriptFromDoc = async () => {
    if (!docSnippet.trim() && !docPrompt.trim()) return;
    setDocLoading(true);
    setErrMessage(null);
    setDocSuccess(false);

    try {
      const res = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: uploadedDocName,
          contentSnippet: docSnippet,
          prompt: docPrompt,
          language
        })
      });
      if (!res.ok) throw new Error("Errore generazione dello Shorts da documento");
      const data = await res.json();
      onApplyScript(data);
      setDocSuccess(true);
    } catch (e: any) {
      setErrMessage(e.message || "Impossibile generare lo script");
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="bg-white border border-indigo-150 border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-100/40">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse animate-duration-1000" />
        <h3 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">
          {language === 'it' ? 'Sceneggiatura Automatica IA' : 'AI Copilot Scriptwriter'}
        </h3>
      </div>

      <p className="text-xs text-slate-500 font-sans font-medium leading-relaxed mb-4">
        {language === 'it' 
          ? "Crea shorts YouTube all'istante! Cerca notizie attuali online o carica i tuoi file e documenti (PDF/TXT/DOCX)."
          : "Create viral Shorts in seconds! Search online or drop in your workspace files (PDF/TXT/DOCX)."}
      </p>

      {/* Interfaccia Tabs */}
      <div className="flex bg-indigo-50/50 p-1 rounded-2xl mb-4 border border-indigo-100/30">
        <button
          onClick={() => { setActiveTab('trends'); setErrMessage(null); }}
          className={`flex-1 py-1.5 text-xs font-sans rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'trends' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          {language === 'it' ? 'Notizie & Trend' : 'Web Trends'}
        </button>
        <button
          onClick={() => { setActiveTab('docs'); setErrMessage(null); }}
          className={`flex-1 py-1.5 text-xs font-sans rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'docs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          {language === 'it' ? 'Caricatore' : 'Upload Docs'}
        </button>
      </div>

      {errMessage && (
        <div className="mb-4 bg-rose-50 border border-rose-100 p-3 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{errMessage}</span>
        </div>
      )}

      {/* Interactive Tabs Screen rendering */}
      {activeTab === 'trends' ? (
        <div className="flex flex-col gap-3 font-sans">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrendSearch()}
              placeholder={
                language === 'it'
                  ? "Es: Scoperta spazio astronauti NASA..."
                  : "NASA space exploration, Crypto..."
              }
              className="flex-1 bg-indigo-50/50 border border-indigo-100/40 rounded-2xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-450 focus:ring-indigo-400"
            />
            <button
              onClick={handleTrendSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-4 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 shadow-md shadow-indigo-100 active:scale-95"
            >
              {searchLoading ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              {language === 'it' ? 'Cerca' : 'Search'}
            </button>
          </div>

          {searchResult && (
            <div className="bg-slate-50 rounded-2xl border border-indigo-100/50 p-3.5 mt-1 flex flex-col gap-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'it' ? 'RISULTATI IN TEMPO REALE' : 'LIVE ACCURATE NEWS GROUNDING'}</span>
              </div>
              <p className="text-[11px] text-slate-705 text-slate-700 leading-relaxed max-h-36 overflow-y-auto font-sans bg-white border border-indigo-50 p-2.5 rounded-xl scrollbar-thin font-medium">
                {searchResult.text}
              </p>

              {/* Real search grounding sources triggers */}
              {searchResult.sources.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">{language === 'it' ? 'Fonti verificate:' : 'Grounding sources:'}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResult.sources.slice(0, 3).map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="text-[10px] px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-100 rounded-lg text-slate-600 hover:text-indigo-600 font-bold transition-all truncate max-w-[120px] shadow-sm shadow-indigo-50/50"
                      >
                        🔗 {src.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateScriptFromSearch}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-full text-xs shadow-md shadow-green-150 shadow-emerald-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {language === 'it' ? 'Crea Video Shorts' : 'Compile Active Short Video'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Documents and workspace files upload zone */
        <div className="flex flex-col gap-3 font-sans">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/35 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative"
          >
            <input
              type="file"
              accept=".txt,.pdf,.csv,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileText className="w-8 h-8 text-indigo-500" />
            <span className="text-xs text-slate-700 font-bold">
              {uploadedDocName ? `✓ ${uploadedDocName}` : (language === 'it' ? 'Trascina o carica file/PDF' : 'Drag or select documents/PDFs')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              TXT, PDF, Word, CSV (Max 5MB)
            </span>
          </div>

          {uploadedDocName && (
            <div className="bg-slate-50 border border-indigo-50 rounded-2xl p-3 max-h-24 overflow-y-auto">
              <span className="text-[10px] text-indigo-600 block font-bold mb-0.5">ESTRATTO TESTO:</span>
              <p className="text-[10px] text-slate-500 font-medium leading-normal">
                {docSnippet || "Estrazione..."}
              </p>
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1">
              {language === 'it' ? 'Istruzioni opzionali per montitore IA' : 'Prompt adjustments for AI timeline (optional)'}
            </label>
            <textarea
              value={docPrompt}
              onChange={(e) => setDocPrompt(e.target.value)}
              placeholder={language === 'it' ? "Es: Rendi il tono molto energetico..." : "E.g. Focus on educational summaries"}
              className="w-full h-14 bg-indigo-50/50 border border-indigo-100/40 rounded-2xl px-3 py-2 text-xs text-slate-800 placeholder-slate-405 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 max-h-24 resize-none"
            />
          </div>

          <button
            onClick={handleGenerateScriptFromDoc}
            disabled={docLoading || (!uploadedDocName && !docPrompt)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all"
          >
            {docLoading ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            )}
            {language === 'it' ? 'Genera Shorts da File' : 'Generate Reel timeline from file'}
          </button>

          {docSuccess && (
            <div className="p-2 border border-green-200 bg-green-50 text-green-700 rounded-2xl text-xs flex items-center gap-1.5 justify-center py-2 font-sans font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>{language === 'it' ? 'Sceneggiatura applicata con successo!' : 'Shorts script applied to timeline!'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
