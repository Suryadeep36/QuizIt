const puppeteer = require("puppeteer");

const PLAYERS = 50;
const QUESTIONS = 3;

const URL =
  "https://quiz-it-smart.vercel.app/quiz/c3c6721d-deca-404c-b887-509fd85767ca/join/c8ac9038-e1c2-4ef2-ab65-6ef43919b3ce";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulatePlayer(browser, id) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: "networkidle2" });

  await page.waitForSelector('input[placeholder="Enter your name"]', {
    timeout: 180000,
  });

  await page.type('input[placeholder="Enter your name"]', `player-${id}`);
  await page.click("button");

  console.log(`Player ${id} joined`);

  await page.waitForSelector("h2.text-2xl, h2.text-3xl", { timeout: 180000 });

  for (let q = 1; q <= QUESTIONS; q++) {
    console.log(`Player ${id} waiting for question ${q}`);

    await page.waitForSelector("main button", { timeout: 180000 });

    await page.evaluate(() => {
      const optionButtons = Array.from(
        document.querySelectorAll("main button"),
      ).filter((btn) => !btn.innerText.includes("Submit"));

      const random =
        optionButtons[Math.floor(Math.random() * optionButtons.length)];

      random.click();
    });

    await sleep(500 + Math.random() * 2000);

    await page.evaluate(() => {
      const submit = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Final Submit"),
      );

      if (submit) submit.click();
    });

    console.log(`Player ${id} answered question ${q}`);

    await sleep(2000);
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
