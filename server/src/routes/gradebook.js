import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { courseId } = req.query;
  const user = req.user;

  try {
    let targetCourseId = courseId;
    if (!targetCourseId) {
      // Pick first course assigned to this teacher or course 1
      const [courses] = await pool.query(`SELECT id FROM courses LIMIT 1`);
      targetCourseId = courses[0]?.id || 1;
    }

    // 1. Fetch course details
    const [courses] = await pool.query(`SELECT * FROM courses WHERE id = ?`, [targetCourseId]);
    const course = courses[0];

    // 2. Fetch all assignments for this course
    const [assignments] = await pool.query(`SELECT id, title, max_score FROM assignments WHERE course_id = ?`, [targetCourseId]);

    // 3. Fetch all quizzes for this course
    const [quizzes] = await pool.query(`SELECT id, title FROM quizzes WHERE course_id = ?`, [targetCourseId]);

    // 4. Fetch enrolled students with their assignment grades & quiz attempts
    const [students] = await pool.query(`
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.email, u.avatar_url, e.enrolled_at, e.status as enrollment_status
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.course_id = ?
    `, [targetCourseId]);

    // Populate grades for each student
    for (const s of students) {
      // Assignment grades
      const [grades] = await pool.query(`
        SELECT a.id as assignment_id, g.score, g.max_score, g.student_feedback
        FROM assignments a
        JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
        LEFT JOIN assignment_grades g ON sub.id = g.submission_id
        WHERE a.course_id = ?
      `, [s.id, targetCourseId]);
      s.assignmentGrades = grades;

      // Quiz grades
      const [quizScores] = await pool.query(`
        SELECT q.id as quiz_id, MAX(qa.score) as highest_score, MAX(qa.max_score) as max_score
        FROM quizzes q
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = ?
        WHERE q.course_id = ?
        GROUP BY q.id
      `, [s.id, targetCourseId]);
      s.quizScores = quizScores;

      // Overall average
      const totalPossible = assignments.reduce((acc, a) => acc + (a.max_score || 100), 0);
      const earned = grades.reduce((acc, g) => acc + (parseFloat(g.score) || 0), 0);
      s.averagePct = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;
    }

    res.json({
      course,
      assignments,
      quizzes,
      students
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
