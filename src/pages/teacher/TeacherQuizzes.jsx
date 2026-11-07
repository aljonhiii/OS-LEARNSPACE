import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Clock, CheckCircle, HelpCircle, X, Search, Layers } from 'lucide-react';

export default function TeacherQuizzes({ setActivePage }) {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Create Quiz Modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [passingScore, setPassingScore] = useState(70);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Add Question Modal
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

  const loadData = async () => {
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
        if (cData.length > 0 && !targetCourseId) {
          setTargetCourseId(cData[0].id);
        }
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

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!title || !targetCourseId) return alert('Course and title are required');
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
          title,
          instructions,
          time_limit_minutes: parseInt(timeLimit, 10) || 15,
          passing_score: parseFloat(passingScore) || 70.0
        })
      });

      if (res.ok) {
        setMessage('Assessment quiz created successfully!');
        setTimeout(() => setMessage(null), 3000);
        setQuizModalOpen(false);
        setTitle('');
        setInstructions('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionText || !activeQuizForQuestion) return alert('Question text required');
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
          question_text: questionText,
          points: parseInt(points, 10) || 10,
          explanation,
          choices
        })
      });

      if (res.ok) {
        setMessage('Question added to quiz successfully!');
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuestion(false);
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

  const filtered = quizzes.filter(q => 
    !selectedCourse || String(q.course_id) === String(selectedCourse)
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Testing & Knowledge Verification
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Quiz Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Construct auto-graded multiple-choice evaluations, set pass rates, and analyze attempt metrics.
          </p>
        </div>

        <button 
          onClick={() => setQuizModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Course Filter:</span>
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

        <span className="text-xs text-slate-400 font-medium">
          {filtered.length} Quiz{filtered.length === 1 ? '' : 'zes'} active
        </span>
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading quizzes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No quizzes created yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "Create New Quiz" to author tests and knowledge checks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {q.course_code || 'CRS'}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Pass: {q.passing_score}%
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-1">{q.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{q.instructions || 'Online evaluation.'}</p>
                </div>

                <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{q.time_limit_minutes || 15} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{q.question_count || 0} Questions</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 mt-4">
                <button
                  onClick={() => {
                    setActiveQuizForQuestion(q);
                    setQuestionModalOpen(true);
                  }}
                  className="w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Quiz */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">Create New Quiz</h3>
              <button onClick={() => setQuizModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Course *</label>
                <select 
                  value={targetCourseId}
                  onChange={e => setTargetCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quiz Title *</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Design Tokens & Component Library Knowledge Check"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Time Limit (mins)</label>
                  <input 
                    type="number" 
                    value={timeLimit} 
                    onChange={e => setTimeLimit(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passing Score (%)</label>
                  <input 
                    type="number" 
                    value={passingScore} 
                    onChange={e => setPassingScore(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instructions</label>
                <textarea 
                  rows={3} 
                  value={instructions} 
                  onChange={e => setInstructions(e.target.value)} 
                  placeholder="Explain attempt rules and topic coverage..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setQuizModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingQuiz} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submittingQuiz ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Question to Quiz */}
      {questionModalOpen && activeQuizForQuestion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Add Question: {activeQuizForQuestion.title}
              </h3>
              <button onClick={() => setQuestionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Question Prompt *</label>
                <textarea 
                  rows={2} 
                  required 
                  value={questionText} 
                  onChange={e => setQuestionText(e.target.value)} 
                  placeholder="e.g. Which CSS variable type is used for global color palette abstraction?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Multiple Choice Options (Select radio for correct answer)
                </label>
                {choices.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="correctChoice" 
                      checked={choice.isCorrect} 
                      onChange={() => handleSetCorrectChoice(idx)}
                      className="text-blue-600 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      required 
                      value={choice.text} 
                      onChange={e => handleChoiceChange(idx, e.target.value)} 
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Explanation (Revealed after submission)</label>
                <input 
                  type="text" 
                  value={explanation} 
                  onChange={e => setExplanation(e.target.value)} 
                  placeholder="Why this answer is correct..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setQuestionModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingQuestion} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submittingQuestion ? 'Adding...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}