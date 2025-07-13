import express from 'express';
import session from 'express-session';
import { idleTimeout } from './middleware/idle_timeout';

const app = express();

// Session configuration. Cookie maxAge is set to one day but idleTimeout
// middleware ensures logout after 15 minutes of inactivity.
app.use(
  session({
    secret: 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Apply idle timeout enforcement for all routes
app.use(idleTimeout);

app.get('/', (_req, res) => {
  res.json({ message: 'hello' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
