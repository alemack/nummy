import json
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Настройки
INPUT_FILE = "normalized_articles.json"
OUTPUT_FILE = "query_synonyms.json"
TOP_N = 5             # Количество ближайших синонимов
MIN_SCORE = 0.1       # Порог минимального веса для включения

# Загрузка нормализованных статей
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    articles = json.load(f)

# Очистка текста
def clean(text):
    return re.sub(r"[^a-zA-Zа-яА-Я0-9ёЁ\s\-]", "", text.lower())

# Подготовка корпуса и списка тегов
corpus = []
tag_set = set()

for article in articles:
    title = article.get("title", "")
    abstract = article.get("abstract", "")
    tags = article.get("tags", [])

    corpus.append(clean(f"{title} {abstract}"))
    tag_set.update(tags)

# Очищаем теги и добавляем их к корпусу
tag_texts = [clean(tag) for tag in tag_set]
corpus.extend(tag_texts)

# Векторизация TF-IDF
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(corpus)

# Последние len(tag_texts) векторов — это наши теги
terms = list(tag_set)
term_vectors = X[-len(terms):]

# Вычисление косинусного сходства между тегами
similarities = cosine_similarity(term_vectors)

# Формирование словаря синонимов с весами
result = {}

for i, term in enumerate(terms):
    sim_scores = similarities[i]
    top_indices = np.argsort(sim_scores)[::-1][1:]  # исключаем сам себя
    similar_terms = []

    for j in top_indices:
        score = float(sim_scores[j])
        if score >= MIN_SCORE:
            similar_terms.append([terms[j], round(score, 4)])
            if len(similar_terms) == TOP_N:
                break

    result[term] = similar_terms

# Сохранение в JSON
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=4)

print(f"Готово! Словарь синонимов с весами сохранён в {OUTPUT_FILE}")
