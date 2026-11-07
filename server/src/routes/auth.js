import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../../db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Real Database-driven Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query(`
      SELECT u.*, r.name as role 
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE LOWER(u.email) = LOWER(?) LIMIT 1
    `, [email.trim()]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    if (user.account_status !== 'active') {
      return res.status(403).json({ 
        error: `Account is currently ${user.account_status}. Please contact an institutional administrator.` 
      });
    }

    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last_login_at in database
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // Record audit log entry
    await pool.query(`
      INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, summary)
      VALUES (?, 'USER_LOGIN', 'users', ?, ?)
    `, [user.id, user.id, `User ${user.email} (${user.role}) logged in`]);

    const token = generateToken(user, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        headline: user.headline,
        location: user.location,
        role: user.role,
        lastLoginAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server authentication failure. Please try again.' });
  }
});

// Logout endpoint with session audit trail
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await pool.query(`
        INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, summary)
        VALUES (?, 'USER_LOGOUT', 'users', ?, ?)
      `, [req.user.id, req.user.id, `User ${req.user.email} logged out`]);
    }
    res.json({ message: 'Session closed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current Authenticated User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, u.headline, u.location, u.account_status, u.last_login_at, r.name as role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.id = ? LIMIT 1
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = users[0];
    if (user.account_status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.account_status}` });
    }
    
    // Also fetch achievements for students
    let achievements = [];
    if (user.role === 'student') {
      const [achRows] = await pool.query(`
        SELECT ad.*, sa.earned_at
        FROM student_achievements sa
        JOIN achievement_definitions ad ON sa.achievement_id = ad.id
        WHERE sa.student_id = ?
      `, [user.id]);
      achievements = achRows;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      avatarUrl: user.avatar_url,
      headline: user.headline,
      location: user.location,
      account_status: user.account_status,
      role: user.role,
      lastLoginAt: user.last_login_at,
      achievements
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password Request (Security-compliant: does not reveal user existence)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    const [users] = await pool.query('SELECT id, email FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email.trim()]);
    if (users.length > 0) {
      await pool.query(`
        INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, summary)
        VALUES (?, 'PASSWORD_RESET_REQUEST', 'users', ?, ?)
      `, [users[0].id, users[0].id, `Password reset requested for ${users[0].email}`]);
    }

    // Always respond with identical non-revealing message per Section 5.3
    res.json({ 
      message: 'If an institutional account matches that address, password reset instructions have been issued.' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password for authenticated user
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  try {
    const [users] = await pool.query('SELECT id, email, password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const validPass = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!validPass) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, req.user.id]);

    await pool.query(`
      INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, summary)
      VALUES (?, 'PASSWORD_CHANGED', 'users', ?, ?)
    `, [req.user.id, req.user.id, `Password changed by user ${users[0].email}`]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;