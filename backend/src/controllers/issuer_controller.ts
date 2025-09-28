interface CredentialRequest {
  subjectId: string;
  type: string;
}

interface CredentialResponse {
  id: string;
  vc: string;
}

// Generate deterministic sample credentials for MVP
export async function issueCredential(
  request: CredentialRequest
): Promise<CredentialResponse> {
  const { subjectId, type } = request;

  // Generate deterministic ID based on input
  const credentialId = `cred_${Buffer.from(`${subjectId}_${type}_${Date.now()}`)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 16)}`;

  // Create mock VC JWT (deterministic sample)
  const header = {
    alg: 'ES256K',
    typ: 'JWT'
  };

  const payload = {
    iss: 'did:example:issuer',
    sub: subjectId,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', type],
      credentialSubject: {
        id: subjectId,
        type: type,
        issuedAt: new Date().toISOString(),
        ...(type === 'MedicalLicense' && {
          licenseNumber: `ML${Math.random().toString().substring(2, 8)}`,
          specialty: 'Internal Medicine',
          state: 'CA'
        }),
        ...(type === 'BoardCertification' && {
          boardName: 'American Board of Internal Medicine',
          certificationDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    },
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
  };

  // Mock JWT (base64 encoded header + payload + mock signature)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mockSignature = 'mock_signature_' + credentialId.substring(0, 8);

  const vcJwt = `${encodedHeader}.${encodedPayload}.${mockSignature}`;

  return {
    id: credentialId,
    vc: vcJwt
  };
}