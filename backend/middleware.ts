import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'bluspark-freight-ops-secret-key-2026';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
}
