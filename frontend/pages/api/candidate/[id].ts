import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  res.status(200).json({
    id,
    name: `Candidate ${id}`,
    explanation:
      'Candidate ' +
      id +
      ' matches the job requirements because of relevant experience and certifications.',
  });
}
