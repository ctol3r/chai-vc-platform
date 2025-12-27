#!/usr/bin/env bash
set -euo pipefail
echo "Waiting for backend to be healthy..."
for i in {1..30}; do
  if curl -sSf http://localhost:4000/health >/dev/null 2>&1; then
    echo "Backend healthy."
    break
  fi
  echo "Waiting... ($i)"
  sleep 2
done

echo "Seeding demo data via GraphQL (example). Adjust mutation endpoints if needed."

# Example GraphQL mutation using curl.
# Replace with your actual issuer keys, accounts, and fields.
cat > /tmp/seed_issue.gql <<'GQL'
mutation IssueDemo {
  issueCredential(input: {
    subjectAccount: "5F3sa2TJ...",
    type: "medical_license",
    data: { licenseNumber: "MD-12345", issuer: "Test Board" },
    shareStatusOnly: true
  }) {
    id
    chainTxId
    chainStatus
  }
}
GQL

# POST the GraphQL mutation (adjust URL if different)
curl -sS -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d "{\"query\":$(jq -Rs . /tmp/seed_issue.gql)}" | jq .

echo "Seed script finished (check responses above)."
