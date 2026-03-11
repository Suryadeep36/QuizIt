const puppeteer = require("puppeteer");

const PLAYERS = 50;
const QUESTIONS = 2;

const URL =
  "https://quiz-it-smart.vercel.app/quiz/6c05befa-0511-4233-bb10-3d76518b36fa/join/1ee9e8dc-c1fb-4056-b6e4-ad0c6776e514";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulatePlayer(browser, id) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });

  await page.waitForSelector('input[placeholder="Enter your name"]', {
    timeout: 180_000,
  });
  await page.type('input[placeholder="Enter your name"]', `player-${id}`);
  const buttons = await page.$$("button");
  // Find the one with text "Join Quiz"
  const joinButton = buttons.find(async (b) => {
    const text = await page.evaluate((el) => el.innerText, b);
    return text.trim() === "Join Quiz";
  });
  if (joinButton) await joinButton.click();

  console.log(`Player ${id} joined`);

  await page.waitForSelector('main button:not(:has-text("Final Submit"))', {
    timeout: 180_000,
  });

  for (let q = 1; q <= QUESTIONS; q++) {
    console.log(`Player ${id} waiting for question ${q}`);

    const allButtons = await page.$$("main button");
    const answerButtons = [];
    for (let btn of allButtons) {
      const text = await page.evaluate((el) => el.innerText, btn);
      if (!text.includes("Final Submit")) answerButtons.push(btn);
    }
    // Click random answer
    const randomIndex = Math.floor(Math.random() * answerButtons.length);
    await answerButtons[randomIndex].click();

    await sleep(500 + Math.random() * 2000);

    const [submit] = await page.$x("//button[contains(., 'Final Submit')]");
    if (submit) await submit.click();

    console.log(`Player ${id} answered question ${q}`);

    await page.waitForTimeout(2000);
    if (q < QUESTIONS) {
      await page.waitForSelector('main button:not(:has-text("Final Submit"))', {
        timeout: 180_000,
      });
    }
  }

  console.log(`Player ${id} finished quiz`);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const players = [];
  for (let i = 1; i <= PLAYERS; i++) {
    players.push(simulatePlayer(browser, i));
  }
  await Promise.all(players);
  console.log("All players finished quiz");
})();
