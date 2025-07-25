import os
import sys
import cv2
import numpy as np

# Allow importing from the src directory
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))
from routes.kyc import issue_kyc_credential


def test_issue_kyc_credential(tmp_path):
    # create dummy image
    img = np.zeros((10, 10, 3), dtype=np.uint8)
    img_path = tmp_path / "face.png"
    cv2.imwrite(str(img_path), img)

    cred = issue_kyc_credential("user123", "Alice", str(img_path), consent=True)
    assert cred["type"] == "KYC"
    assert cred["subject"] == "user123"
    assert cred["name"] == "Alice"
    assert cred["verified"] is True
