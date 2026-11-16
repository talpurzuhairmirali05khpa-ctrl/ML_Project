import { Language } from '../types';

export interface TranslationDict {
  appTitle: string;
  appSubtitle: string;
  emergencyAlert: string;
  emergencyCall: string;
  navTabs: {
    classifier: string;
    clinical: string;
    antivenom: string;
    regional: string;
    benchmark: string;
    vivaReport: string;
  };
  classifierTitle: string;
  classifierSubtitle: string;
  uploadPhoto: string;
  takePhoto: string;
  chooseSample: string;
  extractingFeatures: string;
  predictSpecies: string;
  safetyDisclaimerTitle: string;
  clinicalTitle: string;
  clinicalSubtitle: string;
  antivenomIndicated: string;
  antivenomNotIndicated: string;
  adrenalineChecklist: string;
  twentyMinTestTitle: string;
  clottedStatus: string;
  unclottedStatus: string;
  pendingStatus: string;
  neuroSigns: string;
  hemoSigns: string;
  vitalSigns: string;
  patientProfile: string;
  evaluateTriage: string;
  resultsTitle: string;
  dosageRecommendation: string;
  privacyGuarantee: string;
  offlineNotice: string;
  vivaAuditTitle: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    appTitle: "Snakebite Antivenom Predictor & Clinical Support",
    appSubtitle: "Pakistan & South Asia — Evidence-Grounded Decision Support Platform",
    emergencyAlert: "MEDICAL EMERGENCY: If victim has difficulty breathing, drooping eyelids, or bleeding, proceed to hospital immediately. Do NOT delay hospital transport for app predictions.",
    emergencyCall: "Emergency Rescue 1122 / Poison Control: 021-99215740",
    navTabs: {
      classifier: "Visual Classifier",
      clinical: "Bedside Triage",
      antivenom: "Antivenom Catalog",
      regional: "Hospitals & Epidemiology",
      benchmark: "Model Evaluation",
      vivaReport: "Audit & Fixes Report"
    },
    classifierTitle: "Classical Computer Vision Snake Classifier",
    classifierSubtitle: "Extracts 28-dimensional morphological vectors with biological subspace weighting and selective abstention.",
    uploadPhoto: "Upload Snake Photograph",
    takePhoto: "Capture Image",
    chooseSample: "Or test with verified Pakistani specimens:",
    extractingFeatures: "Extracting color histograms, moments, HOG, pattern entropy & scale roughness...",
    predictSpecies: "Classify Specimen",
    safetyDisclaimerTitle: "Clinical Safety Invariant",
    clinicalTitle: "Standardized WHO / NIH Bedside Syndromic Triage",
    clinicalSubtitle: "Objective clinical protocol based on 20-Minute Clotting Test (20WBCT), neurotoxicity, and systemic vitals.",
    antivenomIndicated: "ANTIVENOM INDICATED — Immediate Hospital Protocol",
    antivenomNotIndicated: "ANTIVENOM NOT CURRENTLY INDICATED — Serial Observation Required",
    adrenalineChecklist: "Mandatory Pre-Drawn 0.5 mg IM Adrenaline Checklist",
    twentyMinTestTitle: "20-Minute Whole Blood Clotting Test (20WBCT)",
    clottedStatus: "Blood Clotted Firmly (Normal)",
    unclottedStatus: "Blood Unclotted / Liquid (Consumptive Coagulopathy)",
    pendingStatus: "Test in progress / Pending",
    neuroSigns: "Neurotoxic Symptoms (Cranial Nerves & Respiration)",
    hemoSigns: "Hemotoxic Symptoms (Hemorrhage & Coagulation)",
    vitalSigns: "Systemic Vitals, Renal Function & Shock",
    patientProfile: "Patient Demographics & Bite Profile",
    evaluateTriage: "Calculate Clinical Triage & ASV Dosage",
    resultsTitle: "Clinical Triage Evaluation & Prescription Guidelines",
    dosageRecommendation: "Initial Antivenom Dosage (NIH Polyvalent)",
    privacyGuarantee: "Privacy Guaranteed: Photographic images are processed entirely in browser memory. No photos are transmitted or stored remotely.",
    offlineNotice: "Field-Ready: Works offline in rural Basic Health Units (BHUs) and Rural Health Centers (RHCs).",
    vivaAuditTitle: "Viva & System Audit Report"
  },
  ur: {
    appTitle: "سانپ کے کاٹنے کا اینٹی وینم پریڈیکٹر اور طبی امداد",
    appSubtitle: "پاکستان اور جنوبی ایشیا — ثبوت پر مبنی طبی فیصلہ ساز نظام",
    emergencyAlert: "طبی ایمرجنسی: اگر مریض کو سانس لینے میں دشواری، آنکھوں کے پپوٹے گرنا یا خون بہنا شروع ہو جائے تو فوری ہسپتال لے جائیں۔ سافٹ ویئر کے لیے علاج میں تاخیر ہرگز نہ کریں۔",
    emergencyCall: "ایمرجنسی ریسکیو 1122 / قومی زہر کنٹرول مرکز: 021-99215740",
    navTabs: {
      classifier: "تصویری شناخت",
      clinical: "طبی معائنہ و ٹرائیج",
      antivenom: "اینٹی وینم ڈائرکٹری",
      regional: "ہسپتال اور نقشہ",
      benchmark: "ماڈل کارکردگی",
      vivaReport: "آڈٹ رپورٹ اور اصلاحات"
    },
    classifierTitle: "کلاسیکل کمپیوٹر ویژن سانپ شناختی نظام",
    classifierSubtitle: "تصویر سے رنگ، چھلکوں کے کھردرا پن اور خدوخال کا تجزیہ کر کے قسم کا اندازہ لگاتا ہے۔",
    uploadPhoto: "سانپ کی تصویر منتخب کریں",
    takePhoto: "کیمرے سے تصویر لیں",
    chooseSample: "یا پاکستان کے تصدیق شدہ نمونوں سے چیک کریں:",
    extractingFeatures: "تصویر کا تفصیلی سائنسی تجزیہ جاری ہے...",
    predictSpecies: "قسم کا تعین کریں",
    safetyDisclaimerTitle: "طبی حفاظت کا لازمی اصول",
    clinicalTitle: "عالمی ادارہ صحت (WHO) اور NIH کا بیڈ سائیڈ طبی معائنہ",
    clinicalSubtitle: "20 منٹ کے خون جمنے کے ٹیسٹ (20WBCT)، اعصابی علامات اور نبض کی بنیاد پر حتمی فیصلہ۔",
    antivenomIndicated: "اینٹی وینم کی فوری ضرورت ہے — ہنگامی پروٹوکول شروع کریں",
    antivenomNotIndicated: "اس وقت اینٹی وینم کی ضرورت نہیں — 24 گھنٹے مسلسل نگرانی کریں",
    adrenalineChecklist: "0.5 ملی گرام ایڈرینالین انجیکشن کی لازمی تیاری",
    twentyMinTestTitle: "20 منٹ کا خون جمنے کا ٹیسٹ (20WBCT)",
    clottedStatus: "خون جم گیا (نارمل)",
    unclottedStatus: "خون نہیں جما / مائع رہا (زہر کا اثر)",
    pendingStatus: "ٹیسٹ کا عمل جاری ہے",
    neuroSigns: "اعصابی علامات (آنکھیں، گلا اور سانس)",
    hemoSigns: "خون کی علامات (مسوڑھوں سے خون، رساؤ)",
    vitalSigns: "نبض، بلڈ پریشر اور گردوں کی حالت (پیشاب کی مقدار)",
    patientProfile: "مریض کی عمر، وزن اور کاٹنے کے حالات",
    evaluateTriage: "طبی جائزہ اور ڈوز کا حساب لگائیں",
    resultsTitle: "طبی فیصلے اور اینٹی وینم کے نتائج",
    dosageRecommendation: "اینٹی وینم کی ابتدائی خوراک (این آئی ایچ اسلام آباد)",
    privacyGuarantee: "مکمل رازداری: اپ لوڈ کردہ تصاویر سرور پر محفوظ نہیں ہوتیں، صرف آپ کے موبائل/کمپیوٹر میں رہتی ہیں۔",
    offlineNotice: "انٹرنیٹ کے بغیر دستیاب: دیہی بنیادی مراکز صحت (BHU) میں آف لائن بھی قابل استعمال ہے۔",
    vivaAuditTitle: "امتحانی ویوا آڈٹ رپورٹ"
  },
  sd: {
    appTitle: "نانگ ڏنگڻ تي اينٽي وينم اڳڪٿي ۽ طبي سهڪار",
    appSubtitle: "پاڪستان ۽ ڏکڻ ايشيا — ثبوت تي ٻڌل فيصلي جو نظام",
    emergencyAlert: "طبي ايمرجنسي: جيڪڏهن مريض کي ساهه کڻڻ ۾ تڪليف، اکين جا پلڪ ڪرڻ يا رت وهي ته فوري اسپتال کڻي وڃو. ايپ جي فيصلي لاءِ اسپتال وڃڻ ۾ دير نه ڪريو.",
    emergencyCall: "ايمرجنسي ريسڪيو 1122 / قومي زهر سنڀال سينٽر: 021-99215740",
    navTabs: {
      classifier: "تصويري سڃاڻپ",
      clinical: "طبي معائنو",
      antivenom: "اينٽي وينم لسٽ",
      regional: "اسپتال ۽ ڊسٽرڪٽ",
      benchmark: "ماڊل جي ڪارڪردگي",
      vivaReport: "آڊٽ ۽ سڌارا رپورٽ"
    },
    classifierTitle: "ڪمپيوٽر ويزن نانگ سڃاڻپ نظام",
    classifierSubtitle: "نانگ جي تصوير مان رنگن، کل جي کڙٻڙ ۽ ليڪن مان نسل جو اندازو لڳائي ٿو.",
    uploadPhoto: "نانگ جو ڦوٽو اپلوڊ ڪريو",
    takePhoto: "ڪيمرا مان تصوير ڪڍو",
    chooseSample: "يا سنڌ ۽ پاڪستان جي تصديق ٿيل نمونن مان چونڊيو:",
    extractingFeatures: "تصوير جي فزڪل خاصيتن جو تجزيو جاري آهي...",
    predictSpecies: "نانگ جو پتو لڳايو",
    safetyDisclaimerTitle: "طبي حفاظت جو اڻ مٽ اصول",
    clinicalTitle: "WHO ۽ NIH جو بيڊ سائيڊ معائنو",
    clinicalSubtitle: "20 منٽن جي رت ڄمڻ واري ٽيسٽ (20WBCT) ۽ اعصابي علامتن تي حتمي فيصلو.",
    antivenomIndicated: "اينٽي وينم لڳائڻ ضروري آهي — فوري پروٽوڪول شروع ڪريو",
    antivenomNotIndicated: "هن مهل اينٽي وينم جي ضرورت ناهي — 24 ڪلاڪ نگراني رکو",
    adrenalineChecklist: "0.5 ملي گرام ايڊرينالين جو پهرين تيار هجڻ لازمي آهي",
    twentyMinTestTitle: "20 منٽن جي رت ڄمڻ واري ٽيسٽ (20WBCT)",
    clottedStatus: "رت ڄمي ويو (ٺيڪ)",
    unclottedStatus: "رت نه ڄائو / پاڻي رهيو (زهر جو اثر)",
    pendingStatus: "ٽيسٽ جو وقت جاري آهي",
    neuroSigns: "اعصابي علامتون (اکين جو جهڪڻ، ڳالهائڻ ۽ ساهه)",
    hemoSigns: "رت وهڻ جون علامتون (مھارن مان رت، داغ)",
    vitalSigns: "بلڊ پريشر، گردن ۽ پيشاب جي حالت",
    patientProfile: "مريض جي ڄمار، وزن ۽ ڏنگڻ جو وقت",
    evaluateTriage: "طبي فيصلو ۽ دوائن جو اندازو لڳايو",
    resultsTitle: "طبي نتيجا ۽ علاج جا هدايتون",
    dosageRecommendation: "اينٽي وينم جي شروعاتي مقدار (NIH اسلام آباد)",
    privacyGuarantee: "مڪمل رازداري: تصويرون رڳو توهان جي فون/برائوزر ۾ هلن ٿيون، سرور تي سيو نٿيون ٿين.",
    offlineNotice: "ٻهراڙي مرڪزن (BHU) لاءِ آف لائن هلڻ جي سهولت موجود آهي.",
    vivaAuditTitle: "ويوا آڊٽ رپورٽ"
  }
};
