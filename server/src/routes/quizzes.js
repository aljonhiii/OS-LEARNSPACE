import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all quizzes (optionally filter by courseId)
router.get('/', authenticateToken, async (req, res) => {
  const { courseId } = req.query;
  const user = req.user;

  try {
    let query = `
      SELECT q.*, c.title as course_title, c.course_code,
             COUNT(DISTINCT quest.id) as question_count,
             COUNT(DISTINCT qa.id) as attempt_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      LEFT JOIN questions quest ON q.id = quest.quiz_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ` AND q.course_id = ?`;
      params.push(courseId);
    }

    query += ` GROUP BY q.id ORDER BY q.created_at DESC`;
    const [quizzes] = await pool.query(query, params);

    // If student, check if they have taken each quiz
    if (user.role === 'student') {
      for (const q of quizzes) {
        const [myAttempts] = await pool.query(`
          SELECT * FROM quiz_attempts WHERE quiz_id = ? AND student_id = ? ORDER BY attempt_number DESC
        `, [q.id, user.id]);
        q.myAttempts = myAttempts;
        q.hasPassed = myAttempts.some(a => (a.score / a.max_score) * 100 >= q.passing_score);
      }
    }

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create quiz (Teacher / Admin)
router.post('/', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { course_id, title, instructions, time_limit_minutes, passing_score } = req.body;
  if (!course_id || !title) {
    return res.status(400).json({ error: 'Course and title are required' });
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO quizzes (course_id, title, instructions, time_limit_minutes, max_attempts, passing_score, status, created_by)
      VALUES (?, ?, ?, ?, 3, ?, 'published', ?)
    `, [course_id, title, instructions || '', time_limit_minutes || 15, passing_score || 70.00, req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'Quiz created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add question to quiz
router.post('/:id/questions', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const quizId = req.params.id;
  const { question_text, question_type, points, explanation, choices } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [count] = await conn.query(`SELECT COUNT(*) as cnt FROM questions WHERE quiz_id = ?`, [quizId]);
    const position = count[0].cnt + 1;

    const [questResult] = await conn.query(`
      INSERT INTO questions (quiz_id, question_type, question_text, points, position, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [quizId, question_type || 'multiple_choice', question_text, points || 10, position, explanation || '']);

    const questionId = questResult.insertId;

    if (choices && Array.isArray(choices)) {
      for (let i = 0; i < choices.length; i++) {
        const c = choices[i];
        await conn.query(`
          INSERT INTO question_choices (question_id, choice_text, is_correct, position)
          VALUES (?, ?, ?, ?)
        `, [questionId, c.text, c.isCorrect || false, i + 1]);
      }
    }

    await conn.commit();
    res.status(201).json({ id: questionId, message: 'Question added successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Get quiz details and questions
router.get('/:id', authenticateToken, async (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const [quizzes] = await pool.query(`
      SELECT q.*, c.title as course_title 
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = ?
    `, [quizId]);

    if (quizzes.length === 0) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = quizzes[0];

    // Fetch questions
    const [questions] = await pool.query(`
      SELECT id, quiz_id, question_type, question_text, points, position, explanation
      FROM questions WHERE quiz_id = ? ORDER BY position ASC
    `, [quizId]);

    // Fetch choices for each question
    for (const q of questions) {
      const fields = (userRole === 'teacher' || userRole === 'admin') 
        ? 'id, question_id, choice_text, is_correct, position'
        : 'id, question_id, choice_text, position';

      const [choices] = await pool.query(`
        SELECT ${fields} FROM question_choices WHERE question_id = ? ORDER BY position ASC
      `, [q.id]);
      q.choices = choices;
    }

    // Check existing student attempts
    const [myAttempts] = await pool.query(`
      SELECT * FROM quiz_attempts WHERE quiz_id = ? AND student_id = ? ORDER BY attempt_number DESC
    `, [quizId, userId]);

    res.json({
      ...quiz,
      questions,
      myAttempts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit quiz answers and auto-grade
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const quizId = req.params.id;
  const studentId = req.user.id;
  const { answers } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingAttempts] = await conn.query(
      `SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?`,
      [quizId, studentId]
    );
    const attemptNumber = existingAttempts[0].count + 1;

    const [questions] = await conn.query(
      `SELECT q.id, q.points, qc.id as correct_choice_id
       FROM questions q
       LEFT JOIN question_choices qc ON q.id = qc.question_id AND qc.is_correct = TRUE
       WHERE q.quiz_id = ?`,
      [quizId]
    );

    let totalScore = 0;
    let maxScore = 0;

    const scoredAnswers = questions.map(q => {
      maxScore += parseFloat(q.points);
      const studentAns = answers?.find(a => a.question_id === q.id);
      const isCorrect = studentAns && studentAns.selected_choice_id === q.correct_choice_id;
      const score = isCorrect ? parseFloat(q.points) : 0;
      if (isCorrect) totalScore += score;

      return {
        question_id: q.id,
        selected_choice_id: studentAns?.selected_choice_id || null,
        answer_text: studentAns?.answer_text || null,
        score,
        is_correct: isCorrect
      };
    });

    const [attemptResult] = await conn.query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, attempt_number, score, max_score, status, started_at, submitted_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', NOW(), NOW())`,
      [quizId, studentId, attemptNumber, totalScore, maxScore]
    );
    const attemptId = attemptResult.insertId;

    for (const ans of scoredAnswers) {
      await conn.query(
        `INSERT INTO quiz_answers (attempt_id, question_id, selected_choice_id, answer_text, score, is_correct)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attemptId, ans.question_id, ans.selected_choice_id, ans.answer_text, ans.score, ans.is_correct]
      );
    }

    await conn.commit();

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    res.json({
      success: true,
      attemptId,
      score: totalScore,
      maxScore,
      percentage,
      passed: percentage >= 70,
      scoredAnswers
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Delete quiz
router.delete('/:id', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM quizzes WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
