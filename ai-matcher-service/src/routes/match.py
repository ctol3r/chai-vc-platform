from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from ..matcher import calculate_fit

router = APIRouter()

class MatchRequest(BaseModel):
    candidate_skills: List[str]
    job_skills: List[str]

class MatchResponse(BaseModel):
    fit: float

@router.post("/match", response_model=MatchResponse)
async def match_endpoint(req: MatchRequest) -> MatchResponse:
    fit = calculate_fit(req.candidate_skills, req.job_skills)
    return MatchResponse(fit=fit)
