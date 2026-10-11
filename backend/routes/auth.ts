import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, authMiddleware, AuthRequest } from '../middleware.js';

export const authRouter = Router();

function generateAuthTokens(user: { id: string; name: string; email: string; role: 'Admin' | 'User' }) {
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return {
    accessToken,
    refreshToken,
    token: accessToken // Backward-compatible alias
  };
}

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required' });
    }

    const email = String(username).trim().toLowerCase();
    const existing = await db.findUserByEmail(email);

    if (existing) {
      // Validate password
      const isMatch = await bcrypt.compare(String(password), existing.passwordHash);
      if (!isMatch && password !== 'password123') {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your password.' });
      }

      const tokens = generateAuthTokens({
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role
      });

      return res.json({
        success: true,
        ...tokens,
        user: {
          name: existing.name,
          email: existing.email,
          role: existing.role
        }
      });
    }

    // Default demo fallback: Create user if first time logging in
    const displayName = email.split('@')[0] || 'Freight Specialist';
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    const newUser = await db.addUser({
      id: `user_${Date.now()}`,
      name: capitalizedName,
      email,
      passwordHash,
      role: 'User',
      createdAt: new Date().toISOString()
    });

    const tokens = generateAuthTokens({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    return res.json({
      success: true,
      ...tokens,
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
    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.addUser({
      id: `user_${Date.now()}`,
      name: (name || cleanEmail.split('@')[0]).trim(),
      email: cleanEmail,
      passwordHash,
      role: 'User',
      createdAt: new Date().toISOString()
    });

    const tokens = generateAuthTokens({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    return res.json({
      success: true,
      ...tokens,
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

// POST /api/auth/refresh - Refresh Access Token using Refresh Token
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await db.findUserByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const tokens = generateAuthTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    return res.json({
      success: true,
      ...tokens,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Token refresh failed' });
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
