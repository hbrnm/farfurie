import { foods, pricePer20gProtein, type Macros } from "./foods";
import type { Locale } from "./i18n";

export type CoachReply = {
  title: string;
  body: string;
  tips: string[];
};

export function coachReply(input: {
  locale: Locale;
  remaining: Macros;
  eaten: Macros;
  goalKcal: number;
  holiday: boolean;
  recovery: boolean;
  streak: number;
  question?: string;
}): CoachReply {
  const { locale, remaining, eaten, goalKcal, holiday, recovery, streak } = input;
  const q = (input.question ?? "").toLowerCase();
  const ro = locale === "ro";
  const cheapProtein = [...foods]
    .map((f) => ({ f, p: pricePer20gProtein(f) }))
    .filter((x) => x.p != null)
    .sort((a, b) => (a.p ?? 99) - (b.p ?? 99))
    .slice(0, 3);

  if (/bere|wine|vin|alcool|beer/.test(q)) {
    return {
      title: ro ? "Alcoolul în buget" : "Alcohol in the budget",
      body: ro
        ? "Un pahar de Fetească ~125 kcal, o bere Silva 500ml ~215 kcal. Loghează-l ca gustare — nu „nu contează”. Apoi umple golul cu proteină, nu cu pâine."
        : "A glass of Fetească is ~125 kcal, a 500ml Silva beer ~215 kcal. Log it as a snack — it counts. Then fill the gap with protein, not bread.",
      tips: cheapProtein.map((x) =>
        ro
          ? `${x.f.nameRo}${x.f.brand ? ` (${x.f.brand})` : ""} · ${x.p} lei / 20g proteină`
          : `${x.f.nameEn}${x.f.brand ? ` (${x.f.brand})` : ""} · ${x.p} RON / 20g protein`,
      ),
    };
  }

  if (/sarmale|craciun|paște|paste|nuntă|nunta|1 mai/.test(q) || holiday) {
    return {
      title: ro ? "Mod Sărbători, fără vinovăție" : "Holiday mode, no guilt",
      body: ro
        ? "Bugetul e deja +15%. Alege o farfurie, nu trei. A doua zi: proteină (ouă, ton, pui la grătar) + 30 min plimbare. Nu sări mese."
        : "Budget is already +15%. One plate, not three. Next day: protein (eggs, tuna, grilled chicken) + a 30 min walk. Don’t skip meals.",
      tips: [
        ro ? "Salata de varză lângă sarmale taie densitatea." : "Cabbage salad next to sarmale cuts density.",
        ro ? "Porția ta din oala comună, nu „încă o lingură”." : "Your family-pot share, not one more spoon.",
      ],
    };
  }

  if (recovery) {
    return {
      title: ro ? "Plan de revenire 48h" : "48h recovery plan",
      body: ro
        ? "Fără deficit agresiv. Ținta: proteina zilnică + apă + o plimbare. Caloriile revin la normal, nu la 1200."
        : "No crash deficit. Hit daily protein + water + a walk. Calories back to normal — not 1200.",
      tips: [
        ro ? "Mic dejun: ouă + iaurt natural." : "Breakfast: eggs + natural yogurt.",
        ro ? "Prânz: piept de pui + salată." : "Lunch: chicken breast + salad.",
      ],
    };
  }

  if (remaining.protein > 20) {
    return {
      title: ro ? "Îți lipsește proteina" : "You’re short on protein",
      body: ro
        ? `Mai ai ${Math.round(remaining.protein)}g proteină și ${Math.max(0, Math.round(remaining.kcal))} kcal. Nu închide ziua cu pâine — ia ton, ouă sau cottage.`
        : `You still need ${Math.round(remaining.protein)}g protein and ${Math.max(0, Math.round(remaining.kcal))} kcal. Don’t close with bread — tuna, eggs or cottage.`,
      tips: cheapProtein.map((x) =>
        ro ? `${x.f.nameRo} · ${x.p} lei/20g P` : `${x.f.nameEn} · ${x.p} RON/20g P`,
      ),
    };
  }

  if (remaining.kcal < -80) {
    return {
      title: ro ? "Fără vinovăție" : "No guilt",
      body: ro
        ? `Ai logat ${Math.round(eaten.kcal)} kcal. Check-in-ul folosește ce-ai mâncat realmente, nu cât de aproape ai fost de ${goalKcal}. Continuă să loghezi tot — inclusiv desertul — ca metabolismul să fie corect.`
        : `You logged ${Math.round(eaten.kcal)} kcal. Check-in uses what you actually ate, not how close you were to ${goalKcal}. Keep logging everything — including dessert — so expenditure stays honest.`,
      tips: [
        ro ? "Nu tăia mâine 1000 kcal. Așteaptă check-in-ul." : "Don’t slash 1000 kcal tomorrow. Wait for check-in.",
        ro ? "Cântărește-te dimineața, același cântar." : "Weigh in the morning, same scale.",
      ],
    };
  }

  if (remaining.kcal < 80 && eaten.kcal > goalKcal * 0.9) {
    return {
      title: ro ? "Zi închisă bine" : "Day closed well",
      body: ro
        ? `Streak ${streak}. Dacă ești încă flămând: kefir sau varză, nu Poiana.`
        : `Streak ${streak}. Still hungry: kefir or cabbage, not chocolate.`,
      tips: [
        ro ? "Loghează apa — setea mimează foamea." : "Log water — thirst mimics hunger.",
      ],
    };
  }

  return {
    title: ro ? "Umple golul inteligent" : "Fill the gap smartly",
    body: ro
      ? `Rămân ${Math.max(0, Math.round(remaining.kcal))} kcal. Caută o idee care acoperă și proteina, nu doar „ceva sub X”.`
      : `${Math.max(0, Math.round(remaining.kcal))} kcal left. Pick something that covers protein too, not just “under X”.`,
    tips: cheapProtein.map((x) =>
      ro
        ? `${x.f.nameRo}${x.f.brand ? ` · ${x.f.brand}` : ""}`
        : `${x.f.nameEn}${x.f.brand ? ` · ${x.f.brand}` : ""}`,
    ),
  };
}
