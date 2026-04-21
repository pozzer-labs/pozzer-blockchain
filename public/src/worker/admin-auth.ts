import { Context } from 'hono';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: AdminUser, secret: string): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    }, 
    secret, 
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string, secret: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, secret) as AdminUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Admin authentication middleware
export async function requireAdmin(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  const secret = c.env.ADMIN_JWT_SECRET;
  
  if (!secret) {
    return c.json({ error: 'Admin authentication not configured' }, 500);
  }
  
  const user = verifyToken(token, secret);
  
  if (!user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
  
  // Check if user is active in database
  const db = c.env.DB;
  const dbUser = await db.prepare(
    "SELECT id, username, role, is_active FROM admin_users WHERE id = ?"
  ).bind(user.id).first();
  
  if (!dbUser || !(dbUser as any).is_active) {
    return c.json({ error: 'Unauthorized - User inactive' }, 401);
  }
  
  // Attach user to context
  c.set('adminUser', user);
  
  return next();
}
