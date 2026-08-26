import type { Food, Macros } from "@/lib/foods";

export const OFF_UA = "Farfurie/0.3 (https://github.com/hbrnm/farfurie)";

const PRODUCT_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "product_name_ro",
  "generic_name",
  "generic_name_ro",
  "brands",
  "nutriments",
  "serving_quantity",
  "serving_size",
  "product_quantity",
  "quantity",
  "countries_tags",
].join(",");

type OffNutriments = Record<string, number | string | undefined>;

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  product_name_ro?: string;
  generic_name?: string;
  generic_name_ro?: string;
  brands?: string | string[];
  nutriments?: OffNutriments;
  serving_quantity?: string | number;
  serving_size?: string;
  product_quantity?: string | number;
  quantity?: string;
  countries_tags?: string[];
};

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function brandName(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  const first = raw?.split(",")[0]?.trim();
  return first || undefined;
}

function kcal100(n: OffNutriments | undefined): number | null {
  if (!n) return null;
  const kcal = num(n["energy-kcal_100g"]) ?? num(n["energy-kcal"]);
  if (kcal != null) return kcal;
  const kj = num(n["energy-kj_100g"]) ?? num(n.energy_100g) ?? num(n.energy);
  return kj != null ? Math.round(kj / 4.184) : null;
}

function servingGrams(p: OffProduct): number {
  const qty = num(p.serving_quantity) ?? num(p.product_quantity);
  if (qty && qty >= 10 && qty <= 800) return Math.round(qty);
  const fromText = String(p.serving_size ?? p.quantity ?? "").match(/(\d{2,4})\s*g/i);
  if (fromText) {
    const g = Number(fromText[1]);
    if (g >= 10 && g <= 800) return g;
  }
  return 100;
}

export function offProductToFood(p: OffProduct, code: string): Food | null {
  const n = p.nutriments ?? {};
  const kcal = kcal100(n);
  if (kcal == null || kcal <= 0) return null;
  const nameRo =
    p.product_name_ro ||
    p.generic_name_ro ||
    p.product_name ||
    p.product_name_en ||
    p.generic_name ||
    code;
  const nameEn = p.product_name_en || p.product_name || nameRo;
  const per100g: Macros = {
    kcal: Math.round(kcal),
    protein: Math.round((num(n.proteins_100g) ?? 0) * 10) / 10,
    carbs: Math.round((num(n.carbohydrates_100g) ?? 0) * 10) / 10,
    fat: Math.round((num(n.fat_100g) ?? 0) * 10) / 10,
  };
  const countries = p.countries_tags ?? [];
  return {
    id: `off-${code}`,
    nameRo,
    nameEn,
    brand: brandName(p.brands),
    category: "off",
    per100g,
    defaultGrams: servingGrams(p),
    unitRo: `${servingGrams(p)}g`,
    unitEn: `${servingGrams(p)}g`,
    tags: [
      "open-food-facts",
      countries.includes("en:romania") ? "romania" : "",
    ].filter(Boolean),
    ean: code,
  };
}

export async function fetchOffProduct(ean: string): Promise<Food | null> {
  const code = ean.replace(/\D/g, "");
  if (code.length < 8) return null;
  const url = `https://world.openfoodfacts.org/api/v2/product/${code}?fields=${PRODUCT_FIELDS}`;
  const res = await fetch(url, {
    headers: { "User-Agent": OFF_UA, Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: number; product?: OffProduct; code?: string };
  if (data.status === 0 || !data.product) return null;
  return offProductToFood(data.product, data.code || code);
}

type SearchHit = OffProduct & { code?: string };

export async function searchOffProducts(query: string, preferRo = true): Promise<Food[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=12`;
  const res = await fetch(url, {
    headers: { "User-Agent": OFF_UA, Accept: "application/json" },
    next: { revalidate: 120 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { hits?: SearchHit[] };
  const hits = data.hits ?? [];
  const ranked = [...hits].sort((a, b) => {
    const ar = a.countries_tags?.includes("en:romania") ? 1 : 0;
    const br = b.countries_tags?.includes("en:romania") ? 1 : 0;
    return preferRo ? br - ar : 0;
  });

  const codes = ranked
    .map((hit) => String(hit.code ?? "").replace(/\D/g, ""))
    .filter((code, i, arr) => code && arr.indexOf(code) === i)
    .slice(0, 6);

  const resolved = await Promise.all(codes.map((code) => fetchOffProduct(code)));
  return resolved.filter((food): food is Food => food != null);
}
