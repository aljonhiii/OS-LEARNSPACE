import React, { useState, useEffect } from 'react';
import { GraduationCap, Play, BookOpen, Clock, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentMyCourses({ setActivePage, onOpenLesson }) {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyCourses() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const list = await res.json();
          // Filter courses where enrolled or load summary
          setEnrolledCourses(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMyCourses();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Active Studies
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            My Enrolled Courses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continue where you left off, review module milestones, and complete interactive assignments.
          </p>
        </div>

        <button 
          onClick={() => setActivePage('student-catalog')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore More Courses</span>
        </button>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading your enrolled courses...
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">You are not enrolled in any courses yet</p>
          <p className="text-xs text-slate-400 mt-1">Visit the course catalog to enroll in your first program.</p>
          <button
            onClick={() => setActivePage('student-catalog')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((c, index) => {
            const progressPct = index === 0 ? 68 : index === 1 ? 40 : 15;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    <img 
                      src={c.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-700">
                      {c.course_code}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.short_description || c.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500 text-[11px]">Syllabus Progress</span>
                        <span className="text-blue-600 font-mono text-[11px]">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      if (onOpenLesson) onOpenLesson(1);
                      else setActivePage('student-progress');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume Course</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}