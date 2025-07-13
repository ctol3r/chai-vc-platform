import * as fs from 'fs';
import * as path from 'path';

interface LicenseRecord {
  licenseNumber: string;
  firstName: string;
  lastName: string;
  status: string;
}

/**
 * Read state board CSV file and parse license records.
 */
function readBoardCsv(csvPath: string): LicenseRecord[] {
  const data = fs.readFileSync(csvPath, 'utf8');
  const lines = data.trim().split('\n');
  const [, ...rows] = lines; // skip header
  return rows.map(row => {
    const [licenseNumber, firstName, lastName, status] = row.split(',');
    return { licenseNumber, firstName, lastName, status };
  });
}

/**
 * Issue a VC for a license record. In this simulation the VC is a JSON file
 * written to the issued_credentials folder.
 */
function issueCredential(record: LicenseRecord, outDir: string) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const credential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'HealthcareLicense'],
    issuer: 'did:example:state-board',
    issuanceDate: new Date().toISOString(),
    credentialSubject: record,
  };
  const outPath = path.join(outDir, `${record.licenseNumber}.json`);
  fs.writeFileSync(outPath, JSON.stringify(credential, null, 2));
  console.log(`Issued VC for license ${record.licenseNumber}: ${outPath}`);
}

/**
 * Simulate processing a state board update and issuing VCs.
 */
function simulate() {
  const csvPath = path.join(__dirname, 'board_update.csv');
  const records = readBoardCsv(csvPath);
  records.forEach(record => issueCredential(record, path.join(__dirname, 'issued_credentials')));
}

// Run the simulation when executed directly.
if (require.main === module) {
  simulate();
}
