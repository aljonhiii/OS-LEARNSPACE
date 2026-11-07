import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [notifications] = await pool.query(`
      SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
    `, [userId]);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/read', authenticateToken, async (req, res) => {
  const notifId = req.params.id;
  const userId = req.user.id;
  try {
    await pool.query(`
      UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?
    `, [notifId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
