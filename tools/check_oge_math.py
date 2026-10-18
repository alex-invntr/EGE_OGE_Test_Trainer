# Проверка банка ОГЭ по математике: каждый ответ заново вычисляется кодом по данным условия
# (дроби, sympy, координаты, перебор), а не копируется из банка.
# Запуск из корня проекта: python -I tools/check_oge_math.py banks/oge_math.js

import itertools
import math
import os
import random
import re
import sys
from fractions import Fraction

import sympy as sp
from sympy.parsing.sympy_parser import (implicit_multiplication_application, parse_expr,
                                        standard_transformations)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import load_bank, report  # noqa: E402

X = sp.Symbol("x", real=True)
EPS = 1e-9
RANDOM_SEED = 2027
RANDOM_TRIALS = 2000
SAMPLES_PER_AXIS = 21
TRANSFORMS = standard_transformations + (implicit_multiplication_application,)

# План участка (P1, P2): постройки в клетках (x1, y1, x2, y2), ось y направлена вниз, как на рисунке
PLAN_W, PLAN_H = 15, 10
PLAN_BUILDINGS = {1: (12, 1, 14, 7), 2: (5, 1, 10, 5), 3: (1, 1, 3, 3), 4: (1, 6, 4, 9), 5: (8, 7, 11, 10)}
PLAN_GATE = (5, 7)
GREENHOUSE_RATIO = 3

# Шина 215/60 R16 (P3)
TIRE_WIDTH_MM, TIRE_PROFILE_PCT, DISK_INCH, MM_PER_INCH = 215, 60, 16, Fraction(254, 10)

# Такси (P4)
TRIP_KM = 18
ALPHA_START, ALPHA_PER_KM = 150, 22
BETA_BASE, BETA_BASE_KM, BETA_PER_KM = 300, 5, 18

# Показания счётчика 1 января … 1 апреля и цена (P5)
METER = [12480, 12735, 12962, 13170]
PRICE_KWH = Fraction(640, 100)

# Лодка (P6)
BOAT_DIST, BOAT_EXTRA_H, RIVER_SPEED = 56, 3, 3

# Координатная прямая (N2, N3): промежутки, в которых по рисунку лежат точки
N2_A_RANGE, N2_B_RANGE = (-2, -1), (2, 3)
N3_POINT_RANGE = (6, 7)

# Неравенство A4: что изображено на рисунках 1–4
A4_PICTURES = {
    1: sp.Interval(-5, 4),
    2: sp.Interval(-4, 5),
    3: sp.Union(sp.Interval(-sp.oo, -4), sp.Interval(5, sp.oo)),
    4: sp.Union(sp.Interval(-sp.oo, -5), sp.Interval(4, sp.oo)),
}

# Прямоугольный треугольник T1: гипотенуза AB и cos B
T1_AB, T1_COS_B = 45, 0.4

# Равнобедренная трапеция T3: основания и боковая сторона
T3_BIG, T3_SMALL, T3_SIDE = 22, 6, 17

# Трапеция T6: площади треугольников BOC и AOB
T6_S_BOC, T6_S_AOB = 8, 12

# Касательная C2: радиус и расстояние AO
C2_R, C2_AO = 12, 37

# C7: случайные проверки утверждения «PK = PM ⇒ KM ∥ LN» для хорд KL и MN
C7_TRIALS = 2000
C7_MIN_GAP = 1e-3
C7_TOL = 1e-9

# Точки, через которые проходят графики на рисунках F1 и F2 (узлы сетки)
F1_GRAPH_POINTS = {
    "А": [(-3, 1), (-1, 3), (1, -3), (3, -1)],
    "Б": [(0, 3), (1, 0), (2, -1), (3, 0), (4, 3)],
    "В": [(-1, -3), (0, -1), (1, 1), (2, 3)],
}
F2_LINE_POINTS = {
    "А": [(0, -2), (2, 0)],
    "Б": [(0, 3), (1, 1)],
    "В": [(0, -1), (2, -2)],
}

# Клетчатая бумага (C3, C4): вершины в клетках
GRID_TRAP = [(1, 1), (9, 1), (6, 5), (3, 5)]
GRID_TRI = {"A": (1, 1), "B": (3, 5), "C": (9, 1)}



# Единственный элемент списка, иначе ошибка (условие должно давать ровно один ответ)
def unique(items, what):
    if len(items) != 1:
        raise ValueError(f"{what}: ожидался один вариант, получено {items}")
    return items[0]



# Перевод записи из банка («x² − 4x + 3», «a·b») в выражение sympy
def to_sympy(s, names):
    s = s.replace("−", "-").replace("·", "*").replace("²", "**2").replace("³", "**3")
    s = re.sub(r"√(\d+)", r"sqrt(\1)", s)
    return parse_expr(s, local_dict=names, transformations=TRANSFORMS)



# Разбор промежутка вида «(−4; 3]» или «(−∞; −4) ∪ [3; +∞)» в множество sympy
def parse_interval_set(s):
    result = sp.EmptySet
    for part in s.replace("−", "-").split("∪"):
        part = part.strip()
        lo, hi = part[1:-1].split(";")
        lo = -sp.oo if "∞" in lo else sp.Rational(lo.strip())
        hi = sp.oo if "∞" in hi else sp.Rational(hi.strip())
        result = sp.Union(result, sp.Interval(lo, hi, part[0] == "(", part[-1] == ")"))
    return result



# Площадь многоугольника по формуле шнурования
def shoelace(pts):
    s = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        s += x1 * y2 - x2 * y1
    return abs(s) / 2



# Угол pvq в градусах
def angle_deg(v, p, q):
    ax, ay = p[0] - v[0], p[1] - v[1]
    bx, by = q[0] - v[0], q[1] - v[1]
    return math.degrees(math.atan2(abs(ax * by - ay * bx), ax * bx + ay * by))



# Точка пересечения прямых p1p2 и p3p4
def intersect(p1, p2, p3, p4):
    d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0])
    t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d
    return p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])



def dist(p, q):
    return math.hypot(p[0] - q[0], p[1] - q[1])



# Расстояние от точки до прямоугольника (0, если внутри)
def dist_point_rect(px, py, r):
    dx = max(r[0] - px, 0, px - r[2])
    dy = max(r[1] - py, 0, py - r[3])
    return math.hypot(dx, dy)



# P1–P6: практические и текстовые задачи
def solve_prac():
    area = {n: (r[2] - r[0]) * (r[3] - r[1]) for n, r in PLAN_BUILDINGS.items()}
    house = unique([n for n in area if area[n] == max(area.values())], "дом")
    garage = unique([n for n, r in PLAN_BUILDINGS.items() if r[3] == PLAN_H and r[0] >= PLAN_GATE[1]], "гараж")
    greenhouse = unique([n for n, r in PLAN_BUILDINGS.items()
                         if max(r[2] - r[0], r[3] - r[1]) == GREENHOUSE_RATIO * min(r[2] - r[0], r[3] - r[1])], "теплица")
    corner = {n: dist_point_rect(0, PLAN_H, r) for n, r in PLAN_BUILDINGS.items()}
    bath = unique([n for n in corner if corner[n] == min(corner.values())], "баня")
    p2 = Fraction(sum(area.values()), PLAN_W * PLAN_H) * 100
    p3 = DISK_INCH * MM_PER_INCH + 2 * Fraction(TIRE_PROFILE_PCT, 100) * TIRE_WIDTH_MM
    alpha = ALPHA_START + ALPHA_PER_KM * TRIP_KM
    beta = BETA_BASE + BETA_PER_KM * max(0, TRIP_KM - BETA_BASE_KM)
    p5 = (METER[-1] - METER[0]) * PRICE_KWH
    v = sp.Symbol("v", positive=True)
    eq = sp.Eq(BOAT_DIST / (v - RIVER_SPEED) - BOAT_DIST / (v + RIVER_SPEED), BOAT_EXTRA_H)
    p6 = unique([s for s in sp.solve(eq, v) if s > RIVER_SPEED], "скорость лодки")
    return {
        "P1": f"{house}{garage}{greenhouse}{bath}",
        "P2": float(p2),
        "P3": float(p3),
        "P4": min(alpha, beta),
        "P5": float(p5),
        "P6": float(p6),
    }



# Номер единственного варианта choice, истинного для всех точек выборки
def true_option(options, predicate):
    good = [i + 1 for i, o in enumerate(options) if predicate(o)]
    return str(unique(good, "вариант"))



# Внутренние точки промежутка (lo, hi) с равным шагом
def inner_points(rng):
    return [rng[0] + (rng[1] - rng[0]) * Fraction(k + 1, SAMPLES_PER_AXIS + 1) for k in range(SAMPLES_PER_AXIS)]



# N2: утверждение о числах a и b верно при всех a, b из промежутков, где они отмечены на прямой
def n2_always(option):
    a, b = sp.symbols("a b", real=True)
    rel = to_sympy(option, {"a": a, "b": b})
    return all(bool(rel.subs({a: sp.Rational(va), b: sp.Rational(vb)}))
               for va in inner_points(N2_A_RANGE) for vb in inner_points(N2_B_RANGE))



# N1–N5: числа и вычисления
def solve_num(tasks):
    n2 = true_option(tasks["N2"]["options"], n2_always)
    n3 = true_option(tasks["N3"]["options"],
                     lambda o: N3_POINT_RANGE[0] < float(to_sympy(o, {})) < N3_POINT_RANGE[1])
    c = Fraction(-2)
    return {
        "N1": float((Fraction(2, 5) + Fraction(7, 4)) * Fraction(16, 10)),
        "N2": n2,
        "N3": n3,
        "N4": float((c ** 3) ** 5 * c ** -4 / c ** 8),
        "N5": float(unique(sp.solve(sp.Eq(5 * sp.Symbol("t", positive=True) ** 2, sp.Rational(245, 4))), "время падения")),
    }



# A1–A6: выражения, уравнения, неравенства
def solve_alg(tasks):
    a1 = ((2 * X - 3) ** 2 - 4 * X * (X - 5)).subs(X, sp.Rational(-1, 4))
    a2 = min(sp.solve(2 * X ** 2 - 7 * X - 15, X))
    sys_set = sp.Intersection(sp.solveset(2 * X + 7 > 1, X, sp.S.Reals), sp.solveset(12 - 3 * X >= 0, X, sp.S.Reals))
    a3 = true_option(tasks["A3"]["options"], lambda o: parse_interval_set(o) == sys_set)
    ineq_set = sp.solveset(X ** 2 - X - 20 <= 0, X, sp.S.Reals)
    a4 = true_option(tasks["A4"]["options"], lambda o: A4_PICTURES[int(o.split()[-1])] == ineq_set)
    a5 = sum(sp.solveset(X ** 3 + 5 * X ** 2 - 16 * X - 80, X, sp.S.Reals))
    # A6: множество корней — кратный корень −1 учитывается один раз
    a6 = sum(sp.solveset((X ** 2 + 2 * X) ** 2 - 7 * (X ** 2 + 2 * X) - 8, X, sp.S.Reals))
    return {"A1": float(a1), "A2": float(a2), "A3": a3, "A4": a4, "A5": float(a5), "A6": float(a6)}



# Число корней уравнения x² − 6|x| + 5 = m (отдельно на x ≥ 0 и x < 0)
def count_f5_roots(m):
    right = [r for r in sp.solveset(X ** 2 - 6 * X + 5 - m, X, sp.S.Reals) if r >= 0]
    left = [r for r in sp.solveset(X ** 2 + 6 * X + 5 - m, X, sp.S.Reals) if r < 0]
    return len(set(right) | set(left))



# Номера формул, которым удовлетворяют все точки графика
def formulas_through(points, formulas):
    good = []
    for i, f in enumerate(formulas):
        expr = to_sympy(f.split(")", 1)[1].split("=", 1)[1], {"x": X})
        values = [expr.subs(X, px) for px, _ in points]
        if all(v.is_finite and abs(float(v) - py) < EPS for v, (_, py) in zip(values, points)):
            good.append(i + 1)
    return good



# F1–F5: функции и графики
def solve_func(tasks):
    right = tasks["F1"]["options"]["right"]
    f1 = "".join(str(unique(formulas_through(F1_GRAPH_POINTS[g], right), "график " + g)) for g in "АБВ")
    signs = []
    for g in "АБВ":
        (x1, y1), (x2, y2) = F2_LINE_POINTS[g]
        k = Fraction(y2 - y1, x2 - x1)
        b = y1 - k * x1
        want = ("k > 0" if k > 0 else "k < 0", "b > 0" if b > 0 else "b < 0")
        signs.append(str(unique([i + 1 for i, o in enumerate(tasks["F2"]["options"]["right"])
                                 if all(w in o for w in want)], "знаки " + g)))
    y = sp.Symbol("y", real=True)
    sol = sp.solve([sp.Eq(y, 4 * X - 9), sp.Eq(y, -3 * X + 5)], [X, y], dict=True)[0]
    bb = sp.Symbol("b")
    b_val = unique(sp.solve(sp.Eq(-1, 2 ** 2 + bb * 2 + 7), bb), "коэффициент b")
    parabola = X ** 2 + b_val * X + 7
    x0 = unique(sp.solve(sp.diff(parabola, X), X), "вершина")
    steps = [sp.Rational(k, 4) for k in range(-40, 41)]
    f5 = unique([m for m in steps if count_f5_roots(m) == 3], "значение m")
    return {"F1": f1, "F2": "".join(signs), "F3": float(sol[X] + sol[y]),
            "F4": float(parabola.subs(X, x0)), "F5": float(f5)}



# S1–S5: прогрессии и вероятность
def solve_seq():
    s3 = -32
    while s3 <= 0:
        s3 += 5
    throws = list(itertools.product("ОР", repeat=3))
    return {
        "S1": sum(22 + 2 * k for k in range(15)),
        "S2": float(Fraction(240) * Fraction(1, 2) ** 5),
        "S3": s3,
        "S4": float(Fraction(40 - 14 - 18, 40)),
        "S5": float(Fraction(sum(1 for t in throws if "ОО" not in "".join(t)), len(throws))),
    }



# T1–T6: треугольники и четырёхугольники (через координаты)
def solve_tri():
    # B в начале координат, C на оси x, A — на луче под углом B на расстоянии AB
    beta = math.acos(T1_COS_B)
    t1_a = (T1_AB * math.cos(beta), T1_AB * math.sin(beta))
    t1 = dist((0, 0), (t1_a[0], 0))
    b, c = (0, 0), (1, 0)
    a = intersect(b, (math.cos(math.radians(64)), math.sin(math.radians(64))),
                  c, (1 - math.cos(math.radians(38)), math.sin(math.radians(38))))
    ua = ((b[0] - a[0]) / dist(a, b), (b[1] - a[1]) / dist(a, b))
    uc = ((c[0] - a[0]) / dist(a, c), (c[1] - a[1]) / dist(a, c))
    d = intersect(a, (a[0] + ua[0] + uc[0], a[1] + ua[1] + uc[1]), b, c)
    t2 = angle_deg(d, a, b)
    h = sp.Symbol("h", positive=True)
    shift = Fraction(T3_BIG - T3_SMALL, 2)
    t3_h = float(unique(sp.solve(sp.Eq(sp.sqrt(shift ** 2 + h ** 2), T3_SIDE), h), "высота трапеции"))
    t3_pts = [(0, 0), (T3_BIG, 0), (float(shift) + T3_SMALL, t3_h), (float(shift), t3_h)]
    if abs(dist(t3_pts[0], t3_pts[3]) - T3_SIDE) > EPS or abs(dist(t3_pts[1], t3_pts[2]) - T3_SIDE) > EPS:
        raise ValueError("T3: боковые стороны построенной трапеции не равны условию")
    t3 = shoelace(t3_pts)
    t4_y = float(unique(sp.solve(sp.Eq(sp.sqrt(15 ** 2 + h ** 2), 17), h), "полудиагональ"))
    t4 = shoelace([(-15, 0), (0, t4_y), (15, 0), (0, -t4_y)])
    pa, pb, pc = (-9, 0), (0, 12), (9, 0)
    la, lb, lc = dist(pb, pc), dist(pa, pc), dist(pa, pb)
    inc = ((la * pa[0] + lb * pb[0] + lc * pc[0]) / (la + lb + lc), (la * pa[1] + lb * pb[1] + lc * pc[1]) / (la + lb + lc))
    t5 = inc[1]
    return {"T1": t1, "T2": t2, "T3": t3, "T4": t4, "T5": t5, "T6": solve_t6()}



# T6: трапеция с основаниями AD = 10 и BC = b, высота h; подбираем b и h по площадям BOC и AOB
def solve_t6():
    bc, h = sp.symbols("bc h", positive=True)
    ad, shift = 10, 2
    pa, pd, pb, pc = (0, 0), (ad, 0), (shift, h), (shift + bc, h)
    o = intersect(pa, pc, pb, pd)
    s_boc = sp.simplify(shoelace([pb, o, pc]))
    s_aob = sp.simplify(shoelace([pa, o, pb]))
    sol = sp.solve([sp.Eq(s_boc, T6_S_BOC), sp.Eq(s_aob, T6_S_AOB)], [bc, h], dict=True)
    sol = unique([s for s in sol if s[bc] > 0 and s[h] > 0], "трапеция")
    return float(shoelace([pa, pb, pc, pd]).subs(sol))



# Утверждение «для всех случайных примеров верно»: True, если контрпримеров нет
def holds(check, make):
    rnd = random.Random(RANDOM_SEED)
    return all(check(make(rnd)) for _ in range(RANDOM_TRIALS))



def random_triangle(rnd):
    return [(rnd.uniform(-10, 10), rnd.uniform(-10, 10)) for _ in range(3)]



def triangle_angles(t):
    return [angle_deg(t[i], t[(i + 1) % 3], t[(i + 2) % 3]) for i in range(3)]



def circumcenter(t):
    (ax, ay), (bx, by), (cx, cy) = t
    d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    ux = ((ax ** 2 + ay ** 2) * (by - cy) + (bx ** 2 + by ** 2) * (cy - ay) + (cx ** 2 + cy ** 2) * (ay - by)) / d
    uy = ((ax ** 2 + ay ** 2) * (cx - bx) + (bx ** 2 + by ** 2) * (ax - cx) + (cx ** 2 + cy ** 2) * (bx - ax)) / d
    return ux, uy



def incenter(t):
    a, b, c = dist(t[1], t[2]), dist(t[0], t[2]), dist(t[0], t[1])
    s = a + b + c
    return (a * t[0][0] + b * t[1][0] + c * t[2][0]) / s, (a * t[0][1] + b * t[1][1] + c * t[2][1]) / s



# Случайный ромб ABCD
def random_rhombus(rnd):
    s, al = rnd.uniform(1, 10), rnd.uniform(0.2, 2.9)
    return (0, 0), (s, 0), (s + s * math.cos(al), s * math.sin(al)), (s * math.cos(al), s * math.sin(al))



# Случайный выпуклый четырёхугольник (вершины на окружности по порядку)
def random_convex_quad(rnd):
    phis = sorted(rnd.uniform(0, 2 * math.pi) for _ in range(4))
    return [(math.cos(p), math.sin(p)) for p in phis]



# Случайный тупоугольный треугольник
def random_obtuse_triangle(rnd):
    while True:
        t = random_triangle(rnd)
        if max(triangle_angles(t)) > 90 + EPS:
            return t



# Случайная точка окружности и концы диаметра (−1; 0), (1; 0)
def random_on_diameter(rnd):
    phi = rnd.uniform(0.01, math.pi - 0.01) * rnd.choice([1, -1])
    return (-1, 0), (math.cos(phi), math.sin(phi)), (1, 0)



# Углы (в градусах) между радиусом и прямой через его конец, при которых прямая касается окружности
def touching_angles(rnd):
    r = rnd.uniform(1, 10)
    return [phi for phi in range(1, 180) if abs(r * math.sin(math.radians(phi)) - r) < 1e-9]



# C5: проверка утверждений о ромбе, четырёхугольнике и тупоугольном треугольнике на случайных фигурах
def check_c5():
    s1 = holds(lambda q: abs((q[2][0] - q[0][0]) * (q[3][0] - q[1][0]) + (q[2][1] - q[0][1]) * (q[3][1] - q[1][1])) < 1e-6, random_rhombus)
    s2 = holds(lambda q: abs(sum(angle_deg(q[i], q[i - 1], q[(i + 1) % 4]) for i in range(4)) - 180) < 1e-6, random_convex_quad)
    s3 = holds(lambda t: sorted(triangle_angles(t))[1] < 90, random_obtuse_triangle)
    return "".join(str(i + 1) for i, ok in enumerate([s1, s2, s3]) if ok)



# C6: центр описанной окружности, угол на диаметр, касательная
def check_c6():
    s1 = holds(lambda t: dist(circumcenter(t), incenter(t)) < 1e-6, random_triangle)
    s2 = holds(lambda p: abs(angle_deg(p[1], p[0], p[2]) - 90) < 1e-6, random_on_diameter)
    s3 = holds(lambda phis: phis == [90], touching_angles)
    return "".join(str(i + 1) for i, ok in enumerate([s1, s2, s3]) if ok)



# C1–C7: окружность, клетчатая бумага, утверждения
def solve_circ():
    c = (1, 0)
    d = (-math.cos(math.radians(28)), math.sin(math.radians(28)))
    t = -2 * (c[0] * d[0] + c[1] * d[1])
    b = (c[0] + t * d[0], c[1] + t * d[1])
    c1 = angle_deg(b, (-1, 0), (0, 0))
    # O в начале координат, A = (AO; 0); точка касания B лежит на окружности, и OB ⊥ AB
    bx = Fraction(C2_R ** 2, C2_AO)
    tangent_b = (float(bx), math.sqrt(C2_R ** 2 - float(bx) ** 2))
    ob_ab = tangent_b[0] * (tangent_b[0] - C2_AO) + tangent_b[1] ** 2
    if abs(ob_ab) > 1e-6:
        raise ValueError("C2: точка B не является точкой касания")
    c2 = dist(tangent_b, (C2_AO, 0))
    ga, gb, gc = GRID_TRI["A"], GRID_TRI["B"], GRID_TRI["C"]
    c4 = math.tan(math.radians(angle_deg(ga, gb, gc)))
    return {"C1": c1, "C2": c2, "C3": shoelace(GRID_TRAP), "C4": c4,
            "C5": check_c5(), "C6": check_c6(), "C7": None}



# Вторая точка пересечения прямой, проходящей через точку p окружности x² + y² = 1, с этой окружностью
def second_on_circle(p, through):
    dx, dy = through[0] - p[0], through[1] - p[1]
    s = -2 * (p[0] * dx + p[1] * dy) / (dx * dx + dy * dy)
    return p[0] + s * dx, p[1] + s * dy



# C7 (kind "text"): случайная точка P внутри единичной окружности, хорда KL через P, M на окружности с PM = PK
# (M — отражение K относительно прямой OP), хорда MN через P; проверяем KM ∥ LN
def check_c7():
    rnd = random.Random(RANDOM_SEED)
    bad = 0
    for _ in range(C7_TRIALS):
        rho, phi = rnd.uniform(0.05, 0.9), rnd.uniform(0, 2 * math.pi)
        p = (rho * math.cos(phi), rho * math.sin(phi))
        alpha = rnd.uniform(0, 2 * math.pi)
        k = (math.cos(alpha), math.sin(alpha))
        u = (math.cos(phi), math.sin(phi))
        proj = k[0] * u[0] + k[1] * u[1]
        m = (2 * proj * u[0] - k[0], 2 * proj * u[1] - k[1])
        if dist(k, m) < C7_MIN_GAP:
            continue
        if abs(dist(p, k) - dist(p, m)) > C7_TOL:
            bad += 1
            continue
        l, n = second_on_circle(k, p), second_on_circle(m, p)
        cross = (m[0] - k[0]) * (n[1] - l[1]) - (m[1] - k[1]) * (n[0] - l[0])
        if abs(cross) > 1e-7 * dist(k, m) * dist(l, n) + C7_TOL:
            bad += 1
    return [f"C7: утверждение KM ∥ LN нарушено в {bad} случайных конфигурациях"] if bad else []



def main():
    bank = load_bank(sys.argv[1])
    tasks = {t["id"]: t for t in bank["tasks"]}
    etalon = {}
    etalon.update(solve_prac())
    etalon.update(solve_num(tasks))
    etalon.update(solve_alg(tasks))
    etalon.update(solve_func(tasks))
    etalon.update(solve_seq())
    etalon.update(solve_tri())
    etalon.update(solve_circ())
    extra = check_c7()
    for p in extra:
        print("FAIL", p)
    print(f"дополнительно: утверждение C7 на {C7_TRIALS} случайных конфигурациях — замечаний {len(extra)}")
    sys.exit(report(bank, etalon) or (1 if extra else 0))



if __name__ == "__main__":
    main()
