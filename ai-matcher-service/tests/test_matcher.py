import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2]))
import numpy as np
from ai_matcher_service import ProfileEmbeddingModel


def test_embedding_shapes():
    profiles = ["Experienced nurse practitioner", "Certified medical assistant"]
    jobs = ["Nurse practitioner needed for primary care", "Medical assistant for clinic"]

    model = ProfileEmbeddingModel()
    model.fit(profiles, jobs)

    profile_vecs = model.transform_profiles(profiles)
    job_vecs = model.transform_job_specs(jobs)

    assert profile_vecs.shape[0] == len(profiles)
    assert job_vecs.shape[0] == len(jobs)
    assert profile_vecs.shape[1] == job_vecs.shape[1]


def test_embedding_consistency():
    profiles = ["Clinician with emergency experience"]
    jobs = ["Emergency department clinician"]

    model = ProfileEmbeddingModel()
    model.fit(profiles, jobs)

    emb_profiles = model.transform_profiles(profiles)
    emb_jobs = model.transform_job_specs(jobs)

    # Similar texts should have a positive dot product
    dot_product = np.dot(emb_profiles[0], emb_jobs[0])
    assert dot_product > 0
