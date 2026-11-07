import React, { useState, useEffect } from 'react';
import { BookMarked, Search, Filter, Users, Layers, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentCatalog({ setActivePage, onOpenCourse }) {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMessage('Congratulations! You are officially enrolled in this course.');
        setTimeout(() => setMessage(null), 3500);
        loadCourses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrollingId(null);
    }
  };

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category_name && c.category_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Academic Discovery
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Course Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore industry-crafted design and engineering curriculums, master new skills, and earn certificates.
          </p>
        </div>

        <button 
          onClick={() => setActivePage('student-courses')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>My Enrolled Courses</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search courses or categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {filtered.length} Course{filtered.length === 1 ? '' : 's'} available
        </span>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading course catalog...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <BookMarked className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No courses match your query</p>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img 
                    src={c.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"} 
                    alt={c.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-slate-700">
                    {c.course_code}
                  </div>
                  <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    {c.category_name || 'Curriculum'}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.short_description || c.description || 'Gain industry-level knowledge through guided lessons, real milestones, and practical tests.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <img 
                        src={c.teacher_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                        alt="" 
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span className="font-medium text-slate-700">{c.teacher_name || 'Cameron Williamson'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{c.enrolled_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleEnroll(c.id)}
                  disabled={enrollingId === c.id}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{enrollingId === c.id ? 'Enrolling...' : 'Enroll in Course'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}