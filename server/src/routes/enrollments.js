import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all enrollments with student & course details
router.get('/', authenticateToken, async (req, res) => {
  const { courseId, studentId, status } = req.query;

  try {
    let query = `
      SELECT 
        e.*,
        c.title as course_title, c.course_code,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email as student_email, u.avatar_url as student_avatar,
        ROUND(IFNULL(COUNT(DISTINCT lp.lesson_id) / NULLIF(COUNT(DISTINCT l.id), 0) * 100, 0)) as progress_pct
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.student_id = u.id
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id AND l.status = 'published' AND l.is_required = 1
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = e.student_id AND lp.status = 'completed'
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ` AND e.course_id = ?`;
      params.push(courseId);
    }
    if (studentId) {
      query += ` AND e.student_id = ?`;
      params.push(studentId);
    }
    if (status && status !== 'all') {
      query += ` AND e.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY e.id ORDER BY e.enrolled_at DESC`;

    const [enrollments] = await pool.query(query, params);
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin manual enrollment
router.post('/', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { course_id, student_id } = req.body;
  if (!course_id || !student_id) {
    return res.status(400).json({ error: 'course_id and student_id are required' });
  }

  try {
    await pool.query(`
      INSERT INTO enrollments (course_id, student_id, status, enrolled_at)
      VALUES (?, ?, 'active', NOW())
      ON DUPLICATE KEY UPDATE status = 'active'
    `, [course_id, student_id]);

    res.status(201).json({ success: true, message: 'Student enrolled successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status (active, completed, dropped)
router.patch('/:id/status', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query(`
      UPDATE enrollments SET status = ? WHERE id = ?
    `, [status, req.params.id]);

    res.json({ success: true, message: `Enrollment status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete enrollment
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM enrollments WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Enrollment removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
