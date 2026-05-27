import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Disc, Mic, Square, Play, BarChart2 } from 'lucide-react';
import { AudioConfig } from '../types';

interface AudioLayerManagerProps {
  audio: AudioConfig;
  onUpdateAudio: (audio: Partial<AudioConfig>) => void;
  language: 'it' | 'en' | 'es' | 'fr';
}

const PRESET_TRACKS = [
  { id: 'lofi', name: 'Lofi Aesthetic Loop', genre: 'Chillhop' },
  { id: 'pop', name: 'Sunny Pop Synth', genre: 'Uptempo' },
  { id: 'cyber', name: 'Cyberpunk Hyperbeat', genre: 'Electro' },
  { id: 'cinematic', name: 'Epic Cinematic Theme', genre: 'Orchestra' },
  { id: 'none', name: 'Nessuna traccia musicale (Muto)', genre: 'Silence' }
];

export default function AudioLayerManager({ audio, onUpdateAudio, language }: AudioLayerManagerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [simulatedAmplitudes, setSimulatedAmplitudes] = useState<number[]>([10, 20, 15, 45, 30, 60, 22, 12, 18, 55, 40]);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);

  // Simulated Mic Voiceover recording
  const startRecording = async () => {
    setIsRecording(true);
    setRecordTimer(0);
    
    // Simulate audio visualizer levels
    timerRef.current = setInterval(() => {
      setRecordTimer(prev => prev + 1);
      // random amplitudes
      const amps = Array.from({ length: 11 }, () => Math.floor(Math.random() * 80) + 10);
      setSimulatedAmplitudes(amps);
    }, 500);

    // Prompt actual microphone recording for standard desktop browsers
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        let chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const blobUrl = URL.createObjectURL(blob);
          onUpdateAudio({ micRecordingBlobUrl: blobUrl });
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (e) {
      console.warn("Media devices not supported or permission denied in preview iframe context (mic simulation used).");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulate fake recording
      onUpdateAudio({ micRecordingBlobUrl: 'pseudo_mic_stream_url' });
    }
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm shadow-indigo-100/40 flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-indigo-50 pb-2.5">
        <Volume2 className="w-5 h-5 text-indigo-600" />
        <h3 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">
          {language === 'it' ? 'Mixer Audio & Tracce' : 'Audio Track Mixer'}
        </h3>
      </div>

      {/* Grid of Sliders for multi-track management */}
      <div className="flex flex-col gap-3">
        {/* Track 1: Soundtrack */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
            <span className="text-slate-700 font-bold block">🎵 {language === 'it' ? 'Base Musicale' : 'Music Soundtrack'}</span>
            <span className="text-[11px] font-mono font-extrabold text-indigo-600">{audio.backgroundVolume}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onUpdateAudio({ backgroundVolume: audio.backgroundVolume === 0 ? 60 : 0 })}
              className="text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
            >
              {audio.backgroundVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={audio.backgroundVolume}
              onChange={(e) => onUpdateAudio({ backgroundVolume: parseInt(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Track 2: Dialogue / AI Voice */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
            <span className="text-slate-700 font-bold block">🗣️ {language === 'it' ? 'Dialoghi / Voce Narrante' : 'Dialogue / Narrator'}</span>
            <span className="text-[11px] font-mono font-extrabold text-emerald-600">{audio.voiceVolume}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onUpdateAudio({ voiceVolume: audio.voiceVolume === 0 ? 80 : 0 })}
              className="text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
            >
              {audio.voiceVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={audio.voiceVolume}
              onChange={(e) => onUpdateAudio({ voiceVolume: parseInt(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Track 3: Microphone Sound Effects / Captured Sound */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
            <span className="text-slate-700 font-bold block">🎙️ {language === 'it' ? 'Registratore Microfono' : 'Microphone Voiceover'}</span>
            <span className="text-[11px] font-mono font-extrabold text-pink-600">{audio.micVolume}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onUpdateAudio({ micVolume: audio.micVolume === 0 ? 100 : 0 })}
              className="text-slate-400 hover:text-pink-600 cursor-pointer transition-colors"
            >
              {audio.micVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={audio.micVolume}
              onChange={(e) => onUpdateAudio({ micVolume: parseInt(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Soundtrack Presets triggers list */}
      <div className="border-t border-indigo-50 pt-3">
        <label className="text-xs text-slate-500 font-bold block mb-2 flex items-center gap-1">
          <Disc className="w-3.5 h-3.5 text-indigo-600 animate-spin animate-duration-3000" />
          {language === 'it' ? 'Sottofondo Musicale Attivo' : 'Select Ambient Track'}
        </label>
        <div className="flex flex-col gap-1.5">
          {PRESET_TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => onUpdateAudio({ backgroundTrackId: track.id })}
              className={`w-full text-left py-2 px-3 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                audio.backgroundTrackId === track.id
                  ? 'border-indigo-400 bg-indigo-50/50 text-indigo-950 font-sans font-bold shadow-sm shadow-indigo-100/30'
                  : 'border-slate-100 bg-slate-50/30 hover:bg-indigo-50/15 text-slate-500'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold">{track.name}</span>
                <span className="text-[10px] text-slate-400 font-mono italic">{track.genre}</span>
              </div>
              {audio.backgroundTrackId === track.id && (
                <span className="text-[10px] uppercase font-bold tracking-wide text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
                  <Play className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600" />
                  Live
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Record Voiceover section */}
      <div className="p-4.5 bg-slate-50 rounded-2xl border border-indigo-100/50 flex flex-col items-center gap-3">
        <span className="text-xs text-indigo-950 font-bold self-start flex items-center gap-1">
          <Mic className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          {language === 'it' ? 'Registrazione Doppiaggio' : 'Live Voiceover Recorder'}
        </span>

        {isRecording ? (
          <div className="flex flex-col items-center gap-2 w-full animate-fade-in">
            <div className="flex gap-0.5 items-end justify-center h-8 w-full px-4 mb-1">
              {simulatedAmplitudes.map((amp, idx) => (
                <div 
                  key={idx} 
                  className="w-1.5 bg-pink-500 rounded-full transition-all duration-150"
                  style={{ height: `${amp}%` }}
                />
              ))}
            </div>
            <div className="text-xs font-mono text-pink-600 font-extrabold mb-1">
              {recordTimer}s / 40.0s
            </div>
            <button
              onClick={stopRecording}
              className="py-1.5 px-4 bg-pink-500 hover:bg-pink-600 flex items-center gap-1.5 text-white text-xs font-sans font-extrabold rounded-full cursor-pointer shadow-md shadow-pink-100 active:scale-95 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              {language === 'it' ? 'Ferma' : 'Stop Rec'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              onClick={startRecording}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 text-xs font-sans font-bold rounded-full cursor-pointer shadow-md shadow-indigo-150 transition-all active:scale-95 w-full"
            >
              <Mic className="w-4 h-4 text-white" />
              {language === 'it' ? 'Inizia Registrazione' : 'Record Voice'}
            </button>
            {audio.micRecordingBlobUrl && (
              <span className="text-[10px] text-emerald-600 font-extrabold text-center block mt-1">
                ✓ {language === 'it' ? 'Audio doppiato pronto per esportazione!' : 'Voiceover ready for export!'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
