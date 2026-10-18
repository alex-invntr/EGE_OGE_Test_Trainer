# Проверка банка ЕГЭ · математика (профиль): каждый ответ заново вычисляется кодом по данным условия,
# ответы из банка не используются. Дополнительно сверяются графики на рисунках с функциями эталона
# и перебором проверяются утверждения задачи C6 (kind "text").
# Запуск из корня проекта: python -I tools/check_ege_math.py banks/ege_math.js

import itertools
import math
import os
import re
import sys
from fractions import Fraction

import numpy as np
import sympy as sp

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import load_bank, report  # noqa: E402

X = sp.Symbol("x", real=True)
PI = math.pi

# Численный поиск корней: число узлов сетки и допуски
ROOT_GRID = 200001
ROOT_EPS = 1e-10
ROOT_MERGE = 1e-7
# Допуск совпадения точки рисунка с графиком функции (в единицах сетки)
FIGURE_TOL = 0.05
# Отступ рамки графика в SVG (как в генераторе рисунков)
FIGURE_PAD = 18

# D1: график производной — полуволны синуса между нулями, высота полуволны = K · длина участка
D1_ZEROS = [-8, -5, -2, 1, 3, 6, 9]
D1_FIRST_SIGN = -1
D1_K = 0.95
D1_SEGMENT = (-4, 7)

# D2: функция и касательная y = K·x + B в точке X0
D2_X0 = -1
D2_K = -0.75
D2_B = 1.75
D2_C = 0.15
D2_X1 = 3

# D4: гипербола f(x) = K/(x + A) + B
D4_K = 4
D4_A = -1
D4_B = 2
D4_VALUE = -14

# G4: начала и концы векторов на сетке
G4_A = ((1, 1), (5, 2))
G4_B = ((2, 3), (3, 6))

# R6: таблица распределения
R6_VALUES = [2, 4, 6, 8]
R6_PROBS = [Fraction(1, 10), Fraction(4, 10), Fraction(4, 10), Fraction(1, 10)]

# Рамки графиков: id → (xmin, ymax, пикселей на единицу)
FIGURE_FRAMES = {"D1": (-8, 4, 22), "D2": (-5, 6, 26), "D4": (-5, 8, 24), "D5": (-2, 6, 28)}



# ---------- общие инструменты ----------
# Площадь многоугольника по координатам вершин (формула шнурования)
def shoelace(pts):
    s = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        s += x1 * y2 - x2 * y1
    return abs(s) / 2



# Объём тетраэдра по четырём вершинам
def tetra_volume(a, b, c, d):
    a, b, c, d = (np.array(p, dtype=float) for p in (a, b, c, d))
    return abs(np.linalg.det(np.array([b - a, c - a, d - a]))) / 6



# Угол при вершине v между лучами v→p и v→q, в градусах
def angle_deg(v, p, q):
    u = np.array(p) - np.array(v)
    w = np.array(q) - np.array(v)
    cos = np.dot(u, w) / np.linalg.norm(u) / np.linalg.norm(w)
    return math.degrees(math.acos(max(-1.0, min(1.0, cos))))



# Корень монотонной функции на отрезке делением пополам
def bisect(f, a, b, iters=200):
    fa = f(a)
    for _ in range(iters):
        m = (a + b) / 2
        fm = f(m)
        if (fm > 0) == (fa > 0):
            a, fa = m, fm
        else:
            b = m
    return (a + b) / 2



# Все корни f на [a, b]: смены знака + касания (локальные минимумы |f|, уточнённые золотым сечением)
def roots_on_segment(f, a, b):
    xs = np.linspace(a, b, ROOT_GRID)
    ys = np.array([f(x) for x in xs])
    found = []
    for i in range(len(xs) - 1):
        if ys[i] == 0:
            found.append(xs[i])
        elif ys[i] * ys[i + 1] < 0:
            found.append(bisect(f, xs[i], xs[i + 1]))
    if ys[-1] == 0:
        found.append(xs[-1])
    ay = np.abs(ys)
    for i in range(1, len(xs) - 1):
        if ay[i] <= ay[i - 1] and ay[i] <= ay[i + 1]:
            lo, hi = xs[i - 1], xs[i + 1]
            g = (math.sqrt(5) - 1) / 2
            for _ in range(200):
                m1 = hi - g * (hi - lo)
                m2 = lo + g * (hi - lo)
                if abs(f(m1)) < abs(f(m2)):
                    hi = m2
                else:
                    lo = m1
            r = (lo + hi) / 2
            if abs(f(r)) < ROOT_EPS:
                found.append(r)
    for end in (a, b):
        if abs(f(end)) < ROOT_EPS:
            found.append(end)
    found.sort()
    roots = []
    for r in found:
        if not roots or abs(r - roots[-1]) > ROOT_MERGE:
            roots.append(r)
    return roots



def num(expr):
    return float(sp.N(expr, 30))



# ---------- планиметрия и векторы ----------
# G1: трапеция AD = 22, BC = 10, боковые стороны 10 — строим по координатам
def task_g1():
    ad, bc, side = 22, 10, 10
    shift = (ad - bc) / 2
    h = math.sqrt(side ** 2 - shift ** 2)
    pts = [(0, 0), (shift, h), (shift + bc, h), (ad, 0)]
    assert abs(math.dist(pts[0], pts[1]) - side) < 1e-12 and abs(math.dist(pts[2], pts[3]) - side) < 1e-12
    return shoelace(pts)



# G2: вписанный четырёхугольник: подбираем положения D и C на окружности по углам ABD = 38°, CAD = 47°
def task_g2():
    def pt(deg):
        return (math.cos(math.radians(deg)), math.sin(math.radians(deg)))

    a_deg, b_deg = 180.0, 270.0
    # D между B и A (против часовой стрелки от B): угол ABD растёт от 0 до 180°
    d_deg = bisect(lambda t: angle_deg(pt(b_deg), pt(a_deg), pt(t)) - 38, b_deg + 1e-6, a_deg + 360 - 1e-6)
    # C между B и D: угол CAD убывает при движении C от B к D
    c_deg = bisect(lambda t: angle_deg(pt(a_deg), pt(t), pt(d_deg)) - 47, b_deg + 1e-6, d_deg - 1e-6)
    assert abs(angle_deg(pt(b_deg), pt(a_deg), pt(d_deg)) - 38) < 1e-6
    assert abs(angle_deg(pt(a_deg), pt(c_deg), pt(d_deg)) - 47) < 1e-6
    return angle_deg(pt(b_deg), pt(a_deg), pt(c_deg))



# G3: длина вектора 2a + b
def task_g3():
    a = np.array([3, -2])
    b = np.array([2, 10])
    return float(np.linalg.norm(2 * a + b))



# G4: скалярное произведение векторов, снятых с рисунка
def task_g4():
    a = np.subtract(G4_A[1], G4_A[0])
    b = np.subtract(G4_B[1], G4_B[0])
    return float(np.dot(a, b))



# G5: треугольник с площадью 50 и cos B = 0,6 по координатам; площадь A₁BC₁ через основания высот
def task_g5():
    cos_b = 0.6
    sin_b = math.sqrt(1 - cos_b ** 2)
    area = 50
    bc = 10
    ab = 2 * area / (bc * sin_b)
    b = np.array([0.0, 0.0])
    c = np.array([bc, 0.0])
    a = ab * np.array([cos_b, sin_b])
    # остроугольность
    for v, p, q in ((a, b, c), (b, a, c), (c, a, b)):
        assert angle_deg(v, p, q) < 90

    def foot(p, u, v):
        d = v - u
        return u + np.dot(p - u, d) / np.dot(d, d) * d

    a1 = foot(a, b, c)
    c1 = foot(c, b, a)
    assert abs(shoelace([tuple(a), tuple(b), tuple(c)]) - area) < 1e-9
    return shoelace([tuple(a1), tuple(b), tuple(c1)])



# ---------- стереометрия ----------
# S1: правильная четырёхугольная пирамида, сторона 6, апофема 5: высоту находим из условия на апофему
def task_s1():
    side, apothem = 6, 5
    h = sp.Symbol("h", positive=True)
    m = (side / 2, 0, 0)
    hval = float(sp.solve(sp.Eq(sp.sqrt(m[0] ** 2 + h ** 2), apothem), h)[0])
    s = (0, 0, hval)
    q = side / 2
    a, b, c, d = (-q, -q, 0), (q, -q, 0), (q, q, 0), (-q, q, 0)
    return tetra_volume(s, a, b, c) + tetra_volume(s, a, c, d)



# S2: шар вписан в цилиндр, полная поверхность цилиндра 36
def task_s2():
    r = sp.Symbol("R", positive=True)
    rv = sp.solve(sp.Eq(2 * sp.pi * r ** 2 + 2 * sp.pi * r * (2 * r), 36), r)[0]
    return num(4 * sp.pi * rv ** 2)



# S3: наклонная треугольная призма объёма 45 и пирамида MABC, M — середина CC₁
def task_s3():
    a, b, c = np.array([0.0, 0, 0]), np.array([4.0, 0, 0]), np.array([1.0, 3, 0])
    base = shoelace([tuple(a[:2]), tuple(b[:2]), tuple(c[:2])])
    height = 45 / base
    shift = np.array([1.0, 0.5, height])
    c1 = c + shift
    m = (c + c1) / 2
    prism = base * height
    assert abs(prism - 45) < 1e-9
    return tetra_volume(m, a, b, c)



# S4: конус с высотой 12 и образующей 13, объём / π
def task_s4():
    h, l = 12, 13
    r = math.sqrt(l ** 2 - h ** 2)
    return r ** 2 * h / 3



# S5: правильная пирамида, сторона 6, боковое ребро √34; расстояние от A до плоскости SCD
def task_s5():
    q = 3.0
    a, c, d = np.array([-q, -q, 0]), np.array([q, q, 0]), np.array([-q, q, 0])
    h = math.sqrt(34 - (q ** 2 + q ** 2))
    s = np.array([0, 0, h])
    assert abs(np.linalg.norm(c - s) - math.sqrt(34)) < 1e-12
    n = np.cross(c - s, d - s)
    return abs(np.dot(n, a - s)) / np.linalg.norm(n)



# ---------- вероятность ----------
def task_r1():
    total, red, blue = 40, 13, 9
    return float(Fraction(total - red - blue, total))



# R2: перебор 36 исходов двух бросков
def task_r2():
    outcomes = list(itertools.product(range(1, 7), repeat=2))
    good = sum(1 for o in outcomes if max(o) == 5)
    return float(Fraction(good, len(outcomes)))



# R3: перебор всех 2⁵ последовательностей попаданий/промахов
def task_r3():
    p = Fraction(8, 10)
    total = Fraction(0)
    for seq in itertools.product((0, 1), repeat=5):
        prob = Fraction(1)
        for hit in seq:
            prob *= p if hit else 1 - p
        if sum(seq) == 4:
            total += prob
    return float(total)



# R4: формула полной вероятности
def task_r4():
    bus = Fraction(6, 10)
    return float(bus * Fraction(15, 100) + (1 - bus) * Fraction(5, 100))



# R5: перебор исходов двух монет
def task_r5():
    pay = {2: 50, 1: 10, 0: -40}
    outcomes = list(itertools.product("ОР", repeat=2))
    return float(sum(Fraction(pay[o.count("О")], len(outcomes)) for o in outcomes))



# R6: дисперсия по таблице распределения
def task_r6():
    assert sum(R6_PROBS) == 1
    e = sum(x * p for x, p in zip(R6_VALUES, R6_PROBS))
    return float(sum((x - e) ** 2 * p for x, p in zip(R6_VALUES, R6_PROBS)))



# ---------- уравнения и выражения ----------
def task_a1():
    roots = sp.solve(sp.Eq(sp.log(2 * X - 5, 3), 4), X)
    roots = [r for r in roots if (2 * r - 5) > 0]
    assert len(roots) == 1
    return num(roots[0])



def task_a2():
    roots = sp.solve(sp.Eq(sp.Rational(1, 4) ** (X + 1), 64), X)
    assert len(roots) == 1
    return num(roots[0])



# A3: sympy сам отбрасывает посторонние корни; дополнительно проверяем подстановкой
def task_a3():
    roots = sp.solve(sp.Eq(sp.sqrt(3 * X + 19), X + 3), X)
    roots = [r for r in roots if sp.simplify(sp.sqrt(3 * r + 19) - (r + 3)) == 0]
    return num(min(roots))



def task_a4():
    return num(sp.log(56, 2) - sp.log(7, 2) + 5 ** sp.log(9, 5))



def task_a5():
    expr = sp.Integer(6) ** sp.Rational(17, 5) * sp.Integer(2) ** sp.Rational(-7, 5) / sp.Integer(3) ** sp.Rational(7, 5)
    return num(expr)



# ---------- производная и функции ----------
# D1: та же функция, что на рисунке: полуволны синуса между нулями, знаки чередуются
def d1_fprime(x):
    sign = D1_FIRST_SIGN
    for a, b in zip(D1_ZEROS, D1_ZEROS[1:]):
        if a <= x <= b:
            length = b - a
            return sign * D1_K * length * math.sin(math.pi * (x - a) / length)
        sign = -sign
    raise ValueError(x)



# D1: число точек максимума f на отрезке — смены знака f′ с «+» на «−»
def task_d1():
    lo, hi = D1_SEGMENT
    xs = np.linspace(lo, hi, 110001)
    signs = [np.sign(d1_fprime(x)) for x in xs]
    count = 0
    last = signs[0]
    for s in signs[1:]:
        if s == 0:
            continue
        if last > 0 and s < 0:
            count += 1
        last = s
    return count



def d2_expr():
    return D2_K * X + D2_B + D2_C * (X - D2_X0) ** 2 * (X - D2_X1)



# D2: производная функции с рисунка в точке x₀
def task_d2():
    return num(sp.diff(d2_expr(), X).subs(X, D2_X0))



# D3: наименьшее значение на отрезке: критические точки + концы
def task_d3():
    y = (X - 8) * sp.exp(X - 7)
    crit = [c for c in sp.solve(sp.diff(y, X), X) if 6 <= c <= 8]
    return min(num(y.subs(X, c)) for c in crit + [6, 8])



def d4_expr():
    return D4_K / (X + D4_A) + D4_B



def task_d4():
    roots = sp.solve(sp.Eq(d4_expr(), D4_VALUE), X)
    assert len(roots) == 1
    return num(roots[0])



def d5_f():
    return X ** 2 - 4 * X + 2



def d5_g():
    return 2 * X - 3



# D5: точки пересечения; A = (1; −1) видна на рисунке, B — вторая
def task_d5():
    xs = sp.solve(sp.Eq(d5_f(), d5_g()), X)
    assert 1 in xs and len(xs) == 2
    xb = [x for x in xs if x != 1][0]
    return num(d5_g().subs(X, xb))



# D6: затраты на рейс 150 км как функция скорости; минимум по производной
def task_d6():
    v = sp.Symbol("v", positive=True)
    cost = (1600 + sp.Rational(1, 10) * v ** 3) * 150 / v
    crit = sp.solve(sp.diff(cost, v), v)
    assert len(crit) == 1 and sp.diff(cost, v, 2).subs(v, crit[0]) > 0
    return num(cost.subs(v, crit[0]))



# ---------- прикладные и текстовые задачи ----------
def task_t1():
    t = sp.Symbol("t", real=True)
    sol = sp.solveset(1 + 11 * t - 5 * t ** 2 >= 3, t, sp.Interval(0, sp.oo))
    return num(sol.measure)



def task_t2():
    t = sp.Symbol("t", real=True)
    roots = sp.solve(sp.Eq(20 + 80 * 2 ** (-t / 8), 25), t)
    return num(roots[0])



def task_t3():
    v = sp.Symbol("v", real=True)
    roots = [r for r in sp.solve(sp.Eq(112 / (v - 3) - 112 / (v + 3), 6), v) if r > 3]
    assert len(roots) == 1
    return num(roots[0])



def task_t4():
    t = sp.Symbol("t", real=True)
    roots = [r for r in sp.solve(sp.Eq(1 / t + 1 / (t - 10), sp.Rational(1, 12)), t) if r > 10]
    assert len(roots) == 1
    return num(roots[0])



# T5: моделирование кредита по годам: долг на июль уменьшается равномерно
def task_t5():
    credit, years, rate = Fraction(600), 5, Fraction(20, 100)
    step = credit / years
    debt = credit
    paid = Fraction(0)
    for _ in range(years):
        grown = debt * (1 + rate)
        target = debt - step
        paid += grown - target
        debt = target
    assert debt == 0
    return float(paid)



# T6: сумма кредита из условия «три равных платежа по 1 331 000 при 10 %»
def task_t6():
    s = sp.Symbol("S")
    payment, rate = 1331000, sp.Rational(11, 10)
    debt = s
    for _ in range(3):
        debt = debt * rate - payment
    return num(sp.solve(sp.Eq(debt, 0), s)[0])



# ---------- часть 2 ----------
# C1: корни 2sin²x − 3sin(x − π/2) − 3 = 0 на [3π/2; 3π], сумма / π
def task_c1():
    roots = roots_on_segment(lambda x: 2 * math.sin(x) ** 2 - 3 * math.sin(x - PI / 2) - 3, 1.5 * PI, 3 * PI)
    return round(sum(roots) / PI, 6)



# C2: корни 16^sin x − 5·4^sin x + 4 = 0 на [−3π; −3π/2], сумма / π
def task_c2():
    roots = roots_on_segment(lambda x: 16 ** math.sin(x) - 5 * 4 ** math.sin(x) + 4, -3 * PI, -1.5 * PI)
    return round(sum(roots) / PI, 6)



# C3: целые решения logₓ(x + 6) ≥ 2 — проверка каждого целого с высокой точностью
def task_c3():
    good = []
    for x in range(-100, 1001):
        if x <= 0 or x == 1 or x + 6 <= 0:
            continue
        val = sp.N(sp.log(x + 6) / sp.log(x) - 2, 50)
        if val >= -1e-40:
            good.append(x)
    assert good and max(good) < 1000
    return sum(good)



# C4: целые решения (4^x − 9·2^x + 8)/(x² − 25) ≤ 0 — точная арифметика дробей
def task_c4():
    good = []
    for x in range(-200, 201):
        if x * x == 25:
            continue
        val = (Fraction(4) ** x - 9 * Fraction(2) ** x + 8) / (x * x - 25)
        if val <= 0:
            good.append(x)
    assert -200 < min(good) and max(good) < 200
    return sum(good)



# C5: число различных корней (x² − 4x − a)·√(x − a) = 0 при данном a (точно, через sympy)
def c5_root_count(a):
    a = sp.sympify(a)
    roots = {a}
    for r in sp.solve(X ** 2 - 4 * X - a, X):
        if r.is_real and sp.simplify(r - a) >= 0:
            roots.add(sp.nsimplify(sp.simplify(r)))
    distinct = []
    for r in roots:
        if all(sp.simplify(r - q) != 0 for q in distinct):
            distinct.append(r)
    return len(distinct)



def task_c5():
    good = [a for a in range(-100, 101) if c5_root_count(a) == 2]
    return sum(good)



# ---------- дополнительные проверки ----------
# C5: заявленное в решении множество (a = −4 или 0 ≤ a < 5) проверяем на сетке с шагом 1/4
def check_c5_set():
    problems = []
    for k in range(-40, 41):
        a = Fraction(k, 4)
        expected = a == -4 or 0 <= a < 5
        if (c5_root_count(a) == 2) != expected:
            problems.append(f"C5: при a = {a} число корней не совпадает с решением")
    return problems



# C6: все наборы различных натуральных чисел с попарной разностью ≥ 3 и суммой total из n чисел
def gap_sets(n, total, start=1):
    if n == 0:
        if total == 0:
            yield []
        return
    first = start
    while n * first + 3 * n * (n - 1) // 2 <= total:
        for rest in gap_sets(n - 1, total - first, first + 3):
            yield [first] + rest
        first += 1



# C6 (kind "text"): а) 8 чисел — можно, б) 9 чисел — нельзя, в) наибольшее наименьшее из 5 чисел — 14
def check_c6_claims():
    problems = []
    if next(gap_sets(8, 100), None) is None:
        problems.append("C6: перебор не нашёл набора из 8 чисел")
    if next(gap_sets(9, 100), None) is not None:
        problems.append("C6: перебор нашёл набор из 9 чисел")
    best = max(s[0] for s in gap_sets(5, 100))
    if best != 14:
        problems.append(f"C6: наибольшее наименьшее число из 5 — {best}, а не 14")
    example = [1, 4, 7, 10, 13, 16, 19, 30]
    if sum(example) != 100 or any(b - a < 3 for a, b in zip(example, example[1:])):
        problems.append("C6: пример пункта а не подходит")
    return problems



# Все точки линии лежат на графике f (точка вне области определения — несовпадение)
def on_curve(f, pts):
    try:
        return all(abs(f(x) - y) <= FIGURE_TOL for x, y in pts)
    except (ValueError, ZeroDivisionError):
        return False



# Рисунки-графики: каждая линия толщиной 2 или 1,5 должна лежать на одной из функций эталона
def check_figures(bank):
    tasks = {t["id"]: t for t in bank["tasks"]}
    def d2_tangent(x):
        return D2_K * x + D2_B

    funcs = {
        "D1": [d1_fprime],
        "D2": [sp.lambdify(X, d2_expr()), d2_tangent],
        "D4": [sp.lambdify(X, d4_expr())],
        "D5": [sp.lambdify(X, d5_f()), sp.lambdify(X, d5_g())],
    }
    problems = []
    for tid, (xmin, ymax, unit) in FIGURE_FRAMES.items():
        svg = tasks[tid]["figure"] or ""
        paths = re.findall(r"<path d='([^']*)' stroke='#14213D' stroke-width='(?:2|1\.5)'", svg)
        if not paths:
            problems.append(f"{tid}: на рисунке не найден график")
            continue
        for d in paths:
            nums = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", d)]
            pts = [(xmin + (px - FIGURE_PAD) / unit, ymax - (py - FIGURE_PAD) / unit) for px, py in zip(nums[::2], nums[1::2])]
            if not any(on_curve(f, pts) for f in funcs[tid]):
                problems.append(f"{tid}: линия на рисунке не совпадает с функцией эталона")
    return problems



ETALON = {
    "G1": task_g1(), "G2": task_g2(), "G3": task_g3(), "G4": task_g4(), "G5": task_g5(),
    "S1": task_s1(), "S2": task_s2(), "S3": task_s3(), "S4": task_s4(), "S5": task_s5(),
    "R1": task_r1(), "R2": task_r2(), "R3": task_r3(), "R4": task_r4(), "R5": task_r5(), "R6": task_r6(),
    "A1": task_a1(), "A2": task_a2(), "A3": task_a3(), "A4": task_a4(), "A5": task_a5(),
    "D1": task_d1(), "D2": task_d2(), "D3": task_d3(), "D4": task_d4(), "D5": task_d5(), "D6": task_d6(),
    "T1": task_t1(), "T2": task_t2(), "T3": task_t3(), "T4": task_t4(), "T5": task_t5(), "T6": task_t6(),
    "C1": task_c1(), "C2": task_c2(), "C3": task_c3(), "C4": task_c4(), "C5": task_c5(),
    # доказательная задача: ответ — образец текста, утверждения проверяются перебором в check_c6_claims
    "C6": None,
}



def main():
    bank = load_bank(sys.argv[1])
    extra = check_figures(bank) + check_c5_set() + check_c6_claims()
    for p in extra:
        print("FAIL", p)
    print(f"дополнительно: рисунки-графики {len(FIGURE_FRAMES)}, множество параметра C5, перебор C6 — замечаний {len(extra)}")
    sys.exit(report(bank, ETALON) or (1 if extra else 0))



if __name__ == "__main__":
    main()
