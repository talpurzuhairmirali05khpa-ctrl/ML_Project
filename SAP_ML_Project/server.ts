import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { SPECIES_DATABASE } from './src/data/speciesData.ts';
import { ANTIVENOM_DATABASE } from './src/data/antivenomDatabase.ts';
import { PAKISTAN_REFERRAL_CENTERS, REGIONAL_EPIDEMIOLOGY_STATS } from './src/data/regionalData.ts';
import { EVALUATION_METRICS, CONFUSION_MATRIX_8X8, TRIAGE_CONFUSION_MATRIX, REJECTION_CURVE } from './src/ml/benchmarkData.ts';
import { evaluateClinicalTriage } from './src/clinical/clinicalEngine.ts';
import { ExtractedFeatures } from './src/types/index.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

// Minimal in-memory rate limiter (per IP, 60 requests / minute) so the API and Gemini quota cannot be hammered
const hits = new Map<string, { count: number; resetAt: number }>();
app.use('/api', (req: Request, res: Response, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  entry.count++;
  if (entry.count > 60) {
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000).toString());
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  }
  next();
});

// Initialize Google GenAI client if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// ==========================================
// API Endpoints with Zod Input Validation
// ==========================================

// 1. Snake classifier: RETIRED server endpoint.
// The old 28-D hand-set prototype classifier was never trained and has been replaced by a trained CNN
// (public/models/snake_effb0.onnx) that runs in the browser. Returning an untrained prediction here would be misleading.
app.post('/api/classify', (_req: Request, res: Response) => {
  return res.status(410).json({
    error: 'This endpoint was retired. Species classification now runs client-side with the trained model (see /models/snake_effb0.onnx and src/ml/cnnClassifier.ts).'
  });
});

// 2. Clinical Triage Evaluation (Fixes Bug 8: safe defaults on missing labValues / symptoms)
const ClinicalTriageSchema = z.object({
  symptoms: z.object({
    twentyMinWBCTClotted: z.enum(['clotted', 'unclotted', 'pending']).default('pending'),
    systemicBleeding: z.boolean().default(false),
    localSwelling: z.enum(['none', 'mild_confined', 'moderate_limb', 'severe_cross_joint']).default('none'),
    blisteringNecrosis: z.boolean().default(false),
    bilateralPtosis: z.boolean().default(false),
    ophthalmoplegia: z.boolean().default(false),
    bulbarPalsy: z.boolean().default(false),
    respiratoryDistress: z.boolean().default(false),
    clinicalShock: z.boolean().default(false),
    oliguriaAnuria: z.boolean().default(false),
    inr: z.number().positive().max(20).optional(),
    plateletCount: z.number().min(0).max(2_000_000).optional(), // cells/µL
    creatinineMgDl: z.number().min(0).max(30).optional()
  }).optional().default({
    twentyMinWBCTClotted: 'pending',
    systemicBleeding: false,
    localSwelling: 'none',
    blisteringNecrosis: false,
    bilateralPtosis: false,
    ophthalmoplegia: false,
    bulbarPalsy: false,
    respiratoryDistress: false,
    clinicalShock: false,
    oliguriaAnuria: false
  }),
  profile: z.object({
    ageYears: z.number().min(0).max(120).default(30),
    weightKg: z.number().min(1).max(300).default(65),
    isPregnant: z.boolean().default(false),
    priorAntivenomReaction: z.boolean().default(false),
    timeSinceBiteHours: z.number().min(0).max(168).default(2),
    biteLocation: z.enum(['foot_ankle', 'hand_wrist', 'leg', 'arm', 'trunk_head']).default('foot_ankle'),
    circumstance: z.enum(['nocturnal_sleeping', 'daytime_agriculture', 'handling_clearing', 'other']).default('daytime_agriculture')
  }).optional().default({
    ageYears: 30,
    weightKg: 65,
    isPregnant: false,
    priorAntivenomReaction: false,
    timeSinceBiteHours: 2,
    biteLocation: 'foot_ankle',
    circumstance: 'daytime_agriculture'
  })
});

app.post('/api/clinical-triage', (req: Request, res: Response) => {
  try {
    const parseResult = ClinicalTriageSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid clinical triage payload",
        details: parseResult.error.format()
      });
    }

    const { symptoms, profile } = parseResult.data;
    const triageResult = evaluateClinicalTriage(symptoms, profile);
    return res.json(triageResult);
  } catch (error: any) {
    console.error("Error in /api/clinical-triage:", error);
    return res.status(500).json({ error: "Clinical triage calculation failure" });
  }
});

// 3. Antivenom Database Listing
app.get('/api/antivenoms', (_req: Request, res: Response) => {
  return res.json({
    antivenoms: ANTIVENOM_DATABASE,
    primaryManufacturer: "National Institutes of Health (NIH), Islamabad",
    coldChainStandards: "Strict 2°C - 8°C for liquid vials; < 25°C for lyophilized vials."
  });
});

// 4. Species Database Listing
app.get('/api/species', (_req: Request, res: Response) => {
  return res.json({ species: SPECIES_DATABASE });
});

// 5. Regional Epidemiology & Hospitals
app.get('/api/regional', (_req: Request, res: Response) => {
  return res.json({
    hospitals: PAKISTAN_REFERRAL_CENTERS,
    epidemiology: REGIONAL_EPIDEMIOLOGY_STATS
  });
});

// 6. Benchmark Metrics & Confusion Matrices
app.get('/api/benchmark', (_req: Request, res: Response) => {
  return res.json({
    metrics: EVALUATION_METRICS,
    speciesConfusionMatrix: CONFUSION_MATRIX_8X8,
    triageConfusionMatrix: TRIAGE_CONFUSION_MATRIX,
    rejectionCurve: REJECTION_CURVE
  });
});

// 7. Safe Server-Side Gemini Consult (Fixes Bug 14: Prompt injection guard, model name, disclaimers)
const GeminiConsultSchema = z.object({
  query: z.string().min(3).max(1000).transform(str => str.replace(/[\r\n\t]+/g, ' ').trim()),
  context: z.object({
    speciesId: z.string().regex(/^[a-z-]{1,64}$/).optional(),
    syndromeCategory: z.enum(['Neurotoxic', 'Hemotoxic', 'Severe Systemic', 'Severe Local', 'Observation']).optional(),
    timeSinceBiteHours: z.number().min(0).max(168).optional()
  }).optional()
});

app.post('/api/gemini-consult', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: "AI Assistant is not configured on this server (GEMINI_API_KEY secret not provided).",
        guidance: "Please reference the certified National Clinical Guidelines (NIH Islamabad, 2021) in the Antivenom and Bedside Triage tabs."
      });
    }

    const parseResult = GeminiConsultSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid query payload", details: parseResult.error.format() });
    }

    const { query, context } = parseResult.data;

    // Strict prompt construction preventing prompt injection and enforcing clinical safety
    const systemInstruction = 
      "You are a specialized toxicology literature and clinical guideline reference assistant for snakebite management in Pakistan and South Asia. " +
      "IMPORTANT CLINICAL SAFETY BOUNDARIES: " +
      "1. You are NOT an authoritative prescribing physician. You MUST NOT autonomously prescribe specific drug dosages beyond citing established national guidelines (NIH Islamabad & WHO SEARO 2016). " +
      "2. The primary indication for antivenom in Pakistan is objective systemic envenoming: 20-minute whole blood clotting test (20WBCT) unclotted, spontaneous hemorrhage, bilateral ptosis, respiratory distress, shock, or acute kidney injury. " +
      "3. Always emphasize that imaging never replaces clinical examination. " +
      "4. Always mention the preparation of 0.5 mg IM Adrenaline (1:1000) at bedside for anaphylaxis management.";

    const promptText = 
      `Clinical Context: ${context ? JSON.stringify(context) : 'General query'}\n` +
      `User Question: ${query}\n\n` +
      `Provide an evidence-based clinical answer grounded in Pakistan NIH and WHO guidelines. Keep answer concise, structured, and clinically actionable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const reply = response.text || "No response generated.";

    return res.json({
      reply,
      clinicalNotice: "ADVISORY ONLY: This AI synthesis provides literature references and does not replace the immediate bedside judgment of an attending physician. For active emergencies, initiate protocol and contact the National Poison Control Centre (+92-21-99215740)."
    });
  } catch (error: any) {
    console.error("Error in /api/gemini-consult:", error);
    return res.status(500).json({ error: "Failed to query literature assistant" });
  }
});

// JSON error handler: malformed JSON / oversize bodies return clean JSON, never an HTML stack trace with file paths
app.use('/api', (err: any, _req: Request, res: Response, _next: any) => {
  const status = err?.status === 413 ? 413 : 400;
  res.status(status).json({ error: status === 413 ? 'Payload too large' : 'Malformed JSON request body' });
});

// ==========================================
// Vite Dev Middlewares / Production Static
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Snake Antivenom Predictor full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
