import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, HelpCircle } from 'lucide-react';

interface VoiceAssistantProps {
  currentSceneIndex: number;
  onApplyCommands: (commands: any[], feedbackText: string) => void;
  language: 'it' | 'en' | 'es' | 'fr';
}

const COMMAND_SUGGESTIONS = {
  it: [
    "Aggiungi testo 'Incredibile!' in giallo",
    "Applica filtro cyberpunk alla scena",
    "Imposta sfondo rosso vivo",
    "Aggiungi sticker fioca 🔥",
    "Imposta durata a 8 secondi",
    "Crea una nuova scena"
  ],
  en: [
    "Add text 'Incredible!' in yellow",
    "Apply cyberpunk filter to scene",
    "Set background to glowing pink",
    "Add sticker fire 🔥",
    "Set duration to 8 seconds",
    "Create a new scene"
  ],
  es: [
    "Añade texto '¡Increíble!' en amarillo",
    "Aplica filtro cyberpunk a la escena",
    "Poner fondo rojo brillante",
    "Añade sticker fuego 🔥",
    "Establecer duración en 8 segundos",
    "Crear una nueva escena"
  ],
  fr: [
    "Ajoute texte 'Incroyable!' en jaune",
    "Applique le filtre cyberpunk",
    "Définir fond rouge éclatant",
    "Ajoute sticker feu 🔥",
    "Régler la durée à 8 secondes",
    "Créer une nouvelle scène"
  ]
};

export default function VoiceAssistant({ currentSceneIndex, onApplyCommands, language }: VoiceAssistantProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'it' ? 'it-IT' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendInstruction(transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setErrorMsg(
          language === 'it' 
            ? "Errore microfono o non supportato in questo browser. Usa l'input testuale!"
            : "Microphone error or unsupported in this browser. Use text input!"
        );
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg(
        language === 'it'
          ? "Riconoscimento vocale non supportato in questo ambiente. Digita l'istruzione!"
          : "Speech recognition not supported in this frame. Type your instruction!"
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendInstruction = async (textToSend?: string) => {
    const activeText = textToSend || inputText;
    if (!activeText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setFeedback(null);

    try {
      const response = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: activeText,
          currentSceneIndex,
          language
        })
      });

      if (!response.ok) {
        throw new Error("Errore della risposta del server (" + response.status + ")");
      }

      const data = await response.json();
      if (data.commands && data.commands.length > 0) {
        onApplyCommands(data.commands, data.feedback);
        setFeedback(data.feedback);
      } else {
        setFeedback(
          language === 'it'
            ? "Ho capito l'istruzione ma non corrisponde a nessun comando noto. Riprova!"
            : "Got it, but couldn't map to dynamic editor commands. Try again!"
        );
      }
      
      if (!textToSend) {
        setInputText('');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        language === 'it'
          ? "Impossibile connettersi all'assistente AI. Riprova più tardi."
          : "Could not connect to AI voice coordinator. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = COMMAND_SUGGESTIONS[language] || COMMAND_SUGGESTIONS.it;

  return (
    <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-100/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm shadow-indigo-50">
            <Sparkles className="w-5 h-5 animate-pulse text-indigo-600 animate-duration-1000" />
          </div>
          <h3 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">
            {language === 'it' 
              ? 'Assistente Vocale AI' 
              : language === 'es' 
              ? 'Asistente de Voz AI' 
              : 'AI Voice Assistant'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/40 px-3 py-1 rounded-full shadow-sm shadow-indigo-50">
          <span>{language === 'it' ? 'Scena' : 'Scene'} #{currentSceneIndex + 1}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-sans font-medium leading-relaxed mb-4">
        {language === 'it'
          ? "Parla al microfono o digita comandi generativi per editare in tempo reale! L'intelligenza artificiale applicherà filtri, testi animati e stickers per te."
          : "Speak to the microphone or type generative commands to edit in real-time! The AI will apply overlays, texts, and timing for you."}
      </p>

      {/* Input controls layout */}
      <div className="flex items-center gap-2.5 mb-3">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
            isListening
              ? 'bg-pink-500 text-white animate-bounce shadow-pink-100'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-150 shadow-indigo-100'
          }`}
          title={language === 'it' ? 'Attiva Microfono' : 'Activate Mic'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendInstruction()}
            placeholder={
              isListening
                ? (language === 'it' ? "Ascolto in corso..." : "Listening...")
                : (language === 'it' ? "Es. 'Metti filtro neon e scrivi Wow!'" : "E.g. 'Add sticker fire'")
            }
            className="w-full bg-indigo-50/50 border border-indigo-100/40 rounded-2xl py-2.5 pl-3 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-sans"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendInstruction()}
            className="absolute right-3 top-3 text-indigo-500 hover:text-indigo-800 cursor-pointer"
            disabled={isLoading || !inputText.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isListening && (
        <div className="flex items-center gap-1.5 justify-center py-1 text-xs text-pink-500 font-mono font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
          <span>{language === 'it' ? 'PARLA ORA...' : 'SPEAK NOW...'}</span>
        </div>
      )}

      {/* Show dynamic status loaders / feedback / error info */}
      {isLoading && (
        <div className="flex items-center gap-2 justify-center py-2 text-xs text-indigo-600 font-sans font-bold">
          <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>{language === 'it' ? "Interpretazione comandi..." : "Parsing commands..."}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 border border-rose-105 border-rose-100 bg-rose-50 rounded-2xl text-xs text-rose-700 font-bold mb-3 text-center">
          {errorMsg}
        </div>
      )}

      {feedback && (
        <div className="p-3 border border-indigo-100 bg-indigo-50/50 rounded-2xl text-xs text-indigo-905 text-indigo-900 font-medium font-sans italic mb-3 animate-fade-in shadow-sm">
          💡 <strong>AI:</strong> "{feedback}"
        </div>
      )}

      {/* Recommended dynamic queries suggestions */}
      <div>
        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>{language === 'it' ? 'Prova a dire:' : 'Try saying:'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(sug);
                handleSendInstruction(sug);
              }}
              className="text-left py-2 px-3 bg-slate-50 hover:bg-indigo-50/15 border border-indigo-50 text-[11px] text-slate-600 hover:text-indigo-700 font-medium rounded-xl hover:border-indigo-100 transition-all truncate cursor-pointer font-sans shadow-sm shadow-indigo-50/20"
            >
              • {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
