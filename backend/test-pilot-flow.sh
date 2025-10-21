#!/bin/bash
set -e

echo "=== PILOT P0 SMOKE TEST ==="
echo ""

# 1. Issue
echo "1. Issue credential..."
curl -s -X POST http://localhost:4000/issuer/credential \
  -H 'content-type: application/json' \
  -d '{
    "credentialSubject": {
      "id": "did:example:clinician123",
      "name": "Dr. Jane Smith",
      "licenseNumber": "MD-12345",
      "licenseState": "CA",
      "specialty": "Internal Medicine"
    },
    "issuer": "did:example:medical-board-ca"
  }' | tee /tmp/issue.json | jq .

CID=$(jq -r .credentialId /tmp/issue.json)
JWT=$(jq -r .jwt /tmp/issue.json)
echo ""

# 2. Verify (expect valid:true)
echo "2. Verify credential (expect valid: true)..."
echo "{\"jwt\":\"$JWT\"}" | \
  curl -s -X POST http://localhost:4000/verifier/presentation \
  -H 'content-type: application/json' -d @- | jq .
echo ""

# 3. FHIR export
echo "3. FHIR Practitioner export..."
curl -s http://localhost:4000/fhir/Practitioner/did:example:clinician123 | jq .
echo ""

# 4. Revoke
echo "4. Revoke credential..."
curl -s -X POST http://localhost:4000/issuer/revoke \
  -H 'content-type: application/json' \
  -d "{\"credentialId\":\"$CID\"}" | jq .
echo ""

# 5. Verify again (expect valid:false, reason:credential_revoked)
echo "5. Verify after revocation (expect valid: false)..."
echo "{\"jwt\":\"$JWT\"}" | \
  curl -s -X POST http://localhost:4000/verifier/presentation \
  -H 'content-type: application/json' -d @- | jq .
echo ""

# 6. Version check
echo "6. Version endpoint..."
curl -s http://localhost:4000/version | jq .
echo ""

echo "✅ PILOT FLOW COMPLETE!"
