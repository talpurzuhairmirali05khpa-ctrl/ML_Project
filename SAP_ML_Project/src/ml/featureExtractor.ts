import { ExtractedFeatures } from '../types';

/**
 * Extracts a normalized 28-dimensional morphological, color, and texture feature vector
 * from an HTMLCanvasElement or ImageData.
 * 
 * Vector layout (28 values):
 * - 0..7:   Hue histogram (8 bins, 0° to 360°)
 * - 8..11:  Saturation histogram (4 bins)
 * - 12..15: Value histogram (4 bins)
 * - 16..19: Color moments (mean R, mean G, mean B, stdLum contrast)
 * - 20..25: HOG orientation energy (first 6 of 8 bins; the 8-bin histogram is still used internally for OOD checks)
 * - 26:     Pattern entropy (0.05 to 1.0, normalized Shannon entropy of gradient magnitudes)
 * - 27:     Scale roughness (0.05 to 1.0, foreground Laplacian)
 *
 */

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = h * 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return [h, s, v];
}

export function extractFeaturesFromImageData(imageData: ImageData): ExtractedFeatures {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  if (totalPixels === 0) {
    return createEmptyFeatures("Empty image data provided");
  }

  // 1. Color Histograms & Moments
  const hueBins = new Array(8).fill(0);
  const satBins = new Array(4).fill(0);
  const valBins = new Array(4).fill(0);

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumLum = 0;
  let sumLumSq = 0;

  // Grayscale buffer for HOG, Entropy, and Foreground Roughness
  const gray = new Float32Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Perceived luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = lum;

    sumR += r;
    sumG += g;
    sumB += b;
    sumLum += lum;
    sumLumSq += lum * lum;

    const [h, s, v] = rgbToHsv(r, g, b);

    // Hue bin (0..360 -> 8 bins)
    const hBin = Math.min(7, Math.floor(h / 45));
    hueBins[hBin]++;

    // Saturation bin (0..1 -> 4 bins)
    const sBin = Math.min(3, Math.floor(s * 4));
    satBins[sBin]++;

    // Value bin (0..1 -> 4 bins)
    const vBin = Math.min(3, Math.floor(v * 4));
    valBins[vBin]++;
  }

  // Normalize color histograms
  const normHue = hueBins.map(c => c / totalPixels);
  const normSat = satBins.map(c => c / totalPixels);
  const normVal = valBins.map(c => c / totalPixels);

  const meanR = (sumR / totalPixels) / 255;
  const meanG = (sumG / totalPixels) / 255;
  const meanB = (sumB / totalPixels) / 255;
  const meanLum = sumLum / totalPixels;
  const varianceLum = Math.max(0, (sumLumSq / totalPixels) - (meanLum * meanLum));
  const stdLum = Math.min(1.0, Math.sqrt(varianceLum) / 128); // Normalized 0..1

  // 2. Gradients & HOG (8 directional bins across 0..pi)
  const hogBins = new Array(8).fill(0);
  let totalGradientEnergy = 0;

  // Track orthogonal gridness (for checkerboard/synthetic grid detection)
  let orthogonalEnergy = 0;
  let diagonalEnergy = 0;

  const gradientMag = new Float32Array(totalPixels);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Sobel horizontal
      const gx = 
        -1 * gray[(y - 1) * width + (x - 1)] + 1 * gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)]       + 2 * gray[y * width + (x + 1)] +
        -1 * gray[(y + 1) * width + (x - 1)] + 1 * gray[(y + 1) * width + (x + 1)];

      // Sobel vertical
      const gy = 
        -1 * gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - 1 * gray[(y - 1) * width + (x + 1)] +
         1 * gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + 1 * gray[(y + 1) * width + (x + 1)];

      const mag = Math.sqrt(gx * gx + gy * gy);
      gradientMag[idx] = mag;
      totalGradientEnergy += mag;

      if (mag > 10) {
        let theta = Math.atan2(gy, gx);
        if (theta < 0) theta += Math.PI; // fold into [0, pi)
        const bin = Math.min(7, Math.floor((theta / Math.PI) * 8));
        hogBins[bin] += mag;

        // Check for sharp orthogonal alignments (0, 90 degrees vs 45, 135)
        if (bin === 0 || bin === 4) {
          orthogonalEnergy += mag;
        } else if (bin === 2 || bin === 6) {
          diagonalEnergy += mag;
        }
      }
    }
  }

  const normHog = totalGradientEnergy > 0 
    ? hogBins.map(b => b / totalGradientEnergy) 
    : new Array(8).fill(1 / 8);

  // 3. Pattern Entropy (Fix Bug 10: Shannon entropy of local gradient magnitudes)
  // Instead of always returning 1.00, we histogram the gradient magnitudes into 16 bins
  const gradHist = new Array(16).fill(0);
  let gradHistTotal = 0;
  for (let i = 0; i < totalPixels; i++) {
    const val = gradientMag[i];
    if (val > 2) {
      const b = Math.min(15, Math.floor((val / 255) * 16));
      gradHist[b]++;
      gradHistTotal++;
    }
  }

  let patternEntropy = 0;
  if (gradHistTotal > 0) {
    for (let i = 0; i < 16; i++) {
      if (gradHist[i] > 0) {
        const p = gradHist[i] / gradHistTotal;
        patternEntropy -= p * Math.log2(p);
      }
    }
    // Theoretical max entropy is log2(16) = 4.0
    patternEntropy = Math.min(1.0, Math.max(0.05, patternEntropy / 4.0));
  } else {
    patternEntropy = 0.05; // solid / flat image
  }

  // 4. Scale Roughness (Fix Bug 11: Compute Laplacian on segmented center foreground)
  // Mask out flat background by picking pixels with significant local variance
  let laplacianSum = 0;
  let foregroundCount = 0;

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      // Spatial center weighting (snakes usually centered in photography)
      const distFromCenter = Math.hypot((x - width / 2) / (width / 2), (y - height / 2) / (height / 2));
      const centerWeight = Math.max(0.2, 1.0 - 0.5 * distFromCenter);

      const idx = y * width + x;
      // Discrete 3x3 Laplacian kernel
      const lap = Math.abs(
        -4 * gray[idx] +
        gray[idx - 1] + gray[idx + 1] +
        gray[idx - width] + gray[idx + width]
      );

      // Only count foreground pixels with organic edge strength to prevent uniform camera noise
      if (gradientMag[idx] > 12 && distFromCenter < 0.95) {
        laplacianSum += lap * centerWeight;
        foregroundCount++;
      }
    }
  }

  let scaleRoughness = 0;
  if (foregroundCount > 20) {
    const avgLaplacian = laplacianSum / foregroundCount;
    // Log-scale normalization: smooth snakes ~ 10-30 -> 0.15-0.35, keeled vipers ~ 80-160 -> 0.75-0.95
    scaleRoughness = Math.min(1.0, Math.max(0.05, Math.log10(1 + avgLaplacian / 12) / 1.4));
  } else {
    scaleRoughness = 0.05; // No defined foreground edges
  }

  // 5. Out-of-Distribution (OOD) / Non-Snake Detector (Fix Bug 2)
  let isSnake = true;
  let oodScore = 0;
  let rejectionReason: string | undefined;

  // A. Solid or near-solid color check
  if (stdLum < 0.04 || totalGradientEnergy / totalPixels < 1.2) {
    isSnake = false;
    oodScore = 0.95;
    rejectionReason = "Uniform solid color or blank canvas detected. No biological morphological features.";
  }

  // B. Checkerboard / Orthogonal Synthetic Grid test
  // In 8 bins across [0, pi), orthogonal lines (0° and 90°) populate bins 0, 3, 4, 7
  const orthogonalHog = normHog[0] + normHog[3] + normHog[4] + normHog[7];
  const isAchromaticBimodal = normSat[0] > 0.95 && stdLum > 0.35;
  if ((orthogonalHog > 0.72 && isAchromaticBimodal) || orthogonalHog > 0.85) {
    isSnake = false;
    oodScore = 0.94;
    rejectionReason = "Synthetic geometric grid or checkerboard detected. Lacks organic biological contours.";
  }

  // C. High-Frequency White Noise test
  // Random noise has perfectly flat HOG, high stdLum, zero spatial correlation, and flat hue
  const hogVariance = normHog.reduce((acc, v) => acc + Math.pow(v - 0.125, 2), 0) / 8;
  if (hogVariance < 0.00015 && totalGradientEnergy / totalPixels > 25 && stdLum > 0.20) {
    isSnake = false;
    oodScore = 0.89;
    rejectionReason = "Random isotropic noise detected. No cohesive subject structure.";
  }

  // Assemble the 28-dimensional vector:
  // [0..7: H(8), 8..11: S(4), 12..15: V(4), 16..19: Moments(4), 20..27: HOG(6) + Entropy(1) + Roughness(1)]
  // To keep exactly 28 elements:
  // Hue: 8, Sat: 4, Val: 4, Moments: 4 (subtotal 20)
  // HOG: 6 principal bins (or condensed), Entropy: 1, Roughness: 1 (subtotal 8) -> Total = 28
  const vector: number[] = [
    ...normHue,                                               // 8
    ...normSat,                                               // 4
    ...normVal,                                               // 4
    meanR, meanG, meanB, stdLum,                              // 4
    normHog[0], normHog[1], normHog[2], normHog[3], normHog[4], normHog[5], // 6
    patternEntropy,                                           // 1
    scaleRoughness                                            // 1
  ];

  return {
    vector,
    colorHistH: normHue,
    colorHistS: normSat,
    colorHistV: normVal,
    colorMoments: { meanR, meanG, meanB, stdLum },
    hogTexture: normHog,
    patternEntropy,
    scaleRoughness,
    isSnake,
    oodScore,
    rejectionReason
  };
}

function createEmptyFeatures(reason: string): ExtractedFeatures {
  return {
    vector: new Array(28).fill(0),
    colorHistH: new Array(8).fill(0),
    colorHistS: new Array(4).fill(0),
    colorHistV: new Array(4).fill(0),
    colorMoments: { meanR: 0, meanG: 0, meanB: 0, stdLum: 0 },
    hogTexture: new Array(8).fill(0),
    patternEntropy: 0,
    scaleRoughness: 0,
    isSnake: false,
    oodScore: 1.0,
    rejectionReason: reason
  };
}
