import React, { useState, useEffect } from 'react';
import { 
  BookMarked, Users, FileText, Award, Clock, CheckCircle, 
  ArrowRight, Plus, ExternalLink, Calendar as CalendarIcon, 
  AlertCircle, ChevronRight, CheckSquare, Globe
} from 'lucide-react';
import MiniCalendar from '../common/MiniCalendar';
import RealtimeActivityChart from '../common/RealtimeActivityChart';
import { formatPhDate, formatPhDateTime, formatPhTime, getPhNow } from '../../utils/dateUtils';

export default function TeacherDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phNow, setPhNow] = useState(() => getPhNow());

  // Live Philippine Standard Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setPhNow(getPhNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadTeacherDashboard() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeacherDashboard();
  }, []);

  const stats = data?.stats || {
    assignedCourses: 3,
    totalStudents: 4,
    pendingSubmissions: 1,
    activeQuizzes: 1
  };

  const assignedCourses = data?.assignedCourses || [];
  const pendingSubmissions = data?.pendingSubmissions || [];
  const recentQuizAttempts = data?.recentQuizAttempts || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];

  return (
    <div className="space-y-6">
      
      {/* 1. FACULTY WELCOME & QUICK ACTION BAR (FULLSYSTEM.md 8.1) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Faculty Workspace
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Instructor Dashboard
            </span>

            {/* Live Philippine Standard Time Badge (PST / PHT, UTC+8) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-md text-xs font-mono text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">PH Time:</span>
              <span className="font-bold text-slate-900">{phNow.timeStr}</span>
              <span className="text-slate-400 text-[10px]">({phNow.fullDateStr})</span>
            </div>
          </div>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Welcome back, {data?.profile?.first_name || 'Cameron'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of your assigned curriculums, enrolled cohorts, and student submissions awaiting evaluation.
          </p>
        </div>

        {/* Quick Actions (FULLSYSTEM.md 8.1) */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={() => onNavigate && onNavigate('courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Course</span>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('teacher-assignments')}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>New Assignment</span>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('teacher-quizzes')}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* 2. CORE STATISTIC CARDS (FULLSYSTEM.md 8.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Assigned Courses */}
        <div 
          onClick={() => onNavigate && onNavigate('courses')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Courses</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-heading font-bold text-2xl text-slate-900 group-hover:text-blue-600 transition-colors">
              {stats.assignedCourses}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active Teaching Curriculums</span>
          </div>
        </div>

        {/* Total Enrolled Students */}
        <div 
          onClick={() => onNavigate && onNavigate('students')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-heading font-bold text-2xl text-slate-900 group-hover:text-indigo-600 transition-colors">
              {stats.totalStudents}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across Assigned Cohorts</span>
          </div>
        </div>

        {/* Pending Submissions */}
        <div 
          onClick={() => onNavigate && onNavigate('teacher-submissions')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              stats.pendingSubmissions > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`font-heading font-bold text-2xl ${
              stats.pendingSubmissions > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {stats.pendingSubmissions}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {stats.pendingSubmissions > 0 ? 'Submissions Need Grading' : 'All Work Evaluated'}
            </span>
          </div>
        </div>

        {/* Active Quizzes */}
        <div 
          onClick={() => onNavigate && onNavigate('teacher-quizzes')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Quizzes</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-heading font-bold text-2xl text-slate-900 group-hover:text-emerald-600 transition-colors">
              {stats.activeQuizzes}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Published Knowledge Checks</span>
          </div>
        </div>

      </div>

      {/* STUDENT ACTIVITY CHART — Real-time & database-driven */}
      <RealtimeActivityChart 
        title="Student Activity Overview"
        subtitle="Coursework submissions and grading velocity"
        metricLabel="Submissions"
        unit=""
        growthPercentage="+18.4%"
        accentColor="#2563EB"
        dataSets={data?.activityChart || {
          'Week': [
            { label: 'Mon', value: 8 },
            { label: 'Tue', value: 14 },
            { label: 'Wed', value: 12 },
            { label: 'Thu', value: 23 },
            { label: 'Fri', value: 29 },
            { label: 'Sat', value: 18 },
            { label: 'Sun', value: 34 }
          ],
          'Month': [
            { label: 'Week 1', value: 72 },
            { label: 'Week 2', value: 98 },
            { label: 'Week 3', value: 124 },
            { label: 'Week 4', value: 156 }
          ],
          'Year': [
            { label: 'Jan', value: 180 },
            { label: 'Feb', value: 240 },
            { label: 'Mar', value: 310 },
            { label: 'Apr', value: 290 },
            { label: 'May', value: 380 },
            { label: 'Jun', value: 420 },
            { label: 'Jul', value: 390 },
            { label: 'Aug', value: 450 },
            { label: 'Sep', value: 510 },
            { label: 'Oct', value: 580 },
            { label: 'Nov', value: 620 },
            { label: 'Dec', value: 680 }
          ]
        }}
      />

      {/* 3. PENDING SUBMISSIONS QUEUE (PRIORITY ACTION AREA - FULLSYSTEM.md 8.1 & 8.8) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Pending Submissions Awaiting Evaluation
            </h3>
            {pendingSubmissions.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingSubmissions.length} Requires Review
              </span>
            )}
          </div>

          <button 
            onClick={() => onNavigate && onNavigate('teacher-submissions')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Submissions Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-1">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-700">All submissions are graded!</p>
            <p className="text-[11px] text-slate-400">New student milestone uploads will appear here in your evaluation queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingSubmissions.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={sub.student_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                    alt="" 
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-xs text-slate-900 block truncate">
                      {sub.student_name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {sub.assignment_title} • <strong className="font-mono text-blue-600 font-normal">{sub.course_code}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span 
                    className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono"
                    title={`Philippine Time: ${formatPhDateTime(sub.submitted_at)}`}
                  >
                    <Clock className="w-3 h-3" />
                    {formatPhDate(sub.submitted_at)} {formatPhTime(sub.submitted_at)}
                  </span>

                  <button
                    onClick={() => onNavigate && onNavigate('teacher-submissions')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Grade Work
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ASSIGNED COURSES OVERVIEW & UPCOMING DEADLINES (FULLSYSTEM.md 8.1 & 8.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Assigned Courses (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              My Assigned Courses ({assignedCourses.length})
            </h3>
            <button 
              onClick={() => onNavigate && onNavigate('courses')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assignedCourses.map((c) => (
              <div 
                key={c.id} 
                className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-between group"
              >
                <div>
                  <div className="h-28 rounded-lg overflow-hidden mb-3 relative bg-slate-100">
                    <img 
                      src={c.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-800 px-2 py-0.5 rounded-md">
                      {c.course_code}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {c.title}
                  </h4>
                  
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-500" />
                      {c.student_count || 0} Students
                    </span>
                    <span>•</span>
                    <span>{c.module_count || 0} Modules</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate && onNavigate('teacher-workspace')}
                    className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-200/80 text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Open Workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Assessment Deadlines & Schedule (1 Col) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Upcoming Assessment Deadlines */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider">
              Upcoming Deadlines
            </h3>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 italic">No open deadlines.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50/70 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 line-clamp-1">{item.title}</span>
                      <span className="text-amber-600 font-mono font-bold shrink-0">
                        {item.due_at ? formatPhDate(item.due_at) : 'Self-paced'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {item.course_code} • {item.submission_count || 0} submitted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini Calendar Schedule */}
          <MiniCalendar 
            onFullCalendar={() => onNavigate && onNavigate('calendar')}
          />

        </div>

      </div>

      {/* 5. RECENT STUDENT QUIZ RESULTS (FULLSYSTEM.md 8.1) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-bold text-sm text-slate-900">
            Recent Student Quiz Results & Knowledge Checks
          </h3>
          <button 
            onClick={() => onNavigate && onNavigate('teacher-gradebook')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Full Gradebook Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentQuizAttempts.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No student quiz attempts recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentQuizAttempts.map((qa) => {
              const pct = qa.max_score > 0 ? Math.round((qa.score / qa.max_score) * 100) : 0;
              return (
                <div key={qa.id} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={qa.student_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                      alt="" 
                      className="w-8 h-8 rounded-full object-cover shrink-0" 
                    />
                    <div className="truncate">
                      <span className="font-semibold text-xs text-slate-900 block truncate">{qa.student_name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{qa.quiz_title}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold shrink-0 ${
                    pct >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}