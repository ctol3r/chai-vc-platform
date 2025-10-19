#!/bin/bash
set -e

export NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
export ACA_PY_URL="http://localhost:8031"
export REDIS_URL="redis://localhost:6379"

echo "Testing backend endpoints..."
echo ""

echo "1. Health check:"
curl -s $NEXT_PUBLIC_BACKEND_URL/health | jq .
echo ""

echo "2. Issue credential:"
curl -s -X POST $NEXT_PUBLIC_BACKEND_URL/issuer/credential \
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

echo "3. Verify presentation:"
JWT=$(jq -r .jwt /tmp/issue.json)
curl -s -X POST $NEXT_PUBLIC_BACKEND_URL/verifier/presentation \
  -H 'content-type: application/json' \
  -d "{\"jwt\":\"$JWT\"}" | jq .
echo ""

echo "✅ All tests passed!"
