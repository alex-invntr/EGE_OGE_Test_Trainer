// Страница методики: таблица экзаменов из банков задач и кнопки «Скопировать» у готовых запросов.

const COPY_FEEDBACK_MS = 1500;



// Таблица «Экзамены в цифрах» — из spec каждого банка, чтобы цифры не расходились с тренажёром
function renderSpecTable() {
    const table = el("spec-table");
    for (const examKey of Object.keys(EXAMS)) {
        for (const subjKey of Object.keys(SUBJECTS)) {
            const bank = window.BANKS && window.BANKS[examKey + "_" + subjKey];
            if (!bank) {
                continue;
            }
            const sp = bank.spec;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${esc(bank.examName)}, ${esc(bank.grade)}</td><td>${esc(SUBJECTS[subjKey].name)}</td>` +
                `<td>${sp.tasks}</td><td>${sp.minutes} мин</td><td>${sp.maxScore} ${plural(sp.maxScore, ["балл", "балла", "баллов"])}</td><td>${esc(sp.note)}</td>`;
            table.appendChild(tr);
        }
    }
}



// Кнопка «Скопировать» в каждом блоке запроса
function addCopyButtons() {
    document.querySelectorAll(".prompt").forEach((box) => {
        const text = box.textContent;
        const b = document.createElement("button");
        b.className = "copy";
        b.textContent = "Скопировать";
        b.onclick = () => {
            const done = () => {
                b.textContent = "Скопировано!";
                setTimeout(() => (b.textContent = "Скопировать"), COPY_FEEDBACK_MS);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, () => {});
            }
        };
        box.appendChild(b);
    });
}



renderSpecTable();
addCopyButtons();
