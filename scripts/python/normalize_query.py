import sys
import re
import json
from pymorphy3 import MorphAnalyzer

try:
    import nltk
    from nltk.stem import WordNetLemmatizer
except ImportError:
    nltk = None

morph = MorphAnalyzer()

# Простейшие списки стоп-слов для обоих языков
RU_STOPWORDS = {"и", "в", "на", "с", "для", "по", "от", "или", "что"}
EN_STOPWORDS = {"the", "and", "or", "of", "in", "on", "to", "for", "is", "by"}

def clean(text):
    return re.sub(r"[^а-яА-Яa-zA-Z0-9ёЁ\s\-]", "", text.lower())

def is_cyrillic(word):
    return bool(re.match(r'^[а-яё]+$', word, re.IGNORECASE))

def lemmatize(text):
    words = clean(text).split()
    lemmas = []

    # Для английских лемматизация (если есть nltk)
    lemmatizer = WordNetLemmatizer() if nltk else None

    for word in words:
        if is_cyrillic(word):
            parsed = morph.parse(word)
            if parsed and parsed[0].score > 0.3:
                lemma = parsed[0].normal_form
            else:
                lemma = word
            if lemma not in RU_STOPWORDS:
                lemmas.append(lemma)
        else:
            # Английский: нижний регистр + nltk-лемматизация, если доступно
            lemma = word.lower()
            if lemmatizer:
                lemma = lemmatizer.lemmatize(lemma)
            if lemma not in EN_STOPWORDS:
                lemmas.append(lemma)
    return lemmas

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print("[]")
        else:
            query = " ".join(sys.argv[1:])
            result = lemmatize(query)
            print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        # Для отладки можно раскомментировать:
        # import traceback; print(traceback.format_exc(), file=sys.stderr)
        print(json.dumps([]))
