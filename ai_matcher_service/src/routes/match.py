from fastapi import FastAPI
from pydantic import BaseModel
import os
from typing import Optional

try:
    import openai
except ImportError:  # fallback if openai isn't installed
    openai = None

app = FastAPI()

class MatchRequest(BaseModel):
    job_description: str
    candidate_profile: str

class MatchResponse(BaseModel):
    score: float
    explanation: str

def _call_openai(job_description: str, candidate_profile: str) -> Optional[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and openai is not None:
        client = openai.OpenAI(api_key=api_key)
        prompt = (
            "Given the job description and candidate profile, assess the match and"
            " provide a short explanation of the fit."
        )
        messages = [
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": f"Job: {job_description}\nCandidate: {candidate_profile}",
            },
        ]
        response = client.chat.completions.create(model="gpt-3.5-turbo", messages=messages)
        return response.choices[0].message.content.strip()
    return None

def generate_match(job_description: str, candidate_profile: str) -> MatchResponse:
    explanation = _call_openai(job_description, candidate_profile)
    if explanation is None:
        # fallback heuristic explanation
        explanation = f"Candidate's experience is compared to the job requirements for basic fit."
    score = 0.0
    jd_words = set(job_description.lower().split())
    cand_words = set(candidate_profile.lower().split())
    if jd_words:
        score = len(jd_words & cand_words) / len(jd_words)
    return MatchResponse(score=round(score, 2), explanation=explanation)

@app.post("/match", response_model=MatchResponse)
def match(req: MatchRequest) -> MatchResponse:
    return generate_match(req.job_description, req.candidate_profile)
