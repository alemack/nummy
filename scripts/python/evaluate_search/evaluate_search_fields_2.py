#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from pymorphy3 import MorphAnalyzer
from nltk.stem import PorterStemmer
from sklearn.metrics import precision_score, recall_score, f1_score

# === ПУТИ К ФАЙЛАМ ===
ARTICLES_PATH = "scholar_db.normalized_articles.json"
SYNONYMS_PATH = "query_synonyms.json"

# === ЗАГРУЗКА ДАННЫХ ===
with open(ARTICLES_PATH, encoding="utf-8") as f:
    ARTICLES = json.load(f)

with open(SYNONYMS_PATH, encoding="utf-8") as f:
    SYNONYMS = json.load(f)

# === ЛЕММАТИЗАТОР И СТЕММЕР ===
morph = MorphAnalyzer()
def lemmatize_term(term: str) -> str:
    parsed = morph.parse(term)
    if parsed and parsed[0].score > 0.3:
        return parsed[0].normal_form.lower()
    return term.lower()

stemmer = PorterStemmer()
def stem_term(term: str) -> str:
    return stemmer.stem(term.lower())

# === РАСШИРЕНИЕ + НОРМАЛИЗАЦИЯ ===
def expand_query(q: str):
    """Возвращает [(term, weight)] — исходный + синонимы."""
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
    raise ValueError(f"Unknown norm mode: {mode}")

# === ФУНКЦИИ РЕТРИВАЛА ===
def match_in_tags(doc: dict, terms: list[str]) -> bool:
    tags = [t.lower() for t in doc.get("tags", [])]
    return any(t in tags for t in terms)

def match_in_title(doc: dict, terms: list[str]) -> bool:
    title = doc.get("title", "").lower()
    return any(t in title for t in terms)

def match_in_abstract(doc: dict, terms: list[str]) -> bool:
    abs_ = doc.get("abstract", "").lower()
    return any(t in abs_ for t in terms)

FIELD_MATCHERS = {
    "tags": match_in_tags,
    "title": match_in_title,
    "abstract": match_in_abstract,
}

def retrieve(q: str, expand: bool, norm_mode: str, fields: list[str]) -> list[str]:
    """
    Возвращает список _id документов, в которых хотя бы в одном из полей
    (из списка fields) есть любой из нормализованных search-terms.
    """
    raw = expand_query(q) if expand else [(q.lower(), 1.0)]
    terms = [t for t,_ in raw]
    normed = normalize_terms(terms, norm_mode)
    results = []
    for doc in ARTICLES:
        if any(FIELD_MATCHERS[f](doc, normed) for f in fields):
            results.append(doc["_id"]["$oid"])
    return results

# === МЕТРИКИ ===
def eval_run(ret_ids: list[str], gt_ids: set[str]) -> tuple[float,float,float]:
    """
    Precision/Recall/F1, где y_pred=1 для любого возвращённого doc,
    а y_true=1 тогда, когда doc в ground-truth.
    """
    if not ret_ids:
        return 0.0, 0.0, 0.0
    y_true = [1 if i in gt_ids else 0 for i in ret_ids]
    y_pred = [1]*len(ret_ids)
    p = precision_score(y_true, y_pred, zero_division=0)
    r = recall_score(   y_true, y_pred, zero_division=0)
    f = f1_score(       y_true, y_pred, zero_division=0)
    return p, r, f

# === GROUND-TRUTH ===
def ground_truth(q: str) -> set[str]:
    """
    За эталон считаем все документы, у которых в любом из трёх полей
    (tags, title, abstract) встречается запрос или любой из его синонимов.
    """
    raw = expand_query(q)
    terms = normalize_terms([t for t,_ in raw], "none")
    gt = set()
    for doc in ARTICLES:
        if (match_in_tags(doc, terms)
            or match_in_title(doc, terms)
            or match_in_abstract(doc, terms)):
            gt.add(doc["_id"]["$oid"])
    return gt

# === MAIN ===
if __name__ == "__main__":
    queries = [
        "machine learning",
        "optimization",
        "neural networks",
    ]

    # Три режима и три набора полей (в нужном вам порядке)
    modes = [
        ("Basic",     False, "none"),
        ("Synonyms",  True,  "none"),
        ("Syn+Lemma", True,  "lemma"),
    ]
    field_sets = [
        ("[1] Tags only",               ["tags"]),
        ("[2] Tags + Title",            ["tags","title"]),
        ("[3] Tags + Title + Abstract", ["tags","title","abstract"]),
    ]

    for q in queries:
        print(f"\n=== Query: «{q}» ===")
        gt = ground_truth(q)
        print(f"Ground-truth docs (по любому полю): {len(gt)}\n")

        for label, fields in field_sets:
            print(f"--- {label} ---")
            print(f"{'Mode':<12}{'Ret#':>6}{'Prec':>8}{'Rec':>8}{'F1':>8}")
            base_f = None

            for name, expand, norm in modes:
                ret = retrieve(q, expand, norm, fields)
                p, r, f = eval_run(ret, gt)
                print(f"{name:<12}{len(ret):>6}{p:8.3f}{r:8.3f}{f:8.3f}")
                if name=="Basic":
                    base_f = f

            # печатаем разницу F1
            for name, expand, norm in modes:
                if name=="Basic":
                    continue
                ret = retrieve(q, expand, norm, fields)
                _, _, f = eval_run(ret, gt)
                print(f"Δ F1 {name:>10} vs Basic: {f - base_f:+.3f}")
            print()
