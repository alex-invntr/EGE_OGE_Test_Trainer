# Проверка банка ОГЭ · русский язык (banks/oge_russian.js).
# Лингвистику кодом не пересчитать, поэтому скрипт сверяет внутреннюю согласованность:
# здесь хранятся «правильные» данные (расставленные запятые, полные написания слов,
# разбор грамматических основ, слова для выписывания), из них вычисляется ответ
# и сравнивается с answer в банке. Для остальных задач эталон None, но общие
# проверки (нумерация предложений, ссылки на предложения, объём образцов) выполняются.
# Запуск из корня проекта: python -I tools/check_oge_russian.py banks/oge_russian.js

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import load_bank, norm_word, report

DEFAULT_BANK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "banks", "oge_russian.js")
ERROR_PREFIX = "ОШИБКА: "
MIN_TEXT_WORDS = 70
WORD_RE = re.compile(r"[а-яё]+")
NUMBER_MARK_RE = re.compile(r"\((\d+)\)")
GAP_SPLIT_RE = re.compile(r"\.\.\((\d+)\)")
GAP_TOKEN_RE = re.compile(r"[А-Яа-яЁё]*(?:\.\.\(\d+\)[А-Яа-яЁё]*)+")
POSITION_RE = re.compile(r",?\^(\d+)")
COMMA_POSITION_RE = re.compile(r",\^(\d+)")
NE_RE = re.compile(r"\(не\)([а-яё]+)", re.IGNORECASE)
OPTION_BASIS_RE = re.compile(r"\s*(.+?)\s*\(предложение (\d+)\)\s*")
SENTENCE_REF_RE = re.compile(r"[Пп]редложени[а-я]* (\d+)(?:–(\d+))?")

# Задание 5: верно расставленные запятые; ^N — позиция N, запятая перед маркером — запятая нужна
COMMAS = {
    "P1": "Когда мы вышли из дома,^1 небо уже светлело. Дорога,^2 петлявшая между холмами,^3 "
          "вела к озеру,^4 и мы шли по ней молча. Над водой поднимался туман,^5 а в камышах^6 "
          "уже просыпались утки^7 и негромко перекликались.",
    "P2": "Ребята,^1 завтра мы,^2 наверное,^3 отправимся в поход. Возьмите с собой тёплые вещи,^4 "
          "фонарик^5 и запас воды. Погода,^6 по словам синоптиков,^7 будет ясной,^8 но прохладной.",
    "P3": "Ветер стих,^1 и озеро,^2 ещё недавно бурное,^3 успокоилось. Рыбаки,^4 вытащив лодки "
          "на берег,^5 развели костёр^6 и сели ужинать. Старик рассказывал,^7 что в молодости "
          "ловил здесь огромных щук^8 и что однажды^9 его лодку чуть не перевернула рыба.",
    "P4": "Мы долго шли по тропинке,^1 которая вела через густой ельник,^2 пока впереди не "
          "показалась поляна. На ней стоял старый дом,^3 окна которого были заколочены досками,^4 "
          "а крыльцо^5 поросло травой. Казалось,^6 что здесь никто не жил уже много лет^7 и что "
          "хозяева давно забыли сюда дорогу.",
}

# Задание 7: искомая буква (буквы) и полные верные написания слов с пропусками — по порядку
GAPS = {
    "O4": ("и", ["выплывает", "скользят", "засветилась", "запели", "камышах", "замираем",
                 "тишину", "серебристая", "пробирается"]),
    "O5": ("е", ["встретил", "шелестели", "заметили", "пролетел", "раскачивал", "дождя",
                 "увидели", "густом"]),
    "O6": ("нн", ["деревянном", "печёными", "глиняная", "стеклянной", "серебряные",
                  "нескошенной", "ветреную", "утоптанной"]),
}

# НЕ с разными частями речи: верные написания по номерам предложений (пробел — раздельно)
NE_FORMS = {
    "O7": ["неблизкой", "не торопясь", "не глубокая", "несмотря", "незнакомый",
           "не закончена", "непроходимая", "недолюбливал", "не отмеченная"],
}

# Грамматические основы: номер предложения → список основ (подлежащее, сказуемое); None — члена нет
BASES = {
    "S1": {
        1: [("маяк", "башня"), ("который", "указывает")],
        2: [("маяки", "появились")],
        3: [(None, "разводили"), ("моряки", "видели")],
        4: [(None, "заменили"), (None, "стали использовать")],
        5: [("маяки", "работают"), ("люди", "следят")],
    },
    "S3": {
        1: [("снег", "кажется белым"), ("снежинка", "состоит")],
        2: [("свет", "отражается")],
        3: [("мы", "видим")],
        4: [("снег", "поглощает"), ("тишина", "стоит")],
        5: [("снег", "подтаивает, уплотняется"), ("он", "приглушает")],
    },
    "S5": {
        1: [(None, "светает")],
        2: [("туман", "поднимается")],
        3: [("тишина", None)],
        4: [(None, "люблю")],
        5: [("птицы", "молчат")],
        6: [(None, "топят")],
        7: [("дым", "тянется")],
    },
}

# Задача S5 — «укажите номера односоставных предложений»; остальные из BASES — выбор верных основ
ONE_MEMBER_TASKS = {"S5"}

# Задание 12: слово или сочетание, которое надо выписать, и диапазон предложений из условия
WORDS_IN_TEXT = {
    "L1": ("затаив дыхание", 9, 11),
    "L2": ("спешка", 13, 13),
    "L3": ("превосходный", 1, 3),
    "L5": ("несимметрично", 7, 9),
}

# Сравнительные союзы — признак сравнения
COMPARATIVE_WORDS = {"как", "словно", "будто", "точно", "якобы"}

# Задачи «найдите сравнение»: ответ — варианты со сравнительным союзом
COMPARISON_TASKS = {"X2"}

# Задачи на метафору и олицетворение: в верных вариантах не должно быть сравнительного союза
NOT_COMPARISON_TASKS = {"X1", "X3"}

# Фразеологизмы, использованные в банке
PHRASEOLOGISMS = ["спустя рукава", "развесив уши", "затаив дыхание", "непочатый край",
                  "на все лады", "улыбнулся в усы"]

# Задачи «найдите фразеологизм» среди вариантов
PHRASEOLOGISM_TASKS = {"X4"}



class CheckError(Exception):
    pass



# Слова строки в нижнем регистре (без знаков препинания)
def words_of(s):
    return WORD_RE.findall(s.lower())



# Есть ли в списке слов подряд идущая последовательность phrase_words
def contains_phrase(words, phrase_words):
    n = len(phrase_words)
    return any(words[i:i + n] == phrase_words for i in range(len(words) - n + 1))



# Нумерованные предложения текста: {номер: текст предложения}
def split_sentences(text):
    parts = NUMBER_MARK_RE.split(text)
    return {int(parts[i]): parts[i + 1] for i in range(1, len(parts) - 1, 2)}



# Задание 5: номера позиций, где в верном тексте стоит запятая
def commas_answer(task, correct):
    positions = [int(n) for n in re.findall(r"\^(\d+)", correct)]
    if positions != list(range(1, len(positions) + 1)):
        raise CheckError("позиции в эталоне не по порядку")
    shown = POSITION_RE.sub(r" (\1)", correct)
    if shown not in task["text"]:
        raise CheckError("текст задачи не совпадает с эталоном без запятых")
    return "".join(COMMA_POSITION_RE.findall(correct))



# Задание 7: какие буквы стоят в пропусках и где стоит искомая
def gaps_answer(task, target, words):
    tokens = GAP_TOKEN_RE.findall(task["text"])
    if len(tokens) != len(words):
        raise CheckError(f"слов с пропусками {len(tokens)}, в эталоне {len(words)}")
    fills = {}
    for token, word in zip(tokens, words):
        parts = GAP_SPLIT_RE.split(token)
        pattern = "(.+?)".join(re.escape(p.lower()) for p in parts[0::2])
        m = re.fullmatch(pattern, word.lower())
        if not m:
            raise CheckError(f"«{token}» не совпадает с «{word}»")
        for num, letters in zip(parts[1::2], m.groups()):
            fills[int(num)] = letters
    if sorted(fills) != list(range(1, len(fills) + 1)):
        raise CheckError("номера пропусков не по порядку")
    return "".join(str(n) for n in sorted(fills) if fills[n] == target)



# НЕ с разными частями речи: номера предложений, где НЕ пишется слитно
def ne_answer(task, forms):
    sentences = split_sentences(task["text"])
    if sorted(sentences) != list(range(1, len(forms) + 1)):
        raise CheckError("число предложений не совпадает с эталоном")
    result = ""
    for num, form in enumerate(forms, 1):
        m = NE_RE.search(sentences[num])
        if not m or ("не" + m.group(1)).lower() != form.replace(" ", "").lower():
            raise CheckError(f"предложение {num} не совпадает с «{form}»")
        if " " not in form:
            result += str(num)
    return result



# Набор слов основы (подлежащее + сказуемое)
def basis_words(basis):
    return set(w for member in basis if member for w in words_of(member))



# Проверка, что все слова основ действительно есть в своих предложениях
def check_bases_in_text(task, bases):
    sentences = split_sentences(task["text"])
    for num, sentence_bases in bases.items():
        if num not in sentences:
            raise CheckError(f"нет предложения {num}")
        sentence_words = set(words_of(sentences[num]))
        for basis in sentence_bases:
            missing = basis_words(basis) - sentence_words
            if missing:
                raise CheckError(f"в предложении {num} нет слов {sorted(missing)}")



# Задание 2: номера вариантов, совпадающих с одной из основ указанного предложения
def bases_choice_answer(task, bases):
    check_bases_in_text(task, bases)
    result = ""
    for i, opt in enumerate(task["options"], 1):
        m = OPTION_BASIS_RE.fullmatch(opt)
        if not m:
            raise CheckError(f"вариант {i} не в формате «основа (предложение N)»")
        num = int(m.group(2))
        if num not in bases:
            raise CheckError(f"вариант {i}: нет разбора предложения {num}")
        if set(words_of(m.group(1))) in [basis_words(b) for b in bases[num]]:
            result += str(i)
    return result



# Односоставные предложения: в каждой основе нет подлежащего или сказуемого
def one_member_answer(task, bases):
    check_bases_in_text(task, bases)
    return "".join(str(num) for num in sorted(bases)
                   if all(subj is None or pred is None for subj, pred in bases[num]))



# Задание 12: слово есть в указанном диапазоне предложений, и диапазон назван в условии
def word_in_text_answer(task, word, first, last):
    if first == last:
        phrase = f"В предложении {first} "
    else:
        phrase = f"В предложениях {first}–{last} "
    if phrase not in task["text"]:
        raise CheckError(f"в условии нет «{phrase.strip()}»")
    sentences = split_sentences(task["text"])
    fragment = []
    for num in range(first, last + 1):
        if num not in sentences:
            raise CheckError(f"нет предложения {num}")
        fragment.extend(words_of(sentences[num]))
    if not contains_phrase(fragment, words_of(word)):
        raise CheckError(f"«{word}» нет в предложениях {first}–{last}")
    return word



# Есть ли в строке сравнительный союз
def has_comparison(s):
    return bool(COMPARATIVE_WORDS & set(words_of(s)))



# Задание 11 «сравнение»: варианты со сравнительным союзом
def comparison_answer(task):
    return "".join(str(i) for i, opt in enumerate(task["options"], 1) if has_comparison(opt))



# Задание 11 «фразеологизм»: варианты, где есть фразеологизм из списка
def phraseologism_answer(task):
    result = ""
    for i, opt in enumerate(task["options"], 1):
        if any(contains_phrase(words_of(opt), words_of(p)) for p in PHRASEOLOGISMS):
            result += str(i)
    return result



# Метафора и олицетворение не должны быть выражены сравнительным союзом
def check_not_comparison(task):
    for c in str(task["answer"]):
        if has_comparison(task["options"][int(c) - 1]):
            raise CheckError(f"верный вариант {c} содержит сравнительный союз")



# Общие проверки любой задачи: нумерация по порядку, ссылки на существующие предложения, объём образца
def sanity(task):
    text = task["text"]
    numbers = [int(n) for n in NUMBER_MARK_RE.findall(text)]
    if numbers and numbers != list(range(numbers[0], numbers[0] + len(numbers))):
        raise CheckError("нумерация в тексте не по порядку")
    refs_source = text
    if isinstance(task["options"], list):
        refs_source += " " + " ".join(task["options"])
    for first, last in SENTENCE_REF_RE.findall(refs_source):
        for n in (first, last):
            if n and numbers and int(n) not in numbers:
                raise CheckError(f"ссылка на предложение {n}, которого нет в тексте")
    if task["kind"] == "text":
        count = len([w for w in task["answer"].split() if re.search(r"[0-9A-Za-zА-Яа-яЁё]", w)])
        if count < MIN_TEXT_WORDS:
            raise CheckError(f"в образце {count} слов, нужно не менее {MIN_TEXT_WORDS}")



# Эталон одной задачи: вычисленный ответ или None, если механически не пересчитывается
def etalon_for(task):
    tid = task["id"]
    sanity(task)
    if tid in COMMAS:
        return commas_answer(task, COMMAS[tid])
    if tid in GAPS:
        return gaps_answer(task, *GAPS[tid])
    if tid in NE_FORMS:
        return ne_answer(task, NE_FORMS[tid])
    if tid in BASES and tid in ONE_MEMBER_TASKS:
        return one_member_answer(task, BASES[tid])
    if tid in BASES:
        return bases_choice_answer(task, BASES[tid])
    if tid in WORDS_IN_TEXT:
        return word_in_text_answer(task, *WORDS_IN_TEXT[tid])
    if tid in COMPARISON_TASKS:
        return comparison_answer(task)
    if tid in PHRASEOLOGISM_TASKS:
        return phraseologism_answer(task)
    if tid in NOT_COMPARISON_TASKS:
        check_not_comparison(task)
    return None



# ETALON для всего банка; ошибка согласованности превращается в заведомо неверный эталон
def build_etalon(bank):
    etalon = {}
    for task in bank["tasks"]:
        try:
            etalon[task["id"]] = etalon_for(task)
        except (CheckError, KeyError, IndexError, ValueError, TypeError) as e:
            etalon[task["id"]] = ERROR_PREFIX + str(e)
    return etalon



def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BANK
    bank = load_bank(path)
    etalon = build_etalon(bank)
    sys.exit(report(bank, etalon))



if __name__ == "__main__":
    main()
