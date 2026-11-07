import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all categories with course counts
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT cat.*, COUNT(c.id) as course_count
      FROM course_categories cat
      LEFT JOIN courses c ON cat.id = c.category_id AND c.status = 'published'
      WHERE cat.status = 'active'
      GROUP BY cat.id
      ORDER BY cat.name ASC
    `);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category (Admin)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const [result] = await pool.query(`
      INSERT INTO course_categories (name, description, icon, status)
      VALUES (?, ?, ?, 'active')
    `, [name, description || '', icon || 'BookOpen']);

    res.status(201).json({ id: result.insertId, message: 'Category created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category (Admin)
router.patch('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    await pool.query(`
      UPDATE course_categories SET name = ?, description = ?, icon = ? WHERE id = ?
    `, [name, description, icon, req.params.id]);

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category (Admin)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await pool.query(`UPDATE course_categories SET status = 'archived' WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Category archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
