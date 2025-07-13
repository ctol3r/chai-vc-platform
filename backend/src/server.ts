import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

app.post('/grant-privileges', (req, res) => {
  const subject = req.body?.subject || 'placeholder-subject';
  const vc = {
    type: 'EmploymentOfferCredential',
    issued: new Date().toISOString(),
    subject,
  };

  const vcPath = path.join(__dirname, '../../employment_offer_vc.json');
  fs.writeFileSync(vcPath, JSON.stringify(vc, null, 2));

  const logPath = path.join(__dirname, '../../hire_events.log');
  fs.appendFileSync(logPath, `Hire event for ${subject} at ${vc.issued}\n`);

  res.json({ status: 'issued', vc });
});

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});
