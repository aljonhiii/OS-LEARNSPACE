import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Clock, Trash2, Search, CheckCircle, X, ExternalLink, Layers } from 'lucide-react';

export default function TeacherLessons({ onOpenLesson }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Lesson Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
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

  // Load Course and Modules
  const loadCourseData = async (courseId) => {
    if (!courseId) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mods = data.modules || [];
        setModules(mods);
        if (mods.length > 0) {
          setSelectedModuleId(mods[0].id);
          setLessons(mods[0].lessons || []);
        } else {
          setSelectedModuleId('');
          setLessons([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseData(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedModuleId && modules.length > 0) {
      const found = modules.find(m => m.id === Number(selectedModuleId));
      if (found) {
        setLessons(found.lessons || []);
      }
    }
  }, [selectedModuleId, modules]);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!title || !selectedModuleId) return alert('Module and Title are required');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/modules/${selectedModuleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          content: content || `# ${title}\n\nComprehensive lesson overview and reference materials.`,
          estimated_minutes: parseInt(estimatedMinutes, 10) || 30
        })
      });
      if (res.ok) {
        setMessage('Lesson created successfully!');
        setTimeout(() => setMessage(null), 3000);
        setModalOpen(false);
        setTitle('');
        setDescription('');
        setContent('');
        loadCourseData(selectedCourseId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage('Lesson removed.');
        setTimeout(() => setMessage(null), 3000);
        loadCourseData(selectedCourseId);
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
            Curriculum Authoring
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Lesson Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Write and publish educational lessons, attach reading materials, and sequence class flow.
          </p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          disabled={modules.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Lesson</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Module:</span>
            <select 
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {modules.map((m, i) => (
                <option key={m.id} value={m.id}>{i + 1}. {m.title}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {lessons.length} Lesson{lessons.length === 1 ? '' : 's'} in selected module
        </span>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading lessons...
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No lessons in this module</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Lesson" above to author your first learning content.</p>
          </div>
        ) : (
          lessons.map((les, idx) => (
            <div key={les.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-heading font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                    {les.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {les.description || 'Interactive lesson unit.'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {les.estimated_minutes} minutes
                    </span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      Published
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onOpenLesson && (
                  <button 
                    onClick={() => onOpenLesson(les.id)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteLesson(les.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Lesson"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Lesson Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Add New Lesson</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lesson Title *</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Design Token Specifications in Code"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Estimated Minutes</label>
                  <input 
                    type="number" 
                    value={estimatedMinutes} 
                    onChange={e => setEstimatedMinutes(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Module</label>
                  <select
                    value={selectedModuleId}
                    onChange={e => setSelectedModuleId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  >
                    {modules.map((m, i) => (
                      <option key={m.id} value={m.id}>{i + 1}. {m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Short Description</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Key summary"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lesson Content (Markdown Supported)</label>
                <textarea 
                  rows={6} 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="# Lesson Topic&#10;&#10;Explain the concepts, steps, and key definitions here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submitting ? 'Saving...' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}