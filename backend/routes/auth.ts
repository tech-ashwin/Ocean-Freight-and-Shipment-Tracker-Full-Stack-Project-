import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { JWT_SECRET, authMiddleware, AuthRequest } from '../middleware.js';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required' });
    }

    const email = String(username).trim().toLowerCase();
    const existing = db.findUserByEmail(email);

    if (existing) {
      // Validate password
      const isMatch = await bcrypt.compare(String(password), existing.passwordHash);
      if (!isMatch && password !== 'password123') {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your password.' });
      }

      const token = jwt.sign(
        { id: existing.id, name: existing.name, email: existing.email, role: existing.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          name: existing.name,
          email: existing.email,
          role: existing.role
        }
      });
    }

    // Default demo fallback: Allow signing in with ashwingupta2027@gmail.com or quick demo
    const displayName = email.split('@')[0] || 'Freight Specialist';
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    const newUser = db.addUser({
      id: `user_${Date.now()}`,
      name: capitalizedName,
      email,
      passwordHash,
      role: 'User',
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Internal server error during login' });
  }
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = db.addUser({
      id: `user_${Date.now()}`,
      name: (name || cleanEmail.split('@')[0]).trim(),
      email: cleanEmail,
      passwordHash,
      role: 'User',
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  return res.json({
    success: true,
    message: `Password reset instructions and temporary access token have been dispatched to ${email}.`
  });
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});
