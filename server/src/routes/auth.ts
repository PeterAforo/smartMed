import { Router } from 'express';
import { z } from 'zod';
import {
  getUserByEmail,
  createUser,
  verifyPassword,
  generateToken,
  getUserRoles,
  authMiddleware,
  type AuthRequest
} from '../auth.js';

const router = Router();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  employeeId: z.string().optional()
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/signup', async (req, res) => {
  try {
    const data = signUpSchema.parse(req.body);
    
    const existing = await getUserByEmail(data.email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await createUser(
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.employeeId
    );
    
    const token = generateToken(user.id);
    const roles = await getUserRoles(user.id);
    
    res.json({
      user: { ...user, roles },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const data = signInSchema.parse(req.body);
    
    const user = await getUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    const roles = await getUserRoles(user.id);
    
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      user: { ...userWithoutPassword, roles },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const roles = await getUserRoles(req.user!.id);
    res.json({ user: { ...req.user, roles } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/signout', (req, res) => {
  res.json({ success: true });
});

export default router;
