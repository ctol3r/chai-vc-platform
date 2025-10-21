import { Router } from 'express';
import { getStore } from '../services/store';
import { decodeJwt, verifySig } from '../services/jwt';
import { record } from '../services/audit';

export const verifierRoutes = Router();

verifierRoutes.post('/verifier/presentation', async (req, res) => {
  const jwt = req.body?.jwt as string | undefined;
  if (!jwt) {
    return res.status(400).json({ valid: false, reason: 'missing_jwt' });
  }

  const sigOk = verifySig(jwt);
  if (!sigOk) {
    const decoded = decodeJwt(jwt);
    const derivedId = decoded.credentialId || decoded.jti;
    const auditRef = await record('verify', { credentialId: derivedId, status: 'BAD_SIG' });
    return res.status(200).json({ valid: false, reason: 'bad_signature', auditRef, credentialId: derivedId });
  }

  const { jti, credentialId: cidFromPayload } = decodeJwt(jwt);
  const credentialId = cidFromPayload || jti;
  if (!credentialId) {
    const auditRef = await record('verify', { credentialId: undefined, status: 'MALFORMED' });
    return res.status(200).json({ valid: false, reason: 'bad_signature', auditRef });
  }

  const store = getStore();
  const status = await store.getStatus(credentialId);
  const valid = status === 'ACTIVE';
  const reason = valid ? undefined : status.toLowerCase();
  const auditRef = await record('verify', { credentialId, status });
  return res.status(200).json({ valid, reason, auditRef, credentialId });
});
