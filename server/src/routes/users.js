import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all users (with search and role filter)
router.get('/', authenticateToken, async (req, res) => {
  const { role, search, status } = req.query;

  try {
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, u.headline, u.location,
             u.account_status, u.created_at, r.name as role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'all') {
      query += ` AND r.name = ?`;
      params.push(role);
    }
    if (status && status !== 'all') {
      query += ` AND u.account_status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC`;
    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user status (for Admin)
router.patch('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!['active', 'pending', 'suspended', 'deactivated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid account status' });
  }

  try {
    await pool.query(`UPDATE users SET account_status = ? WHERE id = ?`, [status, userId]);
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user (for Admin)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  if (!email || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required user fields' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const hash = await bcrypt.hash(password || 'password123', 10);
    const [userResult] = await conn.query(`
      INSERT INTO users (first_name, last_name, email, password_hash, account_status)
      VALUES (?, ?, ?, ?, 'active')
    `, [first_name, last_name, email, hash]);

    const newUserId = userResult.insertId;

    // Fetch role id
    const [roles] = await conn.query(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [role || 'student']);
    const roleId = roles[0]?.id || 3;

    await conn.query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [newUserId, roleId]);
    await conn.commit();

    res.status(201).json({ id: newUserId, message: 'User created successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Reset user password (for Admin)
router.patch('/:id/password', authenticateToken, requireRole('admin'), async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);

    await pool.query(`
      INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, summary)
      VALUES (?, 'ADMIN_RESET_PASSWORD', 'users', ?, ?)
    `, [req.user.id, userId, `Admin reset password for user ID ${userId}`]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user details (for Admin)
router.patch('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, headline, location, role } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (first_name || last_name || headline || location) {
      await conn.query(`
        UPDATE users 
        SET first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            headline = COALESCE(?, headline),
            location = COALESCE(?, location)
        WHERE id = ?
      `, [first_name, last_name, headline, location, userId]);
    }

    if (role) {
      const [roleRows] = await conn.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [role]);
      if (roleRows.length > 0) {
        await conn.query('UPDATE user_roles SET role_id = ? WHERE user_id = ?', [roleRows[0].id, userId]);
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

export default router;
