import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

/**
 * Idle timeout in minutes. After this period of inactivity a user's session
 * is destroyed to comply with HIPAA requirements.
 */
export const IDLE_TIMEOUT_MINUTES = 15;
const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;

declare module 'express-session' {
  interface SessionData {
    lastActivity?: number;
  }
}

/**
 * Middleware that logs a user out after a period of inactivity. The timestamp of
 * the last request is stored in the session. If the time since the last request
 * exceeds the configured timeout the session is destroyed and a 440 status is
 * returned.
 */
export function idleTimeout(req: Request, res: Response, next: NextFunction) {
  if (req.session) {
    const now = Date.now();
    const last = req.session.lastActivity ?? now;
    if (now - last > IDLE_TIMEOUT_MS) {
      return req.session.destroy(() => {
        res.status(440).json({ message: 'Session timed out' });
      });
    }
    req.session.lastActivity = now;
  }
  next();
}
