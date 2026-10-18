# Независимая проверка банка ОГЭ · информатика: каждый ответ заново вычисляется кодом по данным условия
# (текст задачи, поле code, рисунок SVG), а не берётся из банка.
# Запуск из корня проекта: python -I tools/check_oge_informatics.py banks/oge_informatics.js

import contextlib
import fnmatch
import io
import itertools
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import load_bank, report

MINUS = "−"
NBSP = " "
SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉"
BASED_NUMBER = re.compile(r"([0-9A-F]+)([₀₁₂₃₄₅₆₇₈₉]+)")
VOWELS = set("аеёиоуыэюя")
SIGNS = set("ьъ")
BITS_IN_BYTE = 8
BYTES_IN_KBYTE = 1024
SEARCH_LIMIT = 1000          # граница перебора параметров и чисел
ROBOT_STEP_LIMIT = 10000     # защита от бесконечного цикла Робота
NAME_MIN_LETTERS = 5         # из условия N6: «в имени больше пяти букв»
HUNDRED = 100                # из условия N4: «больше ста»
TENTHS = 1                   # из условия S4: «округлите до десятых»
HEX_BASE = 16
CELL_REF = re.compile(r"(\$?)([A-Z])(\$?)(\d+)")
ARITHMETIC = re.compile(r"^[0-9.+\-*/() ]+$")



# ---------- общие помощники ----------

# Заменить типографский минус на обычный
def ascii_minus(s):
    return s.replace(MINUS, "-")



# Число вида 3A₁₆ → десятичное значение
def based_value(digits, sub):
    base = int(sub.translate(str.maketrans(SUBSCRIPTS, "0123456789")))
    return int(digits, base)



# Все числа с нижним индексом основания из строки, по порядку
def based_numbers(text):
    return [based_value(d, s) for d, s in BASED_NUMBER.findall(text)]



# Выполнить программу на Python: input подменяется очередью значений, вывод перехватывается
def run_program(code, inputs=()):
    queue = list(inputs)

    def fake_input(prompt=""):
        return str(queue.pop(0))

    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        exec(code, {"input": fake_input, "__builtins__": __builtins__})
    return out.getvalue().strip()



# Пример программы из поля solution: строки после «Пример программы:» до первой строки с русским текстом.
# Отступы в решении записаны неразрывными пробелами (движок показывает решение с white-space: pre-line)
def sample_program(solution):
    lines = solution.replace(NBSP, " ").split("Пример программы:\n", 1)[1].split("\n")
    code = []
    for line in lines:
        if line and not re.match(r"[A-Za-z_ ]", line):
            break
        code.append(line)
    return "\n".join(code)



# Сверить вывод примера программы из решения с эталоном: при расхождении вернуть текст ошибки
def confirm_sample(task, inputs, value):
    printed = run_program(sample_program(task["solution"]), inputs)
    if abs(float(printed) - value) > 1e-9:
        return f"пример программы из решения печатает {printed}, а пересчёт даёт {value}"
    return value



# Перевод высказывания из записи ОГЭ в выражение Python
def logic_to_python(expr):
    s = ascii_minus(expr)
    s = re.sub(r"(?<=\s)=(?=\s)", "==", s)
    s = s.replace("≥", ">=").replace("≤", "<=").replace("≠", "!=")
    s = re.sub(r"x делится на (\d+)", r"x % \1 == 0", s)
    s = s.replace("x нечётное", "x % 2 == 1").replace("x чётное", "x % 2 == 0")
    s = re.sub(r"\bИЛИ\b", " or ", s)
    s = re.sub(r"\bИ\b", " and ", s)
    s = re.sub(r"\bНЕ\b", " not ", s)
    return s



# Значение высказывания при данном x
def logic_value(expr, x):
    return bool(eval(logic_to_python(expr), {"__builtins__": {}}, {"x": x}))



# Строки вида «1) …» из текста: список (номер, содержимое)
def numbered_lines(text):
    return re.findall(r"^(\d)\) (.+)$", text, re.M)



# Единственный подходящий вариант или текст ошибки
def single(found, what):
    if len(found) != 1:
        return f"{what}: найдено {len(found)} вариантов {found}"
    return found[0]



# ---------- кодирование информации ----------

def check_i1(t):
    text = t["text"]
    bits = int(re.search(r"кодируется (\d+) бит", text).group(1))
    saved = int(re.search(r"на (\d+) байт", text).group(1))
    words = re.search(r"«([^»]+)»", text).group(1).split(" — ")[0].split(", ")
    # вместе со словом удаляются запятая и пробел — 2 символа
    found = [w for w in words if (len(w) + 2) * bits == saved * BITS_IN_BYTE]
    return single(found, "вычеркнутое слово")



def check_i2(t):
    text = t["text"]
    pages = int(re.search(r"(\d+) страниц", text).group(1))
    lines = int(re.search(r"(\d+) строк", text).group(1))
    chars = int(re.search(r"(\d+) символов", text).group(1))
    bits = int(re.search(r"кодируется (\d+) бит", text).group(1))
    return pages * lines * chars * bits / BITS_IN_BYTE / BYTES_IN_KBYTE



# Кодовая таблица из поля code: первая строка — буквы, вторая — коды
def code_table(code):
    rows = code.split("\n")
    return dict(zip(rows[0].split(), rows[1].split()))



# Все способы расшифровать цепочку (перебор с возвратом)
def decodings(bits, table):
    if not bits:
        return [""]
    result = []
    for letter, cw in table.items():
        if bits.startswith(cw):
            result += [letter + rest for rest in decodings(bits[len(cw):], table)]
    return result



def check_i3(t):
    table = code_table(t["code"])
    codes = list(table.values())
    for a, b in itertools.permutations(codes, 2):
        if b.startswith(a):
            return f"код {a} — начало кода {b}, условие Фано нарушено"
    message = re.search(r"Сообщение: ([01]+)", t["code"]).group(1)
    return single(decodings(message, table), "расшифровка")



def check_i4(t):
    table = code_table(t["code"])
    found = [str(i + 1) for i, chain in enumerate(t["options"]) if len(decodings(chain, table)) == 1]
    return single(found, "однозначная цепочка")



def check_i5(t):
    text = t["text"]
    length = int(re.search(r"длиной (\d+) символов", text).group(1))
    alphabet = int(re.search(r"содержит (\d+) различных", text).group(1))
    bits = math.ceil(math.log2(alphabet))
    return length * bits / BITS_IN_BYTE



# ---------- системы счисления и логика ----------

def check_n1(t):
    return sum(based_numbers(t["text"]))



def check_n2(t):
    return max(based_numbers(t["text"]))



def check_n3(t):
    low, high = based_numbers(t["text"])
    return len(range(low + 1, high))



def check_n4(t):
    return "".join(num for num, item in numbered_lines(t["text"]) if based_numbers(item)[0] > HUNDRED)



def check_n5(t):
    expr = t["text"].split("\n")[1].rstrip(".")
    found = [x for x in range(1, SEARCH_LIMIT) if logic_value(expr, x)]
    return found[0] if found else "нет подходящих x"



def check_n6(t):
    def letter_ok(name):
        name = name.lower()
        first_consonant = name[0] not in VOWELS and name[0] not in SIGNS
        last_vowel = name[-1] in VOWELS
        return first_consonant and not last_vowel and len(name) > NAME_MIN_LETTERS

    found = [str(i + 1) for i, name in enumerate(t["options"]) if letter_ok(name)]
    return single(found, "имя")



def check_n7(t):
    text = t["text"]
    low, high = map(int, re.search(r"\[(\d+); (\d+)\]", text).groups())
    expr = text.split("\n")[1].rstrip("?")
    return sum(1 for x in range(low, high + 1) if logic_value(expr, x))



def check_n8(t):
    x = int(re.search(r"при x = (\d+)", t["text"]).group(1))
    return "".join(num for num, expr in numbered_lines(t["text"]) if logic_value(expr, x))



# ---------- графы ----------

# Таблица расстояний из поля code: значение стоит под буквой столбца, выравнивание по правому краю
def parse_distance_table(code):
    rows = code.split("\n")
    header = rows[0]
    columns = [(i, ch) for i, ch in enumerate(header) if ch != " "]
    roads = {}
    for row in rows[1:]:
        a = row[0]
        for pos, b in columns:
            cell = row[max(0, pos - 2):pos + 1].strip()
            if cell:
                roads[(a, b)] = int(cell)
    for (a, b), w in roads.items():
        if roads.get((b, a)) != w:
            raise ValueError(f"таблица несимметрична: {a}{b}")
    return roads



# Все простые пути из start в finish: список (длина, путь)
def simple_paths(roads, start, finish):
    result = []

    def walk(node, path, length):
        if node == finish:
            result.append((length, path))
            return
        for (a, b), w in roads.items():
            if a == node and b not in path:
                walk(b, path + [b], length + w)

    walk(start, [start], 0)
    return result



# Кратчайший простой путь с учётом условий «через пункт» и «не через пункт» из текста
def shortest_by_text(t):
    text = t["text"]
    roads = parse_distance_table(t["code"])
    m = re.search(r"между пунктами ([A-Z]) и ([A-Z])", text) or re.search(r"из пункта ([A-Z]) в пункт ([A-Z])", text)
    start, finish = m.groups()
    via = re.search(r"(?<!не )проходящего через пункт ([A-Z])", text)
    avoid = re.search(r"не проходящего через пункт ([A-Z])", text)
    lengths = []
    for length, path in simple_paths(roads, start, finish):
        if via and via.group(1) not in path:
            continue
        if avoid and avoid.group(1) in path:
            continue
        lengths.append(length)
    return min(lengths)



def check_g1(t):
    return shortest_by_text(t)



def check_g2(t):
    return shortest_by_text(t)



def check_g3(t):
    return shortest_by_text(t)



# Граф из SVG: вершины — окружности с подписями, рёбра — линии от окружности к окружности (стрелка на конце)
def parse_svg_graph(svg):
    circles = [(float(x), float(y)) for x, y in re.findall(r"<circle cx='([\d.]+)' cy='([\d.]+)'", svg)]
    labels = re.findall(r"<text x='([\d.]+)' y='([\d.]+)'[^>]*>([^<]+)</text>", svg)

    def nearest(x, y):
        return min(range(len(circles)), key=lambda i: math.hypot(circles[i][0] - x, circles[i][1] - y))

    names = {}
    for x, y, name in labels:
        names[nearest(float(x), float(y))] = name
    edges = []
    for x1, y1, x2, y2 in re.findall(r"<line x1='([\d.]+)' y1='([\d.]+)' x2='([\d.]+)' y2='([\d.]+)'", svg):
        a = names[nearest(float(x1), float(y1))]
        b = names[nearest(float(x2), float(y2))]
        edges.append((a, b))
    return edges



# Все пути в ориентированном графе (перебор с возвратом)
def all_paths(edges, start, finish):
    result = []

    def walk(node, path):
        if node == finish:
            result.append(path)
            return
        for a, b in edges:
            if a == node and b not in path:
                walk(b, path + [b])

    walk(start, [start])
    return result



def check_g4(t):
    start, finish = re.search(r"из пункта ([A-Z]) в пункт ([A-Z])", t["text"]).groups()
    return len(all_paths(parse_svg_graph(t["figure"]), start, finish))



def check_g5(t):
    start, finish = re.search(r"из пункта ([A-Z]) в пункт ([A-Z])", t["text"]).groups()
    via = re.search(r"проходящих через пункт ([A-Z])", t["text"]).group(1)
    return sum(1 for p in all_paths(parse_svg_graph(t["figure"]), start, finish) if via in p)



# ---------- исполнители ----------

# Команды исполнителя из текста: номер → функция
def executor_commands(text):
    ops = {}
    for num, name, arg in re.findall(r"(\d)\. (прибавь|вычти|умножь на|возведи в квадрат) ?(\d*)", text):
        if name == "прибавь":
            ops[num] = lambda v, k=int(arg): v + k
        elif name == "вычти":
            ops[num] = lambda v, k=int(arg): v - k
        elif name == "умножь на":
            ops[num] = lambda v, k=int(arg): v * k
        else:
            ops[num] = lambda v: v * v
    return ops



# Выполнить программу исполнителя (строка номеров команд) над начальным числом
def execute(ops, program, value):
    for c in program:
        value = ops[c](value)
    return value



def check_a1(t):
    text = t["text"]
    program, start, finish = re.search(r"программа (\d+) переводит число (\d+) в число (\d+)", text).groups()
    add_num, add = re.search(r"(\d)\. прибавь (\d+)", text).groups()
    mul_num = re.search(r"(\d)\. умножь на b", text).group(1)
    found = []
    for b in range(2, SEARCH_LIMIT):
        ops = {add_num: lambda v: v + int(add), mul_num: lambda v, k=b: v * k}
        if execute(ops, program, int(start)) == int(finish):
            found.append(b)
    return single(found, "значение b")



def check_a2(t):
    text = t["text"]
    ops = executor_commands(text)
    start, finish = map(int, re.search(r"из числа (\d+) числа (\d+)", text).groups())
    max_len = int(re.search(r"не более (\d+) команд", text).group(1))
    found = []
    for n in range(1, max_len + 1):
        for prog in itertools.product(sorted(ops), repeat=n):
            if execute(ops, prog, start) == finish:
                found.append("".join(prog))
    return single(found, "алгоритм")



def check_a3(t):
    start, program = re.search(r"к числу (\d+) применить программу (\d+)", t["text"]).groups()
    return execute(executor_commands(t["text"]), program, int(start))



# Чертёжник: суммарное смещение программы с вложенными циклами «Повтори k раз … конец»
def drawer_shift(lines):
    stack = [[1, 0, 0]]
    for line in lines:
        line = ascii_minus(line.strip())
        rep = re.match(r"Повтори (\d+) раз", line)
        move = re.match(r"Сместиться на \((-?\d+), (-?\d+)\)", line)
        if rep:
            stack.append([int(rep.group(1)), 0, 0])
        elif move:
            stack[-1][1] += int(move.group(1))
            stack[-1][2] += int(move.group(2))
        elif line == "конец":
            k, dx, dy = stack.pop()
            stack[-1][1] += k * dx
            stack[-1][2] += k * dy
    return stack[0][1], stack[0][2]



def check_a4(t):
    dx, dy = drawer_shift(t["code"].split("\n"))
    found = []
    for i, opt in enumerate(t["options"]):
        a, b = map(int, re.search(r"\((-?\d+), (-?\d+)\)", ascii_minus(opt)).groups())
        if (a, b) == (-dx, -dy):
            found.append(str(i + 1))
    return single(found, "команда возврата")



# Робот: разбор программы КуМир в дерево — список команд и циклов («нц пока … кц»)
def parse_robot(lines):
    body = []
    while lines:
        line = lines.pop(0).strip()
        if not line:
            continue
        if line == "кц":
            return body
        loop = re.match(r"нц пока (не )?(сверху|снизу|слева|справа) свободно", line)
        if loop:
            body.append(("loop", bool(loop.group(1)), loop.group(2), parse_robot(lines)))
        else:
            body.append(("cmd", line))
    return body



# Выполнить программу Робота на поле cols × rows без внутренних стен; вернуть число закрашенных клеток
def run_robot(program, cols, rows, col, row):
    moves = {"вверх": (0, -1), "вниз": (0, 1), "влево": (-1, 0), "вправо": (1, 0)}
    sides = {"сверху": "вверх", "снизу": "вниз", "слева": "влево", "справа": "вправо"}
    state = {"c": col, "r": row, "steps": 0}
    painted = set()

    def free(direction):
        dc, dr = moves[direction]
        return 1 <= state["c"] + dc <= cols and 1 <= state["r"] + dr <= rows

    def run(body):
        for item in body:
            if item[0] == "loop":
                _, negate, side, inner = item
                while free(sides[side]) != negate:
                    state["steps"] += 1
                    if state["steps"] > ROBOT_STEP_LIMIT:
                        raise RuntimeError("Робот зациклился")
                    run(inner)
            elif item[1] == "закрасить":
                painted.add((state["c"], state["r"]))
            else:
                if not free(item[1]):
                    raise RuntimeError("Робот разбился о стену")
                dc, dr = moves[item[1]]
                state["c"] += dc
                state["r"] += dr

    run(program)
    return len(painted)



def check_a5(t):
    text = t["text"]
    cols, rows = map(int, re.search(r"из (\d+) столбцов и (\d+) строк", text).groups())
    if "в левой нижней клетке" not in text:
        return "не найдено начальное положение Робота"
    program = parse_robot(t["code"].split("\n"))
    return run_robot(program, cols, rows, 1, rows)



# ---------- программирование ----------

# Пары (s, t) из условия задания 6
def input_pairs(text):
    return [(int(a), int(b)) for a, b in re.findall(r"\((-?\d+), (-?\d+)\)", ascii_minus(text))]



def check_p1(t):
    return sum(1 for s, v in input_pairs(t["text"]) if run_program(t["code"], [s, v]) == "YES")



def check_p2(t):
    need = int(re.search(r"ровно (\d+) раза", t["text"]).group(1))
    pairs = input_pairs(t["text"])
    code = compile(t["code"], "P2", "exec")
    for a in range(-SEARCH_LIMIT, SEARCH_LIMIT):
        if sum(1 for s, v in pairs if run_program(code, [s, v, a]) == "YES") == need:
            return a
    return "подходящего A нет"



def check_p3(t):
    return int(run_program(t["code"]))



def check_p4(t):
    return int(run_program(t["code"]))



# Входные данные задания 16 из поля code
def input_numbers(code):
    return [int(v) for v in code.split()]



def check_p5(t):
    data = input_numbers(t["code"])
    seq = data[:data.index(0)]
    # шестнадцатеричная запись строкой: две цифры и последняя — A
    value = sum(1 for x in seq if len(format(x, "X")) == 2 and format(x, "X")[-1] == "A")
    return confirm_sample(t, data, value)



def check_p6(t):
    data = input_numbers(t["code"])
    seq = data[1:1 + data[0]]
    value = sum(x for x in seq if str(x)[-1] == "3" and x % 9 != 0)
    return confirm_sample(t, data, value)



def check_p7(t):
    data = input_numbers(t["code"])
    seq = [x for x in data[:data.index(0)] if x % 5 == 0]
    value = sum(seq) / len(seq)
    return confirm_sample(t, data, value)



# ---------- Интернет и файлы ----------

def check_w1(t):
    text = t["text"]
    name, server, proto = re.search(r"к файлу (\S+), находящемуся на сервере (\S+), осуществляется по протоколу (\w+)", text).groups()
    url = f"{proto}://{server}/{name}"
    parts = numbered_lines(text)
    found = ["".join(n for n, _ in perm) for perm in itertools.permutations(parts) if "".join(p for _, p in perm) == url]
    return single(found, "порядок фрагментов")



def check_w2(t):
    rows = {}
    for line in t["code"].split("\n")[1:]:
        query, count = re.split(r"\s{2,}", line.strip())
        rows[query] = int(count)
    target = re.search(r"по запросу (\w+)\?", t["text"]).group(1)
    union = next(q for q in rows if "|" in q)
    inter = next(q for q in rows if "&" in q)
    other = next(q for q in rows if "|" not in q and "&" not in q)
    if target not in union or other == target:
        return "запросы не согласованы с вопросом"
    # формула включений и исключений
    return rows[union] - rows[other] + rows[inter]



def check_w3(t):
    word = re.search(r"слово «(\w+)»", t["text"]).group(1)
    texts = [line for line in t["code"].split("\n") if not line.startswith("===")]
    pattern = re.compile(r"(?<![а-яё])" + word + r"(?![а-яё])", re.I)
    return len(pattern.findall("\n".join(texts)))



def check_w4(t):
    mask = re.search(r"маске (\S+) \?", t["text"]).group(1)
    return sum(1 for name in t["code"].split() if fnmatch.fnmatchcase(name, mask))



def check_w5(t):
    mask = re.search(r"маске (\S+) \?", t["text"]).group(1)
    found = [str(i + 1) for i, name in enumerate(t["options"]) if fnmatch.fnmatchcase(name, mask)]
    return single(found, "имя файла")



def check_w6(t):
    text = t["text"]
    folders = set(re.search(r"в каталогах (\w+) и (\w+)", text).groups())
    exts = set(re.search(r"расширениями (\.\w+) и (\.\w+)", text).groups())
    path = []
    count = 0
    for line in t["code"].split("\n"):
        depth = (len(line) - len(line.lstrip(" "))) // 4
        name = line.strip()
        del path[depth:]
        if name.endswith("/"):
            path.append(name[:-1])
        elif folders & set(path) and os.path.splitext(name)[1] in exts:
            count += 1
    return count



# ---------- электронные таблицы ----------

# Ячейки из поля code: первая строка — буквы столбцов, далее «номер строки, значения по столбцам»
def parse_cells(code):
    rows = code.split("\n")
    letters = rows[0].split()
    cells = {}
    for row in rows[1:]:
        tokens = ascii_minus(row).split()
        for letter, value in zip(letters, tokens[1:]):
            cells[letter + tokens[0]] = value
    return cells



# Сдвинуть относительные ссылки формулы на dc столбцов и dr строк
def shift_formula(formula, dc, dr):
    def shift(m):
        col_abs, col, row_abs, row = m.groups()
        new_col = col if col_abs else chr(ord(col) + dc)
        new_row = row if row_abs else str(int(row) + dr)
        return f"{col_abs}{new_col}{row_abs}{new_row}"

    return CELL_REF.sub(shift, formula)



# Значение ячейки: число или результат формулы (с рекурсией по ссылкам)
def cell_value(cells, ref):
    raw = cells.get(ref, "0")
    if not raw.startswith("="):
        return float(raw)
    expr = CELL_REF.sub(lambda m: repr(cell_value(cells, m.group(2) + m.group(4))), raw[1:])
    if not ARITHMETIC.match(expr):
        raise ValueError(f"непонятная формула {raw}")
    return eval(expr, {"__builtins__": {}})



def check_s1(t):
    src, formula, dst = re.search(r"В ячейку ([A-Z]\d+) записали формулу (=\S+) и скопировали её в ячейку ([A-Z]\d+)", t["text"]).groups()
    cells = parse_cells(t["code"])
    if cells.get(src) != formula:
        return f"в таблице в {src} другая формула: {cells.get(src)}"
    dc = ord(dst[0]) - ord(src[0])
    dr = int(dst[1:]) - int(src[1:])
    cells[dst] = shift_formula(formula, dc, dr)
    return cell_value(cells, dst)



# Значения ячеек диапазона A1:C3
def range_values(cells, rng):
    first, last = rng.split(":")
    values = []
    for col in range(ord(first[0]), ord(last[0]) + 1):
        for row in range(int(first[1:]), int(last[1:]) + 1):
            values.append(cell_value(cells, chr(col) + str(row)))
    return values



# Функция таблицы над диапазоном; у СЧЁТЕСЛИ второй аргумент — условие вида ">5"
def sheet_function(cells, name, args):
    parts = args.split(";")
    values = range_values(cells, parts[0])
    if name == "СУММ":
        return sum(values)
    if name == "МАКС":
        return max(values)
    if name == "МИН":
        return min(values)
    if name == "СРЗНАЧ":
        return sum(values) / len(values)
    if name == "СЧЁТЕСЛИ":
        op, limit = re.match(r'"([<>]=?|=)(-?\d+)"', parts[1]).groups()
        tests = {
            ">": lambda v: v > float(limit),
            "<": lambda v: v < float(limit),
            ">=": lambda v: v >= float(limit),
            "<=": lambda v: v <= float(limit),
            "=": lambda v: v == float(limit),
        }
        return sum(1 for v in values if tests[op](v))
    raise ValueError(f"неизвестная функция {name}")



# Значение формулы с функциями таблицы: каждая функция заменяется числом, остаток — арифметика
def sheet_formula(cells, formula):
    expr = re.sub(r"(СУММ|МАКС|МИН|СРЗНАЧ|СЧЁТЕСЛИ)\(([^)]*)\)", lambda m: repr(sheet_function(cells, m.group(1), m.group(2))), formula[1:])
    if not ARITHMETIC.match(expr):
        raise ValueError(f"непонятная формула {formula}")
    return eval(expr, {"__builtins__": {}})



def check_s2(t):
    cells = parse_cells(t["code"])
    right = {float(v): n for n, v in (re.match(r"(\d)\) (-?[\d.]+)", r).groups() for r in t["options"]["right"])}
    answer = ""
    for item in t["options"]["left"]:
        value = sheet_formula(cells, re.sub(r"^\w\) ", "", item))
        if value not in right:
            return f"значения {value} нет среди вариантов"
        answer += right[value]
    return answer



# Строки таблицы данных из поля code: без строки букв столбцов и без заголовка (строка 1)
def data_rows(code):
    rows = [ascii_minus(r).split() for r in code.split("\n")[1:]]
    return [r[1:] for r in rows if r[0] != "1"]



def check_s3(t):
    category = re.search(r"категории «(\w+)»", t["text"]).group(1)
    limit = int(re.search(r"больше (\d+) рублей", t["text"]).group(1))
    return sum(1 for name, cat, price, qty in data_rows(t["code"]) if cat == category and int(price) * int(qty) > limit)



def check_s4(t):
    wind = re.search(r"ветер \((\w+)\)", t["text"]).group(1)
    temps = [int(temp) for date, temp, rain, w in data_rows(t["code"]) if w == wind]
    return round(sum(temps) / len(temps), TENTHS)



CHECKS = {
    "I1": check_i1, "I2": check_i2, "I3": check_i3, "I4": check_i4, "I5": check_i5,
    "N1": check_n1, "N2": check_n2, "N3": check_n3, "N4": check_n4,
    "N5": check_n5, "N6": check_n6, "N7": check_n7, "N8": check_n8,
    "G1": check_g1, "G2": check_g2, "G3": check_g3, "G4": check_g4, "G5": check_g5,
    "A1": check_a1, "A2": check_a2, "A3": check_a3, "A4": check_a4, "A5": check_a5,
    "P1": check_p1, "P2": check_p2, "P3": check_p3, "P4": check_p4, "P5": check_p5, "P6": check_p6, "P7": check_p7,
    "W1": check_w1, "W2": check_w2, "W3": check_w3, "W4": check_w4, "W5": check_w5, "W6": check_w6,
    "S1": check_s1, "S2": check_s2, "S3": check_s3, "S4": check_s4,
}



# Эталоны id → ответ, пересчитанные кодом; для kind "text" — None; ошибка пересчёта попадает в отчёт как замечание
def build_etalon(bank):
    tasks = {t["id"]: t for t in bank["tasks"]}
    etalon = {}
    for t in bank["tasks"]:
        if t["kind"] == "text":
            etalon[t["id"]] = None
    for tid, fn in CHECKS.items():
        if tid not in tasks:
            etalon[tid] = None
            continue
        try:
            etalon[tid] = fn(tasks[tid])
        except Exception as e:
            etalon[tid] = f"ошибка пересчёта: {type(e).__name__}: {e}"
    return etalon



# Загрузить банк, пересчитать эталоны и вывести стандартный отчёт
def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join("banks", "oge_informatics.js")
    bank = load_bank(path)
    ETALON = build_etalon(bank)
    sys.exit(report(bank, ETALON))



if __name__ == "__main__":
    main()
