import os
import json
import zipfile
import tempfile
import unittest

from backend.src.data_portability.export_vcs import export_credentials_to_zip


class ExportVcsTest(unittest.TestCase):
    def test_export_creates_zip_with_credentials(self):
        with tempfile.TemporaryDirectory() as tmp:
            user_id = "user123"
            user_dir = os.path.join(tmp, user_id)
            os.makedirs(user_dir, exist_ok=True)
            with open(os.path.join(user_dir, "cred1.jsonld"), "w") as f:
                json.dump({"@context": "https://www.w3.org/2018/credentials/v1"}, f)
            with open(os.path.join(user_dir, "cred2.json"), "w") as f:
                json.dump({"@context": "https://www.w3.org/2018/credentials/v1"}, f)

            output_dir = os.path.join(tmp, "out")
            zip_path = export_credentials_to_zip(user_id, tmp, output_dir)

            self.assertTrue(os.path.exists(zip_path))
            with zipfile.ZipFile(zip_path, "r") as zf:
                names = zf.namelist()
                self.assertIn("cred1.jsonld", names)
                self.assertIn("cred2.json", names)


if __name__ == "__main__":
    unittest.main()
