import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, ShieldAlert, Cpu, ArrowRight, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { SnakeSpecies, ExtractedFeatures, ClassificationResult, Language } from '../types';
import { SPECIES_DATABASE } from '../data/speciesData';
import { extractFeaturesFromImageData } from '../ml/featureExtractor';
import { classifyRgba224, abstainResult, MODEL_INPUT } from '../ml/cnnClassifier';
import '../ml/browserRuntime';

interface SpeciesClassifierSectionProps {
  lang?: Language;
  onTransferToClinical: (species: SnakeSpecies | null) => void;
}

export const SpeciesClassifierSection: React.FC<SpeciesClassifierSectionProps> = ({
  onTransferToClinical
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentImageSrc, setCurrentImageSrc] = useState<string>(
    SPECIES_DATABASE[0].sampleImageUrl || ''
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>('daboia-russelii');
  const [filterFamily, setFilterFamily] = useState<'ALL' | 'Viperidae' | 'Elapidae' | 'Colubridae' | 'Boidae' | 'Pythonidae'>('ALL');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedFeatures, setExtractedFeatures] = useState<ExtractedFeatures | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  // Helper to construct fallback prototype features
  const buildFeaturesFromSpecies = (sp: SnakeSpecies): ExtractedFeatures => {
    const vec = sp.prototypeVector ?? new Array(28).fill(0);
    return {
      vector: vec,
      colorHistH: vec.slice(0, 8),
      colorHistS: vec.slice(8, 12),
      colorHistV: vec.slice(12, 16),
      colorMoments: {
        meanR: vec[16],
        meanG: vec[17],
        meanB: vec[18],
        stdLum: vec[19]
      },
      hogTexture: vec.slice(20, 26),
      patternEntropy: vec[26],
      scaleRoughness: vec[27],
      isSnake: true,
      oodScore: 0
    };
  };

  // Honest failure state: abstain, with the reason, instead of a made-up classification
  const showProcessingFailure = (reason: string) => {
    const empty = buildFeaturesFromSpecies(SPECIES_DATABASE[0]);
    const failed = { ...empty, isSnake: false, oodScore: 1, rejectionReason: reason };
    setExtractedFeatures(failed);
    setResult(abstainResult(reason, failed));
    setIsProcessing(false);
  };

  // Process image on canvas when image src changes
  const processImage = (src: string, targetSpecies?: SnakeSpecies) => {
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        canvas.width = 200;
        canvas.height = 200;
        // Center-crop to a square (cover) instead of squashing: snakes are long, distortion corrupts texture features
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - side) / 2;
        const sy = (img.naturalHeight - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, 200, 200);

        const imgData = ctx.getImageData(0, 0, 200, 200);
        const feats = extractFeaturesFromImageData(imgData);   // interpretable descriptors (display only)
        setExtractedFeatures(feats);

        // Model input: center-cropped square drawn straight from the original image at 224x224
        const c224 = document.createElement('canvas');
        c224.width = MODEL_INPUT; c224.height = MODEL_INPUT;
        const ctx224 = c224.getContext('2d');
        if (!ctx224) throw new Error('Canvas context unavailable');
        ctx224.drawImage(img, sx, sy, side, side, 0, 0, MODEL_INPUT, MODEL_INPUT);
        const rgba = ctx224.getImageData(0, 0, MODEL_INPUT, MODEL_INPUT).data;
        classifyRgba224(rgba, feats)
          .then(classification => { setResult(classification); setIsProcessing(false); })
          .catch(() => showProcessingFailure('The trained model could not be loaded or run (check that /models and /ort files are served). No prediction was made.'));
      } catch (err) {
        // Never fabricate a prediction from a preset prototype when the real image could not be processed
        showProcessingFailure('The image could not be processed (canvas/CORS error). No prediction was made.');
      }
    };

    img.onerror = () => {
      showProcessingFailure('The image file could not be loaded or is not a valid image. No prediction was made.');
    };

    img.src = src;
  };

  // Run on initial mount
  useEffect(() => {
    processImage(currentImageSrc, SPECIES_DATABASE[0]);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showProcessingFailure('Unsupported file type. Please upload an image (JPG/PNG/WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showProcessingFailure('Image is larger than 10 MB. Please upload a smaller photo.');
      return;
    }

    setSelectedPresetId('custom');
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setCurrentImageSrc(src);
      processImage(src);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (species: SnakeSpecies) => {
    setSelectedPresetId(species.id);
    if (species.sampleImageUrl) {
      setCurrentImageSrc(species.sampleImageUrl);
      processImage(species.sampleImageUrl, species);
    }
  };

  // Test Synthetic OOD Patterns
  const handleTestOod = (type: 'solid' | 'checkerboard') => {
    setSelectedPresetId(`ood-${type}`);
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'solid') {
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(0, 0, 200, 200);
    } else {
      for (let y = 0; y < 200; y += 20) {
        for (let x = 0; x < 200; x += 20) {
          ctx.fillStyle = (Math.floor(x / 20) + Math.floor(y / 20)) % 2 === 0 ? '#ffffff' : '#000000';
          ctx.fillRect(x, y, 20, 20);
        }
      }
    }

    const dataUrl = canvas.toDataURL();
    setCurrentImageSrc(dataUrl);
    const imgData = ctx.getImageData(0, 0, 200, 200);
    const feats = extractFeaturesFromImageData(imgData);
    setExtractedFeatures(feats);
    const c224 = document.createElement('canvas');
    c224.width = MODEL_INPUT; c224.height = MODEL_INPUT;
    const ctx224 = c224.getContext('2d');
    if (!ctx224) return;
    ctx224.drawImage(canvas, 0, 0, MODEL_INPUT, MODEL_INPUT);
    classifyRgba224(ctx224.getImageData(0, 0, MODEL_INPUT, MODEL_INPUT).data, feats)
      .then(setResult)
      .catch(() => showProcessingFailure('The trained model could not be loaded or run. No prediction was made.'));
  };

  const filteredSpecies = filterFamily === 'ALL'
    ? SPECIES_DATABASE
    : SPECIES_DATABASE.filter(s => s.family === filterFamily);

  return (
    <div className="space-y-6">
      
      {/* Clinical CV Header - Bright & High Contrast for Projectors */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                EfficientNet-B0 Transfer-Learning CNN
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                Trained on 13 species (real photos)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                100% Client-Side Private
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Snake Species Computer Vision Classifier
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Custom Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Boundary Invariant Notice */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>All photographic analysis runs 100% locally on your device (Client-Side Privacy Guarantee).</span>
          </div>
          <div className="text-red-700 font-bold flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Invariant: Visual prediction NEVER overrides bedside clinical signs & 20WBCT.</span>
          </div>
        </div>
      </div>

      {/* Verified Species Gallery & Presets */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span>Verified Pakistan & South Asian Snake Species ({SPECIES_DATABASE.length})</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Click any specimen to load its high-resolution photo and live 28-D feature extraction:
            </p>
          </div>

          {/* Family Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(['ALL', 'Viperidae', 'Elapidae', 'Colubridae', 'Boidae', 'Pythonidae'] as const).map(fam => (
              <button
                key={fam}
                onClick={() => setFilterFamily(fam)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterFamily === fam
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>
        </div>

        {/* Snake Specimen Cards Grid - Bright & Clean */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {filteredSpecies.map(sp => {
            const isSelected = selectedPresetId === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => handleSelectPreset(sp)}
                className={`group text-left rounded-xl border p-2.5 transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs'
                }`}
              >
                <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-100 mb-2 border border-slate-200">
                  {sp.sampleImageUrl ? (
                    <img
                      src={sp.sampleImageUrl}
                      alt={sp.commonName.en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500 text-center px-2">
                      No sample photo bundled (upload your own image)
                    </div>
                  )}
                  <span className={`absolute top-1.5 right-1.5 text-[10px] font-black px-2 py-0.5 rounded shadow ${
                    sp.isVenomous
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-700 text-white'
                  }`}>
                    {sp.isVenomous ? 'Venomous' : 'Harmless'}
                  </span>
                </div>

                <div>
                  <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {sp.commonName.en}
                  </div>
                  <div className="text-[11px] text-slate-500 italic truncate font-serif">
                    {sp.scientificName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-100 font-semibold">
                    <span>{sp.family}</span>
                    <span className={sp.isVenomous ? 'text-red-700' : 'text-emerald-700'}>
                      {sp.venomCategory}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Synthetic OOD Abstention Benchmarks */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-700 font-bold">
            Out-of-Distribution (OOD) Safety Tests:
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestOod('solid')}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                selectedPresetId === 'ood-solid'
                  ? 'bg-red-600 text-white border-red-700 shadow-xs'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Test Solid Color (Reject)
            </button>
            <button
              onClick={() => handleTestOod('checkerboard')}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                selectedPresetId === 'ood-checkerboard'
                  ? 'bg-red-600 text-white border-red-700 shadow-xs'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Test Checkerboard Grid (Reject)
            </button>
          </div>
        </div>
      </div>

      {/* Analysis View: Specimen Viewport + Live Descriptors + Prediction Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Specimen Viewport + 28-D Descriptors (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Specimen Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider">
                Current Specimen Viewport
              </span>
              <span className="text-slate-500 font-mono font-bold">
                200 × 200 Matrix
              </span>
            </div>

            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-300">
              <img
                src={currentImageSrc}
                alt="Selected snake specimen"
                className="w-full h-full object-cover object-center"
              />
              <canvas ref={canvasRef} className="hidden" />

              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center text-slate-900">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                  <span className="text-xs font-mono font-bold">Extracting 28-D Descriptors...</span>
                </div>
              )}
            </div>
          </div>

          {/* Morphological Biological Extraction Inspection Card */}
          {extractedFeatures && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>28-Dimensional Extracted Descriptors</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Calibrated Pipeline
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Pattern Entropy */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-bold">Pattern Entropy (Texture Variegation):</span>
                    <span className="font-mono text-emerald-700 font-extrabold">
                      {extractedFeatures.patternEntropy.toFixed(3)} / 1.000
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, extractedFeatures.patternEntropy * 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    {extractedFeatures.patternEntropy > 0.65 ? 'High (Mottled spots/chains, e.g. Russell\'s Viper)' : 'Low (Uniform/banded pattern)'}
                  </div>
                </div>

                {/* Scale Roughness */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-bold">Scale Roughness (Keeled vs Smooth Scales):</span>
                    <span className="font-mono text-amber-700 font-extrabold">
                      {extractedFeatures.scaleRoughness.toFixed(3)} / 1.000
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, extractedFeatures.scaleRoughness * 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    {extractedFeatures.scaleRoughness > 0.65 ? 'Heavily keeled & serrated (Viperidae)' : 'Smooth & polished (Elapidae / Colubridae)'}
                  </div>
                </div>

                {/* Color Moments */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 font-mono text-[11px] text-center">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="text-red-700 font-bold">Mean R</div>
                    <div className="text-slate-900 font-black mt-0.5">{extractedFeatures.colorMoments.meanR.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="text-green-700 font-bold">Mean G</div>
                    <div className="text-slate-900 font-black mt-0.5">{extractedFeatures.colorMoments.meanG.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="text-blue-700 font-bold">Mean B</div>
                    <div className="text-slate-900 font-black mt-0.5">{extractedFeatures.colorMoments.meanB.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="text-amber-800 font-bold">Std Lum</div>
                    <div className="text-slate-900 font-black mt-0.5">{extractedFeatures.colorMoments.stdLum.toFixed(2)}</div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right Column: Prediction Outcomes & Clinical Invariant (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {result && (
            <>
              {/* Main Classification Card - High Contrast Light Theme */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-xs">
                
                {/* Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    {result.isAbstained ? (
                      <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>Selective Abstention / Uncertain Pattern</span>
                      </span>
                    ) : result.topSpecies.isVenomous ? (
                      <span className="px-3.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-700" />
                        <span>Medically Significant Venomous Species</span>
                      </span>
                    ) : (
                      <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-700" />
                        <span>Non-Venomous / Harmless Species</span>
                      </span>
                    )}

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      Family: {result.topSpecies.family}
                    </span>
                  </div>

                  {!result.isAbstained && (
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-bold">Calibrated Posterior:</div>
                      <div className="text-3xl font-mono font-black text-slate-900">
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Species Title */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {result.isAbstained ? result.predictedClass : result.topSpecies.scientificName}
                  </h3>
                  <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {result.topSpecies.commonName.en}
                  </div>
                </div>

                {/* Description & Key Anatomical Features */}
                {!result.isAbstained ? (
                  <div className="mt-4 space-y-3.5">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {result.topSpecies.description.en}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-slate-500 text-[10px] uppercase font-bold">Scales</div>
                        <div className="text-slate-900 mt-0.5 text-xs font-bold">{result.topSpecies.keyFeatures.scales}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-slate-500 text-[10px] uppercase font-bold">Head Shape</div>
                        <div className="text-slate-900 mt-0.5 text-xs font-bold">{result.topSpecies.keyFeatures.head}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-slate-500 text-[10px] uppercase font-bold">Pupil</div>
                        <div className="text-slate-900 mt-0.5 text-xs font-bold">{result.topSpecies.keyFeatures.pupil}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-slate-500 text-[10px] uppercase font-bold">Venom</div>
                        <div className="text-slate-900 mt-0.5 text-xs font-bold">{result.topSpecies.venomCategory}</div>
                      </div>
                    </div>

                    {/* Regional Pakistan Hotspots */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 font-medium">
                      <span className="text-slate-700">
                        Distribution: <strong className="text-slate-900">{result.topSpecies.pakistanDistribution.provinces.join(', ')}</strong> ({result.topSpecies.pakistanDistribution.districts.slice(0, 4).join(', ')})
                      </span>
                      <span className="text-amber-800 font-mono text-xs font-bold">
                        Peak Season: {result.topSpecies.pakistanDistribution.riskSeason}
                      </span>
                    </div>

                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
                    <div className="font-bold text-amber-950 mb-1 text-sm">Model Selective Abstention Active:</div>
                    <p className="font-medium">{result.abstentionReason}</p>
                    <p className="mt-2 text-slate-700">
                      In accordance with clinical safety invariants, photographic ambiguity triggers automatic refusal rather than reckless guessing. Patient triage proceeds entirely upon bedside physical examination.
                    </p>
                  </div>
                )}

                {/* Transfer to Bedside Triage CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-medium">
                    Suspected Species: <span className="text-slate-900 font-bold">{result.isAbstained ? 'None (photo not classified reliably)' : result.topSpecies.scientificName}</span>
                  </div>

                  <button
                    onClick={() => onTransferToClinical(result.isAbstained ? null : result.topSpecies)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Proceed to Bedside Syndromic Triage</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Full Posterior Probabilities Distribution (hidden when nothing was actually predicted) */}
              <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs ${result.probabilities.length === 0 ? 'hidden' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Full Calibrated Distribution (Top Matches)
                  </span>
                  <span className="text-xs text-slate-600 font-mono font-bold">
                    Top Margin: {((result.probabilities[0]?.probability - (result.probabilities[1]?.probability || 0)) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-3">
                  {result.probabilities.slice(0, 4).map((p, idx) => (
                    <div key={p.speciesId} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={idx === 0 ? 'text-emerald-800 font-black' : 'text-slate-600 font-medium'}>
                          {idx + 1}. {p.name}
                        </span>
                        <span className="text-slate-900 font-black">
                          {(p.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            idx === 0 ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${p.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Negotiable Medical Safety Invariant */}
              <div className="bg-red-50 border border-red-300 rounded-2xl p-4 text-xs shadow-xs">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-red-900 text-sm">
                      Medical Decision-Support Safety Invariant:
                    </h4>
                    <p className="text-slate-700 mt-1 leading-relaxed font-medium">
                      {result.clinicalSafetyDisclaimer}
                    </p>
                    <div className="mt-2 text-xs text-red-800 font-bold bg-white/70 p-2.5 rounded-lg border border-red-200">
                      Rule: Even if visual classification suggests a harmless or non-venomous snake, an envenomed patient displaying unclotted blood (20WBCT), cranial nerve ptosis, or shock MUST receive emergency antivenom without delay.
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
};
