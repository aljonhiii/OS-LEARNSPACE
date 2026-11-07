import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle, Clock, BookOpen, Layers, ArrowRight, Play } from 'lucide-react';

export default function StudentProgress({ onOpenLesson }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const loadCourseProgress = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourseData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseProgress(selectedCourseId);
    }
  }, [selectedCourseId]);

  const modules = courseData?.modules || [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedCount = Math.min(totalLessons, 3); // Demo realistic completion
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 60;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Syllabus Tracker
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Learning Progress
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module-by-module completion tracker, completed reading items, and upcoming topics.
          </p>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-600">Select Course:</span>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Summary Card */}
      {courseData && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-mono font-bold uppercase">{courseData.course_code}</span>
              <h2 className="font-heading font-bold text-lg text-slate-900 mt-0.5">{courseData.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{completedCount} of {totalLessons} Lessons Finished</p>
            </div>

            <div className="text-right">
              <span className="font-heading font-bold text-3xl text-blue-600 font-mono">{progressPercent}%</span>
              <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Overall Completion</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Module Breakdown */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading curriculum syllabus...
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No syllabus modules found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((m, mIdx) => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-heading font-bold text-xs">
                    {mIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">{m.title}</h3>
                    <p className="text-[11px] text-slate-500">{m.description || 'Core thematic milestone.'}</p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  {m.lessons?.length || 0} Lessons
                </span>
              </div>

              <div className="p-4 divide-y divide-slate-100">
                {m.lessons?.map((les, lesIdx) => {
                  const isDone = (mIdx === 0 && lesIdx < 2) || (mIdx === 1 && lesIdx === 0);
                  return (
                    <div key={les.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        {isDone ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-4 h-4 fill-emerald-100" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 text-xs font-bold">
                            {lesIdx + 1}
                          </div>
                        )}
                        <div className="truncate">
                          <span className="text-xs font-semibold text-slate-800 block truncate">
                            {les.title}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {les.estimated_minutes} mins estimated
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenLesson && onOpenLesson(les.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          isDone 
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isDone ? 'Review Lesson' : 'Start Lesson'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}