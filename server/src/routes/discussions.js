import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get discussions
router.get('/', authenticateToken, async (req, res) => {
  const { courseId } = req.query;
  try {
    let query = `
      SELECT d.*, c.title as course_title,
             CONCAT(u.first_name, ' ', u.last_name) as author_name,
             u.avatar_url as author_avatar, r.name as author_role,
             COUNT(dr.id) as reply_count
      FROM discussions d
      JOIN courses c ON d.course_id = c.id
      JOIN users u ON d.created_by = u.id
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      LEFT JOIN discussion_replies dr ON d.id = dr.discussion_id
      WHERE 1=1
    `;
    const params = [];
    if (courseId) {
      query += ` AND d.course_id = ?`;
      params.push(courseId);
    }
    query += ` GROUP BY d.id ORDER BY d.created_at DESC`;

    const [discussions] = await pool.query(query, params);
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get discussion details with replies
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [discussions] = await pool.query(`
      SELECT d.*, c.title as course_title,
             CONCAT(u.first_name, ' ', u.last_name) as author_name,
             u.avatar_url as author_avatar, r.name as author_role
      FROM discussions d
      JOIN courses c ON d.course_id = c.id
      JOIN users u ON d.created_by = u.id
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE d.id = ?
    `, [req.params.id]);

    if (discussions.length === 0) return res.status(404).json({ error: 'Discussion not found' });
    const discussion = discussions[0];

    const [replies] = await pool.query(`
      SELECT dr.*, CONCAT(u.first_name, ' ', u.last_name) as author_name,
             u.avatar_url as author_avatar, r.name as author_role
      FROM discussion_replies dr
      JOIN users u ON dr.created_by = u.id
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE dr.discussion_id = ?
      ORDER BY dr.created_at ASC
    `, [req.params.id]);

    res.json({ ...discussion, replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post discussion
router.post('/', authenticateToken, async (req, res) => {
  const { course_id, title, body } = req.body;
  if (!course_id || !title || !body) {
    return res.status(400).json({ error: 'Course, title, and body are required' });
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO discussions (course_id, created_by, title, body, status)
      VALUES (?, ?, ?, ?, 'open')
    `, [course_id, req.user.id, title, body]);

    res.status(201).json({ id: result.insertId, message: 'Question posted to discussion board' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post reply
router.post('/:id/replies', authenticateToken, async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Reply body is required' });

  try {
    const [result] = await pool.query(`
      INSERT INTO discussion_replies (discussion_id, created_by, body)
      VALUES (?, ?, ?)
    `, [req.params.id, req.user.id, body]);

    res.status(201).json({ id: result.insertId, message: 'Reply posted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
