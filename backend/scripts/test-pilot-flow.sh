#!/bin/bash
# Pilot P0 Smoke Test
# Test the full issue -> verify -> revoke -> verify flow

set -e

API_BASE="${API_BASE:-http://localhost:4000}"
TMP_DIR="${TMP_DIR:-/tmp}"
ISSUE_FILE="${TMP_DIR}/vitalcv-issue.json"
REVOKE_FILE="${TMP_DIR}/vitalcv-revoke.json"
VERIFY1_FILE="${TMP_DIR}/vitalcv-verify1.json"
VERIFY2_FILE="${TMP_DIR}/vitalcv-verify2.json"

echo "🚀 VitalCV Pilot P0 Smoke Test"
echo "API Base: $API_BASE"
echo ""

# Step 1: Issue a credential
echo "1️⃣  Issuing credential..."
curl -s -X POST "$API_BASE/issuer/credential" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": {
      "id": "practitioner-smoke-test",
      "name": "Dr. Smoke Test",
      "licenseNumber": "MD99999",
      "licenseState": "CA"
    }
  }' | tee "$ISSUE_FILE" | jq '.'

if [ ! -s "$ISSUE_FILE" ]; then
  echo "❌ Failed to issue credential"
  exit 1
fi

CREDENTIAL_ID=$(jq -r '.credentialId' "$ISSUE_FILE")
JWT=$(jq -r '.jwt' "$ISSUE_FILE")

if [ -z "$CREDENTIAL_ID" ] || [ "$CREDENTIAL_ID" = "null" ]; then
  echo "❌ No credentialId returned"
  exit 1
fi

echo "✅ Issued: $CREDENTIAL_ID"
echo ""

# Step 2: Verify (should be valid)
echo "2️⃣  Verifying credential (expect valid=true)..."
curl -s -X POST "$API_BASE/verifier/presentation" \
  -H "Content-Type: application/json" \
  -d "{\"jwt\": \"$JWT\"}" | tee "$VERIFY1_FILE" | jq '.'

VALID1=$(jq -r '.valid' "$VERIFY1_FILE")

if [ "$VALID1" != "true" ]; then
  echo "❌ Expected valid=true, got: $VALID1"
  exit 1
fi

echo "✅ Verification passed: valid=true"
echo ""

# Step 3: Revoke the credential
echo "3️⃣  Revoking credential..."
curl -s -X POST "$API_BASE/issuer/revoke" \
  -H "Content-Type: application/json" \
  -d "{\"credentialId\": \"$CREDENTIAL_ID\"}" | tee "$REVOKE_FILE" | jq '.'

REVOKE_OK=$(jq -r '.ok' "$REVOKE_FILE")

if [ "$REVOKE_OK" != "true" ]; then
  echo "❌ Revocation failed"
  exit 1
fi

echo "✅ Revoked: $CREDENTIAL_ID"
echo ""

# Step 4: Verify again (should be invalid)
echo "4️⃣  Verifying credential (expect valid=false, reason=revoked)..."
curl -s -X POST "$API_BASE/verifier/presentation" \
  -H "Content-Type: application/json" \
  -d "{\"jwt\": \"$JWT\"}" | tee "$VERIFY2_FILE" | jq '.'

VALID2=$(jq -r '.valid' "$VERIFY2_FILE")
REASON=$(jq -r '.reason' "$VERIFY2_FILE")

if [ "$VALID2" != "false" ]; then
  echo "❌ Expected valid=false, got: $VALID2"
  exit 1
fi

if [ "$REASON" != "revoked" ]; then
  echo "❌ Expected reason=revoked, got: $REASON"
  exit 1
fi

echo "✅ Verification failed as expected: valid=false, reason=revoked"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL PILOT P0 ACCEPTANCE CRITERIA PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Flow completed:"
echo "  ✓ Issue credential"
echo "  ✓ Verify (green)"
echo "  ✓ Revoke credential"
echo "  ✓ Verify (red)"
echo ""
echo "Test artifacts saved to: $TMP_DIR/vitalcv-*.json"
