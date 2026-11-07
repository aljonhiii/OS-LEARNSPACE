import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export default function StudentCalendar() {
  const [currentMonth, setCurrentMonth] = useState('November 2026');

  const scheduleEvents = [
    {
      id: 1,
      title: 'Milestone 2: Design Tokens & Specification Submission',
      type: 'assignment',
      time: '11:59 PM',
      date: 'Nov 12, 2026',
      course: 'Design Systems Architecture',
      color: 'border-amber-400 bg-amber-50/60'
    },
    {
      id: 2,
      title: 'Live Lab: Component Library Setup with Cameron Williamson',
      type: 'class',
      time: '02:00 PM - 03:30 PM',
      date: 'Nov 14, 2026',
      course: 'Design Systems Architecture',
      color: 'border-blue-500 bg-blue-50/60'
    },
    {
      id: 3,
      title: 'Knowledge Check: CSS Custom Properties & Semantic Tokens',
      type: 'quiz',
      time: '05:00 PM',
      date: 'Nov 16, 2026',
      course: 'Advanced UI Design',
      color: 'border-indigo-500 bg-indigo-50/60'
    },
    {
      id: 4,
      title: 'Peer Code Review: Token Pipeline Export Scripts',
      type: 'class',
      time: '10:00 AM - 11:00 AM',
      date: 'Nov 18, 2026',
      course: 'Design Systems Architecture',
      color: 'border-emerald-500 bg-emerald-50/60'
    }
  ];

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Academic Schedule
          </span>
          <h1 className="font-heading font-bold text-xl text-slate-900 mt-2">
            Schedule & Deadlines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronize live office hours, scheduled classes, and assignment deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <button className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-3">{currentMonth}</span>
          <button className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            <div className="h-20 bg-slate-50/50 rounded-xl p-2 text-slate-300 text-xs">28</div>
            <div className="h-20 bg-slate-50/50 rounded-xl p-2 text-slate-300 text-xs">29</div>
            <div className="h-20 bg-slate-50/50 rounded-xl p-2 text-slate-300 text-xs">30</div>
            <div className="h-20 bg-slate-50/50 rounded-xl p-2 text-slate-300 text-xs">31</div>

            {/* November Days */}
            {daysInMonth.map((day) => {
              const hasAssignment = day === 12;
              const hasClass = day === 14 || day === 18;
              const hasQuiz = day === 16;
              const isToday = day === 7;

              return (
                <div 
                  key={day} 
                  className={`h-20 rounded-xl p-2 border flex flex-col justify-between transition-all cursor-pointer ${
                    isToday 
                      ? 'border-blue-600 bg-blue-50/40 font-bold' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>
                    {day}
                  </span>

                  <div className="space-y-1">
                    {hasAssignment && (
                      <span className="block text-[9px] font-semibold bg-amber-100 text-amber-800 rounded px-1 truncate">
                        Milestone Due
                      </span>
                    )}
                    {hasClass && (
                      <span className="block text-[9px] font-semibold bg-blue-100 text-blue-800 rounded px-1 truncate">
                        Live Class
                      </span>
                    )}
                    {hasQuiz && (
                      <span className="block text-[9px] font-semibold bg-indigo-100 text-indigo-800 rounded px-1 truncate">
                        Quiz Window
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Agenda (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-heading font-bold text-sm text-slate-900">Upcoming Agenda</h3>
            <span className="text-[10px] text-blue-600 font-semibold">{scheduleEvents.length} Events</span>
          </div>

          <div className="space-y-3">
            {scheduleEvents.map((evt) => (
              <div 
                key={evt.id} 
                className={`p-4 rounded-xl border-l-4 border shadow-xs space-y-1.5 transition-shadow hover:shadow-sm ${evt.color}`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{evt.date}</span>
                  <span className="font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {evt.time}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-xs text-slate-900 leading-snug">
                  {evt.title}
                </h4>
                <span className="text-[10px] text-slate-600 font-medium block">
                  {evt.course}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}