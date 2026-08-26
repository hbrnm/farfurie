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

## MVP scope (this codebase)

1. Marketing landing (brand-first)
2. Daily diary with meals + remaining budget ring
3. Romanian-centric food search + portion units
4. Recipes with nutrition + “add to diary”
5. Umple golul suggestions
6. Calendarul pieței (seasonal board)
7. Oala comună splitter
8. Mod Sărbători toggle
9. Language switch RO/EN
10. Local persistence (demo profile)

## Shipped in v1.1

11. Profile + Mifflin–St Jeor BMR/TDEE calorie & macro goals
12. Shopping list from recipes
13. Recipe favorites
14. Intermittent fasting timer (16:8, 14:10, 18:6, OMAD)
15. Exercise logging (burned kcal returns to daily budget)
16. Expanded RO supermarket / traditional food seed DB

## Later (v2+)

- Barcode scan + AI photo estimate
- Nutritionist marketplace
- Wearable sync
- Community verified recipes
- Native iOS/Android
- Multi-day meal planner
