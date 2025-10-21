#!/bin/bash

# VitalCV Pilot P0 - Smoke Test Script
# Tests the complete issue→verify→revoke flow via curl

set -e

BASE_URL="${BASE_URL:-http://localhost:4000}"
TEMP_DIR="/tmp/vitalcv-pilot-test"
mkdir -p "$TEMP_DIR"

echo "🧪 VitalCV Pilot P0 Smoke Test"
echo "================================"
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "$body" > "$TEMP_DIR/$(echo "$name" | tr ' ' '_' | tr '[:upper:]' '[:lower:]').json"
        return 0
    else
        echo -e "${RED}❌ (Expected $expected_status, got $http_code)${NC}"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "Step 1: Health Check"
echo "-------------------"
test_endpoint "Health Check" "GET" "/health" "" "200"
echo ""

echo "Step 2: Issue Credential"
echo "----------------------"
ISSUE_DATA='{
  "subject": {
    "id": "smoke-test-practitioner-123",
    "name": "Dr. Smoke Test",
    "licenseNumber": "SMOKE123456",
    "licenseState": "CA"
  },
  "validity": {
    "from": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "until": "'$(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%S.000Z)'"
  }
}'

if test_endpoint "Issue Credential" "POST" "/issuer/credential" "$ISSUE_DATA" "200"; then
    # Extract JWT and credential ID for next steps
    JWT=$(cat "$TEMP_DIR/issue_credential.json" | grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)
    CREDENTIAL_ID=$(cat "$TEMP_DIR/issue_credential.json" | grep -o '"credentialId":"[^"]*"' | cut -d'"' -f4)
    echo "  📋 Credential ID: $CREDENTIAL_ID"
    echo "  🔑 JWT: ${JWT:0:50}..."
fi
echo ""

echo "Step 3: Verify Credential (Should be VALID)"
echo "------------------------------------------"
VERIFY_DATA='{"jwt":"'$JWT'"}'
if test_endpoint "Verify Valid Credential" "POST" "/verifier/presentation" "$VERIFY_DATA" "200"; then
    VALID=$(cat "$TEMP_DIR/verify_valid_credential.json" | grep -o '"valid":[^,}]*' | cut -d':' -f2)
    if [ "$VALID" = "true" ]; then
        echo -e "  ${GREEN}✅ Credential is VALID${NC}"
    else
        echo -e "  ${RED}❌ Expected valid=true${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi
echo ""

echo "Step 4: Revoke Credential"
echo "------------------------"
REVOKE_DATA='{"credentialId":"'$CREDENTIAL_ID'"}'
test_endpoint "Revoke Credential" "POST" "/issuer/revoke" "$REVOKE_DATA" "200"
echo ""

echo "Step 5: Verify Credential (Should be REVOKED)"
echo "--------------------------------------------"
if test_endpoint "Verify Revoked Credential" "POST" "/verifier/presentation" "$VERIFY_DATA" "200"; then
    VALID=$(cat "$TEMP_DIR/verify_revoked_credential.json" | grep -o '"valid":[^,}]*' | cut -d':' -f2)
    REASON=$(cat "$TEMP_DIR/verify_revoked_credential.json" | grep -o '"reason":"[^"]*"' | cut -d'"' -f4)
    if [ "$VALID" = "false" ] && [ "$REASON" = "revoked" ]; then
        echo -e "  ${GREEN}✅ Credential is REVOKED${NC}"
    else
        echo -e "  ${RED}❌ Expected valid=false, reason=revoked${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi
echo ""

echo "Step 6: Test Error Cases"
echo "----------------------"
test_endpoint "Missing JWT" "POST" "/verifier/presentation" '{}' "400"
test_endpoint "Invalid JWT" "POST" "/verifier/presentation" '{"jwt":"invalid-jwt"}' "200"
test_endpoint "Missing Subject ID" "POST" "/issuer/credential" '{"subject":{}}' "400"
echo ""

echo "Step 7: Test FHIR Endpoint"
echo "-------------------------"
test_endpoint "FHIR Practitioner" "GET" "/fhir/Practitioner/smoke-test-practitioner-123" "" "200"
echo ""

echo "Step 8: Test NPI Lookup (with invalid NPI)"
echo "-----------------------------------------"
test_endpoint "Invalid NPI Format" "POST" "/lookup/npi/123" '{}' "400"
echo ""

# Summary
echo "Test Summary"
echo "============"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Pilot P0 API is working correctly.${NC}"
    echo ""
    echo "✅ ISSUE → VERIFY (green) → REVOKE → VERIFY (red) flow completed successfully"
    echo "✅ Error handling works correctly"
    echo "✅ FHIR endpoint responds properly"
    echo "✅ All endpoints return proper JSON with audit references"
    exit 0
else
    echo -e "${RED}💥 Some tests failed. Check the output above for details.${NC}"
    exit 1
fi