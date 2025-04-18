import arxiv
import json

# Названия категорий в читаемом виде
CATEGORY_MAP = {
    "cs.AI": "Artificial Intelligence",
    "cs.LG": "Machine Learning",
    "cs.CL": "Computation and Language",
    "cs.CV": "Computer Vision and Pattern Recognition",
    "cs.IR": "Information Retrieval",
    "cs.DS": "Data Structures and Algorithms",
    "cs.NE": "Neural and Evolutionary Computing",
    "cs.SE": "Software Engineering",
    "cs.CR": "Cryptography and Security",
    "cs.IT": "Information Theory",
    "cs.SI": "Social and Information Networks",
    "cs.HC": "Human-Computer Interaction",
    "cs.RO": "Robotics",
    "cs.CY": "Computers and Society",
    "cs.BM": "Biometrics",
    "cs.MA": "Multiagent Systems",
    "cs.DC": "Distributed Computing",
    "cs.OS": "Operating Systems",
    "cs.AR": "Architecture",
    "cs.SY": "Systems and Control",
    "cs.GR": "Graphics",
    "cs.PL": "Programming Languages",
    "stat.ML": "Statistical Machine Learning",
    "math.OC": "Optimization and Control",
    "math.ST": "Statistics Theory",
    "eess.SY": "Systems and Control (Electrical Engineering)",
    "q-bio.BM": "Biomolecules",
    "q-bio.NC": "Neurons and Cognition",
    "q-bio.OT": "Other Quantitative Biology",
    "q-fin.ST": "Statistical Finance",
    "q-fin.RM": "Risk Management",
    "q-fin.CP": "Computational Finance",
    "econ.EM": "Econometrics",
    "physics.soc-ph": "Physics and Society"
}

# Тематики, по которым мы хотим собрать статьи
TOPICS = [
    "machine learning",
    "natural language processing",
    "computer vision",
    "cryptography",
    "cloud computing",
    "bioinformatics",
    "robotics",
    "quantum computing",
    "financial forecasting",
    "artificial intelligence",
    "reinforcement learning",
    "genomics",
    "image recognition",
    "speech recognition",
    "neural networks",
    "large language models",
    "cybersecurity",
    "autonomous systems",
    "edge computing",
    "data mining"
]

client = arxiv.Client()
articles = []
seen_titles = set()

# Поиск по каждой теме
for topic in TOPICS:
    print(f"Собираем статьи по теме: {topic}")
    search = arxiv.Search(
        query=topic,
        max_results=500,
        sort_by=arxiv.SortCriterion.Relevance
    )
    for result in client.results(search):
        readable_tags = [CATEGORY_MAP.get(cat) for cat in result.categories if CATEGORY_MAP.get(cat)]
        if not readable_tags:
            continue

        if result.title in seen_titles:
            continue

        seen_titles.add(result.title)

        article_data = {
            "title": result.title,
            "abstract": result.summary.replace('\n', ' ').strip(),
            "tags": readable_tags,
            "author": result.authors[0].name if result.authors else "Unknown",
            "date": result.published.strftime("%Y-%m-%dT%H:%M:%S")
        }

        articles.append(article_data)

print(f"\nВсего загружено статей: {len(articles)}")

# Сохранение в JSON-файл
with open("arxiv_dataset.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print("Файл arxiv_dataset.json успешно сохранён.")
