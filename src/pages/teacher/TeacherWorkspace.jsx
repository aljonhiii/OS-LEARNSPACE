import React, { useState, useEffect } from 'react';
import { Layers, BookOpen, FileText, Award, FolderGit2, Users, Plus, CheckCircle, Clock, Trash2, ChevronRight, AlertCircle, X } from 'lucide-react';

export default function TeacherWorkspace({ selectedCourseId, setActivePage, onOpenLesson }) {
  const [courses, setCourses] = useState([]);
  const [currentCourseId, setCurrentCourseId] = useState(selectedCourseId || null);
  const [courseData, setCourseData] = useState(null);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules', 'assignments', 'quizzes', 'materials', 'students'
  const [loading, setLoading] = useState(true);

  // New Module Modal State
  const [moduleModal, setModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [submittingMod, setSubmittingMod] = useState(false);

  // New Lesson Modal State
  const [lessonModal, setLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(30);
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Load Course List
  useEffect(() => {
    async function loadCourses() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const list = await res.json();
          setCourses(list);
          if (!currentCourseId && list.length > 0) {
            setCurrentCourseId(list[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCourses();
  }, []);

  // Load Selected Course Full Data
  const loadCourseDetails = async (id) => {
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
    if (currentCourseId) {
      loadCourseDetails(currentCourseId);
    }
  }, [currentCourseId]);

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle) return;
    setSubmittingMod(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/${currentCourseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newModuleTitle,
          description: newModuleDesc
        })
      });
      if (res.ok) {
        setModuleModal(false);
        setNewModuleTitle('');
        setNewModuleDesc('');
        loadCourseDetails(currentCourseId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMod(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle || !selectedModuleId) return;
    setSubmittingLesson(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/modules/${selectedModuleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newLessonTitle,
          description: newLessonDesc,
          content: newLessonContent || `# ${newLessonTitle}\n\nWelcome to this structured learning unit. Complete the objectives below.`,
          estimated_minutes: parseInt(newLessonDuration, 10) || 30
        })
      });
      if (res.ok) {
        setLessonModal(false);
        setNewLessonTitle('');
        setNewLessonDesc('');
        setNewLessonContent('');
        loadCourseDetails(currentCourseId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module and its lessons?')) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadCourseDetails(currentCourseId);
      }
    } catch (err) {
      console.error(err);
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
        loadCourseDetails(currentCourseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Course Selector and Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Course Studio & Syllabus
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Course Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Construct course structure, write lessons, attach materials, and monitor enrolled cohorts.
          </p>
        </div>

        {/* Course Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-xs font-semibold text-slate-500">Active Course:</label>
          <select 
            value={currentCourseId || ''} 
            onChange={(e) => setCurrentCourseId(Number(e.target.value))}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer max-w-xs"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !courseData ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading curriculum workspace...
        </div>
      ) : (
        <>
          {/* Course Overview Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md">
                {courseData.course_code} • {courseData.category_name}
              </span>
              <h2 className="font-heading font-bold text-2xl text-white">
                {courseData.title}
              </h2>
              <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
                {courseData.short_description || courseData.description}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-xl shrink-0">
              <div className="text-center px-3 border-r border-white/20">
                <span className="block font-heading font-bold text-xl">{courseData.modules?.length || 0}</span>
                <span className="text-[10px] text-blue-200">Modules</span>
              </div>
              <div className="text-center px-3 border-r border-white/20">
                <span className="block font-heading font-bold text-xl">{courseData.assignments?.length || 0}</span>
                <span className="text-[10px] text-blue-200">Assignments</span>
              </div>
              <div className="text-center px-3">
                <span className="block font-heading font-bold text-xl">{courseData.students?.length || 0}</span>
                <span className="text-[10px] text-blue-200">Students</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'modules', label: 'Modules & Lessons', count: courseData.modules?.length, icon: Layers },
              { id: 'assignments', label: 'Assignments', count: courseData.assignments?.length, icon: FileText },
              { id: 'quizzes', label: 'Quizzes', count: courseData.quizzes?.length, icon: Award },
              { id: 'materials', label: 'Materials', count: courseData.materials?.length, icon: FolderGit2 },
              { id: 'students', label: 'Enrolled Roster', count: courseData.students?.length, icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {tab.count || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: MODULES & LESSONS */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-slate-800">Course Syllabus & Curriculum</h3>
                <button
                  onClick={() => setModuleModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
              </div>

              {courseData.modules?.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
                  <p className="text-xs">No modules created for this course yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseData.modules?.map((mod, idx) => (
                    <div key={mod.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-heading font-bold text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                              {mod.title}
                            </h4>
                            {mod.description && (
                              <p className="text-[11px] text-slate-500">{mod.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedModuleId(mod.id);
                              setLessonModal(true);
                            }}
                            className="bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Lesson</span>
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons list inside module */}
                      <div className="p-4 divide-y divide-slate-100">
                        {mod.lessons?.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">No lessons in this module yet.</p>
                        ) : (
                          mod.lessons?.map((les, lesIdx) => (
                            <div key={les.id} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                                <div className="truncate">
                                  <span className="text-xs font-semibold text-slate-800 hover:text-blue-600 cursor-pointer block truncate">
                                    {lesIdx + 1}. {les.title}
                                  </span>
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {les.estimated_minutes} mins
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    if (onOpenLesson) onOpenLesson(les.id);
                                    else setActivePage('teacher-lessons');
                                  }}
                                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                                >
                                  View Lesson
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(les.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-slate-800">Assignments & Project Milestones</h3>
                <button
                  onClick={() => setActivePage('teacher-assignments')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage in Assignment Hub</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                {courseData.assignments?.map(a => (
                  <div key={a.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-xs text-slate-900">{a.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{a.description}</p>
                      <span className="text-[10px] text-indigo-600 font-mono mt-1 block">Max Score: {a.max_score} pts</span>
                    </div>
                    <button
                      onClick={() => setActivePage('teacher-submissions')}
                      className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Review Submissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUIZZES */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-slate-800">Online Assessments & Quizzes</h3>
                <button
                  onClick={() => setActivePage('teacher-quizzes')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Quiz</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                {courseData.quizzes?.map(q => (
                  <div key={q.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-xs text-slate-900">{q.title}</h4>
                      <p className="text-[11px] text-slate-500">Passing score: {q.passing_score}% • Time limit: {q.time_limit_minutes || 20}m</p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MATERIALS */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-slate-800">Downloadable Resources & Files</h3>
                <button
                  onClick={() => setActivePage('teacher-materials')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Material</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                {courseData.materials?.map(m => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-4 h-4 text-blue-500" />
                      <div>
                        <h4 className="font-heading font-bold text-xs text-slate-900">{m.title}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{m.file_type || 'PDF Document'}</span>
                      </div>
                    </div>
                    <a
                      href={m.file_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Open Link
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-slate-800">Enrolled Students ({courseData.students?.length})</h3>
                <button
                  onClick={() => setActivePage('teacher-roster')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Full Roster View →
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                {courseData.students?.map(s => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={s.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <h4 className="font-heading font-bold text-xs text-slate-900">{s.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{s.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {s.status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Module Modal */}
      {moduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Add Course Module</h3>
              <button onClick={() => setModuleModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Module Title *</label>
                <input 
                  type="text" 
                  required 
                  value={newModuleTitle} 
                  onChange={e => setNewModuleTitle(e.target.value)} 
                  placeholder="e.g. Module 3: Advanced Typography & Tokens"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                <textarea 
                  rows={2} 
                  value={newModuleDesc} 
                  onChange={e => setNewModuleDesc(e.target.value)} 
                  placeholder="Overview of module objectives..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModuleModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingMod} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submittingMod ? 'Creating...' : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {lessonModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Add Lesson to Module</h3>
              <button onClick={() => setLessonModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lesson Title *</label>
                <input 
                  type="text" 
                  required 
                  value={newLessonTitle} 
                  onChange={e => setNewLessonTitle(e.target.value)} 
                  placeholder="e.g. Setting up Design Tokens in Figma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Estimated Minutes</label>
                  <input 
                    type="number" 
                    value={newLessonDuration} 
                    onChange={e => setNewLessonDuration(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Short Description</label>
                  <input 
                    type="text" 
                    value={newLessonDesc} 
                    onChange={e => setNewLessonDesc(e.target.value)} 
                    placeholder="Key takeaway"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lesson Content (Markdown / Guide)</label>
                <textarea 
                  rows={5} 
                  value={newLessonContent} 
                  onChange={e => setNewLessonContent(e.target.value)} 
                  placeholder="Write lesson text, code snippets, or instructions here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setLessonModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingLesson} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submittingLesson ? 'Saving...' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}