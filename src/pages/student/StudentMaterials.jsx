import React, { useState, useEffect } from 'react';
import { FolderGit2, Download, FileText, Video, Link as LinkIcon, Search, BookOpen } from 'lucide-react';

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const [matRes, cRes] = await Promise.all([
          fetch('/api/materials', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (matRes.ok) setMaterials(await matRes.json());
        if (cRes.ok) setCourses(await cRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = materials.filter(m => {
    const matchesCourse = !selectedCourse || String(m.course_id) === String(selectedCourse);
    const matchesQuery = m.title.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesQuery;
  });

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return <Video className="w-5 h-5 text-indigo-500" />;
      case 'link': return <LinkIcon className="w-5 h-5 text-emerald-500" />;
      default: return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Course Repository
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Learning Materials & Resources
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download lecture notes, architectural templates, datasets, and reading references.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {filtered.length} Resources available
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search resources by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600">Course:</span>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading learning materials...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No learning materials found</p>
          <p className="text-xs text-slate-400 mt-1">Resources uploaded by your instructors will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    {getFileIcon(m.file_type)}
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {m.file_type || 'PDF'}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.description || 'Reference guide for curriculum modules.'}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700 block truncate">{m.course_title}</span>
                  <span className="block mt-0.5">Uploaded by {m.uploader_name || 'Faculty Instructor'}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <a
                  href={m.external_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Open Asset</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}