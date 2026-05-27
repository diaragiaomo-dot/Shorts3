import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Initialise Gemini with standard studio configuration
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const CLOUD_DB_PATH = path.join(process.cwd(), "projects_cloud_db.json");

// Ensure projects JSON file exists
if (!fs.existsSync(CLOUD_DB_PATH)) {
  fs.writeFileSync(CLOUD_DB_PATH, JSON.stringify([]), "utf-8");
}

// Helper to read database
function getProjectsFromDB() {
  try {
    const data = fs.readFileSync(CLOUD_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to save database
function saveProjectsToDB(projects: any) {
  fs.writeFileSync(CLOUD_DB_PATH, JSON.stringify(projects, null, 2), "utf-8");
}

// --------------------------------------------------------
// Express API Endpoints
// --------------------------------------------------------

// 1. Projects DB syncing (Cloud persistence)
app.get("/api/projects", (req, res) => {
  try {
    const projects = getProjectsFromDB();
    res.json({ projects });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/projects", (req, res) => {
  try {
    const project = req.body.project;
    if (!project || !project.id) {
      return res.status(400).json({ error: "Progetto non valido" });
    }
    const projects = getProjectsFromDB();
    const index = projects.findIndex((p: any) => p.id === project.id);
    project.updatedAt = new Date().toISOString();
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    saveProjectsToDB(projects);
    res.json({ success: true, project });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  try {
    const id = req.params.id;
    let projects = getProjectsFromDB();
    projects = projects.filter((p: any) => p.id !== id);
    saveProjectsToDB(projects);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Real-time Search Grounding
app.post("/api/search/grounding", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Fornisci un riassunto dei trend attuali o dei fatti salienti in risposta a questa query del creatore di Shorts/Reels: "${query}". Fornisci idee di sceneggiatura brevi (massimo 40 secondi totali).`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Nessun risultato di ricerca trovato.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract sources
    const sources = chunks.map((c: any) => ({
      title: c.web?.title || "Sorgente",
      url: c.web?.uri || "#"
    }));

    res.json({ text, sources });
  } catch (e: any) {
    console.error("Search Grounding Error:", e);
    res.status(500).json({ error: e.message || "Errore durante la ricerca web" });
  }
});

// 3. Document or Text context to Shorts Script generator
app.post("/api/ai/generate-script", async (req, res) => {
  try {
    const { documentName, contentSnippet, prompt, language } = req.body;
    const targetLang = language || "it";

    const systemPrompt = `Sei un esperto di marketing e creazione di video Shorts YouTube / TikTok Reels.
I tuoi video devono durare al massimo 40 secondi.
In base alle informazioni inviate dall'utente (estratti di documenti/immagini/note) e le indicazioni, genera una sceneggiatura formattata in JSON con un set di scene raccomandate (massimo 4-5 scene, per un totale di max 40 secondi).
Ogni scena deve avere:
1. duration: numero di secondi (la somma di tutte le scene non deve superare i 40 secondi).
2. backgroundColor: una stringa colore esadecimale o gradiente CSS elegante (es. "linear-gradient(135deg, #1e3c72, #2a5298)" o "#0f172a").
3. textOverlay: testo d'impatto accattivante da mostrare sullo schermo (massimo 10 parole).
4. filter: uno degli effetti pronti all'uso: "none", "glitch", "blur", "noir", "cyberpunk", "neon", "film".
5. transition: una transizione scenica: "none", "fade", "slide-left", "zoom-in".
6. explanation: breve spiegazione visiva di cosa si mostra.

Il formato di risposta deve essere rigorosamente in JSON secondo lo schema richiesto. Rispondi nella lingua richiesta: ${targetLang}.`;

    const userPrompt = `Documento / Contesto allegato: "${documentName || 'Nessuno'}"
Contenuto estratto/Snippet: "${contentSnippet || 'Nessuno'}"
Indicazioni dell'utente: "${prompt || 'Crea uno Short accattivante'}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Titolo accattivante per lo Short" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hashtags suggeriti" },
            scriptIdea: { type: Type.STRING, description: "Idea generale del copione" },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  duration: { type: Type.NUMBER },
                  backgroundColor: { type: Type.STRING },
                  textOverlay: { type: Type.STRING },
                  filter: { type: Type.STRING, description: "Scegli tra: none, glitch, blur, noir, cyberpunk, neon, film" },
                  transition: { type: Type.STRING, description: "Scegli tra: none, fade, slide-left, zoom-in" },
                  explanation: { type: Type.STRING }
                },
                required: ["duration", "backgroundColor", "textOverlay", "filter", "transition"]
              }
            }
          },
          required: ["title", "tags", "scriptIdea", "scenes"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (e: any) {
    console.error("Generate Script error:", e);
    res.status(500).json({ error: e.message || "Errore nella generazione dello script" });
  }
});

// 4. Voice / Text Command interpreter (Generative editing in real-time)
app.post("/api/ai/voice-command", async (req, res) => {
  try {
    const { instruction, currentSceneIndex, language } = req.body;
    if (!instruction) {
      return res.status(400).json({ error: "Istruzione vocale/testuale vuota" });
    }

    const systemPrompt = `Sei l'assistente vocale integrato di un editor video per YouTube Shorts.
Il tuo compito è tradurre l'ordine parlato o scritto dell'utente in un set preciso di comandi di modifica video (azioni).
Puoi generare le seguenti azioni in ordine cronologico:
- "addText": aggiunge un testo alla scena. Argomenti: text (string), color (hex), fontSize (number), animation ("fade" | "bounce" | "slide-up" | "zoom-in" | "none")
- "setFilter": imposta l'effetto filter della scena. Argomenti: filter ("none" | "glitch" | "blur" | "noir" | "cyberpunk" | "neon" | "film")
- "setBackground": imposta il colore dello sfondo. Argomenti: color (hex o gradient CSS)
- "addSticker": aggiunge un'icona o emoji. Argomenti: value (un emoji idoneo o nome icona es. "sparkles", "star", "flame"), type ("emoji" | "icon")
- "setDuration": imposta la durata della scena attuale. Argomenti: duration (number)
- "addScene": aggiunge una nuova scena alla timeline.

Esempi di istruzioni e output:
- "Aggiungi un sticker a forma di fiammella" -> { commands: [ { action: "addSticker", args: { value: "🔥", type: "emoji" } } ], feedback: "Ho aggiunto l'emoji della fiamma!" }
- "Metti un filtro cyberpunk e scrivi ciao in rosso" -> { commands: [ { action: "setFilter", args: { filter: "cyberpunk" } }, { action: "addText", args: { text: "ciao", color: "#FF0000", fontSize: 40, animation: "bounce" } } ], feedback: "Filtro cyberpunk applicato e testo inserito in rosso!" }

La tua risposta deve essere un JSON conforme al formato richiesto. Lingua per il feedback: ${language || 'it'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Interpreta questa istruzione vocale o testuale dell'utente riferito alla scena corrente #${currentSceneIndex || 0}: "${instruction}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING, description: "Messaggio vocale o testuale amichevole di risposta per l'utente" },
            commands: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, description: "addText, setFilter, setBackground, addSticker, setDuration, addScene" },
                  args: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      color: { type: Type.STRING },
                      fontSize: { type: Type.NUMBER },
                      animation: { type: Type.STRING },
                      filter: { type: Type.STRING },
                      value: { type: Type.STRING },
                      type: { type: Type.STRING },
                      duration: { type: Type.NUMBER }
                    }
                  }
                },
                required: ["action", "args"]
              }
            }
          },
          required: ["feedback", "commands"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (e: any) {
    console.error("Voice Command Interpreter Error:", e);
    res.status(500).json({ error: e.message || "Impossibile elaborare l'istruzione vocale" });
  }
});

// 5. Autonatic Multilingual Subtitle System
app.post("/api/ai/subtitles", async (req, res) => {
  try {
    const { scriptText, totalDuration, language } = req.body;
    const duration = totalDuration || 20; // default to 20 seconds
    const targetLang = language || "Italiano";

    const systemInstruction = `Sei un trascrittore automatico AI di video Shorts / Reels.
Dato un testo della sceneggiatura, genera un set di sottotitoli automatici perfettamente sincronizzati con i tempi (in secondi) dall'inizio fino al termine della durata dichiarata (${duration} secondi).
I sottotitoli devono essere distribuiti in brevi pezzi di massimo 4 parole per blocco per garantire massima leggibilità nei video verticali veloci.
Traducili o formattali nella lingua target: "${targetLang}".

La risposta deve essere un array di oggetti subtitle in formato JSON con start (secondi decimali), end (secondi decimali), e il testo.`;

    const userPrompt = `Testo da tradurre e sincronizzare in sottotitoli: "${scriptText || 'Inizia il video'}"
Durata complessiva stabilita dello Short: ${duration} secondi.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtitles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.NUMBER, description: "Tempo di inizio, es. 1.2" },
                  end: { type: Type.NUMBER, description: "Tempo di fine, es. 3.4" },
                  text: { type: Type.STRING, description: "Breve frase o parole" }
                },
                required: ["start", "end", "text"]
              }
            }
          },
          required: ["subtitles"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (e: any) {
    console.error("Subtitle Generator Error:", e);
    res.status(500).json({ error: e.message || "Errore durante la generazione dei sottotitoli" });
  }
});

// 6. Gemini Image Generation / AI Stickering on Canvas with gemini-2.5-flash-image
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Il prompt per l'immagine è vuoto" });
    }

    // Call generateContent with gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        { text: `Un elemento grafico vettoriale pulito o sticker/sfondo isolato per video Shorts. Tema: ${prompt}. Rendi i dettagli vividi.` }
      ],
      config: {
        imageConfig: {
          aspectRatio: "9:16", // vertical format matches youtube shorts perfectly
          imageSize: "512px"
        }
      }
    });

    let base64Img = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Img = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Img) {
      // Check if Imagen falls back
      return res.status(500).json({ error: "La generazione immagine non ha restituito dati in linea. Verifica i privilegi della chiave." });
    }

    res.json({ imageUrl: `data:image/png;base64,${base64Img}` });
  } catch (e: any) {
    console.error("Image Generation Error:", e);
    res.status(500).json({ error: e.message || "Errore nella generazione dell'immagine con l'IA" });
  }
});


// --------------------------------------------------------
// Vite Integrations for Frontend
// --------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[YouTube Shorts Maker] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
