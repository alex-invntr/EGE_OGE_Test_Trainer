# Независимая проверка банка задач ЕГЭ по физике (banks/ege_physics.js).
# Каждый ответ вычисляется заново по данным условия и, где возможно, другим путём, чем в разборе:
# направления сил — векторным произведением, утверждения в заданиях с выбором — расчётом истинности каждого,
# «изменение величин» — знаком разности при двух значениях параметра, графики и шкала прибора — по координатам рисунка,
# таблицы — из поля code задачи. Качественная задача (kind "text") не пересчитывается — эталон None.
# Запуск из корня проекта: python -I tools/check_ege_physics.py banks/ege_physics.js

import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import load_bank, report  # noqa: E402

# Константы, которые даны в условиях задач
G = 10                      # ускорение свободного падения, м/с²
R_GAS = 8.31                # универсальная газовая постоянная, Дж/(моль·К)
K_B = 1.38e-23              # постоянная Больцмана, Дж/К
N_A = R_GAS / K_B           # постоянная Авогадро, согласованная с R и k, 1/моль
ZERO_CELSIUS = 273          # 0 °С в кельвинах
H_PLANCK = 6.6e-34          # постоянная Планка, Дж·с
C_LIGHT = 3e8               # скорость света в вакууме, м/с
E_CHARGE = 1.6e-19          # элементарный заряд, Кл; он же 1 эВ в джоулях
PI2_GIVEN = 10              # π² = 10, как разрешено в условии V1

# Справочные величины для модельных расчётов (на ответ не влияют, нужны только как «какие-то» значения)
EPS0 = 8.85e-12             # электрическая постоянная, Ф/м
G_GRAV = 6.67e-11           # гравитационная постоянная, Н·м²/кг²
M_EARTH = 6e24              # масса Земли, кг
M_PROTON = 1.67e-27         # масса протона, кг
M_HELIUM = 4e-3             # молярная масса гелия, кг/моль
M_WATER = 18e-3             # молярная масса воды, кг/моль

# Ответ «изменение величин»
INCREASE, DECREASE, SAME = "1", "2", "3"
REL_EPS = 1e-9

# Оси: x — вправо, y — вверх, z — к наблюдателю
DIRECTIONS = {
    (1, 0, 0): "вправо", (-1, 0, 0): "влево",
    (0, 1, 0): "вверх", (0, -1, 0): "вниз",
    (0, 0, 1): "к наблюдателю", (0, 0, -1): "от наблюдателя",
}

# Масштабы рисунков: начало координат в пикселях и пикселей на единицу величины
M1_ORIGIN = (50, 180)       # график vₓ(t): t = 0, v = 0
M1_PX_PER_S = 40
M1_PX_PER_MS = 15
T3_ORIGIN = (50, 190)       # график p(V): V = 0, p = 0
T3_PX_PER_L = 50
T3_PX_PER_KPA = 0.45
V2_GRAPHS = {"data-a": (30, 170, 110), "data-b": (240, 380, 75)}   # x при t = 0, x при t = T, y оси времени
V2_SAMPLES = 8              # сверка графиков в точках t = kT/8
V2_TOL = 0.02
X2_CENTER = (210, 160)      # ось стрелки амперметра
X2_ANGLE_ZERO = 150         # угол отметки 0 А, градусы
X2_DEG_PER_AMP = 40         # шкала 0…3 А на дуге 120°
X2_SCALE_MAX = 3
X2_DIVISIONS = 30



# Векторное произведение — вместо правил левой руки и буравчика
def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])



def dot(a, b):
    return sum(x * y for x, y in zip(a, b))



def scale(v, k):
    return tuple(c * k for c in v)



def add(*vs):
    return tuple(sum(c) for c in zip(*vs))



def norm(v):
    return math.sqrt(dot(v, v))



# Название направления вектора, лежащего вдоль одной из осей
def axis_name(v):
    n = norm(v)
    key = tuple(int(round(c / n)) + 0 for c in v)
    return DIRECTIONS[key]



# Характер изменения: 1 — выросла, 2 — уменьшилась, 3 — не изменилась
def change_code(before, after):
    if abs(after - before) <= REL_EPS * max(abs(before), abs(after)):
        return SAME
    return INCREASE if after > before else DECREASE



# Номера верных утверждений строкой: [False, True, False, True, False] → "24"
def true_numbers(flags):
    return "".join(str(i + 1) for i, f in enumerate(flags) if f)



# Номер позиции правого столбца, значение которой совпадает с вычисленным (должна быть ровно одна)
def match_index(value, candidates):
    hits = [i + 1 for i, c in enumerate(candidates) if math.isclose(value, c, rel_tol=1e-9)]
    if len(hits) != 1:
        raise ValueError(f"соответствие неоднозначно: {hits}")
    return str(hits[0])



# Числа из строк таблицы в поле code: запятая — десятичный знак, «−» — минус; строки без чисел пропускаются
def parse_table(code):
    rows = []
    for line in code.splitlines():
        nums = re.findall(r"[−-]?\d+(?:,\d+)?", line)
        if nums:
            rows.append([float(s.replace("−", "-").replace(",", ".")) for s in nums])
    return rows



# Точки ломаной или многоугольника с классом cls из SVG-рисунка задачи
def figure_points(svg, cls):
    m = re.search(r"class='%s' points='([^']+)'" % cls, svg)
    if not m:
        raise ValueError(f"на рисунке нет элемента class='{cls}'")
    return [tuple(float(c) for c in p.split(",")) for p in m.group(1).split()]



# Решение линейной системы методом Гаусса с выбором главного элемента
def solve_linear(mat, rhs):
    n = len(rhs)
    a = [row[:] + [rhs[i]] for i, row in enumerate(mat)]
    for col in range(n):
        piv = max(range(col, n), key=lambda r: abs(a[r][col]))
        a[col], a[piv] = a[piv], a[col]
        for r in range(n):
            if r != col:
                k = a[r][col] / a[col][col]
                a[r] = [x - k * y for x, y in zip(a[r], a[col])]
    return [a[i][n] / a[i][i] for i in range(n)]



# Метод узловых потенциалов: resistors — [(узел, узел, R)], fixed — {узел: потенциал}; конденсаторы в установившемся режиме — разрыв
def node_potentials(resistors, fixed):
    nodes = sorted({n for a, b, _ in resistors for n in (a, b)} - set(fixed))
    idx = {n: i for i, n in enumerate(nodes)}
    mat = [[0.0] * len(nodes) for _ in nodes]
    rhs = [0.0] * len(nodes)
    for a, b, r in resistors:
        g = 1 / r
        for p, q in ((a, b), (b, a)):
            if p not in idx:
                continue
            mat[idx[p]][idx[p]] += g
            if q in idx:
                mat[idx[p]][idx[q]] -= g
            else:
                rhs[idx[p]] += g * fixed[q]
    sol = solve_linear(mat, rhs)
    pot = dict(fixed)
    pot.update({n: sol[idx[n]] for n in nodes})
    return pot



# Точка пересечения прямых (p1, p2) и (p3, p4) на плоскости
def line_intersection(p1, p2, p3, p4):
    d1 = (p2[0] - p1[0], p2[1] - p1[1])
    d2 = (p4[0] - p3[0], p4[1] - p3[1])
    s = solve_linear([[d1[0], -d2[0]], [d1[1], -d2[1]]], [p3[0] - p1[0], p3[1] - p1[1]])[0]
    return (p1[0] + s * d1[0], p1[1] + s * d1[1])



# Изображение в тонкой собирающей линзе построением двух лучей: линза в x = 0, предмет высотой h в x = −d.
# Луч, параллельный оси, после линзы идёт через фокус (F, 0); луч через оптический центр не преломляется.
def lens_image(d, focus, h=1.0):
    top = (-d, h)
    return line_intersection((0, h), (focus, 0), top, (0, 0))



# Интеграл функции по формуле Симпсона (n — чётное число отрезков)
def simpson(f, a, b, n):
    step = (b - a) / n
    s = f(a) + f(b)
    for i in range(1, n):
        s += (4 if i % 2 else 2) * f(a + i * step)
    return s * step / 3



# M1: путь — площадь под графиком |vₓ(t)|; вершины ломаной берутся с рисунка
def m1_path(task):
    pts = [((x - M1_ORIGIN[0]) / M1_PX_PER_S, (M1_ORIGIN[1] - y) / M1_PX_PER_MS) for x, y in figure_points(task["figure"], "data")]
    assert pts[0][0] == 0 and pts[-1][0] == 7, "график должен идти от 0 до 7 с"
    path = 0.0
    for (t1, v1), (t2, v2) in zip(pts, pts[1:]):
        if v1 * v2 < 0:
            t0 = t1 + (t2 - t1) * v1 / (v1 - v2)
            path += abs(v1) * (t0 - t1) / 2 + abs(v2) * (t2 - t0) / 2
        else:
            path += abs(v1 + v2) / 2 * (t2 - t1)
    return path



# M2: сила упругости из второго закона Ньютона, удлинение — по закону Гука, в сантиметрах
def m2_stretch_cm():
    m, k, a, mu = 1.5, 250, 2, 0.2
    f_elastic = m * a + mu * m * G
    return f_elastic / k * 100



# M3: потеря энергии при абсолютно неупругом ударе через приведённую массу (другим путём, чем в разборе)
def m3_heat():
    m1, v1, m2 = 0.8, 4, 1.2
    reduced = m1 * m2 / (m1 + m2)
    return reduced * v1 ** 2 / 2



# M4: моменты относительно опоры A дают N_B, затем N_A = mg − N_B (в разборе — моменты относительно B)
def m4_support_a():
    m, length, from_right = 40, 5, 1
    x_b = length - from_right
    n_b = m * G * (length / 2) / x_b
    return m * G - n_b



# M5: по таблице x(t) — равноускоренное движение, истинность каждого утверждения
def m5_statements(task):
    ts, xs = parse_table(task["code"])
    mass = 0.4
    accels = {2 * x / t ** 2 for t, x in zip(ts, xs) if t > 0}
    assert len(accels) == 1, "движение по таблице не равноускоренное без начальной скорости"
    a = accels.pop()
    steps = [x2 - x1 for x1, x2 in zip(xs, xs[1:])]
    x_at = dict(zip(ts, xs))
    return true_numbers([
        len(set(steps)) == 1,
        math.isclose(a, 6),
        math.isclose(a * 2, 6),
        math.isclose(mass * a, 2.4),
        math.isclose(x_at[3] - x_at[2], 27),
    ])



# M6: скорость и период на круговой орбите при двух радиусах
def m6_orbit():
    def orbit(r):
        v = math.sqrt(G_GRAV * M_EARTH / r)
        return v, 2 * math.pi * r / v
    (v1, t1), (v2, t2) = orbit(7e6), orbit(8e6)
    return change_code(v1, v2) + change_code(t1, t2)



# M7: сумма сил векторно на плоскости (x — по горизонтали, y — вверх), ускорение — проекция на направление движения
def m7_incline():
    m, height, length, force, mu = 2.6, 2.5, 6.5, 29, 0.25
    sin_a = height / length
    cos_a = math.sqrt(1 - sin_a ** 2)
    up = (cos_a, sin_a, 0)                       # вдоль плоскости вверх
    normal = (-sin_a, cos_a, 0)                  # перпендикулярно плоскости, от неё
    gravity = (0, -m * G, 0)
    n_mag = -dot(gravity, normal)                # опора компенсирует нормальную составляющую силы тяжести
    friction = scale(up, -mu * n_mag)            # брусок едет вверх — трение вниз
    assert force > -dot(gravity, up) + mu * n_mag, "брусок не поедет вверх"
    total = add(scale(up, force), gravity, scale(normal, n_mag), friction)
    assert abs(dot(total, normal)) < 1e-9
    return dot(total, up) / m



# M8: кинематика бруска и тележки с силой трения (в разборе — законы сохранения)
def m8_relative_shift():
    m, big_m, height, mu = 0.3, 0.9, 0.45, 0.25
    v0 = math.sqrt(2 * G * height)
    a_block = mu * G                             # торможение бруска
    a_cart = mu * m * G / big_m                  # разгон тележки
    t = v0 / (a_block + a_cart)                  # скорости сравнялись
    s_block = v0 * t - a_block * t ** 2 / 2
    s_cart = a_cart * t ** 2 / 2
    return s_block - s_cart



# T1: средняя кинетическая энергия поступательного движения молекулы, в 10⁻²¹ Дж
def t1_energy():
    return 1.5 * K_B * (87 + ZERO_CELSIUS) / 1e-21



# T2: цикл Карно — Q₂/Q₁ = T₂/T₁, работа A = Q₁ − Q₂, кДж
def t2_carnot():
    t_hot, t_cold, q_hot = 327 + ZERO_CELSIUS, 57 + ZERO_CELSIUS, 6
    q_cold = q_hot * t_cold / t_hot
    return q_hot - q_cold



# T3: вершины цикла с рисунка (в порядке 1, 2, 3, 4), истинность утверждений
def t3_statements(task):
    raw = figure_points(task["figure"], "data")
    st = [((x - T3_ORIGIN[0]) / T3_PX_PER_L * 1e-3, (T3_ORIGIN[1] - y) / T3_PX_PER_KPA * 1e3) for x, y in raw]   # (V, м³; p, Па)

    def work(i, j):
        (v1, p1), (v2, p2) = st[i], st[j]
        return (p1 + p2) / 2 * (v2 - v1)

    def internal(i):
        return 1.5 * st[i][0] * st[i][1]         # U = (3/2)pV для одноатомного газа
    cycle = sum(work(i, (i + 1) % len(st)) for i in range(len(st)))
    q41 = internal(0) - internal(3) + work(3, 0)
    return true_numbers([
        work(0, 1) > 0,
        math.isclose(cycle, 300),
        internal(2) < internal(1),
        math.isclose(st[2][0] * st[2][1] / (st[0][0] * st[0][1]), 8),
        q41 > 0,
    ])



# Давление насыщенного водяного пара (формула Магнуса) — зависит только от температуры
def saturated_pressure(t_kelvin):
    t = t_kelvin - ZERO_CELSIUS
    return 610.94 * math.exp(17.625 * t / (t + 243.04))



# T4: пар над водой при изотермическом уменьшении объёма
def t4_vapor():
    temp = 293
    p1, p2 = saturated_pressure(temp), saturated_pressure(temp)     # вода остаётся — пар насыщенный
    m1 = p1 * 2e-3 * M_WATER / (R_GAS * temp)
    m2 = p2 * 1e-3 * M_WATER / (R_GAS * temp)
    return change_code(p1, p2) + change_code(m1, m2)



# T5: формулы слева сравниваются численно с определениями величин справа для произвольного состояния газа
def t5_match():
    nu, temp, vol = 2, 300, 0.01
    p = nu * R_GAS * temp / vol
    right = [1.5 * nu * R_GAS * temp, nu * N_A / vol, 1.5 * K_B * temp, nu * M_HELIUM]
    left = [1.5 * p * vol, p / (K_B * temp)]
    return "".join(match_index(v, right) for v in left)



# T6: давление из равновесия поршня, температуры из уравнения состояния, Q = ΔU + A
def t6_heat():
    m, area, p0, rise = 8, 40e-4, 1e5, 0.15
    p = p0 + m * G / area
    nu, h_start = 1, 0.2                         # произвольные: ответ от них не зависит
    v1, v2 = area * h_start, area * (h_start + rise)
    t1, t2 = p * v1 / (nu * R_GAS), p * v2 / (nu * R_GAS)
    return 1.5 * nu * R_GAS * (t2 - t1) + p * (v2 - v1)



# T7: смешение гелия — сохранение внутренней энергии, температура смеси, затем давление, кПа
def t7_pressure():
    v1, p1, t1 = 1.5e-3, 240e3, 280
    v2, p2, t2 = 4.5e-3, 80e3, 350
    nu1, nu2 = p1 * v1 / (R_GAS * t1), p2 * v2 / (R_GAS * t2)
    t_mix = (nu1 * t1 + nu2 * t2) / (nu1 + nu2)
    return (nu1 + nu2) * R_GAS * t_mix / (v1 + v2) / 1e3



# E1: потенциалы узлов цепи, мощность в R₂
def e1_power():
    pot = node_potentials([("A", "B", 2), ("B", "C", 6), ("B", "C", 3)], {"A": 12, "C": 0})
    return (pot["B"] - pot["C"]) ** 2 / 6



# E2: закон Фарадея и закон Ома
def e2_current():
    phi1, phi2, dt, r = 15e-3, 3e-3, 0.04, 0.2
    return abs(phi2 - phi1) / dt / r



# E3: протон в поле «к нам», скорость вправо — сила, направление обращения, работа, зависимость R и T
def e3_statements():
    q, m = E_CHARGE, M_PROTON
    v = (1e6, 0, 0)
    b = (0, 0, 0.1)
    force = scale(cross(v, b), q)
    radius = m * norm(v) / (q * norm(b))
    center = scale(force, radius / norm(force))  # протон в начале координат, центр — по направлению силы
    spin = cross(scale(center, -1), v)[2]        # момент относительно центра: < 0 — по часовой стрелке (смотрим с +z)

    def period(speed, induction):
        r = m * speed / (q * induction)
        return 2 * math.pi * r / speed

    def rad(speed, induction):
        return m * speed / (q * induction)
    return true_numbers([
        axis_name(force) == "вниз",
        spin < 0,
        dot(force, v) > 0,
        math.isclose(period(2e6, 0.1) / period(1e6, 0.1), 2),
        math.isclose(rad(1e6, 0.2) / rad(1e6, 0.1), 2),
    ])



# E4: отключённый конденсатор — заряд постоянен; ёмкость и напряжённость при двух расстояниях
def e4_capacitor():
    area, charge = 0.01, 1e-9

    def state(d):
        c = EPS0 * area / d
        return c, charge / c / d
    (c1, e1), (c2, e2) = state(1e-3), state(2e-3)
    return change_code(c1, c2) + change_code(e1, e2)



# E5: сила Ампера F ~ L × B: ток от наблюдателя, поле от N к S — вправо
def e5_direction():
    return axis_name(cross((0, 0, -1), (1, 0, 0)))



# E7: разгон стержня численно (метод Эйлера) до установившейся скорости
def e7_speed():
    m, length, r, b, f = 0.03, 0.4, 1.5, 0.5, 0.06
    v, dt, t_end = 0.0, 1e-4, 30.0
    for _ in range(int(t_end / dt)):
        current = b * length * v / r
        v += (f - current * b * length) / m * dt
    return v



# E8: напряжение на конденсаторе из потенциалов узлов, затем теплота в R₂ интегралом i²R по разряду, мкДж
def e8_heat():
    emf, r, r1, r2, cap = 9, 0.5, 2.5, 3, 20e-6
    pot = node_potentials([("S", "P", r), ("P", "T", r1), ("T", "N", r2)], {"S": emf, "N": 0})
    u = pot["T"]
    tau = r2 * cap
    heat = simpson(lambda t: (u / r2 * math.exp(-t / tau)) ** 2 * r2, 0, 40 * tau, 4000)
    return heat * 1e6



# V1: длина нити из периода, π² = 10 по условию
def v1_length():
    period = 40 / 25
    return G * period ** 2 / (4 * PI2_GIVEN)



# V2: графики с рисунка сравниваются с формулами величин при x = A·cos(2πt/T)
def v2_match(task):
    quantities = [
        lambda u: math.cos(2 * math.pi * u),
        lambda u: -math.sin(2 * math.pi * u),
        lambda u: math.sin(2 * math.pi * u) ** 2,
        lambda u: math.cos(2 * math.pi * u) ** 2,
    ]
    answer = ""
    for cls in ("data-a", "data-b"):
        x0, x1, axis_y = V2_GRAPHS[cls]
        pts = figure_points(task["figure"], cls)
        samples = []
        for k in range(V2_SAMPLES + 1):
            x = x0 + (x1 - x0) * k / V2_SAMPLES
            px, py = min(pts, key=lambda p: abs(p[0] - x))
            samples.append(axis_y - py)
        peak = max(abs(s) for s in samples)
        graph = [s / peak for s in samples]
        hits = []
        for i, f in enumerate(quantities):
            vals = [f(k / V2_SAMPLES) for k in range(V2_SAMPLES + 1)]
            top = max(abs(v) for v in vals)
            if all(abs(g - v / top) <= V2_TOL for g, v in zip(graph, vals)):
                hits.append(i + 1)
        assert len(hits) == 1, f"{cls}: подходят величины {hits}"
        answer += str(hits[0])
    return answer



# V3: период из закона сохранения энергии контура при произвольной ёмкости, мс
def v3_period():
    q_max, i_max, cap = 4e-6, 20e-3, 1e-6
    induct = q_max ** 2 / (cap * i_max ** 2)
    return 2 * math.pi * math.sqrt(induct * cap) * 1e3



# V4: таблица q(t) — период, ток, частота энергии, напряжение
def v4_statements(task):
    ts, qs = parse_table(task["code"])
    cap = 2e-9
    period = next(t for t, q in zip(ts[1:], qs[1:]) if q == qs[0])                     # мкс
    period_energy = next(t for t, q in zip(ts[1:], qs[1:]) if q ** 2 == qs[0] ** 2)    # мкс
    q_max = max(abs(q) for q in qs)
    current = {t: math.sqrt(max(q_max ** 2 - q ** 2, 0)) for t, q in zip(ts, qs)}     # ∝ |I| из сохранения энергии
    return true_numbers([
        period == 8,
        current[4] == max(current.values()),
        math.isclose(1 / (period_energy * 1e-6), 62.5e3),
        math.isclose(q_max * 1e-9 / cap, 3),
        current[8] == max(current.values()),
    ])



# O1: изображение построением лучей, см
def o1_image():
    focus, d = 1 / 2.5, 0.6
    return lens_image(d, focus)[0] * 100



# O2: предельный угол полного отражения, градусы
def o2_angle():
    return math.degrees(math.asin(1 / 1.45))



# O3: наибольший целый порядок, при котором sin φ < 1
def o3_order():
    period, wave = 1e-3 / 400, 520e-9
    k = 0
    while (k + 1) * wave / period < 1:
        k += 1
    return k



# O4: расстояние до изображения и увеличение построением лучей при d = 3F и d = 1,5F
def o4_lens():
    focus = 1.0
    (f1, y1), (f2, y2) = lens_image(3 * focus, focus), lens_image(1.5 * focus, focus)
    return change_code(f1, f2) + change_code(abs(y1), abs(y2))



# Q1: перебор числа α- и β⁻-распадов
def q1_beta():
    a0, z0, a1, z1 = 232, 90, 212, 83
    found = [(na, nb) for na in range(10) for nb in range(10) if a0 - 4 * na == a1 and z0 - 2 * na + nb == z1]
    assert len(found) == 1
    return found[0][1]



# Q2: распалось ядер за 32 мин при T = 8 мин, в 10²⁰
def q2_decayed():
    n0, half, t = 6.4e20, 8, 32
    return n0 * (1 - 0.5 ** (t / half)) / 1e20



# Работа выхода — свойство металла, от света не зависит
def work_function(metal, frequency):
    return {"пластинка": 2.25 * E_CHARGE}[metal]



# Q3: максимальная кинетическая энергия и работа выхода при двух частотах
def q3_photo():
    nu1, nu2 = 8e14, 1e15
    ek1 = H_PLANCK * nu1 - work_function("пластинка", nu1)
    ek2 = H_PLANCK * nu2 - work_function("пластинка", nu2)
    assert ek1 > 0
    return change_code(ek1, ek2) + change_code(work_function("пластинка", nu1), work_function("пластинка", nu2))



# Q4: запирающее напряжение, В
def q4_voltage():
    wave, work_ev = 275e-9, 2.4
    return (H_PLANCK * C_LIGHT / wave - work_ev * E_CHARGE) / E_CHARGE



# Q5: частица X по сохранению массового числа и заряда
def q5_match():
    particles = {(1, 0): "1", (1, 1): "2", (0, -1): "3", (4, 2): "4"}
    reactions = [((7, 3), (1, 1), (4, 2)), ((6, 3), (2, 1), (7, 3))]
    out = ""
    for (a1, z1), (a2, z2), (a3, z3) in reactions:
        out += particles[(a1 + a2 - a3, z1 + z2 - z3)]
    return out



# X1: истинность утверждений расчётом
def x1_statements():
    mu, normal = 0.3, 10
    friction = {area: mu * normal for area in (0.01, 0.04)}       # F = μN — площадь не входит
    nu, temp = 1, 300
    u_before, u_after = 1.5 * nu * R_GAS * temp, 1.5 * nu * R_GAS * temp   # изотермический процесс
    # Циркуляция поля точечного заряда по окружности, не охватывающей заряд и охватывающей его: всегда 0 —
    # поле потенциальное, а вдоль замкнутой линии поля циркуляция была бы положительной
    circulations = []
    for cx in (0.0, 2.0):
        steps, total = 4000, 0.0
        for i in range(steps):
            a1, a2 = 2 * math.pi * i / steps, 2 * math.pi * (i + 1) / steps
            p1 = (cx + math.cos(a1), math.sin(a1))
            p2 = (cx + math.cos(a2), math.sin(a2))
            mid = ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
            r3 = (mid[0] ** 2 + mid[1] ** 2) ** 1.5
            total += mid[0] / r3 * (p2[0] - p1[0]) + mid[1] / r3 * (p2[1] - p1[1])
        circulations.append(abs(total))
    a_before, a_after = 14, 14                    # β⁻: нейтрон → протон, A не меняется
    return true_numbers([
        friction[0.01] == friction[0.04],
        change_code(u_before, u_after) == INCREASE,
        max(circulations) > 1e-6,
        C_LIGHT / 1.5 < C_LIGHT,
        a_before - a_after == 1,
    ])



# X2: показание амперметра по углу стрелки на рисунке, погрешность — цена деления
def x2_reading(task):
    svg = task["figure"]
    m = re.search(r"class='needle' d='M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)'", svg)
    x0, y0, x1, y1 = map(float, m.groups())
    assert (x0, y0) == X2_CENTER
    ticks = max(re.findall(r"d='(M[^']+)'", svg), key=lambda d: d.count("M"))
    assert ticks.count("M") == X2_DIVISIONS + 1, "число штрихов шкалы не совпадает с числом делений"
    angle = math.degrees(math.atan2(y0 - y1, x1 - x0))
    value = (X2_ANGLE_ZERO - angle) / X2_DEG_PER_AMP
    division = X2_SCALE_MAX / X2_DIVISIONS
    reading = round(value / division) * division
    return f"{reading:.1f}±{division:.1f}".replace(".", ",")



# X3: пары маятников, различающиеся только длиной нити (столбцы: №, l, m, α₀)
def x3_pair(task):
    rows = parse_table(task["code"])
    pairs = [(a[0], b[0]) for i, a in enumerate(rows) for b in rows[i + 1:] if a[1] != b[1] and a[2:] == b[2:]]
    assert len(pairs) == 1, f"подходящих пар {len(pairs)}"
    return "".join(str(int(n)) for n in pairs[0])



# X4: жёсткость методом наименьших квадратов для прямой F = kx через начало координат
def x4_stiffness(task):
    masses, stretches = parse_table(task["code"])
    forces = [m / 1000 * G for m in masses]
    xs = [x / 100 for x in stretches]
    return sum(f * x for f, x in zip(forces, xs)) / sum(x * x for x in xs)



def main():
    bank = load_bank(sys.argv[1])
    tasks = {t["id"]: t for t in bank["tasks"]}
    ETALON = {
        "M1": m1_path(tasks["M1"]),
        "M2": m2_stretch_cm(),
        "M3": m3_heat(),
        "M4": m4_support_a(),
        "M5": m5_statements(tasks["M5"]),
        "M6": m6_orbit(),
        "M7": m7_incline(),
        "M8": m8_relative_shift(),
        "T1": t1_energy(),
        "T2": t2_carnot(),
        "T3": t3_statements(tasks["T3"]),
        "T4": t4_vapor(),
        "T5": t5_match(),
        "T6": t6_heat(),
        "T7": t7_pressure(),
        "E1": e1_power(),
        "E2": e2_current(),
        "E3": e3_statements(),
        "E4": e4_capacitor(),
        "E5": e5_direction(),
        "E6": None,
        "E7": e7_speed(),
        "E8": e8_heat(),
        "V1": v1_length(),
        "V2": v2_match(tasks["V2"]),
        "V3": v3_period(),
        "V4": v4_statements(tasks["V4"]),
        "O1": o1_image(),
        "O2": o2_angle(),
        "O3": o3_order(),
        "O4": o4_lens(),
        "Q1": q1_beta(),
        "Q2": q2_decayed(),
        "Q3": q3_photo(),
        "Q4": q4_voltage(),
        "Q5": q5_match(),
        "X1": x1_statements(),
        "X2": x2_reading(tasks["X2"]),
        "X3": x3_pair(tasks["X3"]),
        "X4": x4_stiffness(tasks["X4"]),
    }
    # Без эталона (None) могут быть только качественные задачи
    for tid, exp in ETALON.items():
        if exp is None and tasks.get(tid, {}).get("kind") != "text":
            print("FAIL", tid, ": эталон None, но задача не качественная")
            sys.exit(1)
    sys.exit(report(bank, ETALON))



if __name__ == "__main__":
    main()
