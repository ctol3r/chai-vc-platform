import hashlib
import jwt
import datetime
import json

EMPLOYER_SECRET = "employer-secret-key"
CANDIDATE_SECRET = "candidate-secret-key"


def create_employment_offer_vc(candidate_name: str, position: str, salary: str) -> str:
    vc = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1"
        ],
        "type": ["VerifiableCredential", "EmploymentOfferCredential"],
        "issuer": "did:example:employer",
        "issuanceDate": datetime.datetime.utcnow().isoformat() + "Z",
        "credentialSubject": {
            "id": "did:example:" + candidate_name.lower().replace(" ", ""),
            "name": candidate_name,
            "position": position,
            "salary": salary,
        },
    }
    token = jwt.encode(vc, EMPLOYER_SECRET, algorithm="HS256")
    return token


def countersign_with_biometric(vc_token: str, biometric_sample: str) -> str:
    vc = jwt.decode(vc_token, EMPLOYER_SECRET, algorithms=["HS256"])
    biometric_hash = hashlib.sha256(biometric_sample.encode()).hexdigest()
    vc["proof"] = {
        "type": "BiometricCounterSignature",
        "biometricHash": biometric_hash,
        "created": datetime.datetime.utcnow().isoformat() + "Z",
    }
    final_token = jwt.encode(vc, CANDIDATE_SECRET, algorithm="HS256")
    return final_token


def main():
    candidate_name = "Alice Example"
    position = "Software Engineer"
    salary = "$120000"

    print("Creating employment-offer credential...")
    employer_signed = create_employment_offer_vc(candidate_name, position, salary)
    print("Employer-signed VC JWT:\n", employer_signed, "\n")

    biometric_sample = "sample-fingerprint"
    print("Applying biometric countersignature...")
    countersigned = countersign_with_biometric(employer_signed, biometric_sample)
    print("Final countersigned VC JWT:\n", countersigned, "\n")

    decoded = jwt.decode(countersigned, CANDIDATE_SECRET, algorithms=["HS256"])
    print("Decoded VC with countersign:")
    print(json.dumps(decoded, indent=2))


if __name__ == "__main__":
    main()
