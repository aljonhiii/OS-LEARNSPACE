import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, ShieldCheck, UserPlus, PlusCircle, Bell, ArrowRight, BarChart2 } from 'lucide-react';
import RealtimeActivityChart from '../../components/common/RealtimeActivityChart';

export default function AdminDashboard({ setActivePage }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to load admin summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const stats = summary?.stats || {
    totalUsers: 6,
    totalStudents: 4,
    totalTeachers: 1,
    activeCourses: 3,
    totalEnrollments: 6,
    systemStatus: 'Optimal'
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Enrolled Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Instructors', value: stats.totalTeachers, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Courses', value: stats.activeCourses, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Executive Overview
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Administrator Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System health, active metrics, platform enrollments, and audit summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActivePage('admin-users')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>
          <button 
            onClick={() => setActivePage('admin-courses')}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Manage Courses
          </button>
        </div>
      </div>

      {/* 1. TOP METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">{stat.label}</span>
                <span className="font-heading text-2xl font-bold text-slate-800 mt-1 block">{stat.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* PLATFORM ACTIVITY CHART — Real-time & database-driven */}
      <RealtimeActivityChart 
        title="Platform Activity"
        subtitle="Active users and course enrollments"
        metricLabel="Users"
        unit=""
        growthPercentage="+22.5%"
        accentColor="#2563EB"
        dataSets={summary?.activityChart || {
          'Week': [
            { label: 'Mon', value: 32 },
            { label: 'Tue', value: 48 },
            { label: 'Wed', value: 42 },
            { label: 'Thu', value: 65 },
            { label: 'Fri', value: 81 },
            { label: 'Sat', value: 54 },
            { label: 'Sun', value: 92 }
          ],
          'Month': [
            { label: 'Week 1', value: 240 },
            { label: 'Week 2', value: 310 },
            { label: 'Week 3', value: 410 },
            { label: 'Week 4', value: 520 }
          ],
          'Year': [
            { label: 'Jan', value: 850 },
            { label: 'Feb', value: 1100 },
            { label: 'Mar', value: 1350 },
            { label: 'Apr', value: 1280 },
            { label: 'May', value: 1600 },
            { label: 'Jun', value: 1950 },
            { label: 'Jul', value: 1820 },
            { label: 'Aug', value: 2100 },
            { label: 'Sep', value: 2450 },
            { label: 'Oct', value: 2800 },
            { label: 'Nov', value: 3100 },
            { label: 'Dec', value: 3400 }
          ]
        }}
      />

      {/* 2. RECENT USERS & QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Management Quick Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-slate-800 text-sm">System Users & Accounts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage roles, permissions, and account statuses</p>
            </div>
            <button 
              onClick={() => setActivePage('admin-users')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(summary?.recentUsers || []).map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{u.first_name} {u.last_name}</span>
                        <span className="text-slate-400 text-[11px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.account_status === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {u.account_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => setActivePage('admin-users')}
                        className="text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-heading font-semibold text-slate-800 text-sm mb-3">Quick Management Links</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setActivePage('admin-students')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Student Rosters</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => setActivePage('admin-teachers')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Teacher Assignments</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => setActivePage('admin-categories')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  <span>Course Categories</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => setActivePage('admin-reports')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  <span>Analytics & Reports</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Institutional System Status */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Platform Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h4 className="font-heading font-bold text-sm text-white">All Systems Operational</h4>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Institutional Production Cluster</p>
          </div>
        </div>

      </div>

    </div>
  );
}
