const fs = require('fs');
const path = require('path');
const { parseCSV, validateRecord } = require('../utils/csv_validator');

async function issueCredential(record) {
  // Placeholder for real credential issuance logic
  console.log(`Issuing credential for ${record.name} (${record.id})`);
  return `issued-${record.id}`;
}

async function bulkIssueFromCSV(csvPath) {
  const data = fs.readFileSync(path.resolve(csvPath), 'utf8');
  const records = parseCSV(data);
  for (const record of records) {
    validateRecord(record);
    await issueCredential(record);
  }
  return records.length;
}

module.exports = { bulkIssueFromCSV, issueCredential };
