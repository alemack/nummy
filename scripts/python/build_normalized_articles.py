import json
import re
from pymorphy3 import MorphAnalyzer

INPUT_FILE = "articles_export.json"
OUTPUT_FILE = "normalized_articles.json"

morph = MorphAnalyzer()

# Очищаем, оставляя буквы, цифры, дефисы и пробелы
def clean(text):
    return re.sub(r"[^\w\s\-]", "", text.lower())

# Лемматизируем и фильтруем по уверенному результату, иначе оставляем оригинал
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

# Загружаем JSON
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    raw_articles = json.load(f)

normalized = []

for article in raw_articles:
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

# Сохраняем результат
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(normalized, f, ensure_ascii=False, indent=2)

print(f"Готово! Сохранено {len(normalized)} нормализованных статей в {OUTPUT_FILE}")
