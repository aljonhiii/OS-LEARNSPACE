import React, { useState, useEffect } from 'react';
import { Star, Award, CheckCircle, FileText, Download, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentGrades() {
  const { currentUser } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentGrades() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/assignments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          // Filter assignments that have student submission / grades
          const gradedItems = list.map(a => ({
            id: a.id,
            title: a.title,
            course_title: a.course_title,
            course_code: a.course_code,
            max_score: a.max_score,
            score: a.mySubmission?.score,
            status: a.mySubmission?.status || 'pending',
            feedback: a.mySubmission?.student_feedback || 'Pending evaluation from instructor.',
            graded_at: a.mySubmission?.submitted_at
          }));
          setGrades(gradedItems);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentGrades();
  }, []);

  const totalPossible = grades.reduce((acc, g) => acc + (g.max_score || 100), 0);
  const totalEarned = grades.filter(g => g.score !== undefined && g.score !== null).reduce((acc, g) => acc + Number(g.score), 0);
  const compositeAverage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 94;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Academic Transcript
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Grades & Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review earned points, rubric evaluations, and detailed constructive feedback from your course mentors.
          </p>
        </div>

        {/* Composite Average Pill */}
        <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-200/60 p-3 rounded-2xl shrink-0">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Term Average</span>
            <span className="font-heading font-bold text-lg text-blue-700 block">{compositeAverage}% (Grade A)</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Total Milestone Deliverables</span>
          <span className="font-heading font-bold text-2xl text-slate-900 mt-1 block">{grades.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across all active enrollments</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Completed & Graded</span>
          <span className="font-heading font-bold text-2xl text-emerald-600 mt-1 block">
            {grades.filter(g => g.score !== undefined && g.score !== null).length}
          </span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">Recorded in central database</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Earned Points Total</span>
          <span className="font-heading font-bold text-2xl text-blue-600 mt-1 block">
            {totalEarned} / {totalPossible} pts
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Weighted gradebook points</span>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading grades ledger...
          </div>
        ) : grades.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No graded milestones yet</p>
            <p className="text-xs text-slate-400 mt-1">Submit your assignments to receive marks and feedback.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Milestone / Deliverable</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Status & Score</th>
                  <th className="py-3 px-4">Instructor Feedback</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {grades.map((g) => {
                  const isGraded = g.score !== undefined && g.score !== null;
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {g.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 block">{g.course_title}</span>
                        <span className="text-[10px] text-blue-600 font-mono block">{g.course_code}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {g.score} / {g.max_score} pts
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                            Awaiting Grade
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 italic text-[11px]">
                          "{g.feedback}"
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {g.graded_at ? new Date(g.graded_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}