import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get lesson details
router.get('/:id', authenticateToken, async (req, res) => {
  const lessonId = req.params.id;
  const userId = req.user.id;

  try {
    const [lessons] = await pool.query(`
      SELECT l.*, m.title as module_title, c.id as course_id, c.title as course_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE l.id = ?
    `, [lessonId]);

    if (lessons.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    const lesson = lessons[0];

    // Check completion status for this student
    const [progress] = await pool.query(`
      SELECT status, completed_at FROM lesson_progress WHERE lesson_id = ? AND student_id = ?
    `, [lessonId, userId]);

    res.json({
      ...lesson,
      isCompleted: progress.length > 0 && progress[0].status === 'completed',
      completedAt: progress[0]?.completed_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark lesson as complete
router.post('/:id/complete', authenticateToken, async (req, res) => {
  const lessonId = req.params.id;
  const userId = req.user.id;

  try {
    await pool.query(`
      INSERT INTO lesson_progress (lesson_id, student_id, status, completed_at)
      VALUES (?, ?, 'completed', NOW())
      ON DUPLICATE KEY UPDATE status = 'completed', completed_at = NOW()
    `, [lessonId, userId]);

    res.json({ success: true, message: 'Lesson marked as completed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
