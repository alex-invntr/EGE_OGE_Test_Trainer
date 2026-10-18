// Банк задач: ОГЭ · математика (9 класс). Формат описан в banks/README.md.
// © 2026 alex-invntr. Лицензия CC BY 4.0: https://creativecommons.org/licenses/by/4.0/deed.ru
// Объект — строгий JSON: его же читают скрипты проверки из tools/.
var BANKS = BANKS || {};
BANKS["oge_math"] = {
  "exam": "oge",
  "subject": "math",
  "examName": "ОГЭ",
  "subjectName": "математика",
  "subjectDative": "по математике",
  "grade": "9 класс",
  "letter": "М",
  "spec": {
    "tasks": 25,
    "maxScore": 31,
    "minutes": 235,
    "note": "19 заданий с кратким ответом (по 1 баллу) и 6 с развёрнутым (20–25, по 2 балла); ответ к заданиям 7 и 13 — номер варианта; калькулятор не разрешён; в 2027 г. изменений нет"
  },
  "mini": {
    "tasks": 10,
    "minutes": 30
  },
  "topics": {
    "prac": {
      "name": "Практические и текстовые задачи",
      "color": "#E8590C"
    },
    "num": {
      "name": "Числа и вычисления",
      "color": "#E67700"
    },
    "alg": {
      "name": "Выражения, уравнения, неравенства",
      "color": "#1F5FBF"
    },
    "func": {
      "name": "Функции и графики",
      "color": "#6741D9"
    },
    "seq": {
      "name": "Прогрессии и вероятность",
      "color": "#0CA678"
    },
    "tri": {
      "name": "Треугольники и четырёхугольники",
      "color": "#D6336C"
    },
    "circ": {
      "name": "Окружность, клетки, утверждения",
      "color": "#1098AD"
    }
  },
  "criteria": {
    "calc": [
      [
        2,
        "ход решения верный, все шаги обоснованы, получен верный ответ"
      ],
      [
        1,
        "решение в целом верное, но есть несущественные недочёты в обоснованиях или одна вычислительная ошибка"
      ],
      [
        0,
        "решение не соответствует ни одному из критериев, перечисленных выше"
      ]
    ],
    "text": [
      [
        2,
        "доказательство верное, все шаги обоснованы"
      ],
      [
        1,
        "доказательство в целом верное, но содержит несущественные недочёты"
      ],
      [
        0,
        "доказательства нет или оно неверное"
      ]
    ]
  },
  "tasks": [
    {
      "id": "P1",
      "topic": "prac",
      "kind": "match",
      "level": "базовый",
      "format": "задание 1 ОГЭ · план участка",
      "text": "На плане изображён дачный участок прямоугольной формы (сторона клетки на плане — 2 м). Въезд на участок — через ворота на нижней стороне забора, они отмечены стрелкой. Самая большая по площади постройка на участке — жилой дом. Справа от ворот, вплотную к нижней стороне забора, стоит гараж. Теплица — узкая постройка, длина которой втрое больше ширины. Ближе всех к левому нижнему углу участка стоит баня. Ещё на участке есть сарай.\nДля объектов из первого столбца определите, какими цифрами они обозначены на плане.",
      "code": null,
      "figure": "<svg viewBox='0 0 420 300' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M54 14 L54 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M78 14 L78 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M102 14 L102 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M126 14 L126 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M150 14 L150 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M174 14 L174 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M198 14 L198 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M222 14 L222 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M246 14 L246 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M270 14 L270 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M294 14 L294 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M318 14 L318 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M342 14 L342 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M366 14 L366 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 38 L390 38' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 62 L390 62' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 86 L390 86' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 110 L390 110' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 134 L390 134' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 158 L390 158' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 182 L390 182' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 206 L390 206' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 230 L390 230' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><polyline points='198,254 390,254 390,14 30,14 30,254 150,254' fill='none' stroke='#14213D' stroke-width='2.5' stroke-linejoin='round'/><path d='M150 248 L150 260' stroke='#14213D' stroke-width='3' fill='none'/><path d='M198 248 L198 260' stroke='#14213D' stroke-width='3' fill='none'/><rect x='318' y='38' width='48' height='144' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='342' y='116' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>1</text><rect x='150' y='38' width='120' height='96' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='210' y='92' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>2</text><rect x='54' y='38' width='48' height='48' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='78' y='68' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>3</text><rect x='54' y='158' width='72' height='72' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='90' y='200' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>4</text><rect x='222' y='182' width='72' height='72' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='258' y='224' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>5</text><path d='M174 292 L174 266' stroke='#14213D' stroke-width='2' fill='none'/><polygon points='174,258 178,268 170,268' fill='#14213D'/><text x='186' y='288' font-size='13' fill='#4F5D78'>ворота</text></svg>",
      "options": {
        "left": [
          "А) жилой дом",
          "Б) гараж",
          "В) теплица",
          "Г) баня"
        ],
        "right": [
          "1) постройка 1",
          "2) постройка 2",
          "3) постройка 3",
          "4) постройка 4",
          "5) постройка 5"
        ]
      },
      "answer": "2514",
      "unit": "",
      "tol": 0,
      "hints": [
        "Читай описание по одному признаку и сразу находи постройку на плане. Размеры считай в клетках — так проще.",
        "Посчитай площадь каждой постройки в клетках (длина × ширина) — так найдёшь дом. Потом найди постройку, которая касается нижней стороны забора справа от ворот, и постройку, у которой одна сторона втрое длиннее другой.",
        "Площади: 1 — 2×6 = 12, 2 — 5×4 = 20, 3 — 2×2 = 4, 4 — 3×3 = 9, 5 — 3×3 = 9 клеток. Дом — 2. К нижней стороне справа от ворот примыкает 5. Стороны 2 и 6 — у постройки 1. Ближе всех к левому нижнему углу — 4."
      ],
      "solution": "Самая большая постройка — 2 (5×4 = 20 клеток): это жилой дом. Справа от ворот к нижней стороне забора примыкает только постройка 5 — гараж. У постройки 1 размеры 2×6 клеток, длина втрое больше ширины — это теплица. Ближе всех к левому нижнему углу стоит постройка 4 — баня. Постройка 3 — сарай, в ответ она не входит. Ответ: 2514.",
      "part2": false
    },
    {
      "id": "P2",
      "topic": "prac",
      "kind": "number",
      "level": "базовый",
      "format": "задание 2 ОГЭ · план участка",
      "text": "На плане изображён дачный участок (сторона клетки — 2 м), постройки обозначены цифрами 1–5. Какой процент площади участка занимают все постройки вместе?",
      "code": null,
      "figure": "<svg viewBox='0 0 420 300' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M54 14 L54 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M78 14 L78 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M102 14 L102 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M126 14 L126 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M150 14 L150 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M174 14 L174 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M198 14 L198 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M222 14 L222 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M246 14 L246 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M270 14 L270 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M294 14 L294 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M318 14 L318 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M342 14 L342 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M366 14 L366 254' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 38 L390 38' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 62 L390 62' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 86 L390 86' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 110 L390 110' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 134 L390 134' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 158 L390 158' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 182 L390 182' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 206 L390 206' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><path d='M30 230 L390 230' stroke='#8FB0DA' stroke-width='0.7' fill='none'/><polyline points='198,254 390,254 390,14 30,14 30,254 150,254' fill='none' stroke='#14213D' stroke-width='2.5' stroke-linejoin='round'/><path d='M150 248 L150 260' stroke='#14213D' stroke-width='3' fill='none'/><path d='M198 248 L198 260' stroke='#14213D' stroke-width='3' fill='none'/><rect x='318' y='38' width='48' height='144' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='342' y='116' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>1</text><rect x='150' y='38' width='120' height='96' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='210' y='92' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>2</text><rect x='54' y='38' width='48' height='48' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='78' y='68' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>3</text><rect x='54' y='158' width='72' height='72' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='90' y='200' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>4</text><rect x='222' y='182' width='72' height='72' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><text x='258' y='224' text-anchor='middle' font-size='17' font-weight='bold' fill='#14213D'>5</text><path d='M174 292 L174 266' stroke='#14213D' stroke-width='2' fill='none'/><polygon points='174,258 178,268 170,268' fill='#14213D'/><text x='186' y='288' font-size='13' fill='#4F5D78'>ворота</text></svg>",
      "options": null,
      "answer": 36,
      "unit": "%",
      "tol": 0,
      "hints": [
        "Процент — это доля, умноженная на 100. Площади удобно считать в клетках: размер клетки на долю не влияет.",
        "Найди площадь всего участка в клетках (15 × 10) и сложи площади всех пяти построек.",
        "Постройки: 12 + 20 + 4 + 9 + 9 = 54 клетки, участок — 150 клеток. Осталось найти 54/150 и перевести в проценты."
      ],
      "solution": "Участок — прямоугольник 15 × 10 = 150 клеток. Площади построек в клетках: 1 — 2·6 = 12, 2 — 5·4 = 20, 3 — 2·2 = 4, 4 — 3·3 = 9, 5 — 3·3 = 9, всего 54 клетки. Доля 54/150 = 0,36, то есть 36 %. (В квадратных метрах: 216 м² из 600 м² — та же доля.) Ответ: 36.",
      "part2": false
    },
    {
      "id": "P3",
      "topic": "prac",
      "kind": "number",
      "level": "базовый",
      "format": "задание 3 ОГЭ · шины",
      "text": "Маркировка автомобильной шины 215/60 R16 означает: ширина шины — 215 мм; высота боковины составляет 60 % ширины; диаметр диска — 16 дюймов (1 дюйм = 25,4 мм). Найдите диаметр колеса с такой шиной. Ответ дайте в миллиметрах.",
      "code": null,
      "figure": "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><circle cx='150' cy='100' r='85' fill='#E3ECF7' stroke='#14213D' stroke-width='2'/><circle cx='150' cy='100' r='52' fill='#fff' stroke='#14213D' stroke-width='2'/><circle cx='150' cy='100' r='9' fill='#fff' stroke='#14213D' stroke-width='1.5'/><path d='M150 88 L150 56' stroke='#8FB0DA' stroke-width='3' fill='none'/><path d='M138.6 96.3 L108.2 86.4' stroke='#8FB0DA' stroke-width='3' fill='none'/><path d='M142.9 109.7 L124.1 135.6' stroke='#8FB0DA' stroke-width='3' fill='none'/><path d='M157.1 109.7 L175.9 135.6' stroke='#8FB0DA' stroke-width='3' fill='none'/><path d='M161.4 96.3 L191.8 86.4' stroke='#8FB0DA' stroke-width='3' fill='none'/><path d='M150 15 L40 15' stroke='#8FB0DA' stroke-width='1' stroke-dasharray='4 3' fill='none'/><path d='M150 185 L40 185' stroke='#8FB0DA' stroke-width='1' stroke-dasharray='4 3' fill='none'/><path d='M150 15 L265 15' stroke='#8FB0DA' stroke-width='1' stroke-dasharray='4 3' fill='none'/><path d='M150 48 L265 48' stroke='#8FB0DA' stroke-width='1' stroke-dasharray='4 3' fill='none'/><path d='M150 152 L265 152' stroke='#8FB0DA' stroke-width='1' stroke-dasharray='4 3' fill='none'/><path d='M40 15 L40 185' stroke='#14213D' stroke-width='1.3' fill='none'/><polygon points='40,185 37.2,178 42.8,178' fill='#14213D'/><polygon points='40,15 42.8,22 37.2,22' fill='#14213D'/><text x='28' y='100' text-anchor='middle' font-size='13' fill='#14213D' transform='rotate(-90 28 100)'>диаметр колеса</text><path d='M265 48 L265 152' stroke='#14213D' stroke-width='1.3' fill='none'/><polygon points='265,152 262.2,145 267.8,145' fill='#14213D'/><polygon points='265,48 267.8,55 262.2,55' fill='#14213D'/><text x='275' y='105' font-size='13' fill='#14213D'>диаметр диска</text><path d='M265 15 L265 48' stroke='#14213D' stroke-width='1.3' fill='none'/><polygon points='265,48 262.2,41 267.8,41' fill='#14213D'/><polygon points='265,15 267.8,22 262.2,22' fill='#14213D'/><text x='275' y='36.5' font-size='13' fill='#14213D'>высота боковины</text></svg>",
      "options": null,
      "answer": 664.4,
      "unit": "мм",
      "tol": 0,
      "hints": [
        "Посмотри на рисунок: диаметр колеса складывается из диаметра диска и двух высот боковины — сверху и снизу.",
        "Переведи диаметр диска в миллиметры: 16·25,4. Высота боковины — 60 % от ширины 215 мм.",
        "Диск: 16·25,4 = 406,4 мм; боковина: 0,6·215 = 129 мм. Диаметр колеса = 406,4 + 2·129."
      ],
      "solution": "Диаметр диска: 16·25,4 = 406,4 мм. Высота боковины: 0,6·215 = 129 мм. Шина добавляет боковину сверху и снизу, поэтому диаметр колеса d = 406,4 + 2·129 = 664,4 мм. Ответ: 664,4.",
      "part2": false
    },
    {
      "id": "P4",
      "topic": "prac",
      "kind": "number",
      "level": "базовый",
      "format": "задание 4 ОГЭ · выбор тарифа",
      "text": "Пассажиру нужно проехать на такси 18 км. Служба «Альфа» берёт 150 рублей за посадку и 22 рубля за каждый километр пути. Служба «Бета» берёт 300 рублей за поездку длиной до 5 км включительно, а каждый следующий километр стоит 18 рублей. Сколько рублей заплатит пассажир, если выберет более дешёвую службу?",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 534,
      "unit": "руб.",
      "tol": 0,
      "hints": [
        "Посчитай стоимость поездки в каждой службе отдельно, а потом выбери меньшую.",
        "«Альфа»: посадка плюс 22 рубля за каждый из 18 км. «Бета»: 300 рублей покрывают первые 5 км, отдельно оплачиваются только оставшиеся 18 − 5 = 13 км.",
        "«Альфа»: 150 + 22·18 = 546 руб. «Бета»: 300 + 18·13 = 534 руб. Сравни."
      ],
      "solution": "«Альфа»: 150 + 22·18 = 150 + 396 = 546 руб. «Бета»: первые 5 км входят в 300 руб., остаётся 13 км по 18 руб.: 300 + 13·18 = 300 + 234 = 534 руб. Дешевле «Бета». Ответ: 534.",
      "part2": false
    },
    {
      "id": "P5",
      "topic": "prac",
      "kind": "number",
      "level": "базовый",
      "format": "задание 5 ОГЭ · таблица",
      "text": "Семья записывала показания счётчика электроэнергии первого числа каждого месяца (см. таблицу). Сколько рублей нужно заплатить за электроэнергию, израсходованную с 1 января по 1 апреля, если 1 кВт·ч стоит 6 рублей 40 копеек?",
      "code": "Дата          Показания счётчика, кВт·ч\n1 января      12 480\n1 февраля     12 735\n1 марта       12 962\n1 апреля      13 170",
      "figure": null,
      "options": null,
      "answer": 4416,
      "unit": "руб.",
      "tol": 0,
      "hints": [
        "Счётчик показывает накопленный расход. Расход за период — разность показаний в конце и в начале периода.",
        "Возьми показания на 1 апреля и на 1 января — помесячные разности складывать не нужно. Стоимость = расход × цена.",
        "13 170 − 12 480 = 690 кВт·ч; осталось умножить 690 на 6,4."
      ],
      "solution": "Расход с 1 января по 1 апреля: 13 170 − 12 480 = 690 кВт·ч. Стоимость: 690·6,40 = 4416 руб. Ответ: 4416.",
      "part2": false
    },
    {
      "id": "P6",
      "topic": "prac",
      "kind": "number",
      "level": "повышенный",
      "format": "задание 21 ОГЭ · текстовая задача",
      "text": "Моторная лодка проплыла 56 км вверх по реке и столько же обратно. Путь вниз по реке занял на 3 часа меньше, чем путь вверх. Скорость течения реки 3 км/ч. Найдите собственную скорость лодки. Ответ дайте в км/ч.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 11,
      "unit": "км/ч",
      "tol": 0,
      "hints": [
        "Обозначь собственную скорость лодки x км/ч. Вверх по реке (против течения) скорость x − 3, вниз (по течению) x + 3. Время = путь / скорость.",
        "Путь вверх длился на 3 часа дольше: 56/(x − 3) − 56/(x + 3) = 3. Умножь обе части на (x − 3)(x + 3).",
        "Получится 56·6 = 3(x² − 9), то есть x² = 121. Подходит только положительный корень, причём x > 3."
      ],
      "solution": "Пусть x км/ч — собственная скорость лодки (x > 3). Вверх по реке лодка шла 56/(x − 3) ч, вниз — 56/(x + 3) ч. По условию 56/(x − 3) − 56/(x + 3) = 3. Умножим на (x − 3)(x + 3): 56(x + 3) − 56(x − 3) = 3(x² − 9), 336 = 3x² − 27, x² = 121, x = 11 или x = −11. Скорость положительна, значит x = 11. Проверка: 56/8 − 56/14 = 7 − 4 = 3 ч. Ответ: 11 км/ч.",
      "part2": true,
      "criteria": [
        [
          2,
          "ход решения задачи верный, получен верный ответ"
        ],
        [
          1,
          "верно составлена математическая модель (уравнение), но решение не доведено до конца или содержит ошибки; либо решение в целом верное, но есть несущественные недочёты или вычислительная ошибка"
        ],
        [
          0,
          "решение не соответствует ни одному из критериев, перечисленных выше"
        ]
      ]
    },
    {
      "id": "N1",
      "topic": "num",
      "kind": "number",
      "level": "базовый",
      "format": "задание 6 ОГЭ · обыкновенные и десятичные дроби",
      "text": "Найдите значение выражения (2/5 + 7/4) · 1,6.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 3.44,
      "unit": "",
      "tol": 0,
      "hints": [
        "Сначала действие в скобках: приведи дроби к общему знаменателю.",
        "Общий знаменатель 20: 2/5 = 8/20, 7/4 = 35/20. Сумму удобно перевести в десятичную дробь.",
        "8/20 + 35/20 = 43/20 = 2,15. Осталось 2,15·1,6."
      ],
      "solution": "2/5 + 7/4 = 8/20 + 35/20 = 43/20 = 2,15. Затем 2,15·1,6 = 3,44. Ответ: 3,44.",
      "part2": false
    },
    {
      "id": "N2",
      "topic": "num",
      "kind": "choice",
      "level": "базовый",
      "format": "задание 7 ОГЭ · числа на координатной прямой",
      "text": "На координатной прямой отмечены числа a и b. Какое из следующих утверждений об этих числах верно?",
      "code": null,
      "figure": "<svg viewBox='0 0 400 70' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M15 36 L376 36' stroke='#14213D' stroke-width='1.5' fill='none'/><polygon points='384,36 374,40 374,32' fill='#14213D'/><path d='M42 30 L42 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='42' y='60' text-anchor='middle' font-size='14' fill='#14213D'>−3</text><path d='M86 30 L86 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='86' y='60' text-anchor='middle' font-size='14' fill='#14213D'>−2</text><path d='M130 30 L130 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='130' y='60' text-anchor='middle' font-size='14' fill='#14213D'>−1</text><path d='M174 30 L174 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='174' y='60' text-anchor='middle' font-size='14' fill='#14213D'>0</text><path d='M218 30 L218 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='218' y='60' text-anchor='middle' font-size='14' fill='#14213D'>1</text><path d='M262 30 L262 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='262' y='60' text-anchor='middle' font-size='14' fill='#14213D'>2</text><path d='M306 30 L306 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='306' y='60' text-anchor='middle' font-size='14' fill='#14213D'>3</text><path d='M350 30 L350 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='350' y='60' text-anchor='middle' font-size='14' fill='#14213D'>4</text><circle cx='103.6' cy='36' r='4.5' fill='#14213D'/><text x='103.6' y='22' text-anchor='middle' font-size='15' font-style='italic' fill='#14213D'>a</text><circle cx='279.6' cy='36' r='4.5' fill='#14213D'/><text x='279.6' y='22' text-anchor='middle' font-size='15' font-style='italic' fill='#14213D'>b</text></svg>",
      "options": [
        "a + b < 0",
        "a·b > 0",
        "a − b > 0",
        "a² < b²"
      ],
      "answer": "4",
      "unit": "",
      "tol": 0,
      "hints": [
        "Определи по рисунку, между какими целыми числами лежат a и b. Каждое утверждение можно проверить, подставив подходящие значения, например a = −1,6 и b = 2,4.",
        "a отрицательное, b положительное — отсюда сразу видны знаки произведения и разности. Для суммы и квадратов сравни модули: |a| < 2, а |b| > 2.",
        "a + b > 0, потому что |b| > |a|; ab < 0; a − b < 0. Остаётся сравнить квадраты: a² < 4 < b²."
      ],
      "solution": "По рисунку −2 < a < −1 и 2 < b < 3. 1) |b| > |a|, поэтому a + b > 0 — утверждение неверно. 2) Числа разных знаков, ab < 0 — неверно. 3) a < b, значит a − b < 0 — неверно. 4) a² < 4, а b² > 4, значит a² < b² — верно. Ответ: 4.",
      "part2": false
    },
    {
      "id": "N3",
      "topic": "num",
      "kind": "choice",
      "level": "базовый",
      "format": "задание 7 ОГЭ · корни на координатной прямой",
      "text": "Одно из чисел √33, √45, √51, √62 отмечено на координатной прямой точкой A. Какое это число?",
      "code": null,
      "figure": "<svg viewBox='0 0 400 70' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M15 36 L376 36' stroke='#14213D' stroke-width='1.5' fill='none'/><polygon points='384,36 374,40 374,32' fill='#14213D'/><path d='M49.3 30 L49.3 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='49.3' y='60' text-anchor='middle' font-size='14' fill='#14213D'>4</text><path d='M108 30 L108 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='108' y='60' text-anchor='middle' font-size='14' fill='#14213D'>5</text><path d='M166.7 30 L166.7 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='166.7' y='60' text-anchor='middle' font-size='14' fill='#14213D'>6</text><path d='M225.3 30 L225.3 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='225.3' y='60' text-anchor='middle' font-size='14' fill='#14213D'>7</text><path d='M284 30 L284 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='284' y='60' text-anchor='middle' font-size='14' fill='#14213D'>8</text><path d='M342.7 30 L342.7 42' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='342.7' y='60' text-anchor='middle' font-size='14' fill='#14213D'>9</text><circle cx='208.2' cy='36' r='4.5' fill='#14213D'/><text x='208.2' y='22' text-anchor='middle' font-size='15' fill='#14213D'>A</text></svg>",
      "options": [
        "√33",
        "√45",
        "√51",
        "√62"
      ],
      "answer": "2",
      "unit": "",
      "tol": 0,
      "hints": [
        "Точка A лежит между двумя соседними целыми числами. Возведи эти числа в квадрат.",
        "A лежит между 6 и 7, значит, под корнем должно стоять число между 6² и 7².",
        "Нужно число из промежутка от 36 до 49. Из 33, 45, 51, 62 туда попадает только одно."
      ],
      "solution": "Точка A лежит между 6 и 7, поэтому искомое число √n удовлетворяет условию 36 < n < 49. Из чисел 33, 45, 51 и 62 подходит только 45: √33 < 6, а √51 и √62 больше 7. Ответ: 2 (число √45).",
      "part2": false
    },
    {
      "id": "N4",
      "topic": "num",
      "kind": "number",
      "level": "базовый",
      "format": "задание 8 ОГЭ · свойства степеней",
      "text": "Найдите значение выражения (c³)⁵ · c⁻⁴ : c⁸ при c = −2.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": -8,
      "unit": "",
      "tol": 0,
      "hints": [
        "Не подставляй число сразу. При возведении степени в степень показатели перемножаются, при умножении степеней с одинаковым основанием — складываются, при делении — вычитаются.",
        "(c³)⁵ = c¹⁵, затем c¹⁵ · c⁻⁴ = c¹¹.",
        "c¹¹ : c⁸ = c³. Подставь c = −2 и не потеряй знак: нечётная степень отрицательного числа отрицательна."
      ],
      "solution": "1) (c³)⁵ = c³·⁵ = c¹⁵. 2) c¹⁵ · c⁻⁴ = c¹⁵⁻⁴ = c¹¹. 3) c¹¹ : c⁸ = c¹¹⁻⁸ = c³. 4) При c = −2: (−2)³ = −8. Ответ: −8.",
      "part2": false
    },
    {
      "id": "N5",
      "topic": "num",
      "kind": "number",
      "level": "базовый",
      "format": "задание 12 ОГЭ · расчёт по формуле",
      "text": "Путь s (в метрах), который тело пролетает при свободном падении из состояния покоя, приближённо вычисляют по формуле s = 5t², где t — время падения в секундах. За сколько секунд камень пролетит 61,25 м? Ответ дайте в секундах.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 3.5,
      "unit": "с",
      "tol": 0,
      "hints": [
        "Подставь известное значение s в формулу и вырази t.",
        "61,25 = 5t², значит t² = 61,25 : 5 = 12,25.",
        "Время положительно: t = √12,25."
      ],
      "solution": "Подставляем s = 61,25: 61,25 = 5t², откуда t² = 12,25 и t = 3,5 с (время положительно). Проверка: 5·3,5² = 5·12,25 = 61,25 м. Ответ: 3,5.",
      "part2": false
    },
    {
      "id": "A1",
      "topic": "alg",
      "kind": "number",
      "level": "базовый",
      "format": "задание 8 ОГЭ · формулы сокращённого умножения",
      "text": "Найдите значение выражения (2x − 3)² − 4x(x − 5) при x = −0,25.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 7,
      "unit": "",
      "tol": 0,
      "hints": [
        "Не подставляй число сразу — сначала упрости выражение. Квадрат разности: (2x − 3)² = 4x² − 12x + 9.",
        "Раскрой скобки во втором слагаемом: 4x(x − 5) = 4x² − 20x. При вычитании знаки меняются, а 4x² сократится.",
        "Получится 8x + 9. Подставь x = −0,25."
      ],
      "solution": "1) (2x − 3)² = 4x² − 12x + 9, 4x(x − 5) = 4x² − 20x. 2) (2x − 3)² − 4x(x − 5) = 4x² − 12x + 9 − 4x² + 20x = 8x + 9. 3) При x = −0,25: 8·(−0,25) + 9 = −2 + 9 = 7. Проверка подстановкой в исходное выражение: (−0,5 − 3)² − 4·(−0,25)·(−5,25) = 12,25 − 5,25 = 7. Ответ: 7.",
      "part2": false
    },
    {
      "id": "A2",
      "topic": "alg",
      "kind": "number",
      "level": "базовый",
      "format": "задание 9 ОГЭ · квадратное уравнение",
      "text": "Решите уравнение 2x² − 7x = 15. Если уравнение имеет более одного корня, в ответ запишите меньший из корней.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": -1.5,
      "unit": "",
      "tol": 0,
      "hints": [
        "Перенеси всё в левую часть, чтобы справа остался 0: 2x² − 7x − 15 = 0.",
        "Найди дискриминант D = b² − 4ac, где a = 2, b = −7, c = −15.",
        "D = 49 + 120 = 169, √D = 13; x = (7 ± 13)/4."
      ],
      "solution": "1) 2x² − 7x − 15 = 0, D = (−7)² − 4·2·(−15) = 49 + 120 = 169. 2) x₁ = (7 + 13)/4 = 5, x₂ = (7 − 13)/4 = −1,5. 3) Проверка: 2·25 − 7·5 = 15 и 2·2,25 + 7·1,5 = 4,5 + 10,5 = 15. Меньший корень −1,5. Ответ: −1,5.",
      "part2": false
    },
    {
      "id": "A3",
      "topic": "alg",
      "kind": "choice",
      "level": "базовый",
      "format": "задание 13 ОГЭ · система неравенств",
      "text": "Укажите решение системы неравенств\n2x + 7 > 1,\n12 − 3x ≥ 0.",
      "code": null,
      "figure": null,
      "options": [
        "(−∞; −3)",
        "(−3; 4]",
        "[4; +∞)",
        "(−∞; −3) ∪ [4; +∞)"
      ],
      "answer": "2",
      "unit": "",
      "tol": 0,
      "hints": [
        "Реши каждое неравенство отдельно, а потом найди общую часть решений.",
        "Первое: 2x > −6, то есть x > −3. Второе: −3x ≥ −12; при делении на отрицательное число знак неравенства меняется на противоположный.",
        "x > −3 и x ≤ 4. Проверь, какие концы промежутка входят в ответ, а какие нет."
      ],
      "solution": "1) 2x + 7 > 1 → 2x > −6 → x > −3. 2) 12 − 3x ≥ 0 → −3x ≥ −12 → x ≤ 4. 3) Общая часть: −3 < x ≤ 4, то есть (−3; 4]. Число −3 не входит (неравенство строгое), число 4 входит. Ответ: 2.",
      "part2": false
    },
    {
      "id": "A4",
      "topic": "alg",
      "kind": "choice",
      "level": "базовый",
      "format": "задание 13 ОГЭ · квадратное неравенство",
      "text": "Укажите решение неравенства x² − x − 20 ≤ 0. На каком рисунке изображено множество его решений?",
      "code": null,
      "figure": "<svg viewBox='0 0 410 200' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M104 28 L302 28' stroke='#8FB0DA' stroke-width='8' stroke-linecap='butt' fill='none'/><path d='M48 28 L380 28' stroke='#14213D' stroke-width='1.5' fill='none'/><polygon points='392,28 382,32 382,24' fill='#14213D'/><text x='392' y='46' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='22' y='33' text-anchor='middle' font-size='14' fill='#14213D'>1)</text><circle cx='104' cy='28' r='4.5' fill='#14213D'/><text x='104' y='49' text-anchor='middle' font-size='13' fill='#14213D'>−5</text><circle cx='302' cy='28' r='4.5' fill='#14213D'/><text x='302' y='49' text-anchor='middle' font-size='13' fill='#14213D'>4</text><path d='M126 74 L324 74' stroke='#8FB0DA' stroke-width='8' stroke-linecap='butt' fill='none'/><path d='M48 74 L380 74' stroke='#14213D' stroke-width='1.5' fill='none'/><polygon points='392,74 382,78 382,70' fill='#14213D'/><text x='392' y='92' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='22' y='79' text-anchor='middle' font-size='14' fill='#14213D'>2)</text><circle cx='126' cy='74' r='4.5' fill='#14213D'/><text x='126' y='95' text-anchor='middle' font-size='13' fill='#14213D'>−4</text><circle cx='324' cy='74' r='4.5' fill='#14213D'/><text x='324' y='95' text-anchor='middle' font-size='13' fill='#14213D'>5</text><path d='M52 120 L126 120' stroke='#8FB0DA' stroke-width='8' stroke-linecap='butt' fill='none'/><path d='M324 120 L376 120' stroke='#8FB0DA' stroke-width='8' stroke-linecap='butt' fill='none'/><path d='M48 120 L380 120' stroke='#14213D' stroke-width='1.5' fill='none'/><polygon points='392,120 382,124 382,116' fill='#14213D'/><text x='392' y='138' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='22' y='125' text-anchor='middle' font-size='14' fill='#14213D'>3)</text><circle cx='126' cy='120' r='4.5' fill='#14213D'/><text x='126' y='141' text-anchor='middle' font-size='13' fill='#14213D'>−4</text><circle cx='324' cy='120' r='4.5' fill='#14213D'/><text x='324' y='141' text-anchor='middle' font-size='13' fill='#14213D'>5</text><path d='M52 166 L104 166' stroke='#8FB0DA' stroke-width='8' stroke-linecap='butt' fill='none'/><path d='M302 166 L376 166' stroke='#8FB0DA' stroke-width='8' stroke-linecap='butt' fill='none'/><path d='M48 166 L380 166' stroke='#14213D' stroke-width='1.5' fill='none'/><polygon points='392,166 382,170 382,162' fill='#14213D'/><text x='392' y='184' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='22' y='171' text-anchor='middle' font-size='14' fill='#14213D'>4)</text><circle cx='104' cy='166' r='4.5' fill='#14213D'/><text x='104' y='187' text-anchor='middle' font-size='13' fill='#14213D'>−5</text><circle cx='302' cy='166' r='4.5' fill='#14213D'/><text x='302' y='187' text-anchor='middle' font-size='13' fill='#14213D'>4</text></svg>",
      "options": [
        "рисунок 1",
        "рисунок 2",
        "рисунок 3",
        "рисунок 4"
      ],
      "answer": "2",
      "unit": "",
      "tol": 0,
      "hints": [
        "Найди корни квадратного трёхчлена x² − x − 20, затем реши неравенство методом интервалов или по графику параболы.",
        "Корни: −4 и 5 (по теореме Виета их сумма 1, произведение −20). Ветви параболы y = x² − x − 20 направлены вверх.",
        "Парабола не выше оси Ox между корнями, и концы входят (знак ≤): нужен отрезок от −4 до 5 с закрашенными концами."
      ],
      "solution": "1) x² − x − 20 = 0: D = 1 + 80 = 81, x₁ = (1 − 9)/2 = −4, x₂ = (1 + 9)/2 = 5. 2) Ветви параболы y = x² − x − 20 направлены вверх, поэтому y ≤ 0 на отрезке между корнями: −4 ≤ x ≤ 5. 3) Отрезок [−4; 5] с закрашенными концами изображён на рисунке 2 (на рисунке 1 — отрезок [−5; 4], это решение неравенства x² + x − 20 ≤ 0). Ответ: 2.",
      "part2": false
    },
    {
      "id": "A5",
      "topic": "alg",
      "kind": "number",
      "level": "повышенный",
      "format": "задание 20 ОГЭ · уравнение",
      "text": "Решите уравнение x³ + 5x² − 16x − 80 = 0. В ответ запишите сумму всех его корней.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": -5,
      "unit": "",
      "tol": 0,
      "hints": [
        "Сгруппируй слагаемые попарно: (x³ + 5x²) − (16x + 80) — и вынеси общие множители.",
        "x²(x + 5) − 16(x + 5) = (x + 5)(x² − 16). Произведение равно нулю, когда хотя бы один множитель равен нулю.",
        "x + 5 = 0 или x² − 16 = 0, то есть x = −5, x = 4, x = −4."
      ],
      "solution": "x³ + 5x² − 16x − 80 = x²(x + 5) − 16(x + 5) = (x + 5)(x² − 16) = (x + 5)(x − 4)(x + 4). Произведение равно нулю при x = −5, x = 4 или x = −4. Сумма корней: −5 + 4 − 4 = −5. Ответ: −5.",
      "part2": true,
      "criteria": [
        [
          2,
          "обоснованно получен верный ответ"
        ],
        [
          1,
          "решение доведено до конца, но допущена вычислительная ошибка; с её учётом дальнейшие шаги выполнены верно"
        ],
        [
          0,
          "решение не соответствует ни одному из критериев, перечисленных выше"
        ]
      ]
    },
    {
      "id": "A6",
      "topic": "alg",
      "kind": "number",
      "level": "повышенный",
      "format": "задание 20 ОГЭ · уравнение",
      "text": "Решите уравнение (x² + 2x)² − 7(x² + 2x) − 8 = 0. В ответ запишите сумму всех его корней.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": -3,
      "unit": "",
      "tol": 0,
      "hints": [
        "Выражение x² + 2x встречается дважды — сделай замену t = x² + 2x.",
        "t² − 7t − 8 = 0, откуда t = 8 или t = −1. Вернись к переменной x и реши два квадратных уравнения.",
        "x² + 2x = 8 даёт x = 2 и x = −4; x² + 2x = −1 равносильно (x + 1)² = 0, x = −1. Каждый корень считай один раз."
      ],
      "solution": "1) Замена t = x² + 2x: t² − 7t − 8 = 0, D = 49 + 32 = 81, t = (7 ± 9)/2, то есть t = 8 или t = −1. 2) x² + 2x = 8 ⇔ x² + 2x − 8 = 0 ⇔ x = 2 или x = −4. 3) x² + 2x = −1 ⇔ x² + 2x + 1 = 0 ⇔ (x + 1)² = 0 ⇔ x = −1. 4) Корни уравнения: −4; −1; 2. Проверка для x = −1: x² + 2x = −1, и (−1)² − 7·(−1) − 8 = 0. Сумма корней −4 + (−1) + 2 = −3. Ответ: −3.",
      "part2": true,
      "criteria": [
        [
          2,
          "обоснованно получен верный ответ"
        ],
        [
          1,
          "решение доведено до конца, но допущена вычислительная ошибка; с её учётом дальнейшие шаги выполнены верно"
        ],
        [
          0,
          "решение не соответствует ни одному из критериев, перечисленных выше"
        ]
      ]
    },
    {
      "id": "F1",
      "topic": "func",
      "kind": "match",
      "level": "базовый",
      "format": "задание 11 ОГЭ · графики и формулы",
      "text": "Установите соответствие между графиками функций и формулами, которые их задают. Две формулы лишние.",
      "code": null,
      "figure": "<svg viewBox='0 0 420 170' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M12 138 L12 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 138 L132 138' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M24 138 L24 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 126 L132 126' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M36 138 L36 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 114 L132 114' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M48 138 L48 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 102 L132 102' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M60 138 L60 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 90 L132 90' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M72 138 L72 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 78 L132 78' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M84 138 L84 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 66 L132 66' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M96 138 L96 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 54 L132 54' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M108 138 L108 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 42 L132 42' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M120 138 L120 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 30 L132 30' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M132 138 L132 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 18 L132 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M8.4 78 L134.4 78' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='141.6,78 134.6,80.8 134.6,75.2' fill='#14213D'/><path d='M72 141.6 L72 15.6' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='72,8.4 74.8,15.4 69.2,15.4' fill='#14213D'/><text x='139.2' y='92.4' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='82.8' y='15.6' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>y</text><rect x='58.8' y='82.6' width='12.1' height='13' fill='#fff'/><text x='64.8' y='93' text-anchor='middle' font-size='13' fill='#14213D'>0</text><rect x='78' y='82.6' width='12.1' height='13' fill='#fff'/><text x='84' y='93' text-anchor='middle' font-size='13' fill='#14213D'>1</text><rect x='58.2' y='59.8' width='12.1' height='13' fill='#fff'/><text x='64.2' y='70.2' text-anchor='middle' font-size='13' fill='#14213D'>1</text><polyline points='12,70.8 12.4,70.8 12.8,70.7 13.1,70.7 13.5,70.6 13.9,70.6 14.3,70.5 14.6,70.5 15,70.4 15.4,70.4 15.8,70.3 16.1,70.3 16.5,70.2 16.9,70.2 17.3,70.1 17.6,70.1 18,70 18.4,69.9 18.8,69.9 19.1,69.8 19.5,69.8 19.9,69.7 20.3,69.6 20.6,69.6 21,69.5 21.4,69.5 21.8,69.4 22.2,69.3 22.5,69.3 22.9,69.2 23.3,69.1 23.7,69.1 24,69 24.4,68.9 24.8,68.9 25.2,68.8 25.5,68.7 25.9,68.6 26.3,68.5 26.7,68.5 27,68.4 27.4,68.3 27.8,68.2 28.2,68.1 28.5,68.1 28.9,68 29.3,67.9 29.7,67.8 30,67.7 30.4,67.6 30.8,67.5 31.2,67.4 31.6,67.3 31.9,67.2 32.3,67.1 32.7,67 33.1,66.9 33.4,66.8 33.8,66.7 34.2,66.6 34.6,66.5 34.9,66.3 35.3,66.2 35.7,66.1 36.1,66 36.4,65.9 36.8,65.7 37.2,65.6 37.6,65.5 37.9,65.3 38.3,65.2 38.7,65 39.1,64.9 39.4,64.7 39.8,64.6 40.2,64.4 40.6,64.3 41,64.1 41.3,63.9 41.7,63.7 42.1,63.6 42.5,63.4 42.8,63.2 43.2,63 43.6,62.8 44,62.6 44.3,62.4 44.7,62.2 45.1,61.9 45.5,61.7 45.8,61.5 46.2,61.2 46.6,61 47,60.7 47.3,60.5 47.7,60.2 48.1,59.9 48.5,59.6 48.8,59.3 49.2,59 49.6,58.7 50,58.4 50.4,58 50.7,57.7 51.1,57.3 51.5,56.9 51.9,56.6 52.2,56.1 52.6,55.7 53,55.3 53.4,54.8 53.7,54.3 54.1,53.8 54.5,53.3 54.9,52.8 55.2,52.2 55.6,51.6 56,51 56.4,50.4 56.7,49.7 57.1,49 57.5,48.2 57.9,47.4 58.2,46.6 58.6,45.7 59,44.8 59.4,43.8 59.8,42.7 60.1,41.6 60.5,40.4 60.9,39.2 61.3,37.8 61.6,36.3 62,34.8 62.4,33.1 62.8,31.2 63.1,29.3 63.5,27.1 63.9,24.7 64.3,22.2 64.6,19.3 65,16.1' fill='none' stroke='#14213D' stroke-width='2.2' stroke-linejoin='round'/><polyline points='79,139.9 79.4,136.7 79.7,133.8 80.1,131.3 80.5,128.9 80.9,126.7 81.2,124.8 81.6,122.9 82,121.2 82.4,119.7 82.7,118.2 83.1,116.8 83.5,115.6 83.9,114.4 84.2,113.3 84.6,112.2 85,111.2 85.4,110.3 85.8,109.4 86.1,108.6 86.5,107.8 86.9,107 87.3,106.3 87.6,105.6 88,105 88.4,104.4 88.8,103.8 89.1,103.2 89.5,102.7 89.9,102.2 90.3,101.7 90.6,101.2 91,100.7 91.4,100.3 91.8,99.9 92.1,99.4 92.5,99.1 92.9,98.7 93.3,98.3 93.6,98 94,97.6 94.4,97.3 94.8,97 95.2,96.7 95.5,96.4 95.9,96.1 96.3,95.8 96.7,95.5 97,95.3 97.4,95 97.8,94.8 98.2,94.5 98.5,94.3 98.9,94.1 99.3,93.8 99.7,93.6 100,93.4 100.4,93.2 100.8,93 101.2,92.8 101.5,92.6 101.9,92.4 102.3,92.3 102.7,92.1 103,91.9 103.4,91.7 103.8,91.6 104.2,91.4 104.6,91.3 104.9,91.1 105.3,91 105.7,90.8 106.1,90.7 106.4,90.5 106.8,90.4 107.2,90.3 107.6,90.1 107.9,90 108.3,89.9 108.7,89.8 109.1,89.7 109.4,89.5 109.8,89.4 110.2,89.3 110.6,89.2 110.9,89.1 111.3,89 111.7,88.9 112.1,88.8 112.4,88.7 112.8,88.6 113.2,88.5 113.6,88.4 114,88.3 114.3,88.2 114.7,88.1 115.1,88 115.5,87.9 115.8,87.9 116.2,87.8 116.6,87.7 117,87.6 117.3,87.5 117.7,87.5 118.1,87.4 118.5,87.3 118.8,87.2 119.2,87.1 119.6,87.1 120,87 120.3,86.9 120.7,86.9 121.1,86.8 121.5,86.7 121.8,86.7 122.2,86.6 122.6,86.5 123,86.5 123.4,86.4 123.7,86.4 124.1,86.3 124.5,86.2 124.9,86.2 125.2,86.1 125.6,86.1 126,86 126.4,85.9 126.7,85.9 127.1,85.8 127.5,85.8 127.9,85.7 128.2,85.7 128.6,85.6 129,85.6 129.4,85.5 129.7,85.5 130.1,85.4 130.5,85.4 130.9,85.3 131.2,85.3 131.6,85.2 132,85.2' fill='none' stroke='#14213D' stroke-width='2.2' stroke-linejoin='round'/><text x='72' y='164' text-anchor='middle' font-size='14' font-weight='bold' fill='#14213D'>А</text><path d='M150 138 L150 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 138 L270 138' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M162 138 L162 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 126 L270 126' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M174 138 L174 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 114 L270 114' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M186 138 L186 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 102 L270 102' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M198 138 L198 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 90 L270 90' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M210 138 L210 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 78 L270 78' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M222 138 L222 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 66 L270 66' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M234 138 L234 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 54 L270 54' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M246 138 L246 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 42 L270 42' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M258 138 L258 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 30 L270 30' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M270 138 L270 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 18 L270 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M146.4 78 L272.4 78' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='279.6,78 272.6,80.8 272.6,75.2' fill='#14213D'/><path d='M210 141.6 L210 15.6' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='210,8.4 212.8,15.4 207.2,15.4' fill='#14213D'/><text x='277.2' y='92.4' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='220.8' y='15.6' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>y</text><rect x='196.8' y='82.6' width='12.1' height='13' fill='#fff'/><text x='202.8' y='93' text-anchor='middle' font-size='13' fill='#14213D'>0</text><rect x='216' y='82.6' width='12.1' height='13' fill='#fff'/><text x='222' y='93' text-anchor='middle' font-size='13' fill='#14213D'>1</text><rect x='196.2' y='59.8' width='12.1' height='13' fill='#fff'/><text x='202.2' y='70.2' text-anchor='middle' font-size='13' fill='#14213D'>1</text><polyline points='204.4,17 205.2,20.9 206,24.7 206.8,28.3 207.6,31.9 208.4,35.4 209.2,38.7 210,42 210.8,45.1 211.6,48.2 212.4,51.1 213.2,53.9 214,56.7 214.8,59.3 215.6,61.8 216.4,64.2 217.2,66.5 218,68.7 218.8,70.7 219.6,72.7 220.4,74.6 221.2,76.3 222,78 222.8,79.5 223.6,81 224.4,82.3 225.2,83.5 226,84.7 226.8,85.7 227.6,86.6 228.4,87.4 229.2,88.1 230,88.7 230.8,89.1 231.6,89.5 232.4,89.8 233.2,89.9 234,90 234.8,89.9 235.6,89.8 236.4,89.5 237.2,89.1 238,88.7 238.8,88.1 239.6,87.4 240.4,86.6 241.2,85.7 242,84.7 242.8,83.5 243.6,82.3 244.4,81 245.2,79.5 246,78 246.8,76.3 247.6,74.6 248.4,72.7 249.2,70.7 250,68.7 250.8,66.5 251.6,64.2 252.4,61.8 253.2,59.3 254,56.7 254.8,53.9 255.6,51.1 256.4,48.2 257.2,45.1 258,42 258.8,38.7 259.6,35.4 260.4,31.9 261.2,28.3 262,24.7 262.8,20.9 263.6,17' fill='none' stroke='#14213D' stroke-width='2.2' stroke-linejoin='round'/><text x='210' y='164' text-anchor='middle' font-size='14' font-weight='bold' fill='#14213D'>Б</text><path d='M288 138 L288 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 138 L408 138' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M300 138 L300 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 126 L408 126' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M312 138 L312 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 114 L408 114' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M324 138 L324 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 102 L408 102' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M336 138 L336 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 90 L408 90' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M348 138 L348 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 78 L408 78' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M360 138 L360 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 66 L408 66' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M372 138 L372 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 54 L408 54' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M384 138 L384 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 42 L408 42' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M396 138 L396 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 30 L408 30' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M408 138 L408 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 18 L408 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M284.4 78 L410.4 78' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='417.6,78 410.6,80.8 410.6,75.2' fill='#14213D'/><path d='M348 141.6 L348 15.6' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='348,8.4 350.8,15.4 345.2,15.4' fill='#14213D'/><text x='415.2' y='92.4' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='358.8' y='15.6' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>y</text><rect x='334.8' y='82.6' width='12.1' height='13' fill='#fff'/><text x='340.8' y='93' text-anchor='middle' font-size='13' fill='#14213D'>0</text><rect x='354' y='82.6' width='12.1' height='13' fill='#fff'/><text x='360' y='93' text-anchor='middle' font-size='13' fill='#14213D'>1</text><rect x='334.2' y='59.8' width='12.1' height='13' fill='#fff'/><text x='340.2' y='70.2' text-anchor='middle' font-size='13' fill='#14213D'>1</text><polyline points='321.6,142.8 322.4,141.2 323.2,139.6 324,138 324.8,136.4 325.6,134.8 326.4,133.2 327.2,131.6 328,130 328.8,128.4 329.6,126.8 330.4,125.2 331.2,123.6 332,122 332.8,120.4 333.6,118.8 334.4,117.2 335.2,115.6 336,114 336.8,112.4 337.6,110.8 338.4,109.2 339.2,107.6 340,106 340.8,104.4 341.6,102.8 342.4,101.2 343.2,99.6 344,98 344.8,96.4 345.6,94.8 346.4,93.2 347.2,91.6 348,90 348.8,88.4 349.6,86.8 350.4,85.2 351.2,83.6 352,82 352.8,80.4 353.6,78.8 354.4,77.2 355.2,75.6 356,74 356.8,72.4 357.6,70.8 358.4,69.2 359.2,67.6 360,66 360.8,64.4 361.6,62.8 362.4,61.2 363.2,59.6 364,58 364.8,56.4 365.6,54.8 366.4,53.2 367.2,51.6 368,50 368.8,48.4 369.6,46.8 370.4,45.2 371.2,43.6 372,42 372.8,40.4 373.6,38.8 374.4,37.2 375.2,35.6 376,34 376.8,32.4 377.6,30.8 378.4,29.2 379.2,27.6 380,26 380.8,24.4 381.6,22.8 382.4,21.2 383.2,19.6 384,18 384.8,16.4 385.6,14.8 386.4,13.2' fill='none' stroke='#14213D' stroke-width='2.2' stroke-linejoin='round'/><text x='348' y='164' text-anchor='middle' font-size='14' font-weight='bold' fill='#14213D'>В</text></svg>",
      "options": {
        "left": [
          "А) график А",
          "Б) график Б",
          "В) график В"
        ],
        "right": [
          "1) y = x² + 4x + 3",
          "2) y = −3/x",
          "3) y = 2x − 1",
          "4) y = 3/x",
          "5) y = x² − 4x + 3"
        ]
      },
      "answer": "253",
      "unit": "",
      "tol": 0,
      "hints": [
        "Сначала определи вид каждого графика: прямая — линейная функция, парабола — квадратичная, гипербола — функция y = k/x.",
        "У гиперболы смотри, в каких четвертях ветви: при k > 0 — в I и III, при k < 0 — во II и IV. У параболы найди вершину или точки пересечения с осью Ox.",
        "Ветви гиперболы А — во II и IV четвертях, значит k < 0. Парабола Б пересекает ось Ox в точках 1 и 3. Прямая В проходит через точку (0; −1) и возрастает."
      ],
      "solution": "А — гипербола с ветвями во II и IV четвертях, k < 0: y = −3/x (точка (1; −3) лежит на графике). Б — парабола с вершиной (2; −1), пересекающая ось Ox в точках 1 и 3: y = x² − 4x + 3 = (x − 1)(x − 3); парабола y = x² + 4x + 3 пересекала бы ось в точках −1 и −3. В — возрастающая прямая через (0; −1) и (1; 1): y = 2x − 1. Ответ: 253.",
      "part2": false
    },
    {
      "id": "F2",
      "topic": "func",
      "kind": "match",
      "level": "базовый",
      "format": "задание 11 ОГЭ · знаки коэффициентов",
      "text": "На рисунках изображены графики функций вида y = kx + b. Установите соответствие между графиками и знаками коэффициентов k и b.",
      "code": null,
      "figure": "<svg viewBox='0 0 420 170' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M12 138 L12 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 138 L132 138' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M24 138 L24 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 126 L132 126' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M36 138 L36 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 114 L132 114' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M48 138 L48 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 102 L132 102' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M60 138 L60 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 90 L132 90' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M72 138 L72 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 78 L132 78' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M84 138 L84 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 66 L132 66' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M96 138 L96 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 54 L132 54' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M108 138 L108 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 42 L132 42' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M120 138 L120 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 30 L132 30' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M132 138 L132 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M12 18 L132 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M8.4 78 L134.4 78' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='141.6,78 134.6,80.8 134.6,75.2' fill='#14213D'/><path d='M72 141.6 L72 15.6' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='72,8.4 74.8,15.4 69.2,15.4' fill='#14213D'/><text x='139.2' y='92.4' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='82.8' y='15.6' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>y</text><polyline points='31.2,142.8 32,142 32.8,141.2 33.6,140.4 34.4,139.6 35.2,138.8 36,138 36.8,137.2 37.6,136.4 38.4,135.6 39.2,134.8 40,134 40.8,133.2 41.6,132.4 42.4,131.6 43.2,130.8 44,130 44.8,129.2 45.6,128.4 46.4,127.6 47.2,126.8 48,126 48.8,125.2 49.6,124.4 50.4,123.6 51.2,122.8 52,122 52.8,121.2 53.6,120.4 54.4,119.6 55.2,118.8 56,118 56.8,117.2 57.6,116.4 58.4,115.6 59.2,114.8 60,114 60.8,113.2 61.6,112.4 62.4,111.6 63.2,110.8 64,110 64.8,109.2 65.6,108.4 66.4,107.6 67.2,106.8 68,106 68.8,105.2 69.6,104.4 70.4,103.6 71.2,102.8 72,102 72.8,101.2 73.6,100.4 74.4,99.6 75.2,98.8 76,98 76.8,97.2 77.6,96.4 78.4,95.6 79.2,94.8 80,94 80.8,93.2 81.6,92.4 82.4,91.6 83.2,90.8 84,90 84.8,89.2 85.6,88.4 86.4,87.6 87.2,86.8 88,86 88.8,85.2 89.6,84.4 90.4,83.6 91.2,82.8 92,82 92.8,81.2 93.6,80.4 94.4,79.6 95.2,78.8 96,78 96.8,77.2 97.6,76.4 98.4,75.6 99.2,74.8 100,74 100.8,73.2 101.6,72.4 102.4,71.6 103.2,70.8 104,70 104.8,69.2 105.6,68.4 106.4,67.6 107.2,66.8 108,66 108.8,65.2 109.6,64.4 110.4,63.6 111.2,62.8 112,62 112.8,61.2 113.6,60.4 114.4,59.6 115.2,58.8 116,58 116.8,57.2 117.6,56.4 118.4,55.6 119.2,54.8 120,54 120.8,53.2 121.6,52.4 122.4,51.6 123.2,50.8 124,50 124.8,49.2 125.6,48.4 126.4,47.6 127.2,46.8 128,46 128.8,45.2 129.6,44.4 130.4,43.6 131.2,42.8 132,42' fill='none' stroke='#14213D' stroke-width='2.2' stroke-linejoin='round'/><text x='72' y='164' text-anchor='middle' font-size='14' font-weight='bold' fill='#14213D'>А</text><path d='M150 138 L150 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 138 L270 138' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M162 138 L162 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 126 L270 126' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M174 138 L174 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 114 L270 114' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M186 138 L186 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 102 L270 102' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M198 138 L198 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 90 L270 90' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M210 138 L210 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 78 L270 78' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M222 138 L222 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 66 L270 66' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M234 138 L234 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 54 L270 54' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M246 138 L246 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 42 L270 42' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M258 138 L258 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 30 L270 30' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M270 138 L270 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M150 18 L270 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M146.4 78 L272.4 78' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='279.6,78 272.6,80.8 272.6,75.2' fill='#14213D'/><path d='M210 141.6 L210 15.6' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='210,8.4 212.8,15.4 207.2,15.4' fill='#14213D'/><text x='277.2' y='92.4' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='220.8' y='15.6' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>y</text><polyline points='195.6,13.2 196.4,14.8 197.2,16.4 198,18 198.8,19.6 199.6,21.2 200.4,22.8 201.2,24.4 202,26 202.8,27.6 203.6,29.2 204.4,30.8 205.2,32.4 206,34 206.8,35.6 207.6,37.2 208.4,38.8 209.2,40.4 210,42 210.8,43.6 211.6,45.2 212.4,46.8 213.2,48.4 214,50 214.8,51.6 215.6,53.2 216.4,54.8 217.2,56.4 218,58 218.8,59.6 219.6,61.2 220.4,62.8 221.2,64.4 222,66 222.8,67.6 223.6,69.2 224.4,70.8 225.2,72.4 226,74 226.8,75.6 227.6,77.2 228.4,78.8 229.2,80.4 230,82 230.8,83.6 231.6,85.2 232.4,86.8 233.2,88.4 234,90 234.8,91.6 235.6,93.2 236.4,94.8 237.2,96.4 238,98 238.8,99.6 239.6,101.2 240.4,102.8 241.2,104.4 242,106 242.8,107.6 243.6,109.2 244.4,110.8 245.2,112.4 246,114 246.8,115.6 247.6,117.2 248.4,118.8 249.2,120.4 250,122 250.8,123.6 251.6,125.2 252.4,126.8 253.2,128.4 254,130 254.8,131.6 255.6,133.2 256.4,134.8 257.2,136.4 258,138 258.8,139.6 259.6,141.2 260.4,142.8' fill='none' stroke='#14213D' stroke-width='2.2' stroke-linejoin='round'/><text x='210' y='164' text-anchor='middle' font-size='14' font-weight='bold' fill='#14213D'>Б</text><path d='M288 138 L288 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 138 L408 138' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M300 138 L300 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 126 L408 126' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M312 138 L312 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 114 L408 114' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M324 138 L324 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 102 L408 102' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M336 138 L336 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 90 L408 90' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M348 138 L348 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 78 L408 78' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M360 138 L360 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 66 L408 66' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M372 138 L372 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 54 L408 54' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M384 138 L384 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 42 L408 42' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M396 138 L396 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 30 L408 30' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M408 138 L408 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M288 18 L408 18' stroke='#8FB0DA' stroke-width='0.6' fill='none'/><path d='M284.4 78 L410.4 78' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='417.6,78 410.6,80.8 410.6,75.2' fill='#14213D'/><path d='M348 141.6 L348 15.6' stroke='#14213D' stroke-width='1.2' fill='none'/><polygon points='348,8.4 350.8,15.4 345.2,15.4' fill='#14213D'/><text x='415.2' y='92.4' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>x</text><text x='358.8' y='15.6' text-anchor='middle' font-size='13' font-style='italic' fill='#14213D'>y</text><polyline points='288,60 288.8,60.4 289.6,60.8 290.4,61.2 291.2,61.6 292,62 292.8,62.4 293.6,62.8 294.4,63.2 295.2,63.6 296,64 296.8,64.4 297.6,64.8 298.4,65.2 299.2,65.6 300,66 300.8,66.4 301.6,66.8 302.4,67.2 303.2,67.6 304,68 304.8,68.4 305.6,68.8 306.4,69.2 307.2,69.6 308,70 308.8,70.4 309.6,70.8 310.4,71.2 311.2,71.6 312,72 312.8,72.4 313.6,72.8 314.4,73.2 315.2,73.6 316,74 316.8,74.4 317.6,74.8 318.4,75.2 319.2,75.6 320,76 320.8,76.4 321.6,76.8 322.4,77.2 323.2,77.6 324,78 324.8,78.4 325.6,78.8 326.4,79.2 327.2,79.6 328,80 328.8,80.4 329.6,80.8 330.4,81.2 331.2,81.6 332,82 332.8,82.4 333.6,82.8 334.4,83.2 335.2,83.6 336,84 336.8,84.4 337.6,84.8 338.4,85.2 339.2,85.6 340,86 340.8,86.4 341.6,86.8 342.4,87.2 343.2,87.6 344,88 344.8,88.4 345.6,88.8 346.4,89.2 347.2,89.6 348,90 348.8,90.4 349.6,90.8 350.4,91.2 351.2,91.6 352,92 352.8,92.4 353.6,92.8 354.4,93.2 355.2,93.6 356,94 356.8,94.4 357.6,94.8 358.4,95.2 359.2,95.6 360,96 360.8,96.4 361.6,96.8 362.4,97.2 363.2,97.6 364,98 364.8,98.4 365.6,98.8 366.4,99.2 367.2,99.6 368,100 368.8,100.4 369.6,100.8 370.4,101.2 371.2,101.6 372,102 372.8,102.4 373.6,102.8 374.4,103.2 375.2,103.6 376,104 376.8,104.4 377.6,104.8 378.4,105.2 379.2,105.6 380,106 380.8,106.4 381.6,106.8 382.4,107.2 383.2,107.6 384,108 384.8,108.4 385.6,108.8 386.4,109.2 387.2,109.6 388,110 388.8,110.4 389.6,110.8 390.4,111.2 391.2,111.6 392,112 392.8,112.4 393.6,112.8 394.4,113.2 395.2,113.6 396,114 396.8,114.4 397.6,114.8 398.4,115.2 399.2,115.6 400,116 400.8,116.4 401.6,116.8 402.4,117.2 403.2,117.6 404,118 404.8,118.4 405.6,118.8 406.4,119.2 407.2,119.6 408,120' fill='none' stroke='#14213D' stroke-width='2.2' stroke-linejoin='round'/><text x='348' y='164' text-anchor='middle' font-size='14' font-weight='bold' fill='#14213D'>В</text></svg>",
      "options": {
        "left": [
          "А) график А",
          "Б) график Б",
          "В) график В"
        ],
        "right": [
          "1) k > 0, b > 0",
          "2) k < 0, b > 0",
          "3) k > 0, b < 0",
          "4) k < 0, b < 0"
        ]
      },
      "answer": "324",
      "unit": "",
      "tol": 0,
      "hints": [
        "k — угловой коэффициент: при k > 0 прямая возрастает (идёт вверх слева направо), при k < 0 — убывает. b — ордината точки пересечения прямой с осью Oy.",
        "Для каждого графика ответь на два вопроса: прямая возрастает или убывает? Выше или ниже нуля она пересекает ось Oy?",
        "А возрастает и пересекает Oy ниже нуля. Б убывает и пересекает Oy выше нуля. В убывает и пересекает Oy ниже нуля."
      ],
      "solution": "А — прямая возрастает (k > 0) и пересекает ось Oy в точке (0; −2), b < 0 — вариант 3. Б — убывает (k < 0), пересекает Oy в точке (0; 3), b > 0 — вариант 2. В — убывает (k < 0), пересекает Oy в точке (0; −1), b < 0 — вариант 4. Ответ: 324.",
      "part2": false
    },
    {
      "id": "F3",
      "topic": "func",
      "kind": "number",
      "level": "базовый",
      "format": "задания 9, 11 ОГЭ · пересечение графиков",
      "text": "Найдите координаты точки пересечения прямых y = 4x − 9 и y = −3x + 5. В ответ запишите сумму абсциссы и ординаты этой точки.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 1,
      "unit": "",
      "tol": 0,
      "hints": [
        "В точке пересечения у обеих прямых одинаковые x и y. Приравняй правые части уравнений.",
        "4x − 9 = −3x + 5, откуда 7x = 14.",
        "x = 2. Подставь в любое из уравнений: y = 4·2 − 9 = −1."
      ],
      "solution": "1) 4x − 9 = −3x + 5 → 7x = 14 → x = 2. 2) y = 4·2 − 9 = −1; проверка по второй прямой: −3·2 + 5 = −1. 3) Точка пересечения (2; −1), сумма координат 2 + (−1) = 1. Ответ: 1.",
      "part2": false
    },
    {
      "id": "F4",
      "topic": "func",
      "kind": "number",
      "level": "базовый",
      "format": "задания 11, 22 ОГЭ · вершина параболы",
      "text": "Парабола y = x² + bx + 7 проходит через точку (2; −1). Найдите ординату вершины этой параболы.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": -2,
      "unit": "",
      "tol": 0,
      "hints": [
        "Если точка лежит на графике, её координаты обращают уравнение в верное равенство. Подставь x = 2, y = −1 и найди b.",
        "−1 = 4 + 2b + 7, значит b = −6. Абсцисса вершины параболы x₀ = −b/(2a).",
        "x₀ = 6/2 = 3; ордината вершины y₀ = 3² − 6·3 + 7."
      ],
      "solution": "Подставляем точку: −1 = 2² + 2b + 7, 2b = −12, b = −6. Парабола y = x² − 6x + 7, абсцисса вершины x₀ = −b/(2a) = 6/2 = 3, ордината y₀ = 9 − 18 + 7 = −2. Ответ: −2.",
      "part2": false
    },
    {
      "id": "F5",
      "topic": "func",
      "kind": "number",
      "level": "высокий",
      "format": "задание 22 ОГЭ · график с модулем",
      "text": "Постройте график функции y = x² − 6|x| + 5 и определите, при каком значении m прямая y = m имеет с графиком ровно три общие точки.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 5,
      "unit": "",
      "tol": 0,
      "hints": [
        "Раскрой модуль: при x ≥ 0 получается y = x² − 6x + 5, при x < 0 — y = x² + 6x + 5. Функция чётная, её график симметричен относительно оси Oy.",
        "Правая часть — кусок параболы с вершиной (3; −4), пересекающей ось Ox в точках 1 и 5, а ось Oy — в точке (0; 5). Левая часть — её зеркальное отражение. Двигай горизонтальную прямую y = m сверху вниз и считай точки пересечения.",
        "При m > 5 — две общие точки; при m = 5 прямая проходит через точку (0; 5) и ещё пересекает обе ветви; при −4 < m < 5 — четыре точки; при m = −4 — две."
      ],
      "solution": "При x ≥ 0: y = x² − 6x + 5 = (x − 3)² − 4 — часть параболы с вершиной (3; −4); при x < 0: y = (x + 3)² − 4 — часть параболы с вершиной (−3; −4). График похож на букву W: точка (0; 5) на оси Oy и минимумы −4 при x = ±3. Прямая y = m: при m < −4 общих точек нет; при m = −4 — две; при −4 < m < 5 — четыре; при m = 5 — три (x = 0 и x = ±6); при m > 5 — две. Ровно три общие точки — только при m = 5. Ответ: 5.",
      "part2": true,
      "criteria": [
        [
          2,
          "график построен верно, верно найдены искомые значения параметра"
        ],
        [
          1,
          "график построен верно, но искомые значения параметра найдены неверно или не найдены"
        ],
        [
          0,
          "решение не соответствует ни одному из критериев, перечисленных выше"
        ]
      ]
    },
    {
      "id": "S1",
      "topic": "seq",
      "kind": "number",
      "level": "базовый",
      "format": "задание 14 ОГЭ · арифметическая прогрессия",
      "text": "В зрительном зале 15 рядов. В первом ряду 22 кресла, а в каждом следующем — на 2 кресла больше, чем в предыдущем. Сколько всего кресел в зале?",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 540,
      "unit": "",
      "tol": 0,
      "hints": [
        "Числа кресел по рядам образуют арифметическую прогрессию: a₁ = 22, d = 2. Нужна сумма 15 её членов.",
        "Найди число кресел в последнем ряду: aₙ = a₁ + (n − 1)d, затем примени формулу суммы Sₙ = (a₁ + aₙ)·n/2.",
        "a₁₅ = 22 + 14·2 = 50; S₁₅ = (22 + 50)·15/2."
      ],
      "solution": "a₁ = 22, d = 2, n = 15. В последнем ряду a₁₅ = 22 + 14·2 = 50 кресел. S₁₅ = (22 + 50)·15/2 = 36·15 = 540. Ответ: 540.",
      "part2": false
    },
    {
      "id": "S2",
      "topic": "seq",
      "kind": "number",
      "level": "базовый",
      "format": "задание 14 ОГЭ · геометрическая прогрессия",
      "text": "При каждом прохождении через фильтр количество примеси в воде уменьшается вдвое. До очистки в 1 л воды было 240 мг примеси. Сколько миллиграммов примеси останется в 1 л воды после прохождения через пять фильтров?",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 7.5,
      "unit": "мг",
      "tol": 0,
      "hints": [
        "Количество примеси после каждого фильтра — члены геометрической прогрессии со знаменателем q = 1/2.",
        "После n фильтров остаётся 240·(1/2)ⁿ мг.",
        "Нужно 240 : 2⁵ = 240 : 32."
      ],
      "solution": "После каждого фильтра количество примеси умножается на 1/2. После пяти фильтров: 240·(1/2)⁵ = 240/32 = 7,5 мг. По шагам: 120, 60, 30, 15, 7,5. Ответ: 7,5.",
      "part2": false
    },
    {
      "id": "S3",
      "topic": "seq",
      "kind": "number",
      "level": "базовый",
      "format": "задание 14 ОГЭ · члены прогрессии",
      "text": "Выписаны первые несколько членов арифметической прогрессии: −32; −27; −22; … Найдите первый положительный член этой прогрессии.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 3,
      "unit": "",
      "tol": 0,
      "hints": [
        "Найди разность прогрессии: d = a₂ − a₁.",
        "d = 5, aₙ = −32 + 5(n − 1). Реши неравенство aₙ > 0 и найди наименьшее натуральное n.",
        "5(n − 1) > 32 → n − 1 > 6,4 → n = 8. Осталось вычислить a₈."
      ],
      "solution": "d = −27 − (−32) = 5, aₙ = −32 + 5(n − 1). Условие aₙ > 0: 5(n − 1) > 32, n − 1 > 6,4, наименьшее n = 8. a₈ = −32 + 5·7 = 3 (а предыдущий член a₇ = −2 ещё отрицательный). Ответ: 3.",
      "part2": false
    },
    {
      "id": "S4",
      "topic": "seq",
      "kind": "number",
      "level": "базовый",
      "format": "задание 10 ОГЭ · классическая вероятность",
      "text": "В коробке 40 одинаковых на вид ручек: 14 синих, 18 чёрных, остальные — красные. Найдите вероятность того, что случайно взятая из коробки ручка окажется красной.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 0.2,
      "unit": "",
      "tol": 0,
      "hints": [
        "Вероятность = число благоприятных исходов / число всех равновозможных исходов.",
        "Сначала найди, сколько в коробке красных ручек.",
        "Красных 40 − 14 − 18 = 8; P = 8/40."
      ],
      "solution": "Красных ручек 40 − 14 − 18 = 8. Любую из 40 ручек можно вытащить с равными шансами, поэтому P = 8/40 = 0,2. Ответ: 0,2.",
      "part2": false
    },
    {
      "id": "S5",
      "topic": "seq",
      "kind": "number",
      "level": "базовый",
      "format": "задание 10 ОГЭ · перебор исходов",
      "text": "Симметричную монету бросают три раза. Найдите вероятность того, что орёл ни разу не выпадет в двух бросках подряд.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": 0.625,
      "unit": "",
      "tol": 0,
      "hints": [
        "Выпиши все равновозможные исходы трёх бросков: каждый бросок даёт О (орёл) или Р (решку). Всего 2·2·2 = 8 исходов.",
        "Вычеркни исходы, в которых два орла стоят рядом: ООО, ООР, РОО.",
        "Остались ОРО, ОРР, РОР, РРО, РРР — 5 исходов из 8."
      ],
      "solution": "1) Исходы: ООО, ООР, ОРО, ОРР, РОО, РОР, РРО, РРР — всего 8, все равновозможны. 2) Два орла подряд есть в исходах ООО, ООР, РОО — 3 исхода. 3) Подходят остальные 8 − 3 = 5 исходов: ОРО, ОРР, РОР, РРО, РРР. P = 5/8 = 0,625. Ответ: 0,625.",
      "part2": false
    },
    {
      "id": "T1",
      "topic": "tri",
      "kind": "number",
      "level": "базовый",
      "format": "задание 15 ОГЭ · прямоугольный треугольник",
      "text": "В треугольнике ABC угол C равен 90°, AB = 45, cos B = 0,4. Найдите BC.",
      "code": null,
      "figure": "<svg viewBox='0 0 340 180' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><polygon points='292,150 40,40 40,150' fill='none' stroke='#14213D' stroke-width='2' stroke-linejoin='round'/><polyline points='51,150 51,139 40,139' fill='none' stroke='#14213D' stroke-width='1.3' stroke-linejoin='round'/><text x='306.7' y='158.1' text-anchor='middle' fill='#14213D'>A</text><text x='28.5' y='35.4' text-anchor='middle' fill='#14213D'>B</text><text x='26.2' y='160.8' text-anchor='middle' fill='#14213D'>C</text></svg>",
      "options": null,
      "answer": 18,
      "unit": "",
      "tol": 0,
      "hints": [
        "Косинус острого угла прямоугольного треугольника — отношение прилежащего катета к гипотенузе.",
        "Для угла B прилежащий катет — BC, гипотенуза — AB: cos B = BC/AB.",
        "BC = AB·cos B = 45·0,4."
      ],
      "solution": "1) В прямоугольном треугольнике ABC гипотенуза — AB, катет BC прилежит к углу B, поэтому cos B = BC/AB. 2) BC = AB·cos B = 45·0,4 = 18. 3) Проверка: 18/45 = 0,4. Ответ: 18.",
      "part2": false
    },
    {
      "id": "T2",
      "topic": "tri",
      "kind": "number",
      "level": "базовый",
      "format": "задание 15 ОГЭ · углы треугольника",
      "text": "В треугольнике ABC угол B равен 64°, угол C равен 38°, AD — биссектриса. Найдите угол ADB. Ответ дайте в градусах.",
      "code": null,
      "figure": "<svg viewBox='0 0 360 220' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><polygon points='117.3,31.6 40,190 320,190' fill='none' stroke='#14213D' stroke-width='2' stroke-linejoin='round'/><path d='M117.3 31.6 L153.8 190' stroke='#14213D' stroke-width='2' fill='none'/><path d='M105.9 55 A26 26 0 0 0 123.1 56.9' fill='none' stroke='#14213D' stroke-width='1.5'/><path d='M123.1 56.9 A26 26 0 0 0 137.7 47.6' fill='none' stroke='#14213D' stroke-width='1.5'/><path d='M104.1 58.6 A30 30 0 0 0 124 60.8' fill='none' stroke='#14213D' stroke-width='1.5'/><path d='M124 60.8 A30 30 0 0 0 140.9 50.1' fill='none' stroke='#14213D' stroke-width='1.5'/><path d='M64 190 A24 24 0 0 0 50.5 168.4' fill='none' stroke='#14213D' stroke-width='1.5'/><path d='M297.9 172.8 A28 28 0 0 0 292 190' fill='none' stroke='#14213D' stroke-width='1.5'/><text x='74' y='182' font-size='13' fill='#4F5D78'>64°</text><text x='282' y='182' text-anchor='end' font-size='13' fill='#4F5D78'>38°</text><text x='111.7' y='22.7' text-anchor='middle' fill='#14213D'>A</text><text x='26.3' y='201.1' text-anchor='middle' fill='#14213D'>B</text><text x='334.3' y='199.7' text-anchor='middle' fill='#14213D'>C</text><text x='153.8' y='210' text-anchor='middle' fill='#14213D'>D</text></svg>",
      "options": null,
      "answer": 77,
      "unit": "°",
      "tol": 0,
      "hints": [
        "Сумма углов треугольника равна 180°. Сначала найди угол A всего треугольника.",
        "Угол A = 180° − 64° − 38° = 78°, биссектриса делит его пополам. Теперь рассмотри треугольник ABD.",
        "Угол BAD = 39°; угол ADB = 180° − 64° − 39°."
      ],
      "solution": "Угол A = 180° − 64° − 38° = 78°. AD — биссектриса, поэтому угол BAD = 78° : 2 = 39°. В треугольнике ABD: угол ADB = 180° − 64° − 39° = 77°. Ответ: 77.",
      "part2": false
    },
    {
      "id": "T3",
      "topic": "tri",
      "kind": "number",
      "level": "базовый",
      "format": "задание 17 ОГЭ · трапеция",
      "text": "Основания равнобедренной трапеции равны 6 и 22, а боковая сторона равна 17. Найдите площадь трапеции.",
      "code": null,
      "figure": "<svg viewBox='0 0 345 225' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><polygon points='50,195 138,30 204,30 292,195' fill='none' stroke='#14213D' stroke-width='2' stroke-linejoin='round'/><text x='36.2' y='205.8' text-anchor='middle' fill='#14213D'>A</text><text x='128' y='24' text-anchor='middle' fill='#14213D'>B</text><text x='214' y='24' text-anchor='middle' fill='#14213D'>C</text><text x='305.8' y='205.8' text-anchor='middle' fill='#14213D'>D</text><text x='171' y='23' text-anchor='middle' fill='#4F5D78'>6</text><text x='171' y='213' text-anchor='middle' fill='#4F5D78'>22</text><text x='80' y='109.5' text-anchor='middle' fill='#4F5D78'>17</text><text x='262' y='109.5' text-anchor='middle' fill='#4F5D78'>17</text></svg>",
      "options": null,
      "answer": 210,
      "unit": "",
      "tol": 0,
      "hints": [
        "Площадь трапеции S = (a + b)/2·h. Неизвестна высота — опусти её из вершины меньшего основания.",
        "В равнобедренной трапеции высота отсекает от большего основания отрезок (22 − 6)/2 = 8. Высота — катет прямоугольного треугольника с гипотенузой 17.",
        "h = √(17² − 8²) = 15; S = (6 + 22)/2·15."
      ],
      "solution": "1) Опустим высоту BH на основание AD. В равнобедренной трапеции AH = (AD − BC)/2 = (22 − 6)/2 = 8. 2) Из прямоугольного треугольника ABH: BH = √(AB² − AH²) = √(289 − 64) = √225 = 15. 3) S = (6 + 22)/2·15 = 14·15 = 210. Ответ: 210.",
      "part2": false
    },
    {
      "id": "T4",
      "topic": "tri",
      "kind": "number",
      "level": "базовый",
      "format": "задание 17 ОГЭ · ромб",
      "text": "Сторона ромба ABCD равна 17, а диагональ AC равна 30. Найдите площадь ромба.",
      "code": null,
      "figure": "<svg viewBox='0 0 300 185' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><polygon points='30,100 150,50 270,100 150,150' fill='none' stroke='#14213D' stroke-width='2' stroke-linejoin='round'/><path d='M30 100 L270 100' stroke='#8FB0DA' stroke-width='1.5' stroke-dasharray='6 4' fill='none'/><path d='M150 50 L150 150' stroke='#8FB0DA' stroke-width='1.5' stroke-dasharray='6 4' fill='none'/><text x='15' y='105' text-anchor='middle' fill='#14213D'>A</text><text x='150' y='43' text-anchor='middle' fill='#14213D'>B</text><text x='285' y='105' text-anchor='middle' fill='#14213D'>C</text><text x='150' y='167' text-anchor='middle' fill='#14213D'>D</text><text x='85.4' y='68.9' text-anchor='middle' fill='#4F5D78'>17</text></svg>",
      "options": null,
      "answer": 240,
      "unit": "",
      "tol": 0,
      "hints": [
        "Диагонали ромба перпендикулярны и точкой пересечения делятся пополам. Площадь ромба равна половине произведения диагоналей.",
        "Пусть O — точка пересечения диагоналей. В прямоугольном треугольнике AOB гипотенуза AB = 17, катет AO = 15. Найди BO.",
        "BO = √(289 − 225) = 8, значит BD = 16; S = 30·16/2."
      ],
      "solution": "Пусть O — точка пересечения диагоналей. AO = 30 : 2 = 15, треугольник AOB прямоугольный, BO = √(17² − 15²) = √64 = 8, BD = 16. S = AC·BD/2 = 30·16/2 = 240. Ответ: 240.",
      "part2": false
    },
    {
      "id": "T5",
      "topic": "tri",
      "kind": "number",
      "level": "повышенный",
      "format": "задание 23 ОГЭ · вычисления в треугольнике",
      "text": "Основание равнобедренного треугольника равно 18, а высота, проведённая к основанию, равна 12. Найдите радиус окружности, вписанной в этот треугольник.",
      "code": null,
      "figure": "<svg viewBox='0 0 300 205' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><polygon points='40,175 148,31 256,175' fill='none' stroke='#14213D' stroke-width='2' stroke-linejoin='round'/><path d='M148 31 L148 175' stroke='#8FB0DA' stroke-width='1.5' stroke-dasharray='6 4' fill='none'/><polyline points='157,175 157,166 148,166' fill='none' stroke='#8FB0DA' stroke-width='1.3' stroke-linejoin='round'/><circle cx='148' cy='121' r='54' fill='none' stroke='#14213D' stroke-width='1.5'/><text x='26.3' y='186.1' text-anchor='middle' fill='#14213D'>A</text><text x='148' y='21' text-anchor='middle' fill='#14213D'>B</text><text x='269.7' y='186.1' text-anchor='middle' fill='#14213D'>C</text><text x='148' y='195' text-anchor='middle' fill='#14213D'>H</text></svg>",
      "options": null,
      "answer": 4.5,
      "unit": "",
      "tol": 0,
      "hints": [
        "Радиус вписанной окружности: r = S/p, где S — площадь треугольника, p — полупериметр.",
        "Высота к основанию равнобедренного треугольника — ещё и медиана: она делит основание пополам, на отрезки по 9. Найди боковую сторону по теореме Пифагора.",
        "Боковая сторона √(9² + 12²) = 15; S = 18·12/2 = 108; p = (15 + 15 + 18)/2 = 24."
      ],
      "solution": "Пусть ABC — треугольник с основанием AC = 18, BH = 12 — высота. В равнобедренном треугольнике высота к основанию является медианой, AH = 9. По теореме Пифагора AB = √(9² + 12²) = √225 = 15 = BC. Площадь S = AC·BH/2 = 18·12/2 = 108, полупериметр p = (15 + 15 + 18)/2 = 24. Радиус вписанной окружности r = S/p = 108/24 = 4,5. Ответ: 4,5.",
      "part2": true
    },
    {
      "id": "T6",
      "topic": "tri",
      "kind": "number",
      "level": "высокий",
      "format": "задание 25 ОГЭ · трапеция и площади",
      "text": "Диагонали трапеции ABCD с основаниями BC и AD пересекаются в точке O. Площадь треугольника BOC равна 8, а площадь треугольника AOB равна 12. Найдите площадь трапеции.",
      "code": null,
      "figure": "<svg viewBox='0 0 360 200' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><polygon points='90,50 186,98 290,50' fill='#E3ECF7' stroke='none' stroke-width='0' stroke-linejoin='round'/><polygon points='30,170 186,98 90,50' fill='#E3ECF7' stroke='none' stroke-width='0' stroke-linejoin='round'/><polygon points='30,170 90,50 290,50 330,170' fill='none' stroke='#14213D' stroke-width='2' stroke-linejoin='round'/><path d='M30 170 L290 50' stroke='#14213D' stroke-width='1.5' fill='none'/><path d='M90 50 L330 170' stroke='#14213D' stroke-width='1.5' fill='none'/><text x='188.7' y='71' text-anchor='middle' font-size='14' fill='#4F5D78'>8</text><text x='102' y='111' text-anchor='middle' font-size='14' fill='#4F5D78'>12</text><text x='16' y='180.3' text-anchor='middle' fill='#14213D'>A</text><text x='80' y='46' text-anchor='middle' fill='#14213D'>B</text><text x='302.9' y='47.3' text-anchor='middle' fill='#14213D'>C</text><text x='343.8' y='180.9' text-anchor='middle' fill='#14213D'>D</text><text x='186' y='120' text-anchor='middle' fill='#14213D'>O</text></svg>",
      "options": null,
      "answer": 50,
      "unit": "",
      "tol": 0,
      "hints": [
        "Треугольники с общей вершиной, основания которых лежат на одной прямой, относятся по площади как эти основания. Сравни треугольники BOC и COD: у них общая вершина C, а основания BO и OD лежат на прямой BD.",
        "Треугольники ABD и ACD равновелики (общее основание AD, равные высоты), поэтому S(COD) = S(AOB) = 12. Тогда BO : OD = S(BOC) : S(COD) = 8 : 12 = 2 : 3.",
        "Треугольники AOB и AOD имеют общую вершину A: S(AOD) = S(AOB)·OD/BO = 12·3/2 = 18. Площадь трапеции = 8 + 12 + 12 + 18."
      ],
      "solution": "1) Треугольники ABD и ACD имеют общее основание AD и равные высоты (расстояние между прямыми BC и AD), значит, они равновелики. Вычитая из обоих S(AOD), получаем S(COD) = S(AOB) = 12. 2) У треугольников BOC и COD общая высота из вершины C, поэтому BO : OD = S(BOC) : S(COD) = 8 : 12 = 2 : 3. 3) У треугольников AOB и AOD общая высота из вершины A, поэтому S(AOD) = S(AOB)·OD/BO = 12·3/2 = 18. 4) Площадь трапеции: 8 + 12 + 12 + 18 = 50. Проверка: треугольники BOC и DOA подобны с коэффициентом BO : OD = 2 : 3, и отношение их площадей 8 : 18 = 4 : 9 = (2/3)². Ответ: 50.",
      "part2": true
    },
    {
      "id": "C1",
      "topic": "circ",
      "kind": "number",
      "level": "базовый",
      "format": "задание 16 ОГЭ · углы и окружность",
      "text": "Отрезок AC — диаметр окружности с центром O, точка B лежит на окружности, угол ACB равен 28°. Найдите угол ABO. Ответ дайте в градусах.",
      "code": null,
      "figure": "<svg viewBox='0 0 340 225' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><circle cx='170' cy='115' r='90' fill='none' stroke='#14213D' stroke-width='2'/><polygon points='80,115 119.7,40.4 260,115' fill='none' stroke='#14213D' stroke-width='2' stroke-linejoin='round'/><path d='M170 115 L119.7 40.4' stroke='#14213D' stroke-width='1.5' fill='none'/><circle cx='170' cy='115' r='3' fill='#14213D'/><path d='M226 115 A34 34 0 0 1 230 99' fill='none' stroke='#14213D' stroke-width='1.5'/><text x='212' y='109' text-anchor='end' font-size='13' fill='#4F5D78'>28°</text><text x='66' y='120' text-anchor='middle' fill='#14213D'>A</text><text x='274' y='120' text-anchor='middle' fill='#14213D'>C</text><text x='170' y='135' text-anchor='middle' fill='#14213D'>O</text><text x='111.8' y='33.8' text-anchor='middle' fill='#14213D'>B</text></svg>",
      "options": null,
      "answer": 62,
      "unit": "°",
      "tol": 0,
      "hints": [
        "OA = OB = OC — радиусы, поэтому треугольники AOB и BOC равнобедренные.",
        "Угол ABC опирается на диаметр, значит он прямой. В равнобедренном треугольнике BOC угол OBC равен углу OCB.",
        "Угол OBC = 28°, тогда угол ABO = 90° − 28°."
      ],
      "solution": "Вписанный угол ABC опирается на диаметр AC, поэтому он равен 90°. Треугольник BOC равнобедренный (OB = OC), значит угол OBC = угол OCB = 28°. Угол ABO = 90° − 28° = 62°. Другой способ: центральный угол AOB вдвое больше вписанного угла ACB, то есть 56°; треугольник AOB равнобедренный, угол ABO = (180° − 56°) : 2 = 62°. Ответ: 62.",
      "part2": false
    },
    {
      "id": "C2",
      "topic": "circ",
      "kind": "number",
      "level": "базовый",
      "format": "задание 16 ОГЭ · касательная",
      "text": "Из точки A проведена касательная AB к окружности с центром O (B — точка касания). Найдите AB, если радиус окружности равен 12, а AO = 37.",
      "code": null,
      "figure": "<svg viewBox='0 0 285 190' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><circle cx='90' cy='110' r='52' fill='none' stroke='#14213D' stroke-width='2'/><path d='M90 110 L250.3 110' stroke='#14213D' stroke-width='1.5' fill='none'/><path d='M90 110 L106.9 60.8' stroke='#14213D' stroke-width='1.5' fill='none'/><path d='M250.3 110 L106.9 60.8' stroke='#14213D' stroke-width='2' fill='none'/><path d='M106.9 60.8 L67.1 47.2' stroke='#14213D' stroke-width='2' fill='none'/><polyline points='103.9,69.3 112.5,72.2 115.4,63.7' fill='none' stroke='#14213D' stroke-width='1.3' stroke-linejoin='round'/><circle cx='90' cy='110' r='3' fill='#14213D'/><circle cx='250.3' cy='110' r='3' fill='#14213D'/><text x='86' y='130' text-anchor='middle' fill='#14213D'>O</text><text x='264.3' y='115' text-anchor='middle' fill='#14213D'>A</text><text x='113.9' y='51.8' text-anchor='middle' fill='#14213D'>B</text></svg>",
      "options": null,
      "answer": 35,
      "unit": "",
      "tol": 0,
      "hints": [
        "Касательная перпендикулярна радиусу, проведённому в точку касания.",
        "Треугольник OBA прямоугольный с прямым углом B, AO — его гипотенуза.",
        "AB = √(37² − 12²) = √(1369 − 144)."
      ],
      "solution": "1) Радиус OB перпендикулярен касательной AB, поэтому треугольник OBA прямоугольный с прямым углом B и гипотенузой AO. 2) По теореме Пифагора AB² = AO² − OB² = 1369 − 144 = 1225. 3) AB = √1225 = 35. Ответ: 35.",
      "part2": false
    },
    {
      "id": "C3",
      "topic": "circ",
      "kind": "number",
      "level": "базовый",
      "format": "задание 18 ОГЭ · площадь на клетчатой бумаге",
      "text": "На клетчатой бумаге с размером клетки 1 × 1 изображена трапеция. Найдите её площадь.",
      "code": null,
      "figure": "<svg viewBox='0 0 340 210' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M20 15 L20 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M50 15 L50 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M80 15 L80 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M110 15 L110 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M140 15 L140 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M170 15 L170 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M200 15 L200 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M230 15 L230 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M260 15 L260 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M290 15 L290 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M320 15 L320 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 15 L320 15' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 45 L320 45' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 75 L320 75' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 105 L320 105' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 135 L320 135' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 165 L320 165' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 195 L320 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><polygon points='50,165 290,165 200,45 110,45' fill='none' stroke='#14213D' stroke-width='2.5' stroke-linejoin='round'/></svg>",
      "options": null,
      "answer": 22,
      "unit": "",
      "tol": 0,
      "hints": [
        "Площадь трапеции равна полусумме оснований, умноженной на высоту. Все длины считай по клеткам.",
        "Основания горизонтальны: посчитай клетки на нижнем и на верхнем основании; высота — расстояние между ними по вертикали.",
        "Основания 8 и 3, высота 4: S = (8 + 3)/2·4."
      ],
      "solution": "Нижнее основание — 8 клеток, верхнее — 3 клетки, высота — 4 клетки. S = (8 + 3)/2·4 = 22. Ответ: 22.",
      "part2": false
    },
    {
      "id": "C4",
      "topic": "circ",
      "kind": "number",
      "level": "базовый",
      "format": "задание 18 ОГЭ · угол на клетчатой бумаге",
      "text": "На клетчатой бумаге изображён треугольник ABC. Найдите тангенс угла BAC.",
      "code": null,
      "figure": "<svg viewBox='0 0 340 210' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><path d='M20 15 L20 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M50 15 L50 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M80 15 L80 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M110 15 L110 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M140 15 L140 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M170 15 L170 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M200 15 L200 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M230 15 L230 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M260 15 L260 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M290 15 L290 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M320 15 L320 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 15 L320 15' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 45 L320 45' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 75 L320 75' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 105 L320 105' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 135 L320 135' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 165 L320 165' stroke='#8FB0DA' stroke-width='1' fill='none'/><path d='M20 195 L320 195' stroke='#8FB0DA' stroke-width='1' fill='none'/><polygon points='50,165 110,45 290,165' fill='none' stroke='#14213D' stroke-width='2.5' stroke-linejoin='round'/><path d='M72 165 A22 22 0 0 0 59.8 145.3' fill='none' stroke='#14213D' stroke-width='1.8'/><rect x='30.7' y='164' width='12.7' height='14' fill='#fff'/><text x='37' y='175.2' text-anchor='middle' fill='#14213D'>A</text><rect x='97.4' y='26.3' width='12.7' height='14' fill='#fff'/><text x='103.7' y='37.5' text-anchor='middle' fill='#14213D'>B</text><rect x='297.1' y='162.6' width='12.7' height='14' fill='#fff'/><text x='303.5' y='173.8' text-anchor='middle' fill='#14213D'>C</text></svg>",
      "options": null,
      "answer": 2,
      "unit": "",
      "tol": 0,
      "hints": [
        "Тангенс острого угла прямоугольного треугольника — отношение противолежащего катета к прилежащему. Построй прямоугольный треугольник по линиям сетки.",
        "Опусти из B перпендикуляр на AC — он идёт по вертикальной линии сетки. Получится прямоугольный треугольник с вершиной A.",
        "Противолежащий углу A катет — 4 клетки, прилежащий — 2 клетки."
      ],
      "solution": "Пусть H — основание перпендикуляра из B на AC, BH идёт по линии сетки. В прямоугольном треугольнике ABH: BH = 4, AH = 2. tg BAC = BH/AH = 4/2 = 2. Ответ: 2.",
      "part2": false
    },
    {
      "id": "C5",
      "topic": "circ",
      "kind": "digits",
      "level": "базовый",
      "format": "задание 19 ОГЭ · верные утверждения",
      "text": "Какие из следующих утверждений верны?\n1) Диагонали ромба перпендикулярны.\n2) Сумма углов любого выпуклого четырёхугольника равна 180°.\n3) Если в треугольнике один угол тупой, то два других угла острые.\nВ ответ запишите номера выбранных утверждений без пробелов, запятых и других дополнительных символов.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": "13",
      "unit": "",
      "tol": 0,
      "hints": [
        "Проверь каждое утверждение отдельно: вспомни нужное свойство или теорему, а для подозрительного утверждения попробуй придумать контрпример.",
        "Четырёхугольник диагональю делится на два треугольника. Чему тогда равна сумма его углов?",
        "Сумма углов четырёхугольника 360°, поэтому утверждение 2 неверно. Тупой угол больше 90°, и на два остальных угла остаётся меньше 90°."
      ],
      "solution": "1) Верно: диагонали ромба перпендикулярны (и делят его углы пополам). 2) Неверно: диагональ делит четырёхугольник на два треугольника, сумма углов 2·180° = 360°. 3) Верно: тупой угол больше 90°, поэтому сумма двух других меньше 90° и каждый из них острый. Ответ: 13.",
      "part2": false
    },
    {
      "id": "C6",
      "topic": "circ",
      "kind": "digits",
      "level": "базовый",
      "format": "задание 19 ОГЭ · верные утверждения",
      "text": "Какие из следующих утверждений верны?\n1) Центр окружности, описанной около треугольника, — точка пересечения его биссектрис.\n2) Вписанный угол, опирающийся на диаметр, прямой.\n3) Касательная к окружности перпендикулярна радиусу, проведённому в точку касания.\nВ ответ запишите номера выбранных утверждений без пробелов, запятых и других дополнительных символов.",
      "code": null,
      "figure": null,
      "options": null,
      "answer": "23",
      "unit": "",
      "tol": 0,
      "hints": [
        "Вспомни, какие замечательные точки треугольника связаны с описанной и вписанной окружностями.",
        "Центр описанной окружности равноудалён от вершин треугольника, а центр вписанной — от его сторон. Какие линии состоят из таких точек?",
        "Биссектрисы пересекаются в центре вписанной окружности, а центр описанной — точка пересечения серединных перпендикуляров. Утверждения 2 и 3 — известные теоремы."
      ],
      "solution": "1) Неверно: центр описанной окружности — точка пересечения серединных перпендикуляров к сторонам; биссектрисы пересекаются в центре вписанной окружности. 2) Верно: вписанный угол равен половине дуги, на которую опирается, а диаметр стягивает дугу 180°. 3) Верно — это свойство касательной. Ответ: 23.",
      "part2": false
    },
    {
      "id": "C7",
      "topic": "circ",
      "kind": "text",
      "level": "повышенный",
      "format": "задание 24 ОГЭ · доказательство",
      "text": "Хорды KL и MN окружности пересекаются в точке P, причём PK = PM. Докажите, что прямые KM и LN параллельны.",
      "code": null,
      "figure": "<svg viewBox='0 0 330 230' xmlns='http://www.w3.org/2000/svg' font-family='Arial' font-size='14'><circle cx='165' cy='112' r='90' fill='none' stroke='#14213D' stroke-width='2'/><path d='M80.4 81.2 L228.1 176.1' stroke='#14213D' stroke-width='2' fill='none'/><path d='M233.9 54.1 L127.6 193.9' stroke='#14213D' stroke-width='2' fill='none'/><path d='M80.4 81.2 L233.9 54.1' stroke='#14213D' stroke-width='1.5' fill='none'/><path d='M228.1 176.1 L127.6 193.9' stroke='#14213D' stroke-width='1.5' fill='none'/><circle cx='80.4' cy='81.2' r='3' fill='#14213D'/><text x='66.3' y='81.1' text-anchor='middle' fill='#14213D'>K</text><circle cx='228.1' cy='176.1' r='3' fill='#14213D'/><text x='238.6' y='191.8' text-anchor='middle' fill='#14213D'>L</text><circle cx='233.9' cy='54.1' r='3' fill='#14213D'/><text x='245.4' y='49.5' text-anchor='middle' fill='#14213D'>M</text><circle cx='127.6' cy='193.9' r='3' fill='#14213D'/><text x='121.4' y='212.5' text-anchor='middle' fill='#14213D'>N</text><circle cx='169.7' cy='138.6' r='3' fill='#14213D'/><text x='183.7' y='142.6' text-anchor='middle' fill='#14213D'>P</text></svg>",
      "options": null,
      "answer": "Треугольник KPM равнобедренный (PK = PM), поэтому ∠PKM = ∠PMK. Вписанные углы KMN и KLN опираются на одну и ту же дугу KN, значит, ∠KMN = ∠KLN. Точка P лежит на хордах MN и KL, поэтому ∠KMN = ∠PMK и ∠KLN = ∠PLN. Получаем ∠MKL = ∠PKM = ∠PMK = ∠KLN. Углы MKL и KLN — накрест лежащие при прямых KM и LN и секущей KL (точки M и N лежат по разные стороны от прямой KL, так как хорда MN пересекает хорду KL). Накрест лежащие углы равны, следовательно, KM ∥ LN, что и требовалось доказать.",
      "unit": "",
      "tol": 0,
      "hints": [
        "Отметь на рисунке равные углы. Начни с равнобедренного треугольника KPM.",
        "∠PKM = ∠PMK. Найди вписанный угол, который опирается на ту же дугу KN, что и угол KMN.",
        "∠KMN = ∠KLN (опираются на дугу KN). Тогда ∠MKL = ∠KLN — это накрест лежащие углы при прямых KM, LN и секущей KL."
      ],
      "solution": "1) PK = PM, поэтому треугольник KPM равнобедренный и ∠PKM = ∠PMK. 2) Вписанные углы KMN и KLN опираются на одну дугу KN, поэтому ∠KMN = ∠KLN. Точка P лежит на хордах KL и MN, значит, ∠KMN = ∠PMK и ∠KLN = ∠PLN. 3) Отсюда ∠MKL = ∠PKM = ∠PMK = ∠KLN. 4) Углы MKL и KLN — накрест лежащие при прямых KM и LN и секущей KL: точки M и N лежат по разные стороны от KL, так как хорда MN пересекает хорду KL. Накрест лежащие углы равны, следовательно, KM ∥ LN. Замечание: значит, KMLN — вписанная, то есть равнобедренная, трапеция, а из подобия треугольников PKM и PLN следует ещё и PL = PN.",
      "part2": true
    }
  ]
};

// Для скриптов проверки (Node.js); в браузере эта строка ничего не делает
if (typeof module !== "undefined") {
    module.exports = BANKS["oge_math"];
}
