import json
import re
from pymorphy3 import MorphAnalyzer

INPUT_FILE = "articles_export.json"
OUTPUT_FILE = "normalized_articles.json"

morph = MorphAnalyzer()

def clean(text):
    return re.sub(r"[^\w\s\-]", "", text.lower())

def lemmatize(text):
    words = clean(text).split()
    lemmas = []
    for word in words:
        parsed = morph.parse(word)
        if parsed and parsed[0].score > 0.3:
            lemmas.append(parsed[0].normal_form)
        else:
            lemmas.append(word)
    return " ".join(lemmas)

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    raw_articles = json.load(f)

normalized = []
total = len(raw_articles)
print(f"Начата обработка {total} статей...\n")

for i, article in enumerate(raw_articles, start=1):
    object_id = article.get("_id", {}).get("$oid")
    if not object_id:
        continue

    normalized.append({
        "_id": { "$oid": object_id },
        "title": lemmatize(article.get("title", "")),
        "abstract": lemmatize(article.get("abstract", "")),
        "tags": [lemmatize(tag) for tag in article.get("tags", [])],
        "author": article.get("author", "Unknown"),
        "date": article.get("date", "")
    })

    # Показываем прогресс каждые 1000 записей
    if i % 1000 == 0 or i == total:
        print(f"Обработано статей: {i}/{total}")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(normalized, f, ensure_ascii=False, indent=2)

print(f"\nГотово! Сохранено {len(normalized)} нормализованных статей в {OUTPUT_FILE}")
