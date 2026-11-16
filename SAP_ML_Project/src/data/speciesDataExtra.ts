import { SnakeSpecies } from '../types';

/**
 * Species added when the classifier was trained on a real image dataset
 * (arjun921/Indian-Snakes-Dataset). Medical/clinical text here is deliberately conservative and
 * MUST be reviewed by a clinician / toxicologist before any real-world use. Sindhi (sd) text for these
 * entries is a draft and should be reviewed by a native speaker.
 * These entries have no hand-set prototypeVector: the CNN does not use one.
 */
export const EXTRA_SPECIES: SnakeSpecies[] = [
  {
    id: 'ophiophagus-hannah',
    scientificName: 'Ophiophagus hannah',
    commonName: { en: 'King Cobra', ur: 'کنگ کوبرا (شاہی ناگ)', sd: 'ڪنگ ڪوبرا' },
    localNames: { en: 'King Cobra, Hamadryad', ur: 'King Cobra, Shahi Naag', sd: 'King Cobra' },
    family: 'Elapidae', venomCategory: 'Neurotoxic', isVenomous: true, medicalSignificance: 'High',
    description: {
      en: 'Largest venomous snake (commonly 3-4 m, up to ~5.5 m). Broad hood with chevron/inverted-V marks, large head scales; feeds mainly on other snakes. Forest species of India and South-East Asia; not native to Pakistan. Highly neurotoxic; potentially large venom yield.',
      ur: 'دنیا کا سب سے لمبا زہریلا سانپ (عموماً 3 سے 4 میٹر)۔ چوڑا پھن اور بڑے سر کے سکیلز؛ زیادہ تر دوسرے سانپ کھاتا ہے۔ بھارت اور جنوب مشرقی ایشیا کے جنگلات میں ملتا ہے، پاکستان کا مقامی نہیں۔ زہر شدید اعصابی ہوتا ہے۔',
      sd: 'Largest venomous snake (3-4 m). Broad hood, feeds on snakes. Forest species of India/South-East Asia; not native to Pakistan. Highly neurotoxic.'
    },
    keyFeatures: { scales: 'Large occipital scales behind the parietals; smooth dorsal scales.', head: 'Large, hooded neck when threatened.', bodyPattern: 'Olive/brown/black with pale narrow cross-bands, strongest on the posterior body.', pupil: 'Round.' },
    habitat: ['Evergreen and moist forests', 'Bamboo thickets', 'Forest edges near streams'],
    pakistanDistribution: { provinces: [], districts: ['Not native to Pakistan (India, Nepal, Bangladesh, South-East Asia)'], riskSeason: 'Active in warm/monsoon months in native range' },
    titerRequirements: { nihTiter: 'Not covered by the standard "big four" South Asian polyvalent antivenom. Contact a poison centre / toxicology service; a species-specific antivenom exists elsewhere in Asia.', antivenomAvailable: false },
    trainedInModel: true
  },
  {
    id: 'naja-kaouthia',
    scientificName: 'Naja kaouthia',
    commonName: { en: 'Monocled Cobra', ur: 'مونوکلڈ کوبرا', sd: 'مونوڪلڊ ڪوبرا' },
    localNames: { en: 'Monocled Cobra, Indian Monocled Cobra', ur: 'Monocled Cobra', sd: 'Monocled Cobra' },
    family: 'Elapidae', venomCategory: 'Neurotoxic', isVenomous: true, medicalSignificance: 'High',
    description: {
      en: 'Cobra with a single ring (monocle) mark on the hood. Neurotoxic with marked local tissue damage (swelling/necrosis). Found in eastern/north-eastern India, Nepal, Bangladesh and South-East Asia; not native to Pakistan.',
      ur: 'پھن پر ایک گول نشان (مونوکل) والا کوبرا۔ اعصابی زہر کے ساتھ مقامی ٹشو کو نقصان (سوجن/گلنا)۔ مشرقی و شمال مشرقی بھارت، نیپال، بنگلہ دیش میں ملتا ہے، پاکستان کا مقامی نہیں۔',
      sd: 'Cobra with a single ring mark on the hood. Neurotoxic with local tissue damage. Eastern/NE India, Nepal, Bangladesh; not native to Pakistan.'
    },
    keyFeatures: { scales: 'Smooth dorsal scales; 21 mid-body rows typical.', head: 'Hood with a single O-shaped mark.', bodyPattern: 'Brown to black, sometimes with pale bands.', pupil: 'Round.' },
    habitat: ['Wetlands', 'Rice paddies', 'Village outskirts'],
    pakistanDistribution: { provinces: [], districts: ['Not native to Pakistan'], riskSeason: 'Monsoon season in native range' },
    titerRequirements: { nihTiter: 'Neutralisation by the standard South Asian polyvalent is regionally variable; follow the national protocol and consult a poison centre.', antivenomAvailable: false },
    trainedInModel: true
  },
  {
    id: 'argyrogena-fasciolata',
    scientificName: 'Argyrogena fasciolata',
    commonName: { en: 'Banded Racer', ur: 'دھاری دار ریسر', sd: 'ڌاريدار ريسر' },
    localNames: { en: 'Banded Racer', ur: 'Banded Racer', sd: 'Banded Racer' },
    family: 'Colubridae', venomCategory: 'Non-venomous', isVenomous: false, medicalSignificance: 'Non-significant',
    description: {
      en: 'Fast, non-venomous colubrid with crossbands that can resemble a krait. Visual look-alikes of dangerous species are a classic cause of misidentification: never rule out envenomation from appearance alone.',
      ur: 'تیز رفتار، غیر زہریلا سانپ جس کی دھاریاں کریٹ سے مشابہ لگ سکتی ہیں۔ شکل دیکھ کر زہریلے سانپ سے خطرہ مسترد نہ کریں۔',
      sd: 'Fast non-venomous colubrid with bands that can resemble a krait. Never rule out envenomation by appearance alone.'
    },
    keyFeatures: { scales: 'Smooth, 19-21 rows.', head: 'Narrow, slightly distinct from neck.', bodyPattern: 'Pale crossbands on a darker body, fading toward the tail.', pupil: 'Round.' },
    habitat: ['Dry scrub', 'Farmland edges', 'Rocky open country'],
    pakistanDistribution: { provinces: ['Sindh', 'Punjab'], districts: ['Dry plains and scrub'], riskSeason: 'Warm months, active by day' },
    titerRequirements: { nihTiter: 'Not applicable (Non-venomous)', antivenomAvailable: false },
    trainedInModel: true
  },
  {
    id: 'fowlea-piscator',
    scientificName: 'Fowlea piscator',
    commonName: { en: 'Checkered Keelback', ur: 'چیکرڈ کیل بیک (پانی کا سانپ)', sd: 'چيڪرڊ ڪيل بيڪ' },
    localNames: { en: 'Checkered Keelback, Asiatic Water Snake', ur: 'Pani ka Saanp', sd: 'Pani-jo Naang' },
    family: 'Colubridae', venomCategory: 'Non-venomous', isVenomous: false, medicalSignificance: 'Non-significant',
    description: {
      en: 'Common semi-aquatic snake with checkered pattern. Rear-fanged and generally harmless to humans (not medically significant). Often found near canals, ponds and paddy fields.',
      ur: 'عام نیم آبی سانپ، جس پر چیکر نما نشانات ہوتے ہیں۔ پچھلے دانتوں والا مگر انسان کے لیے عموماً بے ضرر۔ نہروں، تالابوں اور دھان کے کھیتوں کے قریب ملتا ہے۔',
      sd: 'Common semi-aquatic snake with checkered pattern. Rear-fanged, generally harmless to humans. Found near canals, ponds, paddy fields.'
    },
    keyFeatures: { scales: 'Strongly keeled dorsal scales.', head: 'Olive/brown with dark streaks behind the eye.', bodyPattern: 'Olive-brown with dark chequered markings.', pupil: 'Round.' },
    habitat: ['Canals', 'Ponds', 'Paddy fields', 'Marshes'],
    pakistanDistribution: { provinces: ['Sindh', 'Punjab', 'KPK'], districts: ['Irrigated plains and wetlands'], riskSeason: 'Warm months' },
    titerRequirements: { nihTiter: 'Not applicable (not medically significant)', antivenomAvailable: false },
    trainedInModel: true
  },
  {
    id: 'gongylophis-conicus',
    scientificName: 'Gongylophis conicus',
    commonName: { en: 'Common Sand Boa', ur: 'عام ریت کا بوآ (دو منہ والا سانپ)', sd: 'عام ريتي بوا' },
    localNames: { en: 'Common Sand Boa, Rough-scaled Sand Boa', ur: 'Do-Munha Saanp', sd: 'Ba-Munho' },
    family: 'Boidae', venomCategory: 'Non-venomous', isVenomous: false, medicalSignificance: 'Non-significant',
    description: {
      en: 'Thick-bodied, blunt-tailed, non-venomous constrictor that burrows in sandy soil. Commonly (and wrongly) feared; harmless to humans. Distinct from the Red Sand Boa (Eryx johnii).',
      ur: 'موٹا، کند دم والا غیر زہریلا سانپ جو ریتیلی زمین میں بل بناتا ہے۔ انسان کے لیے بے ضرر۔ ریڈ سینڈ بوآ (Eryx johnii) سے مختلف نسل ہے۔',
      sd: 'Thick-bodied, blunt-tailed non-venomous constrictor that burrows in sand. Harmless to humans.'
    },
    keyFeatures: { scales: 'Rough, keeled dorsal scales.', head: 'Small, barely distinct from neck.', bodyPattern: 'Brown with irregular darker blotches.', pupil: 'Vertical.' },
    habitat: ['Sandy soil', 'Dry scrub', 'Farmland'],
    pakistanDistribution: { provinces: ['Sindh', 'Punjab'], districts: ['Sandy and arid plains'], riskSeason: 'Warm months, mostly nocturnal' },
    titerRequirements: { nihTiter: 'Not applicable (Non-venomous)', antivenomAvailable: false },
    trainedInModel: true
  },
  {
    id: 'coelognathus-helena',
    scientificName: 'Coelognathus helena',
    commonName: { en: 'Common Trinket Snake', ur: 'عام ٹرنکٹ سانپ', sd: 'عام ٽرنڪيٽ نانگ' },
    localNames: { en: 'Trinket Snake', ur: 'Trinket Snake', sd: 'Trinket Snake' },
    family: 'Colubridae', venomCategory: 'Non-venomous', isVenomous: false, medicalSignificance: 'Non-significant',
    description: {
      en: 'Non-venomous rat-eating colubrid with a distinctive pattern of paired dark stripes/spots. Occurs mainly in India, Nepal and Sri Lanka; not typically reported in Pakistan.',
      ur: 'غیر زہریلا چوہے کھانے والا سانپ جس پر جوڑی دار گہری دھاریاں/دھبے ہوتے ہیں۔ بنیادی طور پر بھارت، نیپال اور سری لنکا میں ملتا ہے، پاکستان میں عموماً رپورٹ نہیں ہوتا۔',
      sd: 'Non-venomous rat-eating colubrid with paired dark stripes. Mainly India, Nepal, Sri Lanka; not typically reported in Pakistan.'
    },
    keyFeatures: { scales: 'Smooth, 19 rows.', head: 'Slightly distinct, dark streak through the eye.', bodyPattern: 'Brown/grey with paired dark longitudinal streaks and spots.', pupil: 'Round.' },
    habitat: ['Scrub forest', 'Farmland', 'Village outskirts'],
    pakistanDistribution: { provinces: [], districts: ['Not typically reported in Pakistan'], riskSeason: 'Warm months, active by day' },
    titerRequirements: { nihTiter: 'Not applicable (Non-venomous)', antivenomAvailable: false },
    trainedInModel: true
  },
  {
    id: 'ahaetulla-nasuta',
    scientificName: 'Ahaetulla nasuta',
    commonName: { en: 'Green Vine Snake', ur: 'ہرا بیل نما سانپ', sd: 'ساوو ويل نانگ' },
    localNames: { en: 'Green Vine Snake', ur: 'Green Vine Snake', sd: 'Green Vine Snake' },
    family: 'Colubridae', venomCategory: 'Non-venomous', isVenomous: false, medicalSignificance: 'Non-significant',
    description: {
      en: 'Very slender bright-green arboreal snake with a pointed head and horizontal pupils. Rear-fanged with mild venom; not medically significant to humans. Native to India and Sri Lanka; not typically reported in Pakistan.',
      ur: 'بہت پتلا، چمکدار ہرا درختوں پر رہنے والا سانپ، نوکیلا سر اور افقی پتلیاں۔ پچھلے دانتوں میں ہلکا زہر، انسان کے لیے خطرناک نہیں۔ بھارت اور سری لنکا میں ملتا ہے، پاکستان میں عموماً رپورٹ نہیں ہوتا۔',
      sd: 'Very slender bright-green arboreal snake, pointed head. Mild rear-fanged venom, not medically significant. India and Sri Lanka; not typically reported in Pakistan.'
    },
    keyFeatures: { scales: 'Smooth, narrow.', head: 'Long pointed snout with horizontal keyhole-shaped pupil.', bodyPattern: 'Uniform bright green.', pupil: 'Horizontal.' },
    habitat: ['Trees and shrubs', 'Gardens', 'Forest edges'],
    pakistanDistribution: { provinces: [], districts: ['Not typically reported in Pakistan'], riskSeason: 'Warm months' },
    titerRequirements: { nihTiter: 'Not applicable (not medically significant)', antivenomAvailable: false },
    trainedInModel: true
  },
  {
    id: 'python-molurus',
    scientificName: 'Python molurus',
    commonName: { en: 'Indian Rock Python', ur: 'انڈین راک پائتھن (اجگر)', sd: 'انڊين راڪ پائٿان' },
    localNames: { en: 'Indian Python, Rock Python', ur: 'Ajgar, Python', sd: 'Ajgar' },
    family: 'Pythonidae', venomCategory: 'Non-venomous', isVenomous: false, medicalSignificance: 'Non-significant',
    description: {
      en: 'Large non-venomous constrictor (commonly 2-3 m, larger possible). Not venomous; bites can cause lacerations and require wound care and tetanus prophylaxis. Protected species in most of its range.',
      ur: 'بڑا غیر زہریلا اجگر (عموماً 2 سے 3 میٹر یا زیادہ)۔ زہریلا نہیں؛ کاٹنے سے زخم ہو سکتے ہیں جن کی صفائی اور ٹیٹنس سے بچاؤ ضروری ہے۔ اکثر علاقوں میں محفوظ نسل ہے۔',
      sd: 'Large non-venomous constrictor. Bites can cause lacerations; wound care and tetanus prophylaxis. Protected species.'
    },
    keyFeatures: { scales: 'Smooth, small, in many rows.', head: 'Spear-shaped, with a dark arrow mark on top.', bodyPattern: 'Large irregular brown-tan blotches on a pale background.', pupil: 'Vertical.' },
    habitat: ['Forests', 'Grasslands', 'Rocky hills', 'Near water'],
    pakistanDistribution: { provinces: ['Sindh', 'Punjab'], districts: ['Scattered localities; protected'], riskSeason: 'Warm months' },
    titerRequirements: { nihTiter: 'Not applicable (Non-venomous)', antivenomAvailable: false },
    trainedInModel: true
  }
];
