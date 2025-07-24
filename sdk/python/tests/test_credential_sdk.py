from credential_sdk import issue_credential, validate_credential


def test_issuance_and_validation():
    payload = {"id": 1, "name": "Alice"}
    secret = "topsecret"
    cred = issue_credential(payload, secret)
    assert validate_credential(cred, secret)
    cred["signature"] = "bad"
    assert not validate_credential(cred, secret)
