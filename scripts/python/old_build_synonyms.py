import json
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

# Настройки
INPUT_FILE = "articles_export.json"
OUTPUT_FILE = "query_synonyms.json"
TOP_N = 5  # Кол-во ближайших терминов для каждого ключа

# Чтение данных
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    articles = json.load(f)

# Извлекаем текст
corpus = []
tag_set = set()

for article in articles:
    text = f"{article['title']} {article['abstract']}"
    tags = article.get("tags", [])
    tag_set.update(tags)
    corpus.append(text.lower())

# Добавим теги к корпусу
corpus.extend(tag.lower() for tag in tag_set)

# Простейшая функция очистки
def clean(text):
    return re.sub(r"[^а-яА-Яa-zA-Z0-9ё\s]", "", text.lower())

corpus = [clean(doc) for doc in corpus]
terms = list(tag_set)

# TF-IDF
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(corpus)

# Вычисляем сходство
similarities = cosine_similarity(X[-len(terms):], X[-len(terms):])

# Строим словарь
result = {}

for i, term in enumerate(terms):
    sim_scores = similarities[i]
    top_indices = np.argsort(sim_scores)[::-1][1:TOP_N+1]  # без самого себя
    similar_terms = [terms[j] for j in top_indices]
    result[term] = similar_terms

# Сохраняем
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=4)

print(f"Готово! Словарь сохранён в {OUTPUT_FILE}")
