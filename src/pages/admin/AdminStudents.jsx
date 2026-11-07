import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Plus, Eye, BookOpen, CheckCircle } from 'lucide-react';

export default function AdminStudents({ setActivePage }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('learnspace_token');
      const res = await fetch('/api/users?role=student', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students.filter(s => 
    s.first_name.toLowerCase().includes(search.toLowerCase()) || 
    s.last_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Academic Records
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Student Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor student profiles, active enrollments, and academic progress across all courses.
          </p>
        </div>

        <button 
          onClick={() => setActivePage('admin-enrollments')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Enroll Student in Course</span>
        </button>
      </div>

      {/* Search & Student List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Student</th>
                <th className="py-3 px-3">Headline / Level</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-3">
                    <img 
                      src={s.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                      alt="" 
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block">{s.first_name} {s.last_name}</span>
                      <span className="text-slate-400 text-[11px]">{s.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {s.headline || "Regular Student"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {s.account_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button 
                      onClick={() => setSelectedStudent(s)}
                      className="text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={selectedStudent.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                alt="" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-heading font-bold text-slate-800 text-base">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h3>
                <p className="text-xs text-slate-400">{selectedStudent.email}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Standing:</span>
                <span className="font-semibold text-emerald-600">Good Standing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-700">{selectedStudent.location || "Online"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID:</span>
                <span className="font-mono text-slate-600">ID #{selectedStudent.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setSelectedStudent(null);
                  setActivePage('admin-enrollments');
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Manage Enrollments
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
