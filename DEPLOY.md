# Deploy Farfurie (GitHub + Vercel) — fără token în agent

Agentul nu are acces la contul tău GitHub/Vercel (tokenurile au fost sărite).
Poți publica tu în ~5 minute din browser.

## 1) GitHub

1. Mergi la https://github.com/new  
2. Nume: `farfurie`  
3. **Public** (sau Private)  
4. **Nu** bifa README / .gitignore / license (repo gol)  
5. Creează repo-ul

Apoi, pe calculatorul tău (sau în Cursor local), din folderul proiectului:

```bash
cd farfurie
git remote add origin https://github.com/<USER>/farfurie.git
git branch -M main
git push -u origin main
```

Dacă lucrezi doar din acest Cloud Agent: după ce creezi repo-ul gol, trimite-mi linkul  
`https://github.com/<USER>/farfurie` **și** un `GITHUB_TOKEN` (scope `repo`) — atunci fac eu push-ul.

## 2) Vercel

1. https://vercel.com/new  
2. **Import** repo-ul `farfurie`  
3. Framework: **Next.js** (autodetect)  
4. Install Command: `pnpm install`  
5. Build Command: `pnpm build`  
6. Output: default (Next.js)  
7. Deploy

Primești un URL tip: `https://farfurie.vercel.app`

## 3) Verificare locală înainte

```bash
pnpm install
pnpm build
pnpm start
```

## Status acum

- Codul e pregătit (Next.js 16 + pnpm)  
- Build-ul trece local  
- Preview temporar (cât rulează agentul): vezi mesajul anterior cu linkul Cloudflare
