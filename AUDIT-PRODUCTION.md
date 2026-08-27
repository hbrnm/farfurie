# Audit tehnic și funcțional — Farfurie

**Data:** 27 august 2026  
**Rol:** Senior Software Architect / Tech Lead  
**Bază:** sursă curentă (`src/`, ~64 fișiere TS/TSX, Next.js 16 + React 19, Zustand persist, fără backend de utilizatori)  
**Ramură:** `cursor/audit-farfurie-c995`

---

## Status curent

### Scor de maturitate

| Referință | Scor | Citire |
|---|---|---|
| **Vs. spec Fitia (4 piloni Free/Premium, 10M alimente, IAP, Health, AI)** | **28%** | Prototip de produs, nu aplicație de lansare |
| **Vs. jurnal local RO/EN (Farfurie MVP onest)** | **55%** | Demo utilizabil pe un dispozitiv, fără cont, fără magazin de alimente real |
| **Production-ready (conturi, plăți, date de sănătate, CI, legal)** | **15%** | Nu se lansează în App Store / web public ca tracker medical |

**Verdict:** aplicația arată ca un produs (landing, PWA, paywall, 5 taburi). Sub UI, majoritatea capabilităților Premium sunt **porți goale** sau **răspunsuri demo**. Datele trăiesc în `localStorage` (`farfurie-v4`). Nu există identitate de user, nici plată, nici bază de alimente verificată la scară.

Jurnalul zilnic (P0 din `AUDIT.md`) este **reparat**: zile pe `dateKey`, streak real, grafic din istoric, persist fără seed de mese. Asta urcă Farfurie-ul local la ~55%. Stratul Fitia (gating, API, 4 piloni) urcă **suprafața**, nu maturitatea de producție.

### Rezumat pe module

| Modul | Ce funcționează | Ce e mock / neterminat |
|---|---|---|
| **A. Calorie Counter** | Jurnal pe dată, search 30 alimente, text-parse pe seed, barcode EAN tastat (8 coduri), aliment custom, apă, inel macros, Umple golul, widget-uri **in-app** | Foto/voce = mereu piept de pui (`ai-estimate`); 10M DB absent; scaner cameră absent; widget-uri OS/PWA reale absente; Teams = listă statică join/leave; `/api/food/log` nu e apelat de client; `LoggingDock` e hardcodat pe `lunch` |
| **B. Meal Planner** | Plan săptămânal manual, aplică azi (idempotent), rețete (8) | Auto-plan = primele 4 rețete; lista din plan e gated dar algoritmul e concat; reminder = checkbox fără notificări; fără PDF, diet type UI, porții auto, planuri de grup |
| **C. Progress Tracker** | Greutate (log), grafic 7 zile din istoric real, protein % | Body fat = buton `24.5%`; măsurători doar în store, **fără UI**; poze = dataURL în localStorage; Health Sync = text; fără grafic greutate |
| **D. Intermittent Fasting** | Timer 16:8 / 14:10 / 18:6 / OMAD, gated Premium | Fără interval custom, fără notificări reale, fără Live Activities / lock-screen widgets |
| **Billing** | `PremiumGate` + catalog `FEATURES` | Upgrade = `setSubscriptionTier("premium")` local; header `x-farfurie-tier` e spoofabil; fără Stripe/RevenueCat/StoreKit |
| **Identitate & date** | Persist Zustand | Fără auth, sync, backup, GDPR export/ștergere cont, cifrare poze |
| **Infra** | `pnpm test` (25 teste), `tsc` trece | Fără `.github/workflows`; `next lint` e **rupt** pe Next 16; Playwright instalat, 0 spec-uri; `eslint-config-next@15` vs `next@16` |

---

## Dimensiuni de analiză

### 1. Arhitectură & structură

**Ce e bun**

- Next App Router clar: landing `src/app/page.tsx`, shell `src/app/app/`, API `src/app/api/food/*`.
- Separare recentă pe piloni: `src/modules/{calorie-counter,fasting,progress-tracker}` + `src/domain/models.ts` + `src/server/` + `src/lib/`.
- Logică de domeniu extrasă din UI: `diary.ts`, `goals.ts`, `dates.ts`, `pot.ts`, `market.ts`, `fillGap.ts`, `entitlements.ts` — testabilă.
- TypeScript end-to-end pe client; Zustand ca singurul state client.

**Ce nu scalează**

- **Două modele de date.** `domain/models.ts` definește `User`, `FoodLog`, `MealPlan`, `FastingSession`. Store-ul folosește `DiaryEntry[]`, `WeekPlan`, `fastingStartedAt`. Backend-ul va trebui să mapeze două scheme.
- **Store-ul e un God object** (`src/lib/store.ts`, ~600 linii): profil, jurnal, plan, cumpărături, oală, fasting, greutate, poze, entitlements. Orice feature nou crește același persist.
- **API-ul nu e sursa de adevăr.** Clientul parsează textul, apoi scrie **direct** în Zustand. `POST /api/food/log` există și nu e apelat. Când pui Postgres, ai două căi de scriere.
- **Nu există strat de servicii.** Fetch-ul stă în componente (`LoggingDock`). Fără retry, fără queue, fără mapare erori.
- **Client-only pe tot `/app`.** `AppShell` e înfășurat în `ClientOnly` → flash „Farfurie…”, zero SSR pe jurnal, SEO slab pe app.
- Folderele `modules/` sunt încă **UI**, nu bounded contexts (fără store propriu, fără API propriu).

Scalabilitatea actuală: un singur utilizator, un singur browser. Nu există multi-device, multi-user, sau multi-tenant.

### 2. Funcționalitate & UX/UI

**Fluxuri complete (oneste)**

- Onboarding (sex, vârstă, greutate, înălțime, activitate) → BMR/TDEE Mifflin–St Jeor.
- Jurnal: search aliment, grame, rețetă, ștergere, apă, mișcare, Umple golul, reset azi / tot, export JSON.
- Plan săptămânal manual + aplică azi fără duplicate.
- Listă cumpărături cu dedupe ingrediente.
- Oala comună split după `goalKcal`.
- Piață pe **luna curentă** (nu august hardcodat).
- i18n RO/EN pe chei; `html lang` din locale.
- PWA instalabilă; bottom nav pe mobil.

**Fluxuri incomplete / teatru**

- Foto / voce → piept de pui 180g, `demo: true`.
- Barcode → input text, 8 EAN-uri.
- Auto-plan → `recipes.slice(0, 4)`.
- Body fat → constantă `24.5`.
- Health Sync → copy.
- Teams → `useState` local, se pierde la refresh.
- Reminders → checkbox persistat, zero `Notification`.
- Premium → un click, fără plată.
- `LoggingDock meal="lunch"` — text/barcode/AI cad **mereu la prânz**, indiferent de masă.

**Stări limită**

| Stare | Realitate |
|---|---|
| Loading | Lipsă pe fetch-urile din `LoggingDock` (butoanele nu se disablează) |
| Error | Mesaj generic `noResults` / `unlockPremium`; nu distinge 404 vs 500 vs rețea |
| Empty | Jurnalul gol e OK după onboarding (reparat în v4) |
| Offline | SW network-first pe documente; **fără queue** de loguri; fără banner offline |
| Feedback | Status text scurt după log; fără toast sistem, fără undo |

**Responsivitate**

- Layout mobil: bottom nav, `pb-28`, paywall sheet pe mobil / modal pe md+.
- Viewport fără `maximumScale` (a11y zoom OK).
- Nu există breakpoint-uri testate automat; fără storybook.
- Nav a **îngropat** Rețete / Listă / Piață / Oala în profil — regresii UX față de taburile vechi.

### 3. Performanță, securitate & bune practici

**Securitate**

- **Nu există `.env` și nu se folosesc chei** — bine pentru demo, rău ca semn că nu există încă servicii reale.
- Premium „server-side” citește `x-farfurie-tier` din request. Clientul îl pune din localStorage. **Nu e autorizare.**
- `POST /api/food/log` acceptă `macros` arbitrare din body — fără auth, oricine poate inventa un log (ruta nici nu persistă, dar e un pattern periculos).
- `parse-text` / `search` / `barcode` sunt publice, fără rate limit.
- Poze de progres = dataURL în `localStorage` (plaintext, același origin, fără consimțământ GDPR, fără retenție).
- Fără CSP, fără security headers în `next.config.ts` (fișierul e gol).
- Fără `robots.txt`, privacy page, ToS.
- Input: parse-text e un matcher pe seed, nu sanitizare HTML (risc XSS mic cât timp nu randezi HTML liber).

**Performanță**

- Zero `next/dynamic` / lazy routes. `/app` încarcă jurnal + logging + custom food + widgets într-un singur client bundle.
- `framer-motion` e dependență, folosită punctual; `lucide-react` e OK.
- Persist rehydrate blochează UI via `ClientOnly`.
- Pozele în persist umflă JSON-ul Zustand; la ~5MB cota localStorage **strică tot store-ul** (jurnal inclus).
- PWA precache: doar `/`, `/app`, manifest, iconițe. Rute noi (`/app/fasting`, `/app/progress`) nu sunt în precache. Fără UX „versiune nouă”.
- Fonturi Google (Fraunces + Figtree) — OK, dar fără subsetting agresiv.

**Tipizare**

- TS strict aparent folosit; modelele de domeniu sunt bune **dar neconectate**.
- `POST /api/food/log` castează `request.json()` fără Zod/schema.
- Persist nu are migrări versionate dincolo de schimbarea numelui cheii (`farfurie-v4`); userii pe `v3` pornesc de la zero.

### 4. CI/CD, testare & deployment

| Element | Status |
|---|---|
| Unit tests | **25** (Vitest): `diary.test.ts`, `entitlements.test.ts`, `catalog.test.ts` |
| Store / UI tests | 0 |
| API route tests | 0 (catalog helpers da) |
| E2E | Playwright în `package.json`, **0 spec-uri** |
| Lint | Script `lint: next lint` — **rupt** pe Next 16 (`Invalid project directory ... /lint`). Config: `eslint-config-next@15.1.0` vs `next@16.3.3` |
| Typecheck | `tsc --noEmit` trece (verificat în sesiuni anterioare) |
| CI | **Nu există** `.github/workflows` |
| Deploy | `DEPLOY.md` = pași manuali Vercel; fără preview env, fără staging |
| PWA | `manifest.webmanifest` + `sw.js` network-first; fără workbox, fără update prompt |
| Secrets / env | Niciun pipeline, nicio variabilă |

Build-ul Next trece local. Asta e tot ce există ca „release gate”.

---

## Probleme identificate

### Critică — blochează lansarea sau minte utilizatorul

1. **Premium nu e o plată, e un flag în localStorage.** Paywall-ul apelează `setSubscriptionTier("premium")`. Profilul are butoane Free/Premium. API-ul citește `x-farfurie-tier`. Oricine e Premium din DevTools. Nu se poate factura, revoca, audita. `src/components/Paywall.tsx`, `src/server/premium.ts`

2. **Nu există persistență de producție.** Jurnal, greutate, poze (base64) stau în `localStorage`. Limită ~5MB; un set de poze umple cota și **strică tot store-ul**. Alt browser/dispozitiv = date pierdute. Date de sănătate necriptate.

3. **Catalogul e 30 SKU + 8 rețete, vândut ca bază verificată.** Spec-ul cere 10M. Search/barcode/text-parse operează doar pe `src/lib/foods.ts`. Fără Open Food Facts, USDA, sau licență magazin RO.

4. **AI foto/voce e un stub care loghează piept de pui.** `POST /api/food/ai-estimate` ignoră imaginea/audio (nici nu le primește) și întoarce `pui-piept` 180g cu `demo: true`. A-l arăta ca „Photo Food Logging” în paywall e risc de produs (și de respingere în magazin).

5. **Modelele de domeniu nu sunt sursa de adevăr.** `src/domain/models.ts` vs Zustand `DiaryEntry` / `WeekPlan` / `fastingStartedAt`. Două scheme = drift garantat la backend.

6. **Fără identitate, fără CI, fără deploy automat.** Zero GitHub Actions. `DEPLOY.md` e ghid manual. `next lint` eșuează. Playwright e dependență moartă.

7. **Poze de progres în persist = risc GDPR / confidențialitate.** Imagini corporale în plaintext în browser, fără consimțământ explicit, fără ștergere selectivă, fără retenție.

### Medie — strică calitatea sau blochează un release onest

8. **Entitlements catalogate dar neimplementate în UI:** `dynamicCalories`, `dietType`, `mealPlanBuilder`, `personalizedRecipes`, `autoServings`, `syncedPlans`, `exportPlanPdf`, `bodyFatCalc`, `measurements`, `aiFoodCreate`, `fastingWidgets`. Câmpuri în store (`dietType`, `measurements`) **fără ecran**.

9. **`/api/food/log` e mort.** Clientul scrie direct în Zustand după parse/barcode. Două căi de scriere când apare serverul.

10. **Auto meal plan e trivial.** `recipes.slice(0, 4)` pe ziua curentă, fără macros, preferințe, rest de kcal.

11. **Barcode fără cameră.** Input text + 8 EAN-uri în `src/server/catalog.ts`.

12. **Reminders nu trimit notificări.** Checkbox persistat; SW nu face `showNotification`.

13. **Teams nu e comunitate.** State React local, se resetează la refresh, fără chat.

14. **Body fat e o constantă.** `addBodyFatLog(24.5)`.

15. **Health Sync e copy.** Corect ca disclaimer, greșit ca feature card în paywall.

16. **Dublă logică de obiective.** `store.effectiveGoals()` și `useEffectiveGoals()` copiază aceeași formulă.

17. **`ClientOnly` pe tot `/app` și landing** — flash, SEO slab, totul e client.

18. **PWA incompletă.** Precache doar `/` și `/app`; fără update UX.

19. **Lint/tooling:** `eslint-config-next@15` vs `next@16`; script `lint` inutil.

20. **Landing Unsplash hotlink** — terț, fără control de licență.

21. **Fără stări de rețea.** `LoggingDock` fără loading/disabled, fără retry, fără offline queue.

22. **Nav a îngropat Rețete / Listă / Piață / Oala** în profil.

23. **LoggingDock hardcodat pe `lunch`.** Text/barcode/AI nu respectă masa selectată în jurnal.

### Minoră

24. Paywall afișează id-ul intern de feature (`photoLog`) utilizatorului.  
25. Upgrade copy zice explicit „demo” — bine pentru dev, inacceptabil în store.  
26. `generateAutoPlan` nu respectă `dietType`.  
27. CSV/export nu include greutate (spec: consum + greutate).  
28. Fasting custom 20:4 din spec lipsește (există 18:6 și OMAD).  
29. Fără `robots.txt` / OG image proprie / privacy page.  
30. Teste: 25 unit pe helpers; 0 pe store, Paywall, API routes, e2e.  
31. `package.json` `version: 0.1.0` + `private: true` — aliniat cu realitatea, nu cu landing-ul.

---

## Roadmap „Ce mai este nevoie” (lansare onestă)

Ordinea e intenționată: **nu mai adăuga ecrane Premium până 1–3 sunt true.**

### Faza 0 — Decizie de produs

Alege **un** release:

- **R1 Farfurie Diary:** jurnal local, 30–500 alimente RO, fără AI, fără Teams, Premium amânat.  
- **R2 Fitia-class:** conturi + plăți + catalog mare + AI real. Asta e un produs nou, nu un polish pe Zustand.

Tot ce urmează presupune că vrei **R2**, cu un **R1 intermediar shippable**.

### Faza 1 — Fundație (production spine)

1. Conturi (email magic link / Apple / Google) + user id real pe fiecare log.  
2. Bază (Postgres + RLS, ex. Supabase) pentru `food_logs`, `weight_logs`, `profiles`, `subscriptions`. Migrare de la `domain/models.ts` ca schemă **unică**; store-ul devine cache, nu sursă.  
3. Înlocuiește `x-farfurie-tier` cu JWT / `app_metadata.plan` verificat **server-side**.  
4. Pipeline: GitHub Action `pnpm test && pnpm exec tsc --noEmit && pnpm build`; `lint` → `eslint src`.  
5. Politică: Privacy, ToS, disclaimer medical, ștergere date.

### Faza 2 — Jurnal care merită bani

6. Catalog: Open Food Facts (barcode global) + seed RO (Napolact etc.) ca strat 1. Nu pretinde 10M până ai un număr măsurat.  
7. Barcode: `BarcodeDetector` / html5-qrcode pe cameră.  
8. Text logging: păstrează parserul, dar scrie **doar** prin `POST /api/food/log` autentificat.  
9. Foto/voce: **nu le arăta** până există un vendor (vision+nutrition) cu eroare și confidențialitate; altfel scoate-le din paywall.  
10. Loading / error / empty pe `LoggingDock`; queue offline.  
11. `LoggingDock` folosește masa selectată, nu `lunch` hardcodat.

### Faza 3 — Monetizare reală

12. Stripe Billing (web) sau RevenueCat (nativ ulterior). Paywall → Checkout; webhook setează `tier`.  
13. Feature flags din server, nu din persist.  
14. Downgrade: păstrează datele, taie AI/fasting/export.

### Faza 4 — Restul spec-ului, unul câte unul

15. Progress: input real % grăsime + US Navy calculator; formular măsurători; poze în **object storage privat**, nu localStorage.  
16. Planner: algoritm pe macros rămase + `dietType`; PDF (server); notificări (Web Push).  
17. Fasting: protocol custom; push start/stop. Widgets native = app iOS/Android, nu PWA.  
18. Teams/chat = produs separat (moderation, abuse). Nu ține-l în MVP.  
19. HealthKit/Health Connect = wrapper nativ (Capacitor/RN), imposibil onest pe web.

### Faza 5 — Calitate

20. Teste API (parse, barcode, 401/402).  
21. Playwright: onboarding → log text → ziua următoare încă e goală → paywall nu dă Premium fără plată.  
22. Bundles: lazy routes `/app/fasting`, `/app/compare`.  
23. CSP, headers, fără Unsplash hotlink.

---

## Recomandare imediată (primele 3 acțiuni, acum)

1. **Îngheață scope-ul.** Scrie în `PRODUCT.md` un release R1: jurnal + plan manual + greutate + PWA, **fără** AI/Teams/Health. Tot ce e mock iese din paywall și din landing. Altfel fiecare sprint umple găuri de teatru.

2. **Oprește Premium-ul fals.** Scoate `setSubscriptionTier("premium")` din Paywall-ul de producție (lasă-l doar în profil, marcat „dev”). Înlocuiește copy-ul „Activează Premium (demo)”. Header-ul `x-farfurie-tier` nu este autorizare — documentează-l ca temporar sau șterge-l.

3. **Pune CI pe verde.** Action: `pnpm test && pnpm exec tsc --noEmit && pnpm build`. Repară scriptul `lint` (`eslint src`). Asta e cea mai ieftină plasă înainte să mai crească `src/modules`.

După cele trei: **catalog real (OFF + seed RO) + `POST /api/food/log` ca singura scriere** — abia atunci are rost un backend de useri.

---

## Anexă — evidență din cod

| Afirmație | Unde |
|---|---|
| 30 alimente | `src/lib/foods.ts` |
| 8 rețete | `src/lib/recipes.ts` |
| 8 barcode-uri | `BARCODES` în `src/server/catalog.ts` |
| AI demo piept de pui | `src/app/api/food/ai-estimate/route.ts` |
| Premium local | `Paywall` → `setSubscriptionTier`; și `ProfileBoard` |
| Gate spoofabil | `tierFromRequest` citește header |
| Log API nefolosit de UI | `LoggingDock` apelează parse-text, barcode, ai-estimate — nu `/api/food/log` |
| LoggingDock pe lunch | `src/app/app/page.tsx` |
| Body fat 24.5 | `src/modules/progress-tracker/ProgressExtras.tsx` |
| Auto plan slice(0,4) | `store.generateAutoPlan` |
| Fără CI | nu există `.github/` |
| `next lint` rupt | Next 16 CLI fără comanda `lint` |
| 25 teste unit | `diary.test.ts`, `entitlements.test.ts`, `catalog.test.ts` |
| Persist | `farfurie-v4` în Zustand persist |
| `next.config.ts` | gol — fără headers, fără bundle hints |
