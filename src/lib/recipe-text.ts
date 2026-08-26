export type ParsedRecipeText = {
  name: string;
  servings: number;
  minutes: number;
  ingredients: string[];
  steps: string[];
};

const HEADING_ING =
  /^(ingrediente?|ingredients?|ce (î|i)ți trebuie|ce iti trebuie|ai nevoie de|you(?:'| wi)?ll need)\s*:?\s*$/i;
const HEADING_STEPS =
  /^(mod de preparare|mod de lucru|instrucțiuni|instructiuni|directions?|method|pași|pasi|preparare|steps?|how to(?: make)?|instructions?)\s*:?\s*$/i;
const INLINE_ING = /^(ingrediente?|ingredients?)\s*:\s*(.+)$/i;
const INLINE_STEPS =
  /^(mod de preparare|instrucțiuni|instructiuni|directions?|steps?|preparare)\s*:\s*(.+)$/i;
const SERVINGS =
  /(?:porții|portii|servings?|persons?|persoane|pentru)\s*:?\s*(\d+)/i;
const MINUTES =
  /(?:timp(?:\s+de\s+preparare)?|minutes?|minute|min\.?|durează|dureaza)\s*:?\s*(\d+)/i;
const BULLET = /^[-*•–—]+\s*/;
const NUMBERED = /^\d+[.)]\s*/;
const QTY_LINE =
  /^(\d|½|¼|¾)|[-*•]|\d+\s*(g|kg|ml|l|grame|lingur|can[aă]|buc|ou|ouă|oua)\b/i;

function cleanLine(line: string) {
  return line.replace(BULLET, "").replace(NUMBERED, "").replace(/\s+/g, " ").trim();
}

function looksLikeIngredient(line: string) {
  return QTY_LINE.test(line) || /^\d/.test(line);
}

export function parseRecipeText(raw: string): ParsedRecipeText {
  const text = raw.replace(/\r\n/g, "\n").replace(/\u2022/g, "\n• ").trim();
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "Rețetă importată";
  let servings = 4;
  let minutes = 30;
  let section: "none" | "ing" | "steps" = "none";
  const ingredients: string[] = [];
  const steps: string[] = [];
  let named = false;

  for (const line of lines) {
    const servM = line.match(SERVINGS);
    if (servM) servings = Math.max(1, Number(servM[1]));
    const minM = line.match(MINUTES);
    if (minM) minutes = Math.max(5, Number(minM[1]));

    const inlineIng = line.match(INLINE_ING);
    if (inlineIng?.[2] && !HEADING_ING.test(line)) {
      section = "ing";
      ingredients.push(cleanLine(inlineIng[2]));
      continue;
    }
    const inlineSteps = line.match(INLINE_STEPS);
    if (inlineSteps?.[2] && !HEADING_STEPS.test(line)) {
      section = "steps";
      steps.push(cleanLine(inlineSteps[2]));
      continue;
    }

    if (HEADING_ING.test(line)) {
      section = "ing";
      continue;
    }
    if (HEADING_STEPS.test(line)) {
      section = "steps";
      continue;
    }

    if ((servM || minM) && line.length < 48) continue;

    if (!named && section === "none" && line.length < 90 && !looksLikeIngredient(line)) {
      name = line.replace(/^#+\s*/, "").replace(/^["']|["']$/g, "");
      named = true;
      continue;
    }

    if (section === "ing") {
      const item = cleanLine(line);
      if (item) ingredients.push(item);
      continue;
    }
    if (section === "steps") {
      const item = cleanLine(line);
      if (item) steps.push(item);
    }
  }

  if (ingredients.length === 0) {
    for (const line of lines.slice(named ? 1 : 0)) {
      if (HEADING_ING.test(line) || HEADING_STEPS.test(line) || SERVINGS.test(line)) continue;
      if (looksLikeIngredient(line)) ingredients.push(cleanLine(line));
    }
  }

  if (ingredients.length === 0) {
    const rest = lines.filter((l, i) => (named ? i > 0 : true) && l.length > 2 && l.length < 80);
    ingredients.push(...rest.slice(0, 16));
  }

  return {
    name: name.slice(0, 80) || "Rețetă importată",
    servings,
    minutes: Number.isFinite(minutes) ? minutes : 30,
    ingredients: ingredients.filter(Boolean).slice(0, 40),
    steps: steps.filter(Boolean).slice(0, 24),
  };
}

export function parseGrams(ingredient: string): number | null {
  const kg = ingredient.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  if (kg) return Math.round(Number(kg[1].replace(",", ".")) * 1000);
  const g = ingredient.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|grame)\b/i);
  if (g) return Math.round(Number(g[1].replace(",", ".")));
  const ml = ingredient.match(/(\d+(?:[.,]\d+)?)\s*(ml)\b/i);
  if (ml) return Math.round(Number(ml[1].replace(",", ".")));
  const l = ingredient.match(/(\d+(?:[.,]\d+)?)\s*l\b/i);
  if (l) return Math.round(Number(l[1].replace(",", ".")) * 1000);
  const spoon = ingredient.match(/(\d+(?:[.,]\d+)?)\s*lingur/i);
  if (spoon) return Math.round(Number(spoon[1].replace(",", ".")) * 15);
  const cup = ingredient.match(/(\d+(?:[.,]\d+)?)\s*can[aăi]\b/i);
  if (cup) return Math.round(Number(cup[1].replace(",", ".")) * 200);
  const egg = ingredient.match(/(\d+)\s*(ouă|oua|ou)\b/i);
  if (egg) return Number(egg[1]) * 60;
  return null;
}

export function ingredientQuery(ingredient: string) {
  return ingredient
    .replace(/^\d[\d.,/]*\s*(g|kg|ml|l|grame|linguri|lingură|lingura|cană|cana|bucăți|buc|ouă|oua|ou)?\s*/i, "")
    .replace(/^[-*•]+\s*/, "")
    .slice(0, 32)
    .trim();
}
