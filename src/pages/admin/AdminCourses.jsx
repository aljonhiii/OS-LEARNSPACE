import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Search, CheckCircle, Archive, Trash2, Edit } from 'lucide-react';

export default function AdminCourses({ setActivePage }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const [cRes, catRes] = await Promise.all([
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/categories', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (cRes.ok && catRes.ok) {
        const cData = await cRes.json();
        const catData = await catRes.json();
        setCourses(cData);
        setCategories(catData);
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

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Course title is required');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          course_code: code || `CRS-${Date.now().toString().slice(-4)}`,
          category_id: parseInt(categoryId),
          short_description: description.slice(0, 150),
          description,
          cover_image: coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
          status: 'published'
        })
      });
      if (res.ok) {
        alert('Course created successfully!');
        setCreateModal(false);
        setTitle('');
        setCode('');
        setDescription('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (course) => {
    const nextStatus = course.status === 'published' ? 'unpublished' : 'published';
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveCourse = async (courseId) => {
    if (!confirm('Are you sure you want to archive this course?')) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.course_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Curriculum Administration
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Course Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, publish, edit, and organize courses across categories.
          </p>
        </div>

        <button 
          onClick={() => setCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Course</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Course</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Lead Teacher</th>
                <th className="py-3 px-3">Enrolled</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-3">
                    <img src={c.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">{c.title}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{c.course_code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{c.category_name}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.teacher_name || 'Unassigned'}</td>
                  <td className="py-3 px-3 font-semibold text-blue-600">{c.enrolled_count || 0} students</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'published' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => handleTogglePublish(c)}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {c.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleArchiveCourse(c.id)}
                      className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-heading font-bold text-slate-800 text-base mb-1">
              Create New Course
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new course curriculum to the institutional catalog.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Course Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure with Docker"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Course Code</label>
                  <input 
                    type="text" 
                    value={code} 
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. OPS-401"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide an overview of the curriculum and learning objectives..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cover Image URL</label>
                <input 
                  type="url" 
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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
                  {submitting ? 'Saving...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
