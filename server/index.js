import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection } from './db.js';

import authRouter from './src/routes/auth.js';
import dashboardRouter from './src/routes/dashboard.js';
import coursesRouter from './src/routes/courses.js';
import categoriesRouter from './src/routes/categories.js';
import enrollmentsRouter from './src/routes/enrollments.js';
import lessonsRouter from './src/routes/lessons.js';
import materialsRouter from './src/routes/materials.js';
import assignmentsRouter from './src/routes/assignments.js';
import quizzesRouter from './src/routes/quizzes.js';
import gradebookRouter from './src/routes/gradebook.js';
import discussionsRouter from './src/routes/discussions.js';
import reportsRouter from './src/routes/reports.js';
import usersRouter from './src/routes/users.js';
import announcementsRouter from './src/routes/announcements.js';
import notificationsRouter from './src/routes/notifications.js';
import settingsRouter from './src/routes/settings.js';
import auditLogsRouter from './src/routes/auditLogs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/enrollments', enrollmentsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/gradebook', gradebookRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit-logs', auditLogsRouter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT VERSION() as version, NOW() as currentTime');
    res.json({
      status: 'online',
      message: 'LearnSpace Express API connected to MariaDB on Ubuntu VM!',
      dbVersion: rows[0].version,
      serverTime: rows[0].currentTime,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 LearnSpace API running on http://localhost:${PORT}`);
  await testConnection();
});
