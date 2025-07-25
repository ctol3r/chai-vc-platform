import uuid
import cv2

def verify_identity(image_path: str) -> bool:
    """Simple AI vision check that the image can be loaded."""
    img = cv2.imread(image_path)
    return img is not None

def issue_kyc_credential(user_id: str, name: str, image_path: str, consent: bool) -> dict:
    """Issue a simple KYC credential if consent is given and image verifies."""
    if not consent:
        raise ValueError("User consent required")
    if not verify_identity(image_path):
        raise ValueError("AI vision verification failed")
    credential = {
        "id": str(uuid.uuid4()),
        "type": "KYC",
        "subject": user_id,
        "name": name,
        "verified": True,
    }
    return credential
