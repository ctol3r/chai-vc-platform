from fastapi import APIRouter
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

router = APIRouter()

class MatchRequest(BaseModel):
    text1: str
    text2: str

class MatchResponse(BaseModel):
    similarity: float

@router.post("/match", response_model=MatchResponse)
async def match_texts(req: MatchRequest):
    vectorizer = TfidfVectorizer().fit([req.text1, req.text2])
    vectors = vectorizer.transform([req.text1, req.text2])
    similarity = cosine_similarity(vectors[0], vectors[1])[0][0]
    return MatchResponse(similarity=float(similarity))
