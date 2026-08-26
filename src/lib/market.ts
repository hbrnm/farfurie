export type MarketStatus = "peak" | "good" | "ending";

export type MarketItem = {
  id: string;
  nameRo: string;
  nameEn: string;
  status: MarketStatus;
  priceHintRo: string;
  priceHintEn: string;
  cooksWith: string[];
};

type Produce = Omit<MarketItem, "status"> & {
  season: Partial<Record<number, MarketStatus>>;
};

const produce: Produce[] = [
  {
    id: "citrice",
    nameRo: "Portocale și mandarine",
    nameEn: "Oranges and mandarins",
    priceHintRo: "sezon de import, preț bun",
    priceHintEn: "import season, fair price",
    cooksWith: [],
    season: { 1: "peak", 2: "peak", 3: "good", 11: "good", 12: "peak" },
  },
  {
    id: "mere-iarna",
    nameRo: "Mere de păstrare",
    nameEn: "Storage apples",
    priceHintRo: "din depozite locale",
    priceHintEn: "from local storage",
    cooksWith: ["ovaz-napolact"],
    season: { 1: "good", 2: "good", 3: "ending", 9: "good", 10: "peak", 11: "peak", 12: "good" },
  },
  {
    id: "varza",
    nameRo: "Varză",
    nameEn: "Cabbage",
    priceHintRo: "ieftină tot anul rece",
    priceHintEn: "cheap through the cold months",
    cooksWith: ["sarmale-light", "ciorba-legume"],
    season: { 1: "peak", 2: "good", 3: "good", 10: "peak", 11: "peak", 12: "peak" },
  },
  {
    id: "spanac",
    nameRo: "Spanac",
    nameEn: "Spinach",
    priceHintRo: "primăvară și toamnă",
    priceHintEn: "spring and autumn",
    cooksWith: ["omleta-telemea"],
    season: { 3: "peak", 4: "peak", 5: "good", 9: "good", 10: "peak" },
  },
  {
    id: "ceapa-verde",
    nameRo: "Ceapă verde",
    nameEn: "Spring onions",
    priceHintRo: "primele legume de grădină",
    priceHintEn: "first garden greens",
    cooksWith: ["omleta-telemea"],
    season: { 3: "good", 4: "peak", 5: "peak", 6: "ending" },
  },
  {
    id: "ridichi",
    nameRo: "Ridichi",
    nameEn: "Radishes",
    priceHintRo: "ieftine în aprilie–mai",
    priceHintEn: "cheap in April–May",
    cooksWith: ["salata-ton"],
    season: { 4: "peak", 5: "peak", 6: "good" },
  },
  {
    id: "capsuni",
    nameRo: "Căpșuni",
    nameEn: "Strawberries",
    priceHintRo: "vârf de sezon în mai",
    priceHintEn: "peak in May",
    cooksWith: ["ovaz-napolact"],
    season: { 5: "peak", 6: "good", 7: "ending" },
  },
  {
    id: "cirese",
    nameRo: "Cireșe",
    nameEn: "Cherries",
    priceHintRo: "iunie, piețe din țară",
    priceHintEn: "June, domestic markets",
    cooksWith: [],
    season: { 6: "peak", 7: "good" },
  },
  {
    id: "cartofi-noi",
    nameRo: "Cartofi noi",
    nameEn: "New potatoes",
    priceHintRo: "încep să scadă prețul",
    priceHintEn: "price starts dropping",
    cooksWith: [],
    season: { 6: "good", 7: "peak", 8: "good" },
  },
  {
    id: "rosii",
    nameRo: "Roșii de câmp",
    nameEn: "Field tomatoes",
    priceHintRo: "ieftine la piață",
    priceHintEn: "cheap at the market",
    cooksWith: ["ciorba-legume", "salata-ton"],
    season: { 7: "good", 8: "peak", 9: "peak", 10: "ending" },
  },
  {
    id: "ardei",
    nameRo: "Ardei grași",
    nameEn: "Bell peppers",
    priceHintRo: "sezon maxim",
    priceHintEn: "peak season",
    cooksWith: ["ciorba-legume"],
    season: { 7: "good", 8: "peak", 9: "peak", 10: "ending" },
  },
  {
    id: "vinete",
    nameRo: "Vinete",
    nameEn: "Eggplants",
    priceHintRo: "ideal pentru zacuscă",
    priceHintEn: "ideal for zacuscă",
    cooksWith: [],
    season: { 7: "good", 8: "peak", 9: "peak" },
  },
  {
    id: "dovlecei",
    nameRo: "Dovlecei",
    nameEn: "Zucchini",
    priceHintRo: "preț bun",
    priceHintEn: "good price",
    cooksWith: ["ciorba-legume"],
    season: { 6: "good", 7: "peak", 8: "good", 9: "ending" },
  },
  {
    id: "mere",
    nameRo: "Mere de vară",
    nameEn: "Summer apples",
    priceHintRo: "încep să apară",
    priceHintEn: "just arriving",
    cooksWith: ["ovaz-napolact"],
    season: { 8: "good", 9: "peak" },
  },
  {
    id: "struguri",
    nameRo: "Struguri",
    nameEn: "Grapes",
    priceHintRo: "sezon românesc",
    priceHintEn: "Romanian season",
    cooksWith: [],
    season: { 8: "good", 9: "peak", 10: "ending" },
  },
  {
    id: "porumb",
    nameRo: "Porumb fiert",
    nameEn: "Corn",
    priceHintRo: "ieftin pe litoral & piață",
    priceHintEn: "cheap at markets",
    cooksWith: [],
    season: { 7: "good", 8: "peak", 9: "ending" },
  },
  {
    id: "fasole-verde",
    nameRo: "Fasole verde",
    nameEn: "Green beans",
    priceHintRo: "ultimele săptămâni",
    priceHintEn: "last weeks",
    cooksWith: ["fasole-light"],
    season: { 6: "good", 7: "peak", 8: "ending" },
  },
  {
    id: "dovleac",
    nameRo: "Dovleac",
    nameEn: "Pumpkin",
    priceHintRo: "octombrie–noiembrie",
    priceHintEn: "October–November",
    cooksWith: [],
    season: { 9: "good", 10: "peak", 11: "peak", 12: "ending" },
  },
  {
    id: "gutui",
    nameRo: "Gutui",
    nameEn: "Quince",
    priceHintRo: "sezon scurt de toamnă",
    priceHintEn: "short autumn season",
    cooksWith: [],
    season: { 10: "peak", 11: "good" },
  },
];

export const MONTH_NAMES = {
  ro: [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
} as const;

/** monthIndex: 0–11 */
export function marketForMonth(monthIndex: number): MarketItem[] {
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  return produce.flatMap((item) => {
    const status = item.season[month];
    if (!status) return [];
    const { season, ...rest } = item;
    void season;
    return [{ ...rest, status }];
  });
}

/** @deprecated use marketForMonth */
export const augustMarket = marketForMonth(7);
