import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { issuerId } = req.query;
  // Dummy license data for placeholder backend
  const license = {
    issuerId,
    licenseNumber: `LIC-${issuerId}`,
    status: 'active',
  };
  res.status(200).json(license);
}
