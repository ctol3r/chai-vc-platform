"""Matching logic for ranking jobs for clinicians."""

from typing import List, Dict


def rank_jobs_for_clinician(clinician_id: str) -> List[Dict[str, object]]:
    """Return a list of ranked jobs for the given clinician.

    This is a placeholder implementation that returns a static ranking.
    """

    sample_jobs = [
        {"id": "job1", "score": 95},
        {"id": "job2", "score": 90},
        {"id": "job3", "score": 85},
    ]

    # In a real implementation, ranking logic based on clinician_id would go here.
    # Jobs are already ordered by score in descending order.
    return sample_jobs

