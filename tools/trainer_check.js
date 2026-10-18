// Прогон тренажёра в настоящем браузере (Chrome или Edge в фоне): страницы открываются прямо с диска.
// Для каждой задачи каждого банка: неверный ответ отклоняется, верный — принимается движком.
// Плюс сценарии: главная, подсказки, экзамен, повторение ошибок, задачник, запрос к ИИ, сброс прогресса.
// Запуск: node tools/trainer_check.js [oge_math ege_russian ...] [путь к браузеру]
// Без списка банков проверяются все; puppeteer-core — в tools/node_modules или в NODE_PATH.
// Опубликованный сайт: TRAINER_URL=https://alex-invntr.github.io/EGE_OGE_Test_Trainer/ node tools/trainer_check.js

const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "..");
// Адрес сайта: по умолчанию папка на диске; TRAINER_URL=https://… — опубликованный сайт
const ROOT_URL = process.env.TRAINER_URL || "file:///" + ROOT.replace(/\\/g, "/") + "/";
const BROWSERS = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const VIEWPORT = { width: 1280, height: 860 };
const WRONG_NUMBER_SHIFT = 1000;
let failures = 0;
let checks = 0;



function check(cond, msg) {
    checks += 1;
    if (!cond) {
        failures += 1;
        console.log("FAIL " + msg);
    }
}



// Аргументы: имена банков (oge_math …) и необязательный путь к браузеру
const ARGS = process.argv.slice(2);
const ONLY = ARGS.filter((a) => /^(oge|ege)_\w+$/.test(a));



function findBrowser() {
    const arg = ARGS.find((a) => !ONLY.includes(a));
    if (arg) {
        return arg;
    }
    return BROWSERS.find((p) => fs.existsSync(p));
}



// Список банков, которые реально лежат в папке banks/
function bankIds() {
    return fs.readdirSync(path.join(ROOT, "banks")).filter((f) => /^(oge|ege)_\w+\.js$/.test(f)).map((f) => f.replace(".js", ""));
}



// Внутри страницы: открыть задачу id одиночной тренировкой и ввести ответ (верный или неверный)
function pageAnswer(id, correct) {
    const t = BANK.tasks.find((x) => x.id === id);
    startSession("train", [id]);
    const d = document;
    if (t.kind === "number") {
        const v = correct ? String(t.answer).replace(".", ",") : String(t.answer + 1000);
        d.getElementById("inp").value = v;
    } else if (t.kind === "digits") {
        d.getElementById("inp").value = correct ? t.answer.split("").reverse().join("") : (t.answer === "9" ? "8" : "9");
    } else if (t.kind === "numbers") {
        // неверно: те же цифры без пробела — одно число вместо нескольких
        d.getElementById("inp").value = correct ? "  " + t.answer.split(/\s+/).join("   ") + " " : t.answer.replace(/\s+/g, "");
    } else if (t.kind === "word") {
        const v = Array.isArray(t.answer) ? t.answer[0] : t.answer;
        d.getElementById("inp").value = correct ? " " + v.toUpperCase() + " " : "zzzz";
    } else if (t.kind === "choice") {
        const wrong = t.answer === "1" ? "2" : "1";
        d.querySelector(`input[name=opt][value="${correct ? t.answer : wrong}"]`).checked = true;
    } else if (t.kind === "multi") {
        const all = t.options.map((o, i) => String(i + 1));
        const marks = correct ? t.answer.split("") : all.filter((v) => !t.answer.includes(v)).slice(0, 1);
        marks.forEach((v) => (d.querySelector(`input[name=opt][value="${v}"]`).checked = true));
    } else if (t.kind === "match") {
        d.querySelectorAll(".match select").forEach((s, i) => {
            const right = t.answer[i];
            s.value = correct ? right : (right === "1" ? "2" : "1");
        });
    } else {
        d.getElementById("inp").value = correct ? "Мой ответ: подробное объяснение своими словами." : "";
    }
    d.getElementById("b-check").click();
    const fb = d.getElementById("feedback");
    return {
        kind: t.kind,
        ok: fb.className.includes("ok"),
        bad: fb.className.includes("bad"),
        solution: !d.getElementById("solution").classList.contains("hidden"),
        criteria: !d.getElementById("criteria").classList.contains("hidden"),
        next: !d.getElementById("b-next").classList.contains("hidden"),
        part2: !!t.part2,
    };
}



// Все задачи банка: неверный ответ отклонён, верный принят, разбор и критерии показаны
async function checkAllTasks(page, id) {
    const ids = await page.evaluate(() => BANK.tasks.map((t) => t.id));
    for (const tid of ids) {
        const w = await page.evaluate(pageAnswer, tid, false);
        if (w.kind !== "text") {
            check(w.bad && !w.solution, `${id}/${tid}: неверный ответ должен отклоняться без показа решения`);
        } else {
            check(w.bad, `${id}/${tid}: пустой свободный ответ не принимается`);
        }
        const r = await page.evaluate(pageAnswer, tid, true);
        check(r.ok && r.solution && r.next, `${id}/${tid} (${r.kind}): верный ответ из банка должен приниматься движком`);
        if (r.part2 || r.kind === "text") {
            check(r.criteria, `${id}/${tid}: у задачи второй части показываются критерии`);
        }
    }
    return ids.length;
}



// Мини-экзамен: все ответы верные → полный балл, таблица по темам
async function checkExam(page, id) {
    const res = await page.evaluate(() => {
        startExam();
        const n = session.queue.length;
        const topics = new Set();
        let hasText = false;
        let hintsShown = !!document.getElementById("b-hint");
        for (let i = 0; i < n; i++) {
            const t = current();
            topics.add(t.topic);
            hasText = hasText || t.kind === "text";
            const d = document;
            if (t.kind === "number") {
                d.getElementById("inp").value = String(t.answer);
            } else if (t.kind === "digits" || t.kind === "numbers") {
                d.getElementById("inp").value = t.answer;
            } else if (t.kind === "word") {
                d.getElementById("inp").value = Array.isArray(t.answer) ? t.answer[0] : t.answer;
            } else if (t.kind === "choice" || t.kind === "multi") {
                t.answer.split("").forEach((v) => (d.querySelector(`input[name=opt][value="${v}"]`).checked = true));
            } else if (t.kind === "match") {
                d.querySelectorAll(".match select").forEach((s, j) => (s.value = t.answer[j]));
            }
            d.getElementById("b-check").click();
        }
        const big = document.querySelector(".big-num");
        return { n, mini: BANK.mini.tasks, topicCount: Object.keys(BANK.topics).length, topics: topics.size, hasText, hintsShown, score: big ? big.textContent.trim() : null };
    });
    check(res.n === Math.min(res.mini, res.n) && res.n > 0, `${id}: экзамен из ${res.mini} задач`);
    check(res.topics === Math.min(res.topicCount, res.mini), `${id}: в экзамене все темы (${res.topics} из ${res.topicCount})`);
    check(!res.hasText, `${id}: в экзамен не попадают задачи со свободным ответом`);
    check(!res.hintsShown, `${id}: в экзамене нет подсказок`);
    check(res.score === `${res.n} / ${res.n}`, `${id}: итог экзамена ${res.score}, ожидалось ${res.n} / ${res.n}`);
}



// Подсказки, ИИ, повторение ошибок, задачник, сброс
async function checkScenarios(page, id) {
    const r = await page.evaluate(() => {
        const out = {};
        const t = BANK.tasks.find((x) => x.kind === "number") || BANK.tasks.find((x) => x.kind !== "text");
        startSession("train", [t.id]);
        const hint = document.getElementById("b-hint");
        hint.click();
        hint.click();
        hint.click();
        out.hints = document.querySelectorAll(".hint").length;
        out.hintBtn = hint.textContent;
        hint.click();
        out.solutionAfterHints = !document.getElementById("solution").classList.contains("hidden");
        document.getElementById("b-ai").click();
        const prompt = document.getElementById("m-text").value;
        out.prompt = prompt.includes("Не давай готового решения") && prompt.includes(BANK.examName) && prompt.includes(t.text.slice(0, 30));
        document.getElementById("m-close").click();
        out.modalClosed = document.getElementById("modal").classList.contains("hidden");
        // ошибка → очередь повторения; после срока — кнопка «Повторить ошибки»
        recordAttempt(t, false, 0, "train");
        out.dueSet = !!state.due[t.id] && state.due[t.id].at > Date.now() + 20 * 3600e3;
        state.due[t.id].at = Date.now() - 1000;
        renderSidebar();
        out.reviewEnabled = !document.getElementById("btn-review").disabled;
        document.getElementById("btn-review").click();
        out.reviewTask = current().id === t.id;
        // задачник
        document.getElementById("btn-book").click();
        out.bookTasks = document.querySelectorAll(".book-task").length;
        out.bookFigures = document.querySelectorAll(".book-task .figure svg").length;
        out.figures = BANK.tasks.filter((x) => x.figure).length;
        out.total = BANK.tasks.length;
        // ширина: содержимое не вылезает за карточку
        const card = document.querySelector("#screen .card");
        out.overflow = card.scrollWidth > card.clientWidth + 2;
        // ссылки на внешнюю базу: на главной тренажёра, в меню и под задачей
        showHome();
        out.srcHome = document.querySelectorAll(".src-links a").length;
        out.srcSide = document.querySelectorAll("#side-sources a").length;
        startSession("train", [t.id]);
        out.srcTask = document.querySelectorAll(".more-tasks a").length;
        // сброс прогресса
        window.confirm = () => true;
        document.getElementById("btn-reset").click();
        out.resetOk = state.attempts.length === 0 && document.getElementById("st-solved").textContent.startsWith("0 /");
        return out;
    });
    check(r.hints === 3 && r.hintBtn === "Показать решение", `${id}: три подсказки → «Показать решение»`);
    check(r.solutionAfterHints, `${id}: после подсказок открывается решение`);
    check(r.prompt && r.modalClosed, `${id}: запрос к ИИ содержит условие и правило «не давай решения»`);
    check(r.dueSet && r.reviewEnabled && r.reviewTask, `${id}: ошибка уходит в повторение и возвращается`);
    check(r.bookTasks === r.total && r.bookFigures === r.figures, `${id}: задачник — ${r.bookTasks} из ${r.total} задач, рисунков ${r.bookFigures} из ${r.figures}`);
    check(!r.overflow, `${id}: задачник не шире карточки`);
    check(r.resetOk, `${id}: сброс прогресса`);
    check(r.srcHome > 0 && r.srcHome === r.srcSide && r.srcHome === r.srcTask, `${id}: ссылки на внешние базы (${r.srcHome}/${r.srcSide}/${r.srcTask})`);
}



// Каждая задача на отдельном экране: нет горизонтальной прокрутки карточки
async function checkLayout(page, id) {
    const wide = await page.evaluate(() => {
        const bad = [];
        for (const t of BANK.tasks) {
            startSession("train", [t.id]);
            const card = document.querySelector("#screen .card");
            if (card.scrollWidth > card.clientWidth + 2) {
                bad.push(t.id);
            }
        }
        return bad;
    });
    check(wide.length === 0, `${id}: задачи шире карточки: ${wide.join(", ")}`);
}



async function main() {
    const exe = findBrowser();
    if (!exe) {
        console.log("Не найден Chrome или Edge: укажите путь первым аргументом");
        process.exit(2);
    }
    const profile = fs.mkdtempSync(path.join(require("os").tmpdir(), "trainer-check-"));
    const browser = await puppeteer.launch({ executablePath: exe, headless: true, userDataDir: profile, args: ["--no-first-run", "--no-default-browser-check"] });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
        if (m.type() === "error") {
            errors.push(m.text());
        }
    });
    await page.setViewport(VIEWPORT);

    // главная: все банки на месте
    const ids = bankIds();
    await page.goto(ROOT_URL + "index.html");
    const cards = await page.evaluate(() => ({ ok: document.querySelectorAll("a.subj").length, missing: document.querySelectorAll(".subj.missing").length }));
    check(cards.ok === ids.length, `главная: карточек банков ${cards.ok}, файлов банков ${ids.length}`);
    await page.goto(ROOT_URL + "guide.html");
    const specRows = await page.evaluate(() => document.querySelectorAll("#spec-table tr").length - 1);
    check(specRows === ids.length, `методика: строк в таблице экзаменов ${specRows}`);
    await page.goto(ROOT_URL + "index.html");
    check(await page.evaluate(() => !!document.querySelector('a.hero-btn[href="howto.html"]')), "главная: кнопка «Как заниматься»");
    await page.goto(ROOT_URL + "howto.html", { waitUntil: "load" });
    const howto = await page.evaluate(() => {
        const imgs = Array.from(document.images);
        imgs.forEach((im) => (im.loading = "eager"));
        return {
            imgs: imgs.length,
            links: Array.from(document.querySelectorAll('a[href^="trainer.html?b="]')).map((a) => a.getAttribute("href").split("=")[1]),
        };
    });
    await page.waitForFunction(() => Array.from(document.images).every((im) => im.complete));
    const broken = await page.evaluate(() => Array.from(document.images).filter((im) => !im.naturalWidth).map((im) => im.getAttribute("src")));
    check(howto.imgs >= 9 && broken.length === 0, `«Как заниматься»: картинок ${howto.imgs}, не загрузились: ${broken.join(", ")}`);
    check(ids.every((id) => howto.links.includes(id)), `«Как заниматься»: ссылки на все банки (${howto.links.length})`);
    // тема: тёмная по умолчанию, переключатель запоминает светлую
    await page.goto(ROOT_URL + "index.html");
    const theme0 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await page.click("[data-theme-toggle]");
    await page.reload();
    const theme1 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await page.click("[data-theme-toggle]");
    const theme2 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    check(theme0 === "dark" && theme1 === "light" && theme2 === "dark", `тема: ${theme0} → ${theme1} (после перезагрузки) → ${theme2}`);
    // внешние базы заданий: РешуОГЭ, РешуЕГЭ, КЕГЭ
    const src = await page.evaluate(() => Array.from(document.querySelectorAll("#sources a")).map((a) => a.href));
    check(src.length === ids.length + 1 && src.filter((u) => u.includes("sdamgia.ru/prob_catalog")).length === ids.length && src.some((u) => u.includes("kompege.ru")),
        `главная: ссылок на внешние базы ${src.length}`);
    await page.goto(ROOT_URL + "trainer.html?b=nope");
    check(await page.evaluate(() => document.body.textContent.includes("Не выбран экзамен")), "неизвестный банк — понятное сообщение");

    let total = 0;
    for (const id of ids.filter((x) => !ONLY.length || ONLY.includes(x))) {
        await page.goto(ROOT_URL + "trainer.html?b=" + id);
        await page.waitForFunction(() => typeof BANK !== "undefined" && BANK !== null);
        await page.evaluate(() => localStorage.clear());
        const n = await checkAllTasks(page, id);
        await checkLayout(page, id);
        await checkExam(page, id);
        await checkScenarios(page, id);
        total += n;
        console.log(`${id}: задач ${n} — проверено`);
    }
    const realErrors = errors.filter((e) => !e.includes("ERR_FILE_NOT_FOUND"));
    check(realErrors.length === 0, "ошибки JavaScript на страницах: " + realErrors.join(" | "));
    await browser.close();
    fs.rmSync(profile, { recursive: true, force: true });
    console.log(`\nБанков ${ids.length}, задач ${total}, проверок ${checks}` + (failures ? `, ПРОВАЛОВ: ${failures}` : " — все пройдены"));
    process.exit(failures ? 1 : 0);
}



main();
