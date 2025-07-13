import unittest

from src.bias_detection import detect_bias, adjust_ranking


class BiasDetectionTests(unittest.TestCase):
    def setUp(self):
        self.candidates = [
            {"id": 1, "score": 0.9, "group": "A"},
            {"id": 2, "score": 0.85, "group": "A"},
            {"id": 3, "score": 0.8, "group": "A"},
            {"id": 4, "score": 0.75, "group": "B"},
            {"id": 5, "score": 0.7, "group": "B"},
            {"id": 6, "score": 0.65, "group": "B"},
        ]

    def test_bias_detected(self):
        self.assertTrue(detect_bias(self.candidates, "group", top_n=3, threshold=0.1))

    def test_adjust_ranking_balances_groups(self):
        adjusted = adjust_ranking(self.candidates, "group")
        groups_in_order = [c["group"] for c in adjusted[:4]]
        # Expect groups to alternate in the beginning
        self.assertEqual(groups_in_order[:2], ["A", "B"])
        self.assertEqual(groups_in_order[2:4], ["A", "B"])


if __name__ == "__main__":
    unittest.main()
