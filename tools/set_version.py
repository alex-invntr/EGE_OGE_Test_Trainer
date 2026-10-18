# Номер версии для стилей, скриптов и банков задач: «?v=…» в ссылках HTML, ASSET_VERSION в js/common.js и version.json.
# GitHub Pages разрешает браузерам кэшировать файлы на 10 минут; новая версия в адресе заставляет скачать свежие.
# Запуск из корня проекта перед коммитом: python tools/set_version.py [версия]; без версии — текущие дата и время.

import datetime
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index.html", "trainer.html", "guide.html", "howto.html"]
COMMON_JS = os.path.join("js", "common.js")
VERSION_JSON = "version.json"
ASSET_RE = re.compile(r'(src|href)="((?:css|js|banks)/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?"')
CONST_RE = re.compile(r'const ASSET_VERSION = "[^"]*";')



def main():
    version = sys.argv[1] if len(sys.argv) > 1 else datetime.datetime.now().strftime("%Y%m%d%H%M")
    total = 0
    for name in PAGES:
        path = os.path.join(ROOT, name)
        with open(path, encoding="utf-8") as f:
            src = f.read()
        src, n = ASSET_RE.subn(lambda m: f'{m.group(1)}="{m.group(2)}?v={version}"', src)
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(src)
        total += n
        print(f"{name}: ссылок {n}")
    path = os.path.join(ROOT, COMMON_JS)
    with open(path, encoding="utf-8") as f:
        src = f.read()
    src, n = CONST_RE.subn(f'const ASSET_VERSION = "{version}";', src)
    if n != 1:
        print("FAIL: в js/common.js нет строки const ASSET_VERSION")
        sys.exit(1)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(src)
    # version.json — его читает js/theme.js, чтобы обновить страницу, если браузер показал старую из кэша
    with open(os.path.join(ROOT, VERSION_JSON), "w", encoding="utf-8", newline="\n") as f:
        f.write('{"v": "' + version + '"}\n')
    print(f"версия {version}: ссылок {total}, ASSET_VERSION и {VERSION_JSON} обновлены")



if __name__ == "__main__":
    main()
