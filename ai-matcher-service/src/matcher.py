from typing import List, Set

def calculate_fit(candidate_skills: List[str], job_skills: List[str]) -> float:
    """Return match percentage between candidate and job skills."""
    candidate: Set[str] = {s.lower() for s in candidate_skills}
    job: Set[str] = {s.lower() for s in job_skills}
    if not job:
        return 0.0
    intersection = candidate.intersection(job)
    fit_score = len(intersection) / len(job) * 100
    return round(fit_score, 2)
