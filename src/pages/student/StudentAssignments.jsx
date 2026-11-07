import React, { useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle, Clock, UploadCloud, X, Award, ExternalLink, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentAssignments() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);

  // Form State
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('design-tokens-milestone.zip');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const loadAssignments = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleOpenSubmit = (a) => {
    setActiveAssignment(a);
    setSubmissionText(a.mySubmission?.submission_text || '');
    setFileName(a.mySubmission?.file_name || 'project-deliverable.pdf');
    setSubmitModal(true);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionText || !activeAssignment) return alert('Please enter your submission text or link');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch(`/api/assignments/${activeAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submission_text: submissionText,
          file_name: fileName
        })
      });

      if (res.ok) {
        setMessage('Work submitted successfully! Your instructor will review it.');
        setTimeout(() => setMessage(null), 3500);
        setSubmitModal(false);
        loadAssignments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Course Deliverables
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Assignments & Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver homework tasks, submit design specifications, and inspect rubric grades.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {assignments.length} Total Milestones
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Assignments List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No assignments posted</p>
          <p className="text-xs text-slate-400 mt-1">Upcoming milestones will appear here as your instructor assigns them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const mySub = a.mySubmission;
            const isGraded = mySub && mySub.status === 'graded';
            const isSubmitted = mySub && mySub.status === 'submitted';

            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                      {a.course_code || 'CRS'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{a.course_title}</span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{a.instructions}</p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      Due: {a.due_at ? new Date(a.due_at).toLocaleDateString() : 'Self-paced'}
                    </span>
                    <span className="font-mono text-slate-600 font-semibold">Max: {a.max_score} points</span>
                  </div>

                  {isGraded && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1 text-xs mt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600" />
                          Graded: {mySub.score} / {mySub.max_score} pts
                        </span>
                        <span className="text-[10px] text-emerald-600 font-mono">Verified by Instructor</span>
                      </div>
                      {mySub.student_feedback && (
                        <p className="text-slate-600 text-[11px] pt-1">
                          Teacher Feedback: "{mySub.student_feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  {isGraded ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : isSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Evaluation
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      Action Required
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenSubmit(a)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{mySub ? 'Resubmit Deliverable' : 'Submit Work'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Submit Work */}
      {submitModal && activeAssignment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {activeAssignment.course_code}
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900 mt-1">
                  Submit Work: {activeAssignment.title}
                </h3>
              </div>
              <button onClick={() => setSubmitModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Deliverable Write-up / GitHub Repo / Figma URL *
                </label>
                <textarea 
                  rows={4} 
                  required 
                  value={submissionText} 
                  onChange={e => setSubmissionText(e.target.value)} 
                  placeholder="Paste your repo link, hosted preview link, or project explanation..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Attached Filename</label>
                <input 
                  type="text" 
                  value={fileName} 
                  onChange={e => setFileName(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs" 
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl text-[11px] text-blue-700">
                Submissions are securely recorded. Once graded by your instructor, marks and feedback will appear in your gradebook.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setSubmitModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl">
                  {submitting ? 'Submitting...' : 'Upload Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}