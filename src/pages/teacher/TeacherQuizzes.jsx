import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Award, Plus, Trash2, Clock, CheckCircle, 
  X, Search, Layers, Sparkles, Eye, Edit3, CheckCircle2, 
  BookOpen, ArrowUpDown
} from 'lucide-react';

// Interactive Templates for Rapid Quiz Authoring
const QUIZ_PRESETS = [
  {
    id: 'design-tokens',
    badge: 'Design System',
    title: 'Quiz 2: Design Tokens, Spacing Scales & WCAG Contrast',
    timeLimit: 15,
    passingScore: 75,
    instructions: 'Test your understanding of semantic tokens, 8pt spacing grids, and WCAG 2.1 AA accessibility ratios. Once started, the countdown timer cannot be paused.',
    sampleQuestion: {
      text: 'What is the minimum WCAG 2.1 AA contrast ratio required for standard body text against its background?',
      choices: [
        { text: '3:1 contrast ratio', isCorrect: false },
        { text: '4.5:1 contrast ratio', isCorrect: true },
        { text: '7:1 contrast ratio', isCorrect: false },
        { text: '2:1 contrast ratio', isCorrect: false }
      ]
    }
  },
  {
    id: 'backend-api',
    badge: 'Backend & API',
    title: 'Benchmark 3: REST Architecture, Status Codes & Express Middleware',
    timeLimit: 20,
    passingScore: 70,
    instructions: 'Comprehensive check covering idempotent HTTP methods, Express middleware lifecycle, and relational connection pooling.',
    sampleQuestion: {
      text: 'Which HTTP method should be used for updating a specific field without replacing the entire resource?',
      choices: [
        { text: 'PUT', isCorrect: false },
        { text: 'PATCH', isCorrect: true },
        { text: 'POST', isCorrect: false },
        { text: 'OPTIONS', isCorrect: false }
      ]
    }
  },
  {
    id: 'sql-db',
    badge: 'Database Modeling',
    title: 'Assessment: SQL Relational Integrity & MariaDB Indexing',
    timeLimit: 25,
    passingScore: 80,
    instructions: 'Evaluation of foreign key constraints, composite index optimization, and connection pool query queuing.',
    sampleQuestion: {
      text: 'What happens when a foreign key constraint has ON DELETE CASCADE specified?',
      choices: [
        { text: 'The parent row deletion is blocked', isCorrect: false },
        { text: 'Related child rows in the table are automatically deleted', isCorrect: true },
        { text: 'The child foreign key is set to NULL', isCorrect: false },
        { text: 'An audit log is generated without modifying data', isCorrect: false }
      ]
    }
  },
  {
    id: 'quick-check',
    badge: 'Knowledge Check',
    title: 'Weekly Check: React 19 State Synchronization & Hooks',
    timeLimit: 10,
    passingScore: 70,
    instructions: 'A quick 5-question comprehension check on React 19 state synchronization and memoization.',
    sampleQuestion: {
      text: 'What is the primary purpose of the useMemo hook?',
      choices: [
        { text: 'To trigger side-effects after DOM render', isCorrect: false },
        { text: 'To cache the result of an expensive calculation between re-renders', isCorrect: true },
        { text: 'To bind component state to URL query parameters', isCorrect: false },
        { text: 'To create a mutable ref object', isCorrect: false }
      ]
    }
  }
];

const TIME_LIMIT_PRESETS = [10, 15, 20, 30, 45, 60];
const PASSING_SCORE_PRESETS = [60, 70, 75, 80, 85, 90];

export default function TeacherQuizzes({ setActivePage }) {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);
  
  // Create Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('builder'); // 'builder' | 'preview'
  const [targetCourseId, setTargetCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [passingScore, setPassingScore] = useState(75);
  const [previewSampleQuestion, setPreviewSampleQuestion] = useState(QUIZ_PRESETS[0].sampleQuestion);
  const [simulatedSelectedChoice, setSimulatedSelectedChoice] = useState(1);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Add Question Modal State
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [activeQuizForQuestion, setActiveQuizForQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [points, setPoints] = useState(10);
  const [choices, setChoices] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [explanation, setExplanation] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [message, setMessage] = useState(null);

  // Reload Quizzes Data
  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const [qRes, cRes] = await Promise.all([
        fetch('/api/quizzes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQuizzes(qData);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData);
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const [qRes, cRes] = await Promise.all([
          fetch('/api/quizzes', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!isMounted) return;

        if (qRes.ok) {
          const qData = await qRes.json();
          setQuizzes(qData);
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(cData);
          if (cData.length > 0) {
            setTargetCourseId(prev => prev || cData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to init quizzes data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, []);

  // Apply Quiz Template
  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setTimeLimit(preset.timeLimit);
    setPassingScore(preset.passingScore);
    setInstructions(preset.instructions);
    if (preset.sampleQuestion) {
      setPreviewSampleQuestion(preset.sampleQuestion);
      setSimulatedSelectedChoice(preset.sampleQuestion.choices.findIndex(c => c.isCorrect));
    }
  };

  // Create Quiz Handler
  const handleCreateQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !targetCourseId) {
      alert('Course and quiz title are required.');
      return;
    }

    setSubmittingQuiz(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: targetCourseId,
          title: title.trim(),
          instructions: instructions.trim() || 'Complete all multiple-choice questions within the allotted time limit.',
          time_limit_minutes: parseInt(timeLimit, 10) || 15,
          passing_score: parseFloat(passingScore) || 75.0
        })
      });

      if (res.ok) {
        const createdData = await res.json();
        
        // If template has a sample question, add it as first question automatically
        if (previewSampleQuestion && createdData.id) {
          try {
            await fetch(`/api/quizzes/${createdData.id}/questions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                question_text: previewSampleQuestion.text,
                points: 10,
                explanation: 'Sample question seeded from quiz template.',
                choices: previewSampleQuestion.choices
              })
            });
          } catch (qErr) {
            console.error('Error seeding initial question:', qErr);
          }
        }

        setMessage({ type: 'success', text: 'Timed assessment quiz created successfully!' });
        setTimeout(() => setMessage(null), 3500);
        setQuizModalOpen(false);
        setTitle('');
        setInstructions('');
        setTimeLimit(20);
        setPassingScore(75);
        setModalTab('builder');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create quiz');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while creating quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Add Question Handler
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || !activeQuizForQuestion) {
      alert('Question text is required.');
      return;
    }

    // Verify at least one correct choice
    const hasCorrect = choices.some(c => c.isCorrect && c.text.trim());
    if (!hasCorrect) {
      alert('Please fill out and mark at least one correct choice.');
      return;
    }

    setSubmittingQuestion(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/quizzes/${activeQuizForQuestion.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_text: questionText.trim(),
          points: parseInt(points, 10) || 10,
          explanation: explanation.trim(),
          choices: choices.map(c => ({ text: c.text.trim() || 'Option', isCorrect: c.isCorrect }))
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Question added to "${activeQuizForQuestion.title}"!` });
        setTimeout(() => setMessage(null), 3000);
        setQuestionModalOpen(false);
        setQuestionText('');
        setChoices([
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]);
        setExplanation('');
        loadData();
      } else {
        alert('Failed to add question to quiz');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while adding question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Delete Quiz
  const handleDelete = async (id, quizTitle) => {
    if (!confirm(`Are you sure you want to delete quiz "${quizTitle}"?`)) return;
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Quiz removed from curriculum.' });
        setTimeout(() => setMessage(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChoiceChange = (idx, text) => {
    const updated = [...choices];
    updated[idx].text = text;
    setChoices(updated);
  };

  const handleSetCorrectChoice = (idx) => {
    const updated = choices.map((c, i) => ({
      ...c,
      isCorrect: i === idx
    }));
    setChoices(updated);
  };

  // Filtered & Sorted Quizzes
  const filteredQuizzes = useMemo(() => {
    let result = quizzes.filter(q => {
      const matchesCourse = selectedCourse === 'all' || String(q.course_id) === String(selectedCourse);
      const query = search.toLowerCase().trim();
      const matchesSearch = !query || 
        q.title.toLowerCase().includes(query) || 
        (q.instructions && q.instructions.toLowerCase().includes(query)) ||
        (q.course_title && q.course_title.toLowerCase().includes(query));

      return matchesCourse && matchesSearch;
    });

    result.sort((a, b) => {
      if (sortBy === 'questions-desc') return (b.question_count || 0) - (a.question_count || 0);
      if (sortBy === 'time-desc') return (b.time_limit_minutes || 0) - (a.time_limit_minutes || 0);
      if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'latest') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

    return result;
  }, [quizzes, selectedCourse, search, sortBy]);

  // Overall Quiz Metrics
  const quizMetrics = useMemo(() => {
    const total = quizzes.length;
    const totalQuestions = quizzes.reduce((sum, q) => sum + (parseInt(q.question_count, 10) || 0), 0);
    const totalAttempts = quizzes.reduce((sum, q) => sum + (parseInt(q.attempt_count, 10) || 0), 0);
    const avgPass = total > 0 ? Math.round(quizzes.reduce((sum, q) => sum + (parseFloat(q.passing_score) || 75), 0) / total) : 75;

    return { total, totalQuestions, totalAttempts, avgPass };
  }, [quizzes]);

  // Current Selected Course Obj
  const currentCourseObj = useMemo(() => {
    return courses.find(c => String(c.id) === String(targetCourseId)) || courses[0];
  }, [courses, targetCourseId]);

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          PAGE HEADER
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Assessment Engine
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              • Quizzes & Timed Knowledge Checks
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-2 tracking-tight">
            Quiz Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Create timed multiple-choice assessments, configure passing criteria, author questions, and monitor student evaluation scores.
          </p>
        </div>

        <button 
          onClick={() => {
            if (courses.length > 0 && !targetCourseId) {
              setTargetCourseId(courses[0].id);
            }
            setModalTab('builder');
            setQuizModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Quiz</span>
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

      {/* =========================================================================
          INTERACTIVE QUIZ KPI TILES
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Quizzes</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{quizMetrics.total}</span>
            <span className="text-[10px] text-slate-400 font-medium">assessments</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Question Pool</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{quizMetrics.totalQuestions}</span>
            <span className="text-[10px] text-indigo-600 font-medium">questions</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student Attempts</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{quizMetrics.totalAttempts}</span>
            <span className="text-[10px] text-emerald-600 font-medium">recorded</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Pass Threshold</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">{quizMetrics.avgPass}%</span>
            <span className="text-[10px] text-slate-400 font-medium">minimum</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ACTION TOOLBAR (SEARCH, COURSE FILTER, SORT)
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search quizzes by title, instructions, or course..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Course:</span>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code ? `${c.course_code} - ${c.title}` : c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Sort By:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="latest">Latest Created</option>
              <option value="questions-desc">Most Questions</option>
              <option value="time-desc">Longest Duration</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>

          {(selectedCourse !== 'all' || search) && (
            <button
              onClick={() => {
                setSelectedCourse('all');
                setSearch('');
              }}
              className="text-[11px] text-blue-600 font-semibold hover:underline px-2 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* =========================================================================
          QUIZZES GRID CARDS
      ========================================================================= */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading quizzes...
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No quizzes configured yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "New Quiz" to design timed assessments and build question pools.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuizzes.map((q) => (
            <div key={q.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="space-y-4">
                
                {/* Course Tag & Time Limit */}
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-mono uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    {q.course_code || 'COURSE'}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{q.time_limit_minutes} min duration</span>
                  </div>
                </div>

                {/* Title & Instructions */}
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {q.instructions || 'Review module lessons before attempting this timed multiple-choice assessment.'}
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Questions</span>
                    <span className="font-heading font-bold text-sm text-slate-800">{q.question_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Passing Score</span>
                    <span className="font-heading font-bold text-sm text-emerald-600">{q.passing_score}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Attempts</span>
                    <span className="font-heading font-bold text-sm text-slate-800">{q.attempt_count || 0}</span>
                  </div>
                </div>

              </div>

              {/* Card Actions */}
              <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 mt-4">
                <button
                  onClick={() => {
                    setActiveQuizForQuestion(q);
                    setQuestionModalOpen(true);
                  }}
                  className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question ({q.question_count || 0})</span>
                </button>

                <div className="flex items-center gap-1">
                  {setActivePage && (
                    <button
                      onClick={() => setActivePage('teacher-gradebook')}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                      title="Inspect Quiz Scores in Gradebook"
                    >
                      <Award className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(q.id, q.title)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE "CREATE NEW QUIZ" STUDIO MODAL
      ========================================================================= */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 leading-tight">
                    Quiz Assessment Studio
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure timed rules, passing thresholds, and preview live countdown interface
                  </p>
                </div>
              </div>

              {/* Dual-Mode Switcher: Builder vs Student Preview */}
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
                    <span>Live Student Quiz</span>
                  </button>
                </div>

                <button 
                  onClick={() => setQuizModalOpen(false)} 
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
                <form id="quiz-builder-form" onSubmit={handleCreateQuiz} className="space-y-6 text-xs">
                  
                  {/* Preset Template Chips */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Quick Quiz Presets
                      </span>
                      <span className="text-[10px] text-slate-400">Click to autofill time limit & passing criteria</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {QUIZ_PRESETS.map((p) => (
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
                            {p.timeLimit}m • Pass: {p.passingScore}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Course & Title */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-4">
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
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Quiz Title *
                        </label>
                        <input 
                          type="text" 
                          required 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          placeholder="e.g. Assessment 2: Design Tokens & Accessibility Standards"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-semibold text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Time Limit & Passing Score Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Time Limit */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-slate-700">Time Limit (Minutes)</span>
                        <span className="font-mono font-bold text-blue-600 text-xs">{timeLimit} mins</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {TIME_LIMIT_PRESETS.map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setTimeLimit(mins)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                              parseInt(timeLimit, 10) === mins
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Passing Score Threshold */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-slate-700">Passing Threshold (%)</span>
                        <span className="font-mono font-bold text-emerald-600 text-xs">{passingScore}%</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {PASSING_SCORE_PRESETS.map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setPassingScore(score)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                              parseFloat(passingScore) === score
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {score}%
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Instructions */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Assessment Guidelines & Rules
                    </label>
                    <textarea 
                      rows={4} 
                      value={instructions} 
                      onChange={e => setInstructions(e.target.value)} 
                      placeholder="Explain test duration, allowable resources, question count, and submission policies..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-[11px] text-slate-800 leading-relaxed" 
                    />
                  </div>

                </form>
              ) : (
                /* ================= LIVE STUDENT QUIZ PREVIEW ================= */
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* Top Notification */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold">Interactive Student Simulation</span>
                    </div>
                    <span className="text-[11px] text-blue-600">Simulating active student countdown</span>
                  </div>

                  {/* Live Quiz Interface Mockup */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                    
                    {/* Quiz Top Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {currentCourseObj?.course_code || 'COURSE'}
                          </span>
                          <span className="text-[11px] text-slate-400">Passing Grade: {passingScore}%</span>
                        </div>
                        <h2 className="font-heading font-bold text-xl text-slate-900 mt-1">
                          {title || 'Untitled Assessment Quiz'}
                        </h2>
                      </div>

                      {/* Animated Simulated Countdown Timer */}
                      <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-2xl border border-rose-200 self-start sm:self-auto font-mono text-sm font-bold">
                        <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span>{String(timeLimit).padStart(2, '0')}:00 Remaining</span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {instructions || 'Please read each question carefully and select the single best answer. Submit before the timer expires.'}
                    </p>

                    {/* Interactive Sample Question */}
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          Question 1 of 1 (10 pts)
                        </span>
                        <span className="text-[10px] text-slate-400">Single Choice</span>
                      </div>

                      <h4 className="font-heading font-bold text-sm text-slate-900 leading-snug">
                        {previewSampleQuestion?.text}
                      </h4>

                      {/* Interactive Radio Choices */}
                      <div className="space-y-2.5 pt-1">
                        {previewSampleQuestion?.choices?.map((choice, cIdx) => {
                          const isSelected = simulatedSelectedChoice === cIdx;
                          return (
                            <div 
                              key={cIdx}
                              onClick={() => setSimulatedSelectedChoice(cIdx)}
                              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 text-blue-900 font-semibold' 
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                                <span className="text-xs">{choice.text}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <button 
                type="button" 
                onClick={() => setQuizModalOpen(false)} 
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
                    <span>Preview Student Experience</span>
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
                  onClick={() => handleCreateQuiz()}
                  disabled={submittingQuiz || !title.trim()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{submittingQuiz ? 'Publishing Assessment...' : 'Create & Publish Quiz'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE "ADD QUESTION" MODAL
      ========================================================================= */}
      {questionModalOpen && activeQuizForQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Add Question to Quiz
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                  {activeQuizForQuestion.title}
                </p>
              </div>
              <button 
                onClick={() => setQuestionModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Question Text *
                </label>
                <textarea 
                  rows={2} 
                  required
                  value={questionText} 
                  onChange={e => setQuestionText(e.target.value)} 
                  placeholder="e.g. Which HTTP response code indicates an unauthorized request?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              {/* Point Value */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Point Value</label>
                  <span className="font-mono text-blue-600 font-bold">{points} pts</span>
                </div>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20].map((pVal) => (
                    <button
                      key={pVal}
                      type="button"
                      onClick={() => setPoints(pVal)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        points === pVal ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pVal} pts
                    </button>
                  ))}
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Choices (Select the radio of the correct answer)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    ● Green = Correct Option
                  </span>
                </div>

                {choices.map((c, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      c.isCorrect ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="correctChoice" 
                      checked={c.isCorrect} 
                      onChange={() => handleSetCorrectChoice(idx)}
                      className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      required 
                      value={c.text} 
                      onChange={e => handleChoiceChange(idx, e.target.value)} 
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="w-full bg-transparent focus:outline-none text-xs text-slate-800 font-medium"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation Hint */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Answer Explanation / Feedback (Optional)
                </label>
                <input 
                  type="text" 
                  value={explanation} 
                  onChange={e => setExplanation(e.target.value)} 
                  placeholder="e.g. 401 Unauthorized indicates unauthenticated user"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setQuestionModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingQuestion} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submittingQuestion ? 'Adding Question...' : 'Add Question'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
