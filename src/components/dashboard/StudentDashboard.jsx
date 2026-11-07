import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, ArrowRight, Play, FileText, Clock, Sparkles } from 'lucide-react';
import CountdownTimer from '../common/CountdownTimer';
import MiniCalendar from '../common/MiniCalendar';
import RealtimeActivityChart from '../common/RealtimeActivityChart';

export default function StudentDashboard({ onNavigate }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('learnspace_token');
        const res = await fetch('/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const courses = dashboardData?.courses || [
    {
      id: 1,
      title: 'UI/UX Design Systems & Visual Hierarchy',
      course_code: 'UXD-201',
      cover_image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600',
      progress_pct: 67,
      completed_lessons: 2,
      total_lessons: 3
    },
    {
      id: 2,
      title: 'Fullstack Architecture with React & Express',
      course_code: 'DEV-301',
      cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
      progress_pct: 33,
      completed_lessons: 1,
      total_lessons: 3
    }
  ];

  return (
    <div className="space-y-6">

      {/* 1. HERO CARD: NEXT MILESTONE & COUNTDOWN */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-slate-800 text-base">Next Activity Due Soon</h2>
                <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  Priority
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Design System Token Specification — UI/UX Design Systems (UXD-201)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 lg:border-l lg:border-slate-100 lg:pl-6">
            <CountdownTimer initialSeconds={8703} label="remaining to submit" />
            <button 
              onClick={() => onNavigate && onNavigate('assignments')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Submit Work
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS ARC + CONTINUE LEARNING ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Arc Gauge */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-semibold text-slate-800 text-sm">Overall Completion</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              On Track
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-auto py-3">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="9" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="40" stroke="#2563EB" strokeWidth="9" fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.82)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-heading text-2xl font-bold text-slate-800">82%</span>
                <span className="text-[10px] text-slate-400 font-medium">LMS Progress</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            3 of 4 required modules completed this term
          </p>
        </div>

        {/* Continue Learning Resume Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Resume Course
              </span>
              <span className="text-xs text-blue-200">25 mins remaining</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-white mt-3">
              Design Tokens & Color Harmony
            </h3>
            <p className="text-blue-100 text-xs mt-1 max-w-md">
              Learn how to define semantic tokens, check WCAG 4.5:1 contrast ratios, and configure elevation depths.
            </p>
          </div>

          <div className="relative z-10 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <Clock className="w-4 h-4" />
              <span>Module 1 • Lesson 1</span>
            </div>

            <button 
              onClick={() => onNavigate && onNavigate('lessons')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Lesson</span>
            </button>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
        </div>

      </div>

      {/* STUDY ACTIVITY CHART — Real-time & database-driven */}
      <RealtimeActivityChart 
        title="Study Activity"
        subtitle="Weekly lesson completions and study time"
        metricLabel="Minutes"
        unit="m"
        growthPercentage="+14.2%"
        accentColor="#2563EB"
        dataSets={dashboardData?.activityChart || {
          'Week': [
            { label: 'Mon', value: 45 },
            { label: 'Tue', value: 90 },
            { label: 'Wed', value: 65 },
            { label: 'Thu', value: 110 },
            { label: 'Fri', value: 140 },
            { label: 'Sat', value: 75 },
            { label: 'Sun', value: 160 }
          ],
          'Month': [
            { label: 'Week 1', value: 380 },
            { label: 'Week 2', value: 490 },
            { label: 'Week 3', value: 610 },
            { label: 'Week 4', value: 750 }
          ],
          'Year': [
            { label: 'Jan', value: 1200 },
            { label: 'Feb', value: 1450 },
            { label: 'Mar', value: 1800 },
            { label: 'Apr', value: 1600 },
            { label: 'May', value: 2100 },
            { label: 'Jun', value: 2400 },
            { label: 'Jul', value: 2200 },
            { label: 'Aug', value: 2600 },
            { label: 'Sep', value: 2900 },
            { label: 'Oct', value: 3200 },
            { label: 'Nov', value: 3500 },
            { label: 'Dec', value: 3800 }
          ]
        }}
      />

      {/* 3. MY COURSES & CALENDAR ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Enrolled Courses List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-slate-800 text-sm">My Enrolled Courses</h3>
            <button 
              onClick={() => onNavigate && onNavigate('courses')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map(course => (
              <div 
                key={course.id}
                onClick={() => onNavigate && onNavigate('courses')}
                className="group p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all bg-slate-50/50 hover:bg-white hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-28 rounded-lg overflow-hidden mb-3 relative">
                    <img 
                      src={course.cover_image} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded-md">
                      {course.course_code}
                    </span>
                  </div>

                  <h4 className="font-heading font-semibold text-slate-800 text-xs line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                    <span>Progress</span>
                    <span className="font-semibold text-blue-600">{course.progress_pct || 67}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress_pct || 67}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Calendar Widget */}
        <div className="lg:col-span-1">
          <MiniCalendar 
            onFullCalendar={() => onNavigate && onNavigate('calendar')}
          />
        </div>

      </div>

    </div>
  );
}
