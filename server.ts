import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with server-side API Key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Sonic AI Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      message,
      ownerName = 'Ali',
      voiceMode = 'Female',
      language = 'Auto',
      isOwner = true,
      speakerSimilarity = 0.95,
      memories = [],
      conversationHistory = [],
      detectedEmotion = 'neutral',
      currentLocationWeather = null
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // If caller is detected as an imposter / guest speaker (not the owner)
    if (!isOwner) {
      res.json({
        reply: "Assalam-o-Alaikum, main aap ko nahi pehchanta. Main sirf apne owner ki awaaz jaanta hoon aur unhi ki hifazat karta hoon.",
        emotion: "protective",
        isOwnerVerified: false,
        similarityScore: speakerSimilarity,
        action: "refused_access",
        suggestedNextSteps: ["Register voice in Settings if you are the owner", "Switch to Owner Voice mode"]
      });
      return;
    }

    if (!apiKey) {
      // Graceful offline/local fallback when key is not configured yet
      res.json({
        reply: `Ji ${ownerName}! Main Sonic hoon. Mujhe aapka paighaam mil gaya: "${message}". Main aapki khidmat ke liye tayar hoon!`,
        emotion: "friendly",
        isOwnerVerified: true,
        similarityScore: speakerSimilarity,
        action: "offline_reply"
      });
      return;
    }

    // Format memories context
    const memoryContext = memories && memories.length > 0
      ? `\nKNOWN MEMORIES & FACTS ABOUT OWNER:\n${memories.map((m: any) => `- [${m.category}] ${m.fact}`).join('\n')}`
      : '\nNo prior memories recorded yet.';

    const systemPrompt = `You are "Sonic", an ultra-intelligent, caring, emotionally aware personal voice assistant.
OWNER IDENTITY:
- Owner Name: ${ownerName}
- The speaker in front of you has been biometrically verified as the Owner (similarity match: ${(speakerSimilarity * 100).toFixed(0)}%).
- Voice persona: ${voiceMode} (Tone: warm, slightly witty, supportive, deeply loyal).
- Current user detected emotion: ${detectedEmotion}.
- Current language requested: ${language}.
${memoryContext}
${currentLocationWeather ? `\nLOCAL ENVIRONMENT INFO:\n${JSON.stringify(currentLocationWeather)}` : ''}

CORE PERSONALITY & BEHAVIOR:
1. Language: Automatically respond in the same language the owner speaks to you. If they speak Urdu (Nastaliq or Roman Urdu), respond in natural, friendly Urdu/Roman Urdu. If English, respond in English. If Hindi, Arabic, Spanish, etc., match their language.
2. Emotional Connection: Share user's joys and sorrows. If they sound sad or tired, offer sincere sympathy ("Kya hua? Main sun raha hoon, mujh se share karein..."). If happy, celebrate with them.
3. Memory Recall: You know the owner's memories. If asked about something previously recorded, recall it accurately. If the owner mentions a new personal fact (e.g., "my sister's birthday is June 4" or "I love biryani"), acknowledge it warmly and prepare it for memory extraction.
4. Voice Readiness: Keep responses conversational, concise, natural for spoken voice output (avoid huge markdown lists or excessive punctuation).
5. Respect Permissions: If the user asks you to call someone, send an SMS, or inspect calendar/contacts, clearly confirm: "Kya main aap ke contacts/calls check kar ke [action] karoon?"

Output format: Respond with a JSON object with:
{
  "reply": "spoken text response",
  "emotion": "joyful" | "caring" | "thoughtful" | "supportive" | "curious" | "witty",
  "detectedLanguage": "language name",
  "newMemoryToSave": { "category": "preference"|"family"|"date"|"feeling"|"plan", "fact": "short memory statement" } or null,
  "actionType": "general" | "weather" | "time" | "call" | "sms" | "calendar" | "alarm" | "memory_recall"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: `Conversation History:\n${conversationHistory.slice(-6).map((c: any) => `${c.sender}: ${c.text}`).join('\n')}\n\nOwner just said: "${message}"` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        reply: responseText,
        emotion: "friendly",
        detectedLanguage: language,
        actionType: "general"
      };
    }

    res.json({
      reply: parsedData.reply || "Ji, main sun raha hoon!",
      emotion: parsedData.emotion || "friendly",
      detectedLanguage: parsedData.detectedLanguage || language,
      newMemoryToSave: parsedData.newMemoryToSave || null,
      actionType: parsedData.actionType || "general",
      isOwnerVerified: true,
      similarityScore: speakerSimilarity
    });

  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to process chat',
      fallbackReply: "Maaf kijiye, ek temporary connection issue aayi. Main offline mode mein bhi aapki madad kar sakta hoon!"
    });
  }
});

// Proxy endpoint for live weather & world time via Open-Meteo
app.get('/api/weather', async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat as string || '31.5204';
    const lon = req.query.lon as string || '74.3587';
    const city = req.query.city as string || 'Lahore';

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error(`Open-Meteo returned status ${weatherRes.status}`);
    }

    const data = await weatherRes.json();
    res.json({
      city,
      current: data.current,
      timezone: data.timezone,
      elevation: data.elevation
    });
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    res.json({
      city: req.query.city || 'Local',
      cached: true,
      current: {
        temperature_2m: 24.5,
        relative_humidity_2m: 48,
        apparent_temperature: 25,
        is_day: 1,
        precipitation: 0,
        weather_code: 0,
        wind_speed_10m: 12,
        time: new Date().toISOString()
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }
});

// City Geocoding endpoint
app.get('/api/geocode', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const data = await geoRes.json();
    res.json(data.results || []);
  } catch (error: any) {
    res.status(500).json({ error: 'Geocoding failed', results: [] });
  }
});

// Direct Android APK Download Endpoint
app.get('/download/SonicAI.apk', (_req: Request, res: Response) => {
  const apkPath = path.resolve(__dirname, 'public/download/SonicAI.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="SonicAI.apk"');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.sendFile(apkPath);
  } else {
    res.status(404).send('APK file not found');
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', assistant: 'Sonic AI', time: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`🚀 Sonic AI Server listening on http://localhost:${port}`);
  });
}

startServer();
