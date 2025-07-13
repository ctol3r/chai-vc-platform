import os
import sys
import unittest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))
from routes.match import match_profiles_to_jobs


class MatcherTests(unittest.TestCase):
    def test_simple_match(self):
        profiles = [
            {"id": "p1", "description": "experienced python developer"},
            {"id": "p2", "description": "marketing and sales expert"},
        ]
        jobs = [
            {"id": "j1", "description": "looking for a python developer"},
            {"id": "j2", "description": "sales manager role"},
        ]

        results = match_profiles_to_jobs(profiles, jobs, top_k=2)

        # p1 should best match j1
        self.assertEqual(results["p1"][0]["job_id"], "j1")
        # p2 should best match j2
        self.assertEqual(results["p2"][0]["job_id"], "j2")
        # scores are between 0 and 1
        for profile_res in results.values():
            for item in profile_res:
                self.assertGreaterEqual(item["score"], 0.0)
                self.assertLessEqual(item["score"], 1.0)


if __name__ == "__main__":
    unittest.main()
