// Тема оформления: тёмная по умолчанию, светлая — по кнопке. Выбор хранится в localStorage этого браузера.
// Подключается в <head> до стилей страницы, чтобы при загрузке не мигала светлая тема.
// Кнопка — квадратик той темы, которую включит: в тёмной — светлый с солнцем, в светлой — тёмный с луной.

const THEME_KEY = "ege_oge_trainer_theme";
const THEME_DARK = "dark";
const THEME_LIGHT = "light";
const THEME_TITLES = { dark: "Светлая тема", light: "Тёмная тема" };
const ICON_SUN = "<svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='4.6' fill='#F5A100'/>" +
    "<g stroke='#F5A100' stroke-width='2' stroke-linecap='round'><path d='M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6" +
    "M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8'/></g></svg>";
const ICON_MOON = "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8z' fill='#FFD43B'/></svg>";



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



// Кнопки показывают тему, которую включат: значок, цвет квадратика, подсказка
function updateThemeButtons() {
    const theme = currentTheme();
    const title = THEME_TITLES[theme];
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
        b.innerHTML = theme === THEME_DARK ? ICON_SUN : ICON_MOON;
        b.classList.toggle("to-light", theme === THEME_DARK);
        b.classList.toggle("to-dark", theme === THEME_LIGHT);
        b.title = title;
        b.setAttribute("aria-label", title);
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



// ---------- Свежая версия сайта ----------
// GitHub Pages разрешает браузеру держать страницу в кэше 10 минут. Если страница из кэша старее опубликованной
// (её ?v= не совпадает с version.json), открываем тот же адрес с новым параметром — его в кэше нет.
const VERSION_FILE = "version.json";
const VERSION_PARAM = "_v";
const PAGE_VERSION = document.currentScript ? new URL(document.currentScript.src, location.href).searchParams.get("v") : null;



function checkFreshVersion() {
    if (location.protocol === "file:" || !PAGE_VERSION || !window.fetch) {
        return;
    }
    fetch(VERSION_FILE + "?t=" + Date.now(), { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
            if (!data || !data.v || data.v === PAGE_VERSION) {
                return;
            }
            const url = new URL(location.href);
            if (url.searchParams.get(VERSION_PARAM) === data.v) {
                return;                                     // уже открыли свежий адрес — не зацикливаться
            }
            url.searchParams.set(VERSION_PARAM, data.v);
            location.replace(url.toString());
        })
        .catch(() => {
            // нет сети или файла — работаем с тем, что есть
        });
}



applyTheme(savedTheme());
checkFreshVersion();
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => (b.onclick = toggleTheme));
    updateThemeButtons();
});
