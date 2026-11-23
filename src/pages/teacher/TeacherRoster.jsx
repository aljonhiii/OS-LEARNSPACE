import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, Search, Filter, BookOpen, CheckCircle, Mail, 
  GraduationCap, X, Award, LayoutGrid, List, ArrowUpDown, 
  TrendingUp, UserCheck, ChevronRight
} from 'lucide-react';
import { formatPhDate } from '../../utils/dateUtils';

export default function TeacherRoster({ setActivePage }) {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'cards' | 'table'
  const [viewMode, setViewMode] = useState('cards');

  // Filters, Search & Sort
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'completed', 'dropped'
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('progress-desc');

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch Data
  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const [enrollRes, coursesRes] = await Promise.all([
        fetch('/api/enrollments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (enrollRes.ok) {
        const data = await enrollRes.json();
        setEnrollments(data);
      }
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData);
      }
    } catch (err) {
      console.error('Failed to load roster data:', err);
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const [enrollRes, coursesRes] = await Promise.all([
          fetch('/api/enrollments', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!isMounted) return;

        if (enrollRes.ok) {
          const data = await enrollRes.json();
          setEnrollments(data);
        }
        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          setCourses(cData);
        }
      } catch (err) {
        console.error('Failed to init roster data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, []);

  // Handle Enrollment Status Change
  const handleUpdateStatus = async (enrollmentId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/enrollments/${enrollmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Student enrollment status changed to ${newStatus.toUpperCase()}` });
        setTimeout(() => setMessage(null), 3000);
        await loadData();
        if (selectedStudent && selectedStudent.id === enrollmentId) {
          setSelectedStudent(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert('Failed to update student status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick Cohort Metrics
  const cohortMetrics = useMemo(() => {
    const total = enrollments.length;
    const active = enrollments.filter(e => (e.status || 'active').toLowerCase() === 'active').length;
    const completed = enrollments.filter(e => (e.status || '').toLowerCase() === 'completed').length;
    const dropped = enrollments.filter(e => (e.status || '').toLowerCase() === 'dropped').length;
    
    const totalProgress = enrollments.reduce((sum, e) => sum + (parseFloat(e.progress_pct) || 0), 0);
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return { total, active, completed, dropped, avgProgress };
  }, [enrollments]);

  // Filtered & Sorted Enrollments
  const filteredEnrollments = useMemo(() => {
    let result = enrollments.filter(e => {
      const matchesCourse = selectedCourse === 'all' || String(e.course_id) === String(selectedCourse);
      const matchesStatus = statusFilter === 'all' || (e.status || 'active').toLowerCase() === statusFilter.toLowerCase();
      
      const studentName = (e.student_name || `${e.student_first_name || ''} ${e.student_last_name || ''}`).toLowerCase();
      const email = (e.student_email || '').toLowerCase();
      const courseTitle = (e.course_title || '').toLowerCase();
      const q = search.toLowerCase().trim();

      const matchesSearch = !q || studentName.includes(q) || email.includes(q) || courseTitle.includes(q);

      return matchesCourse && matchesStatus && matchesSearch;
    });

    // Sorting
    result.sort((a, b) => {
      const aProg = parseFloat(a.progress_pct) || 0;
      const bProg = parseFloat(b.progress_pct) || 0;
      const aName = a.student_name || `${a.student_first_name || ''} ${a.student_last_name || ''}`;
      const bName = b.student_name || `${b.student_first_name || ''} ${b.student_last_name || ''}`;

      if (sortBy === 'progress-desc') return bProg - aProg;
      if (sortBy === 'progress-asc') return aProg - bProg;
      if (sortBy === 'name-asc') return aName.localeCompare(bName);
      if (sortBy === 'name-desc') return bName.localeCompare(aName);
      if (sortBy === 'latest') return new Date(b.enrolled_at) - new Date(a.enrolled_at);
      return 0;
    });

    return result;
  }, [enrollments, selectedCourse, statusFilter, search, sortBy]);

  // Color helper for progress bar
  const getProgressColor = (pct) => {
    if (pct >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (pct >= 50) return { bar: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' };
    if (pct >= 20) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
    return { bar: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' };
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const s = (status || 'active').toLowerCase();
    if (s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Completed
        </span>
      );
    }
    if (s === 'dropped') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Dropped
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          PAGE HEADER
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Academic Cohorts
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              • Student Roster & Performance Matrix
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-2 tracking-tight">
            Student Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Monitor enrolled scholars across your assigned courses, inspect individual completion progress, and review academic standing.
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-white text-blue-600 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-blue-600 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE COHORT METRIC TILES
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Total Enrolled */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${
            statusFilter === 'all' 
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10' 
              : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{cohortMetrics.total}</span>
            <span className="text-[10px] text-slate-400 font-medium">scholars</span>
          </div>
        </div>

        {/* Metric 2: Active Students */}
        <div 
          onClick={() => setStatusFilter('active')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${
            statusFilter === 'active' 
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' 
              : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{cohortMetrics.active}</span>
            <span className="text-[10px] text-emerald-600 font-medium">participating</span>
          </div>
        </div>

        {/* Metric 3: Completed */}
        <div 
          onClick={() => setStatusFilter('completed')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${
            statusFilter === 'completed' 
              ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10' 
              : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{cohortMetrics.completed}</span>
            <span className="text-[10px] text-purple-600 font-medium">graduated</span>
          </div>
        </div>

        {/* Metric 4: Average Completion */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Completion</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{cohortMetrics.avgProgress}%</span>
            <span className="text-[10px] text-slate-400 font-medium">syllabus</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ACTION TOOLBAR (SEARCH, COURSE FILTER, STATUS, SORT)
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search student by name, email, or course..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns: Course, Status, Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Course Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Course:</span>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Assigned Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code ? `${c.course_code} - ${c.title}` : c.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
              <option value="dropped">Dropped Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="progress-desc">Progress: High to Low</option>
              <option value="progress-asc">Progress: Low to High</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="latest">Recently Enrolled</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedCourse !== 'all' || statusFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setSelectedCourse('all');
                setStatusFilter('all');
                setSearch('');
              }}
              className="text-[11px] text-blue-600 font-semibold hover:underline px-2 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* =========================================================================
          ROSTER PRESENTATION (CARDS VIEW OR TABLE VIEW)
      ========================================================================= */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading enrolled students...
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No students match your filter criteria</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing status filters, or select "All Assigned Courses".
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* ==================== 1. CARDS VIEW (Inspired by Reference UI) ==================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEnrollments.map((enr) => {
            const prog = parseFloat(enr.progress_pct) || 0;
            const progStyle = getProgressColor(prog);
            const studentName = enr.student_name || `${enr.student_first_name || ''} ${enr.student_last_name || ''}`;

            return (
              <div 
                key={enr.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group"
              >
                <div className="space-y-4">
                  
                  {/* Top Row: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative">
                      <img 
                        src={enr.student_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                        alt={studentName}
                        className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(enr.status)}
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatPhDate(enr.enrolled_at)}
                      </span>
                    </div>
                  </div>

                  {/* Student Name & Email */}
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {studentName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                      {enr.student_email}
                    </p>
                    
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium max-w-full">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{enr.course_title}</span>
                    </div>
                  </div>

                  {/* Interactive Progress Bar */}
                  <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-600">Curriculum Progress</span>
                      <span className={`font-mono font-bold text-xs ${progStyle.text}`}>
                        {prog}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progStyle.bar}`}
                        style={{ width: `${Math.min(prog, 100)}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudent(enr)}
                    className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Inspect Record</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`mailto:${enr.student_email}?subject=${encodeURIComponent(`Academic Update: ${enr.course_title}`)}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200/60"
                    title="Send Email to Student"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        
        /* ==================== 2. TABLE VIEW ==================== */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Student Scholar</th>
                  <th className="py-3 px-4">Enrolled Course</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredEnrollments.map((enr) => {
                  const prog = parseFloat(enr.progress_pct) || 0;
                  const progStyle = getProgressColor(prog);
                  const studentName = enr.student_name || `${enr.student_first_name || ''} ${enr.student_last_name || ''}`;

                  return (
                    <tr 
                      key={enr.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Student Scholar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={enr.student_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-heading font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {studentName}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {enr.student_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block truncate max-w-[200px]">
                          {enr.course_title}
                        </span>
                        <span className="text-[10px] text-blue-600 font-mono block">
                          {enr.course_code || 'COURSE'}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono font-bold">
                            <span className={progStyle.text}>{prog}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${progStyle.bar}`} 
                              style={{ width: `${Math.min(prog, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {formatPhDate(enr.enrolled_at)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(enr.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(enr)}
                            className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                          >
                            Inspect Record
                          </button>

                          <a
                            href={`mailto:${enr.student_email}?subject=${encodeURIComponent(`Academic Update: ${enr.course_title}`)}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Email Student"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE STUDENT ACADEMIC RECORD MODAL
      ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Student Academic Record
                  </h3>
                  <p className="text-[11px] text-slate-400">Institutional Scholar Profile</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              <img 
                src={selectedStudent.student_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                alt="" 
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-heading font-bold text-base text-slate-900 truncate">
                  {selectedStudent.student_name || `${selectedStudent.student_first_name || ''} ${selectedStudent.student_last_name || ''}`}
                </h4>
                <p className="text-xs text-slate-400 font-mono truncate">{selectedStudent.student_email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-block text-[10px] bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {selectedStudent.course_code || 'COURSE'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    {selectedStudent.course_title}
                  </span>
                </div>
              </div>
            </div>

            {/* Completion & Metrics */}
            <div className="space-y-3 text-xs">
              
              <div className="p-4 bg-white border border-slate-200/70 rounded-2xl space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-slate-700">Course Syllabus Completion</span>
                  <span className="text-blue-600 font-mono font-bold text-sm">
                    {selectedStudent.progress_pct || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(parseFloat(selectedStudent.progress_pct) || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Status Switcher */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                    Enrollment Status
                  </span>
                  {updatingStatus && (
                    <span className="text-[10px] text-blue-600 animate-pulse font-semibold">
                      Updating...
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['active', 'completed', 'dropped'].map((st) => {
                    const isCurrent = (selectedStudent.status || 'active').toLowerCase() === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedStudent.id, st)}
                        className={`py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                          isCurrent
                            ? st === 'active'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : st === 'completed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enrollment Details */}
              <div className="divide-y divide-slate-100 pt-1">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Enrolled On</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {formatPhDate(selectedStudent.enrolled_at)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Institutional ID</span>
                  <span className="font-mono text-slate-600">
                    SCH-{String(selectedStudent.student_id).padStart(4, '0')}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={`mailto:${selectedStudent.student_email}?subject=${encodeURIComponent(`Academic Advisory: ${selectedStudent.course_title}`)}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>Send Direct Email</span>
              </a>

              {setActivePage && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    setActivePage('teacher-gradebook');
                  }}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Gradebook</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
