import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { preAuthorizedCodeService } from '../services/preAuthorizedCodeService';

const DEFAULT_ISSUER = process.env.OIDC_CREDENTIAL_ISSUER ?? 'https://issuer.chai.example';
const DEFAULT_AUTH_SERVER = process.env.OIDC_AUTHORIZATION_SERVER ?? `${DEFAULT_ISSUER}/oauth`;

export function issuerMetadata(_req: Request, res: Response): void {
  res.json({
    credential_issuer: DEFAULT_ISSUER,
    authorization_servers: [DEFAULT_AUTH_SERVER],
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

export function createPreAuthorizedCode(req: Request, res: Response): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { client_id: clientId, wallet_nonce: walletNonce, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod } = req.body as {
    client_id: string;
    wallet_nonce: string;
    code_challenge: string;
    code_challenge_method?: 'S256' | 'plain';
  };
  const { preAuthorizedCode, cNonce, expiresIn, cNonceExpiresIn } = preAuthorizedCodeService.issue({
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
  });
}

export function redeemPreAuthorizedCode(req: Request, res: Response): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { pre_authorized_code: code, wallet_nonce: walletNonce, code_verifier: codeVerifier, grant_type: grantType } = req.body as {
    pre_authorized_code: string;
    wallet_nonce: string;
    code_verifier: string;
    grant_type: string;
  };
  try {
    const { cNonce, accessToken, expiresIn } = preAuthorizedCodeService.redeem(code, walletNonce, codeVerifier, grantType);
    res.json({
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: expiresIn,
      c_nonce: cNonce,
      c_nonce_expires_in: 300,
      scope: 'openid',
    });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'invalid_request';
    res.status(400).json({ error: message });
  }
}
