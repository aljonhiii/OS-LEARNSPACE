import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const [courses] = await pool.query(`
      SELECT 
        c.*, 
        cat.name as category_name,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        u.avatar_url as teacher_avatar,
        COUNT(DISTINCT e.student_id) as enrolled_count
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.status != 'archived'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single course details
router.get('/:id', async (req, res) => {
  const courseId = req.params.id;
  try {
    const [courses] = await pool.query(`
      SELECT c.*, cat.name as category_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             u.avatar_url as teacher_avatar
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [courseId]);

    if (courses.length === 0) return res.status(404).json({ error: 'Course not found' });
    const course = courses[0];

    // Fetch modules
    const [modules] = await pool.query(`
      SELECT * FROM modules WHERE course_id = ? ORDER BY position ASC
    `, [courseId]);

    // Fetch lessons for each module
    for (const mod of modules) {
      const [lessons] = await pool.query(`
        SELECT id, module_id, title, description, content, estimated_minutes, position, is_required, status
        FROM lessons WHERE module_id = ? ORDER BY position ASC
      `, [mod.id]);
      mod.lessons = lessons;
    }

    // Fetch materials
    const [materials] = await pool.query(`
      SELECT * FROM learning_materials WHERE course_id = ? ORDER BY created_at DESC
    `, [courseId]);

    // Fetch assignments
    const [assignments] = await pool.query(`
      SELECT * FROM assignments WHERE course_id = ? ORDER BY due_at ASC
    `, [courseId]);

    // Fetch quizzes
    const [quizzes] = await pool.query(`
      SELECT * FROM quizzes WHERE course_id = ? ORDER BY created_at DESC
    `, [courseId]);

    // Fetch enrolled students
    const [students] = await pool.query(`
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.email, u.avatar_url, e.enrolled_at, e.status
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.course_id = ?
    `, [courseId]);

    res.json({
      ...course,
      modules,
      materials,
      assignments,
      quizzes,
      students
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll in a course (Student)
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user.id;

  try {
    await pool.query(`
      INSERT INTO enrollments (course_id, student_id, status)
      VALUES (?, ?, 'active')
      ON DUPLICATE KEY UPDATE status = 'active'
    `, [courseId, studentId]);

    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new course (Admin / Teacher)
router.post('/', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { title, course_code, category_id, short_description, description, cover_image, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const code = course_code || `CRS-${Date.now().toString().slice(-4)}`;
    const [result] = await pool.query(`
      INSERT INTO courses (title, course_code, category_id, short_description, description, cover_image, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, code, category_id || 1, short_description || '', description || '', cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', status || 'published', req.user.id]);

    const newCourseId = result.insertId;

    // Assign creating teacher to course
    if (req.user.role === 'teacher') {
      await pool.query(`INSERT IGNORE INTO course_teachers (course_id, teacher_id) VALUES (?, ?)`, [newCourseId, req.user.id]);
    }

    res.status(201).json({ id: newCourseId, message: 'Course created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update course
router.patch('/:id', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { title, course_code, category_id, short_description, description, cover_image, status } = req.body;
  try {
    await pool.query(`
      UPDATE courses 
      SET title = COALESCE(?, title),
          course_code = COALESCE(?, course_code),
          category_id = COALESCE(?, category_id),
          short_description = COALESCE(?, short_description),
          description = COALESCE(?, description),
          cover_image = COALESCE(?, cover_image),
          status = COALESCE(?, status)
      WHERE id = ?
    `, [title, course_code, category_id, short_description, description, cover_image, status, req.params.id]);

    res.json({ success: true, message: 'Course updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete or archive course
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await pool.query(`UPDATE courses SET status = 'archived' WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Course archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign teacher to course (Admin)
router.post('/:id/teachers', authenticateToken, requireRole('admin'), async (req, res) => {
  const { teacher_id } = req.body;
  try {
    await pool.query(`
      INSERT INTO course_teachers (course_id, teacher_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE assigned_at = NOW()
    `, [req.params.id, teacher_id]);

    res.json({ success: true, message: 'Teacher assigned to course' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Module CRUD
router.post('/:id/modules', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Module title is required' });

  try {
    const [count] = await pool.query(`SELECT COUNT(*) as cnt FROM modules WHERE course_id = ?`, [req.params.id]);
    const position = count[0].cnt + 1;

    const [result] = await pool.query(`
      INSERT INTO modules (course_id, title, description, position, status)
      VALUES (?, ?, ?, ?, 'published')
    `, [req.params.id, title, description || '', position]);

    res.status(201).json({ id: result.insertId, message: 'Module created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lesson CRUD within a module
router.post('/modules/:moduleId/lessons', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  const { title, description, content, estimated_minutes } = req.body;
  if (!title) return res.status(400).json({ error: 'Lesson title is required' });

  try {
    const [count] = await pool.query(`SELECT COUNT(*) as cnt FROM lessons WHERE module_id = ?`, [req.params.moduleId]);
    const position = count[0].cnt + 1;

    const [result] = await pool.query(`
      INSERT INTO lessons (module_id, title, description, content, estimated_minutes, position, status, is_required)
      VALUES (?, ?, ?, ?, ?, ?, 'published', TRUE)
    `, [req.params.moduleId, title, description || '', content || '', estimated_minutes || 30, position]);

    res.status(201).json({ id: result.insertId, message: 'Lesson created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete module
router.delete('/modules/:id', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM modules WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete lesson
router.delete('/lessons/:id', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM lessons WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
