# Farfurie

Romania-first calorie & recipe tracker (RO/EN), usable internationally.

## Deploy

See [DEPLOY.md](./DEPLOY.md) for GitHub + Vercel (browser steps, no agent tokens required).

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Or `pnpm ci` — same gate as GitHub Actions (`.github/workflows/ci.yml`).

## Product

**R1 freeze** (this PR): honest local diary + optional account, OFF scan, metabolic program. No paid Premium. Plate photo stays in-app as a heuristic, not as landing AI. See [PRODUCT.md](./PRODUCT.md).

See [PRODUCT.md](./PRODUCT.md) for competitive analysis and differentiators.

### Features

1. **Umple golul** — meal suggestions that close remaining calories *and* protein
2. **Oala comună** — split a shared pot by household members
3. **Calendarul pieței** — seasonal Romanian produce + cheap protein ranking
4. **Mod Sărbători** — +15% flexible holiday budget
5. **Porții românești** — farfurie / lingură / pahar units
6. **Magazin RO first** — Napolact, Scandia, Pilos, etc.
7. **Profil** — BMR/TDEE goals from your stats
8. **Listă de cumpărături** — from recipes
9. **Post intermitent** — 16:8 and more
10. **Mișcare** — exercise log with calories burned
11. **PWA** — installable on phone (Add to Home Screen)
12. **Onboarding** — first-run goals wizard
13. **Plan săptămânal** — recipes by day → diary + shopping list
