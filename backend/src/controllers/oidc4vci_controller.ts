import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { preAuthorizedCodeService } from '../services/preAuthorizedCodeService';

const DEFAULT_ISSUER = process.env.OIDC_CREDENTIAL_ISSUER ?? 'https://issuer.chai.example';
const DEFAULT_AUTH_SERVER = process.env.OIDC_AUTHORIZATION_SERVER ?? `${DEFAULT_ISSUER}/oauth`;
const DEFAULT_NONCE_ENDPOINT = process.env.OIDC_NONCE_ENDPOINT ?? `${DEFAULT_ISSUER}/oidc4vci/nonce`;

export function issuerMetadata(_req: Request, res: Response): void {
  const txCodeRequired = preAuthorizedCodeService.isTxCodeRequiredByDefault();
  const txCodeDescriptor = txCodeRequired
    ? { tx_code: { required: true, length: preAuthorizedCodeService.getTxCodeLength(), format: 'numeric' as const } }
    : { tx_code: { required: false } };
  const grantType = 'urn:ietf:params:oauth:grant-type:pre-authorized_code';
  const grants = {
    [grantType]: {
      authorization_server: DEFAULT_AUTH_SERVER,
      'pre-authorized_code': {
        input_descriptions: txCodeRequired
          ? [{ name: 'tx_code', type: 'string', required: true, description: 'Transaction code issued out-of-band' }]
          : [],
        ...txCodeDescriptor,
      },
    },
  };
  res.json({
    credential_issuer: DEFAULT_ISSUER,
    authorization_servers: [DEFAULT_AUTH_SERVER],
    nonce_endpoint: DEFAULT_NONCE_ENDPOINT,
    grants,
    credentials_supported: [
      {
        format: 'jwt_vc_json',
        types: ['VerifiableCredential', 'ChaiHealthCredential'],
        display: [{ name: 'Chai Health Credential', locale: 'en-US' }],
      },
    ],
    // Minimal metadata stub; expand with status endpoints as implementation matures.
  });
}

export async function createPreAuthorizedCode(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const {
    client_id: clientId,
    wallet_nonce: walletNonce,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  } = req.body as {
    client_id: string;
    wallet_nonce: string;
    code_challenge: string;
    code_challenge_method?: 'S256';
  };
  try {
    const { preAuthorizedCode, cNonce, expiresIn, cNonceExpiresIn, txCode, txCodeRequired } = await preAuthorizedCodeService.issue({
      clientId,
      walletNonce,
      codeChallenge,
      codeChallengeMethod,
    });
    res.json({
      pre_authorized_code: preAuthorizedCode,
      expires_in: expiresIn,
      interval: 1,
      c_nonce: cNonce,
      c_nonce_expires_in: cNonceExpiresIn,
      ...(txCodeRequired ? { tx_code_required: true, tx_code: txCode } : { tx_code_required: false }),
    });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'invalid_request';
    res.status(400).json({ error: message });
  }
}

export async function redeemPreAuthorizedCode(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const {
    pre_authorized_code: code,
    wallet_nonce: walletNonce,
    code_verifier: codeVerifier,
    grant_type: grantType,
    tx_code: txCode,
  } = req.body as {
    pre_authorized_code: string;
    wallet_nonce: string;
    code_verifier: string;
    grant_type: string;
    tx_code?: string;
  };
  try {
    const { cNonce, accessToken, expiresIn, cNonceExpiresIn } = await preAuthorizedCodeService.redeem(
      code,
      walletNonce,
      codeVerifier,
      grantType,
      txCode
    );
    res.json({
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: expiresIn,
      c_nonce: cNonce,
      c_nonce_expires_in: cNonceExpiresIn,
      scope: 'openid',
    });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'invalid_request';
    res.status(400).json({ error: message });
  }
}

export async function nonceResponse(_req: Request, res: Response): Promise<void> {
  const { cNonce, cNonceExpiresIn } = await preAuthorizedCodeService.issueNonce();
  res.set('Cache-Control', 'no-store');
  res.json({ c_nonce: cNonce, c_nonce_expires_in: cNonceExpiresIn });
}
