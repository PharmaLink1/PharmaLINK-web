import { chromium } from "playwright";

const base = "http://localhost:3000/";
const out = "C:\\Code\\development\\PharmaLINK-FrontEnd\\.pl-qa\\";
const errors = [];
const browser = await chromium.launch();

async function open(width, height, opts = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: opts.isMobile ?? false,
    deviceScaleFactor: opts.scale ?? 1,
  });
  if (opts.amharic) await context.addCookies([{ name: "pharmalink-locale", value: "am", url: base }]);
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${width}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${width}: ${e.message}`));
  if (opts.dark) await page.addInitScript(() => localStorage.setItem("pharmalink-theme", "dark"));
  if (opts.amharic) await page.addInitScript(() => localStorage.setItem("pharmalink-locale", "am"));
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3500);
  return page;
}

const desktop = await open(1440, 900);
await desktop.screenshot({ path: out + "final-desktop.png" });
for (const [sel, name] of [
  ["main section:nth-of-type(2)", "final-tagline"],
  ["#compare", "final-compare"],
  ["#how", "final-how"],
  ["#audiences", "final-audiences"],
]) {
  await desktop.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), sel);
  await desktop.waitForTimeout(1300);
  await desktop.screenshot({ path: out + name + ".png" });
}
await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await desktop.waitForTimeout(1300);
await desktop.screenshot({ path: out + "final-cta.png" });
await desktop.evaluate(() => window.scrollTo(0, 0));
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: out + "final-full.png", fullPage: true });

const mobile = await open(390, 844, { isMobile: true, scale: 2 });
await mobile.screenshot({ path: out + "final-mobile.png" });

const summary = await desktop.evaluate(() => ({
  docWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
  sections: [...document.querySelectorAll("main section")].map((s) => ({
    id: s.id || "(none)",
    h: Math.round(s.getBoundingClientRect().height),
  })),
}));

console.log(JSON.stringify({ summary, errors }, null, 2));
await browser.close();
