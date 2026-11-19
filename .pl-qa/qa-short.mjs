import { chromium } from "playwright";

const base = "http://localhost:3000/";
const out = "C:\\Code\\development\\PharmaLINK-FrontEnd\\.pl-qa\\";
const browser = await chromium.launch();
const errors = [];

for (const [w, h, name] of [
  [844, 390, "short-844"],
  [568, 320, "short-568"],
]) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${name}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const p = h1?.nextElementSibling;
    const search = document.querySelector("#search");
    const card = search?.firstElementChild;
    const rect = card?.getBoundingClientRect();
    return {
      h1Font: h1 ? getComputedStyle(h1).fontSize : null,
      h1Bottom: h1 ? Math.round(h1.getBoundingClientRect().bottom) : null,
      subtitleDisplay: p ? getComputedStyle(p).display : null,
      searchTop: rect ? Math.round(rect.top) : null,
      searchBottom: rect ? Math.round(rect.bottom) : null,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  await page.screenshot({ path: out + `qa-${name}.png`, caret: "initial" });
  console.log(name, JSON.stringify(data));
  await context.close();
}

console.log("errors", JSON.stringify(errors));
await browser.close();
