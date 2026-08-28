export type MarketItem = {
  id: string;
  nameRo: string;
  nameEn: string;
  status: "peak" | "good" | "starting" | "ending";
  priceRonPerKg: number;
  unit: "kg" | "legătură" | "buc";
  priceHintRo: string;
  priceHintEn: string;
  months: number[]; // 0 = Jan, 11 = Dec
  cooksWith: string[];
};

export const MONTH_NAMES_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
];

export const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const ALL_SEASONAL_PRODUCE: MarketItem[] = [
  // PRIMĂVARĂ (Martie - Mai)
  {
    id: "urzici",
    nameRo: "Urzici proaspete",
    nameEn: "Fresh nettles",
    status: "peak",
    priceRonPerKg: 6,
    unit: "kg",
    priceHintRo: "~6 RON/puncă · detox de primăvară",
    priceHintEn: "~6 RON/pack · spring detox",
    months: [2, 3], // Mar, Apr
    cooksWith: ["mancare-urzici", "ciorba-legume"],
  },
  {
    id: "ridichi",
    nameRo: "Ridichi roșii de lună",
    nameEn: "Red radishes",
    status: "peak",
    priceRonPerKg: 2.5,
    unit: "legătură",
    priceHintRo: "~2.5 RON/legătură · proaspete la piață",
    priceHintEn: "~2.5 RON/bunch · fresh at market",
    months: [2, 3, 4], // Mar - May
    cooksWith: ["salata-ton"],
  },
  {
    id: "ceapa-verde",
    nameRo: "Ceapă & usturoi verde",
    nameEn: "Green onion & garlic",
    status: "peak",
    priceRonPerKg: 2,
    unit: "legătură",
    priceHintRo: "~2 RON/legătură · trufandale românești",
    priceHintEn: "~2 RON/bunch · fresh spring green",
    months: [2, 3, 4], // Mar - May
    cooksWith: ["omleta-romaneasca", "salata-ton"],
  },
  {
    id: "capsuni",
    nameRo: "Căpșuni de Satu Mare / Giurgiu",
    nameEn: "Fresh Romanian strawberries",
    status: "peak",
    priceRonPerKg: 10,
    unit: "kg",
    priceHintRo: "~10-12 RON/kg · parfumate & dulci",
    priceHintEn: "~10-12 RON/kg · sweet local strawberries",
    months: [4, 5], // May, Jun
    cooksWith: ["ovaz-proteic"],
  },
  {
    id: "cirese",
    nameRo: "Cireșe de mai",
    nameEn: "May cherries",
    status: "peak",
    priceRonPerKg: 14,
    unit: "kg",
    priceHintRo: "~14 RON/kg · primele soiuri românești",
    priceHintEn: "~14 RON/kg · first Romanian cherries",
    months: [4, 5], // May, Jun
    cooksWith: [],
  },

  // VARĂ (Iunie - August)
  {
    id: "rosii",
    nameRo: "Roșii de câmp (Grădină)",
    nameEn: "Garden tomatoes",
    status: "peak",
    priceRonPerKg: 4.5,
    unit: "kg",
    priceHintRo: "~4.50 RON/kg · gustoase & zemoase",
    priceHintEn: "~4.50 RON/kg · sweet field tomatoes",
    months: [5, 6, 7, 8], // Jun - Sep
    cooksWith: ["ciorba-legume", "salata-ton", "omleta-romaneasca"],
  },
  {
    id: "ardei",
    nameRo: "Ardei grași & Kapia",
    nameEn: "Bell peppers & Kapia",
    status: "peak",
    priceRonPerKg: 5.5,
    unit: "kg",
    priceHintRo: "~5.50 RON/kg · sezon maxim la piață",
    priceHintEn: "~5.50 RON/kg · peak market season",
    months: [6, 7, 8, 9], // Jul - Oct
    cooksWith: ["ciorba-legume", "ghiveci-legume"],
  },
  {
    id: "vinete",
    nameRo: "Vinete de grădină",
    nameEn: "Fresh eggplants",
    status: "peak",
    priceRonPerKg: 4.0,
    unit: "kg",
    priceHintRo: "~4.00 RON/kg · ideale pentru zacuscă",
    priceHintEn: "~4.00 RON/kg · ideal for zacuscă",
    months: [6, 7, 8, 9], // Jul - Oct
    cooksWith: ["salata-vinete"],
  },
  {
    id: "dovlecei",
    nameRo: "Dovlecei de vară",
    nameEn: "Summer zucchini",
    status: "peak",
    priceRonPerKg: 3.5,
    unit: "kg",
    priceHintRo: "~3.50 RON/kg · preț foarte mic",
    priceHintEn: "~3.50 RON/kg · very cheap",
    months: [5, 6, 7, 8], // Jun - Sep
    cooksWith: ["ciorba-legume"],
  },
  {
    id: "pepene",
    nameRo: "Pepene verde (Lubiță)",
    nameEn: "Watermelon",
    status: "peak",
    priceRonPerKg: 2.2,
    unit: "kg",
    priceHintRo: "~2.20 RON/kg · de Dăbuleni",
    priceHintEn: "~2.20 RON/kg · sweet local watermelon",
    months: [6, 7, 8], // Jul - Sep
    cooksWith: [],
  },
  {
    id: "porumb",
    nameRo: "Porumb dulce / de fiert",
    nameEn: "Sweet corn",
    status: "peak",
    priceRonPerKg: 2.0,
    unit: "buc",
    priceHintRo: "~2.00 RON/știulete · proaspăt cules",
    priceHintEn: "~2.00 RON/ear · fresh harvested",
    months: [6, 7, 8], // Jul - Sep
    cooksWith: [],
  },

  // TOAMNĂ (Septembrie - Noiembrie)
  {
    id: "struguri",
    nameRo: "Struguri românești (Hamburg/Moldova)",
    nameEn: "Romanian grapes",
    status: "peak",
    priceRonPerKg: 7.0,
    unit: "kg",
    priceHintRo: "~7.00 RON/kg · recolectă toamnă",
    priceHintEn: "~7.00 RON/kg · autumn harvest",
    months: [8, 9, 10], // Sep - Nov
    cooksWith: [],
  },
  {
    id: "mere",
    nameRo: "Mere de Voinești / Fălticeni",
    nameEn: "Local apples",
    status: "peak",
    priceRonPerKg: 3.8,
    unit: "kg",
    priceHintRo: "~3.80 RON/kg · crocante & dulci",
    priceHintEn: "~3.80 RON/kg · crisp local apples",
    months: [8, 9, 10, 11, 0, 1], // Sep - Feb
    cooksWith: ["ovaz-proteic"],
  },
  {
    id: "varza-alba",
    nameRo: "Varză albă de toamnă",
    nameEn: "Autumn cabbage",
    status: "peak",
    priceRonPerKg: 2.5,
    unit: "kg",
    priceHintRo: "~2.50 RON/kg · ideală de pus la murat",
    priceHintEn: "~2.50 RON/kg · ideal for pickling",
    months: [8, 9, 10, 11], // Sep - Dec
    cooksWith: ["salata-varza", "sarmale-light"],
  },
  {
    id: "dovleac",
    nameRo: "Dovleac plăcintar",
    nameEn: "Baking pumpkin",
    status: "peak",
    priceRonPerKg: 3.0,
    unit: "kg",
    priceHintRo: "~3.00 RON/kg · aromat & bogat în fibre",
    priceHintEn: "~3.00 RON/kg · aromatic & rich in fiber",
    months: [8, 9, 10, 11], // Sep - Dec
    cooksWith: [],
  },
  {
    id: "gutui",
    nameRo: "Gutui parfumate",
    nameEn: "Fresh quinces",
    status: "peak",
    priceRonPerKg: 6.5,
    unit: "kg",
    priceHintRo: "~6.50 RON/kg · de sezon toamnă",
    priceHintEn: "~6.50 RON/kg · fall harvest",
    months: [9, 10, 11], // Oct - Dec
    cooksWith: [],
  },

  // IARNĂ (Decembrie - Februarie)
  {
    id: "muraturi",
    nameRo: "Gogonele & Varză acră",
    nameEn: "Pickled vegetables & sauerkraut",
    status: "peak",
    priceRonPerKg: 5.0,
    unit: "kg",
    priceHintRo: "~5.00 RON/kg · probiotice naturale",
    priceHintEn: "~5.00 RON/kg · natural probiotics",
    months: [11, 0, 1, 2], // Dec - Mar
    cooksWith: ["fasole-light", "sarmale-light"],
  },
  {
    id: "sfecla",
    nameRo: "Sfeclă roșie de depozit",
    nameEn: "Red beetroot",
    status: "good",
    priceRonPerKg: 3.2,
    unit: "kg",
    priceHintRo: "~3.20 RON/kg · ieftină & hrănitoare",
    priceHintEn: "~3.20 RON/kg · cheap & nutritious",
    months: [10, 11, 0, 1, 2], // Nov - Mar
    cooksWith: ["salata-sfecla"],
  },
  {
    id: "citrice",
    nameRo: "Clementine & Portocale de iarnă",
    nameEn: "Winter clementines & oranges",
    status: "peak",
    priceRonPerKg: 5.5,
    unit: "kg",
    priceHintRo: "~5.50 RON/kg · import direct, preț minim",
    priceHintEn: "~5.50 RON/kg · peak import season",
    months: [11, 0, 1], // Dec - Feb
    cooksWith: [],
  },
];

export function getMarketItemsForMonth(monthIndex: number): MarketItem[] {
  return ALL_SEASONAL_PRODUCE.filter((item) => item.months.includes(monthIndex));
}
