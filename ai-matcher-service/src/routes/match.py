"""Simple match route placeholder."""

def match_skills(candidate_skills, job_skills):
    """Return True if candidate_skills cover all job_skills."""
    return set(job_skills).issubset(candidate_skills)
