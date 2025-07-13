import express from 'express';
import { authenticate } from './middleware/authMiddleware';

const app = express();

app.get('/clinician', authenticate(['clinician']), (_req, res) => {
  res.json({ message: 'clinician resource' });
});

app.get('/issuer', authenticate(['issuer']), (_req, res) => {
  res.json({ message: 'issuer resource' });
});

app.get('/verifier', authenticate(['verifier']), (_req, res) => {
  res.json({ message: 'verifier resource' });
});

app.get('/admin', authenticate(['admin']), (_req, res) => {
  res.json({ message: 'admin resource' });
});

export default app;
