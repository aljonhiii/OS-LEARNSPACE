import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, BookMarked, FileText, Award, Users, 
  Settings, LayoutDashboard, ChevronRight, Bell, 
  MessageSquare, Layers, ShieldAlert, Sparkles
} from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, onNavigate, role = 'teacher' }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Search items index tailored to user roles and curricula
  const searchableItems = [
    // Pages / Sections based on role
    {
      id: role === 'admin' ? 'admin-dashboard' : role === 'student' ? 'student-dashboard' : 'teacher-dashboard',
      title: 'Dashboard Overview',
      category: 'Navigation',
      description: 'Main metrics, KPIs, and status summary',
      icon: LayoutDashboard,
      keywords: 'home stats overview analytics kpi'
    },
    {
      id: role === 'admin' ? 'admin-courses' : role === 'student' ? 'student-courses' : 'teacher-courses',
      title: 'Course Management & Curricula',
      category: 'Courses',
      description: 'Manage active syllabi, modules, and lessons',
      icon: BookMarked,
      keywords: 'courses classes modules syllabus'
    },
    {
      id: role === 'student' ? 'student-assignments' : 'teacher-assignments',
      title: 'Assignments Hub',
      category: 'Coursework',
      description: 'Milestones, rubrics, and deliverable deadlines',
      icon: FileText,
      keywords: 'homework tasks deliverables projects'
    },
    {
      id: role === 'student' ? 'student-quizzes' : 'teacher-quizzes',
      title: 'Quizzes & Knowledge Checks',
      category: 'Assessments',
      description: 'Automated quizzes and multiple choice pools',
      icon: Award,
      keywords: 'exams tests checks multiple choice'
    },
    {
      id: role === 'student' ? 'student-grades' : 'teacher-gradebook',
      title: role === 'student' ? 'Grades & Academic Feedback' : 'Gradebook Matrix',
      category: 'Academic Records',
      description: 'Student scores, evaluation feedback, and grade tallies',
      icon: Sparkles,
      keywords: 'scores marks grading records performance'
    },
    {
      id: role === 'teacher' ? 'teacher-submissions' : role === 'admin' ? 'admin-enrollments' : 'student-progress',
      title: role === 'teacher' ? 'Submissions Review Queue' : role === 'admin' ? 'Enrollment Management' : 'Learning Progress',
      category: 'Workflows',
      description: 'Student deliverable evaluation and progress tracking',
      icon: Layers,
      keywords: 'review queue grading enroll progress'
    },
    {
      id: role === 'admin' ? 'admin-users' : role === 'teacher' ? 'teacher-roster' : 'student-catalog',
      title: role === 'admin' ? 'User Directory' : role === 'teacher' ? 'Student Roster' : 'Course Catalog',
      category: 'Directory',
      description: 'Inspect enrolled students, instructors, and cohorts',
      icon: Users,
      keywords: 'students roster people accounts users'
    },
    {
      id: role === 'admin' ? 'admin-announcements' : role === 'teacher' ? 'teacher-announcements' : 'student-announcements',
      title: 'Campus Announcements',
      category: 'Communication',
      description: 'Institutional broadcasts and faculty updates',
      icon: Bell,
      keywords: 'news notices broadcast campus'
    },
    {
      id: role === 'teacher' ? 'teacher-discussions' : 'student-calendar',
      title: role === 'teacher' ? 'Class Discussions' : 'Academic Calendar',
      category: 'Collaboration',
      description: 'Forum threads and scheduled class lessons',
      icon: MessageSquare,
      keywords: 'chat discussions forum comments schedule'
    },
    {
      id: role === 'admin' ? 'admin-settings' : 'student-profile',
      title: role === 'admin' ? 'System Settings' : 'Student Profile',
      category: 'Settings',
      description: 'Preferences, notifications, and security settings',
      icon: Settings,
      keywords: 'config preferences account security'
    },
    ...(role === 'admin' ? [
      {
        id: 'admin-audit',
        title: 'Audit Logs',
        category: 'Administration',
        description: 'Immutable system security records and actor timestamps',
        icon: ShieldAlert,
        keywords: 'security audit logs events'
      }
    ] : []),
    // Specific Course items
    {
      id: role === 'admin' ? 'admin-courses' : role === 'student' ? 'student-courses' : 'teacher-workspace',
      title: 'UI/UX Design Systems (UXD-201)',
      category: 'Active Course',
      description: 'Design tokens, hierarchy, accessibility, and component libraries',
      icon: BookMarked,
      keywords: 'design figma ux ui uxd tokens'
    },
    {
      id: role === 'admin' ? 'admin-courses' : role === 'student' ? 'student-courses' : 'teacher-workspace',
      title: 'Fullstack Architecture (DEV-301)',
      category: 'Active Course',
      description: 'React, Express, MariaDB, and relational schema workflows',
      icon: BookMarked,
      keywords: 'react backend express dev node database'
    }
  ];

  // Filter items matching query
  const filteredItems = query.trim() === ''
    ? searchableItems.slice(0, 7)
    : searchableItems.filter(item => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
        );
      });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        onNavigate(filteredItems[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200/80 flex items-center gap-3 bg-white">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, assignments, roster, pages..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-50 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Search className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No results found</p>
              <p className="text-[11px] text-slate-400">Try searching for courses, assignments, or roster</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-700'}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-300'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Use <kbd className="font-mono bg-white px-1 rounded border border-slate-200">↑</kbd> <kbd className="font-mono bg-white px-1 rounded border border-slate-200">↓</kbd> to navigate, <kbd className="font-mono bg-white px-1 rounded border border-slate-200">Enter</kbd> to select</span>
          <span>{filteredItems.length} results</span>
        </div>
      </div>
    </div>
  );
}
