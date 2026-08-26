import type { Macros } from "./foods";

export type Recipe = {
  id: string;
  nameRo: string;
  nameEn: string;
  minutes: number;
  servings: number;
  tags: string[];
  season?: string[];
  perServing: Macros;
  ingredientsRo: string[];
  ingredientsEn: string[];
  stepsRo: string[];
  stepsEn: string[];
  imageHue: number;
};

export const recipes: Recipe[] = [
  {
    id: "ciorba-legume",
    nameRo: "Ciorbă de legume de sezon",
    nameEn: "Seasonal vegetable soup",
    minutes: 40,
    servings: 4,
    tags: ["pranz", "light", "ieftin"],
    season: ["varza", "morcov", "telina"],
    perServing: { kcal: 180, protein: 6, carbs: 28, fat: 5 },
    ingredientsRo: [
      "300g varză",
      "2 morcovi",
      "1 țelină",
      "1 ceapă",
      "2 linguri ulei",
      "sare, leuștean",
    ],
    ingredientsEn: [
      "300g cabbage",
      "2 carrots",
      "1 celery root",
      "1 onion",
      "2 spoons oil",
      "salt, lovage",
    ],
    stepsRo: [
      "Călește ceapa în ulei.",
      "Adaugă legumele tăiate și apă.",
      "Fierbe 30 min, potrivește sarea.",
    ],
    stepsEn: [
      "Sauté onion in oil.",
      "Add chopped vegetables and water.",
      "Simmer 30 min, season.",
    ],
    imageHue: 95,
  },
  {
    id: "pui-orez",
    nameRo: "Piept de pui cu orez și salată",
    nameEn: "Chicken breast with rice and salad",
    minutes: 25,
    servings: 2,
    tags: ["pranz", "proteina", "birou"],
    perServing: { kcal: 420, protein: 38, carbs: 42, fat: 9 },
    ingredientsRo: [
      "300g piept de pui",
      "120g orez",
      "castraveți, roșii",
      "1 lingură ulei",
    ],
    ingredientsEn: [
      "300g chicken breast",
      "120g rice",
      "cucumber, tomatoes",
      "1 spoon oil",
    ],
    stepsRo: [
      "Gătește orezul.",
      "Prăjește puiul pe grătar.",
      "Servește cu salată proaspătă.",
    ],
    stepsEn: [
      "Cook the rice.",
      "Grill the chicken.",
      "Serve with fresh salad.",
    ],
    imageHue: 25,
  },
  {
    id: "ovaz-napolact",
    nameRo: "Ovăz cu iaurt Napolact și mere",
    nameEn: "Oats with Napolact yogurt and apple",
    minutes: 8,
    servings: 1,
    tags: ["mic-dejun", "rapid"],
    season: ["mere"],
    perServing: { kcal: 340, protein: 14, carbs: 52, fat: 9 },
    ingredientsRo: [
      "50g fulgi de ovăz",
      "150g iaurt Napolact",
      "1 măr",
      "scorțișoară",
    ],
    ingredientsEn: [
      "50g oat flakes",
      "150g Napolact yogurt",
      "1 apple",
      "cinnamon",
    ],
    stepsRo: [
      "Amestecă ovăzul cu iaurtul.",
      "Adaugă mărul ras și scorțișoara.",
    ],
    stepsEn: ["Mix oats with yogurt.", "Add grated apple and cinnamon."],
    imageHue: 40,
  },
  {
    id: "fasole-light",
    nameRo: "Fasole bătută light cu ceapă",
    nameEn: "Light mashed beans with onion",
    minutes: 35,
    servings: 4,
    tags: ["post", "ieftin", "cina"],
    season: ["ceapa"],
    perServing: { kcal: 260, protein: 12, carbs: 32, fat: 8 },
    ingredientsRo: [
      "400g fasole fiartă",
      "1 ceapă",
      "2 linguri ulei",
      "usturoi, sare",
    ],
    ingredientsEn: [
      "400g cooked beans",
      "1 onion",
      "2 spoons oil",
      "garlic, salt",
    ],
    stepsRo: [
      "Pasează fasolea.",
      "Adaugă usturoi și ulei.",
      "Servește cu ceapă călită.",
    ],
    stepsEn: [
      "Mash the beans.",
      "Add garlic and oil.",
      "Serve with sautéed onion.",
    ],
    imageHue: 55,
  },
  {
    id: "salata-ton",
    nameRo: "Salată cu ton Scandia",
    nameEn: "Scandia tuna salad",
    minutes: 10,
    servings: 1,
    tags: ["pranz", "proteina", "birou"],
    perServing: { kcal: 310, protein: 32, carbs: 12, fat: 14 },
    ingredientsRo: [
      "1 conservă ton Scandia",
      "salată verde",
      "1 ou",
      "castravete",
      "1 lingură ulei de măsline",
    ],
    ingredientsEn: [
      "1 can Scandia tuna",
      "lettuce",
      "1 egg",
      "cucumber",
      "1 spoon olive oil",
    ],
    stepsRo: ["Amestecă toate ingredientele.", "Potrivește sarea."],
    stepsEn: ["Toss all ingredients.", "Season to taste."],
    imageHue: 180,
  },
  {
    id: "sarmale-light",
    nameRo: "Sarmale light (curcan)",
    nameEn: "Light cabbage rolls (turkey)",
    minutes: 90,
    servings: 6,
    tags: ["traditional", "sarbatori"],
    season: ["varza"],
    perServing: { kcal: 290, protein: 22, carbs: 18, fat: 14 },
    ingredientsRo: [
      "500g carne curcan",
      "1 varză murată",
      "80g orez",
      "ceapă, cimbru",
    ],
    ingredientsEn: [
      "500g turkey mince",
      "1 pickled cabbage",
      "80g rice",
      "onion, thyme",
    ],
    stepsRo: [
      "Pregătește umplutura.",
      "Rulează sarmalele.",
      "Fierbe la foc mic 70 min.",
    ],
    stepsEn: [
      "Prepare the filling.",
      "Roll the cabbage.",
      "Simmer gently 70 min.",
    ],
    imageHue: 10,
  },
];

export function recipeName(recipe: Recipe, locale: "ro" | "en") {
  return locale === "ro" ? recipe.nameRo : recipe.nameEn;
}
