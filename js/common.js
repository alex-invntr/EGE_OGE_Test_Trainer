// Общие данные и функции для главной страницы и тренажёра: каталог банков, хранилище прогресса, статистика.

// Экзамены и предметы; банк задач — файл banks/<exam>_<subject>.js
const EXAMS = {
    oge: { name: "ОГЭ", grade: "9 класс" },
    ege: { name: "ЕГЭ", grade: "11 класс" },
};
const SUBJECTS = {
    math: { name: "Математика", letter: "М", color: "#1F5FBF" },
    physics: { name: "Физика", letter: "Ф", color: "#E8590C" },
    informatics: { name: "Информатика", letter: "И", color: "#0CA678" },
    russian: { name: "Русский язык", letter: "Р", color: "#D6336C" },
};
const BANK_IDS = Object.keys(EXAMS).flatMap((e) => Object.keys(SUBJECTS).map((s) => e + "_" + s));

const STORAGE_PREFIX = "ege_oge_trainer_v1:";
const REVIEW_DAYS = [1, 3, 7, 14];                          // интервалы повторения ошибок, дни
const DAY_MS = 86400000;
const ASSET_VERSION = "202610181949";                                // версия файлов для кэша браузера; ставит tools/set_version.py



function el(id) {
    return document.getElementById(id);
}



// Экранирование текста для вставки в HTML
function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
}



// Пустой прогресс: журнал попыток, очередь повторения, серия верных ответов подряд
function emptyState() {
    return { attempts: [], due: {}, streak: 0 };
}



// Прогресс одного банка из localStorage; при недоступном хранилище — пустой
function loadProgress(bankId) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + bankId);
        if (raw) {
            return Object.assign(emptyState(), JSON.parse(raw));
        }
    } catch (e) {
        // хранилище недоступно или запись испорчена — начинаем заново
    }
    return emptyState();
}



function saveProgress(bankId, state) {
    try {
        localStorage.setItem(STORAGE_PREFIX + bankId, JSON.stringify(state));
    } catch (e) {
        // хранилище недоступно
    }
}



function clearProgress(bankId) {
    try {
        localStorage.removeItem(STORAGE_PREFIX + bankId);
    } catch (e) {
        // хранилище недоступно
    }
}



// Множество id задач, решённых верно хотя бы раз
function solvedIds(state) {
    return new Set(state.attempts.filter((a) => a.ok).map((a) => a.id));
}



// Задачи, срок повторения которых наступил
function dueIdsOf(state, bank) {
    const now = Date.now();
    const ids = new Set(bank.tasks.map((t) => t.id));
    return Object.keys(state.due).filter((id) => state.due[id].at <= now && ids.has(id));
}



// Сводка по банку для карточки на главной: решено, точность, к повторению
function bankSummary(bank, state) {
    const ids = new Set(bank.tasks.map((t) => t.id));
    const att = state.attempts.filter((a) => ids.has(a.id));
    const solved = new Set(att.filter((a) => a.ok).map((a) => a.id)).size;
    return {
        total: ids.size,
        solved,
        acc: att.length ? Math.round(100 * att.filter((a) => a.ok).length / att.length) : null,
        due: dueIdsOf(state, bank).length,
    };
}



// Склонение по числу: plural(22, ["задание", "задания", "заданий"]) → «задания»
function plural(n, forms) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) {
        return forms[2];
    }
    if (b === 1) {
        return forms[0];
    }
    if (b >= 2 && b <= 4) {
        return forms[1];
    }
    return forms[2];
}



// Внешние базы заданий: каталоги РешуОГЭ / РешуЕГЭ (sdamgia.ru) и КЕГЭ (kompege.ru) — задания открытого банка ФИПИ с ответами и решениями
const SDAMGIA_CATALOG = "prob_catalog";
const SOURCES = {
    oge_math: [{ name: "РешуОГЭ", url: "https://math-oge.sdamgia.ru/" + SDAMGIA_CATALOG }],
    oge_physics: [{ name: "РешуОГЭ", url: "https://phys-oge.sdamgia.ru/" + SDAMGIA_CATALOG }],
    oge_informatics: [{ name: "РешуОГЭ", url: "https://inf-oge.sdamgia.ru/" + SDAMGIA_CATALOG }],
    oge_russian: [{ name: "РешуОГЭ", url: "https://rus-oge.sdamgia.ru/" + SDAMGIA_CATALOG }],
    ege_math: [{ name: "РешуЕГЭ", url: "https://math-ege.sdamgia.ru/" + SDAMGIA_CATALOG }],
    ege_physics: [{ name: "РешуЕГЭ", url: "https://phys-ege.sdamgia.ru/" + SDAMGIA_CATALOG }],
    ege_informatics: [{ name: "РешуЕГЭ", url: "https://inf-ege.sdamgia.ru/" + SDAMGIA_CATALOG }, { name: "КЕГЭ", url: "https://kompege.ru/" }],
    ege_russian: [{ name: "РешуЕГЭ", url: "https://rus-ege.sdamgia.ru/" + SDAMGIA_CATALOG }],
};



// Ссылки на внешние базы заданий одного банка
function sourceLinks(bankId) {
    return (SOURCES[bankId] || []).map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>`).join("");
}



// Номер задания КИМ из подписи format: «задание 9 ЕГЭ · …» → «9», «задания 6–11 ОГЭ» → «6–11»
function kimNumber(format) {
    const m = String(format).match(/задани[еяй]\s+(\d+(?:\s*[–-]\s*\d+)?)/);
    return m ? m[1].replace(/\s+/g, "") : "";
}



// Сетка ссылок на внешние базы (главная, методика): строка ОГЭ, строка ЕГЭ — колонки по предметам;
// дополнительные базы (КЕГЭ) — отдельной строкой ровно под своим предметом
function renderSourcesGrid(elId) {
    const box = document.getElementById(elId);
    if (!box) {
        return;
    }
    const columns = Object.keys(SUBJECTS);
    const cell = (id, src, extra) => {
        const [examKey, subjKey] = id.split("_");
        return `<a class="${extra ? "extra" : ""}" href="${src.url}" target="_blank" rel="noopener" style="--c:${SUBJECTS[subjKey].color};--col:${columns.indexOf(subjKey) + 1}">` +
            `${esc(src.name)} ↗<small>${EXAMS[examKey].name} · ${SUBJECTS[subjKey].name}</small></a>`;
    };
    const main = BANK_IDS.filter((id) => SOURCES[id] && SOURCES[id].length).map((id) => cell(id, SOURCES[id][0], false));
    const extra = BANK_IDS.flatMap((id) => (SOURCES[id] || []).slice(1).map((src) => cell(id, src, true)));
    box.innerHTML = main.concat(extra).join("");
}
