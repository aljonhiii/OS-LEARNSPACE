import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.168.1.32',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'aljon',
  password: process.env.DB_PASSWORD || 'pogisialjon26',
  database: process.env.DB_NAME || 'app_db',
  multipleStatements: true,
});

export async function initFullDatabase() {
  console.log('🚀 Connecting to MariaDB to verify all LearnSpace tables...');
  const conn = await pool.getConnection();

  try {
    // 1. Roles
    await conn.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255)
      ) ENGINE=InnoDB;
    `);

    // 2. Users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        account_status ENUM('active', 'pending', 'suspended', 'deactivated') DEFAULT 'active',
        headline VARCHAR(255),
        location VARCHAR(100),
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. User Roles
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_role (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 4. Course Categories
    await conn.query(`
      CREATE TABLE IF NOT EXISTS course_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT 'BookOpen',
        status ENUM('active', 'archived') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 5. Courses
    await conn.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        course_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        short_description TEXT,
        description LONGTEXT,
        cover_image TEXT,
        enrollment_method ENUM('open', 'approval', 'invite_only') DEFAULT 'open',
        visibility ENUM('public', 'private') DEFAULT 'public',
        status ENUM('draft', 'published', 'unpublished', 'archived') DEFAULT 'published',
        start_at DATETIME,
        end_at DATETIME,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 6. Course Teachers
    await conn.query(`
      CREATE TABLE IF NOT EXISTS course_teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        teacher_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_course_teacher (course_id, teacher_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 7. Enrollments
    await conn.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        student_id INT NOT NULL,
        status ENUM('pending', 'active', 'completed', 'dropped') DEFAULT 'active',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        UNIQUE KEY uq_course_student (course_id, student_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 8. Modules
    await conn.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        position INT DEFAULT 1,
        status ENUM('draft', 'published') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 9. Lessons
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        module_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content LONGTEXT,
        estimated_minutes INT DEFAULT 30,
        position INT DEFAULT 1,
        status ENUM('draft', 'published') DEFAULT 'published',
        is_required BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 10. Learning Materials
    await conn.query(`
      CREATE TABLE IF NOT EXISTS learning_materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        lesson_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        storage_path TEXT,
        external_url TEXT,
        file_type VARCHAR(50) DEFAULT 'pdf',
        file_size INT DEFAULT 1024,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 11. Lesson Progress
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        student_id INT NOT NULL,
        status ENUM('in_progress', 'completed') DEFAULT 'completed',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_lesson_student (lesson_id, student_id),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 12. Assignments
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        instructions LONGTEXT,
        max_score INT DEFAULT 100,
        available_at DATETIME,
        due_at DATETIME,
        allow_late_submission BOOLEAN DEFAULT TRUE,
        status ENUM('draft', 'open', 'closed') DEFAULT 'open',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 13. Submissions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        submission_text LONGTEXT,
        file_name VARCHAR(255),
        file_url TEXT,
        status ENUM('submitted', 'late', 'graded') DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_late BOOLEAN DEFAULT FALSE,
        UNIQUE KEY uq_assignment_student (assignment_id, student_id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 14. Assignment Grades
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assignment_grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        graded_by INT NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        max_score DECIMAL(5,2) DEFAULT 100.00,
        student_feedback LONGTEXT,
        private_teacher_note TEXT,
        graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_submission_grade (submission_id),
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 15. Quizzes
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        instructions TEXT,
        time_limit_minutes INT DEFAULT 20,
        max_attempts INT DEFAULT 3,
        passing_score DECIMAL(5,2) DEFAULT 70.00,
        status ENUM('draft', 'published', 'closed') DEFAULT 'published',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 16. Questions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
        question_text TEXT NOT NULL,
        points DECIMAL(5,2) DEFAULT 10.00,
        position INT DEFAULT 1,
        explanation TEXT,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 17. Question Choices
    await conn.query(`
      CREATE TABLE IF NOT EXISTS question_choices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        choice_text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        position INT DEFAULT 1,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 18. Quiz Attempts
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        student_id INT NOT NULL,
        attempt_number INT DEFAULT 1,
        score DECIMAL(5,2),
        max_score DECIMAL(5,2) DEFAULT 100.00,
        status ENUM('in_progress', 'submitted') DEFAULT 'submitted',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL,
        UNIQUE KEY uq_quiz_student_attempt (quiz_id, student_id, attempt_number),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 19. Quiz Answers
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_choice_id INT,
        answer_text TEXT,
        score DECIMAL(5,2) DEFAULT 0.00,
        is_correct BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (selected_choice_id) REFERENCES question_choices(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 20. Announcements
    await conn.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT,
        title VARCHAR(255) NOT NULL,
        body LONGTEXT NOT NULL,
        audience ENUM('all', 'teachers', 'students') DEFAULT 'all',
        is_pinned BOOLEAN DEFAULT FALSE,
        created_by INT,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 21. Notifications
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id INT,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 22. Discussions & Replies
    await conn.query(`
      CREATE TABLE IF NOT EXISTS discussions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        lesson_id INT,
        created_by INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        body LONGTEXT NOT NULL,
        status ENUM('open', 'resolved', 'closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS discussion_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        discussion_id INT NOT NULL,
        created_by INT NOT NULL,
        body LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 23. Achievements
    await conn.query(`
      CREATE TABLE IF NOT EXISTS achievement_definitions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT 'Award',
        points INT DEFAULT 50,
        is_active BOOLEAN DEFAULT TRUE
      ) ENGINE=InnoDB;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_student_achievement (student_id, achievement_id),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievement_definitions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 24. Audit Logs
    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actor_user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 25. System Settings
    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Initial system settings
    await conn.query(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES
      ('platform_name', 'LearnSpace LMS'),
      ('timezone', 'Asia/Manila (GMT+8)'),
      ('self_registration', 'true'),
      ('default_enrollment_policy', 'open'),
      ('max_upload_size_mb', '25'),
      ('gamification_enabled', 'true'),
      ('maintenance_mode', 'false');
    `);

    // Seed sample discussions
    await conn.query(`
      INSERT IGNORE INTO discussions (id, course_id, lesson_id, created_by, title, body, status) VALUES
      (1, 1, 1, 3, 'Questions on WCAG 4.5:1 ratio for secondary buttons', 'When styling secondary buttons with light teal or gray borders, how do we guarantee contrast against white card surfaces without looking too heavy?', 'open'),
      (2, 2, NULL, 6, 'Best practices for MariaDB connection pool size in Express', 'What is the optimal connectionLimit setting for high concurrent user loads on Ubuntu Linux?', 'resolved');
    `);

    await conn.query(`
      INSERT IGNORE INTO discussion_replies (id, discussion_id, created_by, body) VALUES
      (1, 1, 2, 'Great question Jane! A common pattern is using a dark slate text (#0F172A) with a 2px semi-transparent border, ensuring the text itself meets the 4.5:1 threshold.'),
      (2, 2, 2, 'For most production Node instances, 10-20 pooled connections per CPU core with queueLimit=0 works best.');
    `);

    console.log('✅ MariaDB schema and tables verified!');
  } catch (err) {
    console.error('Database verification error:', err);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

initFullDatabase();
