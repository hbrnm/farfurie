# Audit Farfurie — 26 august 2026

**Obiect:** aplicația Farfurie (tracker de calorii și rețete, România-first, RO/EN)  
**Scope:** produs vs. ce e livrat, corectitudine nutrițională, UX, date, securitate, tehnic  
**Metodă:** revizuire completă a `src/` (~35 fișiere, ~3840 linii), calcule Mifflin–St Jeor reproduce pe cazuri, fără backend (nu există)

**Verdict:** MVP demo bine desenat, **nu un tracker de zi cu zi gata de producție**. Brandul, i18n-ul și diferențiatorii de marketing sunt clare. Modelul de date tratează totul ca „azi, pentru totdeauna”, iar ecranul de progres arată date inventate. Un utilizator real care revine a doua zi își găsește mesele de ieri încă în jurnal.

---

## 1. Ce e de fapt produsul

Farfurie e un **client Next.js 16**, fără API, fără cont, fără bază de date. Totul stă în `localStorage` (`farfurie-demo-v3`) prin Zustand persist.

| Strat | Realitate |
|---|---|
| UI | Landing + 8 ecrane în `/app` |
| Date alimente | **30** alimente seed (Napolact, Scandia, Pilos, Poiana…) |
| Rețete | **8** rețete hardcodate, macros per porție, nu calculate din ingrediente |
| Persistență | browser, un singur „ziua curentă” |
| Auth / sync / export | lipsă |

Footer-ul și `PRODUCT.md` spun corect „MVP demo”. Landing-ul și README-ul vând însă un tracker zilnic comparabil cu Yazio / MFP.

---

## 2. Produs vs. promisiuni

| Diferențiator (`PRODUCT.md`) | Status | Notă |
|---|---|---|
| Umple golul (kcal + proteină) | Parțial | Algoritm real în `fillTheGap`; loghează **mereu la cină** |
| Oala comună după obiective | Demo | Slider %; `goalKcal` **nu e folosit** |
| Calendarul pieței | Static | Hardcodat **august**, nu urmează data |
| Mod Sărbători | Toggle | +15% kcal/carbs/fat; planul de 48h e **doar text** pe Progres |
| Porții românești | Parțial | Unități (farfurie, felie) există; **nu poți schimba gramele** la adăugare |
| Magazin RO first | Seed | 30 SKU, nu o bază de magazine |
| Preț / proteină | Da | Top 5 din `priceRonPer100g` aproximativ |
| RO/EN first-class | Aproape | `i18n.ts` e consistent; câteva stringuri rămân inline |
| BMR / TDEE Mifflin–St Jeor | Da | Formula e corectă pe cazurile de bază |
| Listă din rețete | Da | Fără deduplicare |
| Post intermitent | Da | Timer pe ciclu, fără notificări |
| Mișcare | Da | kcal/min fixe, fără greutate/MET |
| PWA | Riscant | Service worker cache-first pe Next.js |
| Plan săptămânal | Da | „Aplică azi” **dublează** mesele la click repetat |
| Streak / progres săptămânal | Fals | Vezi P0 de mai jos |

---

## 3. Găsiri

Severitate: **P0** = strică utilitatea de tracker · **P1** = greșeală de produs/sănătate sau bug clar · **P2** = calitate / a11y / mentenanță.

### P0 — jurnalul nu are zile

**Fără model de dată.** `entries`, `waterMl`, `exerciseLogs` nu se resetează la miezul nopții și nu sunt indexate pe `YYYY-MM-DD`. `createdAt` există pe înregistrări, dar **nu e folosit** la filtrare.

Urmarea: după 24h, „Rămâne azi” tot scade din mesele de ieri. Aplicația nu poate fi folosită două zile la rând.

Fișiere: `src/lib/store.ts`, `src/lib/selectors.ts`.

---

### P0 — streak-ul e o constantă

`streak: 4` e seed. Nu există nicio acțiune care să-l incrementeze, decrementeze sau să-l lege de logarea meselor.

Fișier: `src/lib/store.ts` (stare inițială), afișat în `SideStats.tsx` și `InsightsPanel.tsx`.

---

### P0 — graficul săptămânal e inventat

```18:18:src/components/InsightsPanel.tsx
  const week = [1800, 2050, 1920, 2210, totals.kcal, 0, 0];
```

Luni–joi sunt numere hardcodate. Vineri e totalul **acumulat** (toate mesele din localStorage). Sâmbătă–duminică sunt 0. Ecranul „Progres” minte utilizatorul.

---

### P0 — date demo persistate ca și cum ar fi ale userului

La primul run, persist salvează:

- mic dejun 340 kcal + prânz 248 kcal deja logate
- apă **750 ml**
- 2 iteme în listă (unul bifat)
- favorite preselectate
- un plan săptămânal precompletat

Onboarding-ul calculează obiectivul, dar **nu golește jurnalul**. CTA-ul „Începe jurnalul” deschide un jurnal deja umplut.

Asta e OK pentru un demo de 30 de secunde; e greșit pentru un produs instalat ca PWA.

---

### P1 — dublă numărare a mișcării

TDEE include deja multiplicatorul de activitate (`sedentary` … `athlete`). `remaining` adaugă **încă o dată** kcal din `exerciseLogs` la buget:

```344:351:src/lib/store.ts
      remaining: () => {
        const goals = get().effectiveGoals();
        const totals = get().totals();
        const burned = get().burnedToday();
        // Net-style remaining: burned adds back to budget (optional MFP-like)
        const budget = goals.kcal + burned;
```

Pentru un profil „activ” + 45 min sală, bugetul e umflat de două ori. MFP face asta ca opțiune explicită („exercise extra”); aici e implicit și se combină cu TDEE.

---

### P1 — macros vs. kcal pot diverga

`calcMacroGoals` pune proteina la **1.8 g/kg**, grăsimea la 28% din kcal, apoi `carbs = max(..., 80)`. Pe deficit + greutate mare, etajul de 80 g carbs face suma macros > obiectivul caloric.

Exemplu (femeie, 85 kg, 155 cm, 55 ani, sedentar, slăbire): obiectiv **1260 kcal**, macros ≈ **1283 kcal** (+23). Nu e catastrofal, dar inelul de calorii și barele de macros spun lucruri diferite.

Podeaua de **1200 kcal** e aceeași pentru femei și bărbați; nu există validare (vârstă 0, greutate negativă din input `type=number`).

---

### P1 — Oala comună nu împarte după obiective

`Member.goalKcal` e setat (2100 / 2600 / 1800) și **niciodată citit**. Split-ul e doar `share / totalShare`. Slider-ele 10–70 nu sunt constrânse la 100%. Membrii nu se persistă, nu se pot adăuga/șterge, iar butonul loghează doar „porția ta” la cină.

Promisiunea din `PRODUCT.md` („split by household members with different goals”) nu e implementată.

---

### P1 — acțiuni care dublează date

| Acțiune | Comportament |
|---|---|
| Plan → „Aplică azi în jurnal” | Adaugă din nou aceleași rețete, de fiecare click |
| „Listă din plan” / „Adaugă în listă” | Concatenează ingrediente, fără merge |
| Rețete → „Adaugă în jurnal” | Mereu **prânz**, fără alegere de masă |
| Umple golul | Mereu **cină** |

`favoriteFoodIds` + `toggleFavoriteFood` există în store și **nu au UI**.

---

### P1 — PWA cache-first pe App Router

`public/sw.js` răspunde `cached \|\| network` pentru orice GET 200 same-origin, inclusiv chunk-uri JS hash-uite de Next. După un deploy, utilizatorul cu PWA poate primi HTML nou + JS vechi (ecran alb) sau invers.

`PRECACHE` acoperă doar `/`, `/app` și icoane. Rutele `/app/plan`, `/app/list` etc. depind de cache-ul oportunist.

`maximumScale: 1` în `src/app/layout.tsx` blochează zoom-ul — eșec WCAG 1.4.4.

---

### P2 — Calendarul pieței, i18n, landing, nav

- `augustMarket` + label „August · România” — nu există calendar pe lună. Comentariul din `market.ts` recunoaște demo-ul.
- `<html lang="ro">` nu urmărește `locale`.
- Landing-ul folosește persist **fără** `ClientOnly` (spre deosebire de `/app`) → risc de flash / hydration pe limbă.
- Hero Unsplash hotlink: dependență de terț, fără control de licență, tracking de imagini.
- Navigarea principală (5 taburi) **omite** Piața, Oala, Progres — sunt îngropate în profil.
- Rețetele nu au pașii de gătire în UI, deși `stepsRo` / `stepsEn` există în date.
- Porția la adăugare e mereu `defaultGrams`; fill-the-gap *scalează* gramele, picker-ul din jurnal nu.
- `eslint-config-next@15.1.0` vs `next@16.3.3`. Playwright e în `package.json`, **zero teste**.
- `html` pe landing e client-only pentru locale, dar nu e wrappuit.

---

## 4. Securitate și confidențialitate

Profil de risc **scăzut** (nu există server, auth, sau date medicale transmise). Nu e un audit de pentest.

| Subiect | Evaluare |
|---|---|
| XSS | Nu există `dangerouslySetInnerHTML` / `eval`. Text din store e renderat ca text React. OK pentru demo. |
| Secrete | Niciun `.env`, nicio cheie. OK. |
| Date de sănătate | Greutate, vârstă, mese — **doar pe dispozitiv**. Fără export, fără ștergere „cont”, fără politică de confidențialitate. |
| PWA / SW | Poate servi răspunsuri vechi; nu e un vector clasic, dar e un risc de integritate a app-ului. |
| Dependențe | Stack mic (Next, React, Zustand, Framer, Lucide). Nu s-a rulat `pnpm audit` ca poartă de merge — merită înainte de publicare. |
| CSP / headers | `next.config.ts` e gol. Acceptabil pentru demo. |

Când apare backend (conturi, AI scan, nutriționiști din `PRODUCT.md` v2), RLS, auth și minimizarea datelor de sănătate devin P0. Acum nu există suprafață de atac server.

---

## 5. Corectitudine nutrițională (pe scurt)

- Mifflin–St Jeor e implementat corect (bărbat `+5`, femeie `−161`).
- Multiplicatorii TDEE sunt valorile Harris–Benedict / standard (1.2–1.9).
- Deficit fix −400 / surplus +300 e simplist, dar transparent.
- Proteina 1.8 g/kg e agresivă pentru menținere / persoane sedentare; rezonabilă pentru slăbire cu sală. Nu e personalizabilă.
- Valorile per 100 g sunt plauzibile pentru un seed, **neverificate** față de etichete (Napolact / Scandia / Pilos).
- Rețete: `perServing` e independent de lista de ingrediente — modifici una, cealaltă nu se actualizează.
- Exercițiile: kcal/min fixe (ex. alergare 10 kcal/min) ignoră greutatea; o persoană de 50 kg vs 95 kg primește același burn.

Nu e sfat medical; UI-ul nu are disclaimer.

---

## 6. Sănătate tehnică

Puncte bune:

- Selectori Zustand (`src/lib/selectors.ts`) evită re-subscribe pe funcții din store (fixul din `959d90a`).
- `ClientOnly` pe shell evită mismatch persist pe `/app`.
- i18n cu chei tipate (`TranslationKey`).
- UI coerent (Fraunces + Figtree, tokenuri CSS, PWA manifest).

Datorii:

- Store-ul amestecă stare + metode derivate (`totals`, `remaining`) **și** duplicate în selectori — două surse de adevăr identice.
- Persist fără `version` / `migrate` (doar rename `v3`).
- Fără teste pe `goals.ts`, `fillGap.ts`, split oală, reset de zi.
- Service worker manual în loc de Serwist / Workbox cu `network-first` pe documente.

---

## 7. Recomandări (ordine de impact)

### Ca Farfurie să fie un jurnal real (înainte de orice feature nou)

1. **Model pe zile:** `entriesByDate`, `waterByDate`, `exerciseByDate`; „azi” = data locală; arhivă pe zile anterioare.
2. **Streak real** + grafic din istoric, nu constante.
3. **Seed vs. user:** onboarding golește jurnalul / apa / lista, sau un flag `isDemo` care se șterge la „Începe jurnalul”.
4. **Idempotență:** aplicarea planului și lista de cumpărături nu dublează.
5. **PWA:** `network-first` pe documente și pe `/_next/static`; bump `CACHE` la fiecare release.

### Ca diferențiatorii să fie adevărați

6. Oala: split proporțional cu `goalKcal` (sau g proteină), membri persistenti, log per persoană.
7. Piața: tabel pe 12 luni + `new Date().getMonth()`.
8. Porții: input de grame în picker; Umple golul să aleagă masa cu cel mai mare gol.
9. Mișcare: fie TDEE „sedentary + exercițiu logat”, fie TDEE cu activitate **fără** a adăuga iar burn-ul — nu ambele.
10. Disclaimer + reset date + export JSON.

### Abia apoi v2

Barcode, foto AI, baza de 40k SKU, sync, nutriționiști — toate cer backend. Nu scala demo-ul actual cu încă un ecran până există **zile**.

---

## 8. Rezumat executiv

Farfurie arată ca un produs; se comportă ca un **demo interactiv**. Cele 8 diferențiatoare din strategie sunt schițate în UI, dar trei dintre ele (zile, progres, oala după obiective) sunt scenografie. Riscul principal nu e securitatea, ci **încrederea**: un user care crede graficul și streak-ul va lua decizii alimentare pe date false.

Următorul pas util: implementarea P0 (zile + streak real + golire seed + grafic din istoric), nu feature-uri noi.
