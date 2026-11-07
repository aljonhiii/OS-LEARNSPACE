import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [announcements] = await pool.query(`
      SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as author_name, u.avatar_url as author_avatar
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.is_pinned DESC, a.published_at DESC
    `);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, body, audience, is_pinned, course_id } = req.body;
  try {
    const [result] = await pool.query(`
      INSERT INTO announcements (title, body, audience, is_pinned, course_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, body, audience || 'all', is_pinned || false, course_id || null, req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'Announcement published successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
