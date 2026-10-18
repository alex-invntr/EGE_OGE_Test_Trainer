// Тренажёр одного банка задач: тренировка по теме, мини-экзамен, повторение ошибок, задачник, запросы к ИИ.
// Банк выбирается параметром страницы: trainer.html?b=oge_math

const MAX_HINTS = 3;
const EXAM_TIMER_MS = 1000;
const LONG_RIGHT_ITEM = 40;                                 // варианты соответствия длиннее — показываются списком
const PREVIEW_CHARS = 90;
const COPY_FEEDBACK_MS = 1500;
// ИИ-помощники в окне «Спроси ИИ»: кнопка копирует запрос и открывает чат в новой вкладке
const ASSISTANTS = [
    { name: "Claude", url: "https://claude.ai/new" },
    { name: "Gemini", url: "https://gemini.google.com/app" },
    { name: "DeepSeek", url: "https://chat.deepseek.com/" },
];

let BANK = null;                                            // текущий банк задач
let BANK_ID = "";
let state = emptyState();                                   // журнал попыток и очередь повторения
let session = null;                                         // текущая серия задач
let examTimer = null;



// ---------- Служебные ----------
function byId(id) {
    return BANK.tasks.find((t) => t.id === id);
}



function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}



function saveState() {
    saveProgress(BANK_ID, state);
}



function topicOf(t) {
    return BANK.topics[t.topic];
}



// ---------- Статистика и боковая панель ----------
function topicStats(key) {
    const ids = new Set(BANK.tasks.filter((t) => t.topic === key).map((t) => t.id));
    const att = state.attempts.filter((a) => ids.has(a.id));
    const okCount = att.filter((a) => a.ok).length;
    return {
        total: ids.size,
        solved: new Set(att.filter((a) => a.ok).map((a) => a.id)).size,
        attempts: att.length,
        acc: att.length ? Math.round(100 * okCount / att.length) : null,
    };
}



function dueIds() {
    return dueIdsOf(state, BANK);
}



function renderSidebar() {
    const box = el("topics");
    box.innerHTML = "";
    for (const [k, t] of Object.entries(BANK.topics)) {
        const s = topicStats(k);
        const row = document.createElement("button");
        row.className = "topic";
        row.style.setProperty("--c", t.color);
        row.innerHTML = `<span class="name">${esc(t.name)}</span><span class="num">${s.solved}/${s.total}</span>` +
            `<span class="bar"><i style="width:${s.total ? Math.round(100 * s.solved / s.total) : 0}%"></i></span>` +
            `<span class="acc">${s.acc === null ? "ещё не решал" : "точность " + s.acc + "%"}</span>`;
        row.onclick = () => startTopic(k);
        box.appendChild(row);
    }
    const ids = new Set(BANK.tasks.map((t) => t.id));
    const all = state.attempts.filter((a) => ids.has(a.id));
    const ok = all.filter((a) => a.ok);
    el("st-solved").textContent = new Set(ok.map((a) => a.id)).size + " / " + BANK.tasks.length;
    el("st-acc").textContent = all.length ? Math.round(100 * ok.length / all.length) + "%" : "—";
    el("st-streak").textContent = state.streak;
    const due = dueIds().length;
    el("due-count").textContent = due;
    el("due-count").className = "count" + (due ? "" : " zero");
    el("btn-review").disabled = due === 0;
}



// Запись попытки: журнал, серия, очередь повторения (ошибка → через 1 день, далее 3, 7, 14)
function recordAttempt(t, ok, hints, mode) {
    state.attempts.push({ id: t.id, ok, hints, mode, ts: Date.now() });
    state.streak = ok ? state.streak + 1 : 0;
    const d = state.due[t.id];
    if (!ok) {
        state.due[t.id] = { step: 0, at: Date.now() + REVIEW_DAYS[0] * DAY_MS };
    } else if (d) {
        if (d.step + 1 >= REVIEW_DAYS.length) {
            delete state.due[t.id];
        } else {
            state.due[t.id] = { step: d.step + 1, at: Date.now() + REVIEW_DAYS[d.step + 1] * DAY_MS };
        }
    }
    saveState();
}



// ---------- Экраны ----------
function showHome() {
    session = null;
    stopTimer();
    const due = dueIds().length;
    const sp = BANK.spec;
    const mini = BANK.mini;
    el("screen").innerHTML = `
        <div class="card home">
            <h2>С чего начать</h2>
            <p class="lead">${esc(BANK.examName)} ${esc(BANK.subjectDative)}: ${sp.tasks} ${plural(sp.tasks, ["задание", "задания", "заданий"])} за ${sp.minutes} ${plural(sp.minutes, ["минуту", "минуты", "минут"])},
            максимум ${sp.maxScore} ${plural(sp.maxScore, ["первичный балл", "первичных балла", "первичных баллов"])}. ${esc(sp.note)}.
            Задача тренажёра — довести каждую тему до нуля ошибок.</p>
            <div class="home-grid">
                <button class="big" id="h-train">1 · Тренировка по теме<small>подсказки по шагам, разбор, кнопка «Спросить ИИ»</small></button>
                <button class="big" id="h-exam">2 · Мини-экзамен<small>${mini.tasks} ${plural(mini.tasks, ["задача", "задачи", "задач"])}, ${mini.minutes} минут, без подсказок — как на экзамене</small></button>
                <button class="big" id="h-review" ${due ? "" : "disabled"}>3 · Повторить ошибки<small>${due ? "сегодня к повторению: " + due : "пока нечего повторять"}</small></button>
                <button class="big" id="h-prompt">4 · Разобрать тему с ИИ<small>готовый запрос: объяснение на примере и 5 вопросов</small></button>
                <button class="big" id="h-book">5 · Задачник<small>все ${BANK.tasks.length} ${plural(BANK.tasks.length, ["задача", "задачи", "задач"])} с ответами и решениями — для учителя и для печати</small></button>
                <a class="big" href="guide.html" style="text-decoration:none;color:inherit">6 · Как готовиться с ИИ<small>методика «6 шагов» и готовые запросы</small></a>
                <div class="big">7 · Ещё задания<small>каталог по номерам заданий ${esc(BANK.examName)}: задания открытого банка ФИПИ с ответами и решениями</small><span class="src-links">${sourceLinks(BANK_ID)}</span></div>
            </div>
            <p class="note">Правило: сначала сам → подсказка → ИИ. ИИ не выдаёт ответ, а задаёт наводящий вопрос. Решение смотри только после своей попытки.</p>
        </div>`;
    el("h-train").onclick = () => showTopicPicker(false);
    el("h-exam").onclick = startExam;
    el("h-review").onclick = startReview;
    el("h-prompt").onclick = () => showTopicPicker(true);
    el("h-book").onclick = showBook;
}



function showTopicPicker(forPrompt) {
    session = null;
    stopTimer();
    const cards = Object.entries(BANK.topics).map(([k, t]) => {
        const s = topicStats(k);
        return `<button data-k="${k}" style="--c:${t.color}"><b>${esc(t.name)}</b><span>${s.total} ${plural(s.total, ["задача", "задачи", "задач"])} · решено ${s.solved}</span></button>`;
    }).join("");
    el("screen").innerHTML = `<div class="card"><h2>${forPrompt ? "Какую тему разобрать с ИИ?" : "Выбери тему"}</h2><div class="picker">${cards}</div></div>`;
    el("screen").querySelectorAll(".picker button").forEach((b) => {
        b.onclick = () => (forPrompt ? openTopicPrompt(b.dataset.k) : startTopic(b.dataset.k));
    });
}



// Тренировка по теме: сначала нерешённые задачи, потом остальные
function startTopic(key) {
    const solved = solvedIds(state);
    const list = BANK.tasks.filter((t) => t.topic === key);
    const fresh = list.filter((t) => !solved.has(t.id));
    const old = list.filter((t) => solved.has(t.id));
    const queue = shuffle(fresh).concat(shuffle(old)).map((t) => t.id);
    startSession("train", queue);
}



function startReview() {
    const queue = dueIds();
    if (queue.length) {
        startSession("review", queue);
    }
}



// Мини-экзамен: по задаче из каждой темы + добор случайных; только задачи с автопроверкой
function startExam() {
    const pool = BANK.tasks.filter((t) => t.kind !== "text");
    const queue = [];
    for (const k of shuffle(Object.keys(BANK.topics))) {
        const pick = shuffle(pool.filter((t) => t.topic === k))[0];
        if (pick && queue.length < BANK.mini.tasks) {
            queue.push(pick.id);
        }
    }
    const rest = shuffle(pool.filter((t) => !queue.includes(t.id)));
    while (queue.length < BANK.mini.tasks && rest.length) {
        queue.push(rest.pop().id);
    }
    startSession("exam", shuffle(queue));
    session.startTs = Date.now();
    startTimer();
    showTask();
}



// Новая серия задач; для экзамена задачу показывает startExam после запуска таймера
function startSession(mode, queue) {
    stopTimer();
    session = { mode, queue, index: 0, hints: 0, answers: {}, startTs: 0 };
    if (mode !== "exam") {
        showTask();
    }
}



function current() {
    return byId(session.queue[session.index]);
}



function showTask() {
    const t = current();
    const topic = topicOf(t);
    const exam = session.mode === "exam";
    session.hints = 0;
    const last = session.index + 1 >= session.queue.length;
    let checkLabel = "Проверить";
    if (exam) {
        checkLabel = last ? "Завершить экзамен" : "Ответить и дальше →";
    } else if (t.kind === "text") {
        checkLabel = "Сравнить с образцом";
    }
    const counter = (session.mode === "review" ? "повторение · " : "") + (session.index + 1) + " / " + session.queue.length +
        (exam ? " · осталось <b id=\"timer\"></b>" : "");
    el("screen").innerHTML = `
        <div class="card task">
            <div class="meta">
                <span class="chip" style="--c:${topic.color}">${esc(topic.name)}</span>
                <span class="chip ghost">уровень: ${esc(t.level)}</span>
                <span class="chip ghost">${esc(t.format)}</span>
                <span class="counter">${counter}</span>
            </div>
            <p class="text">${esc(t.text)}</p>
            ${t.code ? `<pre class="code">${esc(t.code)}</pre>` : ""}
            ${t.figure ? `<div class="figure">${t.figure}</div>` : ""}
            <div class="answer" id="answer">${renderInput(t)}</div>
            <div class="actions">
                <button class="primary" id="b-check">${checkLabel}</button>
                ${exam ? "" : `<button id="b-hint">Подсказка <span id="hint-n">1</span> из ${MAX_HINTS}</button>`}
                ${exam ? "" : `<button id="b-ai">Спросить ИИ</button>`}
                <button id="b-next" class="next hidden">Дальше →</button>
                ${exam ? "" : `<button id="b-home" class="ghost">К темам</button>`}
            </div>
            ${exam ? "" : moreTasksLine(t)}
            <div id="feedback" class="feedback hidden"></div>
            <div id="hints" class="hints"></div>
            <div id="solution" class="solution hidden"></div>
            <div id="criteria" class="criteria hidden"></div>
        </div>`;
    el("b-check").onclick = onCheck;
    el("b-next").onclick = nextTask;
    if (el("b-hint")) {
        el("b-hint").onclick = showHint;
    }
    if (el("b-ai")) {
        el("b-ai").onclick = openTaskPrompt;
    }
    if (el("b-home")) {
        el("b-home").onclick = showHome;
    }
    if (exam) {
        updateTimer();
    }
    const inp = el("inp");
    if (inp) {
        inp.focus();
        if (inp.tagName === "INPUT") {
            inp.onkeydown = (e) => {
                if (e.key === "Enter") {
                    onEnter();
                }
            };
        }
    }
}



// Строка под задачей: такие же задания во внешних базах с номером задания КИМ
function moreTasksLine(t) {
    const links = sourceLinks(BANK_ID);
    if (!links) {
        return "";
    }
    const num = kimNumber(t.format);
    return `<div class="more-tasks">Ещё такие задания: ${links}${num ? ` в каталоге — задание № ${esc(num)}` : ""}</div>`;
}



// Enter в поле ответа: проверить, а после верного ответа — перейти дальше
function onEnter() {
    if (!el("b-next").classList.contains("hidden")) {
        nextTask();
    } else if (!el("b-check").disabled) {
        onCheck();
    }
}



function renderInput(t) {
    if (t.kind === "number") {
        return `<label class="num"><input id="inp" type="text" inputmode="decimal" autocomplete="off" placeholder="число"><span class="unit">${esc(t.unit || "")}</span></label>` +
            `<div class="fmt">дробную часть можно через запятую; допустимы записи 1/8 и 2·10^8</div>`;
    }
    if (t.kind === "digits") {
        return `<label class="num"><input id="inp" type="text" inputmode="numeric" autocomplete="off" placeholder="цифры"></label>` +
            `<div class="fmt">только цифры, без пробелов и запятых; порядок не важен</div>`;
    }
    if (t.kind === "numbers") {
        return `<label class="num"><input id="inp" type="text" autocomplete="off" placeholder="числа через пробел"></label>` +
            `<div class="fmt">числа через пробел, в порядке, который требует условие</div>`;
    }
    if (t.kind === "word") {
        return `<label class="num"><input id="inp" type="text" autocomplete="off" spellcheck="false" placeholder="ответ"></label>` +
            `<div class="fmt">без пробелов и знаков препинания; регистр не важен</div>`;
    }
    if (t.kind === "choice" || t.kind === "multi") {
        const type = t.kind === "choice" ? "radio" : "checkbox";
        const tip = t.kind === "multi" ? `<div class="fmt">отметь все верные варианты</div>` : "";
        return t.options.map((o, i) => `<label class="opt"><input type="${type}" name="opt" value="${i + 1}"><span>${i + 1}) ${esc(o)}</span></label>`).join("") + tip;
    }
    if (t.kind === "match") {
        const sel = t.options.right.map((r, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
        const rows = t.options.left.map((l, i) => `<tr><td>${esc(l)}</td><td><select data-i="${i}"><option value="">—</option>${sel}</select></td></tr>`).join("");
        const long = t.options.right.some((r) => r.length > LONG_RIGHT_ITEM);
        const right = long
            ? `<ol class="right-list">${t.options.right.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>`
            : `<p class="right-col">${t.options.right.map(esc).join(" &nbsp;·&nbsp; ")}</p>`;
        return `<table class="match">${rows}</table>${right}`;
    }
    return `<textarea id="inp" placeholder="Напиши ответ своими словами, потом сравни с образцом"></textarea>`;
}



// Число из строки ученика: запятая, дробь a/b, запись вида 2·10^8 или 2e8, минус любого вида
function parseNumber(str) {
    const s = String(str).trim().replace(/\s+/g, "").replace(",", ".").replace(/[−–—]/g, "-");
    if (!s) {
        return null;
    }
    const fr = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (fr) {
        const den = parseFloat(fr[2]);
        return den === 0 ? null : parseFloat(fr[1]) / den;
    }
    const pw = s.match(/^(-?\d+(?:\.\d+)?)[·*xх×]10\^?(-?\d+)$/);
    if (pw) {
        return parseFloat(pw[1]) * Math.pow(10, parseInt(pw[2], 10));
    }
    const v = Number(s);
    return Number.isFinite(v) ? v : null;
}



// Числа из строки «7 155» или «1,5 −2» (как parse_numbers в tools/bank_common.py)
function parseNumbers(str) {
    const found = String(str).replace(/[−–—]/g, "-").match(/-?\d+(?:[.,]\d+)?/g) || [];
    return found.map((x) => parseFloat(x.replace(",", ".")));
}



// Слово для сравнения: регистр, ё = е, без пробелов и знаков (как norm_word в tools/bank_common.py)
function normWord(s) {
    return String(s).toLowerCase().replace(/ё/g, "е").replace(/[^0-9a-zа-я]/g, "");
}



// Ответ ученика: raw — как написал, value — для проверки (null — ответа нет)
function readAnswer(t) {
    if (t.kind === "number" || t.kind === "numbers" || t.kind === "text" || t.kind === "word" || t.kind === "digits") {
        const raw = el("inp").value;
        let value = raw.trim();
        if (t.kind === "number") {
            value = parseNumber(raw);
        } else if (t.kind === "word") {
            value = normWord(raw);
        } else if (t.kind === "digits") {
            value = raw.replace(/\D/g, "");
        } else if (t.kind === "numbers") {
            value = parseNumbers(raw);
            value = value.length ? value : "";
        }
        return { raw, value: value === "" ? null : value };
    }
    if (t.kind === "choice" || t.kind === "multi") {
        const marked = Array.from(document.querySelectorAll("input[name=opt]:checked")).map((r) => r.value);
        const raw = marked.join("");
        return { raw, value: marked.length ? raw : null };
    }
    const digits = Array.from(document.querySelectorAll(".match select")).map((s) => s.value);
    const raw = digits.join("");
    return { raw: digits.map((d) => d || "—").join(""), value: digits.every((d) => d) ? raw : null };
}



function sortChars(s) {
    return String(s).split("").sort().join("");
}



function isCorrect(t, value) {
    if (value === null || value === undefined) {
        return false;
    }
    if (t.kind === "number") {
        return Math.abs(value - t.answer) <= Math.max(t.tol * Math.abs(t.answer), 1e-9);
    }
    if (t.kind === "word") {
        const variants = Array.isArray(t.answer) ? t.answer : [t.answer];
        return variants.some((v) => normWord(v) === value);
    }
    if (t.kind === "digits" || t.kind === "multi") {
        return sortChars(value) === sortChars(t.answer);
    }
    if (t.kind === "numbers") {
        const need = parseNumbers(t.answer);
        return value.length === need.length && value.every((v, i) => Math.abs(v - need[i]) < 1e-9);
    }
    return String(value) === String(t.answer);
}



// Верный ответ в виде, как его пишут в бланк
function answerText(t) {
    if (t.kind === "number") {
        return String(t.answer).replace(".", ",") + (t.unit ? " " + t.unit : "");
    }
    if (t.kind === "word") {
        return Array.isArray(t.answer) ? t.answer[0] : t.answer;
    }
    return String(t.answer);
}



function onCheck() {
    const t = current();
    const ans = readAnswer(t);
    if (session.mode === "exam") {
        session.answers[t.id] = ans;
        nextTask();
        return;
    }
    if (t.kind === "text") {
        showModelAnswer(t, ans.raw.trim());
        return;
    }
    if (ans.value === null) {
        showFeedback("bad", emptyAnswerTip(t));
        return;
    }
    const ok = isCorrect(t, ans.value);
    recordAttempt(t, ok, session.hints, session.mode);
    if (ok) {
        showFeedback("ok", `<b>Верно!</b> ${session.hints ? "Подсказок использовано: " + session.hints + ". В следующий раз попробуй без них." : "Без подсказок — именно так и будет на экзамене."}`);
        showSolution(t);
        if (t.part2) {
            showCriteria(t);
        }
        el("b-check").disabled = true;
        el("b-hint").disabled = true;
        el("b-next").classList.remove("hidden");
    } else {
        showFeedback("bad", `<b>Пока неверно.</b> Твой ответ: ${esc(ans.raw)}. Решение не открываю — сначала подсказка или наводящий вопрос ИИ.`);
        if (session.hints < MAX_HINTS) {
            showHint();
        }
    }
    renderSidebar();
}



// Что сказать, если ответ не введён
function emptyAnswerTip(t) {
    const tips = {
        number: "<b>Введи ответ.</b> Только число — единицы уже указаны рядом.",
        digits: "<b>Введи ответ.</b> Только цифры, без пробелов и запятых.",
        numbers: "<b>Введи ответ</b> — числа через пробел.",
        word: "<b>Введи ответ</b> — слово или последовательность символов.",
        choice: "<b>Выбери один вариант.</b>",
        multi: "<b>Отметь верные варианты.</b>",
        match: "<b>Выбери цифру для каждой позиции</b> первого столбца.",
    };
    return tips[t.kind] || "<b>Введи ответ.</b>";
}



function showFeedback(kind, html) {
    const fb = el("feedback");
    fb.className = "feedback " + kind;
    fb.innerHTML = html;
}



function showHint() {
    const t = current();
    if (session.hints >= MAX_HINTS) {
        return;
    }
    const n = session.hints;
    const div = document.createElement("div");
    div.className = "hint";
    div.innerHTML = `<b>ПОДСКАЗКА ${n + 1}</b><br>${esc(formatSteps(t.hints[n]))}`;
    el("hints").appendChild(div);
    session.hints += 1;
    const b = el("b-hint");
    if (session.hints >= MAX_HINTS) {
        b.textContent = "Показать решение";
        b.onclick = () => {
            showSolution(t);
            b.disabled = true;
            el("b-next").classList.remove("hidden");
        };
    } else {
        el("hint-n").textContent = session.hints + 1;
    }
}



// Разбор по пунктам: «… 2) …», «… Б) …» — каждый пункт с новой строки.
// Внутри незакрытой скобки не переносим: «log₂ (56 : 7)» — это деление, а не пункт 7
function formatSteps(text) {
    const s = String(text);
    return s.replace(/([.;:!?»])[ \t]+(\d{1,2}\)|[А-Е]\))[ \t]/g, (m, punct, item, offset) => {
        const line = s.slice(s.lastIndexOf("\n", offset) + 1, offset);
        const open = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
        return open > 0 ? m : punct + "\n" + item + " ";
    }).trim();
}



// Решение для показа: пункты с новой строки, итоговое «Ответ: …» в конце убрано — ответ показывается отдельной строкой
function solutionText(t) {
    return formatSteps(String(t.solution).replace(/\s*Ответ:\s*[^\n]{1,80}$/, ""));
}



function showSolution(t) {
    const box = el("solution");
    box.classList.remove("hidden");
    const ans = t.kind === "text" ? "" : `<span class="ans">Ответ: ${esc(answerText(t))}</span>`;
    box.innerHTML = `<h4>${t.kind === "text" ? "Образец ответа" : "Разбор"}</h4>${esc(t.kind === "text" ? t.answer : solutionText(t))}${ans}`;
}



// Пояснение к свободному ответу без повтора образца (если решение содержит образец целиком)
function extraNotes(t) {
    if (!t.solution || t.solution === t.answer) {
        return "";
    }
    if (t.solution.includes(t.answer)) {
        return t.solution.replace(t.answer, "").replace(/\n{3,}/g, "\n\n").trim();
    }
    return t.solution;
}



// Свободный ответ: образец и самооценка по критериям
function showModelAnswer(t, own) {
    if (!own) {
        showFeedback("bad", "<b>Сначала напиши свой ответ</b> — хотя бы два-три предложения. Потом сравним с образцом.");
        return;
    }
    showFeedback("ok", "<b>Сравни с образцом.</b> Отметь честно, сколько баллов поставил бы эксперт, — это попадёт в статистику.");
    showSolution(t);
    const notes = extraNotes(t);
    if (notes) {
        const extra = document.createElement("div");
        extra.className = "solution";
        extra.innerHTML = `<h4>Что важно в ответе</h4>${esc(formatSteps(notes))}`;
        el("solution").after(extra);
    }
    showCriteria(t);
    el("b-check").disabled = true;
    el("b-next").classList.remove("hidden");
}



// Критерии самооценки: свои у задачи или общие для банка
function criteriaFor(t) {
    if (Array.isArray(t.criteria) && t.criteria.length) {
        return t.criteria;
    }
    return t.kind === "text" ? BANK.criteria.text : BANK.criteria.calc;
}



// Самооценка оформления по критериям ФИПИ
function showCriteria(t) {
    const box = el("criteria");
    box.classList.remove("hidden");
    const items = criteriaFor(t);
    const max = Math.max(...items.map((x) => x[0]));
    box.innerHTML = `<h4>Оформление — как проверит эксперт ${esc(BANK.examName)}</h4>` +
        items.map(([s, d]) => `<label><input type="radio" name="crit" value="${s}"><span><b>${s}</b> — ${esc(d)}</span></label>`).join("") +
        `<button id="b-crit">Сохранить баллы</button><span id="crit-saved" class="saved"></span>`;
    el("b-crit").onclick = () => {
        const r = document.querySelector("input[name=crit]:checked");
        if (!r) {
            return;
        }
        const score = Number(r.value);
        const last = state.attempts[state.attempts.length - 1];
        if (last && last.id === t.id && last.ts > Date.now() - DAY_MS && t.kind !== "text") {
            last.score = score;
            saveState();
        } else {
            recordAttempt(t, score > 0, session ? session.hints : 0, session ? session.mode : "train");
            state.attempts[state.attempts.length - 1].score = score;
            saveState();
        }
        el("crit-saved").textContent = "записано: " + score + " из " + max;
        el("b-crit").disabled = true;
        renderSidebar();
    };
}



function nextTask() {
    if (session.index + 1 >= session.queue.length) {
        if (session.mode === "exam") {
            finishExam();
        } else {
            showDone();
        }
        return;
    }
    session.index += 1;
    showTask();
}



function showDone() {
    const name = session.mode === "review" ? "Повторение закончено" : "Серия пройдена";
    el("screen").innerHTML = `<div class="card"><h2>${name}</h2><p class="lead">Ошибки вернутся в «Повторить ошибки» через день, потом через 3, 7 и 14 дней. Дальше — другая тема или мини-экзамен.</p>
        <div class="actions"><button class="primary" id="d-home">К темам</button><button id="d-exam">Мини-экзамен</button></div></div>`;
    el("d-home").onclick = showHome;
    el("d-exam").onclick = startExam;
    session = null;
}



// ---------- Экзамен ----------
function startTimer() {
    stopTimer();
    examTimer = setInterval(updateTimer, EXAM_TIMER_MS);
}



function stopTimer() {
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
}



function updateTimer() {
    if (!session || session.mode !== "exam") {
        return;
    }
    const left = BANK.mini.minutes * 60 - Math.floor((Date.now() - session.startTs) / 1000);
    const tm = el("timer");
    if (tm) {
        tm.textContent = Math.max(0, Math.floor(left / 60)) + ":" + String(Math.max(0, left % 60)).padStart(2, "0");
    }
    if (left <= 0) {
        finishExam();
    }
}



function finishExam() {
    stopTimer();
    const spent = Math.round((Date.now() - session.startTs) / 1000);
    const rows = session.queue.map((id) => {
        const t = byId(id);
        const a = session.answers[id];
        const ok = !!(a && isCorrect(t, a.value));
        recordAttempt(t, ok, 0, "exam");
        return { t, ok };
    });
    renderExamSummary(rows, spent);
}



function renderExamSummary(rows, spent) {
    session = null;
    const score = rows.filter((r) => r.ok).length;
    const perTopic = Object.entries(BANK.topics).map(([k, t]) => {
        const list = rows.filter((r) => r.t.topic === k);
        if (!list.length) {
            return "";
        }
        const okN = list.filter((r) => r.ok).length;
        return `<tr><td>${esc(t.name)}</td><td>${okN} / ${list.length}</td><td><span class="bar-sm" style="--c:${t.color}"><i style="width:${Math.round(100 * okN / list.length)}%"></i></span></td></tr>`;
    }).join("");
    const wrong = rows.filter((r) => !r.ok);
    const wrongHtml = wrong.length
        ? `<h4 style="margin:0 0 8px">Разобрать сейчас</h4><div class="wrong-list">${wrong.map((r) => `<button data-id="${r.t.id}"><span>${r.t.id}</span>${esc(r.t.text.slice(0, PREVIEW_CHARS))}…</button>`).join("")}</div>`
        : "<p class=\"lead\">Все верно — переходи к задачам повышенного уровня и к оформлению развёрнутых ответов.</p>";
    el("screen").innerHTML = `
        <div class="card">
            <h2>Мини-экзамен: итоги</h2>
            <div class="score"><span class="big-num">${score} / ${rows.length}</span><span class="sub">время: ${Math.floor(spent / 60)} мин ${spent % 60} с из ${BANK.mini.minutes}</span></div>
            <table class="res"><tr><th>Тема</th><th>Верно</th><th></th></tr>${perTopic}</table>
            ${wrongHtml}
            <p class="note">${wrong.length ? "Ошибки добавлены в «Повторить ошибки»: они вернутся через день, потом через 3, 7 и 14 дней — пока не исчезнут." : "Повтори мини-экзамен через неделю: результат должен держаться."}</p>
            <div class="actions" style="margin-top:14px"><button class="primary" id="s-home">К темам</button><button id="s-again">Ещё один экзамен</button></div>
        </div>`;
    el("s-home").onclick = showHome;
    el("s-again").onclick = startExam;
    el("screen").querySelectorAll(".wrong-list button").forEach((b) => {
        b.onclick = () => startSession("review", [b.dataset.id]);
    });
    renderSidebar();
}



// ---------- Задачник: все задачи с ответами ----------
function showBook() {
    session = null;
    stopTimer();
    const parts = Object.entries(BANK.topics).map(([k, tp]) => {
        const list = BANK.tasks.filter((t) => t.topic === k);
        const items = list.map((t) => {
            let opts = "";
            if (t.kind === "choice" || t.kind === "multi") {
                opts = `<ol class="opts">${t.options.map((o) => `<li>${esc(o)}</li>`).join("")}</ol>`;
            } else if (t.kind === "match") {
                opts = `<ol class="opts" style="list-style:none;padding-left:0">${t.options.left.map((o) => `<li>${esc(o)}</li>`).join("")}</ol>` +
                    `<ol class="opts" style="list-style:none;padding-left:0">${t.options.right.map((o) => `<li>${esc(o)}</li>`).join("")}</ol>`;
            }
            const body = t.kind === "text"
                ? `<b>Образец:</b>\n${esc(t.answer)}${extraNotes(t) ? "\n\n<b>Что важно:</b>\n" + esc(formatSteps(extraNotes(t))) : ""}`
                : `${esc(solutionText(t))}<span class="ans">Ответ: ${esc(answerText(t))}</span>`;
            return `<div class="book-task">
                <div class="head"><b>${t.id}</b><span>${esc(t.format)}</span><span>· ${esc(t.level)}</span><button class="open" data-id="${t.id}">Решать</button></div>
                <p class="text">${esc(t.text)}</p>
                ${t.code ? `<pre class="code">${esc(t.code)}</pre>` : ""}
                ${t.figure ? `<div class="figure">${t.figure}</div>` : ""}
                ${opts}
                <details><summary>Ответ и решение</summary><div class="solution">${body}</div></details>
            </div>`;
        }).join("");
        return `<h3 class="book-topic" style="--c:${tp.color}">${esc(tp.name)} · ${list.length}</h3>${items}`;
    }).join("");
    el("screen").innerHTML = `<div class="card"><h2>Задачник: ${esc(BANK.examName)} ${esc(BANK.subjectDative)}</h2>
        <p class="lead">Все задачи тренажёра по темам. Ответы спрятаны — открывай после своей попытки. Для печати: Ctrl+P.</p>
        <div class="actions"><button id="book-open-all">Раскрыть все ответы</button><button id="book-close-all">Свернуть</button></div>
        ${parts}</div>`;
    el("book-open-all").onclick = () => el("screen").querySelectorAll("details").forEach((d) => (d.open = true));
    el("book-close-all").onclick = () => el("screen").querySelectorAll("details").forEach((d) => (d.open = false));
    el("screen").querySelectorAll(".book-task .open").forEach((b) => {
        b.onclick = () => startSession("train", [b.dataset.id]);
    });
}



// ---------- «Спросить ИИ»: готовые запросы ----------
function openModal(title, sub, text) {
    el("m-title").textContent = title;
    el("m-sub").textContent = sub;
    el("m-text").value = text;
    el("modal").classList.remove("hidden");
}



function closeModal() {
    el("modal").classList.add("hidden");
}



// Условие задачи целиком — для запроса к ИИ
function taskForPrompt(t) {
    let s = `Задание (${t.format}): «${t.text}»`;
    if (t.code) {
        s += "\nКод / данные:\n" + t.code;
    }
    if (t.kind === "choice" || t.kind === "multi") {
        s += "\nВарианты:\n" + t.options.map((o, i) => `${i + 1}) ${o}`).join("\n");
    }
    if (t.kind === "match") {
        s += "\nПервый столбец:\n" + t.options.left.join("\n") + "\nВторой столбец:\n" + t.options.right.join("\n");
    }
    if (t.figure) {
        s += "\n(К заданию есть рисунок — если он нужен, попроси меня его описать.)";
    }
    return s;
}



function introLine() {
    return `Я готовлюсь к ${BANK.examName} ${BANK.subjectDative} (${BANK.grade}).`;
}



function openTaskPrompt() {
    const t = current();
    const ans = readAnswer(t);
    const raw = String(ans.raw || "").trim();
    const mine = raw && raw !== "—".repeat(raw.length)
        ? `Мой ответ: ${raw}${t.unit ? " " + t.unit : ""}. Тренажёр говорит, что он неверный.`
        : "Я не знаю, с чего начать.";
    const text = `${introLine()} Тема: ${topicOf(t).name.toLowerCase()}.\n` +
        `${taskForPrompt(t)}\n${mine}\n\n` +
        "Не давай готового решения и не называй ответ! Задай мне ОДИН наводящий вопрос, чтобы я сам нашёл ошибку. " +
        "Когда отвечу — задай следующий. Если ошибусь — скажи, в чём именно, и какое правило нарушено, но не решай за меня.\n" +
        `Когда я получу ответ, проверь мою запись по критериям ${BANK.examName} и скажи, сколько баллов я бы получил.`;
    openModal("Спроси ИИ правильно", "Готовый запрос с условием задачи и твоим ответом. ИИ не выдаст ответ — он задаст наводящий вопрос.", text);
}



function openTopicPrompt(key) {
    const text = `${introLine()} Объясни тему «${BANK.topics[key].name}»: сначала на простом примере, потом главные правила и формулы и типичные ошибки на экзамене.\n` +
        "Затем задай мне 5 вопросов от простого к сложному — по одному. Жди мой ответ и не подсказывай, пока я не попробую сам. " +
        "В конце скажи, что из этой темы мне стоит повторить по учебнику.";
    openModal("Разобрать тему с ИИ", "Запрос на объяснение темы с проверочными вопросами.", text);
}



function copyPrompt() {
    const ta = el("m-text");
    ta.select();
    const done = () => {
        el("m-copy").textContent = "Скопировано!";
        setTimeout(() => (el("m-copy").textContent = "Скопировать"), COPY_FEEDBACK_MS);
    };
    const fallback = () => {
        try {
            document.execCommand("copy");
            done();
        } catch (e) {
            // копирование запрещено браузером — текст уже выделен, Ctrl+C
        }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, fallback);
    } else {
        fallback();
    }
}



function resetAll() {
    if (!window.confirm(`Стереть весь прогресс по ${BANK.examName} ${BANK.subjectDative}? Это нельзя отменить.`)) {
        return;
    }
    clearProgress(BANK_ID);
    state = emptyState();
    renderSidebar();
    showHome();
}



// ---------- Запуск ----------
function showLoadError(msg) {
    document.body.innerHTML = `<div class="card error-box"><h2>Тренажёр не загрузился</h2><p class="lead">${msg}</p><p><a href="index.html">← На главную</a></p></div>`;
}



// Подключить банк задач скриптом — так работает и с диска (file://), и с GitHub Pages
function loadBank(id, onReady) {
    const s = document.createElement("script");
    s.src = "banks/" + id + ".js?v=" + ASSET_VERSION;
    s.onload = () => {
        if (window.BANKS && window.BANKS[id]) {
            onReady(window.BANKS[id]);
        } else {
            showLoadError("Файл банка задач загрузился, но в нём нет данных.");
        }
    };
    s.onerror = () => showLoadError(`Не найден файл банка задач banks/${esc(id)}.js. Проверь, что папка тренажёра скопирована целиком.`);
    document.head.appendChild(s);
}



function setupPage(bank) {
    BANK = bank;
    const subj = SUBJECTS[bank.subject];
    document.title = `${bank.examName} · ${subj.name} — тренажёр`;
    document.documentElement.style.setProperty("--c", subj.color);
    el("logo").textContent = bank.letter || subj.letter;
    el("brand-title").textContent = `${bank.examName} · ${subj.name}`;
    el("brand-sub").textContent = `${bank.grade} · цель — ${bank.spec.maxScore} из ${bank.spec.maxScore} · ${bank.tasks.length} ${plural(bank.tasks.length, ["задача", "задачи", "задач"])}`;
    el("btn-exam").textContent = `Мини-экзамен · ${bank.mini.tasks} задач · ${bank.mini.minutes} мин`;
    el("btn-train").onclick = () => showTopicPicker(false);
    el("btn-exam").onclick = startExam;
    el("btn-review").onclick = startReview;
    el("btn-book").onclick = showBook;
    el("btn-home").onclick = showHome;
    el("btn-reset").onclick = resetAll;
    el("side-sources").innerHTML = "Ещё задания: " + sourceLinks(BANK_ID);
    el("m-close").onclick = closeModal;
    el("m-copy").onclick = copyPrompt;
    el("m-ai").innerHTML = ASSISTANTS.map((a) => `<a href="${a.url}" target="_blank" rel="noopener">${esc(a.name)} ↗</a>`).join("");
    el("m-ai").querySelectorAll("a").forEach((a) => (a.onclick = copyPrompt));
    el("modal").onclick = (e) => {
        if (e.target === el("modal")) {
            closeModal();
        }
    };
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
    state = loadProgress(BANK_ID);
    renderSidebar();
    showHome();
}



function init() {
    const id = new URLSearchParams(location.search).get("b") || "";
    if (!BANK_IDS.includes(id)) {
        showLoadError("Не выбран экзамен и предмет. Выбери их на главной странице.");
        return;
    }
    BANK_ID = id;
    loadBank(id, setupPage);
}



init();
