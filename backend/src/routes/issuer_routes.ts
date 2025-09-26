import { Router } from 'express';
import { issueCredential } from '../controllers/issuer_controller';

export const router = Router();

interface CredentialRequest {
  subjectId: string;
  type: string;
}

const isCredentialRequest = (value: unknown): value is CredentialRequest => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.subjectId === 'string' &&
    typeof record.type === 'string'
  );
};

// MVP: Issuer credential endpoint
router.post('/issuer/credential', async (req, res) => {
  try {
    if (!isCredentialRequest(req.body)) {
      return res.status(400).json({
        error: 'Invalid request format',
        required: ['subjectId', 'type']
      });
    }

    const { subjectId, type } = req.body;
    const result = await issueCredential({ subjectId, type });

    res.json({
      id: result.id,
      vc: result.vc
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to issue credential' });
  }
});