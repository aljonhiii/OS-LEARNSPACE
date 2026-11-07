import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { action, search } = req.query;
  try {
    let query = `
      SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) as actor_name, u.email as actor_email
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      query += ` AND al.action = ?`;
      params.push(action);
    }
    if (search) {
      query += ` AND (al.summary LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY al.created_at DESC LIMIT 50`;

    const [logs] = await pool.query(query, params);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
