# %% [markdown]
# # Search Comparison: Basic vs Synonyms vs Synonyms+Lemmatization

# %% jupyter-python
import json
import re
from pymorphy3 import MorphAnalyzer
from nltk.stem import PorterStemmer

# === ПУТИ К ФАЙЛАМ ===
ARTICLES_PATH = "scholar_db.normalized_articles.json"
SYNONYMS_PATH = "query_synonyms.json"

# === ПАРАМЕТРЫ ===
TOP_K = 50      # сколько документов взять из выдачи
WEIGHTS = {"title": 3, "abstract": 2, "tags": 1}

# === ЗАГРУЗКА ДАННЫХ ===
with open(ARTICLES_PATH, encoding="utf-8") as f:
    ARTICLES = json.load(f)

with open(SYNONYMS_PATH, encoding="utf-8") as f:
    SYNONYMS = json.load(f)

# === ЛЕММАТИЗАТОР и СТЕММЕР ===
morph = MorphAnalyzer()
def lemmatize_term(term: str) -> str:
    parsed = morph.parse(term)
    if parsed and parsed[0].score > 0.3:
        return parsed[0].normal_form.lower()
    return term.lower()

stemmer = PorterStemmer()
def stem_term(term: str) -> str:
    return stemmer.stem(term.lower())

# === ФУНКЦИИ РАСШИРЕНИЯ И НОРМАЛИЗАЦИИ ===
def expand_query(q: str):
    """Возвращает [(term, weight)] включая исходный + синонимы."""
    out = [(q.lower(), 1.0)]
    for key, syns in SYNONYMS.items():
        if key.lower() == q.lower():
            out += [(s[0].lower(), float(s[1])) for s in syns]
            break
    return out

def normalize_terms(terms: list[str], mode: str) -> list[str]:
    if mode == "none":
        return [t.lower() for t in terms]
    if mode == "stem":
        return [stem_term(t) for t in terms]
    if mode == "lemma":
        return [lemmatize_term(t) for t in terms]
    raise ValueError(f"Unknown normalization mode: {mode}")

# === СКОРИНГ ДОКУМЕНТОВ ===
def score_doc(doc: dict, terms_w: list[tuple[str,float]]) -> float:
    s = 0.0
    title = doc["title"].lower()
    abstract = doc["abstract"].lower()
    tags = [t.lower() for t in doc.get("tags",[])]
    for term, w in terms_w:
        if term in title:
            s += WEIGHTS["title"] * w
        if term in abstract:
            s += WEIGHTS["abstract"] * w
        if any(term in tag for tag in tags):
            s += WEIGHTS["tags"] * w
    return s

def retrieve(q: str, expand: bool, norm_mode: str) -> list[tuple[str,float]]:
    # 1) raw terms + веса
    raw = expand_query(q) if expand else [(q.lower(), 1.0)]
    # 2) нормализуем
    terms = [t for t, _ in raw]
    normed = normalize_terms(terms, norm_mode)
    terms_w = list(zip(normed, [w for _, w in raw]))
    # 3) считаем score по всем докам
    scored = []
    for doc in ARTICLES:
        sc = score_doc(doc, terms_w)
        if sc > 0:
            scored.append((doc["_id"]["$oid"], sc))
    # 4) сортируем и отбираем топ-K
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:TOP_K]

# === ГROUND TRUTH НА ОСНОВЕ ПОДСТРОКИ ===
def ground_truth(q: str) -> set[str]:
    ql = q.lower()
    ids = {
        doc["_id"]["$oid"]
        for doc in ARTICLES
        if ql in doc["title"].lower()
        or ql in doc["abstract"].lower()
        or any(ql in t.lower() for t in doc.get("tags", []))
    }
    return ids

# === ЭВАЛЮАЦИЯ ===
def eval_run(retrieved: list[tuple[str,float]], relevant: set[str]) -> tuple[float,float,float]:
    retrieved_ids = [doc_id for doc_id, _ in retrieved]
    tp = sum(1 for i in retrieved_ids if i in relevant)
    n_ret = len(retrieved_ids)
    n_rel = len(relevant)
    p = tp / n_ret if n_ret else 0.0
    r = tp / n_rel if n_rel else 0.0
    f = 2 * p * r / (p + r) if (p + r) else 0.0
    return p, r, f

# === СРАВНЕНИЕ РЕЖИМОВ ===
if __name__ == "__main__":
    queries = ["machine learning", "optimization", "neural networks"]
    modes = [
        ("Basic",     False, "none"),
        ("Synonyms",  True,  "none"),
        ("Syn+Lemma", True,  "lemma"),
    ]

    for q in queries:
        print(f"\n=== Query: «{q}» ===")
        gt = ground_truth(q)
        print(f"Ground truth documents: {len(gt)}\n")
        print(f"{'Mode':<12}{'Ret#':>6}{'Prec':>8}{'Rec':>8}{'F1':>8}")
        base_f1 = None
        stats = []
        for name, expand, norm in modes:
            res = retrieve(q, expand, norm)
            p, r, f = eval_run(res, gt)
            stats.append((name, len(res), p, r, f))
            print(f"{name:<12}{len(res):>6}{p:8.3f}{r:8.3f}{f:8.3f}")
            if name == "Basic":
                base_f1 = f

        # показать прирост по F1
        for name, _, _, _, f in stats:
            if name != "Basic":
                print(f"Δ F1 {name:>10} vs Basic: {f - base_f1:+.3f}")
