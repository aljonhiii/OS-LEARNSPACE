import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BookOpen, Plus, Clock, Trash2, CheckCircle, 
  X, ExternalLink, Layers, Sparkles, Eye, Edit3, CheckCircle2
} from 'lucide-react';

// Rapid Authoring Lesson Templates
const LESSON_PRESETS = [
  {
    id: 'design-tokens',
    badge: 'Design System',
    title: 'Design Token Specifications & Accessible Color Hierarchies',
    estimatedMinutes: 30,
    description: 'Implementing semantic design tokens, modular spacing scales, and accessible contrast in enterprise web apps.',
    content: `### 1. Conceptual Foundation
Design tokens represent the foundational design decisions of an interface. Instead of hardcoding hex values or pixel margins throughout components, tokens assign semantic meaning to design decisions.

### 2. Semantic Token Architecture
- **Global Tokens**: Raw values such as \`#0D9488\` or \`16px\`.
- **Alias Tokens**: Purpose-mapped values such as \`color.brand.primary\`.
- **Component Tokens**: Specific application such as \`button.primary.background\`.

### 3. Key Instructional Takeaways
Always verify that your brand contrast meets WCAG 2.1 AA (minimum 4.5:1 ratio) before locking tokens in code. Ensure spacing follows an 8pt modular rhythm.`
  },
  {
    id: 'express-api',
    badge: 'Full-Stack API',
    title: 'Express REST Router Lifecycle & Centralized Error Middleware',
    estimatedMinutes: 45,
    description: 'Mastering HTTP routing chains, input sanitization, and structured JSON error responses.',
    content: `### 1. Route Handlers & Chaining
Express organizes endpoints through modular routers. Every route can attach authentication guards, validation chains, and error handling.

### 2. Production Best Practices
- Separate business logic into dedicated controller modules.
- Centralize error handling in an error middleware with \`(err, req, res, next)\` signature.
- Always return structured JSON errors with consistent keys (\`{ error: "message" }\`).`
  },
  {
    id: 'mariadb-pool',
    badge: 'Database Architecture',
    title: 'MariaDB Connection Pooling & Parameterized Query Security',
    estimatedMinutes: 40,
    description: 'Configuring MySQL2 connection pools, managing transaction lifecycles, and eliminating SQL injection vulnerabilities.',
    content: `### 1. Connection Pool Dynamics
Direct database connections incur high latency per request. Connection pooling maintains a persistent queue of active sockets ready for reuse.

### 2. SQL Injection Prevention
Never concatenate user input directly into SQL strings. Always use parameterized placeholders \`?\` to let the database engine sanitize values automatically.`
  },
  {
    id: 'react-lifecycle',
    badge: 'Frontend Core',
    title: 'React 19 State Synchronization & Effect Cleanup Patterns',
    estimatedMinutes: 25,
    description: 'Understanding modern React rendering lifecycle, avoiding cascading renders, and optimizing component re-evaluation.',
    content: `### 1. Render Triggers
In React 19, effects synchronize components with external systems. Calling setState synchronously inside effects can trigger cascading re-renders.

### 2. Optimization Tips
- Use derived state with \`useMemo\` instead of state sync.
- Always return cleanup functions from \`useEffect\` when subscribing to external events.`
  }
];

const DURATION_PRESETS = [15, 20, 30, 45, 60, 90];

export default function TeacherLessons({ onOpenLesson }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [loading, setLoading] = useState(true);

  // Derive active lessons from selected module (eliminates cascading render)
  const lessons = useMemo(() => {
    if (!selectedModuleId || modules.length === 0) return [];
    const found = modules.find(m => String(m.id) === String(selectedModuleId));
    return found?.lessons || [];
  }, [modules, selectedModuleId]);

  // New Lesson Studio Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('builder'); // 'builder' | 'preview'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Load Courses
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok && isMounted) {
          const data = await res.json();
          setCourses(data);
          if (data.length > 0) setSelectedCourseId(String(data[0].id));
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCourses();
    return () => { isMounted = false; };
  }, []);

  // Reload Course and Modules
  const reloadCourseData = useCallback(async (courseId) => {
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
      }
    } catch (err) {
      console.error('Failed to reload course details:', err);
    }
  }, []);

  // Fetch Course and Modules when selected course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    let isMounted = true;
    async function fetchCourseModules() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch(`/api/courses/${selectedCourseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          const mods = data.modules || [];
          setModules(mods);
          if (mods.length > 0) {
            setSelectedModuleId(String(mods[0].id));
          } else {
            setSelectedModuleId('');
          }
        }
      } catch (err) {
        console.error('Failed to fetch course details:', err);
      }
    }
    fetchCourseModules();
    return () => { isMounted = false; };
  }, [selectedCourseId]);

  // Apply Template Preset
  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setEstimatedMinutes(preset.estimatedMinutes);
    setDescription(preset.description);
    setContent(preset.content);
  };

  // Append formatting helpers
  const handleAppendContent = (snippet) => {
    setContent(prev => prev ? `${prev}\n\n${snippet}` : snippet);
  };

  // Create Lesson Handler
  const handleCreateLesson = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !selectedModuleId) {
      alert('Module and Lesson Title are required.');
      return;
    }

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
          title: title.trim(),
          description: description.trim() || 'Comprehensive lesson overview and reference curriculum.',
          content: content.trim() || `# ${title}\n\nDetailed curriculum content and learning references.`,
          estimated_minutes: parseInt(estimatedMinutes, 10) || 30
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Curriculum lesson published successfully!' });
        setTimeout(() => setMessage(null), 3500);
        setModalOpen(false);
        setTitle('');
        setDescription('');
        setContent('');
        setEstimatedMinutes(30);
        setModalTab('builder');
        reloadCourseData(selectedCourseId);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to create lesson');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while creating lesson');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!confirm(`Are you sure you want to delete lesson "${lessonTitle}"?`)) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/courses/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Lesson removed from module curriculum.' });
        setTimeout(() => setMessage(null), 3000);
        reloadCourseData(selectedCourseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Current Course and Module Objects for Student Preview
  const currentCourse = useMemo(() => {
    return courses.find(c => String(c.id) === String(selectedCourseId)) || courses[0];
  }, [courses, selectedCourseId]);

  const currentModule = useMemo(() => {
    return modules.find(m => String(m.id) === String(selectedModuleId)) || modules[0];
  }, [modules, selectedModuleId]);

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          PAGE HEADER
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Curriculum Authoring
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              • Modules & Structured Lessons
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-2 tracking-tight">
            Lesson Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Write structured instructional content, define estimated study durations, and preview student reading experiences.
          </p>
        </div>

        <button 
          onClick={() => {
            setModalTab('builder');
            setModalOpen(true);
          }}
          disabled={modules.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Lesson</span>
        </button>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Course & Module Selectors */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Course:</span>
            <select 
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code ? `${c.course_code} - ${c.title}` : c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Module:</span>
            <select 
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              disabled={modules.length === 0}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {modules.length === 0 ? (
                <option value="">No modules found in course</option>
              ) : (
                modules.map((m, idx) => (
                  <option key={m.id} value={m.id}>
                    Module {idx + 1}: {m.title}
                  </option>
                ))
              )}
            </select>
          </div>

        </div>

        <div className="text-xs font-semibold text-slate-500">
          Lessons in Module: <span className="font-bold text-blue-600">{lessons.length}</span>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading module curriculum...
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No lessons authored in this module</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Lesson" above to write lessons, embed code, and configure reading durations.</p>
          </div>
        ) : (
          lessons.map((les, idx) => (
            <div 
              key={les.id} 
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-slate-200 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {les.title}
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                      Published
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{les.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{les.estimated_minutes || 30} mins</span>
                </div>

                {onOpenLesson && (
                  <button 
                    onClick={() => onOpenLesson(les.id)}
                    className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Read Lesson</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button 
                  onClick={() => handleDeleteLesson(les.id, les.title)}
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

      {/* =========================================================================
          INTERACTIVE "NEW LESSON" CURRICULUM STUDIO MODAL
      ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 leading-tight">
                    Curriculum Lesson Studio
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Author lessons, configure estimated study time, and preview the student reader
                  </p>
                </div>
              </div>

              {/* Dual-Mode Switcher */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setModalTab('builder')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      modalTab === 'builder' 
                        ? 'bg-white text-blue-600 shadow-xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Builder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      modalTab === 'preview' 
                        ? 'bg-white text-blue-600 shadow-xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Student Reader</span>
                  </button>
                </div>

                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {modalTab === 'builder' ? (
                /* ================= BUILDER FORM ================= */
                <form id="lesson-builder-form" onSubmit={handleCreateLesson} className="space-y-6 text-xs">
                  
                  {/* Preset Template Chips */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Curriculum Lesson Presets
                      </span>
                      <span className="text-[10px] text-slate-400">Click to autofill structure and reading content</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LESSON_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyPreset(p)}
                          className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all cursor-pointer"
                        >
                          <span className="font-bold text-[11px] text-slate-800 block truncate">
                            {p.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {p.estimatedMinutes} mins study
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Module & Title */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Target Module *
                        </label>
                        <select
                          value={selectedModuleId}
                          onChange={e => setSelectedModuleId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
                        >
                          {modules.map((m, i) => (
                            <option key={m.id} value={m.id}>{i + 1}. {m.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Lesson Title *
                        </label>
                        <input 
                          type="text" 
                          required 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          placeholder="e.g. Design Token Specifications in Code"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-semibold text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estimated Duration Shortcuts */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-700">Estimated Reading Duration</span>
                      <span className="font-mono font-bold text-blue-600 text-xs">{estimatedMinutes} minutes</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {DURATION_PRESETS.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setEstimatedMinutes(mins)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                            parseInt(estimatedMinutes, 10) === mins
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[11px] text-slate-400">Custom:</span>
                        <input 
                          type="number"
                          min={5}
                          max={240}
                          value={estimatedMinutes}
                          onChange={(e) => setEstimatedMinutes(e.target.value)}
                          className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Curriculum Summary / Objectives
                    </label>
                    <input 
                      type="text" 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      placeholder="Brief overview of what students will master in this lesson"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-xs" 
                    />
                  </div>

                  {/* Content & Snippet Helpers */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-700">
                          Lesson Body (Markdown Supported)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Supports headers, bullet lists, bold text, and code blocks
                        </span>
                      </div>

                      {/* Helper Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAppendContent("### Key Instructional Takeaways\n- Master semantic token definitions\n- Verify WCAG 2.1 AA accessibility ratios\n- Organize modular component files")}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          + Takeaways Box
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppendContent("```javascript\n// Component Definition\nexport const Button = ({ variant = 'primary', children }) => {\n  return <button className={`btn-${variant}`}>{children}</button>;\n};\n```")}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          + Code Example
                        </button>
                      </div>
                    </div>

                    <textarea 
                      rows={8} 
                      value={content} 
                      onChange={e => setContent(e.target.value)} 
                      placeholder="# Lesson Title&#10;&#10;Detailed explanation of the architectural concepts..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-[11px] text-slate-800 leading-relaxed" 
                    />
                  </div>

                </form>
              ) : (
                /* ================= LIVE STUDENT LESSON READER PREVIEW ================= */
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* Top Notice */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold">Interactive Student Reader Simulation</span>
                    </div>
                    <span className="text-[11px] text-blue-600">Live preview of LessonViewer layout</span>
                  </div>

                  {/* Rendered Lesson Card Mockup */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                    
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                        <span>{currentCourse?.title || 'Course Title'}</span>
                        <span>•</span>
                        <span className="text-slate-500">{currentModule?.title || 'Module Title'}</span>
                      </div>

                      <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                        {title || 'Untitled Curriculum Lesson'}
                      </h2>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {estimatedMinutes} minutes study
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Curriculum
                        </span>
                      </div>
                    </div>

                    {/* Description Pill */}
                    {description && (
                      <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {description}
                      </p>
                    )}

                    {/* Lesson Content Body */}
                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                      {content || '# Lesson Overview\n\nCurriculum content written in the builder will render here with full typography styling.'}
                    </div>

                    {/* Simulated Student Completion Action */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Students must reach the end of the lesson to mark as completed.
                      </span>

                      <button 
                        type="button" 
                        disabled
                        className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 opacity-90 cursor-default"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Completed</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {modalTab === 'builder' ? (
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Student Reader</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalTab('builder')}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Return to Builder</span>
                  </button>
                )}

                <button 
                  type="button"
                  onClick={() => handleCreateLesson()}
                  disabled={submitting || !title.trim()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? 'Publishing Lesson...' : 'Create & Publish Lesson'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
