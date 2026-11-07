import React, { useState, useEffect } from 'react';
import { Award, Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCcw, AlertCircle, HelpCircle, Layers } from 'lucide-react';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Runner State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [question_id]: choice_id }
  const [timeLeft, setTimeLeft] = useState(600); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const loadQuizzes = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/quizzes', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!activeQuizData || result) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuizData, result]);

  const handleStartQuiz = async (quiz) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const full = await res.json();
        setActiveQuiz(quiz);
        setActiveQuizData(full);
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        setResult(null);
        setTimeLeft((quiz.time_limit_minutes || 15) * 60);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = (questionId, choiceId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizData) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const answersPayload = activeQuizData.questions.map(q => ({
        question_id: q.id,
        selected_choice_id: selectedAnswers[q.id] || null
      }));

      const res = await fetch(`/api/quizzes/${activeQuizData.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersPayload })
      });

      if (res.ok) {
        const resData = await res.json();
        setResult(resData);
        loadQuizzes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Quiz List View */}
      {!activeQuizData && (
        <>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Mastery Assessments
              </span>
              <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
                Online Quizzes & Exams
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Timed knowledge tests with instant scoring and question explanations.
              </p>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              {quizzes.length} Quizzes Available
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No quizzes available</p>
              <p className="text-xs text-slate-400 mt-1">Quizzes assigned to your enrolled courses will be listed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((q) => {
                const passed = q.hasPassed;
                const attempts = q.myAttempts?.length || 0;
                return (
                  <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {q.course_code || 'CRS'}
                        </span>
                        {passed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Pass: {q.passing_score}%
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-1">{q.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {q.instructions || 'Comprehensive concept review and knowledge test.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {q.time_limit_minutes || 15} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                          {q.question_count || 0} Questions
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleStartQuiz(q)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{attempts > 0 ? `Retake Quiz (Attempt #${attempts + 1})` : 'Start Quiz Now'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Interactive Timed Runner View */}
      {activeQuizData && !result && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
          {/* Top Bar with Timer */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                {activeQuizData.course_title}
              </span>
              <h2 className="font-heading font-bold text-lg text-slate-900 mt-1">{activeQuizData.title}</h2>
            </div>

            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl font-mono font-bold text-sm">
              <Clock className="w-4 h-4 animate-pulse text-rose-600" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          {/* Question Index Dots */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Question {currentQuestionIdx + 1} of {activeQuizData.questions?.length || 0}</span>
            <span className="font-mono text-blue-600">Points: {activeQuizData.questions?.[currentQuestionIdx]?.points || 10}</span>
          </div>

          {/* Current Question */}
          {activeQuizData.questions?.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-heading font-bold text-sm sm:text-base text-slate-900 leading-relaxed">
                  {activeQuizData.questions[currentQuestionIdx].question_text}
                </p>
              </div>

              {/* Choices */}
              <div className="space-y-2.5">
                {activeQuizData.questions[currentQuestionIdx].choices?.map((choice) => {
                  const qId = activeQuizData.questions[currentQuestionIdx].id;
                  const isSelected = selectedAnswers[qId] === choice.id;

                  return (
                    <div
                      key={choice.id}
                      onClick={() => handleSelectChoice(qId, choice.id)}
                      className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs ring-1 ring-blue-500/30' 
                          : 'border-slate-200/80 bg-white hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span>{choice.choice_text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < (activeQuizData.questions?.length || 1) - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Scoring Answers...' : 'Submit Answers & Finish'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Post-Submission Scorecard */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-6 max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-blue-50 text-blue-600">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-slate-900">Quiz Completed!</h2>
            <p className="text-xs text-slate-500 mt-1">Your answers have been graded and recorded.</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
            <div className="text-4xl font-heading font-bold text-blue-600">
              {result.percentage}%
            </div>
            <p className="text-xs text-slate-600 font-medium">
              You scored {result.totalScore} out of {result.maxScore} points.
            </p>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                result.percentage >= (activeQuiz?.passing_score || 70)
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {result.percentage >= (activeQuiz?.passing_score || 70) ? 'Passed Evaluation' : 'Below Passing Threshold'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setActiveQuiz(null);
                setActiveQuizData(null);
                setResult(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Return to Quizzes List
            </button>
          </div>
        </div>
      )}

    </div>
  );
}