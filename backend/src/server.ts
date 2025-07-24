import express from 'express';
import bodyParser from 'body-parser';
import { issueHealthCard, verifyHealthCard } from './controllers/smart_health_cards';

const app = express();
app.use(bodyParser.json());

app.post('/smart/issue', async (req, res) => {
  try {
    const card = await issueHealthCard(req.body);
    res.json({ card });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/smart/verify', async (req, res) => {
  try {
    const result = await verifyHealthCard(req.body.card);
    res.json({ valid: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
