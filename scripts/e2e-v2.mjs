import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => {
  if (msg.type() !== "error") return;
  const text = msg.text();
  if (/403|WebSocket|hmr|_next\/webpack/i.test(text)) return;
  errors.push(`console: ${text}`);
});

async function shot(name) {
  await page.screenshot({ path: `/opt/cursor/artifacts/${name}.png`, fullPage: true });
}

try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Începe jurnalul|Start your diary/ }).first().click();
  await page.waitForURL("**/app");
  await page.getByRole("button", { name: /Sari peste|Skip/ }).click({ timeout: 15000 });
  await page.getByRole("heading", { name: /Jurnal|Diary/ }).waitFor();
  await shot("01-diary");

  await page.getByRole("button", { name: /^Adaugă$|^Add$/ }).first().click();
  await page.getByPlaceholder(/Caută|Search/).fill("5941008000123");
  await page.getByRole("button", { name: /Adaugă ·|Add ·/ }).click();
  await page.getByText(/Napolact|Iaurt/).first().waitFor();

  await page.getByRole("button", { name: /Adaugă farfuria|Add this plate/ }).first().click();
  await page.getByRole("button", { name: /Loghează o bere|Log a beer/ }).click();
  await shot("02-diary-logged");

  await page.goto(`${BASE}/app/scan`);
  await page.getByRole("heading", { name: /Scanează|Scan/ }).waitFor();
  await page.getByRole("button", { name: /Iaurt natural|Natural yogurt/ }).first().click();
  await shot("03-scan");

  await page.goto(`${BASE}/app/coach`);
  await page.getByRole("button", { name: /Am băut bere|I had a beer/ }).click();
  await page.getByText(/Alcoolul|Alcohol/).waitFor();
  await shot("04-coach");

  await page.goto(`${BASE}/app/builder`);
  await page.getByPlaceholder(/Adaugă ingredient|Add ingredient/).fill("ton");
  await page.getByRole("button", { name: /ton|Tuna/i }).first().click();
  await page.getByPlaceholder(/Numele mesei|Meal name/).fill("Prânz test");
  await page.getByRole("button", { name: /Salvează ca masă|Save as meal/ }).click();
  await shot("05-builder");

  await page.goto(`${BASE}/app/compare`);
  await page.getByRole("heading", { name: /Compară|Compare/ }).waitFor();
  await shot("06-compare");

  await page.goto(`${BASE}/app/insights`);
  await page.getByRole("heading", { name: /Progres|Progress/ }).waitFor();
  await page.getByRole("button", { name: /Descarcă CSV|Download CSV/ }).waitFor();
  await shot("07-insights");

  await page.goto(`${BASE}/app/profile`);
  await page.getByRole("button", { name: /Mod întunecat|Dark mode/ }).click();
  await page.waitForTimeout(300);
  const dark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  if (!dark) throw new Error("dark class not applied");
  await shot("08-dark-profile");

  await page.goto(`${BASE}/app`);
  await page.getByRole("heading", { name: /Jurnal|Diary/ }).waitFor();
  await shot("09-diary-dark");

  const crash = errors.some((e) => /Maximum update depth|#185/i.test(e));
  if (crash) throw new Error(`React loop: ${errors.join(" | ")}`);

  console.log(JSON.stringify({ ok: true, errors, url: page.url() }, null, 2));
} catch (err) {
  await shot("fail");
  console.error("FAIL", err);
  console.error("page errors", errors);
  process.exitCode = 1;
} finally {
  await browser.close();
}
