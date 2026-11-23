import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, Plus, Trash2, Calendar, Award, CheckCircle, Clock, 
  ExternalLink, X, Sparkles, Eye, Edit3, 
  CheckSquare, Upload, BookOpen, Zap
} from 'lucide-react';
import { formatPhDate } from '../../utils/dateUtils';

// Interactive Templates for Rapid Assignment Authoring
const ASSIGNMENT_PRESETS = [
  {
    id: 'design-system',
    badge: 'Design System',
    icon: Sparkles,
    color: 'border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100',
    title: 'Milestone 2: Design Token JSON & Component Architecture',
    maxScore: 100,
    daysOffset: 7,
    instructions: `### Assignment Overview
Construct a comprehensive design system token file and component specification that fulfills WCAG 2.1 AA accessibility contrast requirements.

### Deliverables Required:
1. **Design Tokens JSON file** specifying colors, typography scales, spacing, and border radii.
2. **Interactive Component Showcase** (Figma link or GitHub repository URL).
3. **Audit Summary** confirming accessible contrast ratios for primary and secondary states.

### Evaluation Criteria:
- **Token Completeness (35%)**: Covers brand colors, neutral palettes, and modular typography scales.
- **Accessibility & Contrast (35%)**: Guarantees 4.5:1 text contrast and 3:1 graphical object contrast.
- **Documentation & Precision (30%)**: Clean naming conventions and clear component state variants.`
  },
  {
    id: 'api-backend',
    badge: 'Backend Lab',
    icon: Zap,
    color: 'border-teal-200 bg-teal-50/70 text-teal-700 hover:bg-teal-100',
    title: 'Lab 4: RESTful API Routes & Relational MariaDB Integration',
    maxScore: 100,
    daysOffset: 5,
    instructions: `### Lab Objectives
Implement secure Express.js API routes integrated with the MariaDB database pool using parameterized SQL queries.

### Required Deliverables:
- GitHub repository link or source archive containing your Express router files.
- Exported Postman/curl test collection demonstrating authentication and error handling.

### Grading Weights:
- Connection pooling and resource cleanup: 30 pts
- Parameterized SQL security (Zero SQL injection): 40 pts
- Proper HTTP response status codes: 30 pts`
  },
  {
    id: 'case-study',
    badge: 'Research Paper',
    icon: BookOpen,
    color: 'border-purple-200 bg-purple-50/70 text-purple-700 hover:bg-purple-100',
    title: 'Architectural Analysis: Microservices vs. Modular Monolith in LMS',
    maxScore: 50,
    daysOffset: 10,
    instructions: `### Research Paper Scope
Analyze the trade-offs of deploying an institutional Learning Management System as a Modular Monolith versus distributed microservices.

### Submission Guidelines:
- Document Format: PDF deliverable (3 to 5 pages, double-spaced).
- Citations: IEEE or APA citation style.
- Include architectural diagram comparing database topologies.`
  },
  {
    id: 'quick-homework',
    badge: 'Weekly Homework',
    icon: CheckSquare,
    color: 'border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100',
    title: 'Homework 3: Component Lifecycle & State Management Exercises',
    maxScore: 25,
    daysOffset: 3,
    instructions: `Complete the practical exercises covering React 19 hooks and state synchronization. Submit a live codesandbox or GitHub repository link.`
  }
];

// Quick Score Preset Options
const SCORE_PRESETS = [25, 50, 75, 100, 150, 200];

export default function TeacherAssignments({ setActivePage, setSelectedAssignmentId }) {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal View Mode: 'builder' | 'preview'
  const [modalTab, setModalTab] = useState('builder');

  // Form State
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [allowLate, setAllowLate] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Helper: Set due date by offset days from today
  const setDueDateOffset = useCallback((days) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Reload Data Function for after create/delete
  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const [assignRes, coursesRes] = await Promise.all([
        fetch('/api/assignments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (assignRes.ok) {
        const data = await assignRes.json();
        setAssignments(data);
      }
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData);
      }
    } catch (err) {
      console.error('Failed to reload assignments data:', err);
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const [assignRes, coursesRes] = await Promise.all([
          fetch('/api/assignments', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!isMounted) return;

        if (assignRes.ok) {
          const data = await assignRes.json();
          setAssignments(data);
        }
        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          setCourses(cData);
          if (cData.length > 0) {
            setTargetCourseId(prev => prev || cData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load assignments data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, []);

  // Load a preset template
  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setMaxScore(preset.maxScore);
    setInstructions(preset.instructions);
    setDueDateOffset(preset.daysOffset);
  };

  // Quick text helpers to append to instructions
  const handleAppendInstruction = (snippet) => {
    setInstructions(prev => prev ? `${prev}\n\n${snippet}` : snippet);
  };

  // Submit Handler
  const handleCreateAssignment = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !targetCourseId) {
      alert('Course and assignment title are required.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: targetCourseId,
          title: title.trim(),
          instructions: instructions.trim(),
          max_score: parseInt(maxScore, 10) || 100,
          due_at: dueDate || null,
          allow_late: allowLate
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Assignment milestone created and published!' });
        setTimeout(() => setMessage(null), 3500);
        setModalOpen(false);
        setTitle('');
        setInstructions('');
        setMaxScore(100);
        setDueDate('');
        setModalTab('builder');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create assignment');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while creating assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id, assignTitle) => {
    if (!confirm(`Are you sure you want to delete assignment "${assignTitle}"?`)) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Assignment deleted from curriculum.' });
        setTimeout(() => setMessage(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Assignments
  const filtered = useMemo(() => {
    return assignments.filter(a => 
      !selectedCourse || String(a.course_id) === String(selectedCourse)
    );
  }, [assignments, selectedCourse]);

  // Selected Course details for live preview
  const currentSelectedCourseObj = useMemo(() => {
    return courses.find(c => String(c.id) === String(targetCourseId)) || courses[0];
  }, [courses, targetCourseId]);

  // Dynamic Score Weight Label
  const scoreWeightBadge = useMemo(() => {
    const num = parseInt(maxScore, 10) || 0;
    if (num <= 30) return { label: 'Quick Exercise', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (num <= 80) return { label: 'Standard Assignment', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (num <= 120) return { label: 'Major Milestone', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { label: 'Capstone Project', color: 'bg-purple-50 text-purple-700 border-purple-200' };
  }, [maxScore]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Assessment & Projects
          </span>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-2 tracking-tight">
            Assignment Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Configure project milestones, set rubrics and point limits, and monitor student submission progress.
          </p>
        </div>

        <button 
          onClick={() => {
            if (courses.length > 0 && !targetCourseId) {
              setTargetCourseId(courses[0].id);
            }
            if (!dueDate) setDueDateOffset(7); // Default 1 week ahead
            setModalTab('builder');
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
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

      {/* Course Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-semibold text-slate-600">
          Showing <span className="text-blue-600 font-bold">{filtered.length}</span> assignments
          {selectedCourse && ' in selected course'}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Filter by Course:</span>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.course_code ? `${c.course_code} - ${c.title}` : c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading assignments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No assignments created yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "New Assignment" to add homework, projects, or lab tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-mono uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {a.course_code || 'COURSE'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{a.max_score} pts</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-1">{a.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.instructions || 'Review module guidelines and submit deliverables before the deadline.'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {formatPhDate(a.due_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Graded: {a.graded_count || 0}/{a.total_submissions || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 mt-4">
                <button
                  onClick={() => {
                    if (setSelectedAssignmentId) setSelectedAssignmentId(a.id);
                    setActivePage('teacher-submissions');
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Review Submissions ({a.total_submissions || 0})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(a.id, a.title)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE "CREATE NEW ASSIGNMENT" STUDIO MODAL
      ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 leading-tight">
                    Assignment Studio
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Author project milestones, configure grading weights, and preview student experience
                  </p>
                </div>
              </div>

              {/* Mode Switcher & Close */}
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
                    <span>Student Preview</span>
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

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {modalTab === 'builder' ? (
                /* ================= BUILDER VIEW ================= */
                <form id="assignment-form" onSubmit={handleCreateAssignment} className="space-y-6 text-xs">
                  
                  {/* Preset Template Chips */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Quick Template Presets
                      </span>
                      <span className="text-[10px] text-slate-400">Click to autofill structured rubric</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ASSIGNMENT_PRESETS.map((p) => {
                        const Icon = p.icon;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleApplyPreset(p)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${p.color}`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-[11px] mb-1">
                              <Icon className="w-3.5 h-3.5" />
                              <span className="truncate">{p.badge}</span>
                            </div>
                            <span className="text-[10px] block opacity-80 font-mono">
                              {p.maxScore} pts • +{p.daysOffset}d
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 1: Target Course & Title */}
                  <div className="space-y-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Target Course *
                        </label>
                        <select 
                          value={targetCourseId}
                          onChange={e => setTargetCourseId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
                          required
                        >
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.course_code ? `${c.course_code} - ${c.title}` : c.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Assignment Title *
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {title.length}/100
                          </span>
                        </div>
                        <input 
                          type="text" 
                          required 
                          maxLength={100}
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          placeholder="e.g. Milestone 2: Design Token JSON & Component Architecture"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-semibold text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Interactive Points & Grading Scale */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-700">
                          Grading Scale & Max Score
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Adjust maximum score and gradebook weight
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scoreWeightBadge.color}`}>
                        {scoreWeightBadge.label}
                      </span>
                    </div>

                    {/* Quick Score Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {SCORE_PRESETS.map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setMaxScore(pts)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                            parseInt(maxScore, 10) === pts
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {pts} pts
                        </button>
                      ))}
                      
                      {/* Manual Score input */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[11px] text-slate-500">Custom:</span>
                        <input 
                          type="number"
                          min={1}
                          max={500}
                          value={maxScore}
                          onChange={(e) => setMaxScore(e.target.value)}
                          className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Due Date & Schedule */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-700">
                          Submission Deadline
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Target date for final student deliverable submission
                        </span>
                      </div>

                      {/* Due Date Shortcut Pills */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDueDateOffset(3)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          +3 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setDueDateOffset(7)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          +1 Week
                        </button>
                        <button
                          type="button"
                          onClick={() => setDueDateOffset(14)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          +2 Weeks
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <input 
                          type="date" 
                          value={dueDate} 
                          onChange={e => setDueDate(e.target.value)} 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800 text-xs" 
                        />
                      </div>

                      {/* Late Submissions Toggle */}
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-700">Allow Late Submissions</span>
                        <input 
                          type="checkbox" 
                          checked={allowLate}
                          onChange={(e) => setAllowLate(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded-md cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Instructions & Rubric Studio */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-700">
                          Instructions, Deliverables & Rubric
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Supports Markdown headers, bullet points, and criteria breakdowns
                        </span>
                      </div>

                      {/* Helper snippet buttons */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAppendInstruction("### Evaluation Rubric\n- Code Quality (40%)\n- Architecture & Standards (40%)\n- Documentation (20%)")}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          + Rubric Matrix
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppendInstruction("### Accepted Deliverables\n- PDF Document or Report\n- Public GitHub Repository link\n- Live demo URL")}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          + Deliverables Checklist
                        </button>
                      </div>
                    </div>

                    <textarea 
                      rows={7} 
                      value={instructions} 
                      onChange={e => setInstructions(e.target.value)} 
                      placeholder="Detail project specifications, acceptance criteria, required deliverables, and evaluation rubrics..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-[11px] text-slate-800 leading-relaxed" 
                    />
                  </div>

                </form>
              ) : (
                /* ================= LIVE STUDENT PREVIEW ================= */
                <div className="space-y-4 animate-in fade-in">
                  
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold">Interactive Student Simulation</span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-medium">
                      This is how students will view and submit this deliverable
                    </span>
                  </div>

                  {/* Student View Mock Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                    
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                          {currentSelectedCourseObj?.course_code || 'COURSE CODE'}
                        </span>
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200/60">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{maxScore} Maximum Points</span>
                        </div>
                      </div>

                      <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 mt-2">
                        {title || 'Untitled Assignment Milestone'}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Deadline: <strong>{formatPhDate(dueDate)}</strong></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Submissions Open</span>
                        </span>
                      </div>
                    </div>

                    {/* Instructions Body */}
                    <div className="space-y-3">
                      <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
                        Instructions & Evaluation Rubric
                      </h4>
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                        {instructions || 'No specific instructions entered yet. Click "Builder" to write deliverables and rubrics.'}
                      </div>
                    </div>

                    {/* Simulated Deliverable Upload Dropzone */}
                    <div className="bg-blue-50/30 rounded-2xl border-2 border-dashed border-blue-200 p-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-heading font-bold text-xs text-slate-800">
                          Student Deliverable Dropzone
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Students will drag and drop PDF reports, zip archives, or paste GitHub links here
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* Modal Bottom Footer Actions */}
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
                    <span>Preview Student View</span>
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
                  onClick={() => handleCreateAssignment()}
                  disabled={submitting || !title.trim()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? 'Publishing Milestone...' : 'Create & Publish Assignment'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
