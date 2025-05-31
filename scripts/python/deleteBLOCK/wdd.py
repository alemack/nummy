# Загрузка корпуса статей arXiv по тематикам из topics.txt
python fetch_arxiv.py --topics topics.txt --limit 8000   # ≈ 8 тыс. JSON-документов

# Очистка, лемматизация и построение текстового индекса MongoDB
python build_normalized_articles.py                      # создаёт коллекцию normalized_articles

# Прогон 20 тестовых запросов в трёх режимах поиска + расчёт метрик
python evaluation_results_all_corp.py --top 10 --seed 42
