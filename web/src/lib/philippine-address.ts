/**
 * Cascading Philippine address data and helpers.
 * Matched 1:1 with the BlueWaste mobile application.
 */

export const OTHER_PUROK_OPTION = "Other (Specify)";

export const DEFAULT_PUROKS: readonly string[] = [
  "Purok 1",
  "Purok 2",
  "Purok 3",
  "Purok 4",
  "Purok 5",
  "Purok 6",
  "Purok 7",
  "Purok 8",
  "Purok 9",
  "Purok 10",
  "Purok Centro",
  "Purok Riverside",
  "Purok Mangga",
  "Purok Pag-asa",
  "Purok Maharlika",
  "Sitio Baybay",
  "Sitio Riverside",
  "Other (Specify)"
] as const;

export const SPECIFIC_BARANGAY_PUROKS: Record<string, readonly string[]> = {
  "Cagangohan": [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Purok 6",
    "Purok 7",
    "Purok 8",
    "Purok Centro",
    "Purok Riverside",
    "Purok Coastal",
    "Sitio Baybay",
    "Sitio Shoreline",
    "Other (Specify)"
  ],
  "San Pedro": [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Purok 6",
    "Purok 7",
    "Purok 8",
    "Purok 9",
    "Purok Centro",
    "Purok Coastal",
    "Sitio Aplaya",
    "Other (Specify)"
  ],
  "San Francisco": [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Purok 6",
    "Purok 7",
    "Purok Centro",
    "Purok Maharlika",
    "Purok Pag-asa",
    "Other (Specify)"
  ],
  "San Vicente": [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Purok 6",
    "Purok 7",
    "Purok Centro",
    "Purok Sampaguita",
    "Purok Riverside",
    "Other (Specify)"
  ],
  "J.P. Laurel": [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Purok 6",
    "Purok Centro",
    "Purok Highway",
    "Other (Specify)"
  ],
  "Tagpore": [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Purok Centro",
    "Sitio Coastal",
    "Other (Specify)"
  ]
} as const;

export const PHILIPPINE_ADDRESS_HIERARCHY: Record<string, Record<string, readonly string[]>> = {
  "Davao del Norte": {
    "Panabo City": [
      "A. O. Floirendo",
      "Buenavista",
      "Cacao",
      "Cagangohan",
      "Consorcion",
      "Dapco",
      "Datu Abdul Dadia",
      "Gredu (Poblacion)",
      "J.P. Laurel",
      "Kasilak",
      "Katipunan",
      "Katualan",
      "Kiotoy",
      "Little Panay",
      "Lower Panaga",
      "Mabunao",
      "Maduao",
      "Malativas",
      "Manay",
      "Nanyo",
      "New Malaga",
      "New Pandan (Poblacion)",
      "New Visayas",
      "Quezon",
      "Salvacion",
      "San Francisco (Poblacion)",
      "San Nicolas",
      "San Pedro",
      "San Roque",
      "San Vicente",
      "Santa Cruz",
      "Santo Niño (Poblacion)",
      "Sindaton",
      "Southern Davao",
      "Tagpore",
      "Tibungol",
      "Upper Licanan",
      "Waterfall"
    ],
    "Tagum City": [
      "Apokon",
      "Bincungan",
      "Busaon",
      "Canocotan",
      "Cuambogan",
      "La Filipina",
      "Liboganon",
      "Magdum",
      "Mankilam",
      "New Balamban",
      "Nueva Fuerza",
      "Pagsabangan",
      "Pandapan",
      "San Agustin",
      "San Miguel (Poblacion)",
      "San Isidro",
      "Visayan Village"
    ],
    "Island Garden City of Samal": [
      "Babak (Poblacion)",
      "Peñaplata (Poblacion)",
      "Kaputian (Poblacion)",
      "Adecor",
      "Anonang",
      "Balet",
      "Caliclic",
      "Camudmud",
      "Cawag",
      "Dadatan",
      "Kinawitnon",
      "Libertad",
      "Limao",
      "Pangubatan",
      "San Jose",
      "Tagbitan-ag",
      "Tambun",
      "Toril"
    ],
    "Carmen": [
      "Alejal",
      "Anibongan",
      "Asuncion (Poblacion)",
      "Cogon",
      "Ising (Poblacion)",
      "Mabaus",
      "Magsaysay",
      "Mangalcal",
      "New Camiling",
      "Salvacion",
      "San Isidro",
      "Santo Niño",
      "Taba",
      "Tibulao",
      "Tubod",
      "Tuganay"
    ],
    "Braulio E. Dujali": [
      "Cabay-Angan",
      "Dujali (Poblacion)",
      "Magupising",
      "New Casay",
      "Tanglaw"
    ],
    "Santo Tomas": [
      "Balagunan",
      "Bobongan",
      "Casig-Ang",
      "Esperanza",
      "Kimamon",
      "Kinamayan",
      "La Libertad",
      "Lunga-og",
      "Magwawa",
      "New Katipunan",
      "New Visayas",
      "Pantukan",
      "Salvacion",
      "San Jose",
      "San Miguel",
      "San Vicente",
      "Talomo",
      "Tibalahon",
      "Tulalian"
    ],
    "Kapalong": [
      "Capungagan",
      "Florida",
      "Gupitan",
      "Katipunan",
      "Luna",
      "Mabantao",
      "Mamangan",
      "Maniki (Poblacion)",
      "Pag-asa",
      "Semong",
      "Sua-on",
      "Tibiawan"
    ],
    "Asuncion": [
      "Binancian",
      "Buan",
      "Buclad",
      "Cabaywa",
      "Camansa",
      "Camuning",
      "Canatan",
      "Concepcion",
      "Doña Andrea",
      "Magatos",
      "Napungas",
      "New Bantayan",
      "New Santiago",
      "Pamacaun",
      "Sagayen",
      "San Vicente",
      "Santa Filomena",
      "Sonlon"
    ],
    "New Corella": [
      "Cabidianan",
      "Carcor",
      "Del Monte",
      "Del Pilar",
      "El Salvador",
      "Limba-an",
      "Macgum",
      "Mambing",
      "Mesaoy",
      "New Bohol",
      "New Cortez",
      "New Sambog",
      "Patrocino",
      "Poblacion",
      "San Francisco",
      "San Jose",
      "San Roque",
      "Santa Cruz",
      "Santa Fe",
      "Santo Niño",
      "Suawon"
    ],
    "San Isidro": [
      "Datu Balong",
      "Igangon",
      "Kipalili",
      "Libuton",
      "Linao",
      "Mamangan",
      "Monte Dujali",
      "Pinamuno",
      "Sabangan",
      "San Miguel",
      "Santo Niño",
      "Sawata (Poblacion)"
    ],
    "Talaingod": [
      "Dagohoy",
      "Palma Gil",
      "Santo Niño (Poblacion)"
    ]
  },
  "Davao del Sur": {
    "Davao City": [
      "Agdao (Poblacion)",
      "Bucana",
      "Buhangin (Poblacion)",
      "Bunawan (Poblacion)",
      "Cabantian",
      "Calinan (Poblacion)",
      "Catalunan Grande",
      "Catalunan Pequeño",
      "Ilang",
      "Maa",
      "Matina Aplaya",
      "Matina Crossing",
      "Mintal",
      "Panacan",
      "Poblacion District",
      "Sasa",
      "Talomo (Poblacion)",
      "Tibungco",
      "Toril (Poblacion)",
      "Tugbok (Poblacion)"
    ],
    "Digos City": [
      "Aplaya",
      "Balabag",
      "Cogon",
      "Colorado",
      "Dulangan",
      "Kapatagan",
      "Luna",
      "Mahayahay",
      "Matti",
      "Rizal",
      "San Agustin",
      "San Jose",
      "San Miguel",
      "San Roque",
      "Sinawilan",
      "Soong",
      "Zone 1 (Poblacion)",
      "Zone 2 (Poblacion)",
      "Zone 3 (Poblacion)"
    ],
    "Santa Cruz": [
      "Astorga",
      "Bato",
      "Coronon",
      "Darong",
      "Inawayan",
      "Poblacion",
      "Saliducon",
      "Sibulan",
      "Sinuron",
      "Tagabuli",
      "Tuban",
      "Zone 1",
      "Zone 2",
      "Zone 3",
      "Zone 4"
    ],
    "Bansalan": [
      "Anonang",
      "Bitaug",
      "Bonifacio",
      "Dolo",
      "Eman",
      "Kinuskusan",
      "Libertad",
      "Linawan",
      "Mabunga",
      "Managa",
      "Marber",
      "New Clarin",
      "Poblacion",
      "Rizal",
      "Santo Niño",
      "Tinongtongan",
      "Tubod",
      "Union"
    ],
    "Hagonoy": [
      "Aplaya",
      "Balutakay",
      "Claveria",
      "Guihing",
      "Hagonoy Crossing",
      "Kibuaya",
      "La Union",
      "Malabang",
      "Malihao",
      "Poblacion",
      "Sacub",
      "San Guillermo",
      "San Isidro",
      "Sinayawan",
      "Tologan"
    ]
  },
  "Davao de Oro": {
    "Nabunturan": [
      "Anislagan",
      "Antequera",
      "Basak",
      "Cabacungan",
      "Cabidianan",
      "Katipunan",
      "Libasan",
      "Linda",
      "Magading",
      "Magsaysay",
      "Mainit",
      "Manat",
      "Matilo",
      "Mipangi",
      "New Dauis",
      "New Sibonga",
      "Ogao",
      "Pangutosan",
      "Poblacion",
      "San Isidro",
      "San Roque",
      "San Vicente",
      "Santa Maria",
      "Santo Niño",
      "Sasa",
      "Tagnocon",
      "Tapia",
      "Tuboran"
    ],
    "Monkayo": [
      "Awao",
      "Babag",
      "Banlag",
      "Baylo",
      "Casoon",
      "Inambatan",
      "Macopa",
      "Mamunga",
      "Mount Diwata",
      "Naboc",
      "Olaycon",
      "Pasian",
      "Poblacion",
      "Rizal",
      "Salvacion",
      "San Isidro",
      "San Jose",
      "Tubuan",
      "Union"
    ],
    "Compostela": [
      "Bagongon",
      "Gabi",
      "Lagab",
      "Mangayon",
      "Mapaca",
      "Maparat",
      "New Alegria",
      "Ngan",
      "Osmeña",
      "Panansalan",
      "Poblacion",
      "San Jose",
      "San Miguel",
      "Siocon",
      "Tamia"
    ],
    "Pantukan": [
      "Bongabong",
      "Bongbong",
      "Fuentes",
      "Kingking (Poblacion)",
      "Las Arenas",
      "Magnaga",
      "Matiao",
      "Napnapan",
      "Panganason",
      "Tagdangua",
      "Tambongon",
      "Tibagon",
      "Araibo"
    ]
  },
  "Davao Oriental": {
    "Mati City": [
      "Badas",
      "Bobon",
      "Buso",
      "Cabuaya",
      "Central (Poblacion)",
      "Culian",
      "Dahican",
      "Danao",
      "Dukduken",
      "Lantawan",
      "Libudon",
      "Luban",
      "Macambol",
      "Mamali",
      "Matiao",
      "Mayo",
      "Sainz",
      "Sanghay",
      "Tagabakid",
      "Tagbinonga",
      "Taguibo",
      "Tamisan"
    ],
    "Lupon": [
      "Bagumbayan",
      "Cabadiangan",
      "Calubihan",
      "Corporacion",
      "Don Mariano Marcos",
      "Ilangay",
      "Lantawan",
      "Limbahan",
      "Macangao",
      "Magsaysay",
      "Mahayahay",
      "Maragatas",
      "Marayag",
      "New Visayas",
      "Poblacion",
      "San Isidro",
      "Tagboa"
    ]
  },
  "Davao Occidental": {
    "Malita": [
      "Bito",
      "Bolia",
      "Buhangin",
      "Culaman",
      "Datu Danwata",
      "Demoloc",
      "Felis",
      "Fishing Village",
      "Kibalatong",
      "Kidalapong",
      "Kilalag",
      "Kinangan",
      "Lacaron",
      "Lagumit",
      "Lais",
      "Little Baguio",
      "Macol",
      "Mana",
      "Manuel Roxas",
      "New Argao",
      "Pangaleon",
      "Pangian",
      "Poblacion",
      "Sangay",
      "Talogoy",
      "Ticala",
      "Tubalan"
    ],
    "Santa Maria": [
      "Basiawan",
      "Bito",
      "Cadaatan",
      "Datu Daligasao",
      "Datu Intan",
      "Kidadman",
      "Kinangao",
      "Malalag Tubig",
      "Mamacao",
      "Ogbon",
      "Poblacion",
      "Pongpong",
      "San Agustin",
      "San Antonio",
      "San Isidro",
      "San Pedro",
      "San Roque",
      "Tanglad",
      "Santo Rosario"
    ]
  },
  "Metro Manila": {
    "Manila": [
      "Binondo",
      "Ermita",
      "Intramuros",
      "Malate",
      "Paco",
      "Pandacan",
      "Port Area",
      "Quiapo",
      "Sampaloc",
      "San Andres",
      "San Miguel",
      "San Nicolas",
      "Santa Ana",
      "Santa Cruz",
      "Santa Mesa",
      "Tondo"
    ],
    "Quezon City": [
      "Bagong Pag-asa",
      "Batasan Hills",
      "Commonwealth",
      "Culiat",
      "Diliman",
      "Holy Spirit",
      "Kamuning",
      "Loyola Heights",
      "Matandang Balara",
      "Novaliches Proper",
      "Pinyahan",
      "Project 6",
      "Roxas",
      "San Bartolome",
      "Socorro (Cubao)",
      "Tandang Sora",
      "Teachers Village",
      "Ugong Norte"
    ],
    "Makati": [
      "Bel-Air",
      "Carmona",
      "Dasmarinas",
      "Forbes Park",
      "Guadalupe Nuevo",
      "Guadalupe Viejo",
      "Kasilawan",
      "La Paz",
      "Magallanes",
      "Olympia",
      "Palanan",
      "Pembo",
      "Pio del Pilar",
      "Poblacion",
      "San Antonio",
      "San Lorenzo",
      "Tejeros",
      "Urdaneta",
      "Valenzuela"
    ],
    "Taguig": [
      "Bagumbayan",
      "Bambang",
      "Calzada",
      "Central Bicutan",
      "Fort Bonifacio (BGC)",
      "Hagonoy",
      "Ibayo-Tipas",
      "Ligid-Tipas",
      "Lower Bicutan",
      "Maharlika Village",
      "Napindan",
      "Palingon",
      "Pinagsama",
      "San Miguel",
      "Santa Ana",
      "Signal Village",
      "Tuktukan",
      "Upper Bicutan",
      "Ususan",
      "Western Bicutan"
    ],
    "Pasig": [
      "Bagong Ilog",
      "Bagong Katipunan",
      "Bambang",
      "Caniogan",
      "Kapitolyo",
      "Malinao",
      "Manggahan",
      "Maybunga",
      "Oranbo",
      "Palatiw",
      "Pinagbuhatan",
      "Pineda",
      "Rosario",
      "Sagad",
      "San Antonio",
      "San Joaquin",
      "San Nicolas",
      "Santa Cruz",
      "Santa Lucia",
      "Santa Rosa",
      "Santolan",
      "Sumilang",
      "Ugong"
    ]
  },
  "Cebu": {
    "Cebu City": [
      "Apas",
      "Banilad",
      "Basak San Nicolas",
      "Guadalupe",
      "Inayawan",
      "Kasambagan",
      "Lahug",
      "Mabolo",
      "Pardo",
      "Poblacion",
      "Punta Princesa",
      "Sambag I",
      "Sambag II",
      "San Antonio",
      "San Jose",
      "San Roque",
      "Talamban",
      "Tejero",
      "Tinago",
      "Zapatera"
    ],
    "Mandaue City": [
      "Alang-alang",
      "Bakilid",
      "Banilad",
      "Basak",
      "Cabancalan",
      "Cambaro",
      "Canduman",
      "Casuntingan",
      "Centro (Poblacion)",
      "Guizo",
      "Ibabao-Estancia",
      "Jagobiao",
      "Labogon",
      "Looc",
      "Maguikay",
      "Mantuyong",
      "Opao",
      "Pakna-an",
      "Pagsabungan",
      "Subangdaku",
      "Tabok",
      "Tawason",
      "Tingub",
      "Tipolo",
      "Umapad"
    ],
    "Lapu-Lapu City": [
      "Agus",
      "Babag",
      "Bankal",
      "Basak",
      "Buaya",
      "Calawisan",
      "Canjulao",
      "Gun-ob",
      "Ibo",
      "Looc",
      "Mactan",
      "Maribago",
      "Marigondon",
      "Pajac",
      "Pajo",
      "Poblacion",
      "Punta Engaño",
      "Pusok",
      "Sabang",
      "Santa Rosa",
      "Subabasbas"
    ]
  }
} as const;

export function getProvinces(): string[] {
  return Object.keys(PHILIPPINE_ADDRESS_HIERARCHY).sort();
}

export function getCities(province?: string | null): string[] {
  if (!province || !PHILIPPINE_ADDRESS_HIERARCHY[province]) return [];
  return Object.keys(PHILIPPINE_ADDRESS_HIERARCHY[province]).sort();
}

export function getBarangays(province?: string | null, city?: string | null): string[] {
  if (!province || !city || !PHILIPPINE_ADDRESS_HIERARCHY[province]?.[city]) return [];
  return [...PHILIPPINE_ADDRESS_HIERARCHY[province][city]].sort();
}

export function getPuroks(
  province?: string | null,
  city?: string | null,
  barangay?: string | null
): string[] {
  if (!barangay) return [];
  const cleanBarangay = barangay.replace(/^Barangay\s+/i, "").replace(/^Brgy\.?\s+/i, "").trim();
  const baseName = cleanBarangay.replace(/\s*\(Poblacion\)$/i, "").trim();

  const customList =
    SPECIFIC_BARANGAY_PUROKS[cleanBarangay] ||
    SPECIFIC_BARANGAY_PUROKS[baseName] ||
    SPECIFIC_BARANGAY_PUROKS[barangay];

  if (customList && customList.length > 0) {
    return [...customList];
  }

  return [...DEFAULT_PUROKS];
}

export function formatAddress({
  province,
  city,
  barangay,
  purok,
}: {
  province?: string | null;
  city?: string | null;
  barangay?: string | null;
  purok?: string | null;
}): string {
  const parts: string[] = [];

  const cleanPurok = purok?.trim() ?? "";
  if (cleanPurok) {
    parts.push(cleanPurok);
  }

  const cleanBarangay = barangay?.trim() ?? "";
  if (cleanBarangay) {
    const lower = cleanBarangay.toLowerCase();
    if (lower.startsWith("barangay ") || lower.startsWith("brgy.") || lower.startsWith("brgy ")) {
      parts.push(cleanBarangay);
    } else {
      parts.push(`Barangay ${cleanBarangay}`);
    }
  }

  const cleanCity = city?.trim() ?? "";
  if (cleanCity) {
    parts.push(cleanCity);
  }

  const cleanProvince = province?.trim() ?? "";
  if (cleanProvince) {
    parts.push(cleanProvince);
  }

  return parts.join(", ");
}
