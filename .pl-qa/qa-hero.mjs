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
    colorScheme: opts.dark ? "dark" : "light",
  });
  if (opts.amharic) {
    await context.addCookies([{ name: "pharmalink-locale", value: "am", url: base }]);
  }
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${width}/${opts.name}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${width}/${opts.name}: ${e.message}`));
  if (opts.dark) await page.addInitScript(() => localStorage.setItem("pharmalink-theme", "dark"));
  if (opts.amharic) await page.addInitScript(() => localStorage.setItem("pharmalink-locale", "am"));
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(2200);
  return { context, page };
}

const shots = [
  { w: 1440, h: 900, name: "1440" },
  { w: 1440, h: 900, name: "1440-dark", dark: true },
  { w: 834, h: 1112, name: "834", isMobile: true },
  { w: 390, h: 844, name: "390", isMobile: true, scale: 2 },
  { w: 390, h: 844, name: "390-dark", isMobile: true, scale: 2, dark: true },
  { w: 390, h: 844, name: "390-am", isMobile: true, scale: 2, amharic: true },
  { w: 320, h: 568, name: "320", isMobile: true, scale: 2 },
  { w: 320, h: 568, name: "320-am", isMobile: true, scale: 2, amharic: true },
  { w: 844, h: 390, name: "844x390", isMobile: true, scale: 2 },
];

const report = [];

for (const s of shots) {
  const { context, page } = await open(s.w, s.h, s);
  const headerAtTop = await page.evaluate(() => {
    const bar = document.querySelector("header > div");
    const cs = getComputedStyle(bar);
    return { bg: cs.backgroundColor, border: cs.borderColor, shadow: cs.boxShadow, blur: cs.backdropFilter };
  });
  await page.screenshot({ path: out + `qa-hero-${s.name}.png`, caret: "initial" });

  await page.evaluate(() => window.scrollTo(0, 220));
  await page.waitForTimeout(700);
  const headerScrolled = await page.evaluate(() => {
    const bar = document.querySelector("header > div");
    const cs = getComputedStyle(bar);
    return { bg: cs.backgroundColor, border: cs.borderColor, shadow: cs.boxShadow, blur: cs.backdropFilter };
  });
  await page.screenshot({
    path: out + `qa-header-${s.name}.png`,
    clip: { x: 0, y: 0, width: s.w, height: Math.min(s.h, 110) },
    caret: "initial",
  });

  // Keyboard focus should be visible in the header after one Tab.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press("Tab");
  await page.waitForTimeout(250);
  await page.screenshot({
    path: out + `qa-focus-${s.name}.png`,
    clip: { x: 0, y: 0, width: s.w, height: Math.min(s.h, 120) },
    caret: "initial",
  });

  const layout = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const img = document.querySelector("section img");
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      h1: h1 ? { w: Math.round(h1.getBoundingClientRect().width), h: Math.round(h1.getBoundingClientRect().height) } : null,
      image: img ? { src: img.currentSrc.split("?")[0], w: img.naturalWidth, h: img.naturalHeight } : null,
    };
  });

  report.push({ name: s.name, headerAtTop, headerScrolled, layout });
  await context.close();
}

console.log(JSON.stringify({ report, errors }, null, 2));
await browser.close();
