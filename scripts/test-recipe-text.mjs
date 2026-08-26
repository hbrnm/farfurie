import { parseGrams, parseRecipeText } from "../src/lib/recipe-text.ts";

const sample = `Sarmale de post
Porții: 6
Timp: 90 minute

Ingrediente:
500g varză
200g orez
1 ceapă
2 linguri ulei

Mod de preparare:
Călește ceapa.
Umple varza.
Fierbe 90 min.`;

const parsed = parseRecipeText(sample);
const checks = [
  parsed.name === "Sarmale de post",
  parsed.servings === 6,
  parsed.minutes === 90,
  parsed.ingredients.includes("500g varză"),
  parsed.ingredients.includes("200g orez"),
  parsed.steps.length === 3,
  parseGrams("500g varză") === 500,
  parseGrams("2 linguri ulei") === 30,
];

if (checks.some((ok) => !ok)) {
  console.error(parsed);
  process.exit(1);
}
console.log(JSON.stringify(parsed, null, 2));
