# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Bulk Credential Issuance

The backend now includes a helper to issue credentials from a CSV file. Use `bulkIssueFromCSV` from `backend/src/controllers/bulk_issue.js` and provide a CSV containing the columns `id`, `name`, `issueDate` and `type`. Each row is validated before credentials are issued.
