// Главная страница: карточки экзаменов и предметов с прогрессом из localStorage.
// Банки подключены в index.html обычными <script>, поэтому всё работает и с диска, и с GitHub Pages.



// Карточка одного предмета
function subjectCard(examKey, subjKey) {
    const id = examKey + "_" + subjKey;
    const subj = SUBJECTS[subjKey];
    const bank = window.BANKS && window.BANKS[id];
    if (!bank) {
        return `<div class="subj missing" style="--c:${subj.color}"><div class="top"><span class="letter">${subj.letter}</span><b>${subj.name}</b></div>` +
            `<div class="spec">банк задач не найден: banks/${id}.js</div></div>`;
    }
    const s = bankSummary(bank, loadProgress(id));
    const sp = bank.spec;
    const pct = s.total ? Math.round(100 * s.solved / s.total) : 0;
    const name = bank.subjectName.charAt(0).toUpperCase() + bank.subjectName.slice(1);
    return `<a class="subj" href="trainer.html?b=${id}" style="--c:${subj.color}">
        <div class="top"><span class="letter">${esc(bank.letter || subj.letter)}</span><b>${esc(name)}</b></div>
        <div class="spec">${sp.tasks} ${plural(sp.tasks, ["задание", "задания", "заданий"])} · ${sp.minutes} мин · максимум ${sp.maxScore} ${plural(sp.maxScore, ["балл", "балла", "баллов"])}<br>
        в тренажёре ${s.total} ${plural(s.total, ["задача", "задачи", "задач"])}, ${Object.keys(bank.topics).length} тем</div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="prog"><span>решено ${s.solved} из ${s.total}${s.acc === null ? "" : " · точность " + s.acc + "%"}</span>${s.due ? `<span class="due">повторить: ${s.due}</span>` : ""}</div>
    </a>`;
}



function render() {
    let total = 0;
    for (const examKey of Object.keys(EXAMS)) {
        el("subjects-" + examKey).innerHTML = Object.keys(SUBJECTS).map((s) => subjectCard(examKey, s)).join("");
        for (const s of Object.keys(SUBJECTS)) {
            const bank = window.BANKS && window.BANKS[examKey + "_" + s];
            total += bank ? bank.tasks.length : 0;
        }
    }
    el("total-tasks").textContent = total + " " + plural(total, ["задача", "задачи", "задач"]);
}



// Статистика мелким шрифтом: состав банков считается здесь, итоги проверок — из js/stats.js (tools/make_stats.py)
function renderStats() {
    const box = el("stats-line");
    const banks = BANK_IDS.map((id) => window.BANKS && window.BANKS[id]).filter(Boolean);
    if (!box || !banks.length) {
        return;
    }
    const tasks = banks.flatMap((b) => b.tasks);
    const count = (pred) => tasks.filter(pred).length;
    const byExam = (e) => banks.filter((b) => b.exam === e).reduce((n, b) => n + b.tasks.length, 0);
    const kinds = [
        ["число", (t) => t.kind === "number"],
        ["несколько чисел", (t) => t.kind === "numbers"],
        ["выбор", (t) => t.kind === "choice" || t.kind === "multi"],
        ["соответствие", (t) => t.kind === "match"],
        ["цифры", (t) => t.kind === "digits"],
        ["слово", (t) => t.kind === "word"],
        ["свободный ответ", (t) => t.kind === "text"],
    ].map(([name, pred]) => `${name} ${count(pred)}`).join(", ");
    const parts = [
        `Статистика: ${tasks.length} ${plural(tasks.length, ["задача", "задачи", "задач"])} (ОГЭ ${byExam("oge")}, ЕГЭ ${byExam("ege")})`,
        `${banks.length} ${plural(banks.length, ["банк", "банка", "банков"])}`,
        `${banks.reduce((n, b) => n + Object.keys(b.topics).length, 0)} тем`,
        `вторая часть — ${count((t) => t.part2)}`,
        `с рисунками — ${count((t) => t.figure)}`,
        `с программами и данными — ${count((t) => t.code)}`,
        `подсказок — ${tasks.reduce((n, t) => n + t.hints.length, 0)}`,
        `типы ответов: ${kinds}`,
    ];
    if (typeof CHECK_STATS !== "undefined") {
        const s = CHECK_STATS;
        parts.push(`ответы пересчитаны кодом — ${s.recomputed}`,
            `слепое решение по русскому языку — совпало ${s.blind} из ${s.blindTotal}`,
            `проверок в браузере — ${s.browserChecks}`,
            `проверено на совпадения с открытыми источниками — ${s.origChecked}, заменено своими — ${s.replaced}`,
            `данные на ${s.date}`);
    }
    box.textContent = parts.join(" · ") + ".";
}



render();
renderSourcesGrid("sources");
renderStats();
