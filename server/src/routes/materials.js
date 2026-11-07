import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List materials (with optional course filter)
router.get('/', authenticateToken, async (req, res) => {
  const { courseId } = req.query;
  try {
    let query = `
      SELECT lm.*, c.title as course_title, l.title as lesson_title,
             CONCAT(u.first_name, ' ', u.last_name) as uploader_name
      FROM learning_materials lm
      JOIN courses c ON lm.course_id = c.id
      LEFT JOIN lessons l ON lm.lesson_id = l.id
      LEFT JOIN users u ON lm.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    if (courseId) {
      query += ` AND lm.course_id = ?`;
      params.push(courseId);
    }
    query += ` ORDER BY lm.created_at DESC`;

    const [materials] = await pool.query(query, params);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add material
router.post('/', authenticateToken, async (req, res) => {
  const { course_id, lesson_id, title, description, storage_path, external_url, file_type, file_size } = req.body;
  if (!course_id || !title) {
    return res.status(400).json({ error: 'Course and title are required' });
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO learning_materials (course_id, lesson_id, title, description, storage_path, external_url, file_type, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [course_id, lesson_id || null, title, description || '', storage_path || null, external_url || null, file_type || 'pdf', file_size || 2048, req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'Learning material added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete material
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(`DELETE FROM learning_materials WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
