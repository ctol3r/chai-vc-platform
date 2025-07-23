import unittest
from pathlib import Path
from dashboard.mttr_dashboard import load_incident_data, calculate_mttr


class TestMTTR(unittest.TestCase):
    def setUp(self):
        csv_path = Path(__file__).resolve().parent.parent / "data" / "incidents.csv"
        self.df = load_incident_data(csv_path)

    def test_recovery_minutes_positive(self):
        self.assertTrue((self.df["recovery_minutes"] > 0).all())

    def test_mttr_calculation(self):
        mttr = calculate_mttr(self.df)
        # Ensure there is at least one MTTR value and it's positive
        self.assertGreater(len(mttr), 0)
        self.assertTrue((mttr["recovery_minutes"] > 0).all())


if __name__ == "__main__":
    unittest.main()
