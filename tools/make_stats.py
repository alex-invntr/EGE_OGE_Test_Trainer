# Статистика проверок для подвала главной: пересчитывает ответы всеми tools/check_*.py и пишет js/stats.js.
# Остальные итоги (прогон в браузере, слепое решение, проверка на совпадения) передаются аргументами.
# Запуск из корня проекта:
#   python tools/make_stats.py --browser 796 --blind 77 --blind-total 77 --orig-checked 313 --replaced 5

import argparse
import datetime
import json
import os
import re
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
OUT = os.path.join(ROOT, "js", "stats.js")
TIMEOUT_S = 300
SUMMARY_RE = re.compile(r"задач (\d+), пересчитано (\d+)")



# Пересчёт ответов: сумма «задач N, пересчитано M» по всем банкам; при замечаниях — остановка
def recomputed():
    tasks = done = 0
    banks = sorted(f[:-3] for f in os.listdir(os.path.join(ROOT, "banks")) if f.endswith(".js"))
    for bank in banks:
        script = os.path.join(TOOLS, "check_" + bank + ".py")
        res = subprocess.run([sys.executable, "-I", script, os.path.join(ROOT, "banks", bank + ".js")],
                             capture_output=True, text=True, encoding="utf-8",
                             env=dict(os.environ, PYTHONIOENCODING="utf-8"), timeout=TIMEOUT_S)
        lines = [ln for ln in res.stdout.splitlines() if ln.strip()]
        m = SUMMARY_RE.search(lines[-1] if lines else "")
        if res.returncode != 0 or not m:
            print(f"FAIL {bank}: проверка не прошла — статистика не записана")
            sys.exit(1)
        tasks += int(m.group(1))
        done += int(m.group(2))
    return len(banks), tasks, done



def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--browser", type=int, required=True, help="число пройденных проверок tools/trainer_check.js")
    ap.add_argument("--blind", type=int, required=True, help="сколько ответов слепого решателя совпали с банком")
    ap.add_argument("--blind-total", type=int, required=True, help="сколько заданий решено вслепую")
    ap.add_argument("--orig-checked", type=int, required=True, help="сколько задач проверено на совпадения с открытыми источниками")
    ap.add_argument("--replaced", type=int, required=True, help="сколько задач с совпадениями заменено своими")
    a = ap.parse_args()
    banks, tasks, done = recomputed()
    stats = {
        "date": datetime.date.today().strftime("%d.%m.%Y"),
        "banks": banks, "tasks": tasks, "recomputed": done,
        "blind": a.blind, "blindTotal": a.blind_total,
        "browserChecks": a.browser,
        "origChecked": a.orig_checked, "replaced": a.replaced,
    }
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("// Статистика проверок для подвала главной. Файл создаёт tools/make_stats.py — руками не править.\n")
        f.write("const CHECK_STATS = " + json.dumps(stats, ensure_ascii=False) + ";\n")
    print("js/stats.js:", stats)



if __name__ == "__main__":
    main()
