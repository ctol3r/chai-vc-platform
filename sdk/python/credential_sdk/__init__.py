import hmac
import json
import hashlib


def issue_credential(payload, secret):
    message = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return {"payload": payload, "signature": signature}


def validate_credential(credential, secret):
    payload = credential.get("payload")
    signature = credential.get("signature")
    message = json.dumps(payload, separators=(",", ":")).encode()
    expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return signature == expected
