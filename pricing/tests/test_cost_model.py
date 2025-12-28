import unittest
from pricing.cost_model import VerificationCostModel


class TestVerificationCostModel(unittest.TestCase):
    def test_cost_per_verification(self):
        model = VerificationCostModel(cost_per_pod_hour=0.25)
        cost = model.cost_per_verification(
            pods=2,
            verifications_per_pod_hour=120,
        )
        self.assertAlmostEqual(cost, 0.25 / 120)

    def test_invalid_inputs(self):
        model = VerificationCostModel(cost_per_pod_hour=0.25)
        with self.assertRaises(ValueError):
            model.cost_per_verification(0, 100)
        with self.assertRaises(ValueError):
            model.cost_per_verification(1, 0)


if __name__ == "__main__":
    unittest.main()
