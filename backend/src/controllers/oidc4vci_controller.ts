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
  const { client_id: clientId, wallet_nonce: walletNonce } = req.body as {
    client_id: string;
    wallet_nonce: string;
  };
  const { preAuthorizedCode, cNonce, expiresIn } = preAuthorizedCodeService.issue({ clientId, walletNonce });
  res.json({
    pre_authorized_code: preAuthorizedCode,
    expires_in: expiresIn,
    interval: 1,
    c_nonce: cNonce,
    c_nonce_expires_in: expiresIn,
  });
}

export function redeemPreAuthorizedCode(req: Request, res: Response): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { pre_authorized_code: code, wallet_nonce: walletNonce } = req.body as {
    pre_authorized_code: string;
    wallet_nonce: string;
  };
  try {
    const { cNonce } = preAuthorizedCodeService.redeem(code, walletNonce);
    res.json({
      access_token: `stub-${code}`,
      token_type: 'bearer',
      expires_in: 600,
      c_nonce: cNonce,
      c_nonce_expires_in: 300,
      scope: 'openid',
    });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'invalid_request';
    res.status(400).json({ error: message });
  }
}
