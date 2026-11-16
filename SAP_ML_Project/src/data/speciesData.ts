import { SnakeSpecies } from '../types';
import { EXTRA_SPECIES } from './speciesDataExtra';

/**
 * Herpetological database for Pakistan and South Asian snakes.
 * 
 * Each prototypeVector has EXACTLY 28 normalized features:
 * - 0..7:   Hue Histogram (8 bins)
 * - 8..11:  Saturation Histogram (4 bins)
 * - 12..15: Value / Lightness Histogram (4 bins)
 * - 16..19: Color Moments (mean R, mean G, mean B, stdLum contrast)
 * - 20..25: Histogram of Oriented Gradients (6 bins)
 * - 26:     Pattern Entropy (0.0 to 1.0)
 * - 27:     Scale Roughness (0.0 to 1.0 - smooth Elapids vs rough keeled Viperids)
 */

const BASE_SPECIES: SnakeSpecies[] = [
  {
    id: 'daboia-russelii',
    scientificName: "Daboia russelii",
    commonName: {
      en: "Russell's Viper",
      ur: "ڈبوئیا / کوریلا",
      sd: "ڪوريلا / ڊبوئيا"
    },
    localNames: {
      en: "Russell's Viper, Chain Viper",
      ur: "Korela, Daboia, Cheetal",
      sd: "Korelo, Khapra"
    },
    family: 'Viperidae',
    venomCategory: 'Hemotoxic',
    isVenomous: true,
    medicalSignificance: 'High',
    description: {
      en: "Large, heavy-bodied viper with a distinct triangular head, loud hissing sound when threatened, and three longitudinal chains of brown ovular spots with black borders and white rims along its buff or yellowish-brown body.",
      ur: "بھاری جسم والا زہریلا وائپر، جس کا سر تکونی اور گلے سے واضح الگ ہوتا ہے۔ خطرے پر کوکر کی سیٹی جیسی تیز پھنکار نکالتا ہے۔ پیٹھ پر تین قطاروں میں بیضوی سیاہ اور سفید حاشیے والے دھبے ہوتے ہیں۔",
      sd: "وڏي جسم وارو زهرائتو وائپر، جنهن جو مٿو ٽڪنڊو هوندو آهي. خطري مهل تيز سيٽي وانگر ڦوڪارو ڪندو آهي. جسم تي ٽي قطارون چٽن جا داغ هوندا آهن."
    },
    keyFeatures: {
      scales: "Strongly keeled, rough scales across entire dorsal surface.",
      head: "Distinctly triangular, flattened, covered in tiny granular scales; nostril large and crescent-shaped.",
      bodyPattern: "Deep brown spots bordered by black and outer white rings forming 3 longitudinal chains.",
      pupil: "Vertical elliptical slit."
    },
    habitat: ["Open scrublands", "Agricultural farmlands (wheat, sugarcane)", "Grassy riverbanks", "Rocky scrub areas"],
    pakistanDistribution: {
      provinces: ["Sindh", "Punjab", "Khyber Pakhtunkhwa (southern)"],
      districts: ["Tharparkar", "Badin", "Sanghar", "Hyderabad", "Mianwali", "Multan", "Rahim Yar Khan", "Dera Ghazi Khan"],
      riskSeason: "Post-monsoon harvest (September - November)"
    },
    titerRequirements: {
      nihTiter: "1 mL neutralizes ≥ 0.60 mg venom (NIH Pakistan spec)",
      antivenomAvailable: true
    },
    // Exactly 28 elements: [8 H, 4 S, 4 V, 4 Moments, 6 HOG, Entropy, Roughness]
    prototypeVector: [
      0.08, 0.22, 0.32, 0.18, 0.08, 0.04, 0.04, 0.04, // 8 Hue
      0.15, 0.40, 0.30, 0.15,                         // 4 Sat
      0.10, 0.35, 0.35, 0.20,                         // 4 Val
      0.58, 0.46, 0.32, 0.24,                         // 4 Moments
      0.18, 0.16, 0.17, 0.16, 0.17, 0.16,             // 6 HOG
      0.82,                                           // Pattern entropy (mottled chains)
      0.88                                            // Scale roughness (high keeled scales)
    ],
    sampleImageUrl: '/snakes/daboia-russelii.jpg'
  },
  {
    id: 'echis-carinatus',
    scientificName: "Echis carinatus",
    commonName: {
      en: "Saw-scaled Viper",
      ur: "لنڈی / گندی / پھڑکا سانپ",
      sd: "لنڊي / ڦڙڪو / کٽ کٽيو"
    },
    localNames: {
      en: "Saw-scaled Viper, Carpet Viper",
      ur: "Lundi, Gandi, Kat-katiya, Pharka",
      sd: "Lundi, Khat-khatiyo"
    },
    family: 'Viperidae',
    venomCategory: 'Hemotoxic',
    isVenomous: true,
    medicalSignificance: 'High',
    description: {
      en: "Small (under 60 cm) but aggressively striking viper. Produces a raspy sound by rubbing its serrated keeled side scales in figure-8 loops. Distinct bird's foot or cross mark on the crown of the head.",
      ur: "چھوٹا (60 سینٹی میٹر سے کم) مگر انتہائی خطرناک وائپر۔ خطرے پر 8 کے ہندسے کی شکل میں اپنے کھردری چھلکوں کو رگڑ کر آرے کی طرح آواز پیدا کرتا ہے۔ سر پر پرندے کے پنجے یا کراس جیسا سفید نشان ہوتا ہے۔",
      sd: "ننڍو پر نهايت تکليف ڏيندڙ ۽ خطرناڪ وائپر. پنهنجي کردرن کلن کي پاڻ ۾ گسائي آريءَ جهڙو کٽ کٽ جو آواز ڪندو آهي. مٿي تي ڪراس يا پکيءَ جي پنجي جهڙو نشان."
    },
    keyFeatures: {
      scales: "Serrated lateral scales heavily keeled; scales pointing obliquely downwards.",
      head: "Pear-shaped, distinct from neck, with prominent whitish cross / cruciform mark on crown.",
      bodyPattern: "Greyish-brown or sandy ground with undulating pale white flank line and dark patches.",
      pupil: "Vertical elliptical."
    },
    habitat: ["Sandy deserts", "Arid rocky hills", "Dry thorny scrub", "Thatch and brick heaps near rural huts"],
    pakistanDistribution: {
      provinces: ["Sindh", "Balochistan", "Punjab", "KPK"],
      districts: ["Tharparkar", "Cholistan", "Dadu", "Lasbela", "Khuzdar", "Dera Ismail Khan", "Bhakkar"],
      riskSeason: "Hot summer nights and early autumn"
    },
    titerRequirements: {
      nihTiter: "1 mL neutralizes ≥ 0.45 mg venom (NIH Pakistan spec)",
      antivenomAvailable: true
    },
    prototypeVector: [
      0.12, 0.28, 0.26, 0.14, 0.06, 0.04, 0.04, 0.06, // 8 Hue
      0.30, 0.45, 0.18, 0.07,                         // 4 Sat
      0.15, 0.40, 0.32, 0.13,                         // 4 Val
      0.54, 0.48, 0.38, 0.19,                         // 4 Moments
      0.22, 0.18, 0.14, 0.14, 0.18, 0.14,             // 6 HOG
      0.72,                                           // Pattern entropy
      0.94                                            // Scale roughness (serrated saw-scales)
    ],
    sampleImageUrl: '/snakes/echis-carinatus.jpg'
  },
  {
    id: 'naja-naja',
    scientificName: "Naja naja",
    commonName: {
      en: "Spectacled Cobra",
      ur: "کالا ناگ / پھن والا سانپ",
      sd: "ڪارو ناگ / ڦڻيار نانگ"
    },
    localNames: {
      en: "Spectacled Cobra, Indian Cobra",
      ur: "Kala Naag, Phun-dhar, Dasiri",
      sd: "Kalo Naag, Phaniyaro"
    },
    family: 'Elapidae',
    venomCategory: 'Neurotoxic',
    isVenomous: true,
    medicalSignificance: 'High',
    description: {
      en: "Iconic elapid capable of expanding its ribs into an impressive hood displaying a spectacle (figure-of-eight) dorsal marking. Smooth, shiny scales. Potent postsynaptic neurotoxin causing flaccid paralysis and marked local tissue necrosis.",
      ur: "مشہور پھن پھیلانے والا سانپ جس کے پھن کی پشت پر عینک (چشمہ) جیسا نشان ہوتا ہے۔ اس کی جلد کے چھلکے ملائم اور چمکدار ہوتے ہیں۔ اس کا زہر اعصابی فالج اور کاٹے کے مقام پر گوشت گلانے (نیکروسس) کا باعث بنتا ہے۔",
      sd: "ڦڻ ڦهلائيندڙ مشهور زهرائتو نانگ. ڦڻ جي پٺيان عينڪ جهڙو چٽو نشان. کل لسي ۽ چمڪندڙ. ان جو زهر اعصابي فالج ۽ گوشت ڳارڻ جو سبب بڻجي ٿو."
    },
    keyFeatures: {
      scales: "Smooth, polished dorsal scales; oblique vertebral rows without keels.",
      head: "Broad, slightly rounded, blending into neck until hood is spread.",
      bodyPattern: "Yellowish-tan to dark brown/black; distinctive spectacle marking on hood.",
      pupil: "Round."
    },
    habitat: ["Cultivated agricultural fields", "Termite mounds", "Grain storage areas and rat burrows", "Village peripheries"],
    pakistanDistribution: {
      provinces: ["Punjab", "Sindh", "KPK", "Islamabad Capital Territory"],
      districts: ["Lahore", "Faisalabad", "Sialkot", "Gujranwala", "Mirpurkhas", "Peshawar", "Rawalpindi"],
      riskSeason: "Monsoon floods (July - September) when burrows flood"
    },
    titerRequirements: {
      nihTiter: "1 mL neutralizes ≥ 0.60 mg venom (NIH Pakistan spec)",
      antivenomAvailable: true
    },
    prototypeVector: [
      0.15, 0.20, 0.15, 0.10, 0.08, 0.08, 0.12, 0.12, // 8 Hue
      0.22, 0.35, 0.28, 0.15,                         // 4 Sat
      0.20, 0.30, 0.30, 0.20,                         // 4 Val
      0.45, 0.40, 0.35, 0.21,                         // 4 Moments
      0.17, 0.17, 0.17, 0.16, 0.17, 0.16,             // 6 HOG
      0.58,                                           // Pattern entropy
      0.22                                            // Scale roughness (smooth polished)
    ],
    sampleImageUrl: '/snakes/naja-naja.jpg'
  },
  {
    id: 'bungarus-caeruleus',
    scientificName: "Bungarus caeruleus",
    commonName: {
      en: "Common Krait",
      ur: "سنگچور / پیلا کڑنگ",
      sd: "سنگچور / ڪڙنگ / پيئڻ"
    },
    localNames: {
      en: "Common Krait, Blue Krait",
      ur: "Sangchur, Peela Karung, Siyaah Krait",
      sd: "Karang, Peeyan, Sangchoor"
    },
    family: 'Elapidae',
    venomCategory: 'Neurotoxic',
    isVenomous: true,
    medicalSignificance: 'High',
    description: {
      en: "Glossy blue-black or steel-grey snake with narrow white crossbands in pairs along the body and an enlarged hexagonal vertebral scale row. Strictly nocturnal; bites sleeping humans on floor mats with virtually no local pain or swelling, causing sudden morning respiratory arrest.",
      ur: "چمکدار سیاہ یا نیلی مائل سرمئی رنگت والا سانپ جس کے جسم پر باریک سفید پٹیاں جوڑوں کی شکل میں ہوتی ہیں۔ یہ رات کو سوتے ہوئے لوگوں کو زمین پر کاٹتا ہے۔ اس کے کاٹنے پر نہ درد ہوتا ہے نہ سوجن، صبح مریض فالج اور سانس بند ہونے کے ساتھ جاگتا ہے۔",
      sd: "چمڪندڙ ڪارو يا اسٽيل نيرو نانگ، جنهن جي بدن تي سنهيون اڇيون پٽيون هونديون آهن. رات جو ننڊ ستل ماڻهن کي ڏنگيندو آهي جنهن سان ڪو سور يا سوڄ نه ٿيندي آهي پر صبح جو ساهه گهٽجڻ جو خطرو ٿئي ٿو."
    },
    keyFeatures: {
      scales: "Extremely smooth, polished like porcelain; median vertebral scale row noticeably enlarged and hexagonal.",
      head: "Indistinct from neck; small dark eyes with round pupils.",
      bodyPattern: "Jet glossy black or steel-blue with 40-50 pairs of narrow white crossbars starting after neck.",
      pupil: "Round."
    },
    habitat: ["Rural mud houses", "Straw roofs", "Termite mounds", "Near water sources and domestic rat trails"],
    pakistanDistribution: {
      provinces: ["Punjab", "Sindh", "KPK", "Balochistan"],
      districts: ["Kasur", "Okara", "Sargodha", "Jhang", "Sukkur", "Nawabshah", "Swat (lower)", "Sibi"],
      riskSeason: "Summer & Monsoon nights (midnight to 4:00 AM)"
    },
    titerRequirements: {
      nihTiter: "1 mL neutralizes ≥ 0.45 mg venom (NIH Pakistan spec)",
      antivenomAvailable: true
    },
    prototypeVector: [
      0.05, 0.05, 0.05, 0.08, 0.12, 0.25, 0.25, 0.15, // 8 Hue
      0.15, 0.20, 0.25, 0.40,                         // 4 Sat
      0.50, 0.25, 0.15, 0.10,                         // 4 Val (dark)
      0.24, 0.25, 0.28, 0.28,                         // 4 Moments
      0.26, 0.12, 0.12, 0.12, 0.26, 0.12,             // 6 HOG (strong banding)
      0.64,                                           // Pattern entropy
      0.12                                            // Scale roughness (very smooth)
    ],
    sampleImageUrl: '/snakes/bungarus-caeruleus.jpg'
  },
  {
    id: 'ptyas-mucosa',
    scientificName: "Ptyas mucosa",
    commonName: {
      en: "Indian Rat Snake",
      ur: "دھامن / گھوڑا سانپ",
      sd: "ڌامڻ نانگ"
    },
    localNames: {
      en: "Dhaman, Oriental Rat Snake",
      ur: "Dhaman, Ghora Saanp, Aseer",
      sd: "Dhaman"
    },
    family: 'Colubridae',
    venomCategory: 'Non-venomous',
    isVenomous: false,
    medicalSignificance: 'Non-significant',
    description: {
      en: "Non-venomous, extremely fast-moving large colubrid (up to 2.5 meters). Often confused with Cobras due to size, but has prominent vertical black lines between yellowish-white lip scales, large round eyes, and no expandable hood.",
      ur: "غیر زہریلا، انتہائی تیز رفتار اور لمبا سانپ (ڈھائی میٹر تک)۔ سائز کی وجہ سے لوگ اسے اکثر کوبرا سمجھ بیٹھتے ہیں، لیکن اس کے ہونٹوں کے پیلے چھلکوں پر عمودی سیاہ لکیریں ہوتی ہیں اور یہ پھن نہیں پھیلا سکتا۔",
      sd: "غير زهرائتو، تيز هلندڙ وڏو نانگ. ماڻهو گهڻو ڪري هن کي ڪارو نانگ سمجهندا آهن، پر هن جا چپ پيلا ۽ انهن تي ڪاريون ليڪون هونديون آهن ۽ ڦڻ نه هوندو اٿس."
    },
    keyFeatures: {
      scales: "Smooth anteriorly, slightly keeled posteriorly in vertebral rows.",
      head: "Elongated, distinct from neck; large protruding eyes with round pupils; black sutures between supralabials.",
      bodyPattern: "Yellowish-olive, brown to blackish; posterior body marked with black cross-reticulations.",
      pupil: "Large round."
    },
    habitat: ["Farmlands", "Barns", "Paddy fields", "Suburban gardens hunting rodents"],
    pakistanDistribution: {
      provinces: ["Sindh", "Punjab", "KPK", "Balochistan"],
      districts: ["All agricultural districts across Pakistan"],
      riskSeason: "Active daytime throughout spring and summer"
    },
    titerRequirements: {
      nihTiter: "Not applicable (Non-venomous)",
      antivenomAvailable: false
    },
    prototypeVector: [
      0.10, 0.25, 0.30, 0.18, 0.08, 0.03, 0.03, 0.03, // 8 Hue
      0.25, 0.40, 0.25, 0.10,                         // 4 Sat
      0.15, 0.35, 0.35, 0.15,                         // 4 Val
      0.48, 0.45, 0.32, 0.18,                         // 4 Moments
      0.17, 0.16, 0.17, 0.17, 0.17, 0.16,             // 6 HOG
      0.52,                                           // Pattern entropy
      0.30                                            // Scale roughness
    ],
    sampleImageUrl: '/snakes/ptyas-mucosa.jpg'
  },
  {
    id: 'eryx-johnii',
    scientificName: "Eryx johnii",
    commonName: {
      en: "Red Sand Boa",
      ur: "دو منہ والا سانپ / ریڈ سینڈ بوآ",
      sd: "ٻه منهن وارو نانگ / سينڊ بوئا"
    },
    localNames: {
      en: "Indian Sand Boa, Blunt-tailed Boa",
      ur: "Do-Munha Saanp, Sand Boa",
      sd: "Ba-Munho, Rait-jo-Naang"
    },
    family: 'Boidae',
    venomCategory: 'Non-venomous',
    isVenomous: false,
    medicalSignificance: 'Non-significant',
    description: {
      en: "Completely non-venomous, stout, heavy-bodied burrowing snake with a blunt, rounded tail resembling its head (giving rise to the myth of a two-headed snake). Reddish-brown or chocolate colored with tiny smooth scales.",
      ur: "بالکل غیر زہریلا، موٹا اور گول دم والا سانپ جس کی دم سر جیسی گول ہوتی ہے (جس سے دو منہ والے سانپ کی غلط فہمی جنم لیتی ہے)۔ یہ ریت اور نرم مٹی میں بل بنا کر رہتا ہے اور چوہے کھاتا ہے۔",
      sd: "مڪمل غير زهرائتو، ٿلهو نانگ، جنهن جو پڇ مٿي جهڙو ڳورو هوندو آهي. ماڻهن ۾ کيس ٻه منهن وارو نانگ چوندا آهن. ريت ۽ وارياسي زمين ۾ رهندو آهي."
    },
    keyFeatures: {
      scales: "Small, smooth, polished; shiny cylindrical body.",
      head: "Wedge-shaped, snout blunt and adapted for burrowing; tiny eyes.",
      bodyPattern: "Uniform reddish-brown, dark chocolate or yellowish-tan; minimal spots on adults.",
      pupil: "Vertical."
    },
    habitat: ["Loose sandy soil", "Dry agricultural fields", "Semi-desert tracts"],
    pakistanDistribution: {
      provinces: ["Sindh", "Punjab", "Balochistan"],
      districts: ["Tharparkar", "Umerkot", "Bahawalpur", "Kharan", "Chagai"],
      riskSeason: "Night time active in warm months"
    },
    titerRequirements: {
      nihTiter: "Not applicable (Non-venomous)",
      antivenomAvailable: false
    },
    prototypeVector: [
      0.22, 0.28, 0.22, 0.12, 0.06, 0.04, 0.03, 0.03, // 8 Hue
      0.30, 0.38, 0.22, 0.10,                         // 4 Sat
      0.25, 0.35, 0.25, 0.15,                         // 4 Val
      0.52, 0.38, 0.29, 0.11,                         // 4 Moments
      0.16, 0.16, 0.18, 0.18, 0.16, 0.16,             // 6 HOG
      0.28,                                           // Pattern entropy (low, uniform)
      0.24                                            // Scale roughness
    ],
    sampleImageUrl: '/snakes/eryx-johnii.jpg'
  },
  {
    id: 'platyceps-ventromaculatus',
    scientificName: "Platyceps ventromaculatus",
    commonName: {
      en: "Glossy-bellied Racer",
      ur: "چتی دار ریسر / ہوائی سانپ",
      sd: "ريسر نانگ / تيز نانگ"
    },
    localNames: {
      en: "Gray's Racer, Spotted Bellied Racer",
      ur: "Hawaai Saanp, Racer",
      sd: "Hawai Naang"
    },
    family: 'Colubridae',
    venomCategory: 'Non-venomous',
    isVenomous: false,
    medicalSignificance: 'Non-significant',
    description: {
      en: "Slender, fast-moving harmless colubrid. Grey or pale olive dorsal coloration with a series of transverse dark spots or bars. Characteristic dark oblique bar below each eye. Completely non-venomous.",
      ur: "پتلا، انتہائی پھرتیلا اور بے ضرر سانپ۔ سرمئی یا زیتونی رنگت پر گہرے دھبوں کی قطاریں ہوتی ہیں۔ آنکھ کے نیچے ایک مخصوص ترچھی سیاہ لکیر ہوتی ہے۔ زہر سے بالکل پاک ہے۔",
      sd: "سنئون، تمام تيز ۽ بي نقصان نانگ. اک جي هيٺان ڪاري ترڇي ليڪ اٿس. مڪمل غير زهرائتو آهي."
    },
    keyFeatures: {
      scales: "Smooth, glossy in 19 rows at mid-body.",
      head: "Elongate, snout rounded; distinct dark bar below eye.",
      bodyPattern: "Pale greyish-olive with 60-80 rhomboidal or transverse dark dorsal spots.",
      pupil: "Round."
    },
    habitat: ["Rock crevices", "Dry stone walls", "Canal banks", "Urban gardens and building ruins"],
    pakistanDistribution: {
      provinces: ["Punjab", "Sindh", "Balochistan", "KPK"],
      districts: ["Karachi", "Rawalpindi", "Lahore", "Quetta", "Hyderabad"],
      riskSeason: "Diurnal, active year-round in hot plains"
    },
    titerRequirements: {
      nihTiter: "Not applicable (Non-venomous)",
      antivenomAvailable: false
    },
    prototypeVector: [
      0.10, 0.18, 0.24, 0.20, 0.10, 0.08, 0.05, 0.05, // 8 Hue
      0.20, 0.45, 0.25, 0.10,                         // 4 Sat
      0.10, 0.30, 0.40, 0.20,                         // 4 Val
      0.50, 0.50, 0.45, 0.16,                         // 4 Moments
      0.18, 0.16, 0.16, 0.16, 0.18, 0.16,             // 6 HOG
      0.54,                                           // Pattern entropy
      0.18                                            // Scale roughness
    ],
    sampleImageUrl: '/snakes/platyceps-ventromaculatus.jpg'
  },
  {
    id: 'telescopus-rhinopoma',
    scientificName: "Telescopus rhinopoma",
    commonName: {
      en: "Desert Cat Snake",
      ur: "ریگستانی کیٹ سنیک",
      sd: "ريگستاني ٻلي نانگ"
    },
    localNames: {
      en: "Sindh Cat Snake, Desert Cat Snake",
      ur: "Billi Saanp, Cat Snake",
      sd: "Billi Naang"
    },
    family: 'Colubridae',
    venomCategory: 'Mildly venomous',
    isVenomous: false,
    medicalSignificance: 'Non-significant',
    description: {
      en: "Rear-fanged mildly venomous colubrid with broad flattened head and large cat-like vertical pupils. Not medically dangerous to humans (mild local swelling at most; does not require antivenom).",
      ur: "پچھلے دانتوں میں ہلکا زہر رکھنے والا سانپ، جس کا سر بلی کی طرح چوڑا اور آنکھوں کی پتلیاں عمودی ہوتی ہیں۔ اس کا زہر انسان کے لیے خطرناک نہیں ہوتا اور اینٹی وینم کی ضرورت نہیں پڑتی۔",
      sd: "پويان ڏند رکندڙ هلڪو زهرائتو نانگ. مٿو ويڪرو ٻلي جهڙو. انسان لاءِ خطرناڪ ناهي ۽ اينٽي وينم جي ضرورت ناهي هوندي."
    },
    keyFeatures: {
      scales: "Smooth, slender body with prominent broad head.",
      head: "Broad, depressed, distinctly broad behind temples.",
      bodyPattern: "Pale greyish-tan with paired rows of small dark spots.",
      pupil: "Vertical slit (cat-like)."
    },
    habitat: ["Rocky arid hills", "Desert scrub", "Cliffs and ruins"],
    pakistanDistribution: {
      provinces: ["Balochistan", "Sindh (western hills)"],
      districts: ["Kirthar range", "Kalat", "Quetta", "Chagai", "Lasbela"],
      riskSeason: "Night time during summer"
    },
    titerRequirements: {
      nihTiter: "Not indicated (Medically insignificant)",
      antivenomAvailable: false
    },
    prototypeVector: [
      0.14, 0.22, 0.24, 0.16, 0.10, 0.06, 0.04, 0.04, // 8 Hue
      0.24, 0.40, 0.24, 0.12,                         // 4 Sat
      0.15, 0.35, 0.35, 0.15,                         // 4 Val
      0.51, 0.48, 0.42, 0.14,                         // 4 Moments
      0.17, 0.16, 0.17, 0.17, 0.17, 0.16,             // 6 HOG
      0.48,                                           // Pattern entropy
      0.22                                            // Scale roughness
    ],
    sampleImageUrl: '/snakes/telescopus-rhinopoma.jpg'
  }
];

// Species the CNN was trained on (real images). The other base species have no training data yet.
const TRAINED_IDS = new Set(['daboia-russelii', 'echis-carinatus', 'naja-naja', 'bungarus-caeruleus', 'ptyas-mucosa']);

export const SPECIES_DATABASE: SnakeSpecies[] = [
  ...BASE_SPECIES.map(s => ({ ...s, trainedInModel: TRAINED_IDS.has(s.id) })),
  ...EXTRA_SPECIES
];

export function getSpeciesById(id: string): SnakeSpecies | undefined {
  return SPECIES_DATABASE.find(s => s.id === id);
}
