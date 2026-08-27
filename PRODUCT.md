# Farfurie — Product Strategy

**Tagline RO:** Farfuria ta, înțeleasă.  
**Tagline EN:** Your plate, understood.  
**Focus:** Romania-first calorie & recipe tracker, usable internationally (RO/EN).

---

## Competitive landscape (what they do well)

| App | Strengths | Gaps |
|-----|-----------|------|
| **FitDiary** | AI plate scan for Romanian dishes, nutritional chat, traditional recipes | Thin free tier; still early; less supermarket depth |
| **Eat & Track** | 40k RO store foods, shopping lists, nutritionists, friends | Dated UX; PRO-gated meal ideas; no AI fill-the-gap |
| **Yazio** | Clean UX, fasting, meal plans + shopping lists, EU localization | Weak RO products/portions; no Romanian cultural modes |
| **MyFitnessPal** | Huge global DB, wearables, community, recipe URL import | Weak RO food; paywalled barcode; noisy UX; US-centric portions |

---

## What we take from the best

- **From FitDiary:** Romanian cuisine recognition mindset; healthy traditional recipe variants; conversational nutrition help (later).
- **From Eat & Track:** Romanian supermarket DB depth; shopping list from diary; saved meals; nutritionist-ready export.
- **From Yazio:** Visual clarity; intermittent fasting; structured meal plans; generous free barcode scanning philosophy.
- **From MyFitnessPal:** Macro precision; recipe builder; international food coverage layer; habit streaks.

---

## What others don’t have (Farfurie differentiators)

### 1. Bugetul zilei — „Umple golul”
Suggests the next meal that closes remaining calories **and** macros (protein gap first), not just “meals under X kcal”.

### 2. Oala comună (Family Pot)
Log a shared pot (ciorbă, sarmale, tocăniță) once, split by household members with different goals.

### 3. Calendarul pieței
Seasonal Romanian produce: what’s fresh/cheap now (piață + Lidl/Kaufland seasonality), with recipes that use those ingredients.

### 4. Mod Sărbători
Easter, Crăciun, 1 Mai, nuntă weekend — flexible targets + a 48h recovery plan without shame spirals.

### 5. Porții românești
Units people actually use: farfurie, lingură, pahar, felie — not US cups by default. EN users get metric + local labels.

### 6. Magazin RO first
Napolact, Scandia, Hochland RO, Pilos, Milka RO packs, etc., ahead of generic US brands. International DB as second layer.

### 7. Preț / proteină
Cheapest protein & calorie density at approximate Romanian store prices — nutrition that respects the budget.

### 8. RO/EN first-class
Not a translation afterthought: bilingual UI, bilingual food names, portion labels.

---

## Release freeze — R1 “Farfurie Diary” (now)

Ship an honest local journal. **Do not market or expose mocks** (photo/voice AI, Teams, Health sync, fake auto-plan, fake Premium checkout).

**In R1**

1. Daily diary (meals by date, remaining budget ring, fill-the-gap)
2. Manual weekly meal plan → apply today + shopping list
3. Weight log + 7-day calorie chart
4. PWA (Add to Home Screen)
5. Profile / BMR–TDEE, exercise log, fasting timer (local)
6. Recipes, Oala comună, Calendarul pieței, Mod Sărbători
7. RO/EN, local persistence (`farfurie-v4`)

**Out of R1 (hidden until billing + real backends exist)**

- Photo / voice / AI plate estimate
- Teams / community
- HealthKit / Health Connect
- Automatic meal-plan generator
- Progress photos and fake body-fat shortcuts
- Paid Premium (paywall is “coming later”, not a one-click unlock)

**Premium is postponed.** A developer toggle on the profile can simulate the client flag for leftover gates. It is not a purchase; APIs ignore `x-farfurie-tier`.

## Later (R2 — Fitia-class)

- Accounts + verified server-side plan (Stripe / store IAP)
- Real food catalog (Open Food Facts + RO seed)
- Camera barcode, real vision/voice logging
- Health sync in a native shell
- Teams, PDF export, diet-type planner
