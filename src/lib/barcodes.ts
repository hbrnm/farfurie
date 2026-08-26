import { foods, type Food } from "./foods";

/** Demo EANs for Romanian supermarket packs — free barcode, unlike MFP. */
const EXTRA: Record<string, string> = {
  "5941008000123": "iaurt-napolact",
  "5941008000451": "cottage-napolact",
  "5941008000712": "chefir-napolact",
  "5941023000881": "sunca-scandia",
  "5941023000100": "ton-scandia",
  "2091234000001": "pui-lidl",
  "2091234000002": "iaurt-grecesc",
  "4337182033440": "paine-kb",
  "2212345000008": "oua-mega",
  "3560070470015": "linte-carrefour",
  "5941001001234": "bere-silva",
  "5941234000999": "cascaval-pilos",
  "5941008000990": "lapte-napolact",
  "5941234111001": "paine-neagra",
  "5941888000333": "ciocolata-poiana",
  "5449000000996": "cola",
};

export function normalizeEan(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function foodFromBarcode(raw: string): Food | undefined {
  const code = normalizeEan(raw);
  if (!code) return undefined;
  const fromField = foods.find((f) => f.ean === code);
  if (fromField) return fromField;
  const id = EXTRA[code];
  return id ? foods.find((f) => f.id === id) : undefined;
}

export const DEMO_BARCODES = Object.entries(EXTRA).map(([ean, foodId]) => ({
  ean,
  food: foods.find((f) => f.id === foodId),
}));
