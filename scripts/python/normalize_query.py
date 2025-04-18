# scripts/normalize_query.py

import sys
import re
import json
from pymorphy3 import MorphAnalyzer

morph = MorphAnalyzer()

def clean(text):
    return re.sub(r"[^а-яА-Яa-zA-Z0-9ёЁ\s]", "", text.lower())

def lemmatize(text):
    words = clean(text).split()
    return [morph.parse(word)[0].normal_form for word in words]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("[]")
    else:
        query = " ".join(sys.argv[1:])
        result = lemmatize(query)
        print(json.dumps(result, ensure_ascii=False))
