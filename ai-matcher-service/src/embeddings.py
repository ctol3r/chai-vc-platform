from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer

class ProfileEmbeddingModel:
    """Generates vector embeddings for clinician profiles and job specs using TF-IDF."""

    def __init__(self) -> None:
        self.vectorizer = TfidfVectorizer()

    def fit(self, clinician_profiles: List[str], job_specs: List[str]) -> None:
        """Fit the internal vectorizer on all available text."""
        all_docs = list(clinician_profiles) + list(job_specs)
        self.vectorizer.fit(all_docs)

    def transform_profiles(self, clinician_profiles: List[str]):
        """Return embeddings for clinician profiles."""
        return self.vectorizer.transform(clinician_profiles).toarray()

    def transform_job_specs(self, job_specs: List[str]):
        """Return embeddings for job specifications."""
        return self.vectorizer.transform(job_specs).toarray()
