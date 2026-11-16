import { AntivenomProduct } from '../types';

export const ANTIVENOM_DATABASE: AntivenomProduct[] = [
  {
    id: 'nih-polyvalent-asv',
    tradeName: "NIH Polyvalent Anti-Snake Venom Serum (ASV)",
    manufacturer: "National Institutes of Health (NIH), Biological Production Division, Islamabad, Pakistan",
    countryOfOrigin: "Pakistan",
    type: "Polyvalent",
    form: "Liquid & Lyophilized (Freeze-dried)",
    neutralizationTiters: {
      daboiaRusselii: "1 mL neutralizes ≥ 0.60 mg venom (BPD NIH Islamabad Spec Sheet)",
      echisCarinatus: "1 mL neutralizes ≥ 0.45 mg venom (BPD NIH Islamabad Spec Sheet)",
      najaNaja: "1 mL neutralizes ≥ 0.60 mg venom (BPD NIH Islamabad Spec Sheet)",
      bungarusCaeruleus: "1 mL neutralizes ≥ 0.45 mg venom (BPD NIH Islamabad Spec Sheet)"
    },
    storageRequirements: "Liquid: Strict cold chain at 2°C to 8°C (Do NOT freeze). Lyophilized: Ambient store below 25°C in cool dry dark place.",
    shelfLife: "Liquid: 2 years. Lyophilized: 3–5 years from date of manufacture.",
    primaryCitations: [
      {
        title: "National Clinical Guidelines for the Management of Snakebites in Pakistan",
        source: "National Institute of Health (NIH) Islamabad & Ministry of National Health Services Regulations & Coordination, 2021.",
        url: "https://www.nih.org.pk"
      },
      {
        title: "Biological Production Division Product Specifications: Anti-Snake Venom Serum (Equine, F(ab')2)",
        source: "Drug Regulatory Authority of Pakistan (DRAP) Registration No. 000214."
      },
      {
        title: "Clinical efficacy of indigenous Pakistani polyvalent antivenom in envenomed victims of Sindh and Punjab",
        source: "Pakistan Journal of Medical Sciences (PJMS), 36(4): 712-718."
      }
    ],
    knownEfficacyGaps: [
      "Optimal match for Pakistani venom proteomes because equine immunogens are collected from native snake populations across Sindh, Punjab, and Balochistan.",
      "Does not cover Sindhi Krait (Bungarus sindanus) or Central Asian Cobra (Naja oxiana) with certified separate titer claims; clinical cross-neutralization is partial but standard doses often require escalations in southern Sindh."
    ],
    approximatePricePkr: "PKR 1,200 - 1,500 per vial (Heavily subsidized or free at District Headquarters (DHQ) / Teaching Hospitals in Pakistan)",
    adverseReactionRateObserved: "Immediate early anaphylactoid/pyrogenic reactions observed in ~15-25% of un-premedicated patients; manageable with pre-drawn 0.5 mg IM adrenaline."
  },
  {
    id: 'vins-polyvalent-asv',
    tradeName: "VINS Polyvalent Anti-Snake Venom Serum (Lyophilized)",
    manufacturer: "VINS Bio Products Ltd., Hyderabad, Telangana, India",
    countryOfOrigin: "India (Imported to Pakistan via emergency channels/UNICEF)",
    type: "Polyvalent",
    form: "Lyophilized",
    neutralizationTiters: {
      daboiaRusselii: "1 mL neutralizes ≥ 0.60 mg venom",
      echisCarinatus: "1 mL neutralizes ≥ 0.45 mg venom (E. c. carinatus reference standard)",
      najaNaja: "1 mL neutralizes ≥ 0.60 mg venom",
      bungarusCaeruleus: "1 mL neutralizes ≥ 0.45 mg venom"
    },
    storageRequirements: "Reconstitute with 10 mL Sterile Water for Injection. Store intact vials below 25°C.",
    shelfLife: "4 years from manufacturing date.",
    primaryCitations: [
      {
        title: "Beyond the 'Big Four': Venom mapping of geographic variation and antivenom efficacy in the Indian subcontinent",
        source: "PLOS Neglected Tropical Diseases, 2019; Senji Laxme et al., 13(12): e0007899."
      },
      {
        title: "WHO Guidelines for the Management of Snakebites in South-East Asia",
        source: "World Health Organization Regional Office for South-East Asia (WHO SEARO), 2nd Edition, 2016."
      }
    ],
    knownEfficacyGaps: [
      "Geographic venom variation: Immunized against southern Indian snakes (Irula snake-catchers cooperative, Tamil Nadu). Proteomic studies demonstrate Echis carinatus sochureki (prevalent in Pakistan and western drylands) has significant metalloproteinase divergence, requiring 1.8x to 2.5x higher vial doses for complete coagulopathy reversal.",
      "Zero neutralization for Hump-nosed Pit Viper (Hypnale hypnale) and Sochurek's saw-scaled viper requires heightened dose vigilance."
    ],
    approximatePricePkr: "Commercial import price ~PKR 3,500 - 4,800 per vial (when privately procured during public stockouts)",
    adverseReactionRateObserved: "20-30% mild to moderate hypersensitivity reported in field studies."
  },
  {
    id: 'bharat-polyvalent-asv',
    tradeName: "Snake Venom Antiserum (Bharat Serums)",
    manufacturer: "Bharat Serums and Vaccines Ltd., Thane, Maharashtra, India",
    countryOfOrigin: "India",
    type: "Polyvalent",
    form: "Liquid & Lyophilized",
    neutralizationTiters: {
      daboiaRusselii: "1 mL neutralizes ≥ 0.60 mg venom",
      echisCarinatus: "1 mL neutralizes ≥ 0.45 mg venom",
      najaNaja: "1 mL neutralizes ≥ 0.60 mg venom",
      bungarusCaeruleus: "1 mL neutralizes ≥ 0.45 mg venom"
    },
    storageRequirements: "Liquid: 2°C to 8°C. Lyophilized: Ambient below 25°C.",
    shelfLife: "3 years for lyophilized, 2 years for liquid.",
    primaryCitations: [
      {
        title: "Regional Proteomic Divergence of Indian Cobra and Viper Venoms and its Clinical Repercussions",
        source: "Journal of Proteomics, 2021; 231: 104020."
      },
      {
        title: "Lancet Global Health: The global burden of snakebite envenoming",
        source: "The Lancet Global Health, 2022; 10(9): e1281-e1290."
      }
    ],
    knownEfficacyGaps: [
      "Does not include Bungarus sindanus (Sindh Krait), which has 5-fold higher toxicity than Bungarus caeruleus and represents the dominant cause of fatal neurotoxicity in Tharparkar and southern Sindh.",
      "Cross-reactivity against Naja oxiana (Central Asian Cobra found in northern Pakistan and KP) is suboptimal."
    ],
    approximatePricePkr: "Commercial market estimate ~PKR 3,200 - 4,500 per vial",
    adverseReactionRateObserved: "Approximately 18-28% early reactions reported in clinical surveillance."
  }
];

export function getAntivenomById(id: string): AntivenomProduct | undefined {
  return ANTIVENOM_DATABASE.find(a => a.id === id);
}
