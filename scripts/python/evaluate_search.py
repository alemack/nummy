import json
import pandas as pd
import matplotlib.pyplot as plt
import requests
import time
import logging
from sklearn.metrics import precision_score, recall_score, f1_score
# TODO: ТУТ БУДУТ ПРОВЕРКИ АВТОМАТИЧЕСКИЕ ВСЕГО ПОИСКА ПО ВСЕМ МЕТРИКАМ
# === Настройка логгера ===
logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger()

# === Константы ===
API_URL = "http://localhost:8000/api/search"
MAX_RETRIES = 3
RETRY_DELAY = 2
STOPWORDS = {"the", "a", "an", "to", "and", "of", "in", "on", "for", "by", "with", "at", "from"}

# === Загрузка данных ===
with open("scholar_db.normalized_articles.json", "r", encoding="utf-8") as f:
    normalized_articles = json.load(f)

# Выбор подмножества
test_articles = normalized_articles[:500]
results = []

def run_query(query, expand):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            params = {
                "q": query,
                "expand": "true" if expand else "false",
                "lemmas": "true"
            }
            r = requests.get(API_URL, params=params, timeout=30)
            r.raise_for_status()
            return r.json()["results"]
        except Exception as e:
            log.warning(f"[{query}] Попытка {attempt} не удалась ({'расширенный' if expand else 'обычный'}): {e}")
            time.sleep(RETRY_DELAY)
    return []

# Обработка каждой статьи
for i, art in enumerate(test_articles, 1):
    query = art["title"].split()[0].lower()
    if query in STOPWORDS or len(query) < 3:
        continue

    relevant_id = art["_id"]["$oid"]
    original_results = run_query(query, expand=False)
    expanded_results = run_query(query, expand=True)

    def evaluate(result_set):
        top_ids = [r["_id"]["$oid"] if isinstance(r["_id"], dict) else r["_id"] for r in result_set[:10]]
        predicted = [1 if doc_id == relevant_id else 0 for doc_id in top_ids]
        expected = [1 if doc_id == relevant_id else 0 for doc_id in top_ids]
        return (
            precision_score(expected, predicted, zero_division=0),
            recall_score(expected, predicted, zero_division=0),
            f1_score(expected, predicted, zero_division=0),
        )

    p1, r1, f1_orig = evaluate(original_results)
    p2, r2, f1_exp = evaluate(expanded_results)

    results.append({
        "query": query,
        "precision_orig": p1,
        "recall_orig": r1,
        "f1_orig": f1_orig,
        "precision_exp": p2,
        "recall_exp": r2,
        "f1_exp": f1_exp,
    })

    if i % 50 == 0:
        log.info(f"Обработано {i} запросов")

# === Финальный анализ ===
df = pd.DataFrame(results)
df.to_csv("Search_Quality_Evaluation.csv", index=False)

plt.figure(figsize=(8, 6))
plt.boxplot([df["f1_orig"], df["f1_exp"]], labels=["Original", "Expanded"])
plt.title("F1 Score Comparison")
plt.ylabel("F1 Score")
plt.grid(True)
plt.savefig("f1_comparison_boxplot.png")
plt.close()

log.info("\n=== Итоговая статистика по метрикам ===")
for col in ["precision", "recall", "f1"]:
    o = df[f"{col}_orig"].mean()
    e = df[f"{col}_exp"].mean()
    log.info(f"{col.capitalize()} - Original: {o:.3f}, Expanded: {e:.3f}, Δ: {e - o:+.3f}")
