#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
from pathlib import Path
from pymorphy3 import MorphAnalyzer
from nltk.stem import PorterStemmer
from sklearn.metrics import precision_score, recall_score, f1_score

# === КОНФИГУРАЦИЯ ЛОГИРОВАНИЯ ===
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)

# === ПУТИ К ФАЙЛАМ ===
ARTICLES_PATH = Path("scholar_db.normalized_articles.json")
SYNONYMS_PATH = Path("query_synonyms.json")
OUTPUT_PATH   = Path("evaluation_results.json")

# === ЗАГРУЗКА ДАННЫХ ===
logging.info(f"Загрузка статей из {ARTICLES_PATH}")
ARTICLES = json.loads(ARTICLES_PATH.read_text(encoding="utf-8"))

logging.info(f"Загрузка словаря синонимов из {SYNONYMS_PATH}")
SYNONYMS = json.loads(SYNONYMS_PATH.read_text(encoding="utf-8"))

# === Подготовка списка всех ID документов ===
ALL_IDS = [doc["_id"]["$oid"] for doc in ARTICLES]

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

# === ФУНКЦИИ РАСШИРЕНИЯ И НОРМАЛИЗАЦИИ ===
def expand_query(q: str):
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

# === MATCHERS ДЛЯ ПОЛЕЙ ===
def match_in_tags(doc, terms):
    return any(t in (tag.lower() for tag in doc.get("tags", [])) for t in terms)

def match_in_title(doc, terms):
    title = doc.get("title", "").lower()
    return any(t in title for t in terms)

def match_in_abstract(doc, terms):
    abstract = doc.get("abstract", "").lower()
    return any(t in abstract for t in terms)

FIELD_MATCHERS = {
    "tags": match_in_tags,
    "title": match_in_title,
    "abstract": match_in_abstract,
}

# === RETRIEVE ===
def retrieve(q: str, expand: bool, norm_mode: str, fields: list[str]) -> list[str]:
    raw = expand_query(q) if expand else [(q.lower(), 1.0)]
    terms = [t for t,_ in raw]
    normed = normalize_terms(terms, norm_mode)
    logging.debug(f"  Terms for '{q}' [{','.join(fields)}]: {normed}")
    result_ids = []
    for doc in ARTICLES:
        if any(FIELD_MATCHERS[f](doc, normed) for f in fields):
            result_ids.append(doc["_id"]["$oid"])
    return result_ids

# === GROUND TRUTH ===
def ground_truth(q: str) -> set[str]:
    # считаем, что релевантны все документы, где q или его синонимы встречаются в любом из трёх полей
    raw = expand_query(q)
    terms = normalize_terms([t for t,_ in raw], "none")
    gt = set()
    for doc in ARTICLES:
        if (match_in_tags(doc, terms)
            or match_in_title(doc, terms)
            or match_in_abstract(doc, terms)):
            gt.add(doc["_id"]["$oid"])
    return gt

# === ОЦЕНКА ПО ВСЕМУ КОРПУСУ ===
def eval_run(ids: list[str], gt: set[str]) -> dict:
    y_true = [1 if oid in gt else 0 for oid in ALL_IDS]
    y_pred = [1 if oid in ids else 0 for oid in ALL_IDS]

    p = precision_score(y_true, y_pred, zero_division=0)
    r = recall_score(y_true, y_pred, zero_division=0)
    f = f1_score(y_true, y_pred, zero_division=0)

    # дополнительные счётчики
    tp = sum(1 for yt,yp in zip(y_true, y_pred) if yt==1 and yp==1)
    fp = sum(1 for yt,yp in zip(y_true, y_pred) if yt==0 and yp==1)
    fn = sum(1 for yt,yp in zip(y_true, y_pred) if yt==1 and yp==0)
    tn = sum(1 for yt,yp in zip(y_true, y_pred) if yt==0 and yp==0)

    return {
        "precision": round(p,3),
        "recall":    round(r,3),
        "f1":        round(f,3),
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "tn": tn,
    }

# === MAIN ===
if __name__ == "__main__":
    queries = ["machine learning", "optimization", "neural networks"]
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

    all_results = []

    for q in queries:
        logging.info(f"\n=== Processing query: «{q}» ===")
        gt = ground_truth(q)
        logging.info(f"Ground-truth count: {len(gt)} / {len(ALL_IDS)} docs")

        query_res = {
            "query": q,
            "ground_truth_count": len(gt),
            "field_sets": []
        }

        for label, fields in field_sets:
            logging.info(f"--- Field set: {label} ---")
            fs_res = {"label": label, "results": [], "delta_f1": {}}
            base_f1 = None

            for name, expand, norm in modes:
                ids = retrieve(q, expand, norm, fields)
                stats = eval_run(ids, gt)
                logging.info(
                    f"{name:<10} → Ret={len(ids):>4}  "
                    f"P={stats['precision']:.3f}  "
                    f"R={stats['recall']:.3f}  "
                    f"F1={stats['f1']:.3f}  "
                    f"TP={stats['tp']}  FP={stats['fp']}  FN={stats['fn']}"
                )

                fs_res["results"].append({
                    "mode": name,
                    "retrieved": len(ids),
                    **stats
                })
                if name == "Basic":
                    base_f1 = stats["f1"]

            # дельты F1
            for r in fs_res["results"]:
                if r["mode"] != "Basic":
                    fs_res["delta_f1"][r["mode"]] = round(r["f1"] - base_f1, 3)

            query_res["field_sets"].append(fs_res)

        all_results.append(query_res)

    # сохраняем в JSON
    logging.info(f"\nСохранение результатов в {OUTPUT_PATH}")
    OUTPUT_PATH.write_text(json.dumps(all_results, ensure_ascii=False, indent=2), encoding="utf-8")
    logging.info("Готово.")
