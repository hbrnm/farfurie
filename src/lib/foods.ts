export type Macros = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Food = {
  id: string;
  nameRo: string;
  nameEn: string;
  brand?: string;
  category: string;
  /** nutrition per 100g unless unit is piece */
  per100g: Macros;
  defaultGrams: number;
  unitRo: string;
  unitEn: string;
  /** approximate RON per 100g for price/protein ranking */
  priceRonPer100g?: number;
  tags: string[];
};

export const foods: Food[] = [
  {
    id: "oua",
    nameRo: "Ouă fierte",
    nameEn: "Boiled eggs",
    category: "protein",
    per100g: { kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
    defaultGrams: 60,
    unitRo: "1 ou",
    unitEn: "1 egg",
    priceRonPer100g: 1.4,
    tags: ["mic-dejun", "rapid"],
  },
  {
    id: "iaurt-napolact",
    nameRo: "Iaurt natural 3.5%",
    nameEn: "Natural yogurt 3.5%",
    brand: "Napolact",
    category: "dairy",
    per100g: { kcal: 72, protein: 4.2, carbs: 5.5, fat: 3.5 },
    defaultGrams: 150,
    unitRo: "1 borcan",
    unitEn: "1 cup",
    priceRonPer100g: 1.1,
    tags: ["mic-dejun", "magazin-ro"],
  },
  {
    id: "pui-piept",
    nameRo: "Piept de pui la grătar",
    nameEn: "Grilled chicken breast",
    category: "protein",
    per100g: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
    defaultGrams: 150,
    unitRo: "1 porție",
    unitEn: "1 serving",
    priceRonPer100g: 2.8,
    tags: ["pranz", "proteina"],
  },
  {
    id: "sarmale",
    nameRo: "Sarmale cu mămăligă",
    nameEn: "Cabbage rolls with polenta",
    category: "traditional",
    per100g: { kcal: 168, protein: 9, carbs: 12, fat: 9 },
    defaultGrams: 280,
    unitRo: "1 farfurie",
    unitEn: "1 plate",
    priceRonPer100g: 2.2,
    tags: ["traditional", "cina"],
  },
  {
    id: "ciorba-burta",
    nameRo: "Ciorbă de burtă",
    nameEn: "Tripe soup",
    category: "traditional",
    per100g: { kcal: 95, protein: 7, carbs: 4, fat: 6 },
    defaultGrams: 400,
    unitRo: "1 farfurie",
    unitEn: "1 bowl",
    priceRonPer100g: 1.8,
    tags: ["traditional", "pranz"],
  },
  {
    id: "mici",
    nameRo: "Mici la grătar",
    nameEn: "Grilled mici",
    category: "traditional",
    per100g: { kcal: 280, protein: 16, carbs: 2, fat: 23 },
    defaultGrams: 100,
    unitRo: "2 bucăți",
    unitEn: "2 pieces",
    priceRonPer100g: 3.5,
    tags: ["grill", "1mai"],
  },
  {
    id: "mamaliga",
    nameRo: "Mămăligă",
    nameEn: "Polenta",
    category: "carbs",
    per100g: { kcal: 85, protein: 2, carbs: 18, fat: 0.4 },
    defaultGrams: 200,
    unitRo: "1 farfurie",
    unitEn: "1 plate",
    priceRonPer100g: 0.3,
    tags: ["traditional", "ieftin"],
  },
  {
    id: "fasole-batuta",
    nameRo: "Fasole bătută",
    nameEn: "Mashed beans",
    category: "traditional",
    per100g: { kcal: 120, protein: 6, carbs: 16, fat: 4 },
    defaultGrams: 200,
    unitRo: "1 porție",
    unitEn: "1 serving",
    priceRonPer100g: 0.6,
    tags: ["post", "ieftin"],
  },
  {
    id: "paine-neagra",
    nameRo: "Pâine neagră feliată",
    nameEn: "Dark sliced bread",
    brand: "Vel Pitar",
    category: "carbs",
    per100g: { kcal: 250, protein: 8, carbs: 46, fat: 3 },
    defaultGrams: 35,
    unitRo: "1 felie",
    unitEn: "1 slice",
    priceRonPer100g: 0.7,
    tags: ["mic-dejun", "magazin-ro"],
  },
  {
    id: "branza-telemea",
    nameRo: "Telemea de vacă",
    nameEn: "Telemea cheese",
    brand: "Hochland",
    category: "dairy",
    per100g: { kcal: 265, protein: 17, carbs: 1, fat: 21 },
    defaultGrams: 40,
    unitRo: "2 cuburi",
    unitEn: "2 cubes",
    priceRonPer100g: 3.2,
    tags: ["magazin-ro"],
  },
  {
    id: "salata-boeuf",
    nameRo: "Salată de boeuf",
    nameEn: "Boeuf salad",
    category: "traditional",
    per100g: { kcal: 210, protein: 6, carbs: 12, fat: 15 },
    defaultGrams: 120,
    unitRo: "3 linguri",
    unitEn: "3 spoons",
    tags: ["sarbatori"],
  },
  {
    id: "orez-pui",
    nameRo: "Orez cu pui",
    nameEn: "Chicken rice",
    category: "meal",
    per100g: { kcal: 145, protein: 12, carbs: 16, fat: 3.5 },
    defaultGrams: 300,
    unitRo: "1 farfurie",
    unitEn: "1 plate",
    priceRonPer100g: 1.5,
    tags: ["pranz", "birou"],
  },
  {
    id: "banana",
    nameRo: "Banană",
    nameEn: "Banana",
    category: "fruit",
    per100g: { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    defaultGrams: 120,
    unitRo: "1 bucată",
    unitEn: "1 piece",
    priceRonPer100g: 0.8,
    tags: ["gustare"],
  },
  {
    id: "mere-ionatan",
    nameRo: "Mere Ionatan",
    nameEn: "Ionatan apples",
    category: "fruit",
    per100g: { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    defaultGrams: 160,
    unitRo: "1 măr",
    unitEn: "1 apple",
    priceRonPer100g: 0.5,
    tags: ["piata", "sezon"],
  },
  {
    id: "cascaval-pilos",
    nameRo: "Cașcaval afumat",
    nameEn: "Smoked cascaval",
    brand: "Pilos",
    category: "dairy",
    per100g: { kcal: 340, protein: 25, carbs: 1, fat: 26 },
    defaultGrams: 30,
    unitRo: "2 felii",
    unitEn: "2 slices",
    priceRonPer100g: 3.0,
    tags: ["magazin-ro", "lidl"],
  },
  {
    id: "ton-scandia",
    nameRo: "Conservă ton în suc propriu",
    nameEn: "Tuna in own juice",
    brand: "Scandia",
    category: "protein",
    per100g: { kcal: 100, protein: 23, carbs: 0, fat: 1 },
    defaultGrams: 120,
    unitRo: "1 conservă",
    unitEn: "1 can",
    priceRonPer100g: 3.8,
    tags: ["magazin-ro", "proteina", "birou"],
  },
  {
    id: "ovaz",
    nameRo: "Fulgi de ovăz",
    nameEn: "Oat flakes",
    brand: "Solaris",
    category: "carbs",
    per100g: { kcal: 370, protein: 13, carbs: 59, fat: 7 },
    defaultGrams: 50,
    unitRo: "5 linguri",
    unitEn: "5 spoons",
    priceRonPer100g: 0.9,
    tags: ["mic-dejun", "ieftin"],
  },
  {
    id: "cafea-zahar",
    nameRo: "Cafea cu zahăr",
    nameEn: "Coffee with sugar",
    category: "drink",
    per100g: { kcal: 32, protein: 0.2, carbs: 8, fat: 0 },
    defaultGrams: 180,
    unitRo: "1 pahar",
    unitEn: "1 glass",
    tags: ["bautura"],
  },
  {
    id: "salata-greceasca",
    nameRo: "Salată grecească",
    nameEn: "Greek salad",
    category: "meal",
    per100g: { kcal: 110, protein: 4, carbs: 6, fat: 8 },
    defaultGrams: 250,
    unitRo: "1 farfurie",
    unitEn: "1 plate",
    tags: ["pranz", "light"],
  },
  {
    id: "cartofi-cuptor",
    nameRo: "Cartofi la cuptor",
    nameEn: "Baked potatoes",
    category: "carbs",
    per100g: { kcal: 110, protein: 2.5, carbs: 22, fat: 1.5 },
    defaultGrams: 200,
    unitRo: "1 farfurie",
    unitEn: "1 plate",
    priceRonPer100g: 0.4,
    tags: ["ieftin", "cina"],
  },
];

export function foodName(food: Food, locale: "ro" | "en") {
  return locale === "ro" ? food.nameRo : food.nameEn;
}

export function foodUnit(food: Food, locale: "ro" | "en") {
  return locale === "ro" ? food.unitRo : food.unitEn;
}

export function macrosForGrams(food: Food, grams: number): Macros {
  const f = grams / 100;
  return {
    kcal: Math.round(food.per100g.kcal * f),
    protein: Math.round(food.per100g.protein * f * 10) / 10,
    carbs: Math.round(food.per100g.carbs * f * 10) / 10,
    fat: Math.round(food.per100g.fat * f * 10) / 10,
  };
}

export function pricePer20gProtein(food: Food): number | null {
  if (!food.priceRonPer100g || food.per100g.protein <= 0) return null;
  const ronPerGramProtein = food.priceRonPer100g / food.per100g.protein;
  return Math.round(ronPerGramProtein * 20 * 100) / 100;
}

export function searchFoods(query: string, locale: "ro" | "en"): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) return foods.slice(0, 12);
  return foods.filter((f) => {
    const blob = `${f.nameRo} ${f.nameEn} ${f.brand ?? ""} ${f.tags.join(" ")}`.toLowerCase();
    return blob.includes(q);
  });
}
