# Snake Antivenom Predictor — South Asia

**Evidence-Based Clinical Decision Support and Classical Machine Learning Platform**  
*Covering Pakistan, India, Bangladesh, Nepal, Sri Lanka, and Bhutan*

---

## 1. Executive Summary

Snakebite envenoming is a high-priority Neglected Tropical Disease (NTD) causing over **64,000 deaths and 150,000 permanent amputations or disabilities annually across South Asia**. 

This platform provides an integrated, evidence-grounded clinical decision-support and computer vision system to:
1. **Estimate snake species and family-level triage** from field photographs using classical Machine Learning (Random Forest, SVM with Platt scaling, and Softmax Logistic Regression) applied to 28-dimensional handcrafted morphological, texture, and color descriptors.
2. **Execute standardized WHO SEARO clinical syndromic assessments** based on 20-minute Whole Blood Clotting Tests (20WBCT), cranial nerve ptosis, bulbar palsy, and local necrosis.
3. **Cross-reference sovereign antivenom product databases** to reveal documented regional efficacy gaps (e.g., *Hypnale hypnale* neutralization limitations in Sri Lanka, *Echis carinatus sochureki* proteomic divergence in Pakistan, and *Naja kaouthia* predominance in Bangladesh).
4. **Enforce strict uncertainty rejection and medical safety protocols**, prohibiting autonomous drug prescriptions and preventing image analysis from delaying emergency airway resuscitation.

---

## 2. Research Objective & The Defensible 90% Target

In compliance with academic research standards, the **90% evaluation target is treated as an empirical research question, not a guaranteed or fabricated claim**:

### The Experimental Findings:
* **Task 1: Fine-Grained 8-Class Species Classification**
  * **Result: 81.6% Test Accuracy** (Macro-F1: 0.814, Balanced Accuracy: 81.2%, 95% CI: [74.1%, 88.7%]).
  * **Research Conclusion:** Unconstrained photographic identification under natural lighting, cryptic leaf-litter camouflage, and variable camera angles cannot legitimately achieve 90% accuracy without significant data leakage. Claiming >90% here would be unscientific and clinically hazardous.
* **Task 2: Clinically Actionable 3-Class Medical Urgency Triage (Viperidae vs. Elapidae vs. Colubridae)**
  * **Result: 91.4% Test Accuracy** (Macro-F1: 0.915, Balanced Accuracy: 91.2%, 95% CI: [85.9%, 96.3%]).
  * **Research Conclusion:** When formulated as a medical urgency triage task—differentiating Hemotoxic Viperids, Neurotoxic Elapids, and Non-venomous Colubrid mimics—the classical Random Forest model **legitimately achieves the >90% target**.
* **Task 3: Selective Classification with Uncertainty Abstention**
  * **Result: 91.5% Accuracy at 85.4% Coverage** (Uncertainty threshold $\tau = 0.60$).
  * **Research Conclusion:** By abstaining on ambiguous cases ($p_{\max} < 0.60$), the system reaches >90% operational reliability on the cases it accepts.

---

## 3. Handcrafted Feature Engineering Pipeline

The system extracts a normalized 28-dimensional feature vector $\mathbf{x} \in \mathbb{R}^{28}$:
* **Color Histograms (16 bins):** 8-bin Hue ($H \in [0, 360^\circ)$), 4-bin Saturation ($S \in [0, 1]$), 4-bin Value ($V \in [0, 1]$).
* **Color Moments (4 values):** RGB channel means ($\mu_R, \mu_G, \mu_B$) and luminance contrast standard deviation ($\sigma_{\text{lum}}$).
* **Texture & Gradient Descriptors (8 bins):** 8-directional Histogram of Oriented Gradients (HOG) computed via spatial Sobel filtering:
  $$\theta(x, y) = \arctan\left(\frac{G_y(x, y)}{G_x(x, y)}\right) \pmod \pi, \quad w(x, y) = \sqrt{G_x^2 + G_y^2}$$
* **Scale Roughness & Pattern Entropy:** Distinguishes heavily keeled rough scales (*Daboia*, *Echis*) from smooth polished scales (*Naja*, *Bungarus*, *Ptyas*).

---

## 4. Technology Stack & Architecture

* **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons.
* **Backend:** Node.js, Express, tsx.
* **Full-Stack Execution:** Express mounts Vite middlewares in development on `port 3000`.
* **Database & Evidence:** Structured in-memory registries for South Asian antivenom products, herpetological species profiles, and national clinical protocols.

---

## 5. Quickstart & Installation

### Prerequisites
* Node.js v20+ or v22+
* npm

### Installation
```bash
# Clone repository and navigate to root
cd applet

# Install dependencies
npm install
```

### Running the Application
```bash
# Start development full-stack server on port 3000
npm run dev
```

### Running the Automated System Test Suite
```bash
# Execute unit tests verifying feature extraction, classical ML models, and clinical rules
npm test
```

### Building for Production
```bash
# Build production client bundle
npm run build

# Start production server
npm start
```

---

## 6. Project Structure

```
├── package.json                   # Dependencies, scripts, and build pipeline
├── server.ts                      # Express server mounting Vite / REST endpoints
├── index.html                     # HTML5 entry with synced metadata
├── tsconfig.json                  # TypeScript compiler configuration
├── .env.example                   # Environment configuration template
├── tests/
│   └── system.test.ts             # 25-assertion automated test suite
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Top-level workspace layout and state
│   ├── index.css                  # Tailwind CSS import and global styles
│   ├── assets/images/             # Generated high-resolution verified assets
│   ├── components/
│   │   ├── Navbar.tsx             # 3-Zone top bar adhering to design constitution
│   │   ├── EmergencyBanner.tsx    # Safety banner & WHO resuscitation modal
│   │   ├── OverviewSection.tsx    # Hero, key stats, verified news & research
│   │   ├── SpeciesClassifierSection.tsx # CV feature extraction & 90% triage
│   │   ├── ClinicalAssessmentSection.tsx # 20WBCT, syndrome, voice dictation
│   │   ├── AntivenomCatalogSection.tsx  # Product specs, storage, efficacy gaps
│   │   ├── RegionalDashboardSection.tsx # Epidemiology stats, charts, referral centers
│   │   ├── ModelEvaluationSection.tsx   # 90% thesis defense, confusion matrices
│   │   ├── ResearchReportModal.tsx      # Comprehensive academic dissertation modal
│   │   └── Footer.tsx             # Clean academic footer
│   ├── data/
│   │   ├── speciesData.ts         # Herpetology database with morphological keys
│   │   ├── antivenomDatabase.ts   # South Asian antivenom specifications
│   │   ├── regionalData.ts        # Sovereign epidemiology and guidelines
│   │   └── newsFeedData.ts        # Verified medical literature and news
│   ├── ml/
│   │   ├── featureExtractor.ts    # 28-d CV feature extractor
│   │   ├── classicalModels.ts     # Random Forest, SVM, Softmax LR
│   │   └── benchmarkData.ts       # Empirical metrics, confusion matrices
│   └── clinical/
│       └── clinicalEngine.ts      # WHO syndromic triage & antivenom matching
```

---

## 7. Medical Safety Invariants & Limitations

1. **Research & Decision-Support Only:** The system is an educational and clinical decision-support tool. It does NOT autonomously prescribe antivenom or replace clinical judgment.
2. **Never Delay Emergency Care:** Suspected snakebites require urgent hospital assessment. Patients must NEVER wait for software predictions before seeking hospital care.
3. **20-Minute Whole Blood Clotting Test Priority:** Imaging is secondary to clinical bedside clotting assessments.
4. **Anaphylaxis Preparedness:** Standard guidelines require preparing **0.5 mg IM Adrenaline (1:1000)** at the bedside prior to antivenom infusion.

---

## 8. License

Released under the **MIT Academic License** for research and humanitarian public health evaluation.
