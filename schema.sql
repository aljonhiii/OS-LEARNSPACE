-- ====================================================================
-- LEARNSPACE MINI LEARNING MANAGEMENT SYSTEM (LMS)
-- Database DDL Schema & Initial Production Seed Data
-- Target Engine: MariaDB 10.6+ / MySQL 8.0+
-- Database: app_db
-- ====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `app_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `app_db`;

-- --------------------------------------------------------------------
-- TABLE STRUCTURES
-- --------------------------------------------------------------------

-- Table structure for table `roles`
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` text DEFAULT NULL,
  `account_status` enum('active','pending','suspended','deactivated') DEFAULT 'active',
  `headline` varchar(255) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `user_roles`
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `course_categories`
DROP TABLE IF EXISTS `course_categories`;
CREATE TABLE `course_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'BookOpen',
  `status` enum('active','archived') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `courses`
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `course_code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `short_description` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `cover_image` text DEFAULT NULL,
  `enrollment_method` enum('open','approval','invite_only') DEFAULT 'open',
  `visibility` enum('public','private') DEFAULT 'public',
  `status` enum('draft','published','unpublished','archived') DEFAULT 'published',
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `course_teachers`
DROP TABLE IF EXISTS `course_teachers`;
CREATE TABLE `course_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_teacher` (`course_id`,`teacher_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `course_teachers_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_teachers_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `enrollments`
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` enum('pending','active','completed','dropped') DEFAULT 'active',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_student` (`course_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `modules`
DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `position` int(11) DEFAULT 1,
  `status` enum('draft','published') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `lessons`
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `estimated_minutes` int(11) DEFAULT 30,
  `position` int(11) DEFAULT 1,
  `status` enum('draft','published') DEFAULT 'published',
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `module_id` (`module_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `learning_materials`
DROP TABLE IF EXISTS `learning_materials`;
CREATE TABLE `learning_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `storage_path` text DEFAULT NULL,
  `external_url` text DEFAULT NULL,
  `file_type` varchar(50) DEFAULT 'pdf',
  `file_size` int(11) DEFAULT 1024,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `learning_materials_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `learning_materials_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `learning_materials_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `lesson_progress`
DROP TABLE IF EXISTS `lesson_progress`;
CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` enum('in_progress','completed') DEFAULT 'completed',
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lesson_student` (`lesson_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `assignments`
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `instructions` longtext DEFAULT NULL,
  `max_score` int(11) DEFAULT 100,
  `available_at` datetime DEFAULT NULL,
  `due_at` datetime DEFAULT NULL,
  `allow_late_submission` tinyint(1) DEFAULT 1,
  `status` enum('draft','open','closed') DEFAULT 'open',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `submissions`
DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_text` longtext DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `status` enum('submitted','late','graded') DEFAULT 'submitted',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_late` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_assignment_student` (`assignment_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `assignment_grades`
DROP TABLE IF EXISTS `assignment_grades`;
CREATE TABLE `assignment_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `graded_by` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) DEFAULT 100.00,
  `student_feedback` longtext DEFAULT NULL,
  `private_teacher_note` text DEFAULT NULL,
  `graded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submission_grade` (`submission_id`),
  KEY `graded_by` (`graded_by`),
  CONSTRAINT `assignment_grades_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_grades_ibfk_2` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `quizzes`
DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `instructions` text DEFAULT NULL,
  `time_limit_minutes` int(11) DEFAULT 20,
  `max_attempts` int(11) DEFAULT 3,
  `passing_score` decimal(5,2) DEFAULT 70.00,
  `status` enum('draft','published','closed') DEFAULT 'published',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `questions`
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer') DEFAULT 'multiple_choice',
  `question_text` text NOT NULL,
  `points` decimal(5,2) DEFAULT 10.00,
  `position` int(11) DEFAULT 1,
  `explanation` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `question_choices`
DROP TABLE IF EXISTS `question_choices`;
CREATE TABLE `question_choices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `choice_text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `position` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `question_choices_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `quiz_attempts`
DROP TABLE IF EXISTS `quiz_attempts`;
CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attempt_number` int(11) DEFAULT 1,
  `score` decimal(5,2) DEFAULT NULL,
  `max_score` decimal(5,2) DEFAULT 100.00,
  `status` enum('in_progress','submitted') DEFAULT 'submitted',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_quiz_student_attempt` (`quiz_id`,`student_id`,`attempt_number`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `quiz_answers`
DROP TABLE IF EXISTS `quiz_answers`;
CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_choice_id` int(11) DEFAULT NULL,
  `answer_text` text DEFAULT NULL,
  `score` decimal(5,2) DEFAULT 0.00,
  `is_correct` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  KEY `question_id` (`question_id`),
  KEY `selected_choice_id` (`selected_choice_id`),
  CONSTRAINT `quiz_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_answers_ibfk_3` FOREIGN KEY (`selected_choice_id`) REFERENCES `question_choices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `announcements`
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `body` longtext NOT NULL,
  `audience` enum('all','teachers','students') DEFAULT 'all',
  `is_pinned` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `notifications`
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT 'system',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `discussions`
DROP TABLE IF EXISTS `discussions`;
CREATE TABLE `discussions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` longtext NOT NULL,
  `status` enum('open','resolved','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `discussions_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `discussions_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `discussions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `discussion_replies`
DROP TABLE IF EXISTS `discussion_replies`;
CREATE TABLE `discussion_replies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `discussion_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `body` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `discussion_id` (`discussion_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `discussion_replies_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `discussion_replies_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `achievement_definitions`
DROP TABLE IF EXISTS `achievement_definitions`;
CREATE TABLE `achievement_definitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'Award',
  `points` int(11) DEFAULT 50,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `student_achievements`
DROP TABLE IF EXISTS `student_achievements`;
CREATE TABLE `student_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_achievement` (`student_id`,`achievement_id`),
  KEY `achievement_id` (`achievement_id`),
  CONSTRAINT `student_achievements_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievement_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `audit_logs`
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actor_user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `actor_user_id` (`actor_user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `system_settings`
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------------------
-- INITIAL SEED DATA
-- --------------------------------------------------------------------

-- 1. Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Full platform administrative control'),
(2, 'teacher', 'Faculty instructor managing curriculum and grading'),
(3, 'student', 'Enrolled learner accessing coursework and assessments')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. Initial Users (All default passwords: password123)
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `avatar_url`, `account_status`, `headline`, `location`) VALUES
(1, 'Elena', 'Rostova', 'admin@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'active', 'Academic Dean & Chief Administrator', 'Kyiv, Ukraine'),
(2, 'Cameron', 'Williamson', 'cameron@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active', 'Senior UI/UX Instructor & Architect', 'Ukraine, 17:37 (GMT +3)'),
(3, 'Jane', 'Cooper', 'jane.cooper@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'active', 'Design Systems Scholar', 'Kyiv, Ukraine'),
(4, 'Floyd', 'Miles', 'floyd.miles@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'active', 'Frontend Engineering Fellow', 'Lviv, Ukraine'),
(5, 'Leslie', 'Alexander', 'leslie.alexander@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active', 'Product Design Apprentice', 'Odesa, Ukraine'),
(6, 'Alex', 'Johnson', 'student.alex@learnspace.edu', '$2b$10$w850cQcZ8g9/yD74yV6t.ugqJ6vH0MfeUeLzV3WkXhF5W4r14yZ9O', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'active', 'Interactive Systems Student', 'Dnipro, Ukraine')
ON DUPLICATE KEY UPDATE `first_name` = VALUES(`first_name`);

-- 3. User Roles Mapping
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 3),
(5, 3),
(6, 3)
ON DUPLICATE KEY UPDATE `role_id` = VALUES(`role_id`);

-- 4. Course Categories
INSERT INTO `course_categories` (`id`, `name`, `description`, `icon`, `status`) VALUES
(1, 'Design & Architecture', 'Design systems, tokens, typography, and visual hierarchy', 'Palette', 'active'),
(2, 'Software Engineering', 'Full-stack development, modern web APIs, and architecture', 'Code', 'active'),
(3, 'Data & Cloud Systems', 'Relational database modeling, SQL, and distributed infrastructure', 'Database', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. Courses
INSERT INTO `courses` (`id`, `category_id`, `course_code`, `title`, `short_description`, `description`, `cover_image`, `status`, `created_by`) VALUES
(1, 1, 'UXD-201', 'UI/UX Design Systems & Visual Hierarchy', 'Comprehensive institutional course on creating scalable, accessible design systems.', '# UI/UX Design Systems\n\nLearn visual hierarchy, tokens, accessibility, and component architectures.', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600', 'published', 2),
(2, 2, 'WEB-301', 'Full-Stack Web Development & Modern APIs', 'Deep dive into RESTful architectures, Express, authentication, and relational persistence.', '# Full-Stack Web Development\n\nLearn backend APIs, database indexing, and frontend state management.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', 'published', 2),
(3, 3, 'DAT-102', 'Relational Database Design with MariaDB', 'Master SQL queries, indexes, normalization, transactions, and relational schemas.', '# Relational Databases\n\nUnderstand foreign key constraints, joins, views, and data integrity.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600', 'published', 2)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 6. Course Teachers
INSERT INTO `course_teachers` (`course_id`, `teacher_id`) VALUES
(1, 2),
(2, 2),
(3, 2)
ON DUPLICATE KEY UPDATE `teacher_id` = VALUES(`teacher_id`);

-- 7. Enrollments
INSERT INTO `enrollments` (`course_id`, `student_id`, `status`) VALUES
(1, 3, 'active'),
(1, 4, 'active'),
(1, 5, 'active'),
(2, 3, 'active'),
(2, 4, 'active'),
(3, 3, 'active')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 8. Modules
INSERT INTO `modules` (`id`, `course_id`, `title`, `description`, `order_index`) VALUES
(1, 1, 'Module 1: Foundations of Design Systems', 'Atomic design principles, style guides, and systematic components.', 1),
(2, 1, 'Module 2: Typography & Spacing Systems', 'Modular scales, line-height calibration, and 4px/8px grid discipline.', 2),
(3, 2, 'Module 1: Backend Architecture & REST', 'Routing, controllers, validation middleware, and HTTP response codes.', 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 9. Lessons
INSERT INTO `lessons` (`id`, `module_id`, `title`, `content`, `estimated_minutes`, `order_index`) VALUES
(1, 1, 'Atomic Design & Component Anatomy', '# Atomic Design & Component Anatomy\n\n### Key Principles\n1. Atoms: basic foundational elements\n2. Molecules: groups of atoms functioning together\n3. Organisms: distinct dashboard sections\n4. Templates: page layout scaffolds\n5. Pages: real concrete screens', 30, 1),
(2, 1, 'Design Tokens & Semantic Variables', '# Design Tokens & Semantic Variables\n\nDesign tokens are the visual design atoms of the design system.', 25, 2),
(3, 2, 'Typographic Hierarchy & Modular Scale', '# Typographic Hierarchy\n\nExplore font scale ratios, line heights, and optical weights.', 35, 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 10. Assignments
INSERT INTO `assignments` (`id`, `course_id`, `title`, `instructions`, `max_score`, `due_at`, `status`) VALUES
(1, 1, 'Design Token Specification Deliverable', 'Construct a JSON or CSS custom property design token dictionary containing primary, neutral, semantic, and spacing tokens.', 100, DATE_ADD(NOW(), INTERVAL 7 DAY), 'published'),
(2, 1, 'Dashboard Navigation Wireframe & Architecture', 'Design high-fidelity wireframes for responsive desktop sidebar and mobile navigation drawer.', 100, DATE_ADD(NOW(), INTERVAL 14 DAY), 'published')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 11. Submissions & Grades
INSERT INTO `submissions` (`id`, `assignment_id`, `student_id`, `submission_text`, `file_name`, `status`, `submitted_at`) VALUES
(1, 1, 3, 'Attached the complete JSON token tokens.json mapping color, spacing, typography scales.', 'tokens.json', 'graded', NOW())
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

INSERT INTO `assignment_grades` (`submission_id`, `grader_id`, `score`, `feedback`, `graded_at`) VALUES
(1, 2, 95.00, 'Superb semantic structure and clean token taxonomy. Excellent adherence to design system specifications.', NOW())
ON DUPLICATE KEY UPDATE `score` = VALUES(`score`);

-- 12. Quizzes & Questions
INSERT INTO `quizzes` (`id`, `course_id`, `title`, `instructions`, `time_limit_minutes`, `passing_score`, `status`) VALUES
(1, 1, 'UX Foundations Knowledge Check', 'Answer multiple choice questions on design tokens, contrast ratios, and modular spacing grids.', 15, 75.00, 'published')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `questions` (`id`, `quiz_id`, `prompt`, `points`, `question_type`, `order_index`) VALUES
(1, 1, 'Which WCAG contrast ratio is mandated for normal body text under Level AA standards?', 5, 'multiple_choice', 1),
(2, 1, 'What is the primary benefit of design tokens over hardcoded hex values?', 5, 'multiple_choice', 2)
ON DUPLICATE KEY UPDATE `prompt` = VALUES(`prompt`);

INSERT INTO `question_choices` (`id`, `question_id`, `choice_text`, `is_correct`) VALUES
(1, 1, '4.5:1', 1),
(2, 1, '3:1', 0),
(3, 1, '7:1', 0),
(4, 1, '2:1', 0),
(5, 2, 'Platform-agnostic single source of truth that cascades across platforms', 1),
(6, 2, 'Smaller file bundle size exclusively in SVG files', 0),
(7, 2, 'Eliminates the requirement for CSS', 0)
ON DUPLICATE KEY UPDATE `choice_text` = VALUES(`choice_text`);

-- 13. System Settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `category`, `description`) VALUES
('platform_name', 'LearnSpace', 'general', 'Institutional platform name'),
('academic_term', 'Spring 2026', 'general', 'Current active academic term'),
('allow_self_enrollment', 'true', 'enrollment', 'Allow students to self-enroll in published courses'),
('max_upload_size_mb', '25', 'storage', 'Maximum file upload size per deliverable')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- 14. Achievement Definitions
INSERT INTO `achievement_definitions` (`id`, `code`, `name`, `description`, `icon`, `points`) VALUES
(1, 'FIRST_ENROLLMENT', 'First Steps', 'Enrolled in your first learning course', 'GraduationCap', 50),
(2, 'TOKEN_MASTER', 'Token Master', 'Demonstrated proficiency in design tokens and system architecture', 'Award', 100),
(3, 'VERIFIED_DELIVERABLE', 'Verified Deliverable', 'Achieved a graded submission with 90%+ score', 'FileText', 150)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `student_achievements` (`student_id`, `achievement_id`, `earned_at`) VALUES
(3, 1, NOW()),
(3, 2, NOW()),
(3, 3, NOW())
ON DUPLICATE KEY UPDATE `earned_at` = VALUES(`earned_at`);

SET FOREIGN_KEY_CHECKS = 1;
