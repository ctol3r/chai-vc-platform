import request from 'supertest';
import app from '../src/app';

describe('Well-Known Endpoints', () => {
  describe('GET /.well-known/openid-credential-issuer', () => {
    it('should return OIDC4VCI metadata', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('issuer');
      expect(response.body).toHaveProperty('credential_issuer');
      expect(response.body).toHaveProperty('credential_endpoint');
      expect(response.body).toHaveProperty('credentials_supported');
      expect(response.body).toHaveProperty('grant_types_supported');
    });

    it('should include required credential types', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      expect(response.body.credentials_supported).toBeDefined();
      expect(Array.isArray(response.body.credentials_supported)).toBe(true);
      expect(response.body.credentials_supported.length).toBeGreaterThan(0);

      const medicalLicense = response.body.credentials_supported.find(
        (c: any) => c.id === 'MedicalLicenseCredential'
      );
      expect(medicalLicense).toBeDefined();
      expect(medicalLicense.format).toBe('jwt_vc_json');
      expect(medicalLicense.types).toContain('MedicalLicenseCredential');
    });

    it('should include SD-JWT credential type', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      const sdJwt = response.body.credentials_supported.find(
        (c: any) => c.format === 'vc+sd-jwt'
      );
      expect(sdJwt).toBeDefined();
      expect(sdJwt.id).toBe('SelectiveDisclosureMedicalLicense');
    });

    it('should include correct grant types', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      expect(response.body.grant_types_supported).toContain('authorization_code');
      expect(response.body.grant_types_supported).toContain(
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'
      );
    });

    it('should include JWKS URI', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      expect(response.body.jwks_uri).toBeDefined();
      expect(response.body.jwks_uri).toContain('/.well-known/jwks.json');
    });

    it('should include supported algorithms', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      expect(response.body.credential_signing_alg_values_supported).toBeDefined();
      expect(response.body.credential_signing_alg_values_supported).toContain('ES256');
      expect(response.body.credential_signing_alg_values_supported).toContain('EdDSA');
    });
  });

  describe('GET /.well-known/jwks.json', () => {
    it('should return JWKS', async () => {
      const response = await request(app).get('/.well-known/jwks.json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('keys');
      expect(Array.isArray(response.body.keys)).toBe(true);
      expect(response.body.keys.length).toBeGreaterThan(0);
    });

    it('should include key metadata', async () => {
      const response = await request(app).get('/.well-known/jwks.json');

      const key = response.body.keys[0];
      expect(key).toHaveProperty('kty');
      expect(key).toHaveProperty('use', 'sig');
      expect(key).toHaveProperty('kid');
      expect(key).toHaveProperty('alg');
    });

    it('should include RSA and EC keys', async () => {
      const response = await request(app).get('/.well-known/jwks.json');

      const rsaKey = response.body.keys.find((k: any) => k.kty === 'RSA');
      const ecKey = response.body.keys.find((k: any) => k.kty === 'EC');

      expect(rsaKey).toBeDefined();
      expect(ecKey).toBeDefined();
    });
  });

  describe('GET /.well-known/did-configuration.json', () => {
    it('should return DID configuration', async () => {
      const response = await request(app).get('/.well-known/did-configuration.json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('@context');
      expect(response.body).toHaveProperty('linked_dids');
      expect(Array.isArray(response.body.linked_dids)).toBe(true);
    });

    it('should include did:web identifier', async () => {
      const response = await request(app).get('/.well-known/did-configuration.json');

      const didWeb = response.body.linked_dids.find(
        (d: any) => d.did.startsWith('did:web:')
      );
      expect(didWeb).toBeDefined();
    });
  });

  describe('Metadata Validation', () => {
    it('should have consistent endpoint URLs', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      const baseUrl = response.body.issuer;
      expect(response.body.credential_endpoint).toContain(baseUrl);
      expect(response.body.token_endpoint).toContain(baseUrl);
      expect(response.body.authorization_endpoint).toContain(baseUrl);
      expect(response.body.jwks_uri).toContain(baseUrl);
    });

    it('should validate credential subject schema', async () => {
      const response = await request(app).get('/.well-known/openid-credential-issuer');

      const medicalLicense = response.body.credentials_supported.find(
        (c: any) => c.id === 'MedicalLicenseCredential'
      );

      expect(medicalLicense.credentialSubject).toBeDefined();
      expect(medicalLicense.credentialSubject.name).toHaveProperty('mandatory', true);
      expect(medicalLicense.credentialSubject.npi).toHaveProperty('mandatory', true);
      expect(medicalLicense.credentialSubject.license_number).toHaveProperty('mandatory', true);
    });
  });
});
