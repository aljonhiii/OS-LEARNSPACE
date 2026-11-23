import { useState, useEffect, useMemo } from 'react';
import { 
  Star, Download, Search, BookOpen, Award, LayoutGrid, 
  List, TrendingUp, CheckCircle2, X, ChevronRight,
  Mail, FileText, ArrowUpDown
} from 'lucide-react';

export default function TeacherGradebook() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [gradebookData, setGradebookData] = useState(null);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all'); // 'all', 'A', 'B', 'C', 'failing'
  const [sortBy, setSortBy] = useState('avg-desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [loading, setLoading] = useState(true);
  const [inspectStudent, setInspectStudent] = useState(null);

  // Helper: Letter grade and styling
  const getLetterGrade = (pct) => {
    if (pct >= 90) return { letter: 'A', label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 80) return { letter: 'B', label: 'Proficient', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (pct >= 70) return { letter: 'C', label: 'Satisfactory', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (pct >= 60) return { letter: 'D', label: 'Needs Improvement', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { letter: 'F', label: 'Failing / Incomplete', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  // Load Courses
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok && isMounted) {
          const list = await res.json();
          setCourses(list);
          if (list.length > 0) setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    }
    loadCourses();
    return () => { isMounted = false; };
  }, []);

  // Sync Gradebook with selected course
  useEffect(() => {
    if (!selectedCourseId) return;
    let isMounted = true;
    async function fetchGradebook() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch(`/api/gradebook?courseId=${selectedCourseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setGradebookData(data);
        }
      } catch (err) {
        console.error('Failed to load gradebook data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchGradebook();
    return () => { isMounted = false; };
  }, [selectedCourseId]);

  const students = useMemo(() => gradebookData?.students || [], [gradebookData]);
  const assignments = useMemo(() => gradebookData?.assignments || [], [gradebookData]);
  const quizzes = useMemo(() => gradebookData?.quizzes || [], [gradebookData]);

  // Export CSV
  const handleExportCSV = () => {
    if (!gradebookData || students.length === 0) return;
    
    // Header row
    let csv = 'Student Name,Email,Composite Average,Letter Grade,Enrollment Status';
    assignments.forEach(a => {
      csv += `,"Assignment: ${a.title} (${a.max_score} pts)"`;
    });
    quizzes.forEach(q => {
      csv += `,"Quiz: ${q.title}"`;
    });
    csv += '\n';

    // Rows
    students.forEach(s => {
      const lg = getLetterGrade(s.averagePct).letter;
      csv += `"${s.name}","${s.email}",${s.averagePct}%,"${lg}","${s.enrollment_status}"`;
      
      // Assignment scores
      assignments.forEach(a => {
        const found = s.assignmentGrades?.find(g => g.assignment_id === a.id);
        csv += `,${found?.score !== undefined ? found.score : 'N/A'}`;
      });

      // Quiz scores
      quizzes.forEach(q => {
        const found = s.quizScores?.find(qs => qs.quiz_id === q.id);
        csv += `,${found?.highest_score !== null && found?.highest_score !== undefined ? found.highest_score : 'N/A'}`;
      });

      csv += '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradebook_${gradebookData.course?.course_code || 'course'}_matrix.csv`;
    link.click();
  };

  // Gradebook KPI Metrics
  const gradebookMetrics = useMemo(() => {
    if (students.length === 0) {
      return { classAvg: 0, topPerformer: null, passingRate: 0, totalDeliverables: assignments.length + quizzes.length };
    }
    const totalAvg = students.reduce((sum, s) => sum + (s.averagePct || 0), 0);
    const classAvg = Math.round(totalAvg / students.length);
    
    const sorted = [...students].sort((a, b) => (b.averagePct || 0) - (a.averagePct || 0));
    const topPerformer = sorted[0] || null;

    const passingCount = students.filter(s => (s.averagePct || 0) >= 70).length;
    const passingRate = Math.round((passingCount / students.length) * 100);

    return {
      classAvg,
      topPerformer,
      passingRate,
      totalDeliverables: assignments.length + quizzes.length
    };
  }, [students, assignments, quizzes]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    let result = students.filter(s => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);

      const pct = s.averagePct || 0;
      let matchesGrade = true;
      if (gradeFilter === 'A') matchesGrade = pct >= 90;
      else if (gradeFilter === 'B') matchesGrade = pct >= 80 && pct < 90;
      else if (gradeFilter === 'C') matchesGrade = pct >= 70 && pct < 80;
      else if (gradeFilter === 'failing') matchesGrade = pct < 70;

      return matchesSearch && matchesGrade;
    });

    result.sort((a, b) => {
      if (sortBy === 'avg-desc') return (b.averagePct || 0) - (a.averagePct || 0);
      if (sortBy === 'avg-asc') return (a.averagePct || 0) - (b.averagePct || 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [students, search, gradeFilter, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          PAGE HEADER
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Academic Ledger
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              • Evaluation Matrix & Composite Grades
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-2 tracking-tight">
            Gradebook & Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Cross-tabulated view of student scores across assignments, quizzes, and composite term weighted averages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={students.length === 0}
            className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE KPI TILES
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class Average</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{gradebookMetrics.classAvg}%</span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">
              Grade: {getLetterGrade(gradebookMetrics.classAvg).letter}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Performer</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <span className="font-heading font-bold text-base text-slate-900 truncate block">
              {gradebookMetrics.topPerformer ? gradebookMetrics.topPerformer.name : '—'}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium font-mono">
              {gradebookMetrics.topPerformer ? `${gradebookMetrics.topPerformer.averagePct}% Highest Score` : 'No data'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Passing Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{gradebookMetrics.passingRate}%</span>
            <span className="text-[10px] text-emerald-600 font-medium">≥ 70% passing</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Graded Tasks</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{gradebookMetrics.totalDeliverables}</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {assignments.length} Projects, {quizzes.length} Quizzes
            </span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          CONTROLS TOOLBAR (COURSE, SEARCH, GRADE FILTER, SORT)
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Course Dropdown */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-500">Course:</span>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.course_code ? `${c.course_code} - ${c.title}` : c.title}</option>
            ))}
          </select>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search scholar by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          {/* Grade Tier Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Tier:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Tiers</option>
              <option value="A">Grade A (90%+)</option>
              <option value="B">Grade B (80-89%)</option>
              <option value="C">Grade C (70-79%)</option>
              <option value="failing">Below Passing (&lt;70%)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="avg-desc">Highest Average</option>
              <option value="avg-asc">Lowest Average</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* =========================================================================
          GRADEBOOK MATRIX TABLE OR CARDS
      ========================================================================= */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Calculating cross-tabulated grade ledger...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No student grade records found</p>
          <p className="text-xs text-slate-400 mt-1">Enroll students and publish graded assignments to populate the ledger.</p>
        </div>
      ) : viewMode === 'table' ? (
        
        /* ==================== 1. SPREADSHEET MATRIX TABLE ==================== */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6 sticky left-0 bg-slate-50/95 z-10 shadow-2xs">
                    Student Scholar
                  </th>
                  <th className="py-3.5 px-4 text-center">Composite Score</th>
                  
                  {/* Assignment Columns */}
                  {assignments.map(a => (
                    <th key={a.id} className="py-3.5 px-4 text-center min-w-[120px]">
                      <span className="block truncate max-w-[140px]" title={a.title}>{a.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">Max: {a.max_score} pts</span>
                    </th>
                  ))}

                  {/* Quiz Columns */}
                  {quizzes.map(q => (
                    <th key={q.id} className="py-3.5 px-4 text-center min-w-[120px]">
                      <span className="block truncate max-w-[140px]" title={q.title}>{q.title}</span>
                      <span className="text-[10px] text-indigo-500 font-mono font-normal">Quiz</span>
                    </th>
                  ))}

                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s) => {
                  const gradeInfo = getLetterGrade(s.averagePct);

                  return (
                    <tr 
                      key={s.id} 
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => setInspectStudent(s)}
                    >
                      {/* Sticky Scholar Column */}
                      <td className="py-3 px-4 sm:px-6 sticky left-0 bg-white group-hover:bg-[#F8FAFC] transition-colors z-10 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <img 
                            src={s.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                            alt="" 
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-heading font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {s.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Composite Grade Badge */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border font-mono ${gradeInfo.color}`}>
                            {gradeInfo.letter}
                          </span>
                          <span className="font-mono font-bold text-xs text-slate-800">
                            {s.averagePct}%
                          </span>
                        </div>
                      </td>

                      {/* Assignment Scores */}
                      {assignments.map(a => {
                        const grade = s.assignmentGrades?.find(g => g.assignment_id === a.id);
                        return (
                          <td key={a.id} className="py-3 px-4 text-center font-mono">
                            {grade?.score !== undefined ? (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                                {grade.score}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-normal text-xs">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Quiz Scores */}
                      {quizzes.map(q => {
                        const qScore = s.quizScores?.find(qs => qs.quiz_id === q.id);
                        return (
                          <td key={q.id} className="py-3 px-4 text-center font-mono">
                            {qScore?.highest_score !== null && qScore?.highest_score !== undefined ? (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                                {qScore.highest_score}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-normal text-xs">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Action */}
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectStudent(s);
                          }}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        
        /* ==================== 2. CARDS VIEW ==================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((s) => {
            const gradeInfo = getLetterGrade(s.averagePct);

            return (
              <div 
                key={s.id}
                onClick={() => setInspectStudent(s)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
              >
                <div className="space-y-4">
                  
                  {/* Top Row: Avatar & Grade */}
                  <div className="flex items-start justify-between gap-3">
                    <img 
                      src={s.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border font-mono ${gradeInfo.color}`}>
                        Grade {gradeInfo.letter}
                      </span>
                      <span className="block font-heading font-bold text-lg text-slate-900 mt-1">
                        {s.averagePct}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono truncate">{s.email}</p>
                  </div>

                  {/* Summary Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        s.averagePct >= 80 ? 'bg-emerald-500' : s.averagePct >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(s.averagePct, 100)}%` }}
                    />
                  </div>

                  {/* Task counts */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{s.assignmentGrades?.length || 0} Graded Projects</span>
                    <span>{s.quizScores?.filter(q => q.highest_score !== null).length || 0} Quizzes Passed</span>
                  </div>

                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Student Breakdown</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

      )}

      {/* =========================================================================
          INTERACTIVE STUDENT GRADE INSPECTION MODAL
      ========================================================================= */}
      {inspectStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Scholar Grade Ledger
                  </h3>
                  <p className="text-[11px] text-slate-400">Detailed performance assessment</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectStudent(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              
              {/* Profile Card */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={inspectStudent.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                  />
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                      {inspectStudent.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono truncate">{inspectStudent.email}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border font-mono ${getLetterGrade(inspectStudent.averagePct).color}`}>
                    Grade {getLetterGrade(inspectStudent.averagePct).letter}
                  </span>
                  <span className="block font-heading font-bold text-lg text-slate-900 mt-1">
                    {inspectStudent.averagePct}%
                  </span>
                </div>
              </div>

              {/* Assignment Grades */}
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Assignment Submissions & Feedback
                </h4>

                <div className="space-y-2">
                  {assignments.map(a => {
                    const grade = inspectStudent.assignmentGrades?.find(g => g.assignment_id === a.id);
                    return (
                      <div key={a.id} className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{a.title}</span>
                          <span className="font-mono font-bold text-blue-600">
                            {grade?.score !== undefined ? `${grade.score} / ${a.max_score}` : 'Not Graded'}
                          </span>
                        </div>
                        {grade?.student_feedback && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                            "{grade.student_feedback}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Grades */}
              {quizzes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    Quiz Evaluations
                  </h4>

                  <div className="space-y-2">
                    {quizzes.map(q => {
                      const qScore = inspectStudent.quizScores?.find(qs => qs.quiz_id === q.id);
                      return (
                        <div key={q.id} className="p-3 bg-white border border-slate-200/70 rounded-xl flex items-center justify-between">
                          <span className="font-bold text-slate-800">{q.title}</span>
                          <span className="font-mono font-bold text-indigo-600">
                            {qScore?.highest_score !== null && qScore?.highest_score !== undefined
                              ? `${qScore.highest_score} pts`
                              : 'No Attempt'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`mailto:${inspectStudent.email}?subject=Academic Performance Feedback`}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Feedback</span>
              </a>

              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close Ledger
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
