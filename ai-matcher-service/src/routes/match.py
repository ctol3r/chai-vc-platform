import hashlib
import json
import time
from typing import List

import redis


class MatchVectorCache:
    """Cache match vectors in Redis."""

    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0, ttl: int = 3600):
        self.client = redis.Redis(host=host, port=port, db=db, decode_responses=True)
        self.ttl = ttl

    @staticmethod
    def _compute_vector(text: str) -> List[float]:
        """Compute a deterministic pseudo vector for the given text."""
        base = hashlib.sha256(text.encode("utf-8")).digest()
        # Return 8 dimensional vector normalized between 0 and 1
        return [b / 255 for b in base[:8]]

    def get_vector(self, text: str) -> List[float]:
        """Return cached vector or compute and store it."""
        key = f"vector:{hashlib.sha256(text.encode('utf-8')).hexdigest()}"
        cached = self.client.get(key)
        if cached:
            return json.loads(cached)

        vector = self._compute_vector(text)
        self.client.setex(key, self.ttl, json.dumps(vector))
        return vector


def timed_get_vector(cache: MatchVectorCache, text: str) -> (List[float], float):
    """Helper to measure get_vector execution time."""
    start = time.time()
    vec = cache.get_vector(text)
    duration = (time.time() - start) * 1000
    return vec, duration
