import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, Search, CheckCircle, X, BookOpen } from 'lucide-react';

export default function TeacherModules() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Load Courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
          if (data.length > 0) setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Load Modules for selected course
  const loadModules = async (courseId) => {
    if (!courseId) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadModules(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!title || !selectedCourseId) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${selectedCourseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
      if (res.ok) {
        setMessage('Module created successfully!');
        setTimeout(() => setMessage(null), 3000);
        setModalOpen(false);
        setTitle('');
        setDescription('');
        loadModules(selectedCourseId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage('Module deleted.');
        setTimeout(() => setMessage(null), 3000);
        loadModules(selectedCourseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Syllabus Architecture
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Module Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize course units, define thematic milestones, and sequence lessons.
          </p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Module</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Course Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-600">Select Course:</span>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {modules.length} Module{modules.length === 1 ? '' : 's'} configured
        </span>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading modules...
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No modules found for this course</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Module" to structure your course curriculum.</p>
          </div>
        ) : (
          modules.map((m, index) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-heading font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{m.description || 'No module description provided.'}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      {m.lessons?.length || 0} Lessons
                    </span>
                    <span className="font-mono">Position: #{m.position || index + 1}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDeleteModule(m.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Module"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Module Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Add New Module</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Module Title *</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Design Tokens & Multi-Brand Systems"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                <textarea 
                  rows={3} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Summary of learning goals..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submitting ? 'Creating Module...' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}