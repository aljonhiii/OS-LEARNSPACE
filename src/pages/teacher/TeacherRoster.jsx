import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, BookOpen, CheckCircle, Mail, GraduationCap, X, Award } from 'lucide-react';

export default function TeacherRoster() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadData = async () => {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEnrollments = enrollments.filter(e => {
    const matchesCourse = selectedCourse === 'all' || String(e.course_id) === String(selectedCourse);
    const fullName = `${e.student_first_name || ''} ${e.student_last_name || ''}`.toLowerCase();
    const email = (e.student_email || '').toLowerCase();
    const query = search.toLowerCase();
    return matchesCourse && (fullName.includes(query) || email.includes(query));
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Academic Cohorts
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Student Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track student enrollment statuses, course participation, and academic performance.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-medium self-start sm:self-auto">
          Total Enrolled Cohort: <span className="font-bold text-slate-800">{enrollments.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search student by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Course:</span>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Assigned Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading enrolled students...
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No enrolled students found</p>
            <p className="text-xs text-slate-400 mt-1">Students enrolled in your courses will be listed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={enr.student_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {enr.student_first_name} {enr.student_last_name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {enr.student_email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {enr.course_title}
                      </span>
                      <span className="text-[10px] text-blue-600 font-mono block">
                        {enr.course_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(enr.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {enr.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(enr)}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                      >
                        Inspect Progress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Progress Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Student Academic Record</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img 
                src={selectedStudent.student_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                alt="" 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
              />
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900">
                  {selectedStudent.student_first_name} {selectedStudent.student_last_name}
                </h4>
                <p className="text-xs text-slate-400 font-mono">{selectedStudent.student_email}</p>
                <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  {selectedStudent.course_title}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Course Completion</span>
                  <span className="text-blue-600">75%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Enrollment Date</span>
                <span className="font-mono text-slate-800">{new Date(selectedStudent.enrolled_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-600 font-semibold uppercase">{selectedStudent.status}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Verified Lessons Finished</span>
                <span className="font-bold text-slate-800">4 / 6 Lessons</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl transition-colors cursor-pointer text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}