import express from 'express';
import { createCandidate, addCourseCredential, getCandidate } from './controllers/candidate_profile_controller.ts';

const app = express();
app.use(express.json());

app.post('/candidates', (req, res) => {
  const { id, name } = req.body;
  const candidate = createCandidate(id, name);
  res.json(candidate);
});

app.post('/candidates/:id/credentials', async (req, res) => {
  try {
    const credential = await addCourseCredential(req.params.id, req.body.courseName);
    res.json(credential);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/candidates/:id', (req, res) => {
  const candidate = getCandidate(req.params.id);
  if (!candidate) return res.status(404).end();
  res.json(candidate);
});

export function startServer(port: number) {
  return app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

if (require.main === module) {
  startServer(3000);
}
