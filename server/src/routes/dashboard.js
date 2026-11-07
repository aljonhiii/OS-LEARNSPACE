import express from 'express';
import { pool } from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    if (userRole === 'teacher') {
      // 1. Teacher Profile
      const [userRows] = await pool.query(
        `SELECT u.id, u.first_name, u.last_name, u.avatar_url, u.headline, u.location 
         FROM users u WHERE u.id = ?`,
        [userId]
      );

      // 2. Assigned Courses with Enrollment Counts (FULLSYSTEM.md 8.1)
      const [assignedCourses] = await pool.query(`
        SELECT c.id, c.title, c.course_code, c.status, c.cover_image,
               COUNT(DISTINCT e.student_id) as student_count,
               COUNT(DISTINCT m.id) as module_count
        FROM courses c
        LEFT JOIN course_teachers ct ON c.id = ct.course_id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
        LEFT JOIN modules m ON c.id = m.course_id
        WHERE c.created_by = ? OR ct.teacher_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [userId, userId]);

      // 3. Pending Submissions Awaiting Grading (FULLSYSTEM.md 8.1)
      const [pendingSubmissions] = await pool.query(`
        SELECT s.id, s.submitted_at, s.file_name,
               a.id as assignment_id, a.title as assignment_title, a.max_score,
               c.id as course_id, c.title as course_title, c.course_code,
               u.id as student_id, CONCAT(u.first_name, ' ', u.last_name) as student_name,
               u.avatar_url as student_avatar
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN courses c ON a.course_id = c.id
        LEFT JOIN course_teachers ct ON c.id = ct.course_id
        JOIN users u ON s.student_id = u.id
        WHERE (c.created_by = ? OR ct.teacher_id = ?) AND s.status = 'submitted'
        ORDER BY s.submitted_at ASC
        LIMIT 10
      `, [userId, userId]);

      // 4. Recent Student Activity & Quiz Results (FULLSYSTEM.md 8.1)
      const [recentQuizAttempts] = await pool.query(`
        SELECT qa.id, qa.score, qa.max_score, qa.submitted_at,
               q.title as quiz_title, c.title as course_title,
               CONCAT(u.first_name, ' ', u.last_name) as student_name,
               u.avatar_url as student_avatar
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        JOIN courses c ON q.course_id = c.id
        LEFT JOIN course_teachers ct ON c.id = ct.course_id
        JOIN users u ON qa.student_id = u.id
        WHERE c.created_by = ? OR ct.teacher_id = ?
        ORDER BY qa.submitted_at DESC
        LIMIT 5
      `, [userId, userId]);

      // 5. Upcoming Assessment Deadlines (FULLSYSTEM.md 8.1)
      const [upcomingDeadlines] = await pool.query(`
        SELECT a.id, a.title, a.due_at, a.max_score,
               c.title as course_title, c.course_code,
               COUNT(DISTINCT s.id) as submission_count
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        LEFT JOIN course_teachers ct ON c.id = ct.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id
        WHERE (c.created_by = ? OR ct.teacher_id = ?) AND a.status = 'open'
        GROUP BY a.id
        ORDER BY a.due_at ASC
        LIMIT 5
      `, [userId, userId]);

      // 6. Distinct Enrolled Students Roster Overview
      const [enrolledStudents] = await pool.query(`
        SELECT DISTINCT
          u.id, CONCAT(u.first_name, ' ', u.last_name) as name,
          u.avatar_url as avatar,
          u.email,
          e.enrolled_at,
          c.title as course_title
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN course_teachers ct ON c.id = ct.course_id
        JOIN users u ON e.student_id = u.id
        WHERE c.created_by = ? OR ct.teacher_id = ?
        LIMIT 6
      `, [userId, userId]);

      // 7. Active Quizzes Count
      const [quizCount] = await pool.query(`
        SELECT COUNT(DISTINCT q.id) as total
        FROM quizzes q
        JOIN courses c ON q.course_id = c.id
        LEFT JOIN course_teachers ct ON c.id = ct.course_id
        WHERE (c.created_by = ? OR ct.teacher_id = ?) AND q.status = 'published'
      `, [userId, userId]);

      // 8. Total Distinct Students Count
      const [studentCount] = await pool.query(`
        SELECT COUNT(DISTINCT e.student_id) as total
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN course_teachers ct ON c.id = ct.course_id
        WHERE (c.created_by = ? OR ct.teacher_id = ?) AND e.status = 'active'
      `, [userId, userId]);

      return res.json({
        role: 'teacher',
        profile: userRows[0],
        assignedCourses,
        pendingSubmissions,
        recentQuizAttempts,
        upcomingDeadlines,
        enrolledStudents,
        stats: {
          assignedCourses: assignedCourses.length,
          totalStudents: studentCount[0]?.total || 0,
          pendingSubmissions: pendingSubmissions.length,
          activeQuizzes: quizCount[0]?.total || 0
        }
      });
    }

    if (userRole === 'student') {
      // Student Dashboard
      const [userRows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [userId]);
      const [achievements] = await pool.query(`
        SELECT ad.*, sa.earned_at 
        FROM student_achievements sa 
        JOIN achievement_definitions ad ON sa.achievement_id = ad.id 
        WHERE sa.student_id = ?
      `, [userId]);

      // Calculate real course progress percentage
      const [courses] = await pool.query(`
        SELECT 
          c.id, c.course_code, c.title, c.short_description, c.cover_image,
          COUNT(DISTINCT l.id) as total_lessons,
          COUNT(DISTINCT lp.lesson_id) as completed_lessons,
          ROUND(IFNULL(COUNT(DISTINCT lp.lesson_id) / NULLIF(COUNT(DISTINCT l.id), 0) * 100, 0)) as progress_pct
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN modules m ON c.id = m.course_id
        LEFT JOIN lessons l ON m.id = l.module_id AND l.status = 'published' AND l.is_required = 1
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = e.student_id AND lp.status = 'completed'
        WHERE e.student_id = ? AND e.status = 'active'
        GROUP BY c.id
      `, [userId]);

      // Upcoming assignments & quizzes
      const [upcomingAssignments] = await pool.query(`
        SELECT a.id, a.title, a.due_at, c.title as course_title,
               s.status as submission_status, g.score, g.max_score
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON c.id = e.course_id AND e.student_id = ?
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
        LEFT JOIN assignment_grades g ON s.id = g.submission_id
        WHERE a.status = 'open'
        ORDER BY a.due_at ASC
        LIMIT 5
      `, [userId, userId]);

      const [upcomingQuizzes] = await pool.query(`
        SELECT q.id, q.title, q.time_limit_minutes, q.passing_score, c.title as course_title,
               qa.status as attempt_status, qa.score, qa.max_score
        FROM quizzes q
        JOIN courses c ON q.course_id = c.id
        JOIN enrollments e ON c.id = e.course_id AND e.student_id = ?
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = ?
        WHERE q.status = 'published'
        LIMIT 5
      `, [userId, userId]);

      return res.json({
        role: 'student',
        profile: userRows[0],
        achievements,
        courses,
        upcomingAssignments,
        upcomingQuizzes,
        overallProgress: 82,
        stats: {
          enrolledCourses: courses.length,
          completedLessons: courses.reduce((acc, c) => acc + (c.completed_lessons || 0), 0),
          pendingAssignments: upcomingAssignments.filter(a => !a.submission_status).length,
          achievementsCount: achievements.length
        }
      });
    }

    if (userRole === 'admin') {
      // Administrator Dashboard
      const [totalUsers] = await pool.query(`SELECT COUNT(*) as count FROM users`);
      const [totalStudents] = await pool.query(`
        SELECT COUNT(*) as count FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name = 'student'
      `);
      const [totalTeachers] = await pool.query(`
        SELECT COUNT(*) as count FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name = 'teacher'
      `);
      const [totalCourses] = await pool.query(`SELECT COUNT(*) as count FROM courses WHERE status = 'published'`);
      const [totalEnrollments] = await pool.query(`SELECT COUNT(*) as count FROM enrollments WHERE status = 'active'`);
      
      const [recentUsers] = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.account_status, u.created_at, r.name as role
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        ORDER BY u.created_at DESC LIMIT 6
      `);

      const [recentAuditLogs] = await pool.query(`
        SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) as actor_name
        FROM audit_logs al
        LEFT JOIN users u ON al.actor_user_id = u.id
        ORDER BY al.created_at DESC LIMIT 8
      `);

      return res.json({
        role: 'admin',
        stats: {
          totalUsers: totalUsers[0].count,
          totalStudents: totalStudents[0].count,
          totalTeachers: totalTeachers[0].count,
          activeCourses: totalCourses[0].count,
          totalEnrollments: totalEnrollments[0].count,
          systemStatus: 'Healthy (MariaDB Connected)'
        },
        recentUsers,
        recentAuditLogs
      });
    }

    res.status(400).json({ error: 'Unknown role' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
