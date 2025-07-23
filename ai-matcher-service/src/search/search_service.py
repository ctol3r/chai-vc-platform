import json
import os
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, Query
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    import openai
except ImportError:  # pragma: no cover - openai is optional
    openai = None

DATA_PATH = Path(__file__).resolve().parent / "data.json"

with DATA_PATH.open() as f:
    DATA = json.load(f)

VECTOR_FIELD = "combined"
for item in DATA:
    item[VECTOR_FIELD] = item["title"] + " " + item["description"]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform([item[VECTOR_FIELD] for item in DATA])

app = FastAPI(title="GPT Search Service")


class SearchResult(BaseModel):
    id: int
    title: str
    description: str
    category: str
    score: float


def _embed_with_gpt(texts: List[str]) -> Optional[List[List[float]]]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not openai:
        return None
    client = openai.OpenAI(api_key=api_key)
    try:
        res = client.embeddings.create(model="text-embedding-ada-002", input=texts)
        return [d.embedding for d in res.data]
    except Exception:
        return None


def _semantic_rank(query: str, items: List[dict]) -> List[SearchResult]:
    query_vec = vectorizer.transform([query])
    sims = cosine_similarity(query_vec, X).flatten()
    results = []
    for item, score in zip(DATA, sims):
        results.append(SearchResult(**item, score=float(score)))
    return sorted(results, key=lambda r: r.score, reverse=True)


@app.get("/search", response_model=List[SearchResult])
async def search(q: str = Query(""), category: Optional[str] = None):
    filtered = [
        item for item in DATA if category is None or item["category"] == category
    ]
    if not filtered:
        return []

    embed = _embed_with_gpt([q] + [item[VECTOR_FIELD] for item in filtered])
    if embed:
        q_emb, *item_embs = embed
        sims = cosine_similarity([q_emb], item_embs).flatten()
        results = [
            SearchResult(**item, score=float(score))
            for item, score in zip(filtered, sims)
        ]
        return sorted(results, key=lambda r: r.score, reverse=True)

    # fallback to TF-IDF ranking
    vec = vectorizer.transform([q])
    indices = [DATA.index(item) for item in filtered]
    sims = cosine_similarity(vec, X[indices]).flatten()
    results = [
        SearchResult(**item, score=float(score)) for item, score in zip(filtered, sims)
    ]
    return sorted(results, key=lambda r: r.score, reverse=True)


if __name__ == "__main__":  # pragma: no cover - manual test server
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
