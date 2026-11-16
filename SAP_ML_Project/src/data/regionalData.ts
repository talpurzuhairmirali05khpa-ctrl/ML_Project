export interface ReferralCenter {
  name: string;
  city: string;
  province: string;
  phone: string;
  facilities: string[];
  asvStockStatus: 'High (NIH stock direct)' | 'Moderate' | 'Seasonal procurement';
  icuVentilatorAvailable: boolean;
}

export const PAKISTAN_REFERRAL_CENTERS: ReferralCenter[] = [
  {
    name: "Dr. Ruth K.M. Pfau Civil Hospital Karachi (National Poison Control Centre / Medical Unit V)",
    city: "Karachi",
    province: "Sindh",
    phone: "+92-21-99215740 / Emergency: 1122",
    facilities: ["24/7 National Poison Control Centre (NPCC)", "Hemodialysis unit", "Mechanical ventilators", "Free NIH ASV stock"],
    asvStockStatus: "High (NIH stock direct)",
    icuVentilatorAvailable: true
  },
  {
    name: "Jinnah Postgraduate Medical Centre (JPMC), Department of Emergency Medicine",
    city: "Karachi",
    province: "Sindh",
    phone: "+92-21-99201300",
    facilities: ["Trauma ICU", "Automated blood gas & coagulation analyzers", "Dedicated Toxicology ward"],
    asvStockStatus: "High (NIH stock direct)",
    icuVentilatorAvailable: true
  },
  {
    name: "Civil Hospital Mithi / District Headquarters Hospital Tharparkar",
    city: "Mithi",
    province: "Sindh",
    phone: "+92-232-920033",
    facilities: ["Primary desert envenoming response", "20WBCT bedside testing", "Cold chain ASV storage"],
    asvStockStatus: "Moderate",
    icuVentilatorAvailable: false // Transfers severe respiratory cases to Hyderabad/Karachi
  },
  {
    name: "Liaquat University Hospital (LUH), Jamshoro / Hyderabad",
    city: "Hyderabad / Jamshoro",
    province: "Sindh",
    phone: "+92-22-9213305",
    facilities: ["Tertiary ICU", "Plasmapheresis", "Nephrology acute dialysis unit"],
    asvStockStatus: "High (NIH stock direct)",
    icuVentilatorAvailable: true
  },
  {
    name: "Nishtar Medical University & Hospital, Acute Medical Care Ward",
    city: "Multan",
    province: "Punjab",
    phone: "+92-61-9200231",
    facilities: ["Southern Punjab regional envenoming hub", "Adult ICU", "Hemodialysis", "Neostigmine trial facility"],
    asvStockStatus: "High (NIH stock direct)",
    icuVentilatorAvailable: true
  },
  {
    name: "Mayo Hospital / King Edward Medical University, Lahore",
    city: "Lahore",
    province: "Punjab",
    phone: "+92-42-99211100",
    facilities: ["Specialized Emergency Care Centre", "Toxicology ICU", "Extensive coagulation laboratory"],
    asvStockStatus: "High (NIH stock direct)",
    icuVentilatorAvailable: true
  },
  {
    name: "Pakistan Institute of Medical Sciences (PIMS), Islamabad",
    city: "Islamabad",
    province: "ICT / Federal",
    phone: "+92-51-9261170",
    facilities: ["Federal Tertiary Hospital", "Direct liaison with NIH Biological Production Division"],
    asvStockStatus: "High (NIH stock direct)",
    icuVentilatorAvailable: true
  },
  {
    name: "Lady Reading Hospital (LRH), Peshawar",
    city: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    phone: "+92-91-9211430",
    facilities: ["Northern Pakistan referral hub", "24/7 Emergency Intensive Care", "Trauma and Toxicology services"],
    asvStockStatus: "High (NIH stock direct)",
    icuVentilatorAvailable: true
  },
  {
    name: "Sandeman Provincial Hospital / Bolan Medical Complex (BMC), Quetta",
    city: "Quetta",
    province: "Balochistan",
    phone: "+92-81-9213010",
    facilities: ["Central Balochistan referral", "Arid species envenoming management (Echis & Pseudocerastes)"],
    asvStockStatus: "Moderate",
    icuVentilatorAvailable: true
  }
];

export const REGIONAL_EPIDEMIOLOGY_STATS = {
  annualEstimatedBitesPakistan: "40,000 - 50,000 reported envenomings",
  annualEstimatedDeathsPakistan: "1,900 - 2,500 fatal cases (mostly preventable with prompt ASV & ventilation)",
  primaryVictimDemographic: "Rural agricultural workers, farmers, cattle grazers (74% male, age 16-45 years)",
  peakTiming: "Post-monsoon (August-November) & summer harvesting; nocturnal bites indoors by Kraits",
  majorEnvenomationSpeciesRatio: {
    sawScaledViper: "42% (dominant in Tharparkar, Lasbela, Cholistan)",
    russellsViper: "28% (dominant in agricultural river plains of Punjab & central Sindh)",
    commonAndSindhKrait: "18% (dominant cause of nocturnal fatal respiratory arrest)",
    cobras: "12% (agricultural day bites with marked local tissue necrosis)"
  }
};
