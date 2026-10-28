export interface WaecCatalogSubject {
  code: string;
  name: string;
  category: 'core' | 'science' | 'arts' | 'commercial' | 'trade';
  description: string;
}

export const WAEC_COMPULSORY_SUBJECTS: WaecCatalogSubject[] = [
  {
    code: 'ENG-302',
    name: 'English Language',
    category: 'core',
    description: 'Compulsory Core: Lexis & Structure, Essay Writing, Comprehension, Summary & Oral English (Test of Orals).'
  },
  {
    code: 'MTH-402',
    name: 'General Mathematics',
    category: 'core',
    description: 'Compulsory Core: Number & Numeration, Algebraic Processes, Mensuration, Geometry, Trigonometry & Statistics.'
  },
  {
    code: 'CIV-216',
    name: 'Civic Education',
    category: 'core',
    description: 'Compulsory Core: National Values, Citizenship, Democracy, Human Rights, Rule of Law & Public Service.'
  }
];

export const WAEC_ELECTIVE_SUBJECTS: WaecCatalogSubject[] = [
  {
    code: 'PHY-512',
    name: 'Physics',
    category: 'science',
    description: 'Mechanics, Optics, Waves, Electricity & Magnetism, Atomic & Nuclear Physics (Theory & Practical).'
  },
  {
    code: 'CHM-505',
    name: 'Chemistry',
    category: 'science',
    description: 'Physical, Inorganic & Organic Chemistry, Stoichiometry & Qualitative/Volumetric Analysis.'
  },
  {
    code: 'BIO-504',
    name: 'Biology',
    category: 'science',
    description: 'Cell Biology, Ecology, Genetics, Evolution, Plant & Animal Physiology (Theory & Practical).'
  },
  {
    code: 'FMT-401',
    name: 'Further Mathematics',
    category: 'science',
    description: 'Advanced Pure Mathematics, Calculus, Vectors, Matrices, Mechanics & Probability.'
  },
  {
    code: 'AGR-502',
    name: 'Agricultural Science',
    category: 'science',
    description: 'Crop Production, Soil Science, Animal Husbandry, Agricultural Economics & Extension.'
  },
  {
    code: 'GEO-205',
    name: 'Geography',
    category: 'science',
    description: 'Physical & Human Geography, Map Reading, GIS, Regional Geography of Nigeria & Africa.'
  },
  {
    code: 'TDR-608',
    name: 'Technical Drawing',
    category: 'science',
    description: 'Geometrical Construction, Orthographic & Isometric Projection, Building & Engineering Drawing.'
  },
  {
    code: 'CSC-702',
    name: 'Computer Studies',
    category: 'science',
    description: 'Computer Hardware, Software Systems, Programming Logic, Networking & ICT Ethics.'
  },
  {
    code: 'LIT-210',
    name: 'Literature-in-English',
    category: 'arts',
    description: 'African & Non-African Prose, Drama, Poetry, Unseen Prose/Poetry & William Shakespeare.'
  },
  {
    code: 'GOV-207',
    name: 'Government',
    category: 'arts',
    description: 'Elements of Government, Political Development in Nigeria, Foreign Policy & International Organizations.'
  },
  {
    code: 'CRS-202',
    name: 'Christian Religious Studies',
    category: 'arts',
    description: 'Sovereignty of God, Leadership in Israel, Synoptic Gospels & Selected Epistles.'
  },
  {
    code: 'IRS-208',
    name: 'Islamic Religious Studies',
    category: 'arts',
    description: 'Qur\'an, Hadith, Tawhid, Fiqh & Islamic History and Civilization.'
  },
  {
    code: 'HIS-209',
    name: 'History',
    category: 'arts',
    description: 'History of Nigeria from Earliest Times to Present & West African / Continental History.'
  },
  {
    code: 'YOR-327',
    name: 'Yoruba Language',
    category: 'arts',
    description: 'Ede, Asa ati Litireso Yoruba (Grammar, Culture, Phonology & Oral/Written Literature).'
  },
  {
    code: 'FRE-304',
    name: 'French',
    category: 'arts',
    description: 'French Language Comprehension, Grammar, Composition & Oral Communication.'
  },
  {
    code: 'VSA-601',
    name: 'Visual Art',
    category: 'arts',
    description: 'Drawing, Painting, Graphics, Textiles, Ceramics & Art History.'
  },
  {
    code: 'ECO-203',
    name: 'Economics',
    category: 'commercial',
    description: 'Microeconomics, Macroeconomics, National Income, Money & Banking, Public Finance & International Trade.'
  },
  {
    code: 'ACC-104',
    name: 'Financial Accounting',
    category: 'commercial',
    description: 'Double Entry Bookkeeping, Final Accounts, Partnership, Company Accounts & Public Sector Accounting.'
  },
  {
    code: 'COM-103',
    name: 'Commerce',
    category: 'commercial',
    description: 'Trade, Business Units, Banking, Insurance, Transport, Warehousing & Marketing Principles.'
  },
  {
    code: 'OFP-108',
    name: 'Office Practice',
    category: 'commercial',
    description: 'Office Administration, Filing Systems, Business Correspondence & Modern Office Equipment.'
  },
  {
    code: 'DPR-815',
    name: 'Data Processing',
    category: 'trade',
    description: 'Information Processing, Database Management Systems, Spreadsheets, Web Design & Computer Maintenance.'
  },
  {
    code: 'MKT-821',
    name: 'Marketing',
    category: 'trade',
    description: 'Consumer Behaviour, Distribution Channels, Advertising, Merchandising & Entrepreneurship.'
  },
  {
    code: 'CAT-806',
    name: 'Catering Craft Practice',
    category: 'trade',
    description: 'Culinary Arts, Food & Beverage Service, Hospitality Operations & Kitchen Safety.'
  },
  {
    code: 'GAR-812',
    name: 'Garment Making',
    category: 'trade',
    description: 'Pattern Drafting, Textile Selection, Sewing Machine Operations & Fashion Entrepreneurship.'
  },
  {
    code: 'BKP-804',
    name: 'Bookkeeping',
    category: 'trade',
    description: 'Subsidiary Books, Ledger Accounts, Trial Balance, Cash Book & Petty Cash Management.'
  },
  {
    code: 'ANM-802',
    name: 'Animal Husbandry',
    category: 'trade',
    description: 'Livestock Management, Poultry Production, Animal Nutrition, Health & Farm Records.'
  }
];

export const ALL_WAEC_SUBJECTS: WaecCatalogSubject[] = [
  ...WAEC_COMPULSORY_SUBJECTS,
  ...WAEC_ELECTIVE_SUBJECTS
];

export const DEPARTMENT_RECOMMENDED_SUBJECTS: Record<'Science' | 'Arts' | 'Commercial', string[]> = {
  Science: [
    'English Language',
    'General Mathematics',
    'Civic Education',
    'Physics',
    'Chemistry',
    'Biology',
    'Further Mathematics',
    'Agricultural Science',
    'Data Processing'
  ],
  Arts: [
    'English Language',
    'General Mathematics',
    'Civic Education',
    'Literature-in-English',
    'Government',
    'Christian Religious Studies',
    'Economics',
    'Yoruba Language',
    'Data Processing'
  ],
  Commercial: [
    'English Language',
    'General Mathematics',
    'Civic Education',
    'Economics',
    'Financial Accounting',
    'Commerce',
    'Government',
    'Marketing',
    'Data Processing'
  ]
};

export const WAEC_DEPARTMENT_RECOMMENDATIONS = DEPARTMENT_RECOMMENDED_SUBJECTS;
