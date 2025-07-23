import express from 'express';
import { handleAssistantQuestion } from '../controllers/admin_assistant_controller';

const router = express.Router();

router.post('/api/admin/assistant', async (req, res) => {
  const { question } = req.body;
  const answer = await handleAssistantQuestion(question);
  res.json({ answer });
});

export default router;
