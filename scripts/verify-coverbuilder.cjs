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
    await page.goto("http://127.0.0.1:5190/customer", { waitUntil: "networkidle" });
    const desktopPath = path.join(screenshotDir, "coverbuilder-desktop.png");
    await page.screenshot({ path: desktopPath, fullPage: true });

    const headings = [];
    const checks = {};
    headings.push(await page.locator("h1").innerText());
    checks.customerRouteLoads = page.url().endsWith("/customer");
    const initialBody = await page.locator("body").innerText();
    checks.initialApplicationRailHidden = !initialBody.includes("YOUR APPLICATION");
    checks.initialPremiumHidden = !initialBody.includes("$29.75/month");
    checks.initialHelpButtonsVisible = (await page.locator(".help-button").count()) >= 5;
    await page.locator(".help-button").first().click();
    checks.assistantDrawerOpens = await page.getByText("Need help with this question?").isVisible();
    checks.coverBuddyNameVisible = await page.locator(".assistant-header").getByText("COVERBUDDY", { exact: true }).isVisible();
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
    await page.getByRole("button", { name: "Close CoverBuddy" }).click();
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
    await mobile.goto("http://127.0.0.1:5190/customer", { waitUntil: "networkidle" });
    const mobilePath = path.join(screenshotDir, "coverbuilder-mobile.png");
    await mobile.screenshot({ path: mobilePath, fullPage: true });
    await mobile.locator(".help-button").first().click();
    await mobile.getByRole("button", { name: "how should I answer?" }).click();
    checks.mobileAssistantChatRenders = (await mobile.locator(".assistant-chat").innerText()).includes("Answer based on your situation today");
    const mobileAssistantPath = path.join(screenshotDir, "coverbuilder-mobile-assistant.png");
    await mobile.screenshot({ path: mobileAssistantPath, fullPage: true });

    const frictionPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await frictionPage.goto("http://127.0.0.1:5190/customer", { waitUntil: "networkidle" });
    await frictionPage.waitForTimeout(10500);
    const mediumFrictionText = await frictionPage.locator(".friction-message").innerText();
    checks.mediumFrictionGuidanceOpens =
      mediumFrictionText.includes("Need a hand with this question?") &&
      mediumFrictionText.includes("how to think about your answer") &&
      !mediumFrictionText.includes("Score") &&
      !mediumFrictionText.includes("Signals") &&
      !mediumFrictionText.includes("Possible reason");
    const mediumFrictionPath = path.join(screenshotDir, "coverbuilder-medium-friction.png");
    await frictionPage.screenshot({ path: mediumFrictionPath, fullPage: true });
    await frictionPage.getByRole("button", { name: "Close CoverBuddy" }).click();
    const firstField = frictionPage.locator(".field input").first();
    await firstField.fill("02/02/1984");
    await firstField.fill("03/03/1984");
    await firstField.fill("04/04/1984");
    await firstField.fill("05/05/1984");
    await firstField.fill("06/06/1984");
    await firstField.fill("07/07/1984");
    await frictionPage.locator(".help-button").first().click();
    await frictionPage.getByRole("button", { name: "REQUEST A CALL" }).waitFor({ state: "visible", timeout: 3000 });
    const highFrictionText = await frictionPage.locator(".friction-message").innerText();
    checks.highFrictionCallSuggestionOpens =
      highFrictionText.includes("extra support") &&
      highFrictionText.includes("request a representative call") &&
      !highFrictionText.includes("Score") &&
      !highFrictionText.includes("Signals") &&
      !highFrictionText.includes("Possible reason") &&
      (await frictionPage.getByRole("button", { name: "REQUEST A CALL" }).isVisible());
    const highFrictionPath = path.join(screenshotDir, "coverbuilder-high-friction.png");
    await frictionPage.screenshot({ path: highFrictionPath, fullPage: true });

    const repPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await repPage.goto("http://127.0.0.1:5190/rep", { waitUntil: "networkidle" });
    checks.repRouteLoads = repPage.url().endsWith("/rep");
    checks.repDashboardOpens = (await repPage.locator("h1").innerText()) === "Rep dashboard";
    checks.repDashboardColumnsVisible =
      (await repPage.getByRole("columnheader", { name: "Customer" }).isVisible()) &&
      (await repPage.getByRole("columnheader", { name: "Stage" }).isVisible()) &&
      (await repPage.getByRole("columnheader", { name: "Friction score" }).isVisible()) &&
      (await repPage.getByRole("columnheader", { name: "Recommended action" }).isVisible());
    const handoffText = await repPage.locator(".handoff-panel").innerText();
    checks.handoffSummaryGenerated =
      handoffText.includes("Alex Taylor is paused at Your Health and Lifestyle") &&
      handoffText.includes("Customer may be unsure");
    await repPage.getByRole("button", { name: "SEND CONTINUATION LINK" }).click();
    checks.sendContinuationLinkNotice = await repPage.getByText("Continuation link sent to Alex Taylor.").isVisible();
    await repPage.getByRole("button", { name: "OFFER CALLBACK" }).click();
    checks.offerCallbackNotice = await repPage.getByText("Callback offer queued for Alex Taylor.").isVisible();
    const repDashboardPath = path.join(screenshotDir, "coverbuilder-rep-dashboard.png");
    await repPage.screenshot({ path: repDashboardPath, fullPage: true });
    await repPage.getByRole("button", { name: "TAKE OVER APPLICATION" }).click();
    checks.repTakeoverLandsAtStoppedStage =
      (await repPage.locator("h1").innerText()) === "Your Health and Lifestyle" &&
      (await repPage.getByText("Rep takeover active").isVisible()) &&
      repPage.url().endsWith("/rep/takeover/alex-taylor");
    checks.repCanContinueApplication = await repPage.getByRole("button", { name: "NEXT", exact: true }).isVisible();
    const repTakeoverPath = path.join(screenshotDir, "coverbuilder-rep-takeover.png");
    await repPage.screenshot({ path: repTakeoverPath, fullPage: true });

    const takeoverDeepLink = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await takeoverDeepLink.goto("http://127.0.0.1:5190/rep/takeover/priya-shah", { waitUntil: "networkidle" });
    checks.repTakeoverDeepLinkLoads =
      (await takeoverDeepLink.locator("h1").innerText()) === "Your Employment & Income" &&
      (await takeoverDeepLink.getByText("Priya Shah stopped at Your Employment & Income").isVisible());

    await browser.close();
    console.log(JSON.stringify({ headings, checks, screenshots: { desktopPath, assistantPath, mobilePath, mobileAssistantPath, mediumFrictionPath, highFrictionPath, repDashboardPath, repTakeoverPath } }, null, 2));
  } finally {
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
