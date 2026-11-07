import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const [eRes, sRes, cRes] = await Promise.all([
        fetch('/api/enrollments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users?role=student', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (eRes.ok && sRes.ok && cRes.ok) {
        const eData = await eRes.json();
        const sData = await sRes.json();
        const cData = await cRes.json();
        setEnrollments(eData);
        setStudents(sData);
        setCourses(cData);
        if (sData.length > 0) setStudentId(sData[0].id);
        if (cData.length > 0) setCourseId(cData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!studentId || !courseId) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ student_id: studentId, course_id: courseId })
      });
      if (res.ok) {
        alert('Student successfully enrolled in course!');
        setCreateModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/enrollments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this enrollment record?')) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/enrollments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = enrollments.filter(e => 
    e.student_name?.toLowerCase().includes(search.toLowerCase()) || 
    e.course_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Enrollment Oversight
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Enrollment Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee active enrollments, manually enroll students, and track progress percentages.
          </p>
        </div>

        <button 
          onClick={() => setCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manual Enrollment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search by student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Student</th>
                <th className="py-3 px-3">Enrolled Course</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Enrolled On</th>
                <th className="py-3 px-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2.5">
                    <img src={e.student_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <span className="font-semibold text-slate-900 block">{e.student_name}</span>
                      <span className="text-[11px] text-slate-400">{e.student_email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 block">{e.course_title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{e.course_code}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${e.progress_pct || 67}%` }}></div>
                      </div>
                      <span className="font-bold text-slate-700 text-[11px]">{e.progress_pct || 67}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      e.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      e.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {new Date(e.enrolled_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {e.status === 'active' ? (
                      <button 
                        onClick={() => handleStatusChange(e.id, 'completed')}
                        className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        Complete
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusChange(e.id, 'active')}
                        className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
                      >
                        Activate
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemove(e.id)}
                      className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {createModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-heading font-bold text-slate-800 text-base mb-1">
              Enroll Student
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select a student and course to assign enrollment.
            </p>

            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Student</label>
                <select 
                  value={studentId} 
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Course</label>
                <select 
                  value={courseId} 
                  onChange={e => setCourseId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.course_code} — {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
