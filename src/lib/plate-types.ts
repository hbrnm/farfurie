import type { Macros } from "@/lib/foods";

export type PlateGuess = {
  nameRo: string;
  nameEn: string;
  grams: number;
  macros: Macros;
  foodId?: string;
  confidence: number;
};

export type PlateEstimate = {
  provider: "gemini" | "openai" | "heuristic";
  items: PlateGuess[];
  noteRo: string;
  noteEn: string;
};
