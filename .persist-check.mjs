import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);
// complete quests
await page.getByRole("button", { name: "Quests", exact: true }).click();
await page.waitForTimeout(400);
const btns = page.locator('button[aria-label^="Complete quest:"]');
let g = 0;
while ((await btns.count()) > 0 && g++ < 20) { await btns.first().click(); await page.waitForTimeout(200); }
const before = await page.evaluate(() => JSON.parse(localStorage.getItem("ascend-player-v1") || "null")?.totalXp);
await page.waitForTimeout(6000);
// same-context reload
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);
const after = await page.evaluate(() => JSON.parse(localStorage.getItem("ascend-player-v1") || "null")?.totalXp);
const region = await page.locator("text=Forest of Resolve").count();
console.log(JSON.stringify({ xpBeforeReload: before, xpAfterReload: after, persisted: before === after, forestLabelVisible: region > 0 }));
await browser.close();
