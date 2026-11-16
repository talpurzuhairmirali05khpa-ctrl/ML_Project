 # Snake Antivenom Predictor

An educational **decision-support prototype** for snakebite management in Pakistan. It combines a trained image classifier (snake species identification), a bedside clinical triage engine (20WBCT-based), an antivenom catalog, a regional epidemiology dashboard, and a transparent model-evaluation page.

> ⚠️ **Not a medical device.** Antivenom decisions must always follow bedside clinical examination, the 20-minute whole-blood clotting test (20WBCT) and the national protocol (NIH Islamabad / WHO SEARO). Dose figures in this project must be verified against the official protocol before any real use.

---

## Features

| Module | What it does |
|---|---|
| **Species Classifier** | Upload a snake photo → EfficientNet-B0 CNN predicts one of 13 South Asian species, with calibrated probabilities. Runs **entirely in the browser** (ONNX + onnxruntime-web), so no image is uploaded to a server. |
| **Safety / Abstention policy** | Refuses to answer when unsure, rejects photos that don't look like snakes, and refuses a "harmless" label if venomous species hold more than 5% probability. |
| **Clinical Assessment** | Bedside triage from symptoms, 20WBCT, labs (INR, platelets, creatinine) and patient profile. Gives graded urgency, actions and monitoring. Weight-based doses for children (adrenaline, carrier fluid, atropine/neostigmine). |
| **Antivenom Catalog** | Antivenom products, cold-chain information and species coverage. |
| **Regional Dashboard** | Epidemiology statistics and referral centres in Pakistan. |
| **Model Evaluation** | Real held-out test results: confusion matrix, per-class precision/recall, triage matrix, rejection curve. |
| **Gemini literature assistant (optional)** | Server-side Gemini consult with strict clinical safety prompt. Works only if `GEMINI_API_KEY` is set. |
| **Languages** | English

---

## Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS 4, Motion, lucide-react
- **Backend:** Express (TypeScript, run with `tsx`), Zod validation, simple in-memory rate limiter (60 req/min per IP)
- **ML inference:** `onnxruntime-web` (WASM), model file `public/models/snake_effb0.onnx` (~21 MB)
- **ML training (offline):** Python — PyTorch/timm (EfficientNet-B0 features), scikit-learn (logistic regression head, calibration)
- **Testing:** `tsx` test scripts (unit, regression, CNN parity)

---

## Getting Started

**Requirements:** Node.js 20+ (tested on Node 22) and npm.

```bash
# 1. Install dependencies (.npmrc already sets legacy-peer-deps)
npm install

# 2. (Optional) enable the Gemini assistant
cp .env.example .env
# then edit .env and set GEMINI_API_KEY="your-key"

# 3. Run in development
npm run dev            # http://localhost:3000

# 4. Or build and run in production mode
npm run build
npm start
```

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Express + Vite dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm start` | Serve the production build |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm test` | Runs system, regression and CNN tests |
| `npm run qa:photos` | Runs the model on the bundled photos (independent of training data) |

**Current status:** type check passes; **25/25 system tests, 19/19 regression tests, 10/10 CNN tests pass.**

---

## The Model — What Is Real and What Is Not

### Training setup
- **Backbone:** EfficientNet-B0 (ImageNet-pretrained, frozen) used as a feature extractor.
- **Head:** multinomial logistic regression on the embeddings, with flip test-time augmentation and temperature scaling. Scaling, head, TTA and temperature are all baked into the ONNX graph.
- **Dataset:** [arjun921/Indian-Snakes-Dataset](https://github.com/arjun921/Indian-Snakes-Dataset) — 1,780 web-scraped photos of 13 species (1,424 train / 356 test). Images were scraped from Google and may be subject to copyright; the repository is MIT-licensed.
- **Split:** 20% held out as a test set, grouped by near-duplicate so duplicates never straddle train/test.
- **Input:** 224×224 RGB, center-cropped.

### Species covered (13)
| Triage class | Species |
|---|---|
| Viper (haemotoxic) | *Daboia russelii*, *Echis carinatus* |
| Elapid (neurotoxic) | *Bungarus caeruleus*, *Naja naja*, *Naja kaouthia*, *Ophiophagus hannah* |
| Harmless | *Ahaetulla nasuta*, *Argyrogena fasciolata*, *Coelognathus helena*, *Fowlea piscator*, *Gongylophis conicus*, *Ptyas mucosa*, *Python molurus* |

### Held-out test results (356 photos)
| Metric | Value |
|---|---|
| Species accuracy | **80.1%** |
| Macro-F1 | **0.80** |
| 3-class triage accuracy (viper / elapid / harmless) | **91.6%** |
| Coverage (photos the model agrees to answer) | 85.4% |
| Accuracy on accepted photos | 81.6% |
| Venomous photos accepted as harmless | **2 of 230** |
| Non-snake photos rejected | via ImageNet "snake-mass" gate (threshold ≈ 0.115) |

### Safety policy
1. **Abstain** if the calibrated top probability is below 0.20.
2. **Reject non-snake photos** (e.g. coffee cup, horse, grass) using the ImageNet snake-class probability mass.
3. **Refuse "harmless"** if venomous species together hold more than 5% probability.

### Known limitations
- Training photos are web images, **not field or clinical photos** — real-world accuracy will be lower.
- Only **13 species** are in the model. *Eryx johnii*, *Platyceps ventromaculatus* and *Telescopus rhinopoma* exist in the database but **not** in the classifier.
- Common confusions: *Naja naja* vs *Naja kaouthia*, and rat snake (*Ptyas mucosa*) vs cobra.
- Some species (e.g. *Naja kaouthia*, *Ophiophagus hannah*) are not native to Pakistan.
- A small residual risk remains that a venomous snake is accepted as harmless (2/230 on the test set; 1 case on the bundled photo set). **The model must never replace clinical judgement.**
- Species text for the 8 additional species (`src/data/speciesDataExtra.ts`) and the Sindhi translations are **drafts** and need review by a clinician / native speaker.
- `src/ml/classicalModels.ts` and `featureExtractor.ts` are the **old untrained prototype classifier**. They remain only for the explanatory "28 descriptors" panel and legacy tests.

---

## Project Structure

```
├── server.ts                  # Express API + Vite middleware / static hosting
├── index.html, vite.config.ts, tsconfig.json
├── public/
│   ├── models/snake_effb0.onnx   # trained model (runs in browser)
│   └── snakes/                   # species reference photos
├── src/
│   ├── App.tsx, main.tsx, index.css
│   ├── components/               # Navbar, EmergencyBanner, Classifier, Clinical, Catalog, Regional, Evaluation, Footer
│   ├── clinical/clinicalEngine.ts   # bedside triage + dosing logic
│   ├── ml/
│   │   ├── cnnClassifier.ts      # ONNX inference, softmax, abstention policy
│   │   ├── snakeModel.json       # model metadata (classes, tau, thresholds)
│   │   ├── trainedEval.json      # real held-out test metrics
│   │   └── classicalModels.ts, featureExtractor.ts, benchmarkData.ts  # legacy / display
│   ├── data/                     # species, antivenom, regional data
│   ├── i18n/translations.ts      # English
│   └── types/index.ts
├── tests/                        # system, regression, cnn, real-photos + fixtures
└── tools/
    ├── extract-features.ts
    └── train/                    # Python training pipeline (see below)
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/clinical-triage` | Clinical triage from symptoms + patient profile (Zod-validated, safe defaults) |
| `GET` | `/api/antivenoms` | Antivenom database, manufacturer and cold-chain info |
| `GET` | `/api/species` | Species database |
| `GET` | `/api/regional` | Referral centres and regional epidemiology |
| `GET` | `/api/benchmark` | Evaluation metrics and confusion matrices |
| `POST` | `/api/gemini-consult` | Optional Gemini literature assistant (503 if no API key) |
| `POST` | `/api/classify` | **Retired** (returns 410). Classification now runs client-side. |

All `/api` routes are rate-limited and return clean JSON errors for malformed or oversized bodies.

### Example

```bash
curl -X POST http://localhost:3000/api/clinical-triage \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": { "twentyMinWBCTClotted": "unclotted", "systemicBleeding": true },
    "profile":  { "ageYears": 30, "weightKg": 65, "timeSinceBiteHours": 3 }
  }'
```

---

## Retraining the Model

The scripts in `tools/train/` reproduce the pipeline. They expect the dataset images and the EfficientNet-B0 weights (`weights/effb0.pth`) to be provided locally — these are **not** included in the repository.

Rough order of execution:

1. `prep.py`, `prep224.py` — prepare images, de-duplicate/group, build 224×224 arrays and `manifest.json`
2. `embed_eb0.py` — extract EfficientNet-B0 embeddings (original + flipped)
3. `baseline.py` — compare classical classifiers on the grouped split
4. `snakeness.py` — calibrate the "is this a snake?" gate using negative images
5. `build.py` — fit the logistic head, tune temperature and abstention thresholds on out-of-fold predictions, evaluate once on the test set, export the ONNX model and `snakeModel.json` / `trainedEval.json`

**Python packages:** `torch`, `timm`, `numpy`, `scipy`, `scikit-learn`, `scikit-image`, `Pillow`, `onnx`.

---

## Testing

```bash
npm test
```

- **System tests (25):** API behaviour, validation, data integrity, clinical engine.
- **Regression tests (19):** previously found bugs — unit handling for platelets/INR/creatinine, paediatric dosing, "not-safe" labelling for early or nocturnal bites, graded triage, out-of-range inputs.
- **CNN tests (10):** ONNX model loads; TypeScript output matches the Python reference (max difference < 0.005); non-snake rejection; abstention on uniform images; reported benchmark consistency.

---

## Credits

- **Zuhair Ali** — ML architect , backend,   UI/UX & frontend
  

---

## Disclaimer

This software is for **education and research only**. It is not a diagnostic tool, does not provide medical advice, and must not be used to decide treatment. In a snakebite emergency, go to the nearest hospital immediately and follow the national clinical protocol. Poison Control (Karachi): +92-21-99215740.

## License & Data Notice

Add your project license here. The training images come from a third-party web-scraped dataset (arjun921/Indian-Snakes-Dataset) and may be subject to copyright — check terms before redistributing the dataset or any derived data.


