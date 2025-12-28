import { Router, Request, Response } from 'express';

/**
 * Router responsible for credential related endpoints.
 * GET /credentials returns the credentials issued by and received by the current user.
 *
 * The implementation uses placeholder in-memory data. In a full application this
 * would query a database for the authenticated user's credentials.
 */
const router = Router();

router.get('/credentials', (_req: Request, res: Response) => {
  // Placeholder data representing credentials issued by the user
  const issued = [
    {
      id: 'cred-issued-1',
      subject: 'user-123',
      type: 'MedicalLicense',
      issuedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  // Placeholder data representing credentials received by the user
  const received = [
    {
      id: 'cred-received-1',
      issuer: 'hospital-xyz',
      type: 'EmploymentCredential',
      issuedAt: '2024-02-01T00:00:00.000Z',
    },
  ];

  res.json({ issued, received });
});

export default router;
