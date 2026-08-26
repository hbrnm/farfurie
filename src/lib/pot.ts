import type { Macros } from "./foods";

export type PotMember = {
  id: string;
  nameRo: string;
  nameEn: string;
  goalKcal: number;
  you?: boolean;
};

export type PotMacros = Macros;

export function splitPotByGoals<T extends { goalKcal: number }>(
  pot: PotMacros,
  members: T[],
): (T & { macros: Macros; pct: number })[] {
  const total = members.reduce((a, m) => a + Math.max(m.goalKcal, 1), 0);
  return members.map((m) => {
    const ratio = Math.max(m.goalKcal, 1) / Math.max(total, 1);
    return {
      ...m,
      pct: Math.round(ratio * 100),
      macros: {
        kcal: Math.round(pot.kcal * ratio),
        protein: Math.round(pot.protein * ratio * 10) / 10,
        carbs: Math.round(pot.carbs * ratio * 10) / 10,
        fat: Math.round(pot.fat * ratio * 10) / 10,
      },
    };
  });
}

export const defaultPotMembers = (): PotMember[] => [
  { id: "you", nameRo: "Tu", nameEn: "You", goalKcal: 0, you: true },
  { id: "alex", nameRo: "Alex", nameEn: "Alex", goalKcal: 2600 },
  { id: "maya", nameRo: "Maya", nameEn: "Maya", goalKcal: 1800 },
];
