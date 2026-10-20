import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Access token required. Please log in.' });
    return;
  }

  const secret = getJwtSecret();

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Invalid or expired authentication token.' });
      return;
    }
    req.user = decoded as AuthenticatedUser;
    next();
  });
}
