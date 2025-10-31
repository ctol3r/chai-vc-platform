import {
  generateSalt,
  hashClaim,
  createDisclosure,
  issueSDJWT,
  verifySDJWT,
  selectDisclosures,
  SDJWTClaim,
} from '../src/lib/sdjwt';

describe('SD-JWT Library', () => {
  const SIGNING_KEY = 'test-secret-key';

  describe('generateSalt', () => {
    it('should generate a salt of specified length', () => {
      const salt = generateSalt(16);
      expect(salt).toBeTruthy();
      expect(typeof salt).toBe('string');
    });

    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('hashClaim', () => {
    it('should hash a claim consistently', () => {
      const salt = 'test-salt';
      const key = 'name';
      const value = 'John Doe';

      const hash1 = hashClaim(salt, key, value);
      const hash2 = hashClaim(salt, key, value);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different salts', () => {
      const key = 'name';
      const value = 'John Doe';

      const hash1 = hashClaim('salt1', key, value);
      const hash2 = hashClaim('salt2', key, value);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createDisclosure', () => {
    it('should create a base64url-encoded disclosure', () => {
      const salt = 'test-salt';
      const key = 'name';
      const value = 'John Doe';

      const disclosure = createDisclosure(salt, key, value);

      expect(disclosure).toBeTruthy();
      expect(typeof disclosure).toBe('string');

      // Decode and verify
      const decoded = Buffer.from(disclosure, 'base64url').toString('utf-8');
      const [decodedSalt, decodedKey, decodedValue] = JSON.parse(decoded);

      expect(decodedSalt).toBe(salt);
      expect(decodedKey).toBe(key);
      expect(decodedValue).toBe(value);
    });
  });

  describe('issueSDJWT', () => {
    it('should issue an SD-JWT with selective disclosure', () => {
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'John Doe', selectable: true },
        { key: 'npi', value: '1234567893', selectable: true },
        { key: 'license_state', value: 'CA', selectable: false },
      ];

      const result = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'user123',
        SIGNING_KEY
      );

      expect(result.token).toBeTruthy();
      expect(result.salts.length).toBe(2); // Only selectable claims
      expect(result.disclosures.length).toBe(2);
      expect(result.preview).toHaveProperty('license_state', 'CA');
      expect(result.preview._selectiveDisclosure).toHaveLength(2);
    });

    it('should handle non-selectable claims', () => {
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'John Doe', selectable: false },
        { key: 'age', value: 35, selectable: false },
      ];

      const result = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'user123',
        SIGNING_KEY
      );

      expect(result.salts.length).toBe(0);
      expect(result.disclosures.length).toBe(0);
      expect(result.preview).toHaveProperty('name', 'John Doe');
      expect(result.preview).toHaveProperty('age', 35);
    });
  });

  describe('verifySDJWT', () => {
    it('should verify a valid SD-JWT and extract claims', () => {
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'John Doe', selectable: true },
        { key: 'license', value: 'MD123456', selectable: true },
        { key: 'state', value: 'CA', selectable: false },
      ];

      const issued = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'user123',
        SIGNING_KEY
      );

      const verified = verifySDJWT(issued.token, SIGNING_KEY);

      expect(verified.valid).toBe(true);
      expect(verified.claims.name).toBe('John Doe');
      expect(verified.claims.license).toBe('MD123456');
      expect(verified.claims.state).toBe('CA');
      expect(verified.errors).toBeUndefined();
    });

    it('should fail verification with wrong key', () => {
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'John Doe', selectable: true },
      ];

      const issued = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'user123',
        SIGNING_KEY
      );

      const verified = verifySDJWT(issued.token, 'wrong-key');

      expect(verified.valid).toBe(false);
      expect(verified.errors).toBeTruthy();
    });

    it('should detect missing required disclosures', () => {
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'John Doe', selectable: true },
        { key: 'license', value: 'MD123456', selectable: true },
      ];

      const issued = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'user123',
        SIGNING_KEY
      );

      // Remove one disclosure
      const parts = issued.token.split('~');
      const reducedToken = [parts[0], parts[1]].join('~'); // Only one disclosure

      const verified = verifySDJWT(
        reducedToken,
        SIGNING_KEY,
        ['name', 'license'] // Require both
      );

      expect(verified.valid).toBe(false);
      expect(verified.errors).toContain('Required claim not disclosed: license');
    });
  });

  describe('selectDisclosures', () => {
    it('should select specific disclosures from SD-JWT', () => {
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'John Doe', selectable: true },
        { key: 'npi', value: '1234567893', selectable: true },
        { key: 'specialty', value: 'Cardiology', selectable: true },
      ];

      const issued = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'user123',
        SIGNING_KEY
      );

      // Select only name and npi
      const selected = selectDisclosures(issued.token, ['name', 'npi']);

      // Verify selected token
      const verified = verifySDJWT(selected, SIGNING_KEY);

      expect(verified.valid).toBe(true);
      expect(verified.claims.name).toBe('John Doe');
      expect(verified.claims.npi).toBe('1234567893');
      expect(verified.claims.specialty).toBeUndefined(); // Not disclosed
    });

    it('should handle empty selection', () => {
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'John Doe', selectable: true },
      ];

      const issued = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'user123',
        SIGNING_KEY
      );

      const selected = selectDisclosures(issued.token, []);
      const parts = selected.split('~');

      expect(parts.length).toBe(1); // Only JWT, no disclosures
    });
  });

  describe('End-to-End Flow', () => {
    it('should support full selective disclosure workflow', () => {
      // 1. Issue SD-JWT with multiple claims
      const claims: SDJWTClaim[] = [
        { key: 'name', value: 'Dr. Jane Smith', selectable: true },
        { key: 'npi', value: '1234567893', selectable: true },
        { key: 'license_number', value: 'CA-MD-12345', selectable: true },
        { key: 'license_state', value: 'California', selectable: false },
        { key: 'specialty', value: 'Internal Medicine', selectable: true },
      ];

      const issued = issueSDJWT(
        claims,
        'https://vitalcv.com',
        'jane.smith@example.com',
        SIGNING_KEY
      );

      expect(issued.salts.length).toBe(4); // 4 selectable claims

      // 2. Holder selects which claims to disclose
      const disclosedToken = selectDisclosures(issued.token, [
        'name',
        'license_state', // Not selectable, always included
        'specialty',
      ]);

      // 3. Verifier verifies and extracts disclosed claims
      const verified = verifySDJWT(disclosedToken, SIGNING_KEY);

      expect(verified.valid).toBe(true);
      expect(verified.claims.name).toBe('Dr. Jane Smith');
      expect(verified.claims.license_state).toBe('California');
      expect(verified.claims.specialty).toBe('Internal Medicine');
      expect(verified.claims.npi).toBeUndefined(); // Not disclosed
      expect(verified.claims.license_number).toBeUndefined(); // Not disclosed
    });
  });
});
