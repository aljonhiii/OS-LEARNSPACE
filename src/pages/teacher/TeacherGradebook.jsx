import React, { useState, useEffect } from 'react';
import { Star, Download, Search, Filter, BookOpen, CheckCircle, Award } from 'lucide-react';

export default function TeacherGradebook() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [gradebookData, setGradebookData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Load Courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const list = await res.json();
          setCourses(list);
          if (list.length > 0) setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCourses();
  }, []);

  // Load Gradebook
  const loadGradebook = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/gradebook?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGradebookData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadGradebook(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleExportCSV = () => {
    if (!gradebookData || !gradebookData.students) return;
    let csv = 'Student Name,Email,Average Percentage,Enrollment Status\n';
    gradebookData.students.forEach(s => {
      csv += `"${s.name}","${s.email}",${s.averagePct}%,"${s.enrollment_status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnspace_gradebook_course_${selectedCourseId}.csv`;
    a.click();
  };

  const students = gradebookData?.students || [];
  const assignments = gradebookData?.assignments || [];
  const quizzes = gradebookData?.quizzes || [];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const getLetterGrade = (pct) => {
    if (pct >= 90) return { label: 'A', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 80) return { label: 'B', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (pct >= 70) return { label: 'C', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (pct >= 60) return { label: 'D', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { label: 'F', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Academic Ledger
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Gradebook & Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-tabulated view of student performance across assignments, quizzes, and composite term averages.
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          disabled={students.length === 0}
          className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-600">Course:</span>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search student..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Gradebook Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Calculating grade ledger...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No student records for this course</p>
            <p className="text-xs text-slate-400 mt-1">Enroll students and assign deliverables to populate grades.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 min-w-[200px]">Student</th>
                  {assignments.map(a => (
                    <th key={a.id} className="py-3 px-3 text-center min-w-[120px]">
                      <span className="block truncate max-w-[110px]" title={a.title}>{a.title}</span>
                      <span className="text-[9px] text-slate-400 font-normal">({a.max_score} pts)</span>
                    </th>
                  ))}
                  {quizzes.map(q => (
                    <th key={q.id} className="py-3 px-3 text-center min-w-[120px]">
                      <span className="block truncate max-w-[110px]" title={q.title}>{q.title}</span>
                      <span className="text-[9px] text-slate-400 font-normal">(Quiz)</span>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center">Avg %</th>
                  <th className="py-3 px-4 text-center">Letter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((s) => {
                  const letter = getLetterGrade(s.averagePct);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={s.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                            alt="" 
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block">{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{s.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assignment Scores */}
                      {assignments.map(a => {
                        const grade = s.assignmentGrades?.find(g => g.assignment_id === a.id);
                        return (
                          <td key={a.id} className="py-3.5 px-3 text-center font-mono">
                            {grade && grade.score !== null ? (
                              <span className="font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md">
                                {grade.score}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Quiz Scores */}
                      {quizzes.map(q => {
                        const quizRec = s.quizScores?.find(qs => qs.quiz_id === q.id);
                        return (
                          <td key={q.id} className="py-3.5 px-3 text-center font-mono">
                            {quizRec && quizRec.highest_score !== null ? (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                                {quizRec.highest_score}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Overall Average */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                        {s.averagePct}%
                      </td>

                      {/* Letter Grade */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${letter.color}`}>
                          {letter.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}