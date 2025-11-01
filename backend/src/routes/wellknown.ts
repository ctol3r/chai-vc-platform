import express from "express";

const router = express.Router();

/**
 * GET /.well-known/openid-credential-issuer
 * OIDC4VCI discovery metadata
 */
router.get("/openid-credential-issuer", (req, res) => {
  const baseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3000';

  const metadata = {
    issuer: baseUrl,
    credential_issuer: baseUrl,
    credential_endpoint: `${baseUrl}/api/vc/issue`,
    batch_credential_endpoint: `${baseUrl}/api/vc/batch-issue`,
    
    // Supported credential types
    credentials_supported: [
      {
        format: 'jwt_vc_json',
        id: 'MedicalLicenseCredential',
        cryptographic_binding_methods_supported: ['did'],
        cryptographic_suites_supported: ['ES256', 'EdDSA'],
        types: ['VerifiableCredential', 'MedicalLicenseCredential'],
        display: [
          {
            name: 'Medical License Credential',
            locale: 'en-US',
            logo: {
              url: `${baseUrl}/assets/logo.png`,
              alt_text: 'VitalCV Logo',
            },
            description: 'Verifiable medical license credential for healthcare providers',
            background_color: '#3b82f6',
            text_color: '#ffffff',
          },
        ],
        credentialSubject: {
          name: {
            mandatory: true,
            display: [{ name: 'Full Name', locale: 'en-US' }],
          },
          npi: {
            mandatory: true,
            display: [{ name: 'National Provider Identifier', locale: 'en-US' }],
          },
          license_number: {
            mandatory: true,
            display: [{ name: 'License Number', locale: 'en-US' }],
          },
          license_state: {
            mandatory: true,
            display: [{ name: 'License State', locale: 'en-US' }],
          },
        },
      },
      {
        format: 'vc+sd-jwt',
        id: 'SelectiveDisclosureMedicalLicense',
        cryptographic_binding_methods_supported: ['jwk'],
        cryptographic_suites_supported: ['ES256'],
        types: ['VerifiableCredential', 'MedicalLicenseCredential'],
        display: [
          {
            name: 'Medical License (Selective Disclosure)',
            locale: 'en-US',
            description: 'Medical license with selective disclosure support',
          },
        ],
      },
    ],

    // Grant types
    grant_types_supported: [
      'authorization_code',
      'urn:ietf:params:oauth:grant-type:pre-authorized_code',
    ],

    // Response types
    response_types_supported: ['code'],

    // Scopes
    scopes_supported: ['openid', 'credential'],

    // Token endpoint
    token_endpoint: `${baseUrl}/oauth/token`,

    // Authorization endpoint
    authorization_endpoint: `${baseUrl}/oauth/authorize`,

    // JWKS URI
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,

    // Supported algorithms
    id_token_signing_alg_values_supported: ['ES256', 'EdDSA', 'RS256'],
    credential_signing_alg_values_supported: ['ES256', 'EdDSA'],

    // Display
    display: [
      {
        name: 'VitalCV Credential Issuer',
        locale: 'en-US',
      },
    ],
  };

  return res.json(metadata);
});

/**
 * GET /.well-known/jwks.json
 * JSON Web Key Set
 */
router.get("/jwks.json", (req, res) => {
  // TODO: Generate from actual signing keys
  // For pilot, return sample JWKS
  const jwks = {
    keys: [
      {
        kty: 'RSA',
        use: 'sig',
        kid: 'vitalcv-pilot-2024',
        alg: 'RS256',
        n: 'sample-modulus-base64url', // TODO: Real public key
        e: 'AQAB',
      },
      {
        kty: 'EC',
        use: 'sig',
        kid: 'vitalcv-pilot-ec-2024',
        alg: 'ES256',
        crv: 'P-256',
        x: 'sample-x-coordinate', // TODO: Real EC public key
        y: 'sample-y-coordinate',
      },
    ],
  };

  return res.json(jwks);
});

/**
 * GET /.well-known/did-configuration.json
 * DID Configuration for domain linkage
 */
router.get("/did-configuration.json", (req, res) => {
  const baseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3000';

  const config = {
    '@context': 'https://identity.foundation/.well-known/did-configuration/v1',
    linked_dids: [
      {
        did: 'did:web:vitalcv.com',
        origin: baseUrl,
      },
    ],
  };

  return res.json(config);
});

export default router;
