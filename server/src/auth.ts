import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from './db.js';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string | null;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT id, email, first_name, last_name, employee_id, department, phone, avatar_url, created_at 
     FROM users WHERE id = $1`,
    [id]
  );
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  return queryOne<User & { password_hash: string }>(
    `SELECT id, email, password_hash, first_name, last_name, employee_id, department, phone, avatar_url, created_at 
     FROM users WHERE email = $1`,
    [email]
  );
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  employeeId?: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const result = await queryOne<User>(
    `INSERT INTO users (email, password_hash, first_name, last_name, employee_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, employee_id, department, phone, avatar_url, created_at`,
    [email, passwordHash, firstName, lastName, employeeId || null]
  );
  
  if (!result) throw new Error('Failed to create user');
  
  // Assign default role
  const userCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users');
  const role = userCount && parseInt(userCount.count) === 1 ? 'admin' : 'receptionist';
  
  await query(
    `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
    [result.id, role]
  );
  
  return result;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const roles = await query<{ role: string }>(
    'SELECT role FROM user_roles WHERE user_id = $1',
    [userId]
  );
  return roles.map(r => r.role);
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  getUserById(payload.userId).then(user => {
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  }).catch(() => {
    res.status(500).json({ error: 'Authentication error' });
  });
}
