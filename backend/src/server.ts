import express from 'express';
import bodyParser from 'body-parser';
import { login } from './controllers/auth_controller';
import { verifyToken } from './auth/jwt';

const app = express();
app.use(bodyParser.json());

app.post('/login', login);

// Example protected route
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);
    res.json({ message: `Hello ${payload.role} ${payload.userId}` });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default app;
