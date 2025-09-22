#!/bin/bash
set -e

echo "🧪 Running CHAI Platform Smoke Test"

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check substrate node health
echo "🔗 Testing Substrate node connectivity..."
curl -f http://localhost:9933/health || exit 1

# Check backend health
echo "🖥️  Testing backend API..."
curl -f http://localhost:4000/health || exit 1

# Check frontend health
echo "🌐 Testing frontend..."
curl -f http://localhost:3000/api/health || exit 1

# Check ACA-Py agent
echo "🔐 Testing ACA-Py agent..."
curl -f http://localhost:8021/status || exit 1

# Issue a test credential
echo "📜 Issuing test credential..."
CREDENTIAL_RESPONSE=$(curl -s -X POST http://localhost:4000/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "data": "test-credential-data",
    "issuer": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
  }')

echo "Credential response: $CREDENTIAL_RESPONSE"

# Extract chain transaction ID
CHAIN_TX_ID=$(echo $CREDENTIAL_RESPONSE | jq -r '.chainTxId')
echo "Chain TX ID: $CHAIN_TX_ID"

# Generate status proof
echo "📋 Generating status proof..."
PROOF_RESPONSE=$(curl -s -X POST http://localhost:4000/api/credentials/$CHAIN_TX_ID/status-proof)
echo "Proof response: $PROOF_RESPONSE"

# Verify status proof
echo "✅ Verifying status proof..."
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:4000/api/credentials/verify-status-proof \
  -H "Content-Type: application/json" \
  -d "$PROOF_RESPONSE")

echo "Verify response: $VERIFY_RESPONSE"

# Check if verification was successful
if echo $VERIFY_RESPONSE | jq -e '.verified == true' > /dev/null; then
    echo "✅ Smoke test PASSED! Full credential lifecycle working."
    exit 0
else
    echo "❌ Smoke test FAILED! Verification unsuccessful."
    exit 1
fi
