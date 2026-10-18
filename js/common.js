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
