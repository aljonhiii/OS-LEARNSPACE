import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all system settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT setting_key, setting_value, updated_at FROM system_settings`);
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update system settings (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const settings = req.body;
  try {
    for (const [key, val] of Object.entries(settings)) {
      await pool.query(`
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
      `, [key, String(val)]);
    }

    // Log the action to audit_logs
    await pool.query(`
      INSERT INTO audit_logs (actor_user_id, action, entity_type, summary)
      VALUES (?, 'UPDATE_SETTINGS', 'system', 'Updated platform system configuration')
    `, [req.user.id]);

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
