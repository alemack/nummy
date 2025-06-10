#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
from pathlib import Path
from pymorphy3 import MorphAnalyzer
from nltk.stem import PorterStemmer
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from statistics import mean
import numpy as np

# === CONFIGURE LOGGING ===
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)

# === PATHS ===
SCRIPT_DIR     = Path(__file__).parent
ARTICLES_PATH  = SCRIPT_DIR / "scholar_db.normalized_articles.json"
SYNONYMS_PATH  = SCRIPT_DIR / "query_synonyms.json"
OUTPUT_PATH    = SCRIPT_DIR / "evaluation_results.json"
SUMMARY_PATH   = SCRIPT_DIR / "metrics_summary.json"

# === LOAD DATA ===
logging.info(f"Loading articles from {ARTICLES_PATH}")
ARTICLES = json.loads(ARTICLES_PATH.read_text(encoding="utf-8"))
logging.info(f"Loading synonyms from {SYNONYMS_PATH}")
SYNONYMS = json.loads(SYNONYMS_PATH.read_text(encoding="utf-8"))

# === LEMMATIZER & STEMMER ===
morph = MorphAnalyzer()
def lemmatize_term(term: str) -> str:
    parsed = morph.parse(term)
    return parsed[0].normal_form.lower() if parsed and parsed[0].score > 0.3 else term.lower()

stemmer = PorterStemmer()
def stem_term(term: str) -> str:
    return stemmer.stem(term.lower())

# === EXPAND & NORMALIZE ===
def expand_query(q: str, weight_threshold: float = 0.2):
    out = [(q.lower(), 1.0)]
    for key, syns in SYNONYMS.items():
        if key.lower() == q.lower():
            for syn, w in syns:
                if float(w) >= weight_threshold:
                    out.append((syn.lower(), float(w)))
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

# === FIELD MATCHERS ===
def match_in_tags(doc, terms):
    return any(t in tag.lower() for t in terms for tag in doc.get("tags", []))

def match_in_title(doc, terms):
    title = " " + doc.get("title", "").lower() + " "
    return any(f" {t} " in title for t in terms)

def match_in_abstract(doc, terms):
    return any(t in doc.get("abstract", "").lower() for t in terms)

FIELD_MATCHERS = {
    "tags":     match_in_tags,
    "title":    match_in_title,
    "abstract": match_in_abstract,
}

# === RETRIEVE ===
def retrieve(q: str, expand: bool, norm_mode: str, fields: list[str]) -> list[str]:
    raw_terms = expand_query(q) if expand else [(q.lower(), 1.0)]
    terms = normalize_terms([t for t,_ in raw_terms], norm_mode)
    ids = []
    for doc in ARTICLES:
        if any(FIELD_MATCHERS[f](doc, terms) for f in fields):
            ids.append(doc["_id"]["$oid"])
    return ids

# === GROUND TRUTH ===
def ground_truth(q: str) -> set[str]:
    terms = normalize_terms([t for t,_ in expand_query(q)], "none")
    gt = set()
    for doc in ARTICLES:
        if (match_in_tags(doc, terms)
            or match_in_title(doc, terms)
            or match_in_abstract(doc, terms)):
            gt.add(doc["_id"]["$oid"])
    return gt

# === EVALUATION ===
def eval_run(ids: list[str], gt: set[str]):
    tp = sum(1 for i in ids if i in gt)
    fp = len(ids) - tp
    fn = len(gt) - tp
    tn = len(ARTICLES) - tp - fp - fn
    if not ids:
        return 0.0, 0.0, 0.0, tp, fp, fn, tn
    y_true = [1 if i in gt else 0 for i in ids]
    y_pred = [1] * len(ids)
    p = precision_score(y_true, y_pred, zero_division=0)
    r = recall_score(   y_true, y_pred, zero_division=0)
    f = f1_score(       y_true, y_pred, zero_division=0)
    return p, r, f, tp, fp, fn, tn

# === TF-IDF BASELINE ===
logging.info("Building TF-IDF baseline…")
corpus = [
    " ".join((doc.get("title",""), doc.get("abstract",""), " ".join(doc.get("tags",[]))))
    for doc in ARTICLES
]
vectorizer = TfidfVectorizer().fit(corpus)
tfidf_matrix = vectorizer.transform(corpus)
def tfidf_search(q: str):
    qv = vectorizer.transform([q])
    sim = linear_kernel(qv, tfidf_matrix).flatten()
    idxs = [i for i,v in enumerate(sim) if v>0]
    idxs.sort(key=lambda i: sim[i], reverse=True)
    return [ARTICLES[i]["_id"]["$oid"] for i in idxs]

# === MAIN ===
if __name__ == "__main__":
    queries    = ["machine learning", "optimization", "neural networks"]
    modes      = [
        ("Basic",     None,        False, "none"),
        ("Synonyms",  None,        True,  "none"),
        ("Syn+Lemma", None,        True,  "lemma"),
        ("TF-IDF",    tfidf_search, None, None),
    ]
    field_sets = [
        ("[1] Tags only",               ["tags"]),
        ("[2] Tags + Title",            ["tags","title"]),
        ("[3] Tags + Title + Abstract", ["tags","title","abstract"]),
    ]

    all_results = []
    for q in queries:
        logging.info(f"=== Processing «{q}» ===")
        gt = ground_truth(q)
        query_res = {"query": q, "ground_truth_count": len(gt), "field_sets": []}
        for label, fields in field_sets:
            fs_res = {"label": label, "results": [], "delta_f1": {}}
            base_f1 = None
            for name, fn, expand, norm in modes:
                ids = fn(q) if fn else retrieve(q, expand, norm, fields)
                p,r,f, tp,fp,fn_,tn = eval_run(ids, gt)
                fs_res["results"].append({
                    "mode":      name,
                    "retrieved": len(ids),
                    "precision": round(p,3),
                    "recall":    round(r,3),
                    "f1":        round(f,3),
                    "tp": tp, "fp": fp, "fn": fn_, "tn": tn
                })
                if name=="Basic": base_f1 = f
            for r in fs_res["results"]:
                if r["mode"]!="Basic":
                    fs_res["delta_f1"][r["mode"]] = round(r["f1"] - base_f1, 3)
            query_res["field_sets"].append(fs_res)
        all_results.append(query_res)

    # Write full per-query results
    logging.info(f"Writing full results to {OUTPUT_PATH}")
    OUTPUT_PATH.write_text(
        json.dumps(all_results, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # === BUILD SUMMARY for only the "[3] Tags + Title + Abstract" field_set
    logging.info("Building summary metrics…")
    modes_data = {}
    for qres in all_results:
        # select only the 3rd (full-text) field set
        fs_full = next(f for f in qres["field_sets"] if "Title + Abstract" in f["label"])
        for r in fs_full["results"]:
            modes_data.setdefault(r["mode"], {"precision": [], "recall": [], "f1": []})
            modes_data[r["mode"]]["precision"].append(r["precision"])
            modes_data[r["mode"]]["recall"].append(r["recall"])
            modes_data[r["mode"]]["f1"].append(r["f1"])

    summary = {"modeSummary": {}, "distributions": {}}
    # fill modeSummary
    for mode, mets in modes_data.items():
        summary["modeSummary"][mode] = {
            "precision": round(mean(mets["precision"]), 3),
            "recall":    round(mean(mets["recall"]),    3),
            "f1":        round(mean(mets["f1"]),        3),
        }
    # fill quartiles for each metric
    for key in ("precision", "recall", "f1"):
        arr = []
        for mets in modes_data.values():
            arr.extend(mets[key])
        pct = np.percentile(arr, [0,25,50,75,100])
        summary["distributions"][key.capitalize()] = {
            "low":    round(float(pct[0]), 3),
            "q1":     round(float(pct[1]), 3),
            "median": round(float(pct[2]), 3),
            "q3":     round(float(pct[3]), 3),
            "high":   round(float(pct[4]), 3),
        }

    logging.info(f"Writing summary to {SUMMARY_PATH}")
    SUMMARY_PATH.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    logging.info("All done.")
