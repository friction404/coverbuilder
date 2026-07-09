const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright-core");

const cwd = path.resolve(__dirname, "..");
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const screenshotDir = path.join(os.tmpdir(), "coverbuilder-qa");
fs.mkdirSync(screenshotDir, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clickButton(page, text) {
  await page.getByRole("button", { name: text }).click();
  await page.waitForTimeout(150);
}

(async () => {
  const server = spawn("C:\\Program Files\\nodejs\\node.exe", ["scripts/static-server.cjs", "dist", "5190"], {
    cwd,
    stdio: "ignore",
    windowsHide: true
  });

  try {
    await wait(800);
    const browser = await chromium.launch({
      executablePath: chrome,
      headless: true
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto("http://127.0.0.1:5190", { waitUntil: "networkidle" });
    const desktopPath = path.join(screenshotDir, "coverbuilder-desktop.png");
    await page.screenshot({ path: desktopPath, fullPage: true });

    const headings = [];
    const checks = {};
    headings.push(await page.locator("h1").innerText());
    const initialBody = await page.locator("body").innerText();
    checks.initialApplicationRailHidden = !initialBody.includes("YOUR APPLICATION");
    checks.initialPremiumHidden = !initialBody.includes("$29.75/month");
    await clickButton(page, "NEXT");
    headings.push(await page.locator("h1").innerText());
    await clickButton(page, "CALCULATE QUOTE");
    headings.push(await page.locator("h1").innerText());
    const calculatedBody = await page.locator("body").innerText();
    checks.premiumVisibleAfterCalculation = calculatedBody.includes("$29.75/month");
    checks.applicationRailStillHiddenDuringCoverSelection = !calculatedBody.includes("YOUR APPLICATION");
    await clickButton(page, "CONTINUE");
    headings.push(await page.locator("h1").innerText());
    await clickButton(page, "START APPLICATION");
    headings.push(await page.locator("h1").innerText());
    const applicationBody = await page.locator("body").innerText();
    checks.applicationRailVisibleAfterStart = applicationBody.includes("YOUR APPLICATION");
    await clickButton(page, "START APPLICATION");
    headings.push(await page.locator("h1").innerText());

    const mobile = await browser.newPage({ viewport: { width: 390, height: 1100 } });
    await mobile.goto("http://127.0.0.1:5190", { waitUntil: "networkidle" });
    const mobilePath = path.join(screenshotDir, "coverbuilder-mobile.png");
    await mobile.screenshot({ path: mobilePath, fullPage: true });

    await browser.close();
    console.log(JSON.stringify({ headings, checks, screenshots: { desktopPath, mobilePath } }, null, 2));
  } finally {
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
