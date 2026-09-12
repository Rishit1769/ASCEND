import { chromium } from "playwright";

const level = process.argv[2] ?? "11";
const out = process.argv[3] ?? "/tmp/ascend-shot.png";
const preset = process.argv[4] ?? "medium";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });

const logs = [];
page.on("console", (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForTimeout(5000);
await page.getByRole("button", { name: "PREVIEW WORLD" }).click();
await page.waitForTimeout(400);
await page.locator('select[aria-label="Preview graphics preset"]').selectOption(preset);
await page.waitForTimeout(400);
await page.locator('select[aria-label="Preview checkpoint"]').selectOption(level);
await page.waitForTimeout(14000);

await page.screenshot({ path: out });

const info = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  const parse = (k) => { try { return JSON.parse(canvas?.dataset?.[k] ?? "null"); } catch { return canvas?.dataset?.[k] ?? null; } };
  return {
    worldState: parse("worldState"),
    realmCamera: parse("realmCamera"),
    sceneStats: parse("sceneStats"),
    waterState: parse("waterState"),
  };
});
console.log("RUNTIME:", JSON.stringify(info, null, 2));
console.log("LOGS:\n" + logs.slice(-14).join("\n"));
await browser.close();
