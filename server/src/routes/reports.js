import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin overall reports
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const [rolesCount] = await pool.query(`
      SELECT r.name, COUNT(ur.user_id) as count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      GROUP BY r.id
    `);

    const [courseStats] = await pool.query(`
      SELECT c.title, c.course_code,
             COUNT(DISTINCT e.student_id) as total_enrolled,
             COUNT(DISTINCT s.id) as total_submissions,
             COUNT(DISTINCT qa.id) as total_quiz_attempts
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN assignments a ON c.id = a.course_id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      LEFT JOIN quizzes q ON c.id = q.course_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE c.status = 'published'
      GROUP BY c.id
    `);

    const [completionSummary] = await pool.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_enrollments,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_enrollments,
        ROUND(IFNULL(COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) / NULLIF(COUNT(DISTINCT e.id), 0) * 100, 0)) as completion_rate
      FROM enrollments e
    `);

    res.json({
      rolesCount,
      courseStats,
      completionSummary: completionSummary[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher course analytics report
router.get('/teacher', authenticateToken, async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [courses] = await pool.query(`
      SELECT c.id, c.title, c.course_code,
             COUNT(DISTINCT e.student_id) as student_count,
             COUNT(DISTINCT a.id) as assignment_count,
             COUNT(DISTINCT q.id) as quiz_count,
             ROUND(AVG(g.score), 1) as avg_assignment_score,
             ROUND(AVG(qa.score), 1) as avg_quiz_score
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN assignments a ON c.id = a.course_id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      LEFT JOIN assignment_grades g ON s.id = g.submission_id
      LEFT JOIN quizzes q ON c.id = q.course_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE c.created_by = ? OR c.id IN (SELECT course_id FROM course_teachers WHERE teacher_id = ?)
      GROUP BY c.id
    `, [teacherId, teacherId]);

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
