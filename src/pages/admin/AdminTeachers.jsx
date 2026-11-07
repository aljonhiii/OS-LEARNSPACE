import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Plus, Search, UserCheck } from 'lucide-react';

export default function AdminTeachers({ setActivePage }) {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const [tRes, cRes] = await Promise.all([
        fetch('/api/users?role=teacher', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (tRes.ok && cRes.ok) {
        const tData = await tRes.json();
        const cData = await cRes.json();
        setTeachers(tData);
        setCourses(cData);
        if (cData.length > 0) setSelectedCourseId(cData[0].id);
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

  const handleAssignTeacher = async () => {
    if (!assignModal || !selectedCourseId) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${selectedCourseId}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teacher_id: assignModal.id })
      });
      if (res.ok) {
        alert(`Successfully assigned ${assignModal.first_name} to course!`);
        setAssignModal(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
            Faculty Directory
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Teacher & Faculty Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage instructors, course assignments, and curriculum teaching permissions.
          </p>
        </div>

        <button 
          onClick={() => setActivePage('admin-users')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={t.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                  alt="" 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-50"
                />
                <div>
                  <h3 className="font-heading font-bold text-slate-800 text-sm">
                    {t.first_name} {t.last_name}
                  </h3>
                  <p className="text-[11px] text-slate-400">{t.email}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Title:</span>
                  <span className="font-semibold text-slate-700">{t.headline || "Senior Instructor"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-600">{t.location || "Online"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setAssignModal(t)}
              className="w-full bg-slate-50 hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-200 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Assign to Course</span>
            </button>
          </div>
        ))}
      </div>

      {/* Assign Teacher Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-heading font-bold text-slate-800 text-base mb-1">
              Assign Course to {assignModal.first_name} {assignModal.last_name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select which course this instructor will manage.
            </p>

            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Course</label>
              <select 
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.course_code} — {c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignTeacher}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
