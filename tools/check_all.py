# Запуск всех проверок банков задач: структура и пересчёт ответов (tools/check_<банк>.py).
# Запуск из корня проекта: python -I tools/check_all.py

import os
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
BANKS_DIR = os.path.join(ROOT, "banks")
TIMEOUT_S = 300



def main():
    failed = []
    banks = sorted(f[:-3] for f in os.listdir(BANKS_DIR) if f.endswith(".js"))
    for bank in banks:
        script = os.path.join(TOOLS, "check_" + bank + ".py")
        if not os.path.exists(script):
            print(f"FAIL {bank}: нет скрипта проверки {os.path.basename(script)}")
            failed.append(bank)
            continue
        env = dict(os.environ, PYTHONIOENCODING="utf-8")
        res = subprocess.run([sys.executable, "-I", script, os.path.join(BANKS_DIR, bank + ".js")],
                             capture_output=True, text=True, encoding="utf-8", env=env, timeout=TIMEOUT_S)
        lines = [ln for ln in res.stdout.splitlines() if ln.strip()]
        summary = lines[-1] if lines else res.stderr.strip()[-300:]
        print(("OK   " if res.returncode == 0 else "FAIL ") + summary)
        if res.returncode != 0:
            for ln in lines[:-1]:
                if ln.startswith("FAIL"):
                    print("     " + ln)
            failed.append(bank)
    print(f"\nБанков: {len(banks)}, с замечаниями: {len(failed)}" + (f" ({', '.join(failed)})" if failed else ""))
    sys.exit(1 if failed else 0)



if __name__ == "__main__":
    main()
