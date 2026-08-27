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

## Release freeze — R1 (this PR)

Ship an honest diary. This branch already has more than a mock: local journal, metabolic program, OFF barcodes, optional account sync, recipe import.

**In R1 (market and keep)**

1. Daily diary, remaining budget, fill-the-gap
2. Manual weekly plan + shopping list
3. Weight + metabolic program (trend, weekly check-in)
4. PWA
5. RO catalog + Open Food Facts scan
6. Recipe import from pasted text
7. Optional account / sync
8. Oala comună, Calendarul pieței, Mod Sărbători, RO/EN

**Do not sell as done**

- Real vision AI (plate photo is colour/template + optional Gemini key — not a trained model by default)
- Paid Premium / IAP (there is no checkout)
- HealthKit / Health Connect / Teams / community

**Premium is postponed.** There is no `setSubscriptionTier` unlock on this branch. Do not add a fake paywall.

## Later (R2)

- Verified billing (Stripe / store IAP)
- Default-on vision model with privacy review
- Health sync in a native shell
- Teams / nutritionist marketplace
