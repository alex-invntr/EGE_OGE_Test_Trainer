# Общие функции проверки банков задач: загрузка JSON из banks/*.js, проверка структуры, сверка с эталоном.
# Используется скриптами tools/check_*.py. Запуск напрямую: python bank_common.py <файл банка>

import json
import re
import sys

# Вывод в консоль Windows — в UTF-8
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

EXAMS = {"oge", "ege"}
SUBJECTS = {"math", "physics", "informatics", "russian"}
KINDS = {"number", "numbers", "choice", "multi", "match", "digits", "word", "text"}
LEVELS = {"базовый", "повышенный", "высокий"}
HINTS_PER_TASK = 3
MIN_OPTIONS = 3
MAX_OPTIONS = 9
MAX_MATCH_RIGHT = 9
MAX_TOL = 0.1
BANK_FIELDS = ["exam", "subject", "examName", "subjectName", "subjectDative", "grade", "letter", "spec", "mini", "topics", "criteria", "tasks"]
TASK_FIELDS = ["id", "topic", "kind", "level", "format", "text", "code", "figure", "options", "answer", "unit", "tol", "hints", "solution", "part2"]



# Загрузить банк из файла banks/*.js: текст между 'BANKS["id"] = ' и последним "};" — строгий JSON
def load_bank(path):
    with open(path, encoding="utf-8") as f:
        src = f.read()
    m = re.search(r'BANKS\["(\w+)"\] = ', src)
    if not m:
        raise ValueError("нет строки BANKS[\"id\"] = {...}")
    end = src.rindex("};") + 1
    bank = json.loads(src[m.end():end])
    bank["_id"] = m.group(1)
    return bank



# Нормализация словесного ответа: регистр, ё, пробелы и знаки препинания
def norm_word(s):
    return re.sub(r"[^0-9a-zа-я]", "", str(s).lower().replace("ё", "е"))



# Проверка структуры банка; возвращает список замечаний (пустой — всё в порядке)
def check_structure(bank):
    problems = []
    for f in BANK_FIELDS:
        if f not in bank:
            problems.append(f"BANK: нет поля {f}")
    if problems:
        return problems
    if bank["exam"] not in EXAMS or bank["subject"] not in SUBJECTS:
        problems.append("BANK: неверные exam/subject")
    if bank.get("_id") and bank["_id"] != bank["exam"] + "_" + bank["subject"]:
        problems.append(f"BANK: ключ {bank['_id']} не равен exam_subject")
    for f in ["tasks", "maxScore", "minutes", "note"]:
        if f not in bank["spec"]:
            problems.append(f"BANK.spec: нет поля {f}")
    if "calc" not in bank["criteria"] or "text" not in bank["criteria"]:
        problems.append("BANK.criteria: нужны calc и text")
    topics = bank["topics"]
    if not (3 <= len(topics) <= 8):
        problems.append(f"BANK.topics: тем {len(topics)}, ожидается 3–8")
    ids = set()
    for t in bank["tasks"]:
        tid = t.get("id", "?")
        for f in TASK_FIELDS:
            if f not in t:
                problems.append(f"{tid}: нет поля {f}")
        if tid in ids:
            problems.append(f"{tid}: id повторяется")
        ids.add(tid)
        if t.get("topic") not in topics:
            problems.append(f"{tid}: тема {t.get('topic')} не описана в topics")
        kind = t.get("kind")
        if kind not in KINDS:
            problems.append(f"{tid}: неизвестный kind {kind}")
            continue
        if t.get("level") not in LEVELS:
            problems.append(f"{tid}: уровень {t.get('level')}")
        if not isinstance(t.get("text"), str) or len(t["text"]) < 10:
            problems.append(f"{tid}: пустое условие")
        if re.search(r"<[a-z/]", t.get("text", "")):
            problems.append(f"{tid}: в условии похоже на HTML")
        if t.get("figure") is not None and not str(t["figure"]).lstrip().startswith("<svg"):
            problems.append(f"{tid}: figure должен быть null или <svg…>")
        if t.get("code") is not None and not isinstance(t["code"], str):
            problems.append(f"{tid}: code должен быть null или строкой")
        if not isinstance(t.get("hints"), list) or len(t["hints"]) != HINTS_PER_TASK:
            problems.append(f"{tid}: подсказок должно быть {HINTS_PER_TASK}")
        if not isinstance(t.get("solution"), str) or len(t["solution"]) < 10:
            problems.append(f"{tid}: нет решения")
        if not isinstance(t.get("format"), str) or not t["format"]:
            problems.append(f"{tid}: нет подписи format")
        if "criteria" in t:
            c = t["criteria"]
            if not isinstance(c, list) or not c or any(not isinstance(x, list) or len(x) != 2 or not isinstance(x[0], int) for x in c):
                problems.append(f"{tid}: criteria — список [[балл, описание], ...]")
        if "answer" in t and "options" in t:
            problems.extend(check_answer(t))
    return problems



# Согласованность options и answer для каждого типа
def check_answer(t):
    tid, kind, opt, ans = t["id"], t["kind"], t.get("options"), t.get("answer")
    out = []
    if kind == "number":
        if not isinstance(ans, (int, float)) or isinstance(ans, bool):
            out.append(f"{tid}: number — answer должен быть числом")
        if not isinstance(t.get("tol"), (int, float)) or t["tol"] < 0 or t["tol"] > MAX_TOL:
            out.append(f"{tid}: tol вне диапазона 0…{MAX_TOL}")
        if opt is not None:
            out.append(f"{tid}: number — options должен быть null")
    elif kind in ("choice", "multi"):
        if not isinstance(opt, list) or not (MIN_OPTIONS <= len(opt) <= MAX_OPTIONS):
            out.append(f"{tid}: {kind} — нужен список из {MIN_OPTIONS}–{MAX_OPTIONS} вариантов")
            return out
        if not isinstance(ans, str) or not ans.isdigit():
            out.append(f"{tid}: {kind} — answer должен быть строкой цифр")
            return out
        if kind == "choice" and (len(ans) != 1 or not (1 <= int(ans) <= len(opt))):
            out.append(f"{tid}: choice — answer должен быть номером варианта 1…{len(opt)}")
        if kind == "multi":
            if list(ans) != sorted(set(ans)) or any(not (1 <= int(c) <= len(opt)) for c in ans):
                out.append(f"{tid}: multi — цифры по возрастанию, без повторов, в пределах 1…{len(opt)}")
            if len(ans) < 1 or len(ans) >= len(opt):
                out.append(f"{tid}: multi — верных вариантов должно быть от 1 до n−1")
    elif kind == "match":
        if not isinstance(opt, dict) or "left" not in opt or "right" not in opt:
            out.append(f"{tid}: match — options = {{left, right}}")
            return out
        if not isinstance(ans, str) or len(ans) != len(opt["left"]):
            out.append(f"{tid}: match — в answer по цифре на каждую позицию left")
            return out
        if len(opt["right"]) > MAX_MATCH_RIGHT or any(not c.isdigit() or not (1 <= int(c) <= len(opt["right"])) for c in ans):
            out.append(f"{tid}: match — цифры answer в пределах 1…{len(opt['right'])}")
    elif kind == "digits":
        if not isinstance(ans, str) or not ans.isdigit() or len(set(ans)) != len(ans):
            out.append(f"{tid}: digits — answer: строка разных цифр")
        if opt is not None:
            out.append(f"{tid}: digits — options должен быть null")
    elif kind == "numbers":
        if not isinstance(ans, str) or len(parse_numbers(ans)) < 2:
            out.append(f"{tid}: numbers — answer: строка из двух и более чисел через пробел")
        if opt is not None:
            out.append(f"{tid}: numbers — options должен быть null")
    elif kind == "word":
        variants = ans if isinstance(ans, list) else [ans]
        if not variants or any(not isinstance(v, str) or not norm_word(v) for v in variants):
            out.append(f"{tid}: word — answer: строка или список строк")
    elif kind == "text":
        if not isinstance(ans, str) or len(ans) < 10:
            out.append(f"{tid}: text — answer: образец ответа")
    return out



# Список чисел из строки «7 155» или «1,5 −2» — для ответов kind "numbers"
def parse_numbers(s):
    return [float(x.replace(",", ".")) for x in re.findall(r"-?\d+(?:[.,]\d+)?", str(s).replace("−", "-"))]



# Число в человеческом виде для отчёта
def fmt(v):
    return f"{v:g}" if isinstance(v, (int, float)) and not isinstance(v, bool) else repr(v)



# Сверка эталонов с банком: etalon — словарь id → ожидаемое значение (число, строка или None, если не пересчитывается).
# Возвращает (замечания, список id без эталона)
def compare(bank, etalon, rel_tol=1e-6):
    problems = []
    tasks = {t["id"]: t for t in bank["tasks"]}
    for tid, exp in etalon.items():
        if tid not in tasks:
            problems.append(f"{tid}: эталон есть, задачи нет")
            continue
        t = tasks[tid]
        got = t["answer"]
        if exp is None:
            continue
        if t["kind"] == "number":
            ok = isinstance(exp, (int, float)) and abs(got - exp) <= max(rel_tol, t["tol"]) * max(abs(exp), 1e-9) + 1e-9
        elif t["kind"] in ("digits", "multi"):
            ok = sorted(str(got)) == sorted(str(exp))
        elif t["kind"] == "numbers":
            exp_list = [float(x) for x in exp] if isinstance(exp, (list, tuple)) else parse_numbers(exp)
            ok = parse_numbers(got) == exp_list
        elif t["kind"] == "word":
            variants = got if isinstance(got, list) else [got]
            ok = norm_word(exp) in [norm_word(v) for v in variants]
        else:
            ok = str(got) == str(exp)
        if not ok:
            problems.append(f"{tid}: в банке {fmt(got)}, пересчёт даёт {fmt(exp)}")
    missing = [tid for tid in tasks if tid not in etalon]
    return problems, missing



# Стандартный отчёт скрипта проверки одного банка
def report(bank, etalon):
    problems = check_structure(bank)
    cmp_problems, missing = compare(bank, etalon)
    problems.extend(cmp_problems)
    for p in problems:
        print("FAIL", p)
    counted = sum(1 for v in etalon.values() if v is not None)
    print(f"{bank['examName']} · {bank['subjectName']}: задач {len(bank['tasks'])}, пересчитано {counted}, "
          f"без эталона {len(missing)}{' (' + ', '.join(missing) + ')' if missing else ''}, замечаний {len(problems)}")
    return 1 if problems else 0



def main():
    bank = load_bank(sys.argv[1])
    sys.exit(report(bank, {}))



if __name__ == "__main__":
    main()
