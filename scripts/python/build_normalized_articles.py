import sys
import json
import re
from pymorphy3 import MorphAnalyzer

if len(sys.argv) < 3:
    print("Usage: build_normalized_articles.py <input_file> <output_file>")
    sys.exit(1)

INPUT_FILE = sys.argv[1]
OUTPUT_FILE = sys.argv[2]

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
    normalized_article = dict(article)
    normalized_article["title"] = lemmatize(article.get("title", ""))
    normalized_article["abstract"] = lemmatize(article.get("abstract", ""))
    normalized_article["tags"] = [lemmatize(tag) for tag in article.get("tags", [])]
    if "categories" in article:
        normalized_article["categories"] = [lemmatize(cat) for cat in article.get("categories", [])]

    # Главная фича — корректный _id!
    art_id = article.get("id")
    if art_id and isinstance(art_id, str) and len(art_id) == 24:
        normalized_article["_id"] = art_id
    else:
        # Если нет id или id некорректный, лучше пропустить
        continue

    normalized.append(normalized_article)
    if i % 1000 == 0 or i == total:
        print(f"Обработано статей: {i}/{total}")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(normalized, f, ensure_ascii=False, indent=2)

print(f"\nГотово! Сохранено {len(normalized)} нормализованных статей в {OUTPUT_FILE}")
