# FULL SYSTEM SPECIFICATION

# Mini Learning Management System (Mini LMS)

**Working product name:** LearnSpace\
**Document type:** Full System Requirements and Planning Document\
**Version:** 1.0\
**Status:** Proposed specification\
**Prepared for:** Project planning and development

------------------------------------------------------------------------

## 1. Document Purpose

This document defines the proposed features, user roles, workflows,
screens, business rules, data requirements, security requirements, and
development plan for LearnSpace, a Mini Learning Management System
(LMS).

It is intended to be the main reference for: - UI/UX design; - frontend
and backend development; - database design and ERD preparation; -
testing and quality assurance; - project demonstrations and
documentation.

The system should be developed according to this document. If a
requirement is changed, update this file so that the implementation and
documentation remain consistent.

## 2. Product Overview

### 2.1 Product Description

LearnSpace is a web-based learning platform that allows an educational
organization to manage courses, lessons, learning materials,
assessments, student submissions, grades, and learning progress.

The system has three primary roles:

1.  **Administrator** --- manages the platform, users, courses,
    enrollment oversight, announcements, and reports.
2.  **Teacher / Instructor** --- manages assigned courses, learning
    content, activities, quizzes, student submissions, grading, and
    course progress.
3.  **Student** --- accesses enrolled courses, studies lessons,
    completes quizzes, submits assignments, views grades, and tracks
    learning progress.

### 2.2 Main Goal

Provide one organized platform where teachers can deliver learning
content and evaluate students while students can access learning
activities and monitor their own progress.

### 2.3 Product Principles

-   Easy to understand for first-time users.
-   Clear separation of administrator, teacher, and student experiences.
-   Responsive layout for desktop, tablet, and mobile browsers.
-   Learning-first student interface.
-   Teaching and course-management-first teacher interface.
-   Management and oversight-first administrator interface.
-   Consistent navigation, colors, typography, spacing, and reusable
    components.
-   Secure access to private course content and student records.
-   Do not show controls that a user is not authorized to use.
-   Important actions must provide confirmation and clear success or
    error feedback.

## 3. Project Scope

### 3.1 Included in the Initial System

-   Authentication and account management.
-   Role-based access control.
-   Administrator, teacher, and student dashboards.
-   User management.
-   Course and category management.
-   Teacher course assignment.
-   Student enrollment.
-   Course modules and lessons.
-   Learning material uploads.
-   Lesson completion and progress tracking.
-   Assignments and file submissions.
-   Quizzes and objective question types.
-   Quiz attempts and automatic scoring for supported question types.
-   Manual grading and teacher feedback.
-   Announcements and in-app notifications.
-   Discussion or question area for courses.
-   Calendar and upcoming activity list.
-   Basic reports and learning analytics.
-   Gamification basics such as points, badges, and streaks, if enabled.
-   Audit records for important administrative actions.
-   Responsive user interface.

### 3.2 Not Required for the First Release

The following may be considered later and must not delay the first
usable release:

-   Live video conferencing.
-   Built-in video streaming infrastructure.
-   AI tutoring or AI-generated grades.
-   Online payment and paid course subscriptions.
-   Native Android or iOS applications.
-   Proctored examinations and webcam monitoring.
-   Complex learning-standard integrations such as SCORM or xAPI.
-   Automated certificate verification.
-   Third-party school information system integration.
-   Real-time collaborative document editing.
-   Advanced adaptive learning recommendations.

### 3.3 Assumptions

-   The first release is a web application.
-   The organization has an administrator who can create or approve user
    accounts.
-   Teachers are assigned to courses by an administrator or an
    authorized process.
-   Students must be enrolled before they can access private course
    content.
-   The organization will define its grading policy and acceptable file
    types.
-   The system uses one configured time zone for displaying schedules
    and deadlines.
-   Email delivery is optional for the first release; in-app
    notifications are required for core events.

### 3.4 Constraints

-   The project has a limited development schedule and budget.
-   The system must be maintainable by student developers or a small
    development team.
-   Uploaded files require storage limits and validation.
-   The system must not rely on frontend-only permission checks.
-   The initial system should avoid unnecessary microservices and
    overcomplicated infrastructure.

## 4. User Roles and Permissions

### 4.1 Administrator

The administrator manages the platform and has access to administrative
functions.

**Responsibilities** - Manage user accounts and roles. - Create and
maintain course categories. - Create, edit, publish, archive, and
oversee courses. - Assign teachers to courses. - Review enrollment
records. - Publish platform-wide announcements. - View system reports. -
Configure system settings. - Review audit logs.

**Administrator restrictions** - An administrator should not
automatically change a student's academic answers or quiz attempts. -
Administrative access to student records should be logged. - Deleting
records with academic history should generally be replaced by archiving
or deactivation.

### 4.2 Teacher / Instructor

A teacher manages only the courses assigned to them, unless a specific
additional permission is granted.

**Responsibilities** - View assigned courses. - Create and organize
modules and lessons. - Upload learning materials. - Create assignments
and quizzes. - Set activity instructions, availability, and deadlines. -
View enrolled students. - Review submissions. - Grade submissions and
provide feedback. - Review quiz results. - Monitor student progress. -
Publish course announcements. - Moderate course discussions.

**Teacher restrictions** - A teacher must not manage administrator
accounts or global system settings. - A teacher must not access courses
that are not assigned to them. - A teacher must not view private records
of students outside their assigned courses. - A teacher must not edit a
student's submitted file or answers. - Changes to published assessments
should follow the assessment editing rules in this document.

### 4.3 Student

A student uses the platform to participate in enrolled courses.

**Responsibilities** - View their dashboard. - Browse courses that are
available for enrollment, if self-enrollment is enabled. - View enrolled
courses. - Open published modules, lessons, and learning materials. -
Mark lessons complete or complete the required lesson activity. - Take
available quizzes. - Submit assignments. - View submission status,
grades, and teacher feedback. - Participate in permitted discussions. -
View announcements and notifications. - Track course progress and
achievements. - Manage permitted profile information.

**Student restrictions** - A student must not access unpublished courses
or lessons. - A student must not view another student's private grades
or submissions. - A student must not edit grades, quiz results, or
teacher feedback. - A student must not submit or change an assignment
after the deadline unless late submissions are allowed. - A student must
not access a quiz before its availability period.

## 5. Authentication and Account Management

### 5.1 Login

The login page must include: - Email address or username field,
according to the selected account policy. - Password field with
show/hide control. - Sign-in button. - Forgot-password link. -
Validation messages. - Loading state during authentication. - Clear
message for invalid credentials. - Optional remember-session behavior
using secure session handling.

### 5.2 Account Creation

The system should support administrator-created accounts as the default
approach.

Optional registration may be enabled by the organization. If public
registration is enabled: - The user must verify their email address if
email verification is configured. - New accounts must receive a
restricted or pending status until approved, if approval is required. -
Users must not choose or assign themselves an administrator role. - The
system must prevent duplicate email addresses.

### 5.3 Password Management

-   Passwords must be stored as secure password hashes, never as plain
    text.
-   Users can request a password reset.
-   Password-reset tokens must expire and be single-use.
-   The system must not reveal whether an email address exists during a
    password-reset request.
-   A user must be able to change their password after signing in.
-   Password rules must be documented and consistently enforced.

### 5.4 Account Status

Supported account statuses: - **Active** --- can sign in and use
authorized features. - **Pending** --- awaiting approval or required
verification. - **Suspended** --- temporarily blocked from signing in. -
**Deactivated** --- disabled by an administrator.

The system must prevent suspended and deactivated accounts from
accessing protected pages and APIs.

### 5.5 Session Handling

-   Protected pages require an authenticated session.
-   Signing out must invalidate the session.
-   Sessions must expire according to configured inactivity and
    maximum-age rules.
-   Sensitive actions may require password re-entry.
-   Authentication errors must not expose technical secrets.

## 6. Global Navigation and Shared UI

### 6.1 Shared Layout

The application should use a consistent layout with: - Sidebar
navigation on desktop. - Collapsible or drawer navigation on smaller
screens. - Top navigation bar. - Page title and optional breadcrumb. -
Search where relevant. - Notification access. - User profile menu. -
Main content area. - Consistent loading, empty, error, and success
states.

### 6.2 Shared Components

Create reusable components for: - Sidebar and navigation item. - Topbar
and profile menu. - Notification dropdown or panel. - Search input. -
Page header. - Statistic card. - Course card. - Progress bar. - Status
badge. - Data table. - Pagination. - Filter and sort controls. -
Confirmation dialog. - Form field and validation message. - File
uploader. - Date and time picker. - Empty state. - Skeleton loader. -
Toast or alert message. - Tabs. - Modal or drawer. - Quiz question
renderer. - Grade display. - Activity status display.

### 6.3 UI Behavior Rules

-   Active navigation item must be visually identifiable.
-   Destructive actions must require confirmation.
-   Forms must show field-level validation.
-   Save buttons must show a loading state while processing.
-   Prevent accidental double submission.
-   Preserve entered form values when a recoverable server error occurs.
-   Use pagination or server-side loading for large lists.
-   Tables must provide useful empty states.
-   Status must be represented by both text and visual styling, not
    color alone.
-   Important actions must be keyboard accessible.
-   Avoid excessive animation or distracting effects.

## 7. Administrator Module

### 7.1 Administrator Dashboard

Display a high-level summary of the platform.

**Dashboard cards** - Total users. - Total students. - Total teachers. -
Active courses. - Pending accounts, if approval is enabled. - Total
enrollments. - Activities awaiting review, if this is included in
administrator oversight.

**Dashboard sections** - Recent user registrations. - Recently created
courses. - Course publication status. - Enrollment overview. - Recent
administrative activity. - Announcements. - Quick actions.

**Dashboard filters** - Date range. - Course category. - Course status,
where applicable.

Dashboard counts must be calculated from database records and must
respect the administrator's access scope.

### 7.2 User Management

Administrators can: - View users in a paginated table. - Search by name
or email. - Filter by role and account status. - Create a user. - Edit
permitted user details. - Assign or change a role. - Activate, suspend,
or deactivate an account. - View a user's basic account details. - Reset
an account's password through a secure reset process. - View relevant
account activity.

**Suggested user table columns** - User ID. - Full name. - Email. -
Role. - Account status. - Date created. - Last login, if recorded. -
Actions.

**Validation** - Email must be unique. - Required name and account
fields must be present. - Only authorized administrators can assign
roles. - Prevent removal or deactivation of the last active
administrator unless another administrator exists. - Account
deactivation must not erase academic history.

### 7.3 Student Management

Administrators can: - View student profiles. - Search and filter
students. - View a student's course enrollments. - View course
completion summaries. - View account status. - Activate or suspend a
student account. - Export permitted student lists.

Student records must not expose sensitive information unnecessarily.

### 7.4 Teacher Management

Administrators can: - Create teacher accounts. - Edit teacher profile
details. - Assign teachers to courses. - Remove a teacher's course
assignment. - View assigned courses. - Activate or suspend teacher
accounts.

When removing a teacher from a course, the system must preserve course
content, grades, submissions, and historical records.

### 7.5 Course Category Management

Administrators can: - Create categories. - Edit category names and
descriptions. - Set category visibility. - Archive categories that are
no longer used.

A category that is already assigned to courses should not be permanently
deleted without resolving those relationships.

### 7.6 Course Management

Administrators can: - Create a course. - Edit course details. - Assign
one or more teachers. - View course modules and enrollment totals. -
Publish, unpublish, archive, or restore a course. - Set enrollment
method. - Set course start and end dates. - View course activity and
progress summaries.

**Course fields** - Course title. - Course code. - Short description. -
Full description. - Category. - Cover image. - Assigned teacher or
teachers. - Enrollment method. - Course visibility. - Course status. -
Start date. - End date. - Created date.

**Course statuses** - Draft. - Published. - Unpublished. - Archived.

### 7.7 Enrollment Oversight

Administrators can: - View enrollments. - Search students and courses. -
Enroll a student manually. - Remove or suspend an enrollment when
appropriate. - Review pending enrollment requests if enabled. - Export
enrollment records.

The system must prevent duplicate active enrollment records for the same
student and course.

### 7.8 Announcement Management

Administrators can: - Create platform-wide announcements. - Edit or
archive announcements. - Set publication and expiration dates. - Select
the intended audience. - Pin important announcements.

An announcement must not appear before its publication time or after its
expiration time.

### 7.9 Reports

Administrator reports may include: - User count by role. - Active and
inactive accounts. - Course count by status. - Enrollment totals by
course. - Course completion rates. - Overall quiz and assignment
activity. - Student activity summaries. - Teacher course assignment
summaries.

Reports must use clearly defined formulas and date ranges. Exported data
must respect access permissions.

### 7.10 System Settings

Possible settings: - Platform name and logo. - Default time zone. -
Default language. - Account registration policy. - Enrollment policy. -
Maximum upload size. - Allowed upload file types. - Password policy. -
Notification preferences. - Gamification enable/disable. - Maintenance
notice.

Changes to important settings should be recorded in the audit log.

## 8. Teacher Module

### 8.1 Teacher Dashboard

Display: - Assigned course count. - Total enrolled students across
assigned courses. - Draft and published courses. - Pending assignment
submissions. - Upcoming deadlines. - Recent student activity. - Recent
quiz results. - Course announcements. - Quick actions to create a
lesson, assignment, or quiz.

Teachers must only see data from courses they are assigned to.

### 8.2 My Courses

Teachers can: - View assigned courses. - Search and filter courses. -
Open a course workspace. - View course status. - View student enrollment
count. - View course progress summary. - Create course content when
authorized.

### 8.3 Course Workspace

Each course workspace should have organized sections or tabs: -
Overview. - Modules and lessons. - Learning materials. - Students. -
Assignments. - Quizzes. - Grades. - Discussions. - Announcements. -
Analytics.

The workspace should show the course title, description, status, and
relevant quick actions.

### 8.4 Module Management

Teachers can: - Create modules within a course. - Edit module titles and
descriptions. - Reorder modules. - Publish or unpublish modules. -
Archive modules when no longer needed. - Add lessons to modules.

A module should belong to one course. Its lessons should remain
associated with that module.

### 8.5 Lesson Management

Teachers can: - Create lessons. - Edit lesson content. - Set lesson
order. - Add text content. - Add images and attachments. - Embed
supported video links. - Add learning objectives. - Add estimated
completion time. - Add a knowledge check, if enabled. - Save as draft. -
Publish or unpublish a lesson.

**Lesson fields** - Lesson title. - Short description. - Lesson
body/content. - Module. - Position/order. - Estimated duration. -
Publication status. - Optional completion requirement. - Created and
updated dates.

**Lesson content guidance** - Support headings, paragraphs, lists,
images, links, and attachments. - Sanitize rich text to prevent script
injection. - Validate embedded media sources. - Do not allow arbitrary
unsafe HTML or scripts.

### 8.6 Learning Material Management

Teachers can upload or link: - PDF documents. - Word documents. -
PowerPoint presentations. - Images. - Other approved document formats. -
External video links. - External reference links.

Each material should include: - Title. - Description. - Course and
optional lesson association. - File or external URL. - File type. - File
size, when applicable. - Uploading teacher. - Visibility. - Upload date.

**File handling rules** - Validate file extension and actual file
type. - Enforce maximum file size. - Use generated storage names rather
than trusting user-provided filenames. - Store files outside executable
web directories or use protected object storage. - Check access before
serving private files. - Reject dangerous executable file types. -
Provide clear upload progress and error feedback.

### 8.7 Assignment Management

Teachers can: - Create an assignment. - Set title and instructions. -
Attach reference files. - Set opening date and deadline. - Allow or
disallow late submissions. - Set maximum score. - Set permitted file
types and file size. - Publish, edit, close, or archive an assignment. -
View submissions and submission status. - Grade submissions. - Return
feedback.

**Assignment fields** - Course. - Title. - Instructions. - Attachment
references. - Available-from date. - Due date. - Maximum score. -
Late-submission policy. - Allowed submission type. - Maximum file
size. - Status.

**Assignment statuses** - Draft. - Scheduled. - Open. - Closed. -
Archived.

### 8.8 Submission Review and Grading

Teachers can: - View all submissions for an assignment. - Filter by
submitted, late, missing, and graded. - Open or download permitted
student files. - Enter a score. - Add written feedback. - Save a draft
grade if supported. - Publish or return a grade. - Review resubmissions
if allowed.

**Grading rules** - Score must not be below zero. - Score must not
exceed the assignment's maximum score. - A grade should have a grading
timestamp and grader identity. - Published grades should be visible to
the relevant student. - Grade changes after publication must be
recorded. - Students must not see private teacher notes unless
explicitly marked as student-visible feedback.

### 8.9 Quiz Management

Teachers can: - Create quizzes. - Add questions. - Reorder questions. -
Set quiz instructions. - Set opening and closing times. - Set time
limit. - Set number of attempts. - Set passing score. - Randomize
questions or answer choices, if enabled. - Configure result
visibility. - Save as draft. - Publish or close a quiz.

**Supported question types for the initial release** 1. Multiple choice
--- one correct answer. 2. True or false. 3. Short answer --- manually
graded initially, unless exact-match rules are configured.

Optional later question types: - Multiple select. - Matching. - Fill in
the blank. - Essay.

### 8.10 Quiz Results

Teachers can: - View attempts by student. - View score and completion
time. - Review answers. - Manually grade questions that require
review. - Release results according to quiz settings. - Export quiz
results.

### 8.11 Student Management within a Course

Teachers can: - View enrolled students. - Search students within the
course. - View individual course progress. - View assignment status. -
View quiz performance. - View course participation. - Send permitted
course announcements.

Teachers must not access a student's unrelated courses or private
records.

### 8.12 Course Announcements

Teachers can: - Create course-specific announcements. - Edit or archive
their announcements. - Pin important announcements. - Set publication
and expiration dates.

Only enrolled students and authorized staff should see the announcement.

### 8.13 Discussions and Questions

A basic discussion area may support: - Student-created questions. -
Teacher replies. - Student replies, if enabled. - Discussion title and
body. - Course and optional lesson association. - Created and updated
timestamps. - Moderation status. - Report or hide action for authorized
moderators.

The system should support reporting and moderation rather than allowing
uncontrolled public content.

### 8.14 Teacher Analytics

Show: - Enrollment count. - Lesson completion rate. - Assignment
submission rate. - Average quiz score. - Students with incomplete
work. - Student progress by module. - Performance trends over time.

Analytics should provide useful filters and avoid presenting misleading
averages when there are no graded attempts.

## 9. Student Module

### 9.1 Student Dashboard

The student dashboard should be learning-focused.

**Summary cards** - Enrolled courses. - Lessons completed. - Pending
assignments. - Upcoming quizzes. - Learning points, if gamification is
enabled.

**Dashboard sections** - Welcome message. - Continue Learning. - My
Courses. - Upcoming Activities. - Recent Announcements. - Recent
Grades. - Learning Progress. - Achievements. - Calendar or deadline
preview.

The dashboard should prioritize the next useful learning action, not
only display statistics.

### 9.2 Course Catalog

If course browsing is enabled, students can: - View published and
available courses. - Search by title or course code. - Filter by
category. - View course descriptions. - View teacher information. - View
enrollment availability. - Request enrollment or enroll directly,
according to the course policy.

Students must not see draft, archived, or restricted courses.

### 9.3 My Courses

Students can: - View active enrollments. - Open a course. - View course
progress. - View course announcements. - View modules and lessons. -
View upcoming assignments and quizzes.

### 9.4 Course Learning Page

The learning page should include: - Course title and description. -
Teacher or instructor information. - Course progress. - Module list. -
Lesson status. - Announcements. - Upcoming course activities.

Module and lesson navigation should be clear and consistent.

### 9.5 Lesson Viewer

The lesson viewer should include: - Lesson title. - Lesson content. -
Learning materials. - Previous and next lesson navigation. - Module
navigation. - Estimated duration. - Completion status. - Knowledge
check, if configured. - Discussion or question link, if enabled.

**Completion rules** - A lesson may be completed manually or through a
defined completion activity. - The system must prevent duplicate
progress records. - Reopening a completed lesson should not erase
completion. - If a teacher changes completion requirements, existing
completion records should follow a documented policy.

### 9.6 Interactive Knowledge Checks

A knowledge check is a short learning activity within or after a lesson.

Possible interactions: - Multiple-choice question. - True-or-false
question. - Reveal-answer flashcard. - Short reflection prompt.

The system should: - Show clear instructions. - Provide feedback after
an answer when configured. - Explain the correct answer when the teacher
enables explanations. - Avoid counting practice checks as formal grades
unless configured. - Support keyboard and mobile interaction.

### 9.7 Assignment Submission

Students can: - View assignment instructions. - View attachments. - View
opening date and deadline. - Upload an allowed file or enter text,
depending on assignment settings. - Submit their work. - View submission
timestamp. - View submission status. - Replace a submission if
resubmission is allowed and the deadline policy permits it. - View grade
and feedback after release.

**Submission statuses** - Not submitted. - Submitted. - Submitted
late. - Returned for revision. - Resubmitted. - Graded.

The system must show a clear confirmation after successful submission. A
failed upload must not be shown as a successful submission.

### 9.8 Online Quiz

Students can: - View quiz instructions. - View availability and time
limit. - Start an available quiz. - Answer supported question types. -
Navigate between questions if allowed. - Review answers before
submission if allowed. - Submit the quiz. - View the result according to
teacher settings.

**Quiz attempt rules** - A student cannot start a quiz outside its
availability window. - The number of attempts must not exceed the
configured limit. - The server must validate the attempt deadline. - A
submitted attempt must not be editable. - An expired attempt must be
handled consistently. - The system should save answers periodically when
technically supported. - The system must clearly communicate when an
answer has or has not been saved. - Correct answers must not be exposed
to the browser before the permitted result-release time.

### 9.9 Grades and Feedback

Students can view: - Assignment grades. - Quiz grades. - Teacher
feedback. - Published course grade summaries, if configured. - Grading
status for work not yet evaluated.

Students must not see unpublished grades or private teacher notes.

### 9.10 Learning Progress

Display: - Overall course completion. - Completed lessons. - Remaining
lessons. - Module completion. - Assignment completion. - Quiz
participation. - Course activity history.

A progress percentage must use a documented formula. Recommended initial
formula:

`Lesson progress = completed required lessons / total required published lessons × 100`

If a course has no required published lessons, display "Not started" or
"No progress data" instead of dividing by zero.

Do not combine lesson completion, grades, and quiz scores into one
percentage unless the organization defines and documents a weighted
formula.

### 9.11 Student Profile

Students can: - View their profile. - Edit permitted personal details. -
Change password. - Set notification preferences. - View account status.

Role, grades, enrollment history, and other protected fields must not be
editable by students.

### 9.12 Achievements and Gamification

If enabled, students may earn: - First Lesson badge. - Module Completion
badge. - Quiz Completion badge. - Assignment Completion badge. -
Learning Streak badge. - Course Completion badge.

**Points rules** - Award points only for defined events. - Prevent
duplicate point awards for the same event. - Do not award points for
failed or unverified actions. - Keep a points transaction history. - Do
not allow students to edit their points.

Gamification must encourage learning and must not replace meaningful
feedback or academic evaluation. Leaderboards should be optional and
should not expose private student information.

## 10. Enrollment Rules

The system may support two enrollment methods.

### 10.1 Teacher or Administrator Enrollment

-   Authorized staff selects a course.
-   Authorized staff selects one or more students.
-   The system checks for an existing active enrollment.
-   The system creates the enrollment.
-   The student receives an in-app notification.

### 10.2 Student Self-Enrollment

If enabled: - The student opens the course catalog. - The student
selects an available course. - The system checks eligibility and
enrollment limits. - The student enrolls immediately or submits a
request for approval. - The system records the enrollment status.

### 10.3 Enrollment Statuses

-   Pending.
-   Active.
-   Rejected.
-   Completed.
-   Withdrawn.
-   Suspended.

Course access must depend on enrollment status and course publication
status.

## 11. Announcements and Notifications

### 11.1 Notification Events

Create in-app notifications for relevant events, such as: - Account
approval or status change. - New course enrollment. - Course
announcement. - New lesson or material published. - New assignment. -
Upcoming deadline reminder. - Assignment grade released. - Assignment
returned for revision. - Quiz availability. - Quiz result released. -
Teacher reply to a student's question.

### 11.2 Notification Features

-   Notification list.
-   Read/unread status.
-   Mark as read.
-   Mark all as read.
-   Link to the relevant course or activity.
-   Notification preferences where supported.

Notifications should not reveal private content to unauthorized users.

### 11.3 Email Notifications

Email notifications may be added after core in-app notifications work.

Email delivery must: - Use verified configuration. - Avoid exposing
credentials in source code. - Log delivery failures safely. - Avoid
sending duplicate messages for the same event. - Respect user
notification preferences and applicable policy.

## 12. Calendar and Learning Planner

The planner may display: - Assignment deadlines. - Quiz opening and
closing times. - Course start and end dates. - Teacher-posted course
events. - Personal learning goals, if supported.

**Calendar behavior** - Month, week, or agenda view. - Filter by
course. - Show event type. - Open the related activity. - Display dates
in the configured time zone. - Clearly distinguish overdue, upcoming,
and completed items.

A calendar event must link to the source activity rather than duplicate
its authoritative deadline.

## 13. Search, Filtering, and Data Tables

Where relevant, provide: - Keyword search. - Role or status filters. -
Course category filters. - Date range filters. - Sorting. -
Pagination. - Clear filters action. - Useful empty state.

Search must be permission-aware. A user must not discover restricted
courses, users, submissions, or records through search results.

## 14. Reports and Analytics

### 14.1 Administrator Reports

-   User totals by role.
-   User account status.
-   Course status.
-   Enrollment totals.
-   Course completion.
-   Course activity.
-   Assignment and quiz activity.

### 14.2 Teacher Reports

-   Course enrollment.
-   Lesson completion.
-   Assignment submission.
-   Quiz performance.
-   Students with incomplete activities.
-   Course progress over time.

### 14.3 Student Progress Summary

-   Enrolled courses.
-   Completed lessons.
-   Pending assignments.
-   Published grades.
-   Quiz participation.
-   Achievement history.

### 14.4 Report Rules

-   Show the selected date range.
-   Show the course or population included.
-   Define each percentage and average.
-   Handle empty data safely.
-   Restrict reports to authorized users.
-   Exports must include only fields the requesting user is allowed to
    view.

## 15. Proposed Database Design

The following is a logical database plan. Exact column types and indexes
should be finalized during ERD and migration design.

### 15.1 Core Account Tables

#### `users`

Suggested fields: - `id` --- primary key. - `first_name`. -
`middle_name` --- nullable. - `last_name`. - `email` --- unique. -
`password_hash`. - `profile_image` --- nullable. - `account_status`. -
`email_verified_at` --- nullable. - `last_login_at` --- nullable. -
`created_at`. - `updated_at`. - `deleted_at` --- nullable, if soft
deletion is implemented.

#### `roles`

-   `id` --- primary key.
-   `name` --- unique.
-   `description`.

Initial role records: - administrator. - teacher. - student.

#### `user_roles`

Use this table if the system needs multiple roles per user: - `id`. -
`user_id` --- foreign key to users. - `role_id` --- foreign key to
roles. - `created_at`.

If each account has exactly one role, a simpler role foreign key on
`users` may be used instead. Choose one approach and use it
consistently.

### 15.2 Course Tables

#### `course_categories`

-   `id`.
-   `name`.
-   `description`.
-   `status`.
-   `created_at`.
-   `updated_at`.

#### `courses`

-   `id`.
-   `category_id` --- foreign key.
-   `course_code` --- unique according to the organization's policy.
-   `title`.
-   `short_description`.
-   `description`.
-   `cover_image`.
-   `enrollment_method`.
-   `visibility`.
-   `status`.
-   `start_at` --- nullable.
-   `end_at` --- nullable.
-   `created_by` --- user foreign key.
-   `created_at`.
-   `updated_at`.
-   `archived_at` --- nullable.

#### `course_teachers`

-   `id`.
-   `course_id` --- foreign key.
-   `teacher_id` --- user foreign key.
-   `assigned_by` --- user foreign key.
-   `assigned_at`.

Add a unique constraint for the course and teacher pair.

#### `enrollments`

-   `id`.
-   `course_id` --- foreign key.
-   `student_id` --- user foreign key.
-   `status`.
-   `enrolled_at`.
-   `completed_at` --- nullable.
-   `created_by` --- nullable user foreign key.
-   `updated_at`.

Prevent duplicate active enrollment for the same student and course.

### 15.3 Learning Content Tables

#### `modules`

-   `id`.
-   `course_id` --- foreign key.
-   `title`.
-   `description`.
-   `position`.
-   `status`.
-   `created_at`.
-   `updated_at`.

#### `lessons`

-   `id`.
-   `module_id` --- foreign key.
-   `title`.
-   `description`.
-   `content`.
-   `estimated_minutes`.
-   `position`.
-   `status`.
-   `is_required`.
-   `created_at`.
-   `updated_at`.
-   `published_at` --- nullable.

#### `learning_materials`

-   `id`.
-   `course_id` --- foreign key.
-   `lesson_id` --- nullable foreign key.
-   `uploaded_by` --- user foreign key.
-   `title`.
-   `description`.
-   `storage_path` --- nullable for external links.
-   `external_url` --- nullable.
-   `original_filename` --- nullable.
-   `mime_type`.
-   `file_size` --- nullable.
-   `visibility`.
-   `created_at`.

#### `lesson_progress`

-   `id`.
-   `lesson_id` --- foreign key.
-   `student_id` --- user foreign key.
-   `status`.
-   `started_at` --- nullable.
-   `completed_at` --- nullable.
-   `updated_at`.

Add a unique constraint for lesson and student.

### 15.4 Assignment Tables

#### `assignments`

-   `id`.
-   `course_id` --- foreign key.
-   `created_by` --- teacher user foreign key.
-   `title`.
-   `instructions`.
-   `available_at`.
-   `due_at`.
-   `allow_late_submission`.
-   `max_score`.
-   `allowed_file_types`.
-   `max_file_size`.
-   `status`.
-   `created_at`.
-   `updated_at`.

#### `assignment_attachments`

-   `id`.
-   `assignment_id` --- foreign key.
-   `storage_path`.
-   `original_filename`.
-   `mime_type`.
-   `file_size`.
-   `created_at`.

#### `submissions`

-   `id`.
-   `assignment_id` --- foreign key.
-   `student_id` --- user foreign key.
-   `submission_text` --- nullable.
-   `status`.
-   `submitted_at` --- nullable.
-   `is_late`.
-   `created_at`.
-   `updated_at`.

If multiple attempts or resubmissions are required, use a separate
submission-attempt table or an attempt number with an appropriate
uniqueness rule.

#### `submission_files`

-   `id`.
-   `submission_id` --- foreign key.
-   `storage_path`.
-   `original_filename`.
-   `mime_type`.
-   `file_size`.
-   `uploaded_at`.

#### `assignment_grades`

-   `id`.
-   `submission_id` --- foreign key.
-   `graded_by` --- teacher user foreign key.
-   `score`.
-   `max_score`.
-   `student_feedback`.
-   `private_teacher_note` --- nullable.
-   `status`.
-   `graded_at`.
-   `updated_at`.

If grade history is needed, preserve each published grade revision
rather than overwriting history.

### 15.5 Quiz Tables

#### `quizzes`

-   `id`.
-   `course_id` --- foreign key.
-   `created_by` --- teacher user foreign key.
-   `title`.
-   `instructions`.
-   `available_at`.
-   `closes_at`.
-   `time_limit_minutes` --- nullable.
-   `max_attempts`.
-   `passing_score` --- nullable.
-   `randomize_questions`.
-   `randomize_choices`.
-   `result_visibility`.
-   `status`.
-   `created_at`.
-   `updated_at`.

#### `questions`

-   `id`.
-   `quiz_id` --- foreign key.
-   `question_type`.
-   `question_text`.
-   `points`.
-   `position`.
-   `explanation` --- nullable.
-   `created_at`.
-   `updated_at`.

#### `question_choices`

-   `id`.
-   `question_id` --- foreign key.
-   `choice_text`.
-   `is_correct`.
-   `position`.

Correct-answer data must never be returned to students before the
configured release time.

#### `quiz_attempts`

-   `id`.
-   `quiz_id` --- foreign key.
-   `student_id` --- user foreign key.
-   `attempt_number`.
-   `status`.
-   `started_at`.
-   `submitted_at` --- nullable.
-   `score` --- nullable until graded.
-   `max_score`.
-   `graded_at` --- nullable.

Add a uniqueness rule for quiz, student, and attempt number.

#### `quiz_answers`

-   `id`.
-   `attempt_id` --- foreign key.
-   `question_id` --- foreign key.
-   `selected_choice_id` --- nullable.
-   `answer_text` --- nullable.
-   `score` --- nullable.
-   `is_correct` --- nullable.
-   `graded_at` --- nullable.

### 15.6 Communication Tables

#### `announcements`

-   `id`.
-   `course_id` --- nullable; null may represent a platform-wide
    announcement.
-   `created_by`.
-   `title`.
-   `body`.
-   `audience`.
-   `published_at`.
-   `expires_at` --- nullable.
-   `is_pinned`.
-   `status`.
-   `created_at`.
-   `updated_at`.

#### `notifications`

-   `id`.
-   `user_id` --- recipient foreign key.
-   `type`.
-   `title`.
-   `message`.
-   `related_type` --- nullable.
-   `related_id` --- nullable.
-   `read_at` --- nullable.
-   `created_at`.

#### `discussions`

-   `id`.
-   `course_id` --- foreign key.
-   `lesson_id` --- nullable foreign key.
-   `created_by`.
-   `title`.
-   `body`.
-   `status`.
-   `created_at`.
-   `updated_at`.

#### `discussion_replies`

-   `id`.
-   `discussion_id` --- foreign key.
-   `created_by`.
-   `body`.
-   `status`.
-   `created_at`.
-   `updated_at`.

### 15.7 Gamification Tables

#### `achievement_definitions`

-   `id`.
-   `code` --- unique.
-   `name`.
-   `description`.
-   `icon`.
-   `points`.
-   `rule_type`.
-   `is_active`.

#### `student_achievements`

-   `id`.
-   `student_id` --- user foreign key.
-   `achievement_id` --- foreign key.
-   `earned_at`.

Add a unique constraint for student and achievement.

#### `point_transactions`

-   `id`.
-   `student_id` --- user foreign key.
-   `source_type`.
-   `source_id`.
-   `points`.
-   `reason`.
-   `created_at`.

Prevent duplicate rewards for the same qualifying event.

### 15.8 System and Audit Tables

#### `audit_logs`

-   `id`.
-   `actor_user_id` --- nullable user foreign key.
-   `action`.
-   `entity_type`.
-   `entity_id`.
-   `summary`.
-   `ip_address` --- only if justified by policy.
-   `created_at`.

Do not store passwords, reset tokens, session secrets, or other
credentials in audit logs.

#### `system_settings`

-   `id`.
-   `setting_key` --- unique.
-   `setting_value`.
-   `updated_by`.
-   `updated_at`.

### 15.9 Database Design Rules

-   Use primary keys for all entities.
-   Use foreign keys for relationships.
-   Add indexes to frequently searched foreign keys and status/date
    fields.
-   Add unique constraints for emails, course codes, and relationship
    pairs where appropriate.
-   Use transactions for multi-step operations such as enrollment and
    quiz submission.
-   Use consistent naming conventions.
-   Use appropriate decimal types for grades and points.
-   Store timestamps consistently, preferably in UTC, and convert for
    display.
-   Use soft deletion or archival where historical academic records must
    remain available.
-   Define deletion behavior for every foreign-key relationship.
-   Do not store uploaded file contents directly in ordinary relational
    fields unless there is a specific reason.

## 16. Main Entity Relationships

The logical relationships are:

-   One user may have one or more roles, depending on the chosen role
    design.
-   One category can contain many courses.
-   One course can have many teachers through `course_teachers`.
-   One course can have many enrollments.
-   One student can have many enrollments.
-   One course can have many modules.
-   One module can have many lessons.
-   One lesson can have many student progress records.
-   One course can have many assignments.
-   One assignment can have many submissions.
-   One submission can have one or more files.
-   One submission can have grade history.
-   One course can have many quizzes.
-   One quiz can have many questions.
-   One quiz can have many attempts.
-   One attempt can have many answers.
-   One course can have many announcements and discussions.
-   One discussion can have many replies.
-   One student can have many notifications and achievements.

The final ERD must show primary keys, foreign keys, cardinality, and
optional relationships.

## 17. Business Rules

1.  Only authenticated users can access protected system pages.
2.  Every protected API request must verify authentication and
    authorization.
3.  A user can access only the functions allowed by their role and
    record-level permissions.
4.  Teachers can manage only assigned courses.
5.  Students can access only published content in courses where they
    have an eligible enrollment.
6.  Draft content is visible only to authorized staff.
7.  A course must have a title and valid status before publication.
8.  A lesson must belong to a module, and a module must belong to a
    course.
9.  An assignment must belong to a course.
10. An assignment deadline must not be earlier than its opening date.
11. A quiz closing time must not be earlier than its opening time.
12. A quiz must contain valid questions before publication.
13. A student's quiz attempts must not exceed the configured attempt
    limit.
14. Quiz scores must not exceed the maximum score.
15. Assignment scores must not exceed the maximum score.
16. Students must not view unreleased grades.
17. A student cannot submit to a closed assignment unless late
    submission is allowed.
18. A student cannot start an unavailable quiz.
19. Published assessment changes must preserve existing attempt and
    grade integrity.
20. Deactivated accounts cannot sign in.
21. Archived courses must not accept new enrollments.
22. Duplicate active enrollments must be prevented.
23. Important administrative and grading changes must be auditable.
24. A notification must be associated with its intended recipient.
25. A student must not change their own role, grade, points, or
    enrollment status.
26. File downloads must verify the requester's access to the related
    course or activity.
27. All date comparisons must use a consistent time-zone policy.
28. Progress calculations must use a documented formula.
29. A failed operation must not partially save related records.
30. The system must provide understandable feedback when a business rule
    prevents an action.

## 18. Security Requirements

### 18.1 Authentication and Authorization

-   Hash passwords using a modern password-hashing algorithm supported
    by the selected framework.
-   Use secure session cookies or a properly designed token strategy.
-   Enforce server-side role and record-level authorization.
-   Do not trust role values or user IDs sent by the browser.
-   Rate-limit login and password-reset endpoints.
-   Use secure password-reset tokens.
-   Revoke sessions when appropriate after password or account-status
    changes.

### 18.2 Application Security

-   Use parameterized database queries or a safe ORM.
-   Validate all input on the server.
-   Escape output according to its context.
-   Sanitize rich text content.
-   Protect state-changing requests against CSRF when cookie-based
    sessions are used.
-   Configure appropriate CORS rules.
-   Apply security headers.
-   Avoid exposing stack traces or secrets in production.
-   Keep dependencies updated.
-   Store secrets in environment variables or a secret manager.
-   Do not commit `.env` files or credentials to source control.

### 18.3 File Security

-   Validate actual file content and MIME type.
-   Restrict file size and extension.
-   Rename files when storing them.
-   Prevent path traversal.
-   Store private uploads in non-public storage.
-   Authorize every file download.
-   Consider malware scanning where available.
-   Do not execute uploaded files.

### 18.4 Privacy

-   Collect only information required by the organization.
-   Limit access to student grades and submissions.
-   Avoid exposing student data in URLs or public reports.
-   Define retention and deletion rules.
-   Provide a clear account and data policy appropriate to the
    organization.
-   Follow applicable privacy requirements, including relevant
    Philippine data-protection obligations where applicable.

## 19. Non-Functional Requirements

### 19.1 Usability

-   Navigation labels must be understandable.
-   Common tasks should require as few steps as reasonably possible.
-   Forms must explain errors clearly.
-   The interface must work on common desktop, tablet, and mobile screen
    sizes.
-   The system must provide visible feedback for important actions.

### 19.2 Performance

-   Use pagination for large datasets.
-   Optimize database queries and indexes.
-   Compress and resize images when appropriate.
-   Avoid loading every course or notification at once.
-   Use background processing for operations that may take a long time,
    if needed.
-   Establish measurable performance targets during deployment testing.

### 19.3 Reliability

-   Use database transactions for critical multi-step actions.
-   Handle upload and network failures.
-   Prevent duplicate submissions caused by repeated requests.
-   Provide safe error handling.
-   Back up the database and uploaded files.
-   Test restoration procedures.

### 19.4 Accessibility

-   Use semantic HTML.
-   Support keyboard navigation.
-   Provide visible focus indicators.
-   Label form controls.
-   Provide text alternatives for meaningful images.
-   Maintain readable contrast.
-   Do not use color as the only status indicator.
-   Support zoom and responsive text.

### 19.5 Maintainability

-   Use modular code organization.
-   Separate presentation, business logic, and data access.
-   Reuse common UI components.
-   Keep validation and permission rules centralized where practical.
-   Document environment setup and database migrations.
-   Use meaningful naming conventions.
-   Add tests for critical business rules.

### 19.6 Compatibility

The web application should support current versions of major browsers,
including Chrome, Edge, Firefox, and Safari, subject to testing.

## 20. Recommended Technical Architecture

The technology stack has not yet been formally selected. The following
is a practical proposed stack, not a fixed requirement.

### 20.1 Suggested Stack

**Frontend** - React. - TypeScript. - A consistent component library or
custom reusable components. - Responsive CSS framework or utility CSS. -
Chart library for analytics.

**Backend** - Node.js. - Express or a structured Node.js framework. -
REST API. - Server-side validation. - Role-based and record-level
authorization.

**Database** - PostgreSQL or MariaDB. - ORM or query builder, selected
consistently. - Version-controlled database migrations.

**File Storage** - Local protected storage for development. - Private
object storage for production, if available.

**Development Tools** - Visual Studio Code or another preferred
editor. - Git and GitHub. - API testing tool. - Database management
tool. - Browser developer tools.

The project may use another stack if required by the course or
deployment environment. Do not mix multiple frameworks without a clear
reason.

### 20.2 Suggested Architecture

Use a modular monolithic architecture for the first release.

Suggested backend modules: - Auth. - Users. - Roles and permissions. -
Courses. - Categories. - Enrollments. - Modules. - Lessons. - Learning
materials. - Lesson progress. - Assignments. - Submissions. - Grading. -
Quizzes. - Quiz attempts. - Announcements. - Notifications. -
Discussions. - Reports. - Gamification. - Audit logs. - System settings.

Each module should have clearly defined responsibilities and should not
bypass another module's business rules.

### 20.3 Suggested Project Structure

Example only; adjust to the selected framework.

``` text
learnspace/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── teacher/
│   │   │   └── student/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── database/
│   │   ├── storage/
│   │   ├── utils/
│   │   └── app.ts
│   └── package.json
├── docs/
│   ├── FULLSYSTEM.md
│   ├── ERD.md
│   └── API.md
├── .gitignore
└── README.md
```

## 21. API Planning

The API should use consistent naming, status codes, validation, and
response structures.

Example endpoint groups:

### Authentication

-   `POST /api/auth/login`
-   `POST /api/auth/logout`
-   `POST /api/auth/forgot-password`
-   `POST /api/auth/reset-password`
-   `GET /api/auth/me`

### Users

-   `GET /api/users`
-   `POST /api/users`
-   `GET /api/users/:id`
-   `PATCH /api/users/:id`
-   `PATCH /api/users/:id/status`

### Courses

-   `GET /api/courses`
-   `POST /api/courses`
-   `GET /api/courses/:id`
-   `PATCH /api/courses/:id`
-   `PATCH /api/courses/:id/status`

### Enrollments

-   `GET /api/courses/:courseId/enrollments`
-   `POST /api/courses/:courseId/enrollments`
-   `PATCH /api/enrollments/:id/status`

### Modules and Lessons

-   `GET /api/courses/:courseId/modules`
-   `POST /api/courses/:courseId/modules`
-   `PATCH /api/modules/:id`
-   `POST /api/modules/:moduleId/lessons`
-   `PATCH /api/lessons/:id`
-   `POST /api/lessons/:id/progress`

### Assignments

-   `GET /api/courses/:courseId/assignments`
-   `POST /api/courses/:courseId/assignments`
-   `GET /api/assignments/:id`
-   `POST /api/assignments/:id/submissions`
-   `GET /api/assignments/:id/submissions`
-   `POST /api/submissions/:id/grade`

### Quizzes

-   `GET /api/courses/:courseId/quizzes`
-   `POST /api/courses/:courseId/quizzes`
-   `POST /api/quizzes/:id/attempts`
-   `PUT /api/quiz-attempts/:id/answers`
-   `POST /api/quiz-attempts/:id/submit`
-   `GET /api/quiz-attempts/:id/result`

### Announcements and Notifications

-   `GET /api/announcements`
-   `POST /api/announcements`
-   `GET /api/notifications`
-   `PATCH /api/notifications/:id/read`

### Reports

-   `GET /api/reports/admin/overview`
-   `GET /api/reports/teacher/courses/:courseId`
-   `GET /api/reports/student/progress`

These are planning examples, not a complete API contract. Every endpoint
must have documented authentication, authorization, validation, request
fields, response fields, and error behavior.

## 22. UI/UX Screen Inventory

### 22.1 Public and Authentication Screens

-   Login.
-   Forgot password.
-   Reset password.
-   Optional registration.
-   Account pending approval.
-   Unauthorized access.
-   Not found.
-   General error page.

### 22.2 Administrator Screens

-   Admin dashboard.
-   User list.
-   Create user.
-   Edit user.
-   User details.
-   Student list and details.
-   Teacher list and details.
-   Course category list and form.
-   Course list.
-   Create and edit course.
-   Course details and teacher assignment.
-   Enrollment list.
-   Enrollment details.
-   Announcement list and editor.
-   Reports and analytics.
-   System settings.
-   Audit log.

### 22.3 Teacher Screens

-   Teacher dashboard.
-   My courses.
-   Course workspace.
-   Module manager.
-   Lesson editor.
-   Learning material manager.
-   Student roster.
-   Assignment list.
-   Assignment editor.
-   Submission list.
-   Submission review and grading.
-   Quiz list.
-   Quiz builder.
-   Quiz results.
-   Gradebook.
-   Course announcements.
-   Discussion moderation.
-   Course analytics.

### 22.4 Student Screens

-   Student dashboard.
-   Course catalog.
-   Course details.
-   My courses.
-   Course learning page.
-   Module and lesson navigation.
-   Lesson viewer.
-   Knowledge check.
-   Assignment details.
-   Assignment submission.
-   Submission status.
-   Quiz instructions.
-   Quiz taking screen.
-   Quiz result.
-   Grades and feedback.
-   Learning progress.
-   Calendar.
-   Notifications.
-   Achievements.
-   Student profile.

## 23. Visual Design Direction

### 23.1 Design Goals

-   Modern educational platform.
-   Clean, calm, and friendly visual style.
-   Strong information hierarchy.
-   Consistent spacing and alignment.
-   Readable typography.
-   Clear interactive states.
-   Minimal clutter.
-   Responsive layouts.

### 23.2 Suggested Visual System

A possible starting direction: - Primary color: deep navy or blue. -
Accent color: teal or green for learning progress. - Neutral surfaces:
white, light gray, and subtle borders. - Warning color: amber. - Error
color: red. - Success color: green.

These are starting suggestions. Final colors must be checked for
contrast and consistency.

### 23.3 Role-Specific Experience

**Administrator** - Data tables. - Statistics. - Filters. - Management
forms. - Reports. - Audit information.

**Teacher** - Course workspace. - Content editor. - Submission queues. -
Gradebook. - Course analytics.

**Student** - Course cards. - Continue-learning panel. - Lesson
viewer. - Upcoming activities. - Progress indicators. - Achievements.

### 23.4 Responsive Behavior

-   Desktop: full sidebar and multi-column dashboard.
-   Tablet: collapsible sidebar and reduced columns.
-   Mobile: drawer navigation, stacked cards, compact tables, and
    touch-friendly controls.
-   Forms must remain usable on narrow screens.
-   Tables should use responsive layouts or horizontal scrolling without
    hiding essential actions.

## 24. Important Interaction Details

### 24.1 Forms

-   Show required fields.
-   Validate before saving.
-   Display server validation errors beside the relevant field.
-   Confirm successful saves.
-   Warn before leaving a form with unsaved changes where practical.

### 24.2 Tables

-   Provide loading and empty states.
-   Support search, filters, and pagination.
-   Keep actions clearly labeled.
-   Confirm destructive actions.
-   Preserve filters when returning from a detail page where practical.

### 24.3 File Uploads

-   Show accepted file types and size limit.
-   Show upload progress.
-   Allow removal before final submission.
-   Show upload errors.
-   Confirm successful storage.
-   Never claim a file was submitted unless the server confirms it.

### 24.4 Quiz Interface

-   Display progress through questions.
-   Show remaining time when timed.
-   Indicate saved and unsaved answers.
-   Confirm final submission.
-   Prevent accidental duplicate final submissions.
-   Handle refresh or connection loss according to the documented
    attempt policy.

### 24.5 Feedback

-   Use success messages for completed actions.
-   Use warning messages for actions requiring attention.
-   Use error messages that explain what the user can do next.
-   Avoid exposing raw database or server errors.

## 25. Testing and Quality Assurance

### 25.1 Authentication Tests

-   Valid login.
-   Invalid login.
-   Suspended account login.
-   Deactivated account login.
-   Logout.
-   Password reset.
-   Session expiration.

### 25.2 Authorization Tests

-   Student attempts to open admin page.
-   Teacher attempts to access an unassigned course.
-   Student attempts to view another student's submission.
-   Student attempts to edit a grade.
-   Unauthenticated user attempts to access a protected API.
-   User attempts to download a file from an unauthorized course.

### 25.3 Course Tests

-   Create course.
-   Edit course.
-   Publish and unpublish course.
-   Assign teacher.
-   Archive course.
-   Prevent unauthorized course editing.

### 25.4 Learning Content Tests

-   Create module.
-   Reorder module.
-   Create lesson.
-   Publish lesson.
-   Open lesson as enrolled student.
-   Block access to unpublished lesson.
-   Record lesson progress.
-   Prevent duplicate progress records.

### 25.5 Assignment Tests

-   Create assignment.
-   Validate opening and due dates.
-   Submit allowed file.
-   Reject invalid file.
-   Reject oversized file.
-   Handle late submission.
-   Prevent submission after closure when late work is disabled.
-   Grade submission.
-   Release grade.
-   Verify student feedback visibility.

### 25.6 Quiz Tests

-   Create quiz.
-   Validate quiz questions.
-   Publish quiz.
-   Prevent early access.
-   Start attempt.
-   Save answers.
-   Submit attempt.
-   Enforce attempt limit.
-   Enforce time limit.
-   Calculate objective score.
-   Hide correct answers until allowed.
-   Verify result visibility.

### 25.7 Notification Tests

-   Create notification for the correct user.
-   Mark as read.
-   Prevent another user from reading it.
-   Verify related links.
-   Avoid duplicate notifications for repeated events.

### 25.8 General Tests

-   Responsive layout.
-   Keyboard navigation.
-   Form validation.
-   Search and filters.
-   Pagination.
-   Error handling.
-   Database constraints.
-   Backup and restore.
-   File access control.

## 26. Acceptance Criteria

The first release is considered ready for demonstration when all of the
following are true:

### Authentication

-   Users can sign in and sign out.
-   Protected pages require authentication.
-   Role-based access is enforced by the backend.
-   Disabled accounts cannot access the platform.

### Administrator

-   Administrator can manage users.
-   Administrator can manage categories and courses.
-   Administrator can assign teachers.
-   Administrator can review enrollments.
-   Administrator can publish announcements.
-   Administrator can view basic reports.

### Teacher

-   Teacher can access assigned courses only.
-   Teacher can create modules and lessons.
-   Teacher can upload learning materials.
-   Teacher can create assignments and quizzes.
-   Teacher can review submissions.
-   Teacher can grade and release feedback.
-   Teacher can view course progress.

### Student

-   Student can access enrolled published courses.
-   Student can view lessons and materials.
-   Student can record lesson completion.
-   Student can submit assignments.
-   Student can take available quizzes.
-   Student can view released grades and feedback.
-   Student can monitor learning progress.

### General

-   The interface is responsive.
-   Important actions show clear feedback.
-   Private records are protected.
-   Uploaded files are validated and access-controlled.
-   Critical business rules have tests.
-   Database migrations and setup instructions are documented.

## 27. Development Roadmap

Build in small, testable phases. Do not begin every module at the same
time.

### Phase 1 --- Project Foundation

-   Confirm technology stack.
-   Create repository.
-   Configure frontend and backend.
-   Configure database.
-   Set environment variables.
-   Add linting and formatting.
-   Create base layouts and design tokens.
-   Document local setup.

**Deliverable:** Application starts successfully and has a connected
database.

### Phase 2 --- Authentication and Permissions

-   Create account and role schema.
-   Implement login and logout.
-   Implement session handling.
-   Add protected routes.
-   Add backend authorization middleware.
-   Build role-specific navigation.
-   Test access restrictions.

**Deliverable:** Administrator, teacher, and student can sign in and see
only their authorized areas.

### Phase 3 --- User and Course Management

-   Build administrator dashboard.
-   Build user management.
-   Build category management.
-   Build course management.
-   Build teacher assignment.
-   Build enrollment management.

**Deliverable:** Administrator can create the learning environment.

### Phase 4 --- Course Content

-   Build teacher dashboard.
-   Build course workspace.
-   Build module management.
-   Build lesson editor.
-   Build learning material upload.
-   Build student course pages.
-   Build lesson viewer.

**Deliverable:** Teachers can publish learning content and students can
access it.

### Phase 5 --- Enrollment and Progress

-   Implement enrollment rules.
-   Build course catalog if enabled.
-   Implement lesson progress.
-   Build student progress page.
-   Add course completion calculations.

**Deliverable:** Students can enroll and track learning activity.

### Phase 6 --- Assignments and Grading

-   Build assignment creation.
-   Build file submission.
-   Build submission review.
-   Build grading and feedback.
-   Add late submission rules.
-   Add grade visibility controls.

**Deliverable:** Complete assignment workflow.

### Phase 7 --- Quizzes

-   Build quiz editor.
-   Build question management.
-   Build quiz-taking interface.
-   Implement attempts and time limits.
-   Implement objective scoring.
-   Add result visibility and manual grading where needed.

**Deliverable:** Students can take quizzes and teachers can review
results.

### Phase 8 --- Communication and Planner

-   Build announcements.
-   Build notifications.
-   Build discussion area.
-   Build calendar and upcoming activity list.

**Deliverable:** Users can communicate and keep track of learning
activities.

### Phase 9 --- Analytics and Gamification

-   Build role-specific reports.
-   Add learning analytics.
-   Add points and achievements if enabled.
-   Verify all calculations.

**Deliverable:** Users can understand learning activity and progress.

### Phase 10 --- Security, Testing, and Deployment

-   Complete authorization tests.
-   Test file security.
-   Test responsive layouts.
-   Review database indexes.
-   Configure production environment.
-   Configure backups.
-   Add monitoring and error logging.
-   Prepare user guide and deployment documentation.

**Deliverable:** Tested and deployable first release.

## 28. Development Rules for the Team

1.  Read this specification before implementing a module.
2.  Do not invent new features without recording the change.
3.  Do not place all application logic in one large component or route
    file.
4.  Keep frontend and backend responsibilities separate.
5.  Validate data on the server even if the frontend already validates
    it.
6.  Never rely on hidden buttons as the only permission control.
7.  Use database foreign keys and constraints.
8.  Use migrations instead of manually changing production tables.
9.  Use reusable components for repeated interface patterns.
10. Use consistent naming for files, variables, API routes, and database
    tables.
11. Handle loading, empty, success, and error states.
12. Test each module before moving to the next phase.
13. Do not commit credentials, private keys, or `.env` files.
14. Keep historical academic records when archiving users or courses.
15. Update this specification when requirements change.
16. Do not mark a feature complete until its backend behavior, frontend
    behavior, permissions, validation, and tests are complete.

## 29. Risks and Mitigation

  -----------------------------------------------------------------------
  Risk                    Possible Effect         Mitigation
  ----------------------- ----------------------- -----------------------
  Scope becomes too large Delayed delivery        Follow the phased MVP
                                                  roadmap

  Incorrect permissions   Private student data    Test role and
                          exposed                 record-level
                                                  authorization

  Unsafe uploads          Security issue          Validate and protect
                                                  file storage

  Poor database           Data inconsistency      Finalize ERD and
  relationships                                   constraints before
                                                  feature development

  Quiz submission failure Lost student answers    Save answers safely and
                                                  test recovery behavior

  Unclear grading rules   Incorrect grades        Define score and
                                                  release policies

  Too many dashboard      Confusing interface     Prioritize
  elements                                        role-specific tasks

  Missing backups         Data loss               Schedule and test
                                                  backups

  Unclear deadlines and   Incorrect availability  Use one consistent
  time zones                                      time-zone policy

  Uncontrolled feature    Unfinished core system  Use scope approval and
  additions                                       change tracking
  -----------------------------------------------------------------------

## 30. Final Product Definition

LearnSpace is a role-based Mini Learning Management System that supports
the core learning cycle:

1.  Administrators create and manage users, courses, and learning
    access.
2.  Teachers organize courses into modules and lessons.
3.  Teachers publish learning materials, assignments, and quizzes.
4.  Students enroll in courses and access published learning content.
5.  Students complete lessons, submit assignments, and take quizzes.
6.  Teachers review submissions, grade work, and provide feedback.
7.  Students monitor grades and learning progress.
8.  Administrators and teachers use reports to monitor course activity.

The first release must prioritize a secure, complete learning workflow
over optional advanced features. Gamification, discussions, analytics,
and additional interactive activities should be added in a controlled
way after the core learning process works correctly.

------------------------------------------------------------------------

## 31. Items to Confirm Before Development

The following decisions are intentionally left open and must be
confirmed with the project owner:

-   Final system name and branding.
-   Required technology stack.
-   Whether users are created by administrators or can register
    themselves.
-   Whether students enroll themselves, are enrolled by teachers, or use
    both methods.
-   Whether courses are private, public, or invitation-only.
-   Whether teachers can create courses or only manage
    administrator-assigned courses.
-   Required grading scale and grading formula.
-   Whether assignment resubmission is allowed.
-   Whether quizzes allow multiple attempts.
-   Whether quiz questions support manual grading.
-   Maximum upload size and allowed file types.
-   Whether email notifications are required.
-   Whether gamification and leaderboards are enabled.
-   Whether certificates are required.
-   Hosting and backup arrangements.
-   Data-retention and privacy policies.

**End of specification.**
