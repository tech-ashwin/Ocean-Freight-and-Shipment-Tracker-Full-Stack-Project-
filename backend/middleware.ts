import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'a73b033715bbde9f6dc7fd3ac2d72f2a563a611072083d83a3a9ab98348a0317';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'e507b4f57df0d33094a83119d2bfc47b30c53755053dd56326c8aa93b5466ce8';
export const JWT_SECRET = JWT_ACCESS_SECRET;

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
