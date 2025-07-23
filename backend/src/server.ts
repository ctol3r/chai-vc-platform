import express from 'express';
import { generateCredentialDossier } from './dossier';

const app = express();
const port = process.env.PORT || 3000;

// Simple in-memory credential store for demonstration
interface Credential {
  id: string;
  name: string;
  issued: string;
}

const credentials: Record<string, Credential> = {
  '1': { id: '1', name: 'Dr. Alice Smith', issued: '2023-01-01' },
  '2': { id: '2', name: 'Dr. Bob Jones', issued: '2023-02-15' }
};

app.get('/credentials/:id/dossier', (req, res) => {
  const credential = credentials[req.params.id];
  if (!credential) {
    res.status(404).send('Credential not found');
    return;
  }

  const pdf = generateCredentialDossier(credential);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=credential_${credential.id}.pdf`);
  pdf.pipe(res);
  pdf.end();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
