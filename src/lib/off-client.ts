import { foodFromBarcode } from "@/lib/barcodes";
import type { Food } from "@/lib/foods";

export async function lookupBarcodeLive(raw: string): Promise<Food | null> {
  const local = foodFromBarcode(raw);
  if (local) return local;
  const code = raw.replace(/\D/g, "");
  if (code.length < 8) return null;
  const res = await fetch(`/api/off/product/${code}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { food?: Food | null };
  return data.food ?? null;
}

export async function searchFoodsLive(query: string): Promise<Food[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await fetch(`/api/off/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { foods?: Food[] };
  return data.foods ?? [];
}
