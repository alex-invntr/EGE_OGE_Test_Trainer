// Снимки экранов для README и страницы «Как заниматься»: страницы открываются с диска в Chrome или Edge в фоне,
// картинки — в screenshots/dark/ и screenshots/light/ (одни и те же экраны в тёмной и светлой теме).
// Для правдоподобной картинки в отдельном профиле браузера заранее записывается немного прогресса.
// Запуск: node tools/make_screenshots.js [путь к браузеру]; puppeteer-core — в tools/node_modules или в NODE_PATH.

const path = require("path");
const fs = require("fs");
const os = require("os");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "..");
const ROOT_URL = "file:///" + ROOT.replace(/\\/g, "/") + "/";
const OUT = path.join(ROOT, "screenshots");
const BROWSERS = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const MAX_WIDTH = 850;                                      // ширина картинок в README
const THEMES = ["dark", "light"];                           // каждый снимок — в обеих темах
const THEME_KEY = "ege_oge_trainer_theme";
const RANDOM_SEED = 20261018;
const DESKTOP = { width: 1280, height: 860 };
const PHONE = { width: 390, height: 844 };



// Снимок области (элемента или окна), уменьшенный до MAX_WIDTH
async function shot(page, dir, name, selector) {
    let box = { x: 0, y: 0, width: page.viewport().width, height: page.viewport().height };
    if (selector) {
        const el = await page.$(selector);
        box = await el.boundingBox();
    }
    const scale = Math.min(1, MAX_WIDTH / box.width);
    await page.screenshot({ path: path.join(dir, name), clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale } });
    console.log("снимок", path.basename(dir) + "/" + name);
}



// Немного прогресса: часть задач решена, пара ошибок ждёт повторения
function seedProgress(bankIds) {
    const now = Date.now();
    for (const id of bankIds) {
        const bank = BANKS[id];
        if (!bank) {
            continue;
        }
        const attempts = [];
        const due = {};
        bank.tasks.forEach((t, i) => {
            if (i % 3 !== 2) {
                attempts.push({ id: t.id, ok: true, hints: i % 4 === 0 ? 1 : 0, mode: "train", ts: now - (i + 1) * 5 * 3600000 });
            } else if (i % 9 === 2) {
                attempts.push({ id: t.id, ok: false, hints: 2, mode: "train", ts: now - 2 * 86400000 });
                due[t.id] = { step: 0, at: now - 3600000 };
            }
        });
        localStorage.setItem("ege_oge_trainer_v1:" + id, JSON.stringify({ attempts, due, streak: 5 }));
    }
}



async function openTrainer(page, id) {
    await page.goto(ROOT_URL + "trainer.html?b=" + id);
    await page.waitForFunction(() => typeof BANK !== "undefined" && BANK !== null);
}



// Все снимки в одной теме — в папку screenshots/<theme>/
async function shootTheme(page, theme) {
    const dir = path.join(OUT, theme);
    fs.mkdirSync(dir, { recursive: true });
    await page.setViewport(DESKTOP);

    // главная с прогрессом по трём предметам
    await page.goto(ROOT_URL + "index.html");
    await page.evaluate((key, t) => {
        localStorage.clear();
        localStorage.setItem(key, t);
    }, THEME_KEY, theme);
    await page.evaluate(seedProgress, ["oge_math", "oge_physics", "ege_informatics"]);
    await page.reload();
    await page.setViewport({ width: DESKTOP.width, height: 1000 });
    await shot(page, dir, "01_home.png", ".home-page");
    await page.setViewport(DESKTOP);

    // тренировка: ошибка → подсказка; затем окно «Спросить ИИ»
    await openTrainer(page, "oge_math");
    await page.evaluate(() => {
        startSession("train", ["T2"]);
        document.getElementById("inp").value = "39";
        document.getElementById("b-check").click();
    });
    await shot(page, dir, "02_task_hint.png", null);
    await page.evaluate(() => document.getElementById("b-ai").click());
    await shot(page, dir, "03_ask_ai.png", null);
    await page.evaluate(() => closeModal());

    // часть 2: верный ответ, разбор и критерии ФИПИ
    await openTrainer(page, "ege_physics");
    await page.evaluate(() => {
        startSession("train", ["M7"]);
        document.getElementById("inp").value = "5";
        document.getElementById("b-check").click();
    });
    await shot(page, dir, "04_solution_criteria.png", "#screen .card");

    // мини-экзамен: две ошибки, итоги по темам
    await openTrainer(page, "oge_math");
    await page.evaluate(() => {
        startExam();
        const n = session.queue.length;
        for (let i = 0; i < n; i++) {
            const t = current();
            const d = document;
            const wrong = i === 2 || i === 6;
            if (t.kind === "number") {
                d.getElementById("inp").value = wrong ? String(t.answer + 3) : String(t.answer);
            } else if (t.kind === "digits") {
                d.getElementById("inp").value = wrong ? "9" : t.answer;
            } else if (t.kind === "choice") {
                d.querySelector(`input[name=opt][value="${wrong ? (t.answer === "1" ? "2" : "1") : t.answer}"]`).checked = true;
            } else if (t.kind === "match") {
                d.querySelectorAll(".match select").forEach((s, j) => (s.value = wrong ? "1" : t.answer[j]));
            }
            session.startTs -= 130000;
            d.getElementById("b-check").click();
        }
    });
    await shot(page, dir, "05_exam_result.png", null);

    // программирование: код и данные в условии
    await openTrainer(page, "ege_informatics");
    await page.evaluate(() => startSession("train", ["P1"]));
    await shot(page, dir, "06_informatics.png", "#screen .card");

    // русский язык: текст с пронумерованными позициями
    await openTrainer(page, "oge_russian");
    await page.evaluate(() => startSession("train", ["S1"]));
    await shot(page, dir, "07_russian.png", "#screen .card");

    // задачник с открытыми ответами
    await openTrainer(page, "ege_math");
    await page.evaluate(() => {
        showBook();
        document.querySelectorAll(".book-task details")[0].open = true;
    });
    await shot(page, dir, "08_book.png", null);

    // методика
    await page.goto(ROOT_URL + "guide.html");
    await shot(page, dir, "09_guide.png", null);

    // телефон
    await page.setViewport(PHONE);
    await openTrainer(page, "oge_physics");
    await page.evaluate(() => startSession("train", ["E1"]));
    await shot(page, dir, "10_phone.png", null);
}



async function main() {
    const exe = process.argv[2] || BROWSERS.find((p) => fs.existsSync(p));
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "trainer-shots-"));
    const browser = await puppeteer.launch({ executablePath: exe, headless: true, userDataDir: profile, args: ["--no-first-run", "--no-default-browser-check"] });
    const page = await browser.newPage();
    // повторяемый «случайный» выбор задач — снимки в двух темах совпадают
    await page.evaluateOnNewDocument((seed) => {
        let x = seed;
        Math.random = () => (x = (x * 16807) % 2147483647) / 2147483647;
    }, RANDOM_SEED);
    for (const theme of THEMES) {
        await shootTheme(page, theme);
    }
    await browser.close();
    fs.rmSync(profile, { recursive: true, force: true });
}



main();
