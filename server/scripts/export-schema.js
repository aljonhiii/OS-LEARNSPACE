import { pool } from '../db.js';
import fs from 'fs';
import path from 'path';

const orderedTables = [
  'roles',
  'users',
  'user_roles',
  'course_categories',
  'courses',
  'course_teachers',
  'enrollments',
  'modules',
  'lessons',
  'learning_materials',
  'lesson_progress',
  'assignments',
  'submissions',
  'assignment_grades',
  'quizzes',
  'questions',
  'question_choices',
  'quiz_attempts',
  'quiz_answers',
  'announcements',
  'notifications',
  'discussions',
  'discussion_replies',
  'achievement_definitions',
  'student_achievements',
  'audit_logs',
  'system_settings'
];

async function generateSchema() {
  console.log('Generating schema.sql from live MariaDB...');

  let sql = `-- ====================================================================
-- LEARNSPACE MINI LEARNING MANAGEMENT SYSTEM (LMS)
-- Database DDL Schema & Initial Production Seed Data
-- Target Engine: MariaDB 10.6+ / MySQL 8.0+
-- Database: app_db
-- ====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS \`app_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`app_db\`;

-- --------------------------------------------------------------------
-- TABLE STRUCTURES
-- --------------------------------------------------------------------
`;

  for (const table of orderedTables) {
    const [res] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
    sql += `\n-- Table structure for table \`${table}\`\n`;
    sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    sql += res[0]['Create Table'] + ';\n';
  }

  sql += `
-- --------------------------------------------------------------------
-- INITIAL SEED DATA
-- --------------------------------------------------------------------

-- 1. Roles
INSERT INTO \`roles\` (\`id\`, \`name\`, \`description\`) VALUES
(1, 'admin', 'Full platform administrative control'),
(2, 'teacher', 'Faculty instructor managing curriculum and grading'),
(3, 'student', 'Enrolled learner accessing coursework and assessments')
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);

-- 2. Initial Users (All default passwords: password123)
INSERT INTO \`users\` (\`id\`, \`first_name\`, \`last_name\`, \`email\`, \`password_hash\`, \`avatar_url\`, \`account_status\`, \`headline\`, \`location\`) VALUES
(1, 'Elena', 'Rostova', 'admin@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'active', 'Academic Dean & Chief Administrator', 'Kyiv, Ukraine'),
(2, 'Cameron', 'Williamson', 'cameron@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active', 'Senior UI/UX Instructor & Architect', 'Ukraine, 17:37 (GMT +3)'),
(3, 'Jane', 'Cooper', 'jane.cooper@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'active', 'Design Systems Scholar', 'Kyiv, Ukraine'),
(4, 'Floyd', 'Miles', 'floyd.miles@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'active', 'Frontend Engineering Fellow', 'Lviv, Ukraine'),
(5, 'Leslie', 'Alexander', 'leslie.alexander@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active', 'Product Design Apprentice', 'Odesa, Ukraine'),
(6, 'Alex', 'Johnson', 'student.alex@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'active', 'Interactive Systems Student', 'Dnipro, Ukraine')
ON DUPLICATE KEY UPDATE \`first_name\` = VALUES(\`first_name\`);

-- 3. User Roles Mapping
INSERT INTO \`user_roles\` (\`user_id\`, \`role_id\`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 3),
(5, 3),
(6, 3)
ON DUPLICATE KEY UPDATE \`role_id\` = VALUES(\`role_id\`);

-- 4. Course Categories
INSERT INTO \`course_categories\` (\`id\`, \`name\`, \`description\`, \`icon\`, \`status\`) VALUES
(1, 'Design & Architecture', 'Design systems, tokens, typography, and visual hierarchy', 'Palette', 'active'),
(2, 'Software Engineering', 'Full-stack development, modern web APIs, and architecture', 'Code', 'active'),
(3, 'Data & Cloud Systems', 'Relational database modeling, SQL, and distributed infrastructure', 'Database', 'active')
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);

-- 5. Courses
INSERT INTO \`courses\` (\`id\`, \`category_id\`, \`course_code\`, \`title\`, \`short_description\`, \`description\`, \`cover_image\`, \`status\`, \`created_by\`) VALUES
(1, 1, 'UXD-201', 'UI/UX Design Systems & Visual Hierarchy', 'Comprehensive institutional course on creating scalable, accessible design systems.', '# UI/UX Design Systems\\n\\nLearn visual hierarchy, tokens, accessibility, and component architectures.', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600', 'published', 2),
(2, 2, 'WEB-301', 'Full-Stack Web Development & Modern APIs', 'Deep dive into RESTful architectures, Express, authentication, and relational persistence.', '# Full-Stack Web Development\\n\\nLearn backend APIs, database indexing, and frontend state management.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', 'published', 2),
(3, 3, 'DAT-102', 'Relational Database Design with MariaDB', 'Master SQL queries, indexes, normalization, transactions, and relational schemas.', '# Relational Databases\\n\\nUnderstand foreign key constraints, joins, views, and data integrity.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600', 'published', 2)
ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`);

-- 6. Course Teachers
INSERT INTO \`course_teachers\` (\`course_id\`, \`teacher_id\`) VALUES
(1, 2),
(2, 2),
(3, 2)
ON DUPLICATE KEY UPDATE \`teacher_id\` = VALUES(\`teacher_id\`);

-- 7. Enrollments
INSERT INTO \`enrollments\` (\`course_id\`, \`student_id\`, \`status\`) VALUES
(1, 3, 'active'),
(1, 4, 'active'),
(1, 5, 'active'),
(2, 3, 'active'),
(2, 4, 'active'),
(3, 3, 'active')
ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`);

-- 8. Modules
INSERT INTO \`modules\` (\`id\`, \`course_id\`, \`title\`, \`description\`, \`order_index\`) VALUES
(1, 1, 'Module 1: Foundations of Design Systems', 'Atomic design principles, style guides, and systematic components.', 1),
(2, 1, 'Module 2: Typography & Spacing Systems', 'Modular scales, line-height calibration, and 4px/8px grid discipline.', 2),
(3, 2, 'Module 1: Backend Architecture & REST', 'Routing, controllers, validation middleware, and HTTP response codes.', 1)
ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`);

-- 9. Lessons
INSERT INTO \`lessons\` (\`id\`, \`module_id\`, \`title\`, \`content\`, \`estimated_minutes\`, \`order_index\`) VALUES
(1, 1, 'Atomic Design & Component Anatomy', '# Atomic Design & Component Anatomy\\n\\n### Key Principles\\n1. Atoms: basic foundational elements\\n2. Molecules: groups of atoms functioning together\\n3. Organisms: distinct dashboard sections\\n4. Templates: page layout scaffolds\\n5. Pages: real concrete screens', 30, 1),
(2, 1, 'Design Tokens & Semantic Variables', '# Design Tokens & Semantic Variables\\n\\nDesign tokens are the visual design atoms of the design system.', 25, 2),
(3, 2, 'Typographic Hierarchy & Modular Scale', '# Typographic Hierarchy\\n\\nExplore font scale ratios, line heights, and optical weights.', 35, 1)
ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`);

-- 10. Assignments
INSERT INTO \`assignments\` (\`id\`, \`course_id\`, \`title\`, \`instructions\`, \`max_score\`, \`due_at\`, \`status\`) VALUES
(1, 1, 'Design Token Specification Deliverable', 'Construct a JSON or CSS custom property design token dictionary containing primary, neutral, semantic, and spacing tokens.', 100, DATE_ADD(NOW(), INTERVAL 7 DAY), 'published'),
(2, 1, 'Dashboard Navigation Wireframe & Architecture', 'Design high-fidelity wireframes for responsive desktop sidebar and mobile navigation drawer.', 100, DATE_ADD(NOW(), INTERVAL 14 DAY), 'published')
ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`);

-- 11. Submissions & Grades
INSERT INTO \`submissions\` (\`id\`, \`assignment_id\`, \`student_id\`, \`submission_text\`, \`file_name\`, \`status\`, \`submitted_at\`) VALUES
(1, 1, 3, 'Attached the complete JSON token tokens.json mapping color, spacing, typography scales.', 'tokens.json', 'graded', NOW())
ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`);

INSERT INTO \`assignment_grades\` (\`submission_id\`, \`grader_id\`, \`score\`, \`feedback\`, \`graded_at\`) VALUES
(1, 2, 95.00, 'Superb semantic structure and clean token taxonomy. Excellent adherence to design system specifications.', NOW())
ON DUPLICATE KEY UPDATE \`score\` = VALUES(\`score\`);

-- 12. Quizzes & Questions
INSERT INTO \`quizzes\` (\`id\`, \`course_id\`, \`title\`, \`instructions\`, \`time_limit_minutes\`, \`passing_score\`, \`status\`) VALUES
(1, 1, 'UX Foundations Knowledge Check', 'Answer multiple choice questions on design tokens, contrast ratios, and modular spacing grids.', 15, 75.00, 'published')
ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`);

INSERT INTO \`questions\` (\`id\`, \`quiz_id\`, \`prompt\`, \`points\`, \`question_type\`, \`order_index\`) VALUES
(1, 1, 'Which WCAG contrast ratio is mandated for normal body text under Level AA standards?', 5, 'multiple_choice', 1),
(2, 1, 'What is the primary benefit of design tokens over hardcoded hex values?', 5, 'multiple_choice', 2)
ON DUPLICATE KEY UPDATE \`prompt\` = VALUES(\`prompt\`);

INSERT INTO \`question_choices\` (\`id\`, \`question_id\`, \`choice_text\`, \`is_correct\`) VALUES
(1, 1, '4.5:1', 1),
(2, 1, '3:1', 0),
(3, 1, '7:1', 0),
(4, 1, '2:1', 0),
(5, 2, 'Platform-agnostic single source of truth that cascades across platforms', 1),
(6, 2, 'Smaller file bundle size exclusively in SVG files', 0),
(7, 2, 'Eliminates the requirement for CSS', 0)
ON DUPLICATE KEY UPDATE \`choice_text\` = VALUES(\`choice_text\`);

-- 13. System Settings
INSERT INTO \`system_settings\` (\`setting_key\`, \`setting_value\`, \`category\`, \`description\`) VALUES
('platform_name', 'LearnSpace', 'general', 'Institutional platform name'),
('academic_term', 'Spring 2026', 'general', 'Current active academic term'),
('allow_self_enrollment', 'true', 'enrollment', 'Allow students to self-enroll in published courses'),
('max_upload_size_mb', '25', 'storage', 'Maximum file upload size per deliverable')
ON DUPLICATE KEY UPDATE \`setting_value\` = VALUES(\`setting_value\`);

-- 14. Achievement Definitions
INSERT INTO \`achievement_definitions\` (\`id\`, \`code\`, \`name\`, \`description\`, \`icon\`, \`points\`) VALUES
(1, 'FIRST_ENROLLMENT', 'First Steps', 'Enrolled in your first learning course', 'GraduationCap', 50),
(2, 'TOKEN_MASTER', 'Token Master', 'Demonstrated proficiency in design tokens and system architecture', 'Award', 100),
(3, 'VERIFIED_DELIVERABLE', 'Verified Deliverable', 'Achieved a graded submission with 90%+ score', 'FileText', 150)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);

INSERT INTO \`student_achievements\` (\`student_id\`, \`achievement_id\`, \`earned_at\`) VALUES
(3, 1, NOW()),
(3, 2, NOW()),
(3, 3, NOW())
ON DUPLICATE KEY UPDATE \`earned_at\` = VALUES(\`earned_at\`);

SET FOREIGN_KEY_CHECKS = 1;
`;

  fs.writeFileSync('schema.sql', sql);
  fs.writeFileSync(path.join('server', 'schema.sql'), sql);
  console.log('✅ schema.sql successfully written to root and server/ directory!');
  process.exit(0);
}

generateSchema().catch(err => {
  console.error('Error generating schema:', err);
  process.exit(1);
});
