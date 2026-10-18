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



render();
