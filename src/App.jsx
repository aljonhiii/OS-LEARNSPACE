import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized';
import { Loader2, GraduationCap } from 'lucide-react';

// Dashboards
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCategories from './pages/admin/AdminCategories';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Teacher Pages
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherWorkspace from './pages/teacher/TeacherWorkspace';
import TeacherModules from './pages/teacher/TeacherModules';
import TeacherLessons from './pages/teacher/TeacherLessons';
import TeacherMaterials from './pages/teacher/TeacherMaterials';
import TeacherRoster from './pages/teacher/TeacherRoster';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherSubmissions from './pages/teacher/TeacherSubmissions';
import TeacherQuizzes from './pages/teacher/TeacherQuizzes';
import TeacherGradebook from './pages/teacher/TeacherGradebook';
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements';
import TeacherDiscussions from './pages/teacher/TeacherDiscussions';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';

// Student Pages
import StudentCatalog from './pages/student/StudentCatalog';
import StudentMyCourses from './pages/student/StudentMyCourses';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentQuizzes from './pages/student/StudentQuizzes';
import StudentGrades from './pages/student/StudentGrades';
import StudentProgress from './pages/student/StudentProgress';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentAchievements from './pages/student/StudentAchievements';
import StudentProfile from './pages/student/StudentProfile';

// Shared Drill-Down / Viewer
import LessonViewer from './pages/LessonViewer';

function MainApp() {
  const { currentUser, loading } = useAuth();
  const role = currentUser?.role;

  // Active page state
  const [activePage, setActivePage] = useState('');

  // Drill-down states
  const [activeLessonId, setActiveLessonId] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  // Automatically redirect user to their assigned role dashboard on login or role change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setActivePage('admin-dashboard');
      } else if (currentUser.role === 'student') {
        setActivePage('student-dashboard');
      } else {
        setActivePage('teacher-dashboard');
      }
    } else {
      setActivePage('');
    }
  }, [currentUser]);

  // Loading Session Screen
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F0F4FA] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4 animate-bounce">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span>Verifying LearnSpace Session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated: strictly show Login page
  if (!currentUser) {
    return <Login />;
  }

  const handleOpenLesson = (id) => {
    setActiveLessonId(id || 1);
    setActivePage('lesson-detail');
  };

  const handleBackToDashboard = () => {
    if (role === 'admin') setActivePage('admin-dashboard');
    else if (role === 'student') setActivePage('student-dashboard');
    else setActivePage('teacher-dashboard');
  };

  // Render role-restricted content
  const renderContent = () => {
    // 1. Drill-down screen: Lesson Viewer (shared by Teacher and Student)
    if (activePage === 'lesson-detail') {
      return (
        <LessonViewer 
          lessonId={activeLessonId || 1} 
          onBack={() => setActivePage(role === 'student' ? 'student-progress' : 'teacher-workspace')}
        />
      );
    }

    // 2. Administrator Access Control
    if (role === 'admin') {
      // Guard against out-of-role navigation
      if (activePage.startsWith('teacher-') || activePage.startsWith('student-')) {
        return <Unauthorized onBackToDashboard={handleBackToDashboard} />;
      }

      switch (activePage) {
        case 'admin-users':
          return <AdminUsers setActivePage={setActivePage} />;
        case 'admin-students':
          return <AdminStudents setActivePage={setActivePage} />;
        case 'admin-teachers':
          return <AdminTeachers setActivePage={setActivePage} />;
        case 'admin-courses':
          return <AdminCourses setActivePage={setActivePage} />;
        case 'admin-categories':
          return <AdminCategories setActivePage={setActivePage} />;
        case 'admin-enrollments':
          return <AdminEnrollments setActivePage={setActivePage} />;
        case 'admin-announcements':
          return <AdminAnnouncements setActivePage={setActivePage} />;
        case 'admin-reports':
          return <AdminReports setActivePage={setActivePage} />;
        case 'admin-settings':
          return <AdminSettings setActivePage={setActivePage} />;
        case 'admin-audit':
          return <AdminAuditLogs setActivePage={setActivePage} />;
        case 'admin-dashboard':
        default:
          return <AdminDashboard setActivePage={setActivePage} />;
      }
    }

    // 3. Student Access Control
    if (role === 'student') {
      // Guard against out-of-role navigation
      if (activePage.startsWith('admin-') || activePage.startsWith('teacher-')) {
        return <Unauthorized onBackToDashboard={handleBackToDashboard} />;
      }

      switch (activePage) {
        case 'student-catalog':
          return <StudentCatalog setActivePage={setActivePage} onOpenCourse={(id) => { setSelectedCourseId(id); setActivePage('student-progress'); }} />;
        case 'student-courses':
          return <StudentMyCourses setActivePage={setActivePage} onOpenLesson={handleOpenLesson} />;
        case 'student-materials':
          return <StudentMaterials setActivePage={setActivePage} />;
        case 'student-assignments':
          return <StudentAssignments setActivePage={setActivePage} />;
        case 'student-quizzes':
          return <StudentQuizzes setActivePage={setActivePage} />;
        case 'student-grades':
          return <StudentGrades setActivePage={setActivePage} />;
        case 'student-progress':
          return <StudentProgress setActivePage={setActivePage} onOpenLesson={handleOpenLesson} />;
        case 'student-calendar':
          return <StudentCalendar setActivePage={setActivePage} />;
        case 'student-announcements':
          return <StudentAnnouncements setActivePage={setActivePage} />;
        case 'student-notifications':
          return <StudentNotifications setActivePage={setActivePage} />;
        case 'student-achievements':
          return <StudentAchievements setActivePage={setActivePage} />;
        case 'student-profile':
          return <StudentProfile setActivePage={setActivePage} />;
        case 'student-dashboard':
        default:
          return (
            <StudentDashboard 
              onNavigate={(tab) => {
                if (tab === 'lessons') handleOpenLesson(1);
                else if (tab === 'assignments') setActivePage('student-assignments');
                else if (tab === 'quizzes') setActivePage('student-quizzes');
                else if (tab === 'catalog') setActivePage('student-catalog');
                else setActivePage(tab);
              }} 
            />
          );
      }
    }

    // 4. Teacher Access Control
    if (role === 'teacher') {
      // Guard against out-of-role navigation
      if (activePage.startsWith('admin-') || activePage.startsWith('student-')) {
        return <Unauthorized onBackToDashboard={handleBackToDashboard} />;
      }

      switch (activePage) {
        case 'teacher-courses':
          return <TeacherCourses setActivePage={setActivePage} setSelectedCourseId={setSelectedCourseId} />;
        case 'teacher-workspace':
          return (
            <TeacherWorkspace 
              selectedCourseId={selectedCourseId} 
              setActivePage={setActivePage} 
              onOpenLesson={handleOpenLesson} 
            />
          );
        case 'teacher-modules':
          return <TeacherModules setActivePage={setActivePage} />;
        case 'teacher-lessons':
          return <TeacherLessons setActivePage={setActivePage} onOpenLesson={handleOpenLesson} />;
        case 'teacher-materials':
          return <TeacherMaterials setActivePage={setActivePage} />;
        case 'teacher-roster':
          return <TeacherRoster setActivePage={setActivePage} />;
        case 'teacher-assignments':
          return (
            <TeacherAssignments 
              setActivePage={setActivePage} 
              setSelectedAssignmentId={setSelectedAssignmentId} 
            />
          );
        case 'teacher-submissions':
          return <TeacherSubmissions selectedAssignmentId={selectedAssignmentId} setActivePage={setActivePage} />;
        case 'teacher-quizzes':
          return <TeacherQuizzes setActivePage={setActivePage} />;
        case 'teacher-gradebook':
          return <TeacherGradebook setActivePage={setActivePage} />;
        case 'teacher-announcements':
          return <TeacherAnnouncements setActivePage={setActivePage} />;
        case 'teacher-discussions':
          return <TeacherDiscussions setActivePage={setActivePage} />;
        case 'teacher-analytics':
          return <TeacherAnalytics setActivePage={setActivePage} />;
        case 'teacher-dashboard':
        default:
          return (
            <TeacherDashboard 
              onNavigate={(tab) => {
                if (tab === 'courses') setActivePage('teacher-courses');
                else if (tab === 'students') setActivePage('teacher-roster');
                else if (tab === 'calendar') setActivePage('teacher-workspace');
                else if (tab === 'lessons') handleOpenLesson(1);
                else setActivePage(tab);
              }} 
            />
          );
      }
    }

    // Unknown or unhandled role
    return <Unauthorized onBackToDashboard={handleBackToDashboard} />;
  };

  return (
    <AppShell activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}