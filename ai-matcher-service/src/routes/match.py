from __future__ import annotations

"""Profile-job matching using cosine similarity."""

from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def match_profiles_to_jobs(
    profiles: List[Dict[str, str]],
    jobs: List[Dict[str, str]],
    top_k: int = 3,
) -> Dict[str, List[Dict[str, float]]]:
    """Return top job matches for each profile using cosine similarity."""
    if not profiles or not jobs:
        return {}

    texts = [p["description"] for p in profiles] + [j["description"] for j in jobs]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts)
    profile_vecs = tfidf_matrix[: len(profiles)]
    job_vecs = tfidf_matrix[len(profiles) :]

    sim_matrix = cosine_similarity(profile_vecs, job_vecs)

    results: Dict[str, List[Dict[str, float]]] = {}
    for i, profile in enumerate(profiles):
        sims = sim_matrix[i]
        job_scores = sorted(
            (
                {"job_id": jobs[j]["id"], "score": float(sims[j])}
                for j in range(len(jobs))
            ),
            key=lambda x: x["score"],
            reverse=True,
        )[:top_k]
        results[profile["id"]] = job_scores
    return results
