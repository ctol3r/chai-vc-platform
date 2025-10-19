#!/bin/bash
set -e

echo "=== Testing Issue & Verify Flow ==="
echo ""

# Issue credential
echo "1. Issuing credential..."
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

echo ""
echo "2. Verifying credential (expect valid:true)..."
JWT=$(jq -r .jwt /tmp/issue.json)
echo "{\"jwt\":\"$JWT\"}" | \
  curl -s -X POST http://localhost:4000/verifier/presentation \
  -H 'content-type: application/json' \
  -d @- | jq .

echo ""
echo "3. Testing invalid JWT (expect valid:false)..."
echo '{"jwt":"invalid-jwt-token"}' | \
  curl -s -X POST http://localhost:4000/verifier/presentation \
  -H 'content-type: application/json' \
  -d @- | jq .

echo ""
echo "✅ All tests completed!"
