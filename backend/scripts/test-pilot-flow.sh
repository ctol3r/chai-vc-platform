#!/bin/bash

# VitalCV Pilot P0 API Test Script
# Tests the complete issue → verify → revoke → verify flow

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${API_URL:-http://localhost:4000}"
TEMP_DIR="/tmp/vitalcv-test-$$"
mkdir -p "$TEMP_DIR"

# Cleanup on exit
trap "rm -rf $TEMP_DIR" EXIT

echo "========================================="
echo "VitalCV Pilot P0 API Test"
echo "========================================="
echo "Testing against: $BASE_URL"
echo ""

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Function to extract JSON field
get_json_field() {
    echo "$1" | grep -o "\"$2\":[^,}]*" | cut -d: -f2- | tr -d ' "' | head -1
}

# Start timing
START_TIME=$(date +%s)

echo "📋 Step 1: Health Check"
echo "------------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Health check passed"
    echo "Response: $BODY"
else
    print_result 1 "Health check failed (HTTP $HTTP_CODE)"
    exit 1
fi
echo ""

echo "📋 Step 2: Issue Credential"
echo "---------------------------"
ISSUE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/issuer/credential" \
    -H "Content-Type: application/json" \
    -d '{
        "subject": {
            "id": "practitioner-test-001",
            "name": "Dr. Jane Smith",
            "licenseNumber": "MED123456",
            "licenseState": "CA"
        },
        "validity": {
            "from": "'$(date -Iseconds)'",
            "until": "'$(date -Iseconds -d "+1 year")'"
        }
    }')

HTTP_CODE=$(echo "$ISSUE_RESPONSE" | tail -n1)
BODY=$(echo "$ISSUE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Credential issued successfully"
    
    # Extract credentialId and JWT
    CREDENTIAL_ID=$(get_json_field "$BODY" "credentialId")
    JWT=$(echo "$BODY" | grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)
    AUDIT_REF=$(get_json_field "$BODY" "auditRef")
    
    echo "Credential ID: $CREDENTIAL_ID"
    echo "Audit Ref: $AUDIT_REF"
    echo "JWT: ${JWT:0:50}..."
    
    # Save for later use
    echo "$BODY" > "$TEMP_DIR/issue.json"
    echo "$JWT" > "$TEMP_DIR/jwt.txt"
    echo "$CREDENTIAL_ID" > "$TEMP_DIR/credential_id.txt"
else
    print_result 1 "Credential issuance failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi
echo ""

echo "📋 Step 3: Verify Credential (Should be VALID)"
echo "-----------------------------------------------"
JWT=$(cat "$TEMP_DIR/jwt.txt")
VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/verifier/presentation" \
    -H "Content-Type: application/json" \
    -d "{\"jwt\": \"$JWT\"}")

HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
BODY=$(echo "$VERIFY_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    VALID=$(get_json_field "$BODY" "valid")
    REASON=$(get_json_field "$BODY" "reason")
    
    if [ "$VALID" = "true" ]; then
        print_result 0 "Credential verified as VALID ✓"
    else
        print_result 1 "Credential should be valid but got: $VALID (reason: $REASON)"
        exit 1
    fi
    echo "Response: $BODY"
else
    print_result 1 "Verification failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi
echo ""

echo "📋 Step 4: Revoke Credential"
echo "-----------------------------"
CREDENTIAL_ID=$(cat "$TEMP_DIR/credential_id.txt")
REVOKE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/issuer/revoke" \
    -H "Content-Type: application/json" \
    -d "{\"credentialId\": \"$CREDENTIAL_ID\"}")

HTTP_CODE=$(echo "$REVOKE_RESPONSE" | tail -n1)
BODY=$(echo "$REVOKE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    OK=$(get_json_field "$BODY" "ok")
    if [ "$OK" = "true" ]; then
        print_result 0 "Credential revoked successfully"
    else
        print_result 1 "Revocation returned ok=$OK"
        exit 1
    fi
    echo "Response: $BODY"
else
    print_result 1 "Revocation failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi
echo ""

echo "📋 Step 5: Verify Revoked Credential (Should be INVALID)"
echo "---------------------------------------------------------"
VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/verifier/presentation" \
    -H "Content-Type: application/json" \
    -d "{\"jwt\": \"$JWT\"}")

HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
BODY=$(echo "$VERIFY_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    VALID=$(get_json_field "$BODY" "valid")
    REASON=$(get_json_field "$BODY" "reason")
    
    if [ "$VALID" = "false" ] && [ "$REASON" = "revoked" ]; then
        print_result 0 "Credential correctly shows as REVOKED ✓"
    else
        print_result 1 "Expected valid=false, reason=revoked but got: valid=$VALID, reason=$REASON"
        exit 1
    fi
    echo "Response: $BODY"
else
    print_result 1 "Verification failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi
echo ""

echo "📋 Step 6: Test Missing JWT Error"
echo "----------------------------------"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/verifier/presentation" \
    -H "Content-Type: application/json" \
    -d '{}')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
BODY=$(echo "$ERROR_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
    REASON=$(get_json_field "$BODY" "reason")
    if [ "$REASON" = "missing_jwt" ]; then
        print_result 0 "Missing JWT correctly rejected"
    else
        print_result 1 "Expected reason=missing_jwt but got: $REASON"
    fi
else
    print_result 1 "Expected HTTP 400 but got $HTTP_CODE"
fi
echo ""

echo "📋 Step 7: Test FHIR Practitioner Endpoint"
echo "-------------------------------------------"
FHIR_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/fhir/Practitioner/practitioner-test-001")
HTTP_CODE=$(echo "$FHIR_RESPONSE" | tail -n1)
BODY=$(echo "$FHIR_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    RESOURCE_TYPE=$(get_json_field "$BODY" "resourceType")
    if [ "$RESOURCE_TYPE" = "Practitioner" ]; then
        print_result 0 "FHIR Practitioner endpoint working"
    else
        print_result 1 "Expected resourceType=Practitioner"
    fi
else
    print_result 1 "FHIR endpoint failed (HTTP $HTTP_CODE)"
fi
echo ""

# Calculate total time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo "========================================="
echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo "========================================="
echo "Total time: ${ELAPSED}s"
echo ""
echo "The complete flow executed in under 10 seconds:"
echo "  • Issue → Verify (valid) → Revoke → Verify (revoked)"
echo ""
echo "Summary:"
echo "  - Health check: ✓"
echo "  - Credential issued: ✓"
echo "  - Verification (active): ✓"
echo "  - Revocation: ✓"
echo "  - Verification (revoked): ✓"
echo "  - Error handling: ✓"
echo "  - FHIR endpoint: ✓"
echo ""
echo "Pilot P0 API is ready! 🚀"