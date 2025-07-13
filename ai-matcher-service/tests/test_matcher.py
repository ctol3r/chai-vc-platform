import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'routes'))

from match import MatchVectorCache, timed_get_vector


def test_vector_cached():
    cache = MatchVectorCache(ttl=5)
    vec1, time1 = timed_get_vector(cache, "doctor search")
    vec2, time2 = timed_get_vector(cache, "doctor search")
    assert vec1 == vec2
    assert time2 <= time1
    assert time2 < 500
