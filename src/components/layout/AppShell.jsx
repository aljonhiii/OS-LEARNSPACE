import React, { useState } from 'react';
import { 
  GraduationCap, Bell, MessageSquare, HelpCircle, 
  LayoutDashboard, BookMarked, FolderGit2, Users, Star, 
  Wallet, Sparkles, Settings, Menu, X, CheckCircle, 
  Award, Shield, FileText, ChevronRight, LogOut,
  Layers, CheckSquare, Calendar, BarChart2, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BadgeShield from '../common/BadgeShield';

export default function AppShell({ activePage, setActivePage, children }) {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);

  const role = currentUser?.role || 'teacher';

  // Navigation Items per Role (Every single one required by the prompt)
  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-users', label: 'User Management', icon: Users },
        { id: 'admin-students', label: 'Student Management', icon: GraduationCap },
        { id: 'admin-teachers', label: 'Teacher Management', icon: Award },
        { id: 'admin-courses', label: 'Course Management', icon: BookMarked },
        { id: 'admin-categories', label: 'Course Categories', icon: Layers },
        { id: 'admin-enrollments', label: 'Enrollment Management', icon: CheckSquare },
        { id: 'admin-announcements', label: 'Announcements', icon: Bell },
        { id: 'admin-reports', label: 'Reports & Analytics', icon: BarChart2 },
        { id: 'admin-settings', label: 'System Settings', icon: Settings },
        { id: 'admin-audit', label: 'Audit Logs', icon: ShieldAlert }
      ];
    }
    if (role === 'student') {
      return [
        { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'student-catalog', label: 'Course Catalog', icon: BookMarked },
        { id: 'student-courses', label: 'My Courses', icon: GraduationCap },
        { id: 'student-materials', label: 'Learning Materials', icon: FolderGit2 },
        { id: 'student-assignments', label: 'Assignments', icon: FileText },
        { id: 'student-quizzes', label: 'Quizzes', icon: Award },
        { id: 'student-grades', label: 'Grades & Feedback', icon: Star },
        { id: 'student-progress', label: 'Learning Progress', icon: CheckSquare },
        { id: 'student-calendar', label: 'Calendar', icon: Calendar },
        { id: 'student-announcements', label: 'Announcements', icon: Bell },
        { id: 'student-notifications', label: 'Notifications', icon: Bell },
        { id: 'student-achievements', label: 'Achievements', icon: Sparkles },
        { id: 'student-profile', label: 'Profile', icon: Settings }
      ];
    }
    // Teacher (Default matching reference screenshot)
    return [
      { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'teacher-courses', label: 'My Courses', icon: BookMarked },
      { id: 'teacher-workspace', label: 'Course Workspace', icon: Layers },
      { id: 'teacher-modules', label: 'Module Management', icon: FolderGit2 },
      { id: 'teacher-lessons', label: 'Lesson Management', icon: FileText },
      { id: 'teacher-materials', label: 'Learning Materials', icon: FolderGit2 },
      { id: 'teacher-roster', label: 'Student Roster', icon: Users },
      { id: 'teacher-assignments', label: 'Assignment Management', icon: FileText },
      { id: 'teacher-submissions', label: 'Submission Management', icon: CheckSquare },
      { id: 'teacher-quizzes', label: 'Quiz Management', icon: Award },
      { id: 'teacher-gradebook', label: 'Gradebook', icon: Star },
      { id: 'teacher-announcements', label: 'Announcements', icon: Bell },
      { id: 'teacher-discussions', label: 'Discussions', icon: MessageSquare },
      { id: 'teacher-analytics', label: 'Course Analytics', icon: BarChart2 }
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="w-full min-h-screen bg-[#F0F4FA] flex flex-col font-sans selection:bg-blue-200">
      
      {/* FULL-WIDTH TOPBAR NAVIGATION */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
        
        {/* Brand Logo matching screenshot */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActivePage(role === 'admin' ? 'admin-dashboard' : role === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex items-baseline">
              <span className="font-heading text-xl font-bold tracking-tight text-blue-600">learn</span>
              <span className="font-heading text-xl font-bold tracking-tight text-slate-800">space</span>
            </div>
          </div>
        </div>

        {/* Right Topbar Actions matching screenshot */}
        <div className="flex items-center gap-3">
          
          <button 
            onClick={() => setActivePage(role === 'teacher' ? 'teacher-discussions' : 'student-announcements')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>Chat</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setNotifDropdown(!notifDropdown)}
              className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            {notifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-heading text-xs font-bold text-slate-800">In-App Notifications</span>
                  <span className="text-[10px] text-blue-600 font-medium">3 unread</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-blue-50/60 rounded-xl">
                    <p className="font-semibold text-slate-800">Assignment Graded</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Your Token Specification submission was graded: 95/100.</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-800">Upcoming Lesson in 2 hours</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Jane Cooper (Intermediate Structured Lesson)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img 
              src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
              alt={currentUser?.first_name} 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
            />
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* BODY WORKSPACE: FULL-WIDTH SIDEBAR + FULL CONTENT CANVAS */}
      <div className="w-full flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR (Full height, structured, matching screenshot) */}
        <aside className={`
          w-64 lg:w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 overflow-y-auto z-30
          ${mobileMenuOpen ? 'fixed inset-y-0 left-0 pt-16' : 'hidden md:flex'}
        `}>
          
          <div className="space-y-5">
            
            {/* Profile Mini-Card matching screenshot */}
            <div className="flex items-start gap-3">
              <div className="relative">
                <img 
                  src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-semibold text-slate-800 text-sm truncate">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.location || "Ukraine, 17:37 (GMT +3)"}
                </p>
              </div>
            </div>

            {/* Role & Status Row (Clean LMS Profile) */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Role Identity:</span>
                <span className="font-bold text-slate-800 text-xs">
                  {role === 'teacher' ? 'Faculty Instructor' : role === 'student' ? 'Student Scholar' : 'Administrator'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200/60">
                Active
              </span>
            </div>

            {/* Student Achievements Row (Only for Student Role per FULLSYSTEM.md 9.12) */}
            {role === 'student' && (
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-700">My Badges:</span>
                  <button 
                    onClick={() => setActivePage('student-achievements')}
                    className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeShield variant="blue" icon={GraduationCap} title="First Steps" />
                  <BadgeShield variant="yellow" icon={Award} title="Token Master" />
                  <BadgeShield variant="teal" icon={FileText} title="Verified Deliverable" />
                </div>
              </div>
            )}

            {/* Section Header */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {role === 'admin' ? 'Administration' : role === 'student' ? 'Student Portal' : 'Faculty Portal'}
              </span>
            </div>

            {/* Navigation Items (Every single item has a working page) */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 font-bold shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-blue-500' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Bottom Version Indicator */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>LearnSpace LMS</span>
            <span className="font-mono text-[10px] text-slate-300">v2.0</span>
          </div>

        </aside>

        {/* MAIN FULL-WIDTH WORKSPACE CANVAS */}
        <main className="flex-1 bg-[#F0F4FA] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
