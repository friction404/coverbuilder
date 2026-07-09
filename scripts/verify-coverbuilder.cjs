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
    checks.initialHelpButtonsVisible = (await page.locator(".help-button").count()) >= 5;
    await page.locator(".help-button").first().click();
    checks.assistantDrawerOpens = await page.getByText("Need help with this question?").isVisible();
    await page.getByRole("button", { name: "why is this information important?" }).click();
    checks.mockAnswerRendersInChat = (await page.locator(".assistant-chat").innerText()).includes("TAL asks this because");
    await page.getByLabel("Ask your own question").fill("What if I am not sure about the exact date?");
    await page.getByRole("button", { name: "ASK AI", exact: true }).click();
    const customAnswerText = await page.locator(".assistant-chat").innerText();
    checks.customQuestionAnswerRendersInChat =
      customAnswerText.includes("For this prototype") &&
      customAnswerText.includes("best current knowledge");
    checks.customQuestionClearsComposer = (await page.getByLabel("Ask your own question").inputValue()) === "";
    const chatBox = await page.locator(".assistant-chat").boundingBox();
    const composerBox = await page.locator(".assistant-custom").boundingBox();
    checks.chatTranscriptAboveComposer = Boolean(chatBox && composerBox && chatBox.y + chatBox.height <= composerBox.y);
    const assistantPath = path.join(screenshotDir, "coverbuilder-assistant.png");
    await page.screenshot({ path: assistantPath, fullPage: true });
    const popupBox = await page.locator(".assistant-drawer").boundingBox();
    const viewport = page.viewportSize();
    checks.assistantPopupAnchoredBottomRight = Boolean(
      popupBox &&
        viewport &&
        Math.abs(viewport.width - (popupBox.x + popupBox.width) - 24) <= 2 &&
        Math.abs(viewport.height - (popupBox.y + popupBox.height) - 24) <= 2
    );
    await page.getByRole("button", { name: "Close AI assistant" }).click();
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
    checks.applicationQuestionHelpButtonsVisible = (await page.locator(".help-button").count()) >= 1;

    const mobile = await browser.newPage({ viewport: { width: 390, height: 1100 } });
    await mobile.goto("http://127.0.0.1:5190", { waitUntil: "networkidle" });
    const mobilePath = path.join(screenshotDir, "coverbuilder-mobile.png");
    await mobile.screenshot({ path: mobilePath, fullPage: true });
    await mobile.locator(".help-button").first().click();
    await mobile.getByRole("button", { name: "how should I answer?" }).click();
    checks.mobileAssistantChatRenders = (await mobile.locator(".assistant-chat").innerText()).includes("Answer based on your situation today");
    const mobileAssistantPath = path.join(screenshotDir, "coverbuilder-mobile-assistant.png");
    await mobile.screenshot({ path: mobileAssistantPath, fullPage: true });

    await browser.close();
    console.log(JSON.stringify({ headings, checks, screenshots: { desktopPath, assistantPath, mobilePath, mobileAssistantPath } }, null, 2));
  } finally {
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
