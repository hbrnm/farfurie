/** Approximate Romanian produce calendar for demo (current: late August). */
export type MarketItem = {
  id: string;
  nameRo: string;
  nameEn: string;
  status: "peak" | "good" | "ending";
  priceHintRo: string;
  priceHintEn: string;
  cooksWith: string[];
};

export const augustMarket: MarketItem[] = [
  {
    id: "rosii",
    nameRo: "Roșii de câmp",
    nameEn: "Field tomatoes",
    status: "peak",
    priceHintRo: "ieftine la piață",
    priceHintEn: "cheap at the market",
    cooksWith: ["ciorba-legume", "salata-ton"],
  },
  {
    id: "ardei",
    nameRo: "Ardei grași",
    nameEn: "Bell peppers",
    status: "peak",
    priceHintRo: "sezon maxim",
    priceHintEn: "peak season",
    cooksWith: ["ciorba-legume"],
  },
  {
    id: "vinete",
    nameRo: "Vinete",
    nameEn: "Eggplants",
    status: "peak",
    priceHintRo: "ideal pentru zacuscă",
    priceHintEn: "ideal for zacuscă",
    cooksWith: [],
  },
  {
    id: "dovlecei",
    nameRo: "Dovlecei",
    nameEn: "Zucchini",
    status: "good",
    priceHintRo: "preț bun",
    priceHintEn: "good price",
    cooksWith: ["ciorba-legume"],
  },
  {
    id: "mere",
    nameRo: "Mere de vară",
    nameEn: "Summer apples",
    status: "good",
    priceHintRo: "încep să apară",
    priceHintEn: "just arriving",
    cooksWith: ["ovaz-napolact"],
  },
  {
    id: "struguri",
    nameRo: "Struguri timpurii",
    nameEn: "Early grapes",
    status: "good",
    priceHintRo: "primele soiuri",
    priceHintEn: "first varieties",
    cooksWith: [],
  },
  {
    id: "porumb",
    nameRo: "Porumb fiert",
    nameEn: "Corn",
    status: "peak",
    priceHintRo: "ieftin pe litoral & piață",
    priceHintEn: "cheap at markets",
    cooksWith: [],
  },
  {
    id: "fasole-verde",
    nameRo: "Fasole verde",
    nameEn: "Green beans",
    status: "ending",
    priceHintRo: "ultimele săptămâni",
    priceHintEn: "last weeks",
    cooksWith: ["fasole-light"],
  },
];
