import type { NextApiRequest, NextApiResponse } from 'next';
import { logGrantPrivileges } from '../../lib/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { credentialId } = req.body;
  await logGrantPrivileges(credentialId);
  res.status(200).json({ status: 'logged' });
}
