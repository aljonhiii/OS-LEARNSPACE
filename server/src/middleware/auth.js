import jwt from 'jsonwebtoken';
import { pool } from '../../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'learnspace-secret-key-2026';

export function generateToken(user, role) {
  return jwt.sign(
    { id: user.id, email: user.email, role: role, name: `${user.first_name} ${user.last_name}` },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in with valid credentials.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
    req.user = decoded;
    next();
  });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient role permissions' });
    }
    next();
  };
}
