import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

function getPublicKey(): string {
  const key = process.env.KEYCLOAK_PUBLIC_KEY;
  if (!key) {
    throw new Error('Missing KEYCLOAK_PUBLIC_KEY environment variable');
  }
  return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`;
}

export function authenticate(allowedRoles: string[] = []) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }
    const token = authHeader.substring('Bearer '.length);
    try {
      const decoded = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] });
      req.user = decoded;
      if (allowedRoles.length > 0) {
        const roles = (decoded as any).realm_access?.roles || [];
        const hasRole = allowedRoles.some(r => roles.includes(r));
        if (!hasRole) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
