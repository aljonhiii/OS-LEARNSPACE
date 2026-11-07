import React, { useState, useEffect } from 'react';
import { CheckSquare, Search, Filter, Star, Clock, FileText, CheckCircle, X, ExternalLink, Award } from 'lucide-react';

export default function TeacherSubmissions({ selectedAssignmentId }) {
  const [assignments, setAssignments] = useState([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState(selectedAssignmentId || '');
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, submitted, graded

  // Grading Modal State
  const [gradingModal, setGradingModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [score, setScore] = useState(90);
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [message, setMessage] = useState(null);

  // Load Assignments
  useEffect(() => {
    async function loadAssignments() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/assignments', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const list = await res.json();
          setAssignments(list);
          if (!activeAssignmentId && list.length > 0) {
            setActiveAssignmentId(list[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAssignments();
  }, []);

  // Load Submissions for Active Assignment
  const loadSubmissions = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/assignments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignmentData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAssignmentId) {
      loadSubmissions(activeAssignmentId);
    }
  }, [activeAssignmentId]);

  const handleOpenGrading = (sub) => {
    setCurrentSubmission(sub);
    setScore(sub.score || 95);
    setFeedback(sub.student_feedback || 'Excellent work on following the specifications and providing clean architecture.');
    setGradingModal(true);
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!currentSubmission) return;
    setSubmittingGrade(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/assignments/submissions/${currentSubmission.id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: parseInt(score, 10),
          max_score: assignmentData?.max_score || 100,
          feedback
        })
      });

      if (res.ok) {
        setMessage('Grade and feedback saved successfully!');
        setTimeout(() => setMessage(null), 3000);
        setGradingModal(false);
        loadSubmissions(activeAssignmentId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingGrade(false);
    }
  };

  const submissions = assignmentData?.submissions || [];
  const filteredSubmissions = submissions.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Evaluation Queue
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Submission Management & Grading
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review student code submissions, assess work against rubric criteria, and assign marks.
          </p>
        </div>

        {/* Assignment Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-600">Select Assignment:</span>
          <select 
            value={activeAssignmentId}
            onChange={(e) => setActiveAssignmentId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {assignments.map(a => (
              <option key={a.id} value={a.id}>{a.title} ({a.course_code})</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Assignment Overview Bar */}
      {assignmentData && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-sm text-slate-900">{assignmentData.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{assignmentData.instructions}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Max Score: {assignmentData.max_score} pts
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
              >
                <option value="all">All Submissions</option>
                <option value="submitted">Needs Grading</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading student submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No submissions found</p>
            <p className="text-xs text-slate-400 mt-1">Student deliverables for this milestone will be queued here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Submitted Work / Deliverable</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status & Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubmissions.map((sub) => {
                  const isGraded = sub.status === 'graded';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={sub.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {sub.student_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Student ID #{sub.student_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium line-clamp-2">
                            {sub.submission_text || 'Deliverable uploaded.'}
                          </p>
                          {sub.file_name && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-mono">
                              <FileText className="w-3 h-3" />
                              {sub.file_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isGraded ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              <CheckCircle className="w-3 h-3" />
                              Graded: {sub.score} / {sub.max_score}
                            </span>
                            {sub.student_feedback && (
                              <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">"{sub.student_feedback}"</p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenGrading(sub)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          {isGraded ? 'Edit Grade' : 'Grade Submission'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Drawer / Modal */}
      {gradingModal && currentSubmission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Grade Submission: {currentSubmission.student_name}
              </h3>
              <button onClick={() => setGradingModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Deliverable Text</span>
                <span className="font-mono text-slate-400">{currentSubmission.file_name}</span>
              </div>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 max-h-32 overflow-y-auto">
                {currentSubmission.submission_text || 'No description attached.'}
              </p>
            </div>

            <form onSubmit={handleSubmitGrade} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Awarded Score (out of {assignmentData?.max_score || 100}) *
                </label>
                <input 
                  type="number" 
                  required 
                  min={0}
                  max={assignmentData?.max_score || 100}
                  value={score} 
                  onChange={e => setScore(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold text-sm text-blue-600" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qualitative Feedback to Student</label>
                <textarea 
                  rows={4} 
                  value={feedback} 
                  onChange={e => setFeedback(e.target.value)} 
                  placeholder="Provide constructive feedback, notes on rubric criteria, and encouragement..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setGradingModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingGrade} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submittingGrade ? 'Saving Grade...' : 'Commit Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}