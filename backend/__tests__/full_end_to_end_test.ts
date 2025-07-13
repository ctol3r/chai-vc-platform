import assert from 'assert';

interface Credential {
  issuerId: number;
  clinicianId: number;
}

class Issuer {
  id: number;
  issued: Credential[] = [];
  constructor(id: number) { this.id = id; }
  issue(clinicianId: number): Credential {
    const cred: Credential = { issuerId: this.id, clinicianId };
    this.issued.push(cred);
    return cred;
  }
}

class Clinician {
  id: number;
  credentials: Credential[] = [];
  constructor(id: number) { this.id = id; }
  receive(cred: Credential): void {
    this.credentials.push(cred);
  }
}

function simulate(numIssuers: number, numClinicians: number) {
  const issuers: Issuer[] = [];
  const clinicians: Clinician[] = [];
  for (let i = 0; i < numIssuers; i++) {
    issuers.push(new Issuer(i));
  }
  for (let j = 0; j < numClinicians; j++) {
    clinicians.push(new Clinician(j));
  }

  for (const issuer of issuers) {
    for (const clinician of clinicians) {
      const cred = issuer.issue(clinician.id);
      clinician.receive(cred);
    }
  }

  return { issuers, clinicians };
}

function runIntegrationTest() {
  const NUM_ISSUERS = 10;
  const NUM_CLINICIANS = 50;
  const { issuers, clinicians } = simulate(NUM_ISSUERS, NUM_CLINICIANS);

  assert.strictEqual(issuers.length, NUM_ISSUERS, 'Incorrect issuer count');
  assert.strictEqual(clinicians.length, NUM_CLINICIANS, 'Incorrect clinician count');

  for (const issuer of issuers) {
    assert.strictEqual(
      issuer.issued.length,
      NUM_CLINICIANS,
      `Issuer ${issuer.id} should issue to all clinicians`
    );
  }

  for (const clinician of clinicians) {
    assert.strictEqual(
      clinician.credentials.length,
      NUM_ISSUERS,
      `Clinician ${clinician.id} should receive from all issuers`
    );
  }

  const totalIssued = issuers.reduce((sum, iss) => sum + iss.issued.length, 0);
  assert.strictEqual(totalIssued, NUM_ISSUERS * NUM_CLINICIANS, 'Total credentials mismatch');

  console.log('Integration test passed with', NUM_ISSUERS, 'issuers and', NUM_CLINICIANS, 'clinicians');
}

runIntegrationTest();
