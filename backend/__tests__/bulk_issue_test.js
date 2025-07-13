const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { bulkIssueFromCSV } = require('../src/controllers/bulk_issue');

async function run() {
  const validCsv = 'id,name,issueDate,type\n1,Alice,2024-01-01,degree\n2,Bob,2024-02-01,license';
  fs.writeFileSync('valid.csv', validCsv);
  const count = await bulkIssueFromCSV('valid.csv');
  assert.strictEqual(count, 2);
  fs.unlinkSync('valid.csv');

  const invalidCsv = 'id,name,issueDate,type\n3,Charlie,,degree';
  fs.writeFileSync('invalid.csv', invalidCsv);
  let threw = false;
  try {
    await bulkIssueFromCSV('invalid.csv');
  } catch (err) {
    threw = true;
  }
  fs.unlinkSync('invalid.csv');
  assert.ok(threw, 'Should throw on invalid CSV');
  console.log('bulk_issue_test passed');
}

run().catch(err => { console.error(err); process.exit(1); });
