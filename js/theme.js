// Тема оформления: тёмная по умолчанию, светлая — по кнопке. Выбор хранится в localStorage этого браузера.
// Подключается в <head> до стилей страницы, чтобы при загрузке не мигала светлая тема.

const THEME_KEY = "ege_oge_trainer_theme";
const THEME_DARK = "dark";
const THEME_LIGHT = "light";
const THEME_LABELS = { dark: "☀ Светлая тема", light: "☾ Тёмная тема" };



function savedTheme() {
    try {
        return localStorage.getItem(THEME_KEY) === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
    } catch (e) {
        return THEME_DARK;
    }
}



function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
}



// Подписи кнопок: кнопка предлагает другую тему
function updateThemeButtons() {
    const label = THEME_LABELS[currentTheme()];
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
        b.textContent = label;
        b.title = "Переключить тему оформления";
    });
}



function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButtons();
}



function toggleTheme() {
    const next = currentTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    applyTheme(next);
    try {
        localStorage.setItem(THEME_KEY, next);
    } catch (e) {
        // хранилище недоступно — тема сработает до перезагрузки страницы
    }
}



applyTheme(savedTheme());
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => (b.onclick = toggleTheme));
    updateThemeButtons();
});
