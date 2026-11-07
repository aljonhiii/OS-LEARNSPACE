import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all assignments (optionally filter by courseId or user)
router.get('/', authenticateToken, async (req, res) => {
  const { courseId } = req.query;
  const user = req.user;

  try {
    let query = `
      SELECT a.*, c.title as course_title, c.course_code,
             COUNT(DISTINCT s.id) as total_submissions,
             COUNT(DISTINCT CASE WHEN s.status = 'graded' THEN s.id END) as graded_count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ` AND a.course_id = ?`;
      params.push(courseId);
    }

    query += ` GROUP BY a.id ORDER BY a.due_at ASC`;
    const [assignments] = await pool.query(query, params);

    // If student, attach their personal submission status
    if (user.role === 'student') {
      for (const a of assignments) {
        const [mySub] = await pool.query(`
          SELECT s.*, g.score, g.max_score, g.student_feedback
          FROM submissions s
          LEFT JOIN assignment_grades g ON s.id = g.submission_id
          WHERE s.assignment_id = ? AND s.student_id = ?
        `, [a.id, user.id]);
        a.mySubmission = mySub[0] || null;
      }
    }

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create assignment (Teacher / Admin)
router.post('/', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { course_id, title, instructions, max_score, due_at, allow_late } = req.body;
  if (!course_id || !title) {
    return res.status(400).json({ error: 'Course ID and title are required' });
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO assignments (course_id, title, instructions, max_score, available_at, due_at, allow_late_submission, status, created_by)
      VALUES (?, ?, ?, ?, NOW(), ?, ?, 'open', ?)
    `, [course_id, title, instructions || '', max_score || 100, due_at || null, allow_late !== false, req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'Assignment created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignment details
router.get('/:id', authenticateToken, async (req, res) => {
  const assignmentId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const [assignments] = await pool.query(`
      SELECT a.*, c.title as course_title, c.course_code 
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = ?
    `, [assignmentId]);

    if (assignments.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    const assignment = assignments[0];

    // If teacher or admin, fetch ALL student submissions
    if (userRole === 'teacher' || userRole === 'admin') {
      const [submissions] = await pool.query(`
        SELECT s.*, CONCAT(u.first_name, ' ', u.last_name) as student_name, u.avatar_url,
               g.score, g.max_score, g.student_feedback, g.graded_at
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN assignment_grades g ON s.id = g.submission_id
        WHERE s.assignment_id = ?
        ORDER BY s.submitted_at DESC
      `, [assignmentId]);

      return res.json({ ...assignment, submissions });
    }

    // If student, fetch ONLY their own submission
    const [mySubmissions] = await pool.query(`
      SELECT s.*, g.score, g.max_score, g.student_feedback, g.graded_at
      FROM submissions s
      LEFT JOIN assignment_grades g ON s.id = g.submission_id
      WHERE s.assignment_id = ? AND s.student_id = ?
    `, [assignmentId, userId]);

    res.json({
      ...assignment,
      mySubmission: mySubmissions[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student submits assignment
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const assignmentId = req.params.id;
  const studentId = req.user.id;
  const { submission_text, file_name } = req.body;

  try {
    await pool.query(`
      INSERT INTO submissions (assignment_id, student_id, submission_text, file_name, status, submitted_at)
      VALUES (?, ?, ?, ?, 'submitted', NOW())
      ON DUPLICATE KEY UPDATE submission_text = VALUES(submission_text), file_name = VALUES(file_name), status = 'submitted', submitted_at = NOW()
    `, [assignmentId, studentId, submission_text, file_name || 'submission-file.pdf']);

    res.json({ success: true, message: 'Assignment submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher grades a submission
router.post('/submissions/:id/grade', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const submissionId = req.params.id;
  const teacherId = req.user.id;
  const { score, max_score, feedback } = req.body;

  try {
    await pool.query(`
      INSERT INTO assignment_grades (submission_id, graded_by, score, max_score, student_feedback, graded_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE score = VALUES(score), max_score = VALUES(max_score), student_feedback = VALUES(student_feedback), graded_at = NOW()
    `, [submissionId, teacherId, score, max_score || 100, feedback]);

    await pool.query(`UPDATE submissions SET status = 'graded' WHERE id = ?`, [submissionId]);

    res.json({ success: true, message: 'Grade and feedback recorded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete assignment
router.delete('/:id', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM assignments WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
