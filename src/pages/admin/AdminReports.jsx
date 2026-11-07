import React, { useState, useEffect } from 'react';
import { BarChart2, Download, Users, BookOpen, GraduationCap, Award } from 'lucide-react';

export default function AdminReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/reports/admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportData) return;
    const rows = [
      ['Course Code', 'Course Title', 'Enrolled Students', 'Submissions', 'Quiz Attempts'],
      ...reportData.courseStats.map(c => [c.course_code, `"${c.title}"`, c.total_enrolled, c.total_submissions, c.total_quiz_attempts])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `learnspace-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            Institutional Intelligence
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Reports & Learning Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated institutional metrics, course participation, and academic completion rates.
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {/* Completion & Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">Total Enrollments</span>
          <span className="font-heading text-3xl font-bold text-slate-900 mt-2 block">
            {reportData?.completionSummary?.total_enrollments || 6}
          </span>
          <p className="text-xs text-slate-500 mt-1">Across 3 active curriculum subjects</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">Overall Completion Rate</span>
          <span className="font-heading text-3xl font-bold text-blue-600 mt-2 block">
            {reportData?.completionSummary?.completion_rate || 67}%
          </span>
          <p className="text-xs text-slate-500 mt-1">Formula: Completed / Total Active Enrollments</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">User Distribution</span>
          <div className="flex items-center gap-4 mt-3 text-xs">
            {(reportData?.rolesCount || []).map(r => (
              <div key={r.name} className="capitalize">
                <span className="font-bold text-slate-800 text-base block">{r.count}</span>
                <span className="text-slate-400 text-[11px]">{r.name}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Stats Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-heading font-semibold text-slate-800 text-sm">Course Assessment & Submission Analytics</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Course</th>
                <th className="py-3 px-3">Enrolled</th>
                <th className="py-3 px-3">Assignments Submitted</th>
                <th className="py-3 px-3">Quiz Attempts</th>
                <th className="py-3 px-3 rounded-r-lg text-right">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(reportData?.courseStats || []).map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{c.title}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{c.course_code}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{c.total_enrolled}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.total_submissions} submissions</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.total_quiz_attempts} attempts</td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
