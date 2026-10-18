# Независимая проверка банка «ЕГЭ · информатика» (КЕГЭ): каждый ответ заново вычисляется кодом
# по данным условия — перебором, моделированием исполнителя или выполнением программы из поля code.
# Таблицы, списки рёбер, программы и рисунки графов читаются прямо из банка; числа из текста условия
# записаны константами и сверяются с текстом (если условие поменяли, а скрипт нет — будет замечание).
# Запуск из корня проекта: python -I tools/check_ege_informatics.py banks/ege_informatics.js

import contextlib
import io
import ipaddress
import itertools
import math
import os
import re
import sys
from fractions import Fraction
from functools import lru_cache

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import load_bank, report  # noqa: E402

DEFAULT_BANK = "banks/ege_informatics.js"
RECURSION_LIMIT = 10000
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

# Таблицы графов в поле code: ширина столбца
TABLE_CELL_WIDTH = 4

# Фрагмент таблицы истинности: ширина столбца и смещение значения в столбце
FRAG_COL_WIDTH = 7
FRAG_VALUE_OFFSET = 2
FRAG_VARS = "wxyz"

# G1, G2 — какие дороги спрашивают
G1_ASKED = ["БВ", "ГЕ"]
G2_ASKED = "АБВГ"

# G4, G5 — вершины
G4_START, G4_FINISH = 1, 8
G5_START, G5_FINISH, G5_MUST, G5_AVOID = 1, 10, 6, 5

# L1 — формула; L3 — делители; L4 — отрезки; L5 — числа
L1_FORMULA = "(w → (x ∧ ¬y)) ∨ (z ≡ x)"
L3_D1, L3_D2 = 15, 36
L3_A_MAX = 1000
L3_X_MAX = 5000
L4_P = (17, 43)
L4_Q = (31, 68)
L4_RANGE = 100
L4_GRID_STEPS = 2
L5_M1, L5_M2 = 38, 73
L5_A_MAX = 256
L5_X_MAX = 1024

# I1 — код Фано
I1_KNOWN = {"Д": "10", "Л": "001", "Т": "111"}
I1_UNKNOWN = "ЕО"
I1_WORD = "ТОЛЕДО"
I1_MAX_LEN = 6

# I2 — изображение
I2_WIDTH, I2_HEIGHT = 1240, 1754
I2_FILE_MB = Fraction(2)
I2_HEADER_KB = 40

# I3 — звук
I3_FILE1_MB = 20
I3_RATE1, I3_BITS1, I3_CHANNELS1 = 24000, 16, 2
I3_RATE2, I3_BITS2, I3_CHANNELS2 = 96000, 24, 1

# I4 — слова
I4_LETTERS = "ПИТОН"
I4_VOWELS = "ИО"
I4_LEN = 6
I4_T_COUNT = 2

# I5 — пароли
I5_ALPHABET = 10 + 26 + 26 + 5
I5_LEN = 14
I5_EXTRA_BYTES = 20
I5_USERS = 250

# Единицы измерения
BITS_IN_BYTE = 8
BYTES_IN_KB = 1024
BYTES_IN_MB = 1024 * 1024

# A1 — алгоритм с двоичной записью
A1_N_MIN = 4
A1_N_MAX = 2000
A1_LIMIT = 500

# A3 — машина Тьюринга; A4 — Редактор
A3_NUMBER = 1234
A3_MAX_STEPS = 10000
A4_INPUT = "1" * 80
A4_MAX_STEPS = 10 ** 6

# S1–S3 — системы счисления
S1_VALUE = 125 ** 20 + 5 ** 41 - 5 ** 6 - 3
S2_BASE = 12
S2_DIVISOR = 11
S2_TERMS = ["3x41", "2x9", "1x7"]
S3_VALUE = 6 * 216 ** 30 + 5 * 36 ** 20 - 6 ** 15 + 9

# S4–S7 — IP-адреса
S4_HOST, S4_MASK = "172.29.115.203", "255.255.240.0"
S5_NET, S5_MASK = "118.64.96.0", "255.255.224.0"
S5_DIVISOR = 5
S6_HOST1, S6_HOST2 = "93.47.180.55", "93.47.190.12"
S7_HOST, S7_MASK = "10.12.77.140", "255.255.192.0"
IP_BITS = 32

# R1–R4 — рекурсия и количество программ
R1_F1 = 3            # F(1)
R1_SHIFT = 2         # F(n) = (n + R1_SHIFT)·F(n − 1)
R1_N = 2031
R1_K = 2             # (F(N) + K·F(N − 2)) / F(N − 3)
R2_ARG = 13
R3_ADD1, R3_ADD2, R3_MUL = 1, 4, 3
R3_START, R3_MUST, R3_FINISH, R3_AVOID = 2, 11, 35, 23
R4_START, R4_FINISH, R4_AVOID = 12, 40, 25

# W1–W4 — игры
W1_FINISH = 70
W1_S_MAX = 69
W4_ADD, W4_MUL = 2, 3
W4_FINISH = 81
W4_FIRST_PILE = 11
W4_S_MAX = 69

# P1–P7 — программирование
P1_DIV = 7
P1_LAST_DIGIT = 5
P2_FORBIDDEN = "A"
P2_LIMITED = "D"
P2_LIMIT = 3
P3_MASK = "12?4*57"
P3_DIVISOR = 2347
P3_LIMIT = 10 ** 8
P4_START = 1000000
P4_LAST_DIGIT = 3
P5_CAPACITY = 120
P6_ROWS, P6_SEATS = 6, 12
P6_GAP = 2
P7_NEAR = Fraction(5, 2)
P7_FAR = 4
P7_SCALE = 10000
P7_EPS = 1e-9



# Перевод натурального числа в систему счисления с основанием base: список цифр от старшей
def to_base(n, base):
    digits = []
    while n > 0:
        digits.append(n % base)
        n //= base
    return digits[::-1] or [0]



# Перевод записи числа из системы с основанием base в десятичную (свой алгоритм, без int(s, base))
def from_base(text, base):
    value = 0
    for ch in text:
        d = DIGITS.index(ch.upper())
        if d >= base:
            raise ValueError(f"цифра {ch} не из алфавита системы {base}")
        value = value * base + d
    return value



# Текст условия вместе с полем code — для сверки констант скрипта с условием
def condition(task):
    return task["text"] + "\n" + (task["code"] or "")



# ---------- графы
# Граф с рисунка: вершины — подписи в кружках, рёбра — отрезки пути M x y L x y
def parse_svg_graph(svg):
    circles = [(int(x), int(y)) for x, y in re.findall(r"<circle cx='(\d+)' cy='(\d+)'", svg)]
    labels = re.findall(r"<text x='(\d+)' y='(\d+)'[^>]*>(\w)</text>", svg)
    names = {}
    for x, y, name in labels:
        centre = min(circles, key=lambda c: math.dist(c, (int(x), int(y))))
        names[centre] = name
    edges = []
    for x1, y1, x2, y2 in re.findall(r"M(\d+) (\d+) L(\d+) (\d+)", svg):
        a = names[(int(x1), int(y1))]
        b = names[(int(x2), int(y2))]
        edges.append(a + b)
    return sorted(names.values()), edges



# Таблица смежности из поля code: {frozenset((i, j)): значение}; проверяет симметричность
def parse_adj_table(code):
    lines = code.split("\n")
    columns = [(int(m.group(1)), m.end()) for m in re.finditer(r"П(\d+)", lines[0])]
    cells = {}
    for line in lines[1:]:
        i = int(re.match(r"П(\d+)", line).group(1))
        for j, end in columns:
            value = line[end - TABLE_CELL_WIDTH:end].strip()
            if value:
                cells[(i, j)] = value
    for (i, j), value in cells.items():
        if cells.get((j, i)) != value:
            raise ValueError(f"таблица несимметрична: П{i}–П{j}")
    return {frozenset(key): value for key, value in cells.items()}



# Все сопоставления букв графа номерам таблицы, сохраняющие смежность (перебор перестановок)
def graph_isomorphisms(letters, letter_edges, table):
    numbers = sorted({v for key in table for v in key})
    target = set(table)
    found = []
    for perm in itertools.permutations(numbers):
        m = dict(zip(letters, perm))
        if {frozenset((m[e[0]], m[e[1]])) for e in letter_edges} == target:
            found.append(m)
    return found



# Единственное значение из множества вариантов либо пометка о неоднозначности
def single(values):
    values = set(values)
    if len(values) == 1:
        return values.pop()
    return f"неоднозначно: {sorted(values)}"



def solve_g1(task):
    letters, edges = parse_svg_graph(task["figure"])
    table = parse_adj_table(task["code"])
    sums = []
    for m in graph_isomorphisms(letters, edges, table):
        sums.append(sum(int(table[frozenset((m[r[0]], m[r[1]]))]) for r in G1_ASKED))
    return single(sums)



def solve_g2(task):
    letters, edges = parse_svg_graph(task["figure"])
    table = parse_adj_table(task["code"])
    maps = graph_isomorphisms(letters, edges, table)
    return single("".join(str(m[v]) for v in G2_ASKED) for m in maps)



# Процессы: время окончания = max(окончаний зависимостей) + длительность
def solve_g3(task):
    procs = {}
    for line in task["code"].split("\n")[1:]:
        m = re.match(r"(\d+)\s+(\d+)\s+(.+)$", line.strip())
        deps = [int(d) for d in re.findall(r"\d+", m.group(3)) if d != "0"]
        procs[int(m.group(1))] = (int(m.group(2)), deps)
    finish = {}

    def end(pid):
        if pid not in finish:
            duration, deps = procs[pid]
            finish[pid] = max((end(d) for d in deps), default=0) + duration
        return finish[pid]

    return max(end(pid) for pid in procs)



# Кратчайший путь: алгоритм Беллмана — Форда на точных дробях
def solve_g4(task):
    edges = []
    for line in task["code"].split("\n")[1:]:
        a, b, w = line.split()
        edges.append((int(a), int(b), Fraction(w)))
    vertices = {v for a, b, _ in edges for v in (a, b)}
    dist = {G4_START: Fraction(0)}
    for _ in range(len(vertices)):
        for a, b, w in edges:
            if a in dist and (b not in dist or dist[a] + w < dist[b]):
                dist[b] = dist[a] + w
    return math.floor(dist[G4_FINISH])



# Количество путей: полный перебор всех путей обходом в глубину
def solve_g5(task):
    edges = [(int(a), int(b)) for a, b in re.findall(r"(\d+)\s*→\s*(\d+)", task["code"])]
    count = 0
    stack = [[G5_START]]
    while stack:
        path = stack.pop()
        v = path[-1]
        if v == G5_FINISH:
            if G5_MUST in path and G5_AVOID not in path:
                count += 1
            continue
        for a, b in edges:
            if a == v:
                stack.append(path + [b])
    return count



# ---------- логика
# Разбор логического выражения с приоритетами ФИПИ: ¬, ∧, ∨, →, ≡; возвращает функцию env → bool
def parse_logic(text):
    tokens = re.findall(r"[a-z]|[¬∧∨→≡()01]", text)
    pos = [0]

    def peek():
        return tokens[pos[0]] if pos[0] < len(tokens) else None

    def take():
        pos[0] += 1
        return tokens[pos[0] - 1]

    def unary():
        tok = take()
        if tok == "¬":
            f = unary()
            return lambda env: not f(env)
        if tok == "(":
            f = equiv()
            take()
            return f
        if tok in "01":
            return lambda env: tok == "1"
        return lambda env: bool(env[tok])

    def chain(sub, op, combine):
        f = sub()
        while peek() == op:
            take()
            g = sub()
            f = combine(f, g)
        return f

    def conj():
        return chain(unary, "∧", lambda f, g: lambda env: f(env) and g(env))

    def disj():
        return chain(conj, "∨", lambda f, g: lambda env: f(env) or g(env))

    def impl():
        f = disj()
        if peek() == "→":
            take()
            g = impl()
            return lambda env: (not f(env)) or g(env)
        return f

    def equiv():
        return chain(impl, "≡", lambda f, g: lambda env: f(env) == g(env))

    result = equiv()
    if pos[0] != len(tokens):
        raise ValueError(f"лишние символы в выражении {text}")
    return result



# Задание 2: перебор сопоставлений столбцов переменным и всех заполнений пустых клеток
def solve_l1(task):
    func = parse_logic(L1_FORMULA)
    rows = []
    for line in task["code"].split("\n")[1:]:
        line = line.ljust(FRAG_COL_WIDTH * len(FRAG_VARS) + 1)
        cells = []
        for i in range(len(FRAG_VARS)):
            ch = line[FRAG_COL_WIDTH * i + FRAG_VALUE_OFFSET]
            cells.append(None if ch == " " else int(ch))
        rows.append((cells, int(line[FRAG_COL_WIDTH * len(FRAG_VARS)])))
    answers = []
    for perm in itertools.permutations(FRAG_VARS):
        variants = []
        for cells, f in rows:
            blanks = [i for i, c in enumerate(cells) if c is None]
            fills = []
            for bits in itertools.product((0, 1), repeat=len(blanks)):
                full = list(cells)
                for i, b in zip(blanks, bits):
                    full[i] = b
                if func(dict(zip(perm, full))) == bool(f):
                    fills.append(tuple(full))
            variants.append(fills)
        if any(len(set(combo)) == len(rows) for combo in itertools.product(*variants)):
            answers.append("".join(perm))
    return single(answers)



# Выбор выражения по полностью заданному фрагменту таблицы
def solve_l2(task):
    lines = task["code"].split("\n")
    names = lines[0].split()
    rows = [list(map(int, line.split())) for line in lines[1:]]
    good = []
    for k, option in enumerate(task["options"], start=1):
        func = parse_logic(option)
        if all(func(dict(zip(names[:-1], r[:-1]))) == bool(r[-1]) for r in rows):
            good.append(str(k))
    return single(good)



def solve_l3(task):
    best = None
    for a in range(1, L3_A_MAX + 1):
        if all(x % a == 0 or x % L3_D1 != 0 or x % L3_D2 != 0 for x in range(1, L3_X_MAX + 1)):
            best = a
    return best



# Отрезки: перебор целых концов A, проверка на сетке с шагом 1/2
def solve_l4(task):
    xs = [Fraction(i, L4_GRID_STEPS) for i in range(L4_RANGE * L4_GRID_STEPS + 1)]
    in_p = [L4_P[0] <= x <= L4_P[1] for x in xs]
    in_q = [L4_Q[0] <= x <= L4_Q[1] for x in xs]
    best = None
    for a in range(L4_RANGE + 1):
        for b in range(a, L4_RANGE + 1):
            if best is not None and b - a >= best:
                break
            if all(p == q or a <= x <= b for x, p, q in zip(xs, in_p, in_q)):
                best = b - a
    return best



def solve_l5(task):
    good = [a for a in range(L5_A_MAX)
            if all((x & a == 0) or (x & L5_M1 != 0) or (x & L5_M2 != 0) for x in range(L5_X_MAX))]
    return max(good)



# ---------- кодирование и объём информации
# Код Фано: перебор кодов неизвестных букв, проверка префиксности, минимум длины слова
def solve_i1(task):
    words = [""]
    pool = []
    for _ in range(I1_MAX_LEN):
        words = [w + b for w in words for b in "01"]
        pool.extend(words)
    best = None
    for codes in itertools.product(pool, repeat=len(I1_UNKNOWN)):
        table = dict(I1_KNOWN)
        table.update(zip(I1_UNKNOWN, codes))
        values = list(table.values())
        if any(i != j and values[j].startswith(values[i]) for i in range(len(values)) for j in range(len(values))):
            continue
        length = sum(len(table[ch]) for ch in I1_WORD)
        if best is None or length < best:
            best = length
    return best



def solve_i2(task):
    bits = (I2_FILE_MB * BYTES_IN_MB - I2_HEADER_KB * BYTES_IN_KB) * BITS_IN_BYTE
    depth = math.floor(bits / (I2_WIDTH * I2_HEIGHT))
    return 2 ** depth



def solve_i3(task):
    seconds = Fraction(I3_FILE1_MB * BYTES_IN_MB * BITS_IN_BYTE, I3_RATE1 * I3_BITS1 * I3_CHANNELS1)
    bits2 = seconds * I3_RATE2 * I3_BITS2 * I3_CHANNELS2
    return bits2 / BITS_IN_BYTE / BYTES_IN_MB



def solve_i4(task):
    count = 0
    for w in itertools.product(I4_LETTERS, repeat=I4_LEN):
        if w.count("Т") != I4_T_COUNT:
            continue
        if any(w[i] in I4_VOWELS and w[i + 1] in I4_VOWELS for i in range(I4_LEN - 1)):
            continue
        count += 1
    return count



def solve_i5(task):
    bits = 0
    while 2 ** bits < I5_ALPHABET:
        bits += 1
    password_bytes = -(-I5_LEN * bits // BITS_IN_BYTE)
    return (password_bytes + I5_EXTRA_BYTES) * I5_USERS



# ---------- исполнители
# Алгоритм задания 5: строим R по описанию (троичная запись) и перебираем N
def a1_result(n):
    s = to_base3(n)
    s += s[0] if n % 2 == 0 else "21"
    return from_base(s, 3)



def to_base3(n):
    s = ""
    while n:
        s = str(n % 3) + s
        n //= 3
    return s or "0"



def solve_a1(task):
    return min(r for r in (a1_result(n) for n in range(A1_N_MIN, A1_N_MAX)) if r > A1_LIMIT)



# Разбор программы Черепахи в список команд (Повтори раскрывается рекурсивно)
def turtle_parse(tokens, pos=0):
    commands = []
    while pos < len(tokens) and tokens[pos] != "]":
        word = tokens[pos]
        if word == "Повтори":
            times = int(tokens[pos + 1])
            body, pos = turtle_parse(tokens, pos + 3)
            commands.extend(body * times)
            pos += 1
        elif word in ("Поднять", "Опустить"):
            commands.append((word, 0))
            pos += 2
        else:
            commands.append((word, int(tokens[pos + 1])))
            pos += 2
    return commands, pos



# Точка на отрезке или внутри многоугольника (метод луча)
def inside_or_on(point, poly):
    px, py = point
    for (x1, y1), (x2, y2) in zip(poly, poly[1:]):
        cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)
        if cross == 0 and min(x1, x2) <= px <= max(x1, x2) and min(y1, y2) <= py <= max(y1, y2):
            return True
    inside = False
    for (x1, y1), (x2, y2) in zip(poly, poly[1:]):
        if (y1 > py) != (y2 > py):
            xc = x1 + Fraction(py - y1) * (x2 - x1) / (y2 - y1)
            if xc > px:
                inside = not inside
    return inside



# Моделирование Черепахи; ответ — целые точки в пересечении всех нарисованных фигур
def solve_a2(task):
    tokens = re.findall(r"\[|\]|[^\s\[\]]+", task["code"])
    commands, _ = turtle_parse(tokens)
    x, y, angle = 0, 0, 0
    pen = True
    polys = [[(0, 0)]]
    for word, n in commands:
        if word in ("Вперёд", "Назад"):
            sign = 1 if word == "Вперёд" else -1
            x += round(math.sin(math.radians(angle)) * n * sign)
            y += round(math.cos(math.radians(angle)) * n * sign)
            if pen:
                polys[-1].append((x, y))
        elif word == "Направо":
            angle += n
        elif word == "Налево":
            angle -= n
        elif word == "Поднять":
            pen = False
        elif word == "Опустить":
            pen = True
            polys.append([(x, y)])
    polys = [p for p in polys if len(p) > 1]
    for p in polys:
        if p[0] != p[-1]:
            raise ValueError("фигура не замкнута")
    xs = [px for p in polys for px, _ in p]
    ys = [py for p in polys for _, py in p]
    count = 0
    for px in range(min(xs), max(xs) + 1):
        for py in range(min(ys), max(ys) + 1):
            if all(inside_or_on((px, py), p) for p in polys):
                count += 1
    return count



# Машина Тьюринга: таблица из поля code, команды привязаны к столбцам заголовка по позиции
def solve_a3(task):
    lines = task["code"].split("\n")
    columns = {m.start(): m.group() for m in re.finditer(r"\S", lines[0])}
    program = {}
    for line in lines[1:]:
        state = line.split()[0]
        for m in re.finditer(r"(\S), ([LRS]), (q\d+)", line):
            program[(state, columns[m.start()])] = m.groups()
    tape = {i: ch for i, ch in enumerate(format(A3_NUMBER, "b"))}
    head = len(tape)
    state = "q0"
    for _ in range(A3_MAX_STEPS):
        symbol, move, state_next = program[(state, tape.get(head, "λ"))]
        tape[head] = symbol
        state = state_next
        if move == "S":
            break
        head += 1 if move == "R" else -1
    else:
        raise ValueError("машина не остановилась")
    cells = [i for i, ch in tape.items() if ch != "λ"]
    text = "".join(tape.get(i, "λ") for i in range(min(cells), max(cells) + 1))
    return from_base(text, 2)



# Редактор: условия цикла, ветвления и замены читаются из текста программы
def solve_a4(task):
    code = task["code"]
    loop = re.findall(r"нашлось\((\d+)\)", code.split("\n")[0])
    branches = re.findall(r"ЕСЛИ нашлось\((\d+)\)", code)
    replaces = re.findall(r"заменить\((\d+), (\d+)\)", code)
    s = A4_INPUT
    for _ in range(A4_MAX_STEPS):
        if not any(v in s for v in loop):
            return s
        for k, cond in enumerate(branches):
            if cond in s:
                v, w = replaces[k]
                break
        else:
            v, w = replaces[len(branches)]
        s = s.replace(v, w, 1)
    raise ValueError("Редактор не остановился")



# ---------- системы счисления и IP-адреса
def solve_s1(task):
    return to_base(S1_VALUE, 5).count(4)



def solve_s2(task):
    for x in range(S2_BASE):
        total = sum(from_base(t.replace("x", DIGITS[x]), S2_BASE) for t in S2_TERMS)
        if total % S2_DIVISOR == 0:
            return total // S2_DIVISOR
    return None



def solve_s3(task):
    return to_base(S3_VALUE, 6).count(0)



def solve_s4(task):
    net = ipaddress.ip_network(f"{S4_HOST}/{S4_MASK}", strict=False)
    return sum(int(octet) for octet in str(net.network_address).split("."))



def solve_s5(task):
    net = ipaddress.ip_network(f"{S5_NET}/{S5_MASK}")
    return sum(1 for ip in net if format(int(ip), "b").count("1") % S5_DIVISOR == 0)



# Перебор длины маски: оба узла в одной сети и не совпадают с адресом сети и широковещательным
def solve_s6(task):
    sizes = []
    hosts = [ipaddress.ip_address(S6_HOST1), ipaddress.ip_address(S6_HOST2)]
    for prefix in range(IP_BITS + 1):
        net = ipaddress.ip_network(f"{S6_HOST1}/{prefix}", strict=False)
        special = (net.network_address, net.broadcast_address)
        if all(h in net and h not in special for h in hosts):
            sizes.append(net.num_addresses)
    return min(sizes)



def solve_s7(task):
    net = ipaddress.ip_network(f"{S7_HOST}/{S7_MASK}", strict=False)
    special = (net.network_address, net.broadcast_address)
    good = ""
    for num, addr in re.findall(r"(\d)\) (\d+\.\d+\.\d+\.\d+)", task["text"]):
        ip = ipaddress.ip_address(addr)
        if ip in net and ip not in special:
            good += num
    return good



# ---------- рекурсия и динамика
def solve_r1(task):
    f = {1: R1_F1}
    for n in range(2, R1_N + 1):
        f[n] = (n + R1_SHIFT) * f[n - 1]
    num = f[R1_N] + R1_K * f[R1_N - 2]
    if num % f[R1_N - 3] != 0:
        return "не делится нацело"
    return num // f[R1_N - 3]



# Выполнение функции из поля code с перехватом печати
def solve_r2(task):
    namespace = {}
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        exec(task["code"], namespace)
        namespace["F"](R2_ARG)
    return sum(int(v) for v in buffer.getvalue().split())



def solve_r3(task):

    @lru_cache(maxsize=None)
    def count(a, b):
        if a == b:
            return 1
        if a > b or a == R3_AVOID:
            return 0
        return count(a + R3_ADD1, b) + count(a + R3_ADD2, b) + count(a * R3_MUL, b)

    return count(R3_START, R3_MUST) * count(R3_MUST, R3_FINISH)



def solve_r4(task):

    @lru_cache(maxsize=None)
    def count(a):
        if a == R4_FINISH:
            return 1
        if a > R4_FINISH or a == R4_AVOID:
            return 0
        return count(a + 1) + count(a + sum(int(d) for d in str(a)))

    return count(R4_START)



# ---------- теория игр
# Оценка позиции: +k — ходящий выигрывает не позже своего k-го хода, −k — проигрывает на k-м ходу соперника
def game_solver(moves, over):

    @lru_cache(maxsize=None)
    def value(pos):
        children = moves(pos)
        if any(over(c) for c in children):
            return 1
        vals = [value(c) for c in children]
        losing = [v for v in vals if v < 0]
        if losing:
            return -max(losing) + 1
        return -max(vals)

    return value



def game1_moves(s):
    return (s + 1, s + 3, s * 2)



def game1_over(s):
    return s >= W1_FINISH



def game2_moves(p):
    a, b = p
    return ((a + W4_ADD, b), (a, b + W4_ADD), (a * W4_MUL, b), (a, b * W4_MUL))



def game2_over(p):
    return p[0] + p[1] >= W4_FINISH



def solve_w1(task):
    value = game_solver(game1_moves, game1_over)
    for s in range(1, W1_S_MAX + 1):
        if any(not game1_over(c) and value(c) == 1 for c in game1_moves(s)):
            return s
    return None



def solve_w2(task):
    value = game_solver(game1_moves, game1_over)
    found = [s for s in range(1, W1_S_MAX + 1) if value(s) == 2]
    return " ".join(map(str, found[:2]))



def solve_w3(task):
    value = game_solver(game1_moves, game1_over)
    return min(s for s in range(1, W1_S_MAX + 1) if value(s) == -2)



def solve_w4(task):
    value = game_solver(game2_moves, game2_over)
    found = [s for s in range(1, W4_S_MAX + 1) if value((W4_FIRST_PILE, s)) == 2]
    return " ".join(map(str, found))



# ---------- программирование
def solve_p1(task):
    a = list(map(int, task["code"].split()))
    limit = max(x for x in a if x % 10 == P1_LAST_DIGIT)
    sums = [x + y for x, y in zip(a, a[1:]) if (x % P1_DIV == 0) != (y % P1_DIV == 0) and x + y > limit]
    return f"{len(sums)} {max(sums)}"



# Полный перебор подстрок
def solve_p2(task):
    s = task["code"].strip()
    best = 0
    for i in range(len(s)):
        for j in range(i + 1, len(s) + 1):
            t = s[i:j]
            if P2_FORBIDDEN in t or t.count(P2_LIMITED) > P2_LIMIT:
                break
            best = max(best, j - i)
    return best



# Маска переводится в регулярное выражение: ? — одна цифра, * — любая последовательность цифр
def solve_p3(task):
    pattern = re.compile("".join("[0-9]" if ch == "?" else "[0-9]*" if ch == "*" else ch for ch in P3_MASK))
    found = [n for n in range(P3_DIVISOR, P3_LIMIT + 1, P3_DIVISOR) if pattern.fullmatch(str(n))]
    return " ".join(map(str, found))



# Разложение на простые множители перебором делителей
def factorize(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors



def solve_p4(task):
    n = P4_START + 1
    while True:
        f = factorize(n)
        if len(f) == 2 and f[0] != f[1] and all(p % 10 == P4_LAST_DIGIT for p in f):
            return f"{n} {max(f)}"
        n += 1



# Перебор всех наборов коробок
def solve_p5(task):
    masses = list(map(int, task["code"].split()))
    best = (0, 0)
    for mask in range(1, 2 ** len(masses)):
        chosen = [m for i, m in enumerate(masses) if mask >> i & 1]
        if sum(chosen) <= P5_CAPACITY:
            best = max(best, (len(chosen), max(chosen)))
    return f"{best[0]} {best[1]}"



# Схема зала: ищем ровно P6_GAP свободных мест, ограниченных занятыми с обеих сторон
def solve_p6(task):
    occupied = {(int(r), int(s)) for r, s in re.findall(r"\((\d+), (\d+)\)", task["code"])}
    for row in range(P6_ROWS, 0, -1):
        for seat in range(2, P6_SEATS - P6_GAP + 1):
            free = all((row, seat + k) not in occupied for k in range(P6_GAP))
            if free and (row, seat - 1) in occupied and (row, seat + P6_GAP) in occupied:
                return f"{row} {seat}"
    return None



# Кластеры — компоненты связности по порогу «ближе P7_NEAR»; центр — минимум суммы расстояний
def solve_p7(task):
    pts = [(Fraction(x), Fraction(y)) for x, y in re.findall(r"(-?\d+\.\d+)\s+(-?\d+\.\d+)", task["code"])]
    clusters = []
    left = set(range(len(pts)))
    while left:
        group = {left.pop()}
        grew = True
        while grew:
            near = {j for j in left if any(math.dist(pts[i], pts[j]) < P7_NEAR for i in group)}
            grew = bool(near)
            group |= near
            left -= near
        clusters.append([pts[i] for i in sorted(group)])
    for a, b in itertools.combinations(clusters, 2):
        if min(math.dist(p, q) for p in a for q in b) <= P7_FAR:
            return "кластеры не разделены"
    for c in clusters:
        if any(math.dist(p, q) >= P7_NEAR for p, q in itertools.combinations(c, 2)):
            return "внутри кластера есть далёкие точки"
    centres = []
    for c in clusters:
        sums = sorted((sum(math.dist(p, q) for q in c), p) for p in c)
        if len(sums) > 1 and sums[1][0] - sums[0][0] < P7_EPS:
            return "центр не единственный"
        centres.append(sums[0][1])
    px = sum(p[0] for p in centres) / len(centres)
    py = sum(p[1] for p in centres) / len(centres)
    return f"{math.floor(px * P7_SCALE)} {math.floor(py * P7_SCALE)}"



# Решатели и фрагменты условия, которые должны быть в тексте (числа, зашитые в константы скрипта)
SOLVERS = {
    "G1": (solve_g1, ["Б–В", "Г–Е"]),
    "G2": (solve_g2, ["А, Б, В и Г"]),
    "G3": (solve_g3, ["минимальное время"]),
    "G4": (solve_g4, ["из вершины 1 в вершину 8", "целую часть"]),
    "G5": (solve_g5, ["из вершины 1 в вершину 10", "через вершину 6", "через вершину 5"]),
    "L1": (solve_l1, [L1_FORMULA]),
    "L2": (solve_l2, ["может быть F"]),
    "L3": (solve_l3, ["¬ДЕЛ(x, A) → (ДЕЛ(x, 15) → ¬ДЕЛ(x, 36))", "наибольшего"]),
    "L4": (solve_l4, ["P = [17, 43]", "Q = [31, 68]", "((x ∈ P) ≡ (x ∈ Q)) ∨ (x ∈ A)", "наименьшую"]),
    "L5": (solve_l5, ["(x & A ≠ 0) → ((x & 38 = 0) → (x & 73 ≠ 0))", "наибольшего"]),
    "I1": (solve_i1, ["Д — 10, Л — 001, Т — 111", "Е и О", "ТОЛЕДО"]),
    "I2": (solve_i2, ["1240 × 1754", "40 Кбайт", "2 Мбайт"]),
    "I3": (solve_i3, ["стерео", "24 кГц", "16 бит", "20 Мбайт", "моно", "96 кГц", "24 бита"]),
    "I4": (solve_i4, ["шестибуквенные", "П, И, Т, О, Н", "ровно 2 раза", "(И, О)"]),
    "I5": (solve_i5, ["14 символов", "26 строчных и 26 заглавных", "5 специальных", "20 байт", "250 пользователях"]),
    "A1": (solve_a1, ["троичная запись", "дописываются цифры 21", "большее 500"]),
    "A2": (solve_a2, ["включая точки на границах", "пересечения"]),
    "A3": (solve_a3, ["числа 1234", "ближайшей пустой ячейке справа"]),
    "A4": (solve_a4, ["из 80 единиц"]),
    "S1": (solve_s1, ["125²⁰ + 5⁴¹ − 5⁶ − 3", "основанием 5", "цифр 4"]),
    "S2": (solve_s2, ["3x41₁₂ + 2x9₁₂ + 1x7₁₂", "делится на 11", "наименьшее значение x"]),
    "S3": (solve_s3, ["6·216³⁰ + 5·36²⁰ − 6¹⁵ + 9", "основанием 6", "нулей"]),
    "S4": (solve_s4, [S4_HOST, S4_MASK]),
    "S5": (solve_s5, [S5_NET, S5_MASK, "кратно 5"]),
    "S6": (solve_s6, [S6_HOST1, S6_HOST2, "наименьшее количество"]),
    "S7": (solve_s7, [S7_HOST, S7_MASK]),
    "R1": (solve_r1, ["F(n) = 3 при n = 1", "F(n) = (n + 2)·F(n − 1)", "(F(2031) + 2·F(2029)) / F(2028)"]),
    "R2": (solve_r2, ["F(13)", "сумма всех чисел"]),
    "R3": (solve_r3, ["Прибавить 1", "Прибавить 4", "Умножить на 3", "число 2 в число 35", "содержит число 11", "не содержит числа 23"]),
    "R4": (solve_r4, ["Прибавить 1", "Прибавить сумму цифр", "число 12 в число 40", "не содержит числа 25"]),
    "W1": (solve_w1, ["один камень", "три камня", "в два раза", "не менее 70", "1 ≤ S ≤ 69", "минимальное значение S"]),
    "W2": (solve_w2, ["один камень", "три камня", "в два раза", "не менее 70", "1 ≤ S ≤ 69", "два наименьших"]),
    "W3": (solve_w3, ["один камень", "три камня", "в два раза", "не менее 70", "1 ≤ S ≤ 69", "минимальное значение S"]),
    "W4": (solve_w4, ["два камня", "в три раза", "не менее 81", "в первой куче 11 камней", "1 ≤ S ≤ 69"]),
    "P1": (solve_p1, ["ровно один из двух элементов делится на 7", "оканчивающегося на 5"]),
    "P2": (solve_p2, ["нет ни одной буквы A", "буква D встречается не более трёх раз"]),
    "P3": (solve_p3, ["маске 12?4*57", "на 2347", "не превышающих 10⁸"]),
    "P4": (solve_p4, ["большее 1 000 000", "двух различных простых", "на цифру 3"]),
    "P5": (solve_p5, ["не более 120 кг"]),
    "P6": (solve_p6, ["6 рядов по 12 мест", "ровно два свободных места"]),
    "P7": (solve_p7, ["меньше 2,5", "больше 4", "Px·10 000"]),
}



# Эталоны: id → ответ, вычисленный кодом; для задач kind "text" — None
def build_etalon(bank):
    etalon = {}
    tasks = {t["id"]: t for t in bank["tasks"]}
    for tid, (solver, fragments) in SOLVERS.items():
        task = tasks.get(tid)
        if task is None:
            etalon[tid] = None
            continue
        missing = [f for f in fragments if f not in condition(task)]
        if missing:
            etalon[tid] = f"в условии нет «{missing[0]}»"
            continue
        value = solver(task)
        if isinstance(value, Fraction) and value.denominator == 1:
            value = int(value)
        etalon[tid] = value
    for tid, task in tasks.items():
        if task["kind"] == "text":
            etalon[tid] = None
    return etalon



def main():
    sys.setrecursionlimit(RECURSION_LIMIT)
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BANK
    bank = load_bank(path)
    etalon = build_etalon(bank)
    sys.exit(report(bank, etalon))



if __name__ == "__main__":
    main()
